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
export class AdapterError extends Error {}
export class ConnectionError extends Error {}
export class SchemaError extends Error {}
export class ManagerError extends Error {}
export class RepositoryError extends Error {}
export class NotImplemented extends Error {
    constructor(featurename: string) {
        super('Feature not implemented: ' + featurename);
    }
}
