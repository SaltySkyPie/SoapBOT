

async function start() {

    require('dotenv').config();
    global.shardId = -1

    const f = require('./functions');
    console.log(f.getTime() + "[-1][INFO] Starting Soap BOT...");
    const { ShardingManager } = require('discord.js');

    //await f.connectDB();
    await f.SQL("UPDATE users SET soap_status=0", []);

    const manager = new ShardingManager('./bot.js', {
        token: process.env.TOKEN,
        totalShards: "auto",
        respawn: true
    });

    manager.on('shardCreate', shard => console.log(`${f.getTime()}[-1][INFO] Shard ${shard.id} launched.`));

    manager.spawn()
        .then(shards => {
            shards.forEach(shard => {
                shard.on('message', message => {
                    console.log(`${f.getTime()}[-1][INFO] Shard ${shard.id} message : ${message._eval} : ${message._result}`);
                });
                shard.on('death', () => {
                    console.log(`${f.getTime()}[-1][INFO] Shard ${shard.id} died.`)
                });
            });
        })
        .catch(console.error);
}
start();