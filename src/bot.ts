import { Client, GatewayIntentBits, Collection } from "discord.js";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import log from "./functions/log.js";
import prisma from "./lib/prisma.js";
import type { SoapClient } from "./core/index.js";
import { loadCommands, loadItems, loadEvents } from "./utils/loader.js";
import Command from "./core/Command.js";
import Item from "./core/Item.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
}) as SoapClient;

client.shardId = "-";
global.shardId = "-";
client.commands = new Collection();
client.events = new Collection();
client.items = new Collection();

async function registerCommands(commands: Command[]) {
  log("INFO", client.shardId, "Registering commands...");

  for (const command of commands) {
    // Upsert command to database (syncs cooldown and description from code)
    const dbCommand = await prisma.commands.upsert({
      where: { command: command.name },
      create: {
        command: command.name,
        description: command.description,
        cooldown: command.cooldown,
      },
      update: {
        description: command.description,
        cooldown: command.cooldown,
      },
    });

    command.id = Number(dbCommand.id);
    client.commands.set(command.name, command);

    log("INFO", client.shardId, `Command ${command.name}(${command.id}) registered.`);
  }

  log("INFO", client.shardId, "All commands registered.");
}

async function registerItems(items: Item[]) {
  log("INFO", client.shardId, "Registering items...");

  for (const item of items) {
    // Upsert item to database (syncs all properties from code, except stock)
    const dbItem = await prisma.items.upsert({
      where: { item_name: item.name },
      create: {
        item_name: item.name,
        description: item.description,
        buyable: item.buyable ? 1 : 0,
        sellable: item.sellable ? 1 : 0,
        useable: item.useable ? 1 : 0,
        multiple_usable: item.multipleUsable ? 1 : 0,
        shop: item.shop ? 1 : 0,
        activable: item.activable ? 1 : 0,
        targetable: item.targetable ? 1 : 0,
        buy_cost: item.buyCost,
        sell_cost: item.sellCost,
        active_duration: item.activeDuration,
      },
      update: {
        description: item.description,
        buyable: item.buyable ? 1 : 0,
        sellable: item.sellable ? 1 : 0,
        useable: item.useable ? 1 : 0,
        multiple_usable: item.multipleUsable ? 1 : 0,
        shop: item.shop ? 1 : 0,
        activable: item.activable ? 1 : 0,
        targetable: item.targetable ? 1 : 0,
        buy_cost: item.buyCost,
        sell_cost: item.sellCost,
        active_duration: item.activeDuration,
        // Note: stock is NOT updated - it's managed dynamically
      },
    });

    item.id = Number(dbItem.id);
    // Store with lowercase key for case-insensitive lookup
    client.items.set(item.name.toLowerCase(), item);
    log("INFO", client.shardId, `Item ${item.name}(${item.id}) registered.`);
  }

  log("INFO", client.shardId, "All items registered.");
}

function registerEvents(events: Record<string, Function>) {
  log("INFO", client.shardId, "Registering events...");

  for (const [eventName, handler] of Object.entries(events)) {
    client.on(eventName, (handler as any).bind(null, client));
    log("INFO", client.shardId, `Event ${eventName} registered.`);
  }

  log("INFO", client.shardId, "All events registered.");
}

async function start() {
  // Dynamically load all commands, items, and events
  const [commands, items, events] = await Promise.all([
    loadCommands(path.join(__dirname, "commands")),
    loadItems(path.join(__dirname, "items")),
    loadEvents(path.join(__dirname, "events")),
  ]);

  await registerCommands(commands);
  await registerItems(items);
  registerEvents(events);

  log("INFO", client.shardId, "Launching client...");
  client.login(process.env.TOKEN);
}

start();
