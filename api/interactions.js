import { InteractionResponseType, InteractionType } from "discord-interactions";
import { authenticate } from "../authentication.js";
import { handleInteractionAsync } from "../handle-interaction.js";

export async function handler(req, res) {
    if (!authenticate(req.headers, req.body)) {
        res.status(401);
        res.send("Unauthorized");
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
                    res.headers.set(header, value);
                }
            }
            res.send(res.body);
        default:
            res.send("");
    }
}