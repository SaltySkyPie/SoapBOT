import { GuildMember, User } from "discord.js";

export default async function dmUser(user: GuildMember | User, message: any) {
  try {
    await user.createDM(true);
    user.send(message);
    return;
  } catch (_e) {
    return;
  }
}
