import { ChatInputCommandInteraction, GuildMember, AttachmentBuilder } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import Jimp from "jimp";
import getUserData from "../functions/getUserData.js";
import prisma from "../lib/prisma.js";
import ms from "ms";

export default class Ship extends Command {
  readonly name = "ship";
  readonly description = "Check the love compatibility between two users";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const user = interaction.member as GuildMember;
    const mention = interaction.options.getMember("user") as GuildMember;
    let percentage: number = 0;

    if (!mention) {
      interaction.followUp("You have no friends bruh.... ||(choose someone)||");
      return false;
    }

    const [user1, user2] = await Promise.all([
      getUserData(user.id),
      getUserData(mention.id),
    ]);

    await prisma.love.deleteMany({
      where: { expires: { lte: new Date() } },
    });

    const existingLove = await prisma.love.findFirst({
      where: {
        OR: [
          { user1_id: user1!.id, user2_id: user2!.id },
          { user1_id: user2!.id, user2_id: user1!.id },
        ],
      },
    });

    if (!existingLove) {
      percentage = Math.round(Math.random() * 100);
      const expiresAt = new Date(Date.now() + ms("4h"));
      await prisma.love.create({
        data: {
          rating: percentage,
          user1_id: user1!.id,
          user2_id: user2!.id,
          expires: expiresAt,
        },
      });
    } else {
      percentage = existingLove.rating;
    }

    let [imgMaxX, imgMaxY] = [0, 0];
    let imgUrl = "https://cdn.saltyskypie.com/soapbot/images/love3.png";
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);

    if (percentage < 33) {
      imgUrl = "https://cdn.saltyskypie.com/soapbot/images/love1.png";
      [imgMaxX, imgMaxY] = [1200, 600];
    } else if (percentage < 66) {
      imgUrl = "https://cdn.saltyskypie.com/soapbot/images/love2.png";
      [imgMaxX, imgMaxY] = [960, 639];
    } else {
      imgUrl = "https://cdn.saltyskypie.com/soapbot/images/love3.png";
      [imgMaxX, imgMaxY] = [1200, 485];
    }

    const senderX = 30;
    const senderY = (imgMaxY - 256) / 2;
    const targetX = imgMaxX - 256 - 30;
    const targetY = (imgMaxY - 256) / 2;

    const [image, senderImg, targetImg] = await Promise.all([
      Jimp.read(imgUrl),
      Jimp.read(user.user.displayAvatarURL().replace(/\.[^/.]+$/, ".png")),
      Jimp.read(mention.user.displayAvatarURL().replace(/\.[^/.]+$/, ".png")),
    ]);

    image.composite(senderImg.resize(256, 256), senderX, senderY);
    image.composite(targetImg.resize(256, 256), targetX, targetY);

    image.print(
      font,
      0,
      0,
      {
        text: `${percentage}%`,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      imgMaxX,
      imgMaxY
    );

    image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
      const attachment = new AttachmentBuilder(buffer, { name: "love.png" });
      interaction.followUp({ files: [attachment] });
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
