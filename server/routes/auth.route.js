import Router from 'express';
import { registerController, loginController } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../schemas/user.schema.js";
import { validateDto } from "../middlewares/validator.middleware.js";

export default function authRoutes() {
    const authRouter = Router();

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     description: Create a new user account with email and password. Password will be hashed before storage.
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *               - confirmPassword
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: user@example.com
     *                 description: User's email address (must be unique)
     *               password:
     *                 type: string
     *                 format: password
     *                 minLength: 8
     *                 example: Password123!
     *                 description: User's password (minimum 8 characters)
     *               confirmPassword:
     *                 type: string
     *                 format: password
     *                 minLength: 8
     *                 example: Password123!
     *                 description: Password confirmation (must match password)
     *     responses:
     *       201:
     *         description: User successfully registered
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: User successfully created
     *                 data:
     *                   $ref: '#/components/schemas/User'
     *             example:
     *               success: true
     *               message: User successfully created
     *               data:
     *                 email: user@example.com
     *       400:
     *         description: Validation error or email already exists
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             examples:
     *               validationError:
     *                 value:
     *                   success: false
     *                   error: Validation error
     *                   details:
     *                     - msg: Email is required
     *                       path: email
     *                       location: body
     *                     - msg: Passwords do not match
     *                       path: confirmPassword
     *                       location: body
     *               emailExists:
     *                 value:
     *                   success: false
     *                   error: Email already exists
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               success: false
     *               error: An error occurred
     */
    authRouter.post("/register", validateDto(registerSchema), registerController);

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Login with existing credentials
     *     description: Authenticate user and receive a JWT token for accessing protected endpoints
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: user@example.com
     *                 description: User's registered email address
     *               password:
     *                 type: string
     *                 format: password
     *                 example: Password123!
     *                 description: User's password
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: User successfully logged in
     *                 token:
     *                   type: string
     *                   description: JWT token for authentication
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2MjM0NTY3ODksImV4cCI6MTYyMzQ2MDM4OX0.abc123def456
     *             example:
     *               success: true
     *               message: User successfully logged in
     *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *       400:
     *         description: Validation error or invalid password
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             examples:
     *               validationError:
     *                 value:
     *                   success: false
     *                   error: Validation error
     *                   details:
     *                     - msg: Email is required
     *                       path: email
     *                       location: body
     *               invalidPassword:
     *                 value:
     *                   success: false
     *                   error: Invalid password
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               success: false
     *               error: User not found
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    authRouter.post("/login", validateDto(loginSchema), loginController);

    return authRouter;
}