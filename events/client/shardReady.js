module.exports = async (BotClient, functions, id) => {
    global.shardId = id;
    console.log(functions.getTime() + `[${id}][INFO] Shard ${id} is now online!`);
    //await functions.connectDB();
}