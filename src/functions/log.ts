import chalk from "chalk";
import getTime from "./getTime.js";

function log(type: string, option: any, ...log: any) {
  let typeColor;

  switch (type) {
    case "INFO":
      typeColor = chalk.greenBright;
      break;
    case "SQL":
      typeColor = chalk.cyanBright;
      break;
    case "ERROR":
      typeColor = chalk.red;
      break;
    case "DEBUG":
      typeColor = chalk.blackBright;
      break;
    case "WARNING":
      typeColor = chalk.yellow;
      break;
    default:
      typeColor = chalk.whiteBright;
      break;
  }

  console.log(
    chalk.yellowBright(getTime()),
    chalk.blueBright(`[${option}]`),
    typeColor(`[${type}]`),
    typeColor(...log)
  );
}

export default log;
