import { ChatInputCommandInteraction, GuildMember, Message } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import getPoints from "../functions/getPoints.js";
import parseAmount from "../functions/parseAmount.js";
import setPoints from "../functions/setPoints.js";

export default class Coinflip extends Command {
  readonly name = "coinflip";
  readonly description = "Flip a coin and bet your soap";
  readonly cooldown = 10; // 10 seconds

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const success = Math.round(Math.random());
    const avatar = interaction.user.displayAvatarURL();
    const member = interaction.member as GuildMember;

    const [side, bet] = [
      interaction.options.getString("side"),
      interaction.options.getString("bet"),
    ];

    if (!side || !bet) {
      interaction.reply({ content: `Pick either heads or tails... lol` });
      return false;
    }

    const points = await getPoints(interaction.user.id);
    const decoded = parseAmount(bet, points);

    if (decoded === null || decoded <= 0) {
      interaction.reply({ content: `I can only slip on positive numbers...` });
      return false;
    }

    if (decoded > points) {
      interaction.reply({ content: `You don't even have that much 🧼...` });
      return false;
    }

    await setPoints(interaction.user.id, points - decoded);

    const flipping = this.createEmbed()
      .setImage("https://cdn.saltyskypie.com/soapbot/gifs/flip.gif")
      .setTitle(`${member.displayName}`)
      .setAuthor({ name: `${member.displayName}'s coin flip`, iconURL: avatar })
      .setDescription(`is betting 🧼**${decoded.toLocaleString()}** on ${side}.`);

    const reply = (await interaction.reply({
      embeds: [flipping],
      fetchReply: true,
    })) as Message;

    const result_image = success
      ? "https://cdn.saltyskypie.com/soapbot/gifs/flip-success.gif"
      : side.toLowerCase() === "heads"
        ? "https://cdn.saltyskypie.com/soapbot/gifs/heads-fail.gif"
        : "https://cdn.saltyskypie.com/soapbot/gifs/tails-fail.gif";

    const result = this.createEmbed()
      .setTitle(
        success
          ? `**${member.displayName}** won the coin flip!`
          : `**${member.displayName}** lost the coin flip!`
      )
      .setAuthor({ name: `${member.displayName}'s coin flip`, iconURL: avatar })
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

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option
          .setName("side")
          .setDescription("Side you want to bet on")
          .setRequired(true)
          .addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" })
      )
      .addStringOption((option) =>
        option.setName("bet").setDescription("How much soap do you bet?").setRequired(true)
      );
  }
}
