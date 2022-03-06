module.exports = async (BotClient, functions) => {
        BotClient.user.setPresence({ activities: [{ name: `soap help | soapbot.net` }], status: 'online' });
}