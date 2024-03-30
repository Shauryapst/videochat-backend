const path = "/invitation";

const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({});
const validatorSchema = require('../middleware/validatorSchema');
const { verifyToken } = require('../middleware/auth.handler');
const { createInvitation, updateInvitation, listInvitation } = require('../controllers/invitation.controller');



module.exports = (basePath, router) => {
    router.post(basePath + path + '',  verifyToken, createInvitation);
    router.put(basePath + path + '/:invitationId', verifyToken, updateInvitation);
    router.get(basePath + path + '', verifyToken, listInvitation);
}