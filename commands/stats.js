const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
    name: 'stats',
    aliases: [],
    slash: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Soap BOT stats'),
    async execute(message, args, BotClient, functions) {

        const [guilds, economy_wallet, economy_bank, economy_max_bank, users] = await Promise.all([
            functions.getServerCount(BotClient).catch(() => { return "loading..." }),
            functions.SQL("SELECT SUM(points) AS sumpoints FROM users"),
            functions.SQL("SELECT SUM(stash) AS sumpoints FROM users"),
            functions.SQL("SELECT SUM(max_stash) AS sumpoints FROM users"),
            functions.SQL("SELECT COUNT(id) AS countusers FROM users")
        ])
        message.reply(`🧼**Soap BOT** is in **${guilds}** servers with **${users[0].countusers.toLocaleString()}** users. Total soap in hands: **🧼${economy_wallet[0].sumpoints.toLocaleString()}**. Total soap in stashes: **🧼${economy_bank[0].sumpoints.toLocaleString()}**. Total soap in hands and stashes combined: 🧼**${(economy_wallet[0].sumpoints + economy_bank[0].sumpoints).toLocaleString()}**. Total soap that can be stored in stash: **🧼${economy_max_bank[0].sumpoints.toLocaleString()}**. This server is running on **Shard ${message.guild.shardId}**`);
    }
}
