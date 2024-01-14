import { verifyKey } from "discord-interactions";
import env from "./env.js";

export function authenticate(headers, rawBody) {
    const signature = headers['x-signature-ed25519'] ?? headers['X-Signature-Ed25519'];
    const timestamp = headers['x-signature-timestamp'] ?? headers['X-Signature-Timestamp'];

    console.log(signature);
    console.log(timestamp);
    console.log(env.clientPublicKey);
    console.log(rawBody.toString("utf8"));
    const isValidRequest = verifyKey(rawBody, signature, timestamp, env.clientPublicKey);

    return isValidRequest;
}