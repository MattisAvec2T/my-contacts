import Router from 'express';
import { registerController, loginController } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../schemas/user.schema.js";
import { validateDto } from "../middlewares/validator.middleware.js";

export default function authRoutes() {
    const authRouter = Router();

    authRouter.post("/register", validateDto(registerSchema), registerController);
    authRouter.post("/login", validateDto(loginSchema), loginController);

    return authRouter;
}