import {
  CommandInteraction,
  GuildMember,
  Message,
  MessageEmbed,
} from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import getPoints from "../functions/getPoints.js";
import decodeNumber from "../functions/decodeNumber.js";
import setPoints from "../functions/setPoints.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    const success = Math.round(Math.random());
    const avatar = interaction.user.displayAvatarURL({ dynamic: true });

    const [side, bet] = [
      interaction.options.getString("side"),
      interaction.options.getString("bet"),
    ];

    if (!side || !bet) {
      interaction.reply({ content: `Pick either heads or tails... lol` });
      return false;
    }

    const points = await getPoints(interaction.user.id);
    let decoded =
      bet == "max" || bet == "all" ? points : await decodeNumber(bet!);

    if (!decoded) {
      interaction.reply({ content: `I can only slip on numbers...` });
      return false;
    }

    if (decoded > points) {
      interaction.reply({ content: `You don't even have that much 🧼...` });
      return false;
    }

    await setPoints(interaction.user.id, points - decoded);

    const flipping = new MessageEmbed()
      .setImage("https://skippies.fun/discord/soapbot/gifs/flip.gif")
      .setTitle(`${(interaction.member as GuildMember).displayName}`)
      .setAuthor({
        name: `${(interaction.member as GuildMember).displayName}'s coin flip`,
        iconURL: avatar,
      })
      .setDescription(
        `is betting 🧼**${decoded.toLocaleString()}** on ${side}.`
      )
      .setColor("#ff00e4");

    const reply = (await interaction.reply({
      embeds: [flipping],
      fetchReply: true,
    })) as Message;

    const result_image = success
      ? "https://skippies.fun/discord/soapbot/gifs/flip-success.gif"
      : side.toLowerCase() == "heads"
      ? "https://skippies.fun/discord/soapbot/gifs/heads-fail.gif"
      : "https://skippies.fun/discord/soapbot/gifs/tails-fail.gif";

    const result = new MessageEmbed()
      .setColor("#ff00e4")
      .setTitle(
        `${
          success
            ? `**${
                (interaction.member as GuildMember).displayName
              }** won the coin flip!`
            : `**${
                (interaction.member as GuildMember).displayName
              }** lost the coin flip!`
        }`
      )
      .setAuthor({
        name: `${(interaction.member as GuildMember).displayName}'s coin flip`,
        iconURL: avatar,
      })
      .setDescription(
        success
          ? `and earned 🧼**${(decoded * 2).toLocaleString()}**!`
          : `and lost 🧼**${decoded.toLocaleString()}**!`
      )
      .setImage(result_image);

    setTimeout(async () => {
      reply.edit({ embeds: [result] });
      if (success) {
        const user_points = await getPoints(interaction.user.id);
        await setPoints(interaction.user.id, user_points + 2 * decoded);
      }
    }, 2500);

    return true;
  }

  async getSlash(): Promise<
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
  > {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option
          .setName("side")
          .setDescription("Side you want to bet on")
          .setRequired(true)
          .addChoice("Heads", "heads")
          .addChoice("Tails", "tails")
      )
      .addStringOption((option) =>
        option
          .setName("bet")
          .setDescription("How much soap do you bet?")
          .setRequired(true)
      );
  }
}
