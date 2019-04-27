export class ErrorUtils {
    static getMessage(error, defaultMessage = '') {
        let message = defaultMessage;
        if (typeof error === 'string') {
            message = error;
        } else if (error.message) {
            message = error.message;
        }
        return message;
    }
}
export class AdapterError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, AdapterError.prototype);
    }
}
export class ConnectionError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ConnectionError.prototype);
    }
}
export class SchemaError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, SchemaError.prototype);
    }
}
export class ManagerError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ManagerError.prototype);
    }
}
export class RepositoryError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, RepositoryError.prototype);
    }
}
export class NotImplemented extends Error {
    constructor(featurename: string) {
        super('Feature not implemented: ' + featurename);
        Object.setPrototypeOf(this, NotImplemented.prototype);
    }
}
