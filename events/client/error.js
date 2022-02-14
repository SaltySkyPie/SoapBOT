module.exports = (BotClient, functions, err) => {

    console.error(functions.getTime() + `[${global.shardId}][ERROR] ${err}`);
}