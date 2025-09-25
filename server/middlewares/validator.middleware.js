import {checkSchema, validationResult} from "express-validator";
import { CustomError } from "../errors/custom.error.js";
import { ObjectId } from "mongodb";

export function validateDto(schema) {
    return async (req, _, next) => {
        try {
            await checkSchema(schema).run(req);

            const err = validationResult(req);
            if (!err.isEmpty()) {
                throw new CustomError({ code: 400, message: "Validation error", errors: err.array() });
            }

            const allowedFields = Object.keys(schema);
            const parsedBody = {};
            allowedFields.forEach(field => {
                if(req.body[field]) parsedBody[field] = req.body[field];
            });
            req.body = parsedBody;
            next();
        } catch (error) {
            next(error);
        }
    };
}

export async function validateId(req, _, next) {
    if (!req.params.id || !ObjectId.isValid(req.params.id)) throw new CustomError({ code: 400, message: "Invalid id" });
    req.params.id = new ObjectId(req.params.id);
    next();
}