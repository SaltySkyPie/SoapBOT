import {
  CommandInteraction,
  GuildMember,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Message,
} from "discord.js";
import getPoints from "../functions/getPoints.js";
import setPoints from "../functions/setPoints.js";
import SQL from "../functions/SQL.js";
import SoapClient from "../types/client";
import Item from "../types/Item.js";

export default class BotItem extends Item {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }

  async execute(client: SoapClient, interaction: CommandInteraction) {
    const user = interaction.member as GuildMember;

    const image = (
      await SQL(
        "SELECT link FROM gifs WHERE purpose=2 ORDER BY RAND() LIMIT 1",
        []
      )
    )[0].link;

    const PartyEmbed = new MessageEmbed()
      .setTitle(`${user.displayName} is hosting a SOAP PARTY!`)
      .setDescription(`Click the button bellow to join!`)
      .setImage(image)
      .setColor("#ff00e4");

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("party_join" + interaction.id)
        .setLabel("JOIN THE PARTY!")
        .setStyle("SUCCESS")
    );

    const reply = (await interaction.reply({
      embeds: [PartyEmbed],
      components: [row],
      fetchReply: true,
    })) as Message;

    const collector = interaction.channel!.createMessageComponentCollector({
      componentType: "BUTTON",
      time: 30000,
    });
    let joined = 0;
    let joiners: any = [];
    collector.on("collect", async (i) => {
      if (!i.customId.includes(interaction.id)) {
        return;
      }
      if (i.user.id === interaction.user.id) {
        //return i.reply({ content: `You are the host of the party..`, ephemeral: true }).catch()
      }
      if (joiners.includes(i.user.id)) {
        return i
          .reply({ content: `You already joined the party!`, ephemeral: true })
          .catch();
      } else {
        joiners.push(i.user.id);
      }
      const earned = Math.round(Math.random() * 900) + 100;
      await setPoints(i.user.id, (await getPoints(i.user.id)) + earned);
      interaction.channel!.send(
        `**${
          (i.member as GuildMember).displayName
        }** joined the **SOAP PARTY** and obtained **🧼${earned.toLocaleString()}**!`
      );
      joined++;
      i.deferUpdate().catch();
    });

    collector.on("end", (collected) => {
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("party_join" + interaction.id)
          .setLabel("PARTY ENDED!")
          .setStyle("DANGER")
          .setDisabled(true)
      );
      reply.edit({ content: "Party ended :(", components: [row] });
      interaction.channel!.send(
        `**${
          user.displayName
        }**'s party ended with total of **${joined.toLocaleString()}** participants!`
      );
    });

    return true;
  }
}
