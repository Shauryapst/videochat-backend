const Joi = require("joi");

const validatorSchema = (routeToValidate) => {
  return {
    auth: {
      login: Joi.object({
        password: Joi.string().min(6).max(12),
        email: Joi.string().email(),
      }),
      register: Joi.object({
        username: Joi.string().min(3).max(12),
        password: Joi.string().min(6).max(12),
        email: Joi.string().email(),
      }),
    },
  };
};

module.exports = validatorSchema;
