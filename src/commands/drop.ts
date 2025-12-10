import {
  ChatInputCommandInteraction,
  GuildMember,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  ComponentType,
  MessageFlags,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import prisma from "../lib/prisma.js";
import getSoapStatus from "../functions/getSoapStatus.js";
import checkActiveItem from "../functions/checkActiveItem.js";
import removeActiveItem from "../functions/removeActiveItem.js";
import dmUser from "../functions/dmUser.js";
import setSoapStatus from "../functions/setSoapStatus.js";
import getPoints from "../functions/getPoints.js";
import setPoints from "../functions/setPoints.js";
import getUserData from "../functions/getUserData.js";

export default class Drop extends Command {
  readonly name = "drop";
  readonly description = "Drop someone's soap";
  readonly cooldown = 300; // 5 minutes

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const user = interaction.member as GuildMember;
    const target = interaction.options.getMember("user") as GuildMember;

    if (!target) {
      interaction.reply({
        content: "Soap on a rope saves the day. Try again with an actual person.",
      });
      return false;
    }

    if (user.id === target.id) {
      interaction.reply({ content: "Get lost!" });
      return false;
    }

    const [userSoapStatus, targetSoapStatus] = await Promise.all([
      getSoapStatus(user.id),
      getSoapStatus(target.id),
    ]);

    if (userSoapStatus !== 0) {
      interaction.reply({ content: `You need to pick up your soap first...` });
      return false;
    }

    if (targetSoapStatus !== 0) {
      interaction.reply({ content: `Do you not see their soap on the ground already?` });
      return false;
    }

    const targetUserId = (await getUserData(target.id))!.id;
    const ropeCheck = await checkActiveItem(targetUserId, 1);

    if (ropeCheck) {
      await removeActiveItem(targetUserId, 1);
      const failDm = this.createEmbed()
        .setTitle(
          `${user.displayName} (${user.user.username}#${user.user.discriminator}) tried to drop your 🧼 in ${interaction.guild!.name} but failed due to you having Rope equipped!`
        )
        .setDescription(`<#${interaction.channelId}>`);

      dmUser(target, { embeds: [failDm] });
      interaction.reply({
        content: `You tried to drop **${target.displayName}**'s soap, but didn't realize they had very thicc rope on it. You failed lmao.`,
      });
      return true;
    }

    const gifs = await prisma.gifs.findMany({ where: { purpose: 0 } });
    const image = gifs[Math.floor(Math.random() * gifs.length)]?.link;

    const dropEmbed = this.createEmbed()
      .setTitle("Oh no!")
      .setDescription(
        `**${target.displayName}** dropped the soap! Click the button to pick up the soap!\nYou have 5 minutes to pick up your soap!`
      )
      .setImage(image);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("soap_pickup" + interaction.id)
        .setLabel("PICK UP!")
        .setStyle(ButtonStyle.Success)
    );

    const dm = this.createEmbed()
      .setTitle(
        `${user.displayName} (${user.user.username}#${user.user.discriminator}) dropped your 🧼 in ${interaction.guild!.name}!`
      )
      .setDescription(`<#${interaction.channelId}>`);

    dmUser(target, { embeds: [dm] });
    await setSoapStatus(target.id, 1);

    const response = await interaction.reply({
      embeds: [dropEmbed],
      components: [row],
      withResponse: true,
    });
    const reply = response.resource!.message! as Message;

    const collector = interaction.channel!.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    let pickedUp = false;

    collector.on("collect", async (i) => {
      if (i.customId !== "soap_pickup" + interaction.id) return;
      if (i.user.id !== target.id) {
        i.reply({ content: `This button is not for you. Dummy!`, flags: MessageFlags.Ephemeral });
        return;
      }

      pickedUp = true;
      const pickupRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("soap_pickup" + interaction.id)
          .setLabel("PICKING UP!")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
      reply.edit({ components: [pickupRow] });
      i.deferUpdate();

      const pickupGifs = await prisma.gifs.findMany({ where: { purpose: 1 } });
      const pickupImage = pickupGifs[Math.floor(Math.random() * pickupGifs.length)]?.link;

      const pickUpEmbed = this.createEmbed()
        .setTitle("Oh yeah!")
        .setDescription(
          `**${target.displayName}** is picking up their soap! Click the "DADDY" button to get some 🧼!\nYou have 10 seconds to do so!`
        )
        .setImage(pickupImage);

      const daddyRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("soap_daddy" + interaction.id)
          .setLabel("DADDY! 😏")
          .setStyle(ButtonStyle.Success)
      );

      const pickupMsg = await (interaction.channel as any).send({
        embeds: [pickUpEmbed],
        components: [daddyRow],
      });

      const pickupCollector = interaction.channel!.createMessageComponentCollector({
        max: 1,
        componentType: ComponentType.Button,
        time: 10000,
      });

      pickupCollector.on("collect", async (pi) => {
        if (pi.customId !== "soap_daddy" + interaction.id) return;
        const earned = Math.floor(Math.random() * (1500 - 750 + 1) + 750);
        const points = await getPoints(pi.user.id);
        await setPoints(pi.user.id, points + earned);

        const daddyDisabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("soap_daddy" + interaction.id)
            .setLabel("DADDY! 😏")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );
        pickupMsg.edit({ components: [daddyDisabledRow] });

        await (interaction.channel as any).send(
          `**${(pi.member as GuildMember).displayName}** used the **DADDY** spell and obtained 🧼**${earned.toLocaleString()}**!`
        );
        pi.deferUpdate();
      });

      pickupCollector.on("end", async () => {
        const pickupEarned = Math.floor(Math.random() * (1500 - 750 + 1) + 750);
        const daddyEndRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("soap_daddy" + interaction.id)
            .setLabel("DADDY! 😏")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
        );
        pickupMsg.edit({ components: [daddyEndRow] });

        setTimeout(async () => {
          const points = await getPoints(target.id);
          setPoints(target.id, points + pickupEarned);
          (interaction.channel as any).send(
            `**${target.displayName}** has picked up their soap and earned 🧼**${pickupEarned.toLocaleString()}**!`
          );
          setSoapStatus(target.id, 0);
        }, 1000);
      });
    });

    collector.on("end", async () => {
      if (!pickedUp) {
        (interaction.channel as any).send(
          `**${target.displayName}** didn't pick up their soap in time. They lost 🧼**500**. :(`
        );
        const result = await getPoints(target.id);
        if (result >= 500) {
          setPoints(target.id, result - 500);
        } else {
          setPoints(target.id, 0);
        }
        dmUser(target, "You didn't pick up your soap in time. You lost 🧼**500**. :(");
        const tooLateRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("soap_daddy" + interaction.id)
            .setLabel(`"TOO LATE!"`)
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
        );
        await setSoapStatus(target.id, 0);
        reply.edit({ components: [tooLateRow] });
      }
    });

    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) => option.setName("user").setDescription("User").setRequired(true));
  }
}
