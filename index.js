/*
    Dependencies & Credentials
*/

/* Host a server that listens to port 8080
to receive constant wake-up HTTPS requests from UptimeRobot */
const keep_bot_alive = require("./keep_bot_alive.js")

/* Create bot client using Discord.js */
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

/* Load Discord Bot Token from environment variables (Secrets for Replit) */
const token = process.env["DISCORD_BOT_SECRET"];

/* Dynamically load commands */
const fs = require('node:fs');
const path = require('node:path');
// Read in all commmand files
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
// Load all valid commands into bot client
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath)l;
    // Set a new item in the Collection with the key as the command name
    // & the value as the exported module.
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}


/*
    Bot Logics
*/

// On bot startup
client.once(Events.ClientReady, c => {
    console.log("Faruzan senpai is awake!");
    console.log(`\tID: ${c.user.username}`);
});

// For each interaction event
client.on(Events.InteractionCreate, interaction => {
    // Exclude non-slash commands (e.g., MessageComponent interactions)
    if (!interaction.isChatInputCommand()) return;
    // Handler
    console.log(interaction);
    const command = interaction.client.commands.get(interaction.commandName);
    // Exclude undefined commands
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return
    }
    // Execute response to command
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true});
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true});
        }
    }
    
})



// For each new message in the server
client.on("messageCreate", (msg) => {
    console.log(`Detected message: \n\t${msg.author.username} : <${msg.author.id}>\n\t"${msg.content}"`)
    if (msg.author.id != client.user.id) {
        // msg.channel.send(msg.content.split("").reverse().join(""));
        if (msg.author.id === process.env[MY_USR_ID]) {
            msg.channel.send(`先叫声前辈听听吧~`);
        }
    }
});

// Log in bot to Discord
client.login(token);