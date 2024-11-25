/* Create DB ORM */
const { sequelize, Users } = require("./models");
const isDev = process.env.NODE_ENV === "dev";
console.log("Sequelize config:", sequelize.config);

/* Connect DB */
(async () => {
    try {
        // connect to database
        await sequelize.authenticate();
        console.log("Database connected!");
        // apply migration
        await sequelize.sync({force: false, alter: true});  // for convenience of dev, should move to `dbInit.js + migration files` in the future
        console.log("Database models synchronized!");
    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exit(1);
    }
})();


/* Create bot client using Discord.js */
const { Client, Collection, Events, GatewayIntentBits, CommandInteraction } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});


/* Load Discord Bot Token from config */
const path = require('node:path');
require('dotenv-safe').config({
    path: path.resolve(__dirname, `.env.${process.env.NODE_ENV || "dev"}`),
    example: path.resolve(__dirname, `.env.example`),
});
const token = process.env.DISCORD_TOKEN;
if (!process.env.DISCORD_TOKEN) {
    console.error("DISCORD_TOKEN is missing. Please check your environment variables.");
    process.exit(1);
}


/* Dynamically load commands */
const fs = require('node:fs');
client.commands = new Collection();
// Read in all command categories (folders)
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
// Read in all commmand files
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    // Load all valid commands into bot client
    for (const file of commandsFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name
        // & the value as the exported module.
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

/* Initialize a collection to store command cooldowns per user */
client.cooldowns = new Collection();




/*
    Bot Logics
*/



// On bot startup
client.once(Events.ClientReady, c => {
    console.log("Faruzan senpai is awake!");
    console.log(`\tID: ${c.user.username}`);
});


// For each interaction event
client.on(Events.InteractionCreate, async interaction => {

    // Exclude non-slash commands (e.g., MessageComponent interactions)
    if (!interaction.isChatInputCommand()) return;

    // Start handle
    console.log(interaction);
    const command = client.commands.get(interaction.commandName);

    // Exclude undefined commands
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return
    }

    // Exclude commands still cooling down
    const { cooldowns } = client;  // Collection `cooldowns`: { <Key> = command name : <Value> = Collections associating user's id (key) -> last time this user used that command (value) }

    if (!cooldowns.has(command.data.name)) {  // command never used before
        cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 1;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;  // in ms

    if (timestamps.has(interaction.user.id)) {  // if the user has called this command before, check if cooldown is over
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        if (now < expirationTime) {  // still in cooldown
            const expiredTimestamp = Math.round(expirationTime / 1000);
            return interaction.reply({
                content: `Command \`${command.data.name}\` still cooling down. Try again <t:${expiredTimestamp}:R>.`,
                ephemeral: true
            })
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount)


    // Execute response to command
    try {

        // execution
        await command.execute(interaction);
        // database log
        await Users.increaseCommandCount(interaction.user.id);

    } catch (error) {

        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }

})


// For each new message in the server
// client.on("messageCreate", (msg) => {
//     if (msg.author.id != client.user.id) {
//         console.log(`\n==== Message Detected ====
//                     \n\t${msg.author.username} : <${msg.author.id}>
//                     \n\t"${msg.content}"`)
//         // msg.channel.send(msg.content.split("").reverse().join(""));
//         if (msg.author.id === process.env["MY_USR_ID"]) {
//             // msg.channel.send(`先叫声前辈听听吧~`);
//         }
//     }
// });


// Log in bot to Discord
client.login(token);