import {
  ChatInputCommandInteraction,
  GuildMember,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  ComponentType,
} from "discord.js";
import { Item, SoapClient, SOAP_COLOR } from "../core/index.js";
import { EmbedBuilder } from "discord.js";
import getPoints from "../functions/getPoints.js";
import setPoints from "../functions/setPoints.js";
import prisma from "../lib/prisma.js";

export default class SoapParty extends Item {
  readonly name = "Soap Party";
  readonly description = "Host a party where everyone can earn soap";

  // Shop properties
  readonly buyable = true;
  readonly shop = true;
  readonly buyCost = 2000;

  // Usage properties
  readonly useable = true;

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction, amount: number) {
    const user = interaction.member as GuildMember;

    const partyGifs = await prisma.gif.findMany({ where: { purpose: 2 } });
    const image = partyGifs[Math.floor(Math.random() * partyGifs.length)]?.link;

    const partyEmbed = new EmbedBuilder()
      .setColor(SOAP_COLOR)
      .setTitle(`${user.displayName} is hosting a SOAP PARTY!`)
      .setDescription(`Click the button bellow to join!`)
      .setImage(image);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("party_join" + interaction.id)
        .setLabel("JOIN THE PARTY!")
        .setStyle(ButtonStyle.Success)
    );

    const reply = (await interaction.reply({
      embeds: [partyEmbed],
      components: [row],
      fetchReply: true,
    })) as Message;

    const collector = interaction.channel!.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    let joined = 0;
    let joiners: string[] = [];

    collector.on("collect", async (i) => {
      if (!i.customId.includes(interaction.id)) return;

      if (joiners.includes(i.user.id)) {
        return i.reply({ content: `You already joined the party!`, ephemeral: true }).catch();
      }

      joiners.push(i.user.id);
      const earned = Math.round(Math.random() * 900) + 100;
      await setPoints(i.user.id, (await getPoints(i.user.id)) + earned);

      (interaction.channel as any).send(
        `**${(i.member as GuildMember).displayName}** joined the **SOAP PARTY** and obtained **🧼${earned.toLocaleString()}**!`
      );
      joined++;
      i.deferUpdate().catch();
    });

    collector.on("end", () => {
      const endRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("party_join" + interaction.id)
          .setLabel("PARTY ENDED!")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true)
      );
      reply.edit({ content: "Party ended :(", components: [endRow] });
      (interaction.channel as any).send(
        `**${user.displayName}**'s party ended with total of **${joined.toLocaleString()}** participants!`
      );
    });

    return true;
  }
}
