import { InteractionResponseType, InteractionType } from "discord-interactions";
import { authenticate } from "../authentication.js";
import { handleInteractionAsync } from "../handle-interaction.js";

export const config = {
    runtime: "edge",
};

async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        console.log(chunk.toString());
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    console.log(`typeof EdgeRuntime: ${typeof EdgeRuntime}`);
    const rawBody =  req.rawBody ?? await buffer(req);
    if (!authenticate(req.headers, rawBody)) {
        res.status(401);
        res.send("Unauthorized");
        return;
    }

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