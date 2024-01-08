import polka from "polka";
import bodyParser from "body-parser";
import handler from "./api/interactions.js";

polka().use(bodyParser.text({
    type: ["application/json", "text/plain", "text/json"],
})).post("/", /** @type {(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) => Promise<void>} */ async (req, res) => {
    const myRes = {
        status(n) {
            console.log("SET STATUS " + n);
            res.statusCode = n;
        },
        send(str) {
            console.log("RES END ", str);
            res.end(str);
        },
        json(obj) {
            console.log(obj);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(obj));
        },
        setHeader(k, v) {
            res.setHeader(k, v);
        },
    }
    req.rawBody = req.body;
    req.body = JSON.parse(req.body);
    handler(req, myRes);
}).listen(3000, err => {
    if (err) throw err;
    else console.log("Server listening on port 3000.");
});