import database from "../config/database.config.js";
import { CustomError } from "../errors/custom.error.js";

const collection = database.collection("contacts");

export async function createContact(userEmail, contact) {
    try {
        const insertData = {
            ...contact,
            userEmail: userEmail,
        }
        await collection.insertOne(insertData);
        return contact;
    } catch (err) {
        if (err.code === 11000) throw new CustomError({ code: 400, message: "Contact already exists" });
        throw err;
    }
}

export async function getContactsFromUser(userEmail) {
    try {
        return await collection.find({ "userEmail": userEmail }).toArray();
    } catch (err) {
        throw err;
    }
}

export async function updateContact(userEmail, id, contact) {
    try {
        const result = await collection.updateOne(
            {
                "userEmail": userEmail,
                "_id": id,
            },
            { $set: contact }
        );
        if (result.matchedCount === 0) throw new CustomError({ code: 404, message: "Contact not found" })
        return result;
    } catch (err) {
        console.log(err)
        throw err;
    }
}

export async function deleteContactFromId(userEmail, id) {
    try {
        const result = await collection.deleteOne({
            "userEmail": userEmail,
            "_id": id,
        });
        if (result.deletedCount === 0) throw new CustomError({ code: 404, message: "Contact not found" })
        return result;
    } catch (err) {
        throw err;
    }
}