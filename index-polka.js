import polka from "polka";
import bodyParser from "body-parser";
import { handler } from "./index.mjs";

polka().use(bodyParser.text({
    type: ["application/json", "text/plain", "text/json"],
})).post("/", async (req, res) => {
    const response = await handler(req);
    console.log(response);
    if (response == 200 || response == 401) {
        res.statusCode = response;
        res.end("Done");
    } else {
        if (response.headers) Object.entries(response.headers).forEach(([k, v]) => res.setHeader(k, v));
        console.log(response.body);
        res.end(response.body);
    }
}).listen(3000, err => {
    if (err) throw err;
    else console.log("Server listening on port 3000.");
});