import joshua from "./joshua.js";
import innkeeper from "./innkeeper.js";
import serial_designation_n from "./serial_designation_n.js";
import reverse from "./reverse.js";
import bard from "./bard.js";
import breadman from "./breadman.js";
import { HuggingFaceConversation } from "../personality-helpers/huggingface.js";
import { HuggingFaceTextGenerationConversation } from "../personality-helpers/huggingface-text-generation.js";

export const personalities = {
    joshua,
    innkeeper,
    serial_designation_n,
    reverse,
    bard,
    breadman,
};

export function hydrateConversation(conv) {
    let result = null;
    switch(conv.type) {
        case "ReverseConversation":
            result = reverse.Conversation.hydrate(conv);
            break;
        case "BreadmanConversation":
            result = breadman.Conversation.hydrate(conv);
            break;
        case "HuggingFaceTextGenerationConversation":
            result = HuggingFaceTextGenerationConversation.hydrate(conv);
            break;
        case "HuggingFaceConversation":
        default:
            result = HuggingFaceConversation.hydrate(conv);
            break;
    }

    if (result) {
        if (conv.webhookData) result.webhookData = conv.webhookData;
        result.lastMessage = conv.lastMessage;
    } else {
        console.warn(`Conversation with type ${conv.type} could not be hydrated.`);
    }
    
    return result;
}