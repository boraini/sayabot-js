import env from "../env.js";
import { Db, MongoClient } from "mongodb";

/** @type {MongoClient} */
let connection = null;
/** @type {Db} */
let db = null;

/** @type {Record<string, import("mongodb").Collection>} */
const collections = {};

export async function connectDb() {
    console.log("connectDb invoked");
    if (!connection) {
        connection = await MongoClient.connect(env.mongodbUri);
        db = connection.db();
        console.log("Connected to MongoDB successfully.");
    }
}

export function getCollection(name) {
    if (!(name in collections)) {
        collections[name] = db.collection(name);
    }

    return collections[name];
}

export async function disconnectDb() {
    if (connection) {
        await connection.close();
        console.log("Disconnected from MongoDB");
        connection = null;
        db = null;
    }
}