const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
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
        const gmaLang = lang.events.guildMemberAdd;

        const frenchVersion = new EmbedBuilder()
            .setColor(0xEFC6D2)
            .setTitle("🎉 • Bienvenue à notre nouvel arrivant !")
            .setDescription(`:flag_fr: • Bienvenue sur le serveur **${member.guild.name}** !`
                + `\nTu es notre \`${member.guild.memberCount}\`ème membre !\n\n> `
                + "Pense à lire le règlement ici: <#1025846490087817236> "
                + "et de prendre tes rôles ici: <#1025846553660891207>.")
            .setTimestamp()
            .setImage("https://cdn.discordapp.com/attachments/995812450970652672/1055562717559267338/BIENVENUE_.png")
            .setFooter({ text: "Français/French.", iconURL: "https://cdn.discordapp.com/attachments/995812450970652672/1055548541159866469/la-france.png" })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

        const englishVersion = new EmbedBuilder()
            .setColor(0x6AC6A1)
            .setTitle("🎉 • Welcome to our new arrivant !")
            .setDescription(`:flag_gb: • Welcome into the server **${member.guild.name}** !`
                + `\nYou are the \`${member.guild.memberCount}\`th member !\n\n> `
                + " Remember to read the rules here: <#1025846759588646962> "
                + "and take your roles here: <#1025846800751530085>.")
            .setTimestamp()
            .setImage("https://cdn.discordapp.com/attachments/995812450970652672/1055567445907210330/Copie_de_BIENVENUE_.png")
            .setFooter({ text: "Anglais/English.", iconURL: "https://cdn.discordapp.com/attachments/995812450970652672/1055548540866281552/royaume-uni.png" })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

        const buttons = [
            new ButtonBuilder()
                .setEmoji("🇫🇷")
                .setStyle(ButtonStyle.Primary)
                .setCustomId("fr")
                .setLabel("Français"),
            new ButtonBuilder()
                .setEmoji("🇬🇧")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("en")
                .setLabel("English"),
        ];

        let lastPanel = "fr";

        const welcomeMessage = await client.channels.cache.get(client.config.channels.welcome).send({
            content: member.toString(),
            embeds: [frenchVersion],
            components: [new ActionRowBuilder().addComponents(buttons)],
        }).catch(client.catchError);
        const collector = await welcomeMessage.createMessageComponentCollector({
            filter: interaction => interaction.user.id === member.id,
            idle: 60_000,
        });
        collector.on("collect", async interaction => {
            const oldBtn = buttons[buttons.map(e => e.data.custom_id).indexOf(lastPanel)];
            buttons[buttons.map(e => e.data.custom_id).indexOf(lastPanel)] = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(oldBtn.data.custom_id)
                .setEmoji(oldBtn.data.emoji.id || oldBtn.data.emoji.name);
            buttons[buttons.map(e => e.data.custom_id).indexOf(interaction.customId)]
                .setStyle(ButtonStyle.Primary)
                .setLabel(interaction.customId === "fr" ? "Français" : "English");

            await interaction.deferUpdate().catch(client.catchError);

            await welcomeMessage.edit({
                embeds: [interaction.customId === "fr" ? frenchVersion : englishVersion],
                components: [new ActionRowBuilder().setComponents(buttons)],
            }).catch(client.catchError);

            lastPanel = interaction.customId;
        });
        collector.on("end", async () => {
            await welcomeMessage.edit({ components: [] }).catch(client.catchError);
        });
    }

}

module.exports = GuildMemberAdd;