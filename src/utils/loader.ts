import { readdir } from "fs/promises";
import { pathToFileURL } from "url";
import path from "path";
import type Command from "../core/Command.js";
import type Item from "../core/Item.js";
import type { SoapClient } from "../core/index.js";

/**
 * Dynamically loads all Command classes from a directory.
 * Scans for .ts/.js files, imports them, and instantiates classes that extend Command.
 */
export async function loadCommands(dir: string): Promise<Command[]> {
  const commands: Command[] = [];
  const files = await readdir(dir);

  for (const file of files) {
    if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;
    if (file === "index.ts" || file === "index.js") continue;

    const modulePath = path.join(dir, file);
    const module = await import(pathToFileURL(modulePath).href);
    const ModuleClass = module.default;

    if (ModuleClass && typeof ModuleClass === "function") {
      const instance = new ModuleClass();
      if ("name" in instance && "execute" in instance && "getSlash" in instance) {
        commands.push(instance);
      }
    }
  }

  return commands;
}

/**
 * Dynamically loads all Item classes from a directory.
 * Scans for .ts/.js files, imports them, and instantiates classes that extend Item.
 */
export async function loadItems(dir: string): Promise<Item[]> {
  const items: Item[] = [];
  const files = await readdir(dir);

  for (const file of files) {
    if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;
    if (file === "index.ts" || file === "index.js") continue;

    const modulePath = path.join(dir, file);
    const module = await import(pathToFileURL(modulePath).href);
    const ModuleClass = module.default;

    if (ModuleClass && typeof ModuleClass === "function") {
      const instance = new ModuleClass();
      if ("name" in instance && "execute" in instance) {
        items.push(instance);
      }
    }
  }

  return items;
}

/**
 * Event handler function type
 */
export type EventHandler = (client: SoapClient, ...args: any[]) => Promise<void> | void;

/**
 * Dynamically loads all event handlers from a directory.
 * Scans for .ts/.js files, imports them, and returns a map of event name to handler.
 * The filename (without extension) is used as the event name.
 */
export async function loadEvents(dir: string): Promise<Record<string, EventHandler>> {
  const events: Record<string, EventHandler> = {};
  const files = await readdir(dir);

  for (const file of files) {
    if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;
    if (file === "index.ts" || file === "index.js") continue;

    const modulePath = path.join(dir, file);
    const module = await import(pathToFileURL(modulePath).href);
    const handler = module.default;

    if (typeof handler === "function") {
      // Use filename without extension as event name
      const eventName = path.basename(file, path.extname(file));
      events[eventName] = handler;
    }
  }

  return events;
}
