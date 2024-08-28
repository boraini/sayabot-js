import { ContextMenuCommandBuilder, SlashCommandBuilder } from "discord.js";

/**Replace supported parts of the message with the string mapping function
 * 
 * Currently this includes
 *  - main message content
 *  - rich-type embeds
 * 
 * @param { (content: string) => string } fn
 * @param { import("discord.js").Message } message
 */
export function visitMessageComponents(fn, message) {
    const new_message = {};

    if (message.content || message.content == "") {
        new_message.content = fn(message.content);
    }

    if (message.embeds) {
        /** @type { Partial<import("discord.js").Embed> } */
        const new_embeds = [];

        for (let embed of message.embeds) {
            if (embed.type == "rich") {
                if (embed.author) {
                    if (embed.author.name) embed.author.name = fn(embed.author.name);
                }
                if (embed.title) embed.title = fn(embed.title);
                if (embed.description) embed.description = fn(embed.description);
                if (embed.fields) {
                    for (let field of embed.fields) {
                        field.name = fn(field.name);
                        field.value = fn(field.value);
                    }
                }
                if (embed.footer) {
                    if (embed.footer.text) embed.footer.text = fn(embed.footer.text);
                }

                new_embeds.push(embed);
            }
        }

        new_message.embeds = new_embeds;
    }

    return new_message;
}

// TODO: change these to the Discord.js equivalents in the future.

export const IntegrationTypes = {
    GUILD_INSTALL: 0,
    USER_INSTALL: 1,
};

export const InteractionContextTypes = {
    GUILD: 0,
    BOT_DM: 1,
    PRIVATE_CHANNEL: 2,
    all: [0, 1, 2],
};

/**Set the allowed integration types for the command. Use this in conjunstion with setInteractionContextTypes.
 * 
 * @param {number[]} integration_types 
 */
function setIntegrationTypes(integration_types) {
    this.integration_types = integration_types;
    return this;
}

/**Set the allowed context types for the command.
 * 
 * @param {number[]} contexts 
 */
function setContexts(contexts) {
    this.contexts = contexts;
    return this;
}

SlashCommandBuilder.prototype.setIntegrationTypes = setIntegrationTypes;
SlashCommandBuilder.prototype.setContexts = setContexts;

ContextMenuCommandBuilder.prototype.setIntegrationTypes = setIntegrationTypes;
ContextMenuCommandBuilder.prototype.setContexts = setContexts;
