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
        // Get local time
        const now = moment.tz(tzCode)
        // Get local time of next game day
        let next4AM;
        if (now.hour() < 4) {  // get today's 4 a.m. 
            next4AM = now.clone().startOf('day').add(4, 'hours');
        } else {  // get tommorrow's 4 a.m.
            next4AM = now.clone().add(1, 'days').startOf('day').add(4, 'hours');
        }
        // Compute the remaining time to the next game day
        const remainingMilliseconds = next4AM.diff(now);
        const remainingSeconds = Math.floor(remainingMilliseconds / 1000);
        const sec = remainingSeconds % 60;
        const min = (remainingSeconds - sec) / 60 % 60;
        const hr = Math.floor(remainingSeconds - sec - min * 60) % 3600;
        // Reply with formatted local time
        const formattedNow = now.format('HH:mm:ss, MM/DD (ddd), yyyy');
        await interaction.reply(`- Local ${pickedServer.toUpperCase()} server time is ${formattedNow}.\n- Next game day in ${hr}:${min}:${sec}.`);
    }
}