const Joi = require('joi');

exports.registerSchema = Joi.object({
    protocol: Joi.string()
        .regex(/^[a-zA-Z]+$/)
        .required(),
    command: Joi.string().required(),
    override: Joi.boolean(),
    terminal: Joi.boolean(),
    script: Joi.boolean(),
    allUsers: Joi.boolean(),
});
