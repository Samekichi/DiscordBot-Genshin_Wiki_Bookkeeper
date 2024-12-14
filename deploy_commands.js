const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const path = require('node:path');
const { loadCommandsRecursive } = require('./utils/commandsLoader');


const commands = [];

/* Load all commands from the commands directory */
const commandsFolderPath = path.join(__dirname, 'commands');
const loadedCommands = loadCommandsRecursive(commandsFolderPath);

for (const { command, fullPath } of loadedCommands) {
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${fullPath} is missing a required "data" or "execute" property.`);
    }
}

console.log(commands);
/* Construct and prepare an instance of the REST module */
const rest = new REST().setToken(token);
/* and deploy all commands! */
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set.
        const data = await rest.put(
            // Routes.applicationGuildCommands(clientId, guildId),
            Routes.applicationCommands(clientId),
            { body: commands },
        )

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        process.exit(0);
    } catch (error) {
        console.log(error);
    }
})();

