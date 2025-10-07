import { describe, it, expect, vi, beforeEach } from 'vitest';
import errorMiddleware from '../../../middlewares/error.middleware.js';
import { CustomError } from '../../../errors/custom.error.js';

describe('Error Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        next = vi.fn();
        vi.clearAllMocks();
    });

    describe('errorMiddleware', () => {
        it('should handle CustomError with code and message', async () => {
            const error = new CustomError({
                code: 404,
                message: 'Resource not found'
            });

            await errorMiddleware(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Resource not found'
            });
            expect(next).toHaveBeenCalledWith();
        });

        it('should handle CustomError with errors details', async () => {
            const validationErrors = [
                { field: 'email', msg: 'Invalid email' },
                { field: 'password', msg: 'Password too short' }
            ];

            const error = new CustomError({
                code: 400,
                message: 'Validation error',
                errors: validationErrors
            });

            await errorMiddleware(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Validation error',
                details: validationErrors
            });
            expect(next).toHaveBeenCalledWith();
        });

        it('should default to status 500 for generic errors', async () => {
            const error = new Error('Something went wrong');

            await errorMiddleware(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Something went wrong'
            });
        });

        it('should handle error without message', async () => {
            const error = new Error();

            await errorMiddleware(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: ''
            });
        });

        it('should handle 401 Unauthorized errors', async () => {
            const error = new CustomError({
                code: 401,
                message: 'Unauthorized access'
            });

            await errorMiddleware(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Unauthorized access'
            });
        });

        it('should handle 498 Invalid Token errors', async () => {
            const error = new CustomError({
                code: 498,
                message: 'Invalid token'
            });

            await errorMiddleware(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(498);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Invalid token'
            });
        });

        it('should not include details property when errors is null', async () => {
            const error = new CustomError({
                code: 400,
                message: 'Bad request'
            });

            await errorMiddleware(error, req, res, next);

            const jsonCall = res.json.mock.calls[0][0];
            expect(jsonCall).not.toHaveProperty('details');
            expect(jsonCall).toEqual({
                success: false,
                error: 'Bad request'
            });
        });

        it('should handle multiple errors in details array', async () => {
            const multipleErrors = [
                { field: 'firstName', msg: 'First name required' },
                { field: 'lastName', msg: 'Last name required' },
                { field: 'phone', msg: 'Phone number invalid' }
            ];

            const error = new CustomError({
                code: 400,
                message: 'Multiple validation errors',
                errors: multipleErrors
            });

            await errorMiddleware(error, req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Multiple validation errors',
                details: multipleErrors
            });
        });

        it('should call next after handling error', async () => {
            const error = new Error('Test error');

            await errorMiddleware(error, req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
    });
});