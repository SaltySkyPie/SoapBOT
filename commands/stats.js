module.exports = {
    name: 'stats',
    aliases: [],
    cooldown: 0,
    description: 'Basic stats command',
    async execute(message, args, BotClient, functions) {
        let guilds = await functions.getServerCount(BotClient).catch(() => {return "loading..."});
        let economy_wallet = await functions.SQL("SELECT SUM(points) AS sumpoints FROM users");
        let economy_bank = await functions.SQL("SELECT SUM(stash) AS sumpoints FROM users");
        let users = await functions.SQL("SELECT COUNT(id) AS countusers FROM users");
        message.reply(`Soap BOT is in **${guilds}** servers with **${users[0].countusers.toLocaleString()}** users. Total economy value is 🧼**${(economy_wallet[0].sumpoints + economy_bank[0].sumpoints).toLocaleString()}**. This server is running on **Shard ${message.guild.shardId}**`);
    }
}