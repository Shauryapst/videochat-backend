const jwt = require("jsonwebtoken");
const config = require("../config");
const logger = require("../logger/logger");
const verifyToken = (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(403).send(" Missing - Access Token");
  }

  try {
    token = token.replace(/^Bearer\s+/, "");
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Token Invalid");
  }

  return next();
};

const socketTokenValidation = (socket, next) => {
  const accessToken = socket.handshake.auth?.token;
  try {
    const decoded = jwt.verify(accessToken, config.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    const socketError = new Error("NOT_AUTHORIZED");
    return next(socketError);
  }
};

module.exports = { verifyToken, socketTokenValidation };
