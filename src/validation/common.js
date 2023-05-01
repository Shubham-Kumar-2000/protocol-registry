const Joi = require('joi');

exports.registerSchema = Joi.object({
    protocol: Joi.string()
        .regex(/^[a-zA-Z]+$/)
        .required(),
    command: Joi.string().required(),
    override: Joi.boolean(),
    terminal: Joi.boolean(),
    script: Joi.boolean(),
    scriptName: Joi.string()
        .min(3)
        .regex(/^[a-zA-Z0-9-]+$/)
});
