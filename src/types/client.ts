import { Client, Collection } from "discord.js";

interface SoapClient extends Client {
    commands: Collection<string, any>,
    events: Collection<any, any>,
    items: Collection<any, any>,
    shardId: number|string
}



export default SoapClient