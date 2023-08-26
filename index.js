const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const token = process.env["DISCORD_BOT_SECRET"];

client.on("ready", () => {
  console.log("I'm in");
  console.log(client.user.username);
});

client.on("messageCreate", (msg) => {
  console.log(`Detected message: \n\t${msg.author.username} : <${msg.author.id}>\n\t"${msg.content}"`)
  if (msg.author.id != client.user.id) {
    // msg.channel.send(msg.content.split("").reverse().join(""));
    if (msg.author.id === msg.author.id) {
      msg.channel.send(`先叫声前辈听听吧~`);
    }
  }
});

client.login(token);