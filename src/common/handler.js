const fs = require("fs");
const constants = require("@common/constants");
const path = require("path");
const logger = require("./logger");

const commands = [];

function init() {
    const commandDir = path.join(constants.ROOT_DIRECTORY, "src", "commands");
    readCommandsFromDirectory(commandDir);
    logCommands();
}

function readCommandsFromDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            readCommandsFromDirectory(filePath); // recursively read subdirectories
        } else {
            if (file.endsWith('.js')) {
                const cmd = require(filePath);
                commands.push(cmd);
            }
        }
    }
}

function logCommands() {
    logger.info("Registered Commands:");
    commands.forEach(cmd => {
        console.log(`${cmd.name}: ${cmd.description}`);
    });
}

function getCommands() {
    return commands;
}

async function execute(message) {
    const messageContent = message.content;
    const whiteSpaceIdx = messageContent.indexOf(' ');
    const cmdName = messageContent.substring(1, whiteSpaceIdx == -1 ? messageContent.length : whiteSpaceIdx)
                                  .toLowerCase().trim();

    let cmdIdx = -1;

    for (let i = 0; i < commands.length; i++) {
        if (commands[i].name == cmdName || (commands[i].aliases && commands[i].aliases.includes(cmdName))) {
            cmdIdx = i;
            break;
        }
    }

    if (cmdIdx == -1) {
        return null;
    }

    const regex = new RegExp(/"([^"]+)"|\S+/g);
    const arguments = messageContent.match(regex).map(x => {
        if (x.startsWith('"')) {
            return x.slice(1, -1);
        }
        return x;
    });

    arguments.shift(); // removes the first element

    const { errorCode, data } = await commands[cmdIdx].process(message, arguments);
    if (errorCode != constants.PROCESS_SUCCESS) {
        return await commands[cmdIdx].error(message, data);
    }

    return await commands[cmdIdx].execute(message, data);
}

module.exports = {
    init: init,
    execute: execute,
    getCommands: getCommands
}