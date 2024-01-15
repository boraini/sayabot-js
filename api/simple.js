import { InteractionResponseType } from "discord-interactions";
import { buffer } from "micro";
import { authenticate } from "../authentication";

export const config = {
    api: {
        bodyParser: false,
    },
};

/**Vercel function handler
 * 
 * @param {import("@vercel/node").VercelRequest} req
 * @param {import("@vercel/node").VercelResponse} res
 */
export default async function handle(req, res) {
    const rawBody = await buffer(req);
    console.log(rawBody.toString("utf8"));

    if (!authenticate(req.headers, rawBody)) {
        console.log("Not Authorized!");
        res.status(401);
        res.send("Unauthorized");
        return;
    }
    
    res.json({ type: InteractionResponseType.PONG });
}