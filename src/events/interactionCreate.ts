import { Interaction, EmbedBuilder, MessageFlags } from "discord.js";
import { Command, SoapClient, SOAP_COLOR } from "../core/index.js";
import checkBan from "../functions/checkBan.js";
import checkCooldown from "../functions/checkCooldown.js";
import checkUserCreation from "../functions/checkUserCreation.js";
import log from "../functions/log.js";
import { getCurrentTimestamp } from "../utils/time.js";
import putOnCooldown from "../functions/putOnCooldown.js";
import prisma from "../lib/prisma.js";
import updateAvatar from "../functions/updateAvatar.js";
import updateTag from "../functions/updateTag.js";

export default async function execute(client: SoapClient, interaction: Interaction) {
  await checkUserCreation(interaction.user.id);

  if (interaction.isCommand()) {
    const i = interaction.isChatInputCommand() ? interaction : (interaction as any);

    const command: Command | undefined = client.commands.get(interaction.commandName);
    if (!command) return;

    const u = interaction.isChatInputCommand() ? i.options.getUser("user") : null;
    await Promise.all([
      u ? checkUserCreation(u.id) : null,
      prisma.active_items.deleteMany({
        where: { expiration_date: { lte: getCurrentTimestamp() } },
      }),
    ]);

    const [cooldown, ban] = await Promise.all([
      checkCooldown(i.user.id, command.id),
      checkBan(i.user.id),
    ]);

    if (ban) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(SOAP_COLOR)
            .setTitle("You are banned!")
            .setDescription(`for **${ban}**`),
        ],
        flags: MessageFlags.Ephemeral,
      });
      log(
        "INFO",
        global.shardId,
        `${i.user.tag} issued command /${command.name} in ${i.guild?.name} but was banned.`
      );
      return;
    }

    if (cooldown) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(SOAP_COLOR)
            .setTitle(`Slow down bruh...`)
            .setDescription(
              `Please wait **${cooldown}** before running **/${command.name}** again.`
            ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      log(
        "INFO",
        global.shardId,
        `${i.user.tag} issued command /${command.name} in ${i.guild?.name} but was on cooldown.`
      );
      return;
    }

    const result = await command.execute(client, i);

    if (result) {
      await putOnCooldown(i.user.id, command.id);
    }

    log(
      "INFO",
      global.shardId,
      `${i.user.tag} issued command /${command.name} in ${i.guild?.name}.`
    );
  }

  updateTag(interaction.user.id, interaction.user.tag);
  updateAvatar(interaction.user.id, interaction.user.displayAvatarURL());
}
