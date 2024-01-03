import { MAX_MESSAGE_LENGTH, formatShortened } from "../commands/mitigation.js";

/** Return the formatted message text, as if SayaBot is saying it itself.
 * 
 * @param {*} conversation 
 * @param {string} error 
 * @returns 
 */
export function getErrorResponse(conversation, error) {
    return `${error}`;
}

function messageFormat([otherName, myName, lastMessage, message]) {
    return `> **${otherName}:** ${lastMessage}

    **${myName}:** ${message}`;
}

/** Return the formatted message text, as if one of the personalities is saying it.
 * 
 * @param {*} conversation 
 * @param {*} message 
 * @returns 
 */
export function getMessageResponse(conversation, message) {
    return formatShortened(messageFormat, MAX_MESSAGE_LENGTH, [
        conversation.otherName,
        conversation.myName,
        conversation.lastMessage,
        message
    ]);
}