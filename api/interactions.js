import { InteractionResponseType, InteractionType } from "discord-interactions";
import { authenticate } from "../authentication.js";
import { handleInteractionAsync } from "../handle-interaction.js";
import { buffer } from "micro";

/** @type {import("next").PageConfig} */
export const config = {
    api: {
      bodyParser: false,
    },
};

/**
 * 
 * @param {import("@vercel/node").VercelRequest} req 
 * @param {*} res 
 * @returns 
 */
export default async function handler(req, res) {
    const rawBody =  req.rawBody ?? await buffer(req);

    if (!authenticate(req.headers, rawBody)) {
        res.status(401);
        res.send("Unauthorized");
        return;
    }

    req.body = JSON.parse(rawBody.toString("utf8"));

    // Vercel seems to be going to parse our request body.
    let interaction = req.body;

    switch(interaction.type) {
        case InteractionType.PING:
            res.json({ type: InteractionResponseType.PONG });
            break;
        case InteractionType.APPLICATION_COMMAND:
        case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
            const response = await handleInteractionAsync(interaction);
            if (response.headers) {
                for (let [header, value] of Object.entries(response.headers)) {
                    res.setHeader(header, value);
                }
            }
            res.send(response.body);
            break;
        default:
            res.send("");
    }
}