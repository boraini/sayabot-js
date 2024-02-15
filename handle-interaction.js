import { InteractionResponseType, InteractionType } from "discord-interactions";
import { getJSONResponse } from "./commands/webhook-endpoints.js";
import { setCommands, handleInteraction } from "./commands/commands.js";
import { ApplicationCommandType } from "discord.js";

import { getInteractionResponse, interactionResponseEditEndpoint, interactionResponseFollowupEndpoint, getMessage } from "./commands/webhook-endpoints.js";

const commandClient = {};
setCommands(commandClient);

/** Creates an interaction object that is akin to the Discord.js interaction, and passes it to the bot command handler.
 * The returned promise will resolve to an object which you can respond to the interaction endpoint call with.
 */
export async function handleInteractionAsync(interaction) {
    /* Responding Functions */
    async function followUp(message, options) {
        return fetch(interactionResponseFollowupEndpoint(interaction), {
            ...getJSONResponse(
                getMessage(message, options)
            ),
            method: "POST",
        });
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
            resolve(getJSONResponse(
                { type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE }
            ));
        }
    
        function reply(message, options) {
            interaction.replied = true;
            resolve(getJSONResponse(
                getInteractionResponse(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, message, options)
            ));
        }

        const myInteraction = {...interaction, deferReply, reply, followUp, isMessageContextMenuCommand, isChatInputCommand};

        async function editReply(message, options) {
            // I couldn't find documentation for this. We are creating a response both through the Webhook API and also through the response of the interaction endpoint call.
            if (myInteraction.deferred) {
                myInteraction.reply(message, options);
            } else {
                return fetch(interactionResponseEditEndpoint(interaction), {
                    ...getJSONResponse(
                        getMessage(message, options)
                    ),
                    method: "PATCH",
                });
            }
        };

        myInteraction.editReply = editReply;

        myInteraction.commandName = interaction.data.name;
        myInteraction.options = new Map();

        const interactionUser = interaction.user ?? interaction.member.user;
        myInteraction.user = interactionUser;
        myInteraction.user.displayName = interactionUser.global_name;

        if (interaction.data.type = ApplicationCommandType.Message && interaction.data.resolved?.messages) {
            myInteraction.targetMessage = Object.values(interaction.data.resolved.messages)[0];
            myInteraction.targetMessage.author.displayName = myInteraction.targetMessage.author.global_name;
        }

        interaction.data.options?.forEach(({name, type, value}) => myInteraction.options.set(name, {name, type, value}));

        await handleInteraction(commandClient, myInteraction).catch(reject);
    }

    return new Promise(clientResolver);
}