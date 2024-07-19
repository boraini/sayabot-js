import { ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js";

const onMessageData = new ContextMenuCommandBuilder()
    .setName("What does Breadman say?")
    .setType(ApplicationCommandType.Message);

function result(symbols, parsed, rest) {
    const value = { ok: true, parsed, rest, capture(fn) {fn(parsed); return value;}, then(fn) {return fn(symbols, rest)} };
    return value;
}

function error() {
    const value = { ok: false, capture(fn) {fn(null); return value;}, then(fn) {return value} };
    return value;
}

function parseNextChar(symbols, inp) {
    if (inp.length > 0) {
        return result(symbols, inp.substring(0, 1), inp.substring(1));
    } else {
        return error();
    }
}

function parseSpace(symbols, inp) {
    if (inp.length == 0) return result(symbols, "", inp);
    let ptr = 0;

    while (/^\s$/.test(inp[ptr])) {
        ptr++;
    }

    return result(symbols, "", inp.substring(ptr));
}

function parseSymbol(symbols, inp) {
    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        if (inp.startsWith(symbol)) {
            return result(symbols, i, inp.substring(symbol.length));
        }
    }

    return error();
}

const parseChar = char => (symbols, inp) => {
    if (inp.startsWith(char)) {
        return result(symbols, char, inp.substring(char.length));
    }

    return error();
}

const parseAny = (...parsers) => (symbols, inp) => {
    for (let parser of parsers) {
        const result = parser(symbols, inp);

        if (result.ok) {
            return result;
        }
    }

    return error();
}

const parseNTimes = (n, parser) => (symbols, inp) => {
    if (n == 0) return result(symbols, [], inp);
    const captures = [];
    let currentState = parser(symbols, inp).capture(v => captures.push(v));
    for (let i = 1; i < n; i++) {
        currentState = currentState.then(parser).capture(v => captures.push(v));
    }

    if (currentState.ok) {
        return result(symbols, captures, currentState.rest);
    } else {
        return error();
    }
}

const keepParsing = parser => (symbols, inp) => {
    const captures = [];
    let rest = inp;
    let currentState = parser(symbols, inp);
    if (!currentState.ok) return result(symbols, captures, inp);
    currentState.capture(v => captures.push(v));
    rest = currentState.rest;
    while (true) {
        currentState = currentState.then(parser);
        if (currentState.ok) {
            currentState.capture(v => captures.push(v));
            rest = currentState.rest;
        } else {
            return result(symbols, captures, rest)
        }
    }
}

function parseSingleLetter(symbols, inp) {
    const parsing = parseSpace(symbols, inp).then(parseNextChar);

    if (parsing.ok) {
        return result(symbols, { isLeaf: true, value: parsing.parsed }, parsing.rest);
    } else {
        return parsing;
    }
}

function parseCipherNode(symbols, inp) {
    let children;
    const parsing = parseSpace(symbols, inp)
        .then(parseChar("("))
        .then(parseNTimes(symbols.length - 1, parseAny(parseCipherNode, parseSingleLetter)))
        .capture(c => children = c)
        .then(parseSpace)
        .then(parseChar(")"))
    if (parsing.ok) {
        return result(symbols, {isLeaf: false, children}, parsing.rest)
    } else {
        return error();
    }
}

function parseCipher(inp) {
    if (inp.indexOf("=>") != -1) {
        // version 1

        const runes = [":leg:", ":french_bread:", ":raised_back_of_hand:", "  "];

        const cipherPart = inp.substring(inp.indexOf("=>") + 2);

        const parsing = parseAny(parseCipherNode, parseSingleLetter)(runes, cipherPart);

        if (parsing.ok) {
            return [runes, runes.length - 1, parsing.parsed];
        } else {
            return null;
        }
    }

    return null;
}

function parseEncodedMessage(symbols, inp) {
    if (inp.indexOf("=>") != -1) {
        // version 1

        const lookingFor = "Encoded Message:"
        let lookingForEnd = inp.indexOf(lookingFor);
        if (lookingForEnd != -1) {
            lookingForEnd += lookingFor.length;
        } else {
            return null;
        }

        let messageStart = inp.indexOf(":", lookingForEnd);
        if (messageStart == -1) {
            return [];
        }

        const parsing = keepParsing(parseSymbol)(symbols, inp.substring(messageStart));

        return parsing.parsed;
    }

    return null;
}

function decode(space, tree, msg) {
    let currentTree = tree;
    let result = "";
    if (tree.isLeaf) {
        return "You should be able to decipher this yourself.";
    }

    for (let num of msg) {
        if (num == space) {
            result += " ";
            continue;
        }
        currentTree = currentTree.children[num];

        if (currentTree.isLeaf) {
            result += currentTree.value;
            currentTree = tree;
        }
    }
    
    return result;
}

async function executeOnMessage(interaction) {
    const messageText = interaction.targetMessage.content;
    const pc = parseCipher(messageText);
    if (pc == null) {
        interaction.reply("This doesn't seem to be a Breadman message. I couldn't parse the cipher.");
        return;
    }

    const [symbols, space, tree] = pc;

    const msg = parseEncodedMessage(symbols, messageText);
    if (msg == null) {
        interaction.reply("This doesn't seem to be a Breadman message. I couldn't parse the encoded message.");
        return;
    }

    const result = decode(space, tree, msg);

    interaction.reply(result);
}

export default { onMessage: { data: onMessageData, executeOnMessage } };
