import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectId } from 'mongodb';
import { checkSchema, validationResult } from 'express-validator';
import { validateDto, validateId } from '../../../middlewares/validator.middleware.js';
import { CustomError } from '../../../errors/custom.error.js';

vi.mock('express-validator');

describe('Validator Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {}
        };
        res = {};
        next = vi.fn();
        vi.clearAllMocks();
    });

    describe('validateDto', () => {
        it('should validate and parse body successfully when data is valid', async () => {
            const schema = {
                email: { isEmail: true },
                password: { isLength: { options: { min: 8 } } }
            };

            req.body = {
                email: 'test@example.com',
                password: 'password123',
                extraField: 'should be removed'
            };

            const mockRun = vi.fn().mockResolvedValue();
            checkSchema.mockReturnValue({ run: mockRun });
            validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });

            const middleware = validateDto(schema);
            await middleware(req, res, next);

            expect(checkSchema).toHaveBeenCalledWith(schema);
            expect(mockRun).toHaveBeenCalledWith(req);
            expect(req.body).toEqual({
                email: 'test@example.com',
                password: 'password123'
            });
            expect(req.body.extraField).toBeUndefined();
            expect(next).toHaveBeenCalledWith();
        });

        it('should throw CustomError 400 when validation fails', async () => {
            const schema = {
                email: { isEmail: true }
            };

            req.body = {
                email: 'invalid-email'
            };

            const mockRun = vi.fn().mockResolvedValue();
            checkSchema.mockReturnValue({ run: mockRun });

            const validationErrors = [
                { field: 'email', msg: 'Invalid email' }
            ];
            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => validationErrors
            });

            const middleware = validateDto(schema);
            await middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error).toBeInstanceOf(CustomError);
            expect(error.code).toBe(400);
            expect(error.message).toBe('Validation error');
            expect(error.errors).toEqual(validationErrors);
        });

        it('should remove fields not in schema', async () => {
            const schema = {
                firstName: { notEmpty: true },
                lastName: { notEmpty: true }
            };

            req.body = {
                firstName: 'John',
                lastName: 'Doe',
                hackerField: 'malicious',
                anotherField: 'extra'
            };

            const mockRun = vi.fn().mockResolvedValue();
            checkSchema.mockReturnValue({ run: mockRun });
            validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });

            const middleware = validateDto(schema);
            await middleware(req, res, next);

            expect(req.body).toEqual({
                firstName: 'John',
                lastName: 'Doe'
            });
            expect(Object.keys(req.body)).toHaveLength(2);
        });

        it('should call next with error when checkSchema throws', async () => {
            const schema = { email: { isEmail: true } };
            const error = new Error('Schema validation failed');

            const mockRun = vi.fn().mockRejectedValue(error);
            checkSchema.mockReturnValue({ run: mockRun });

            const middleware = validateDto(schema);
            await middleware(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        it('should handle empty body correctly', async () => {
            const schema = {
                optionalField: { optional: true }
            };

            req.body = {};

            const mockRun = vi.fn().mockResolvedValue();
            checkSchema.mockReturnValue({ run: mockRun });
            validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });

            const middleware = validateDto(schema);
            await middleware(req, res, next);

            expect(req.body).toEqual({});
            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('validateId', () => {
        it('should convert valid string id to ObjectId', async () => {
            const validId = '507f1f77bcf86cd799439011';
            req.params.id = validId;

            await validateId(req, res, next);

            expect(req.params.id).toBeInstanceOf(ObjectId);
            expect(req.params.id.toString()).toBe(validId);
            expect(next).toHaveBeenCalledWith();
        });

        it('should throw CustomError 400 when id is missing', async () => {
            req.params.id = undefined;

            await expect(validateId(req, res, next)).rejects.toThrow(CustomError);

            try {
                await validateId(req, res, next);
            } catch (err) {
                expect(err.code).toBe(400);
                expect(err.message).toBe('Invalid id');
            }
        });

        it('should throw CustomError 400 when id is empty string', async () => {
            req.params.id = '';

            await expect(validateId(req, res, next)).rejects.toThrow(CustomError);

            try {
                await validateId(req, res, next);
            } catch (err) {
                expect(err.code).toBe(400);
                expect(err.message).toBe('Invalid id');
            }
        });

        it('should throw CustomError 400 when id format is invalid', async () => {
            req.params.id = 'invalid-id-format';

            await expect(validateId(req, res, next)).rejects.toThrow(CustomError);

            try {
                await validateId(req, res, next);
            } catch (err) {
                expect(err.code).toBe(400);
                expect(err.message).toBe('Invalid id');
            }
        });

        it('should throw CustomError 400 when id is too short', async () => {
            req.params.id = '123';

            await expect(validateId(req, res, next)).rejects.toThrow(CustomError);
        });

        it('should throw CustomError 400 when id contains invalid characters', async () => {
            req.params.id = '507f1f77bcf86cd79943901z';

            await expect(validateId(req, res, next)).rejects.toThrow(CustomError);
        });
    });
});