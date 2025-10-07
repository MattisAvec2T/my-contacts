import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createContactController,
    getAllContactsController,
    updateContactController,
    deleteContactController
} from '../../../controllers/contact.controller.js';
import {
    createContact,
    getContactsFromUser,
    updateContact,
    deleteContactFromId
} from '../../../repositories/contact.repository.js';
import { CustomError } from '../../../errors/custom.error.js';

vi.mock('../../../repositories/contact.repository.js');

describe('Contact Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            userEmail: 'test@example.com'
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        next = vi.fn();
        vi.clearAllMocks();
    });

    describe('createContactController', () => {
        it('should create a contact successfully', async () => {
            req.body = {
                firstName: 'John',
                lastName: 'Doe',
                phone: '1234567890'
            };

            createContact.mockResolvedValue(req.body);

            await createContactController(req, res, next);

            expect(createContact).toHaveBeenCalledWith('test@example.com', req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User successfully created',
                data: req.body
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when contact creation fails', async () => {
            req.body = {
                firstName: 'John',
                lastName: 'Doe',
                phone: '1234567890'
            };

            const error = new Error('Contact already exists');
            createContact.mockRejectedValue(error);

            await createContactController(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should pass userEmail from request to repository', async () => {
            req.userEmail = 'custom@example.com';
            req.body = {
                firstName: 'Jane',
                lastName: 'Smith',
                phone: '9876543210'
            };

            createContact.mockResolvedValue(req.body);

            await createContactController(req, res, next);

            expect(createContact).toHaveBeenCalledWith('custom@example.com', req.body);
        });
    });

    describe('getAllContactsController', () => {
        it('should retrieve all contacts for a user', async () => {
            const contacts = [
                { firstName: 'John', lastName: 'Doe', phone: '1234567890' },
                { firstName: 'Jane', lastName: 'Smith', phone: '9876543210' }
            ];

            getContactsFromUser.mockResolvedValue(contacts);

            await getAllContactsController(req, res, next);

            expect(getContactsFromUser).toHaveBeenCalledWith('test@example.com');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Contact list retrieved',
                data: contacts
            });
        });

        it('should return empty array when user has no contacts', async () => {
            getContactsFromUser.mockResolvedValue([]);

            await getAllContactsController(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Contact list retrieved',
                data: []
            });
        });

        it('should call next with error when retrieval fails', async () => {
            const error = new Error('Database error');
            getContactsFromUser.mockRejectedValue(error);

            await getAllContactsController(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should use correct userEmail from request', async () => {
            req.userEmail = 'different@example.com';
            getContactsFromUser.mockResolvedValue([]);

            await getAllContactsController(req, res, next);

            expect(getContactsFromUser).toHaveBeenCalledWith('different@example.com');
        });
    });

    describe('updateContactController', () => {
        it('should update contact with all fields', async () => {
            req.params.id = '507f1f77bcf86cd799439011';
            req.body = {
                firstName: 'UpdatedJohn',
                lastName: 'UpdatedDoe',
                phone: '1111111111'
            };

            updateContact.mockResolvedValue({ modifiedCount: 1 });

            await updateContactController(req, res, next);

            expect(updateContact).toHaveBeenCalledWith(
                'test@example.com',
                '507f1f77bcf86cd799439011',
                req.body
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Contact successfully updated',
                data: req.body
            });
        });

        it('should update contact with only firstName', async () => {
            req.params.id = '507f1f77bcf86cd799439011';
            req.body = {
                firstName: 'NewName'
            };

            updateContact.mockResolvedValue({ modifiedCount: 1 });

            await updateContactController(req, res, next);

            expect(updateContact).toHaveBeenCalledWith(
                'test@example.com',
                '507f1f77bcf86cd799439011',
                { firstName: 'NewName' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should update contact with only lastName', async () => {
            req.params.id = '507f1f77bcf86cd799439011';
            req.body = {
                lastName: 'NewLastName'
            };

            updateContact.mockResolvedValue({ modifiedCount: 1 });

            await updateContactController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should update contact with only phone', async () => {
            req.params.id = '507f1f77bcf86cd799439011';
            req.body = {
                phone: '5555555555'
            };

            updateContact.mockResolvedValue({ modifiedCount: 1 });

            await updateContactController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should throw CustomError 400 when no fields to update', async () => {
            req.params.id = '507f1f77bcf86cd799439011';
            req.body = {};

            await updateContactController(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error).toBeInstanceOf(CustomError);
            expect(error.code).toBe(400);
            expect(error.message).toBe('At least one field must be updated');
            expect(updateContact).not.toHaveBeenCalled();
        });

        it('should call next with error when contact not found', async () => {
            req.params.id = '507f1f77bcf86cd799439011';
            req.body = {
                firstName: 'John'
            };

            const error = new CustomError({ code: 404, message: 'Contact not found' });
            updateContact.mockRejectedValue(error);

            await updateContactController(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        it('should call next with error when update fails', async () => {
            req.params.id = '507f1f77bcf86cd799439011';
            req.body = {
                phone: '1234567890'
            };

            const error = new Error('Database error');
            updateContact.mockRejectedValue(error);

            await updateContactController(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteContactController', () => {
        it('should delete contact successfully', async () => {
            req.params.id = '507f1f77bcf86cd799439011';

            deleteContactFromId.mockResolvedValue({ deletedCount: 1 });

            await deleteContactController(req, res, next);

            expect(deleteContactFromId).toHaveBeenCalledWith(
                'test@example.com',
                '507f1f77bcf86cd799439011'
            );
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Contact successfully deleted'
            });
        });

        it('should call next with error when contact not found', async () => {
            req.params.id = '507f1f77bcf86cd799439011';

            const error = new CustomError({ code: 404, message: 'Contact not found' });
            deleteContactFromId.mockRejectedValue(error);

            await deleteContactController(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should call next with error when deletion fails', async () => {
            req.params.id = '507f1f77bcf86cd799439011';

            const error = new Error('Database error');
            deleteContactFromId.mockRejectedValue(error);

            await deleteContactController(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        it('should use correct userEmail for deletion', async () => {
            req.userEmail = 'owner@example.com';
            req.params.id = '507f1f77bcf86cd799439011';

            deleteContactFromId.mockResolvedValue({ deletedCount: 1 });

            await deleteContactController(req, res, next);

            expect(deleteContactFromId).toHaveBeenCalledWith(
                'owner@example.com',
                '507f1f77bcf86cd799439011'
            );
        });
    });
});