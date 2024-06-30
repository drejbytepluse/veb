const constants = require("@common/constants");
const handler = require("@common/handler");
const responses = require("@common/responses");
const discordConfig = require("@config/discord");
const modules = require("@config/modules");

async function onProcess(message, args) {
	const data = {};
	if (args.length > 0) {
		data.command = args[0].toLowerCase();
	}

	return { errorCode: constants.PROCESS_SUCCESS, data: data };
}

async function onExecute(message, data) {
	if (!data.command) {
		const modulesEmbed = responses.info(message)
		.setTitle("Available modules")
		.addFields(modules.map(x => {
			return { name: x.name.toUpperCase(), value: x.description, inline: true }
		}))

		return { embeds: [modulesEmbed] };
	}

	for (let i = 0; i < modules.length; i++) {
		if (modules[i].name == data.command) {
			data.module = data.command;
			data.command = null;
		}
	}

	const commands = handler.getCommands();

	if (data.module) {
		const moduleCommands = commands.filter(x => x.module == data.module);

		const moduleEmbed = responses.info(message)
		.addFields(moduleCommands.map(x => {
			return { name: x.name, value: x.description, inline: true }
		}));

		return { embeds: [moduleEmbed] }
	}

	for (let i = 0; i < commands.length; i++) {
		if (commands[i].name == data.command || commands[i].aliases.includes(data.command)) {
			const commandEmbed = responses.info(message)
			.setTitle(commands[i].name)
			.setDescription(commands[i].description)
			.addFields(
				{ name: "Usage", value: `${discordConfig.prefix}${commands[i].name} ${commands[i].usage}` }
			);

			return { embeds: [commandEmbed] };
		}
	}

    return responses.moduleNotFound();
}

async function onError(message, data) {}

module.exports = {
	module: "",
    name: "help",
    aliases: [],
    usage: "<module | command>",
	description: "show's all available commands",
    process: onProcess,
    execute: onExecute,
    error: onError
}