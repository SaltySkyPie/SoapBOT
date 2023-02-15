import SQL from "./SQL.js";

export default async function getBaseValue(name: string) {
  const content = await SQL("SELECT content FROM base_values WHERE value=?", [
    name,
  ]);
  return content.length ? content[content.length - 1].content : null;
}
