import { describe, it, expect, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { hashPassword, comparePassword } from '../../../services/auth.service.js';
import { CustomError } from '../../../errors/custom.error.js';

vi.mock('bcrypt');

describe('Auth Service', () => {
    describe('hashPassword', () => {
        it('should hash a password successfully', async () => {
            const password = 'testPassword123';
            const salt = 'mockSalt';
            const hashedPassword = 'hashedPassword123';

            bcrypt.genSalt.mockResolvedValue(salt);
            bcrypt.hash.mockResolvedValue(hashedPassword);

            const result = await hashPassword(password);

            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith(password, salt);
            expect(result).toBe(hashedPassword);
        });

        it('should throw error if hashing fails', async () => {
            const password = 'testPassword123';
            const error = new Error('Hashing failed');

            bcrypt.genSalt.mockRejectedValue(error);

            await expect(hashPassword(password)).rejects.toThrow('Hashing failed');
        });

        it('should generate different salts for same password', async () => {
            bcrypt.genSalt
                .mockResolvedValueOnce('salt1')
                .mockResolvedValueOnce('salt2');
            bcrypt.hash
                .mockResolvedValueOnce('hash1')
                .mockResolvedValueOnce('hash2');

            const result1 = await hashPassword('password');
            const result2 = await hashPassword('password');

            expect(result1).not.toBe(result2);
        });
    });

    describe('comparePassword', () => {
        it('should not throw error when passwords match', async () => {
            const password = 'testPassword123';
            const hashedPassword = 'hashedPassword123';

            bcrypt.compare.mockResolvedValue(true);

            await expect(comparePassword(password, hashedPassword)).resolves.not.toThrow();
            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
        });

        it('should throw CustomError when passwords do not match', async () => {
            const password = 'wrongPassword';
            const hashedPassword = 'hashedPassword123';

            bcrypt.compare.mockResolvedValue(false);

            await expect(comparePassword(password, hashedPassword))
                .rejects.toThrow(CustomError);

            try {
                await comparePassword(password, hashedPassword);
            } catch (err) {
                expect(err.code).toBe(400);
                expect(err.message).toBe('Invalid password');
            }
        });

        it('should throw error if bcrypt.compare fails', async () => {
            const password = 'testPassword123';
            const hashedPassword = 'hashedPassword123';
            const error = new Error('Comparison failed');

            bcrypt.compare.mockRejectedValue(error);

            await expect(comparePassword(password, hashedPassword))
                .rejects.toThrow('Comparison failed');
        });
    });
});