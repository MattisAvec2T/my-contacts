import database from "../config/database.config.js";
import { CustomError } from "../errors/custom.error.js";

const collection = database.collection("users");

export async function getUserByEmail(email) {
    try {
        const user = await collection.findOne({ "email": email });
        if (!user) throw new CustomError({ code: 404, message: "User not found" });
        return user;
    } catch (err) {
        throw err;
    }
}

export async function createUser(user) {
    try {
        await collection.insertOne(user);
    } catch (err) {
        if (err.code === 11000) throw new CustomError({ code: 400, message: "Email already exists" });
        throw err;
    }
}