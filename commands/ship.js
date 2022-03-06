const Jimp = require('jimp')
const { MessageAttachment } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'ship',
    aliases: ['love', 'chip'],
    slash: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('How much do you love them?')
        .addUserOption(option => option.setName('victim').setDescription('Victim').setRequired(true)),
    async execute(message, args, BotClient, functions) {
        if(message.isInteraction) {
            message.deferReply()
        }
        const user = message.member;
        const mention = message.mentions.members.first();
        let percentage = 0;

        if (!mention) {
            return message.reply("You have no friends bruh.... ||(tag someone)||")
        }

        const [user1, user2] = await Promise.all([functions.getUserData(user.id), functions.getUserData(mention.id)])
        await functions.SQL("DELETE FROM love WHERE expires<=?", [functions.getUTCDate()])
        const check = await functions.SQL("SELECT id FROM love WHERE (user1_id=? AND user2_id=?) OR (user1_id=? AND user2_id=?)", [user1.id, user2.id, user2.id, user1.id])
        if (!check || !check.length) {
            percentage = Math.round(Math.random() * 100);
            const date = functions.getUTCDate(4 * 1000 * 60 * 60);
            await functions.SQL("INSERT INTO love (rating, user1_id, user2_id, expires) VALUES (?,?,?,?)", [percentage, user1.id, user2.id, date])
        } else {
            percentage = await functions.SQL("SELECT rating FROM love WHERE (user1_id=? AND user2_id=?) OR (user1_id=? AND user2_id=?)", [user1.id, user2.id, user2.id, user1.id])
            percentage = percentage[0].rating
        }
        let [img_max_x, img_max_y, sender_x, sender_y, target_x, target_y] = [0, 0, 0, 0, 0, 0]
        let img_url = "https://soapbot.net/love3.png"
        const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK)

        if (percentage < 33) {
            img_url = "https://soapbot.net/love1.png";
            [img_max_x, img_max_y] = [1200, 600]

        } else if (percentage < 66) {
            img_url = "https://soapbot.net/love2.png";
            [img_max_x, img_max_y] = [960, 639]


        } else {
            img_url = "https://soapbot.net/love3.png";
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
            if(message.isInteraction) {
                message.followUp({ files: [attachment] })
            } else {
            message.reply({ files: [attachment] })
            }
        })





        //message.reply(`${percentage}% - ${img_url}`)




    }
}