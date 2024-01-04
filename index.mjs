import { InteractionResponseType, InteractionType } from "discord-interactions";
import { authenticate } from "./authentication.js";
import { handleInteractionAsync } from "./handle-interaction.js";
import { getJSONResponse } from "./globals.js";

export async function handler(event) {
    if (!authenticate(event.headers, event.body)) {
        return 401;
    }

    let body;
    if (event.body instanceof Buffer) {
        const decoder = new TextDecoder('utf-8');
        body = decoder.decode(event.body);
    } else {
        body = event.body;
    }
    
    const interaction = JSON.parse(body);

    switch(interaction.type) {
        case InteractionType.PING:
            return getJSONResponse({ type: InteractionResponseType.PONG });
        case InteractionType.APPLICATION_COMMAND:
        case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
            return await handleInteractionAsync(interaction);
        default:
            return 200;
    }
}