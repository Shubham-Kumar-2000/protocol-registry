const Joi = require('joi');

exports.registerSchema = Joi.object({
    protocol: Joi.string()
        .regex(/^[a-zA-Z]+$/)
        .required(),
    command: Joi.string().required(),
    override: Joi.boolean().default(false),
    terminal: Joi.boolean().default(false),
    scriptName: Joi.string()
        .min(3)
        .regex(/^[a-zA-Z0-9-]+$/)
});

exports.deRegisterSchema = Joi.object({
    force: Joi.boolean()
});
