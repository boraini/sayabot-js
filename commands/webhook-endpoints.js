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
        data: (typeof message == "string" || message instanceof String) ? getMessage(message, options) : message,
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

    let message_reference = undefined, content = message;

    if (content.content) {
        content = content.content;
        message_reference = content.message_reference;
    }
    
    return fetch(endpoint, {
        method: "POST",
        ...getJSONResponse({
            content,
            message_reference,
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

export async function sendAllReactions(channelId, messageId, emojis, delay) {
    const myEmojis = [...emojis];

    async function resolver(resolve) {
        const emoji = myEmojis.shift();
        const encoded = encodeURIComponent(emoji);

        await fetch(`${baseDiscordApiUrl}/channels/${channelId}/messages/${messageId}/reactions/${encoded}/@me`, {
            method: "PUT",
            ...getJSONResponse({}),
        });

        if (myEmojis.length == 0) {
            resolve();
        } else {
            setTimeout(() => resolver(resolve), delay);
        }
    }

    return new Promise(resolver);
}
