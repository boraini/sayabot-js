import joshua from "./joshua.js";
import innkeeper from "./innkeeper.js";
import serial_designation_n from "./serial_designation_n.js";
import { HuggingFaceConversation } from "../personality-helpers/huggingface.js";

export const personalities = {
    joshua,
    innkeeper,
    serial_designation_n,
};

export function hydrateConversation(conv) {
    let result = null;
    switch(conv.type) {
        case "HuggingFaceConversation":
        default:
            result = HuggingFaceConversation.hydrate(conv);
            break;
    }

    if (result) {
        if (conv.webhookData) result.webhookData = conv.webhookData;
    } else {
        console.warn(`Conversation with type ${conv.type} could not be hydrated.`);
    }
    
    return result;
}