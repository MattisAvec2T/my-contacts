export class CustomError extends Error {
    constructor(errorParams) {
        const { code, message = "An error occurred", errors = null } = errorParams;
        super(message);
        this.code = code || 500;
        if (errors) this.errors = errors;
    }
}