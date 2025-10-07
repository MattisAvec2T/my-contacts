import bcrypt from "bcrypt";
import {CustomError} from "../errors/custom.error.js";

export async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (err) {
        throw err;
    }
}

export async function comparePassword(password, hashedPassword) {
    if (!await bcrypt.compare(password, hashedPassword)) throw new CustomError({ code: 400, message: "Invalid password" });
}