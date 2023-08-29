const { SlashCommandBuilder, Collection } = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
    // cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('server_time')
        .setDescription('Shows the selected server\'s local time.')
        .addStringOption(option =>
            option
                .setName('server')
                .setDescription('Region of the server.')
                .setRequired(true)
                .addChoices(
                    { name: '天空岛/世界树', value: "cn" },
                    { name: 'America', value: "us" },
                    { name: 'Europe', value: "eu" },
                    { name: 'Asia', value: "as" }
                )
        ),
    async execute(interaction) {
        // Genshin servers and associated time zones
        const serverTzCodes = new Collection([
            ['cn', 'Asia/Shanghai'],
            ['as', 'Asia/Shanghai'],
            ['us', 'America/New_York'],
            ['eu', 'Europe/Moscow']
        ]);
        // Get the selected time zone
        const pickedServer = interaction.options.getString('server');
        const tzCode = serverTzCodes.get(pickedServer);
        // 
        const date = moment().tz(tzCode).format('MMMM Do YYYY, h\h:mm:ss a');

        await interaction.reply(`Local ${pickedServer.toUpperCase()} server time is ${date}.`);
    }
}