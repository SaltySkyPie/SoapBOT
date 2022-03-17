import { CommandInteraction, GuildMember, MessageAttachment } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from '@discordjs/builders'
import Command from "../types/Command.js";
import Jimp from 'jimp';
import getUserData from "../functions/getUserData.js";
import SQL from "../functions/SQL.js";
import getMysqlDateTime from "../functions/getMysqlDateTime.js";


export default class BotCommand extends Command {

    constructor(id: number, name: string, description: string) {
        super(id, name, description)
    }
    async execute(client: SoapClient, interaction: CommandInteraction) {
        await interaction.deferReply()

        const user = interaction.member as GuildMember
        const mention = interaction.options.getMember("user") as GuildMember
        let percentage: any = 0;

        if (!mention) {
            interaction.reply("You have no friends bruh.... ||(choose someone)||")
            return false
        }

        const [user1, user2] = await Promise.all([getUserData(user.id), getUserData(mention.id)])

        await SQL("DELETE FROM love WHERE expires<=?", [getMysqlDateTime()])

        const check = await SQL("SELECT id FROM love WHERE (user1_id=? AND user2_id=?) OR (user1_id=? AND user2_id=?)", [user1.id, user2.id, user2.id, user1.id])

        if (!check || !check.length) {
            percentage = Math.round(Math.random() * 100);
            const date = getMysqlDateTime(4 * 1000 * 60 * 60);
            await SQL("INSERT INTO love (rating, user1_id, user2_id, expires) VALUES (?,?,?,?)", [percentage, user1.id, user2.id, date])
        } else {
            percentage = await SQL("SELECT rating FROM love WHERE (user1_id=? AND user2_id=?) OR (user1_id=? AND user2_id=?)", [user1.id, user2.id, user2.id, user1.id])
            percentage = percentage[0].rating
        }

        let [img_max_x, img_max_y, sender_x, sender_y, target_x, target_y] = [0, 0, 0, 0, 0, 0]
        let img_url = "https://skippies.fun/discord/soapbot/images/love3.png"
        const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK)

        if (percentage < 33) {
            img_url = "https://skippies.fun/discord/soapbot/images/love1.png";
            [img_max_x, img_max_y] = [1200, 600]

        } else if (percentage < 66) {
            img_url = "https://skippies.fun/discord/soapbot/images/love2.png";
            [img_max_x, img_max_y] = [960, 639]


        } else {
            img_url = "https://skippies.fun/discord/soapbot/images/love3.png";
            [img_max_x, img_max_y] = [1200, 485]
        }

        sender_x = 30
        sender_y = (img_max_y - 256) / 2
        target_x = img_max_x - 256 - 30
        target_y = (img_max_y - 256) / 2

        const [image, senderImg, targetImg] = await Promise.all([
            Jimp.read(img_url),
            Jimp.read(user.user.displayAvatarURL({ dynamic: true }).replace(/\.[^/.]+$/, ".png")),
            Jimp.read(mention.user.displayAvatarURL({ dynamic: true }).replace(/\.[^/.]+$/, ".png"))
        ]);

        image.composite(senderImg.resize(256, 256), sender_x, sender_y),
            image.composite(targetImg.resize(256, 256), target_x, target_y)

        image.print(font,
            0,
            0,
            {
                text: `${percentage}%`,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            },
            img_max_x,
            img_max_y)

        image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            const attachment = new MessageAttachment(buffer, 'love.png')
            interaction.followUp({ files: [attachment] })
        })






        return true
    }

    async getSlash(): Promise<SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">> {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option => option.setName('user').setDescription('User').setRequired(true));
    }
}


