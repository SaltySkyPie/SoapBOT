import chalk from "chalk";
import { formatLogTimestamp } from "../utils/time.js";

type LogLevel = "INFO" | "SQL" | "ERROR" | "DEBUG" | "WARNING";

const levelColors: Record<LogLevel, typeof chalk.greenBright> = {
  INFO: chalk.greenBright,
  SQL: chalk.cyanBright,
  ERROR: chalk.red,
  DEBUG: chalk.blackBright,
  WARNING: chalk.yellow,
};

function log(type: string, option: any, ...messages: any[]): void {
  const typeColor = levelColors[type as LogLevel] ?? chalk.whiteBright;

  console.log(
    chalk.yellowBright(formatLogTimestamp()),
    chalk.blueBright(`[${option}]`),
    typeColor(`[${type}]`),
    typeColor(...messages)
  );
}

export default log;
