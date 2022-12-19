const { Events, EmbedBuilder } = require("discord.js");
const Event = require("../base/Event");

class GuildMemberAdd extends Event {
    constructor() {
        super({
            name: Events.GuildMemberAdd,
            on: true,
        });
    }

    async exe(client, member) {
        member.roles.add("1025812198276206662").catch(client.catchError);
        const lang = client.languageManager.getLang(client.userDb.getLang(member.id)).json;
        const gmaLang = lang.interactions.guildMemberAdd;
        client.channels.cache.get(client.config.channels.welcome).send({
            content: member.toString(),
            embeds: [
                new EmbedBuilder()
                    .setColor(client.enums.Colors.Green)
                    .setTitle(`<:mitsuri:943193121238429728> • ${gmaLang.title}`)
                    .setDescription(gmaLang.welcome
                        .replace("%USER", member.toString())
                        .replace("%SERVER", member.guild.name)
                        .replace("%MEMBERS", member.guild.memberCount) + gmaLang.rules + gmaLang.changeLang,
                    )
                    .setTimestamp()
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true })),
            ],
        }).catch(client.catchError);
    }
}

module.exports = GuildMemberAdd;