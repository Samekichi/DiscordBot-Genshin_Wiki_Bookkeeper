const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName(`fortune`)
        .setDescription('Yae Miko is watching you...'),

    async execute(interaction) {

        // Initialize all possible fortunes
        const fortunes = ["大吉", "中吉", "小吉", "吉", "半吉", "末吉", "末小吉", "凶", "小凶", "半凶", "末凶", "大凶"];
        const numFortunes = fortunes.length;
        // Fetch data for randInt generator
        const username = interaction.user.username;
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const intDate = parseInt(`${year}${month}${day}`);  // 8-digit base 10
        // Generate random index
        const fortuneIndex = generateRandomIndex(username, intDate, numFortunes);

        await interaction.reply(`**${interaction.user.globalName}**，你的今日运势为**\`${fortunes[fortuneIndex]}\`**。${/吉/.test(fortunes[fortuneIndex]) ? "GLHF！" : "需要智慧与美貌兼具的神子大人为你驱驱邪么w"}`);
    }
}


/* Helper Functions */
function generateRandomIndex(username, intDate, numItems) {
    // Generate seed using given parameters
    const seed = generateSeed(username, intDate);
    // Compute "random" index using the seed
    let x = Math.sin(seed) * 10000;  // x in [-10000, 10000]
    x -= Math.floor(x);  // x in [0, 1)
    return Math.floor(x * numItems);  // x in [0, numItems)
}

function generateSeed(username, intDate) {
    let seed = intDate ?? 20010222;
    for (const char of username) {
        seed += char.charCodeAt(0);
    }
    return seed;
}