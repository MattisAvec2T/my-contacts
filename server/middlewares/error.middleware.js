import { CustomError } from "../errors/custom.error.js";

export default async function errorMiddleware(err, _, res, next) {
    const errorStatus = (err instanceof CustomError) ? err.code : 500;
    const errorMessage = err.message;

    const responseJson = {
        success: false,
        error: errorMessage
    }
    if (err.errors) responseJson.details = err.errors;

    res.status(errorStatus).json(responseJson);

    next();
}