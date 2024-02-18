import { conversational } from "@huggingface/inference";
import env from "../env.js";
import { getMessageResponse, getErrorResponse } from "../personality-helpers/standard-response.js";

const CONVERSATION_LENGTH_LIMIT = 3;

export class HuggingFaceConversation {
    constructor(myName, otherName, model) {
        this.type = "HuggingFaceConversation";
        this.model = model;
        this.myName = myName;
        this.otherName = otherName;
        this.conversation = {
            past_user_inputs: [],
            generated_responses: [],
        };
    }

    /** Returns the error (to be console.errored) iff the conversation is going well on the code side. Also responds to the message if there is a problem.
     * 
     * @param {import("@huggingface/inference").ConversationalOutput} conversationalOutput 
     */
    pollConversationError(conversationalOutput) {
        return null;
    }

    /** Makes a conversational HuggingFace Inference API call and returns the formatted response as text.
     * 
     * @param {string} message 
     * @returns 
     */
    async respond(message) {
        const scope = this;
        this.lastMessage = message;

        async function resolver(resolve, reject) {
            const conversationOutput = await conversational({
                accessToken: env.huggingfaceToken,
                model: scope.model,
                inputs: { ...scope.conversation, text: message },
            }).catch(e => {
                console.error(e);
                reject(getErrorResponse(scope, `Something is wrong with ${scope.myName}.`));
            });
    
            let error;
    
            if (!(error = scope.pollConversationError(conversationOutput))) {
                scope.conversation = conversationOutput.conversation;
                if (scope.conversation.past_user_inputs.length > CONVERSATION_LENGTH_LIMIT) scope.conversation.past_user_inputs.shift();
                if (scope.conversation.generated_responses.length > CONVERSATION_LENGTH_LIMIT) scope.conversation.generated_responses.shift();
                resolve(conversationOutput.generated_text);
            } else {
                console.log(error);
                reject(getErrorResponse(scope, `Something is wrong with ${scope.myName}.`));
            }
        }
        
        return new Promise(resolver);
    }

    async end() {}

    static hydrate(obj) {
        const conversation = new HuggingFaceConversation(obj.myName, obj.otherName, obj.model);
        conversation.conversation = obj.conversation;
        conversation.lastMessage = obj.lastMessage;

        return conversation;
    }
}