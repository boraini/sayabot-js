import { baseUrl } from "../globals.js";
import { ddtalkInference } from "../ddtalk/ddtalk-inference.js";
import { getJSONResponse } from "../commands/webhook-endpoints.js";

/** @type {import("next").PageConfig} */
export const config = {
    runtime: "edge", 
};

/**
 * 
 * @param {import("@vercel/node").VercelRequest} req 
 * @param {import("@vercel/node").VercelResponse} res 
 * @returns 
 */
export default async function handler(req, res) {
    if (req.method != "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const requestItems = await req.json();

    try {
        const conversation = await ddtalkInference(requestItems);
    } catch (e) {
        return new Response("ERROR");
    }

    await fetch(`${baseUrl}/api/ddtalk-save-conversation/?uniqueIdentifier=${requestItems.otherIdentifier.replace("#", "%23")}`, {
        method: "POST",
        ...getJSONResponse(conversation),
    })

    return new Response(conversation.lastResponse);
}
