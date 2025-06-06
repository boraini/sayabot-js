import { connectDb } from "../database/mongodb.js";
import { CurrentConversationsDatabase } from "../database/conversations-database-mongodb.js";

/**
 * 
 * @param {import("@vercel/node").VercelRequest} req 
 * @param {import("@vercel/node").VercelResponse} res 
 * @returns 
 */
export default async function handler(req, res) {
    if (req.method != "POST") {
        res.status(405).send("Method Not Allowed");
    }

    await connectDb();
    await CurrentConversationsDatabase.put(req.query["uniqueIdentifier"], req.body);

    res.send("Saved!");
}
