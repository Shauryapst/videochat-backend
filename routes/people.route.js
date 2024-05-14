const path = "/people";

const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({});
const validatorSchema = require('../middleware/validatorSchema');
const { verifyToken } = require('../middleware/auth.handler');



module.exports = (basePath, router) => {
    router.get(basePath + path + '', verifyToken);
}