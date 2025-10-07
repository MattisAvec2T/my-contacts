import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectId } from 'mongodb';
import {
    createContact,
    getContactsFromUser,
    updateContact,
    deleteContactFromId
} from '../../../repositories/contact.repository.js';
import { CustomError } from '../../../errors/custom.error.js';

// Mock de env.config AVANT database.config
vi.mock('../../../config/env.config.js', () => ({
    MONGO_URI: 'mongodb://localhost:27017/test',
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: 3600,
    PORT: 3000
}));

// Mock doit être défini AVANT toute utilisation de variable
vi.mock('../../../config/database.config.js', () => {
    const mockCollection = {
        insertOne: vi.fn(),
        find: vi.fn(),
        updateOne: vi.fn(),
        deleteOne: vi.fn()
    };

    const mockDatabase = {
        collection: vi.fn(() => mockCollection)
    };

    return {
        default: mockDatabase
    };
});

describe('Contact Repository', () => {
    let mockCollection;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Importer dynamiquement pour récupérer le mock
        const database = (await import('../../../config/database.config.js')).default;
        mockCollection = database.collection();
    });

    describe('createContact', () => {
        it('should create contact successfully', async () => {
            const userEmail = 'test@example.com';
            const contact = {
                firstName: 'John',
                lastName: 'Doe',
                phone: '1234567890'
            };

            mockCollection.insertOne.mockResolvedValue({
                insertedId: new ObjectId(),
                acknowledged: true
            });

            const result = await createContact(userEmail, contact);

            expect(mockCollection.insertOne).toHaveBeenCalledWith({
                ...contact,
                userEmail: userEmail
            });
            expect(result).toEqual(contact);
        });

        it('should throw CustomError 400 when contact already exists', async () => {
            const userEmail = 'test@example.com';
            const contact = {
                firstName: 'John',
                lastName: 'Doe',
                phone: '1234567890'
            };

            const duplicateError = new Error('Duplicate key');
            duplicateError.code = 11000;
            mockCollection.insertOne.mockRejectedValue(duplicateError);

            await expect(createContact(userEmail, contact))
                .rejects.toThrow(CustomError);

            try {
                await createContact(userEmail, contact);
            } catch (err) {
                expect(err.code).toBe(400);
                expect(err.message).toBe('Contact already exists');
            }
        });

        it('should propagate non-duplicate database errors', async () => {
            const userEmail = 'test@example.com';
            const contact = {
                firstName: 'John',
                lastName: 'Doe',
                phone: '1234567890'
            };

            const dbError = new Error('Database error');
            mockCollection.insertOne.mockRejectedValue(dbError);

            await expect(createContact(userEmail, contact))
                .rejects.toThrow('Database error');
        });

        it('should add userEmail to contact data', async () => {
            const userEmail = 'user@example.com';
            const contact = {
                firstName: 'Jane',
                lastName: 'Smith',
                phone: '9876543210'
            };

            mockCollection.insertOne.mockResolvedValue({
                insertedId: new ObjectId()
            });

            await createContact(userEmail, contact);

            const insertedData = mockCollection.insertOne.mock.calls[0][0];
            expect(insertedData.userEmail).toBe(userEmail);
            expect(insertedData.firstName).toBe('Jane');
            expect(insertedData.lastName).toBe('Smith');
            expect(insertedData.phone).toBe('9876543210');
        });
    });

    describe('getContactsFromUser', () => {
        it('should return all contacts for a user', async () => {
            const userEmail = 'test@example.com';
            const contacts = [
                { firstName: 'John', lastName: 'Doe', phone: '1234567890', userEmail },
                { firstName: 'Jane', lastName: 'Smith', phone: '9876543210', userEmail }
            ];

            const mockCursor = {
                toArray: vi.fn().mockResolvedValue(contacts)
            };
            mockCollection.find.mockReturnValue(mockCursor);

            const result = await getContactsFromUser(userEmail);

            expect(mockCollection.find).toHaveBeenCalledWith({ userEmail: userEmail });
            expect(result).toEqual(contacts);
        });

        it('should return empty array when user has no contacts', async () => {
            const userEmail = 'test@example.com';

            const mockCursor = {
                toArray: vi.fn().mockResolvedValue([])
            };
            mockCollection.find.mockReturnValue(mockCursor);

            const result = await getContactsFromUser(userEmail);

            expect(result).toEqual([]);
        });

        it('should propagate database errors', async () => {
            const userEmail = 'test@example.com';
            const dbError = new Error('Database error');

            const mockCursor = {
                toArray: vi.fn().mockRejectedValue(dbError)
            };
            mockCollection.find.mockReturnValue(mockCursor);

            await expect(getContactsFromUser(userEmail))
                .rejects.toThrow('Database error');
        });

        it('should only return contacts for specified user', async () => {
            const userEmail = 'specific@example.com';

            const mockCursor = {
                toArray: vi.fn().mockResolvedValue([])
            };
            mockCollection.find.mockReturnValue(mockCursor);

            await getContactsFromUser(userEmail);

            expect(mockCollection.find).toHaveBeenCalledWith({ userEmail: 'specific@example.com' });
        });
    });

    describe('updateContact', () => {
        it('should update contact successfully', async () => {
            const userEmail = 'test@example.com';
            const contactId = new ObjectId('507f1f77bcf86cd799439011');
            const updateData = {
                firstName: 'UpdatedJohn',
                phone: '1111111111'
            };

            mockCollection.updateOne.mockResolvedValue({
                matchedCount: 1,
                modifiedCount: 1
            });

            const result = await updateContact(userEmail, contactId, updateData);

            expect(mockCollection.updateOne).toHaveBeenCalledWith(
                {
                    userEmail: userEmail,
                    _id: contactId
                },
                { $set: updateData }
            );
            expect(result.matchedCount).toBe(1);
        });

        it('should throw CustomError 404 when contact not found', async () => {
            const userEmail = 'test@example.com';
            const contactId = new ObjectId('507f1f77bcf86cd799439011');
            const updateData = { firstName: 'John' };

            mockCollection.updateOne.mockResolvedValue({
                matchedCount: 0,
                modifiedCount: 0
            });

            await expect(updateContact(userEmail, contactId, updateData))
                .rejects.toThrow(CustomError);

            try {
                await updateContact(userEmail, contactId, updateData);
            } catch (err) {
                expect(err.code).toBe(404);
                expect(err.message).toBe('Contact not found');
            }
        });

        it('should propagate database errors', async () => {
            const userEmail = 'test@example.com';
            const contactId = new ObjectId('507f1f77bcf86cd799439011');
            const updateData = { firstName: 'John' };
            const dbError = new Error('Database error');

            mockCollection.updateOne.mockRejectedValue(dbError);

            await expect(updateContact(userEmail, contactId, updateData))
                .rejects.toThrow('Database error');
        });

        it('should only update contact owned by user', async () => {
            const userEmail = 'owner@example.com';
            const contactId = new ObjectId('507f1f77bcf86cd799439011');
            const updateData = { phone: '5555555555' };

            mockCollection.updateOne.mockResolvedValue({
                matchedCount: 1,
                modifiedCount: 1
            });

            await updateContact(userEmail, contactId, updateData);

            const filterUsed = mockCollection.updateOne.mock.calls[0][0];
            expect(filterUsed.userEmail).toBe('owner@example.com');
            expect(filterUsed._id).toEqual(contactId);
        });

        it('should handle partial updates', async () => {
            const userEmail = 'test@example.com';
            const contactId = new ObjectId('507f1f77bcf86cd799439011');
            const updateData = { lastName: 'NewLastName' };

            mockCollection.updateOne.mockResolvedValue({
                matchedCount: 1,
                modifiedCount: 1
            });

            await updateContact(userEmail, contactId, updateData);

            const updateOperation = mockCollection.updateOne.mock.calls[0][1];
            expect(updateOperation).toEqual({ $set: updateData });
        });
    });

    describe('deleteContactFromId', () => {
        it('should delete contact successfully', async () => {
            const userEmail = 'test@example.com';
            const contactId = new ObjectId('507f1f77bcf86cd799439011');

            mockCollection.deleteOne.mockResolvedValue({
                deletedCount: 1,
                acknowledged: true
            });

            const result = await deleteContactFromId(userEmail, contactId);

            expect(mockCollection.deleteOne).toHaveBeenCalledWith({
                userEmail: userEmail,
                _id: contactId
            });
            expect(result.deletedCount).toBe(1);
        });

        it('should throw CustomError 404 when contact not found', async () => {
            const userEmail = 'test@example.com';
            const contactId = new ObjectId('507f1f77bcf86cd799439011');

            mockCollection.deleteOne.mockResolvedValue({
                deletedCount: 0
            });

            await expect(deleteContactFromId(userEmail, contactId))
                .rejects.toThrow(CustomError);

            try {
                await deleteContactFromId(userEmail, contactId);
            } catch (err) {
                expect(err.code).toBe(404);
                expect(err.message).toBe('Contact not found');
            }
        });

        it('should propagate database errors', async () => {
            const userEmail = 'test@example.com';
            const contactId = new ObjectId('507f1f77bcf86cd799439011');
            const dbError = new Error('Database error');

            mockCollection.deleteOne.mockRejectedValue(dbError);

            await expect(deleteContactFromId(userEmail, contactId))
                .rejects.toThrow('Database error');
        });

        it('should only delete contact owned by user', async () => {
            const userEmail = 'owner@example.com';
            const contactId = new ObjectId('507f1f77bcf86cd799439011');

            mockCollection.deleteOne.mockResolvedValue({
                deletedCount: 1
            });

            await deleteContactFromId(userEmail, contactId);

            expect(mockCollection.deleteOne).toHaveBeenCalledWith({
                userEmail: 'owner@example.com',
                _id: contactId
            });
        });

        it('should not delete contacts of other users', async () => {
            const userEmail = 'user1@example.com';
            const contactId = new ObjectId('507f1f77bcf86cd799439011');

            mockCollection.deleteOne.mockResolvedValue({
                deletedCount: 0
            });

            await expect(deleteContactFromId(userEmail, contactId))
                .rejects.toThrow(CustomError);
        });
    });
});