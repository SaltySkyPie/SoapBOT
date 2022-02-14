module.exports = async (BotClient, functions, debug) => {
    let id = global.shardId
    if(id === undefined || id === null) [
        id = "-"
    ]
    console.log(functions.getTime() + `[${id}][DEBUG] ${debug}`);
}