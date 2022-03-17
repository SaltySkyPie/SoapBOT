import SQL from "./SQL.js";


export default async function getItemByName(name: string) {
    return (await SQL("SELECT * FROM items WHERE item_name=?", [name]))[0]
}