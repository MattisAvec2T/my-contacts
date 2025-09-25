import { MongoClient } from "mongodb";
import { MONGO_URI } from "./env.config.js";

const client = new MongoClient(MONGO_URI);
let database;

try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    database = client.db("MyContacts");

    try {
        await database.collection("users").createIndex(
            { email: 1 },
            {
                unique: true,
                name: "email_index"
            }
        );
        console.log("email_index successfully created")
    } catch (err) {
        if (err.codeName === "IndexOptionsConflict") console.log("email_index already exists");
    }

    try {
        await database.collection("contacts").createIndex(
            { userEmail: 1, phone: 1 },
            {
                unique: true,
                name: "userEmail-phone_index"
            }
        );
        console.log("userEmail-phone_index successfully created")
    } catch (err) {
        if (err.codeName === "IndexOptionsConflict") console.log("userEmail-phone_index already exists");
    }

} catch (err) {
    console.error(err);
}

export default database;