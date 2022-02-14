module.exports = {
    name: 'fight club soap',
    async execute(message, args, BotClient, functions, user) {
        message.channel.send(`**${message.member.displayName}** knocked out **${message.mentions.members.first().displayName}**. They cannot steal from any person for 5 minutes!`)
    }
}