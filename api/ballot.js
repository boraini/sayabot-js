import { handleBallots } from "../ballot-engine/handle-ballots.js";

export default async function handle() {
    await handleBallots();

    return new Response("OK");
}
