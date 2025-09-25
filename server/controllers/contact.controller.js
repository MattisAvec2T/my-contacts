import {
    createContact,
    deleteContactFromId,
    getContactsFromUser,
    updateContact
} from "../repositories/contact.repository.js";
import { CustomError } from "../errors/custom.error.js";

export async function createContactController(req, res, next) {
    try {
        const contact = req.body
        await createContact(req.userEmail, contact);

        res.status(201).json({ success: true, message: "User successfully created", data: contact });
    } catch (err) {
        next(err);
    }
}

export async function getAllContactsController(req, res, next) {
    try {
        const userContacts = await getContactsFromUser(req.userEmail);

        res.status(200).json({ success: true, message: "Contact list retrieved", data: userContacts });
    } catch (err) {
        next(err);
    }
}

export async function updateContactController(req, res, next) {
    try {
        if (!(req.body.firstName || req.body.lastName || req.body.phone)) throw new CustomError({ code: 400, message: "At least one field must be updated"})

        await updateContact(req.userEmail, req.params.id, req.body);

        res.status(200).json({ success: true, message: "Contact successfully updated", data: req.body });
    } catch (err) {
        next(err);
    }
}

export async function deleteContactController(req, res, next) {
    try {
        await deleteContactFromId(req.userEmail, req.params.id);

        res.status(204).json({ success: true, message: "Contact successfully deleted" });
    } catch (err) {
        next(err);
    }
}