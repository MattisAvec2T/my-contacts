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

    contactRouter.get("/", getAllContactsController);
    contactRouter.post("/", validateDto(newContactSchema), createContactController);
    contactRouter.patch("/:id", validateDto(updateContactSchema), validateId, updateContactController);
    contactRouter.delete("/:id", validateId, deleteContactController);

    return contactRouter;
}