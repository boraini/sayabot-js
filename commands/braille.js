import { ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js";
import { IntegrationTypes, InteractionContextTypes } from "./util.js";
import { MAX_MESSAGE_LENGTH } from "./mitigation.js";
import { deferReplyWebhook } from "./webhook-endpoints.js";

const onMessageData = new ContextMenuCommandBuilder()
    .setName("Make Braille image")
    .setType(ApplicationCommandType.Message)
    .setIntegrationTypes([IntegrationTypes.GUILD_INSTALL, IntegrationTypes.USER_INSTALL])
    .setContexts(InteractionContextTypes.all)

const recognizedImageTypes = [ "image/png", "image/jpeg", "image/webp", "image/avif", "image/gif" ];

/**
 * @param {import("discord.js").ContextMenuCommandInteraction} interaction
 */
function getImageUrl(interaction) {
    const message = interaction.targetMessage;

    if (!message.attachments) return null;

    let foundAttachment = null;

    for (let attachment of message.attachments) {
        if (attachment.content_type && recognizedImageTypes.includes(attachment.content_type)) {
            foundAttachment = attachment;
            break;
        }
    }

    if (!foundAttachment) return foundAttachment;

    return foundAttachment.url;
}

async function executeOnMessage(interaction) {
    const imageUrl = getImageUrl(interaction);

    if (imageUrl == null) {
        interaction.reply("Only use this command on messages with attached images.", { ephemeral: true });
        return;
    }

    await deferReplyWebhook(interaction);

    try {
        const headers = {
            Authorization: "Bearer " + process.env.BRAILLEBOT_KEY,
        };

        const encoded = encodeURIComponent(imageUrl);

        let error = false;

        const response = await fetch("https://pulse.boraini.com:8080/convert?url=" + encoded, { headers }).then(r => {
            if (r.ok) {
                return r.text();
            } else {
                error = true;
                return Promise.resolve("API error: status: " + r.status);
            }
        });

        interaction.editReply(response.substring(0, MAX_MESSAGE_LENGTH), { ephemeral: error });
    } catch (e) {
        console.error(e);
        interaction.editReply("An internal error occurred.", { ephemeral: true });
    }
}

export default { onMessage: { data: onMessageData, executeOnMessage } };
