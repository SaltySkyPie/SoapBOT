module.exports = {
    name: 'stats',
    aliases: [],
    cooldown: 0,
    description: 'Basic stats command',
    async execute(message, args, BotClient, functions) {

        const [guilds, economy_wallet, economy_bank, users] = await Promise.all([
            functions.getServerCount(BotClient).catch(() => {return "loading..."}),
            functions.SQL("SELECT SUM(points) AS sumpoints FROM users"),
            functions.SQL("SELECT SUM(stash) AS sumpoints FROM users"),
            functions.SQL("SELECT COUNT(id) AS countusers FROM users")
        ])
        message.reply(`Soap BOT is in **${guilds}** servers with **${users[0].countusers.toLocaleString()}** users. Total economy value is 🧼**${(economy_wallet[0].sumpoints + economy_bank[0].sumpoints).toLocaleString()}**. This server is running on **Shard ${message.guild.shardId}**`);
    }
}