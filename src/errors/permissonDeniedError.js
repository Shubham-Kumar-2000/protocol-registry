class PermissonDeniedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PermissonDeniedError';
    }
}

module.exports = PermissonDeniedError;
