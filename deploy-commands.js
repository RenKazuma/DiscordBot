function Intizialecommands(client, token) {
	const { REST, Routes, Collection } = require("discord.js");
	const clientId = process.env.ClientId;
	const guildID = process.env.GuildId;
	const fs = require("node:fs");
	const path = require("node:path");

	client.commands = new Collection();
	const commandsPath = path.join(__dirname, "commands");
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js"));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
            console.log(`❕ ${command.data.name} erstellt!`)
		} else {
			console.log(
				`⚠  The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}

	console.log(`🌟 Commands wurden dem Bot zugewiesen!`);

	const commands = [];
	// Grab all the command files from the commands directory you created earlier
	const commandFilesCommand = fs
		.readdirSync("./commands")
		.filter((file) => file.endsWith(".js"));

	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
	}

	// Construct and prepare an instance of the REST module
	const rest = new REST({ version: "10" }).setToken(token);

	// and deploy your commands!
	(async () => {
		try {
			console.log(
				`🔄 Started refreshing ${commands.length} application (/) commands.`
			);
			// The put method is used to fully refresh all commands in the guild with the current set
			const data = await rest.put(                                                       
				Routes.applicationCommands(clientId), //global Routes.applicationCommands(clientId),, local = Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands }
			);

			console.log(
				`🔄 Successfully reloaded ${data.length} application (/) commands.`
			);
		} catch (error) {
			// And of course, make sure you catch and log any errors!
			console.error(error);
		}
	})();

}

module.exports = { Intizialecommands };
