import { verifyKey } from "discord-interactions";
import env from "./env.js";

export function authenticate(headers, rawBody) {
    console.dir(headers);
    const signature = headers['x-signature-ed25519'] ?? headers['X-Signature-Ed25519'];
    const timestamp = headers['x-signature-timestamp'] ?? headers['X-Signature-Timestamp'];

    const isValidRequest = verifyKey(rawBody, signature, timestamp, env.clientPublicKey);

    return isValidRequest;
}