const path = "/auth";
const authController = require('../controllers/auth.controller');


const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({});
const validatorSchema = require('../middleware/validatorSchema');
const { verifyToken } = require('../middleware/auth.handler');
const registerSchema = Joi.object({
    username: Joi.string().min(3).max(12),
    password: Joi.string().min(6).max(12),
    email: Joi.string().email()
})

const loginSchema = Joi.object({
    password: Joi.string().min(6).max(12),
    email: Joi.string().email()
})


module.exports = (basePath, router) => {
    router.post(basePath + path + '/login', validator.body(validatorSchema().auth.login), authController.login);
    router.post(basePath + path + '/register', validator.body(validatorSchema().auth.register), authController.register);
    router.post(basePath + path + '/test', verifyToken, (req, res)=>{
        return res.json(req.user);
    })
}