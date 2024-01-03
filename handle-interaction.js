import { InteractionResponseType, InteractionType } from "discord-interactions";
import { baseDiscordApiUrl } from "./globals.js";
import { getJSONResponse } from "./globals.js";
import env from "./env.json" assert { type: "json" };
import { setCommands, handleInteraction } from "./commands/commands.js";
import { ApplicationCommandType } from "discord.js";

const commandClient = {};
setCommands(commandClient);

function interactionResponseEditEndpoint(interaction) {
    return `${baseDiscordApiUrl}/webhooks/${env.clientId}/${interaction.token}/messages/@original`;
}

function interactionResponseFollowupEndpoint(interaction) {
    return `${baseDiscordApiUrl}/webhooks/{application.id}/{interaction.token}`;
}

function createWebhookEndpoint(channel) {
    return `${baseDiscordApiUrl}/channels/${channel.id}/webhooks`;
}

function getInteractionResponse(type, message, options) {
    return {
        type: type,
        data: getMessage(message, options),
    };
}

function getMessage(message, options) {
    return {
        content: message,
        flags: options?.ephemeral ? 64 : undefined,
    };
}

/** Creates an interaction object that is akin to the Discord.js interaction, and passes it to the bot command handler.
 * The returned promise will resolve to an object which you can respond to the interaction endpoint call with.
 */
export async function handleInteractionAsync(interaction) {
    /* Responding Functions */

    async function editReply(message, options) {
        return fetch(interactionResponseEditEndpoint(interaction), {
            ...getJSONResponse(
                getMessage(message, options)
            ),
            method: "PATCH",
        });
    }

    async function followUp(message, options) {
        return fetch(interactionResponseFollowupEndpoint(interaction), {
            ...getJSONResponse(message, options),
            method: "POST",
        });
    }

    async function createWebhook(options) {
        return fetch(createWebhookEndpoint(interaction.channel), {
            ...getJSONResponse(options),
            method: "POST",
        }).then(r => r.json());
    }

    /* Other Functions */

    function isMessageContextMenuCommand() {
        return !!interaction.data.resolved?.messages;
    }

    function isChatInputCommand() {
        return !interaction.data.type || interaction.data.type == ApplicationCommandType.ChatInput;
    }

    async function clientResolver(resolve, reject) {
        async function deferReply() {
            interaction.deferred = true;
            resolve(getJSONResponse({
                type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            }));
        }
    
        function reply(message, options) {
            interaction.replied = true;
            resolve(getJSONResponse(
                getInteractionResponse(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, message, options)
            ));
        }

        const myInteraction = {...interaction, deferReply, reply, editReply, followUp, isMessageContextMenuCommand, isChatInputCommand};

        myInteraction.commandName = interaction.data.name;
        myInteraction.options = new Map();

        const interactionUser = interaction.user ?? interaction.member.user;
        myInteraction.user = interactionUser;
        myInteraction.user.displayName = interactionUser.global_name;

        if (interaction.data.type = ApplicationCommandType.Message && interaction.data.resolved?.messages) {
            myInteraction.targetMessage = Object.values(interaction.data.resolved.messages)[0];
            myInteraction.targetMessage.author.displayName = myInteraction.targetMessage.author.global_name;
        }

        if (myInteraction.channel) myInteraction.channel.createWebhook = createWebhook;

        interaction.data.options?.forEach(({name, type, value}) => myInteraction.options.set(name, {name, type, value}));

        await handleInteraction(commandClient, myInteraction).catch(reject);
    }

    return new Promise(clientResolver);
}