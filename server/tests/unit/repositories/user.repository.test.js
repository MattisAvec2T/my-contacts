import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserByEmail, createUser } from '../../../repositories/user.repository.js';
import { CustomError } from '../../../errors/custom.error.js';

vi.mock('../../../config/env.config.js', () => ({
    MONGO_URI: 'mongodb://localhost:27017/test',
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: 3600,
    PORT: 3000
}));

vi.mock('../../../config/database.config.js', () => {
    const mockCollection = {
        findOne: vi.fn(),
        insertOne: vi.fn()
    };

    const mockDatabase = {
        collection: vi.fn(() => mockCollection)
    };

    return {
        default: mockDatabase
    };
});

describe('User Repository', () => {
    let mockCollection;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Importer dynamiquement pour récupérer le mock
        const database = (await import('../../../config/database.config.js')).default;
        mockCollection = database.collection();
    });

    describe('getUserByEmail', () => {
        it('should return user when found', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                password: 'hashedPassword123'
            };

            mockCollection.findOne.mockResolvedValue(mockUser);

            const result = await getUserByEmail('test@example.com');

            expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(result).toEqual(mockUser);
        });

        it('should throw CustomError 404 when user not found', async () => {
            mockCollection.findOne.mockResolvedValue(null);

            await expect(getUserByEmail('nonexistent@example.com'))
                .rejects.toThrow(CustomError);

            try {
                await getUserByEmail('nonexistent@example.com');
            } catch (err) {
                expect(err.code).toBe(404);
                expect(err.message).toBe('User not found');
            }
        });

        it('should propagate database errors', async () => {
            const dbError = new Error('Database connection failed');
            mockCollection.findOne.mockRejectedValue(dbError);

            await expect(getUserByEmail('test@example.com'))
                .rejects.toThrow('Database connection failed');
        });

        it('should handle email with special characters', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test+tag@example.com',
                password: 'hashedPassword'
            };

            mockCollection.findOne.mockResolvedValue(mockUser);

            const result = await getUserByEmail('test+tag@example.com');

            expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'test+tag@example.com' });
            expect(result).toEqual(mockUser);
        });
    });

    describe('createUser', () => {
        it('should create user successfully', async () => {
            const newUser = {
                email: 'newuser@example.com',
                password: 'hashedPassword123'
            };

            const insertResult = {
                insertedId: '507f1f77bcf86cd799439011',
                acknowledged: true
            };

            mockCollection.insertOne.mockResolvedValue(insertResult);

            await createUser(newUser);

            expect(mockCollection.insertOne).toHaveBeenCalledWith(newUser);
        });

        it('should throw CustomError 400 when email already exists', async () => {
            const duplicateUser = {
                email: 'existing@example.com',
                password: 'hashedPassword123'
            };

            const duplicateError = new Error('Duplicate key error');
            duplicateError.code = 11000;
            mockCollection.insertOne.mockRejectedValue(duplicateError);

            await expect(createUser(duplicateUser))
                .rejects.toThrow(CustomError);

            try {
                await createUser(duplicateUser);
            } catch (err) {
                expect(err.code).toBe(400);
                expect(err.message).toBe('Email already exists');
            }
        });

        it('should propagate non-duplicate database errors', async () => {
            const newUser = {
                email: 'test@example.com',
                password: 'hashedPassword123'
            };

            const dbError = new Error('Database error');
            dbError.code = 500;
            mockCollection.insertOne.mockRejectedValue(dbError);

            await expect(createUser(newUser))
                .rejects.toThrow('Database error');
        });

        it('should handle user creation with additional fields', async () => {
            const userWithExtra = {
                email: 'test@example.com',
                password: 'hashedPassword123',
                createdAt: new Date()
            };

            mockCollection.insertOne.mockResolvedValue({
                insertedId: '507f1f77bcf86cd799439011',
                acknowledged: true
            });

            await createUser(userWithExtra);

            expect(mockCollection.insertOne).toHaveBeenCalledWith(userWithExtra);
        });

        it('should not return anything on success', async () => {
            const newUser = {
                email: 'test@example.com',
                password: 'hashedPassword123'
            };

            mockCollection.insertOne.mockResolvedValue({
                insertedId: '507f1f77bcf86cd799439011'
            });

            const result = await createUser(newUser);

            expect(result).toBeUndefined();
        });
    });
});