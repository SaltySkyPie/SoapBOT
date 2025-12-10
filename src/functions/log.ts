import chalk from "chalk";

type LogLevel = "INFO" | "ERROR" | "DEBUG" | "WARNING";

const levelColors: Record<LogLevel, (text: string) => string> = {
  INFO: chalk.greenBright,
  ERROR: chalk.red,
  DEBUG: chalk.gray,
  WARNING: chalk.yellow,
};

function formatTimestamp(): string {
  const now = new Date();
  const d = now.getDate();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  const h = now.getHours();
  const min = now.getMinutes().toString().padStart(2, "0");
  const s = now.getSeconds().toString().padStart(2, "0");
  return `${d}.${m}.${y} ${h}:${min}:${s}`;
}

function formatMessage(msg: unknown): string {
  if (msg instanceof Error) {
    // Return full stack trace for errors
    return msg.stack || `${msg.name}: ${msg.message}`;
  }
  if (typeof msg === "object" && msg !== null) {
    try {
      return JSON.stringify(msg, null, 2);
    } catch {
      return String(msg);
    }
  }
  return String(msg);
}

function log(type: LogLevel, shard: any, ...messages: unknown[]): void {
  const color = levelColors[type] ?? chalk.white;
  const timestamp = chalk.gray(`[${formatTimestamp()}]`);
  const shardTag = chalk.blueBright(`[${shard}]`);
  const levelTag = color(`[${type}]`);

  const formattedMessages = messages.map(formatMessage).join(" ");

  console.log(`${timestamp} ${shardTag} ${levelTag} ${color(formattedMessages)}`);
}

export default log;
