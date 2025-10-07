import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import verifyToken from '../../../middlewares/auth.middleware.js';
import { CustomError } from '../../../errors/custom.error.js';
import { createMockRequest, createMockResponse, createMockNext } from '../../helpers/test-utils.js';

vi.mock('jsonwebtoken');
vi.mock('../../../config/env.config.js', () => ({
    JWT_SECRET: 'test-secret'
}));

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = createMockRequest();
        res = createMockResponse();
        next = createMockNext();
        vi.clearAllMocks();
    });

    describe('verifyToken', () => {
        it('should set userEmail in req when token is valid', () => {
            const token = 'valid.token.here';
            const decodedToken = { email: 'test@example.com' };

            req.headers.authorization = `Bearer ${token}`;
            jwt.verify.mockReturnValue(decodedToken);

            verifyToken(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
            expect(req.userEmail).toBe('test@example.com');
            expect(next).toHaveBeenCalledWith();
        });

        it('should throw CustomError 401 when authorization header is missing', () => {
            expect(() => verifyToken(req, res, next)).toThrow(CustomError);

            try {
                verifyToken(req, res, next);
            } catch (err) {
                expect(err.code).toBe(401);
                expect(err.message).toBe('Unauthorized access');
            }
        });

        it('should throw CustomError 401 when token is missing in authorization header', () => {
            req.headers.authorization = 'Bearer ';

            expect(() => verifyToken(req, res, next)).toThrow(CustomError);

            try {
                verifyToken(req, res, next);
            } catch (err) {
                expect(err.code).toBe(401);
                expect(err.message).toBe('Unauthorized access');
            }
        });

        it('should throw CustomError 401 when authorization header has wrong format', () => {
            req.headers.authorization = 'InvalidFormat token';

            expect(() => verifyToken(req, res, next)).toThrow(CustomError);
        });

        it('should throw CustomError 498 when token is invalid', () => {
            const token = 'invalid.token.here';
            req.headers.authorization = `Bearer ${token}`;

            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            expect(() => verifyToken(req, res, next)).toThrow(CustomError);

            try {
                verifyToken(req, res, next);
            } catch (err) {
                expect(err.code).toBe(498);
                expect(err.message).toBe('Invalid token');
            }
        });

        it('should throw CustomError 498 when token is expired', () => {
            const token = 'expired.token.here';
            req.headers.authorization = `Bearer ${token}`;

            jwt.verify.mockImplementation(() => {
                const error = new Error('jwt expired');
                error.name = 'TokenExpiredError';
                throw error;
            });

            expect(() => verifyToken(req, res, next)).toThrow(CustomError);

            try {
                verifyToken(req, res, next);
            } catch (err) {
                expect(err.code).toBe(498);
            }
        });

        it('should throw CustomError 498 when token is malformed', () => {
            const token = 'malformed-token';
            req.headers.authorization = `Bearer ${token}`;

            jwt.verify.mockImplementation(() => {
                const error = new Error('jwt malformed');
                error.name = 'JsonWebTokenError';
                throw error;
            });

            expect(() => verifyToken(req, res, next)).toThrow(CustomError);
        });
    });
});