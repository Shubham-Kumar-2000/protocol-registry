const Joi = require('joi');

const protocolSchema = Joi.string()
    .regex(/^[a-zA-Z]+$/)
    .required();

exports.checkIfExistsSchema = protocolSchema;

exports.registerSchema = Joi.object({
    protocol: protocolSchema,
    command: Joi.string().required(),
    override: Joi.boolean().default(false),
    terminal: Joi.boolean().default(false),
    scriptName: Joi.string()
        .min(3)
        .regex(/^[a-zA-Z0-9-]+$/)
});

exports.deRegisterSchema = Joi.object({
    protocol: protocolSchema,
    force: Joi.boolean()
});
