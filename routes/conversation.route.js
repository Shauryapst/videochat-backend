const path = "/conversation";

const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({});
const validatorSchema = require('../middleware/validatorSchema');
const { verifyToken } = require('../middleware/auth.handler');
const { getAllConversation, getConversationById } = require('../controllers/conversation.controller');
module.exports = (basePath, router) => {
    router.get(basePath + path, verifyToken, getAllConversation);
    router.get(basePath + path + '/:conversationId', verifyToken, getConversationById);
}