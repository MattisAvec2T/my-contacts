import { createUser, getUserByEmail } from "../repositories/user.repository.js";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.config.js";
import { comparePassword, hashPassword } from "../services/auth.service.js";

export async function registerController(req, res, next) {
    try {
        const user = {
            "email": req.body.email,
            "password": await hashPassword(req.body.password)
        }
        await createUser(user);

        delete user.password;
        res.status(201).json({ success: true, message: "User successfully created", data: user });
    } catch (err) {
        next(err);
    }
}

export async function loginController(req, res, next) {
    try {
        const user = req.body;

        const dbUser = await getUserByEmail(user.email);
        await comparePassword(user.password, dbUser.password);

        const token = jwt.sign(
            { email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        delete user.password;
        res.status(200).cookie("token", token).json({ success: true, message: "User successfully logged in", data: user });
    } catch (err) {
        next(err);
    }

}