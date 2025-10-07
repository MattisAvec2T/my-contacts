import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.config.js";
import { CustomError } from "../errors/custom.error.js";

export default function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || req.headers.authorization?.split(" ")[0] !== "Bearer") {
        throw new CustomError({ code: 401, message: "Unauthorized access" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userEmail = decoded.email;
        next();
    } catch (err) {
        throw new CustomError({ code: 498, message: "Invalid token" });
    }
}