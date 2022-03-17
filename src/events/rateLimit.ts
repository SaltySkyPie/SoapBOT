import { RateLimitData } from "discord.js";
import log from "../functions/log.js";
import SoapClient from "../types/client";


export default async function execute(client: SoapClient, rateLimitData: RateLimitData) {
    log("WARNING", client.shardId, [`Client reached it's rate limit. `, rateLimitData])
}