import {
  CommandInteraction,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  Guild,
  ComponentType,
} from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import SQL from "../functions/SQL.js";
import getSoapstatus from "../functions/getSoapStatus.js";
import checkActiveItem from "../functions/checkActiveItem.js";
import removeActiveItem from "../functions/removeActiveItem.js";
import dmUser from "../functions/dmUser.js";
import setSoapStatus from "../functions/setSoapStatus.js";
import getPoints from "../functions/getPoints.js";
import setPoints from "../functions/setPoints.js";
import getUserData from "../functions/getUserData.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const user = interaction.member as GuildMember;
    const target = interaction.options.getMember("user") as GuildMember;

    if (!target) {
      interaction.reply({
        content:
          "Soap on a rope saves the day. Try again with an actual person.",
      });
      return false;
    }

    if (user.id === target.id) {
      interaction.reply({ content: "Get lost!" });
      return false;
    }

    const [user_ss, target_ss] = await Promise.all([
      getSoapstatus(user.id),
      getSoapstatus(target.id),
    ]);
    if (user_ss != 0) {
      interaction.reply({ content: `You need to pick up your soap first...` });
      return false;
    }

    if (target_ss != 0) {
      interaction.reply({
        content: `Do you not see their soap on the ground already?`,
      });
      return false;
    }
    const user_id = (await getUserData(target.id)).id;
    const ropeCheck = await checkActiveItem(user_id, 1);

    if (ropeCheck) {
      await removeActiveItem(user_id, 1);
      const fail_dm = new EmbedBuilder()
        .setTitle(
          ` ${user.displayName} (${user.user.username}#${
            user.user.discriminator
          }) tried to drop your 🧼 in ${
            interaction.guild!.name
          } but failed due to you having Rope equipped!`
        )
        .setColor("#ff00e4")
        .setDescription(`<#${interaction.channelId}>`);

      dmUser(target, { embeds: [fail_dm] });

      interaction.reply({
        content: `You tried to drop **${target.displayName}**'s soap, but didn't realize they had very thicc rope on it. You failed lmao.`,
      });
      return true;
    }

    const image = (
      await SQL(
        "SELECT link FROM gifs WHERE purpose=0 ORDER BY RAND() LIMIT 1",
        []
      )
    )[0].link;

    const DropEmbed = new EmbedBuilder()
      .setTitle("Oh no!")
      .setDescription(
        `**${target.displayName}** dropped the soap! Click the button to pick up the soap!\nYou have 5 minutes to pick up your soap!`
      )
      .setImage(image)
      .setColor("#ff00e4");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("soap_pickup" + interaction.id)
        .setLabel("PICK UP!")
        .setStyle(ButtonStyle.Success)
    );

    const dm = new EmbedBuilder()
      .setTitle(
        ` ${user.displayName} (${user.user.username}#${
          user.user.discriminator
        }) dropped your 🧼 in ${interaction.guild!.name}!`
      )
      .setColor("#ff00e4")
      .setDescription(`<#${interaction.channelId}>`);

    dmUser(target, { embeds: [dm] });

    await setSoapStatus(target.id, 1);

    const reply = (await interaction.reply({
      embeds: [DropEmbed],
      components: [row],
      fetchReply: true,
    })) as Message;

    const collector = interaction.channel!.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });
    let picked_up = false;
    collector.on("collect", async (i) => {
      if (i.customId !== "soap_pickup" + interaction.id) {
        return;
      }
      if (i.user.id !== target.id) {
        i.reply({
          content: `This button is not for you. Dummy!`,
          ephemeral: true,
        });
        return;
      }
      picked_up = true;
      const pickup_row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("soap_pickup" + interaction.id)
          .setLabel("PICKING UP!")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
      reply.edit({ components: [pickup_row] });
      i.deferUpdate();

      const image = (
        await SQL(
          "SELECT link FROM gifs WHERE purpose=1 ORDER BY RAND() LIMIT 1",
          []
        )
      )[0].link;

      const PickUpEmbed = new EmbedBuilder()
        .setTitle("Oh yeah!")
        .setDescription(
          `**${target.displayName}** is picking up their soap! Click the "DADDY" button to get some 🧼!\nYou have 10 seconds to do so!`
        )
        .setImage(image)
        .setColor("#ff00e4");

      const pup_row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("soap_daddy" + interaction.id)
          .setLabel("DADDY! 😏")
          .setStyle(ButtonStyle.Success)
      );

      const pickup_msg = await ((interaction.channel) as any).send({
        embeds: [PickUpEmbed],
        components: [pup_row],
      });

      const pickup_collector =
        interaction.channel!.createMessageComponentCollector({
          max: 1,
          componentType: ComponentType.Button,
          time: 10000,
        });

      pickup_collector.on("collect", async (i) => {
        if (i.customId !== "soap_daddy" + interaction.id) {
          return;
        }
        const earned = Math.floor(Math.random() * (1500 - 750 + 1) + 750);
        let points = await getPoints(i.user.id);
        await setPoints(i.user.id, points + earned);
        const daddy_row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("soap_daddy" + interaction.id)
            .setLabel("DADDY! 😏")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );
        pickup_msg.edit({ components: [daddy_row] });

        await ((interaction.channel) as any).send(
          `**${
            (i.member as GuildMember).displayName
          }** used the **DADDY** spell and obtained 🧼**${earned.toLocaleString()}**!`
        );

        i.deferUpdate();
      });

      pickup_collector.on("end", async () => {
        const m_earned = Math.floor(Math.random() * (1500 - 750 + 1) + 750);
        const daddy_row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("soap_daddy" + interaction.id)
            .setLabel("DADDY! 😏")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
        );
        pickup_msg.edit({ components: [daddy_row] });
        setTimeout(async () => {
          let points = await getPoints(target.id);
          setPoints(target.id, points + m_earned);
          ((interaction.channel) as any).send(
            `**${
              target.displayName
            }** has picked up their soap and earned 🧼**${m_earned.toLocaleString()}**!`
          );
          setSoapStatus(target.id, 0);
        }, 1000);
      });
    });

    collector.on("end", async (collected) => {
      if (!picked_up) {
        ((interaction.channel) as any).send(
          `**${target.displayName}** didn't pick up their soap in time. They lost 🧼**500**. :(`
        );
        const result = await getPoints(target.id);
        if (result >= 500) {
          setPoints(target.id, result - 500);
        } else {
          setPoints(target.id, 0);
        }
        dmUser(
          target,
          "You didn't pick up your soap in time. You lost 🧼**500**. :("
        );
        const toolaterow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("soap_daddy" + interaction.id)
            .setLabel(`"TOO LATE!"`)
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
        );
        await setSoapStatus(target.id, 0);
        reply.edit({ components: [toolaterow] });
      }
    });

    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) =>
        option.setName("user").setDescription("User").setRequired(true)
      );
  }
}
