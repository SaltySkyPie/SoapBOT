module.exports = async (BotClient, functions) => {
    const a = function(BotClient) {
        BotClient.user.setPresence({ activities: [{ name: 'BEND OVER!!!' }], status: 'online' });
        setTimeout(() => {
            b(BotClient);
        }, 300000);
    }
    const b = function(BotClient) {
        BotClient.user.setPresence({ activities: [{ name: `${global.prefix} help` }], status: 'online' });
        setTimeout(() => {
            c(BotClient);
        }, 300000);
    }
    const c = function(BotClient) {
        BotClient.user.setPresence({ activities: [{ name: 'Soapy!' }], status: 'online' });
        setTimeout(() => {
            d(BotClient);
        }, 300000);
    }
    const d = function(BotClient) {
        BotClient.user.setPresence({ activities: [{ name: 'https://soapbot.net' }], status: 'online' });
        setTimeout(() => {
            a(BotClient);
        }, 300000);
    }
    a(BotClient);

}