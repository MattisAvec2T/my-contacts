import Router from 'express';
import {
    createContactController,
    deleteContactController,
    getAllContactsController,
    updateContactController
} from "../controllers/contact.controller.js";
import { newContactSchema, updateContactSchema } from "../schemas/contact.schema.js";
import { validateDto, validateId } from "../middlewares/validator.middleware.js";

export default function contactRoutes() {
    const contactRouter = Router();

    /**
     * @swagger
     * /contact:
     *   get:
     *     summary: Get all contacts for the authenticated user
     *     description: Retrieve a list of all contacts belonging to the authenticated user
     *     tags: [Contacts]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Contact list retrieved successfully
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
     *                   example: Contact list retrieved
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Contact'
     *             example:
     *               success: true
     *               message: Contact list retrieved
     *               data:
     *                 - _id: 507f1f77bcf86cd799439011
     *                   firstName: John
     *                   lastName: Doe
     *                   phone: "+33612345678"
     *                   userEmail: user@example.com
     *                 - _id: 507f1f77bcf86cd799439012
     *                   firstName: Jane
     *                   lastName: Smith
     *                   phone: "+33698765432"
     *                   userEmail: user@example.com
     *       401:
     *         description: Unauthorized - Invalid or missing JWT token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               success: false
     *               error: Unauthorized
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    contactRouter.get("/", getAllContactsController);

    /**
     * @swagger
     * /contact:
     *   post:
     *     summary: Create a new contact
     *     description: Add a new contact to the authenticated user's contact list
     *     tags: [Contacts]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - firstName
     *               - lastName
     *               - phone
     *             properties:
     *               firstName:
     *                 type: string
     *                 example: John
     *                 description: Contact's first name
     *               lastName:
     *                 type: string
     *                 example: Doe
     *                 description: Contact's last name
     *               phone:
     *                 type: string
     *                 minLength: 10
     *                 maxLength: 20
     *                 example: "+33612345678"
     *                 description: Contact's phone number (10-20 characters)
     *     responses:
     *       201:
     *         description: Contact created successfully
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
     *                   type: object
     *                   properties:
     *                     firstName:
     *                       type: string
     *                       example: John
     *                     lastName:
     *                       type: string
     *                       example: Doe
     *                     phone:
     *                       type: string
     *                       example: "+33612345678"
     *             example:
     *               success: true
     *               message: User successfully created
     *               data:
     *                 firstName: John
     *                 lastName: Doe
     *                 phone: "+33612345678"
     *       400:
     *         description: Validation error or contact already exists
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
     *                     - msg: Name is required
     *                       path: firstName
     *                       location: body
     *                     - msg: Phone number must be between 10 and 20 characters long
     *                       path: phone
     *                       location: body
     *               contactExists:
     *                 value:
     *                   success: false
     *                   error: Contact already exists
     *       401:
     *         description: Unauthorized - Invalid or missing JWT token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    contactRouter.post("/", validateDto(newContactSchema), createContactController);

    /**
     * @swagger
     * /contact/{id}:
     *   patch:
     *     summary: Update an existing contact
     *     description: Update one or more fields of an existing contact. At least one field must be provided.
     *     tags: [Contacts]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Contact ID (MongoDB ObjectId)
     *         example: 507f1f77bcf86cd799439011
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             minProperties: 1
     *             properties:
     *               firstName:
     *                 type: string
     *                 example: Jane
     *                 description: Contact's first name (optional)
     *               lastName:
     *                 type: string
     *                 example: Smith
     *                 description: Contact's last name (optional)
     *               phone:
     *                 type: string
     *                 minLength: 10
     *                 maxLength: 20
     *                 example: "+33698765432"
     *                 description: Contact's phone number (optional, 10-20 characters)
     *           examples:
     *             updatePhone:
     *               summary: Update only phone
     *               value:
     *                 phone: "+33698765432"
     *             updateAll:
     *               summary: Update all fields
     *               value:
     *                 firstName: Jane
     *                 lastName: Smith
     *                 phone: "+33698765432"
     *     responses:
     *       200:
     *         description: Contact updated successfully
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
     *                   example: Contact successfully updated
     *                 data:
     *                   type: object
     *                   description: Updated fields only
     *             example:
     *               success: true
     *               message: Contact successfully updated
     *               data:
     *                 phone: "+33698765432"
     *       400:
     *         description: Validation error, invalid ID, or no fields provided
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
     *                     - msg: Phone number must be between 10 and 20 characters long
     *                       path: phone
     *                       location: body
     *               invalidId:
     *                 value:
     *                   success: false
     *                   error: Invalid id
     *               noFields:
     *                 value:
     *                   success: false
     *                   error: At least one field must be updated
     *       401:
     *         description: Unauthorized - Invalid or missing JWT token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       404:
     *         description: Contact not found or doesn't belong to user
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               success: false
     *               error: Contact not found
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    contactRouter.patch("/:id", validateDto(updateContactSchema), validateId, updateContactController);

    /**
     * @swagger
     * /contact/{id}:
     *   delete:
     *     summary: Delete a contact
     *     description: Permanently delete a contact from the authenticated user's contact list
     *     tags: [Contacts]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Contact ID (MongoDB ObjectId)
     *         example: 507f1f77bcf86cd799439011
     *     responses:
     *       204:
     *         description: Contact deleted successfully (no content returned)
     *       400:
     *         description: Invalid ID format
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               success: false
     *               error: Invalid id
     *       401:
     *         description: Unauthorized - Invalid or missing JWT token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       404:
     *         description: Contact not found or doesn't belong to user
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               success: false
     *               error: Contact not found
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    contactRouter.delete("/:id", validateId, deleteContactController);

    return contactRouter;
}