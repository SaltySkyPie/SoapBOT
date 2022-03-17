/*
  _________                     __________ ___________________
 /   _____/ _________  ______   \______   \\_____  \__    ___/
 \_____  \ /  _ \__  \ \____ \   |    |  _/ /   |   \|    |   
 /        (  <_> ) __ \|  |_> >  |    |   \/    |    \    |   
/_______  /\____(____  /   __/   |______  /\_______  /____|   
        \/           \/|__|             \/         \/         
*/

import 'dotenv/config'
import SQL from './functions/SQL.js'
import log from './functions/log.js'
import { ShardingManager } from 'discord.js'


process
    .on('unhandledRejection', (e) => {
        log("ERROR", -1, e)
    })
    .on('uncaughtException', (e) => {
        log("ERROR", -1, e)
    })


log("INFO", -1, "Starting Soap BOT...")

const manager = new ShardingManager('bot.js', {
    token: process.env.TOKEN,
    totalShards: "auto",
    respawn: true,
    mode: "process"
})


manager.on('shardCreate', (shard) => { log("INFO", -1, `Shard ${shard.id} launched.`) })

manager.spawn({ timeout: 30000, delay: 1000 })
    .then((shards) => {
        shards.forEach(shard => {
            shard.on('message', message => {
                log("INFO", -1, `Shard ${shard.id} message : ${message._eval} : ${message._result}`);
            });
            shard.on('death', () => {
                log("INFO", -1, `Shard ${shard.id} died.`)
            });
        })
    })

