import { Client, Collection } from "discord.js";
import type Command from "./Command.js";
import type Item from "./Item.js";

export default interface SoapClient extends Client {
  commands: Collection<string, Command>;
  events: Collection<string, any>;
  items: Collection<string, Item>;
  shardId: number | string;
}
