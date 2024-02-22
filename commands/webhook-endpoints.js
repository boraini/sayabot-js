import env from "../env.js";

export const baseDiscordApiUrl = "https://discord.com/api";

export function getJSONResponse(object) {
    return {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bot " + env.discordToken,
        },
        body: JSON.stringify(object),
    };
}

export function interactionResponseCreateEndpoint(interaction) {
    return `${baseDiscordApiUrl}/interactions/${interaction.id}/${interaction.token}/callback`;
}

export function interactionResponseEditEndpoint(interaction) {
    return `${baseDiscordApiUrl}/webhooks/${env.clientId}/${interaction.token}/messages/@original`;
}

export function interactionResponseFollowupEndpoint(interaction) {
    return `${baseDiscordApiUrl}/webhooks/${env.clientId}/${interaction.token}`;
}

export function getInteractionResponse(type, message, options) {
    return {
        type: type,
        data: getMessage(message, options),
    };
}

export function getMessage(message, options) {
    return {
        content: message,
        flags: options?.ephemeral ? 64 : undefined,
    };
}

export async function editReply(interaction, message, options) {
    return fetch(interactionResponseEditEndpoint(interaction), {
        ...getJSONResponse(
            getMessage(message, options)
        ),
        method: "PATCH",
    });
}

export async function sendWebhookMessage(webhook, message, webhookData) {
    const endpoint = `${baseDiscordApiUrl}/webhooks/${webhook.id}/${webhook.token}`;

    return fetch(endpoint, {
        method: "POST",
        ...getJSONResponse({
            content: message,
            username: webhookData.displayName,
            avatar_url: webhookData.avatar,
        }),
    });
}

export async function deferReplyWebhook(interaction) {
    return fetch(interactionResponseCreateEndpoint(interaction), {
        ...getJSONResponse(
            { type: 5 },
        ),
        method: "POST",
    }).then(r => r.text(), () => console.log("there was an error creating the response")).then(r => console.log(r));
}