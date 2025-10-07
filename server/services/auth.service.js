import bcrypt from "bcrypt";
import {CustomError} from "../errors/custom.error.js";

export async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (err) {
        throw err;
    }
}

export async function comparePassword(password, hashedPassword) {
    try {
        if (!await bcrypt.compare(password, hashedPassword)) throw new CustomError({ code: 400, message: "Invalid password" });
    } catch (err) {
        throw err;
    }
}