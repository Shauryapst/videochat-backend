const os = require("os");
const winston = require('winston');
const path = require('path');

class Logger {
    constructor() {
        this.hostname = os.hostname();

        this.logger = winston.createLogger({
            level: 'debug',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({filename: 'error.log', level: 'error'}),
                new winston.transports.File({filename: 'combined.log'}),
            ],
        });
        if (process.env.NODE_ENV !== 'production' || process.env.NODE_ENV !== 'staging') {
            this.logger.add(
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.metadata({fillExcept: ['timestamp', 'service', 'level', 'message', 'file', 'line']}),
                        winston.format.colorize(),
                        this.winstonConsoleFormat()
                    )
                })
            );
        }
    }

    winstonConsoleFormat() {
        return winston.format.printf(({timestamp, service, level, message, file, line}) => {
            const filePath = file && line ? `${file.padEnd(30, " ")}: ${line}` : '';
            return `[${timestamp}] [${level}]    [${filePath}]       ${this.formatMetadata(message) || message}`;
        })
    }

    formatMetadata(metadata) {
        let metadataStr = '';
        if (metadata instanceof Map) {
            metadataStr = JSON.stringify(Object.fromEntries(metadata));
        } else if (metadata instanceof Object) {
            metadataStr = JSON.stringify(metadata);
        }
        return metadataStr;
    }

    debug(log, metadata) {
        this.logger.debug(log, this.addFileAndLine(metadata));
    }

    info(log, metadata) {
        this.logger.info(log, this.addFileAndLine(metadata));
    }

    warn(log, metadata) {
        this.logger.warn(log, this.addFileAndLine(metadata));
    }

    error(log, metadata) {
        this.logger.error(log, this.addFileAndLine(metadata));
    }

    log(level, log, metadata) {
        this.logger[level](log, this.addFileAndLine(metadata));
    }

    addFileAndLine(metadata) {
        // Get caller file name and line number
        const originalPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const stack = new Error().stack.slice(1); // Skip first item which is this function
        Error.prepareStackTrace = originalPrepareStackTrace;
        const caller = stack.find(callSite => callSite.getFileName() !== __filename);
        const file = caller.getFileName();
        const line = caller.getLineNumber();

        const relativePath = path.relative(process.cwd(), file);

        return {...metadata, file:relativePath, line};
    }
}

module.exports = new Logger('winston');

module.getLogger = () => {
    return new Logger();
}
