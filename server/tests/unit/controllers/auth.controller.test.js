import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { registerController, loginController } from '../../../controllers/auth.controller.js';
import { createUser, getUserByEmail } from '../../../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../../../services/auth.service.js';
import { createMockRequest, createMockResponse, createMockNext } from '../../helpers/test-utils.js';

// Changez cette partie :
vi.mock('../../../repositories/user.repository.js', () => ({
    createUser: vi.fn(),
    getUserByEmail: vi.fn()
}));

vi.mock('../../../services/auth.service.js', () => ({
    hashPassword: vi.fn(),
    comparePassword: vi.fn()
}));

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(),
        verify: vi.fn()
    }
}));

vi.mock('../../../config/env.config.js', () => ({
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: 3600,
    MONGO_URI: 'mongodb://localhost:27017/test',
    PORT: 3000
}));

describe('Auth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = createMockRequest();
        res = createMockResponse();
        next = createMockNext();
        vi.clearAllMocks();
    });

    describe('registerController', () => {
        it('should register a user successfully', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            const hashedPassword = 'hashedPassword123';
            hashPassword.mockResolvedValue(hashedPassword);
            createUser.mockResolvedValue();

            await registerController(req, res, next);

            expect(hashPassword).toHaveBeenCalledWith('password123');
            expect(createUser).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User successfully created',
                data: { email: 'test@example.com' }
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should not return password in response', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            hashPassword.mockResolvedValue('hashedPassword');
            createUser.mockResolvedValue();

            await registerController(req, res, next);

            const responseData = res.json.mock.calls[0][0].data;
            expect(responseData).not.toHaveProperty('password');
            expect(responseData).toEqual({ email: 'test@example.com' });
        });

        it('should call next with error when hashing fails', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            const error = new Error('Hashing failed');
            hashPassword.mockRejectedValue(error);

            await registerController(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should call next with error when user creation fails', async () => {
            req.body = {
                email: 'existing@example.com',
                password: 'password123'
            };

            hashPassword.mockResolvedValue('hashedPassword');
            const error = new Error('Email already exists');
            createUser.mockRejectedValue(error);

            await registerController(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should handle special characters in email', async () => {
            req.body = {
                email: 'test+tag@example.com',
                password: 'password123'
            };

            hashPassword.mockResolvedValue('hashedPassword');
            createUser.mockResolvedValue();

            await registerController(req, res, next);

            expect(createUser).toHaveBeenCalledWith({
                email: 'test+tag@example.com',
            });
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('loginController', () => {
        it('should login user successfully with valid credentials', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            const dbUser = {
                email: 'test@example.com',
                password: 'hashedPassword123'
            };

            const token = 'jwt.token.here';

            getUserByEmail.mockResolvedValue(dbUser);
            comparePassword.mockResolvedValue(true);
            jwt.sign.mockReturnValue(token);

            await loginController(req, res, next);

            expect(getUserByEmail).toHaveBeenCalledWith('test@example.com');
            expect(comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword123');
            expect(jwt.sign).toHaveBeenCalledWith(
                { email: 'test@example.com' },
                'test-secret',
                { expiresIn: 3600 }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User successfully logged in',
                token: token
            });
        });

        it('should call next with error when user not found', async () => {
            req.body = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            const error = new Error('User not found');
            getUserByEmail.mockRejectedValue(error);

            await loginController(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(comparePassword).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();
        });

        it('should call next with error when password is incorrect', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            const dbUser = {
                email: 'test@example.com',
                password: 'hashedPassword123'
            };

            getUserByEmail.mockResolvedValue(dbUser);
            const error = new Error('Invalid password');
            comparePassword.mockRejectedValue(error);

            await loginController(req, res, next);

            expect(getUserByEmail).toHaveBeenCalled();
            expect(comparePassword).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
            expect(jwt.sign).not.toHaveBeenCalled();
        });

        it('should generate JWT token with correct payload', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            const dbUser = {
                email: 'test@example.com',
                password: 'hashedPassword123'
            };

            getUserByEmail.mockResolvedValue(dbUser);
            comparePassword.mockResolvedValue(true);
            jwt.sign.mockReturnValue('token');

            await loginController(req, res, next);

            expect(jwt.sign).toHaveBeenCalledWith(
                { email: 'test@example.com' },
                expect.any(String),
                expect.any(Object)
            );
        });

        it('should call next with error when JWT signing fails', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            const dbUser = {
                email: 'test@example.com',
                password: 'hashedPassword123'
            };

            getUserByEmail.mockResolvedValue(dbUser);
            comparePassword.mockResolvedValue(true);
            const error = new Error('JWT signing failed');
            jwt.sign.mockImplementation(() => {
                throw error;
            });

            await loginController(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});