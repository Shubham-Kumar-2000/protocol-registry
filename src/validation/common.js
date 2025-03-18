const Joi = require('joi');

exports.protocolSchema = Joi.string()
    .regex(/^[a-zA-Z]+$/)
    .required();

exports.registerSchema = Joi.object({
    protocol: this.protocolSchema,
    command: Joi.string().required(),
    override: Joi.boolean().default(false),
    terminal: Joi.boolean().default(false),
    appName: Joi.string()
        .min(3)
        .regex(/^[a-zA-Z0-9- ]+$/)
});

exports.deRegisterSchema = Joi.object({
    protocol: this.protocolSchema,
    force: Joi.boolean()
});
