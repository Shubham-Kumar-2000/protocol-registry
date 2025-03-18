const {
    registerSchema,
    deRegisterSchema,
    checkIfExistsSchema
} = require('../validation/common');

const validator = (schema, data) => {
    const { error, value } = schema.validate(data);
    if (error) throw error;
    return value;
};

const registryValidator = (protocol, command, options) => {
    if (!options) {
        options = {};
    }
    options.protocol = protocol;
    options.command = command;

    return validator(registerSchema, options);
};

const deRegistryValidator = (protocol, options) => {
    if (!options) {
        options = {};
    }
    options.protocol = protocol;

    return validator(deRegisterSchema, options);
};

const checkIfExistsValidator = (protocol) => {
    return validator(checkIfExistsSchema, protocol);
};

module.exports = {
    registryValidator,
    deRegistryValidator,
    checkIfExistsValidator
};
