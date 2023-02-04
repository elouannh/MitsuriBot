const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Event = require("../base/Event");

class GuildMemberAdd extends Event {
    constructor(client) {
        super({
            name: Events.GuildMemberAdd,
            on: true,
        }, client);
    }

    async exe(member) {
        const memberCount = (await member.guild.members.fetch()).map(e => e.id).length;
        const frenchVersion = new EmbedBuilder()
            .setColor(0xEFC6D2)
            .setTitle("🎉 • Bienvenue à notre nouvel arrivant !")
            .setDescription(`:flag_fr: • Bienvenue sur le serveur **${member.guild.name}** !`
                + `\nTu es notre \`${memberCount}\`ème membre !\n\n> `
                + "Pense à lire le règlement ici: <#1025846490087817236> "
                + "et personnalise ton expérience ici avec l'onboarding ! :sparkles:")
            .setTimestamp()
            .setImage("https://cdn.discordapp.com/attachments/995812450970652672/1055562717559267338/BIENVENUE_.png")
            .setFooter({ text: "Français/French.", iconURL: "https://cdn.discordapp.com/attachments/995812450970652672/1055548541159866469/la-france.png" })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

        const englishVersion = new EmbedBuilder()
            .setColor(0x6AC6A1)
            .setTitle("🎉 • Welcome to our new arrivant !")
            .setDescription(`:flag_gb: • Welcome into the server **${member.guild.name}** !`
                + `\nYou are the \`${memberCount}\`th member !\n\n> `
                + " Remember to read the rules here: <#1025846759588646962> "
                + "and customize your experience here with onboarding ! :sparkles:")
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

        const welcomeMessage = await this.client.channels.cache.get(this.client.config.channels.welcome).send({
            content: member.toString(),
            embeds: [frenchVersion],
            components: [new ActionRowBuilder().addComponents(buttons)],
        }).catch(this.client.catchError);
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

            await interaction.deferUpdate().catch(this.client.catchError);

            await welcomeMessage.edit({
                embeds: [interaction.customId === "fr" ? frenchVersion : englishVersion],
                components: [new ActionRowBuilder().setComponents(buttons)],
            }).catch(this.client.catchError);

            lastPanel = interaction.customId;
        });
        collector.on("end", async () => {
            await welcomeMessage.edit({ components: [] }).catch(this.client.catchError);
        });

        let hasRole = member.roles.cache.has("1025812198276206662");
        while (!hasRole) {
            await this.client.util.delay(1000);
            if (!member.user.bot && member.user.id !== this.client.user.id && !member.roles.cache.has("1025812198276206662")) {
                member.roles.add("1025812198276206662").catch(this.client.catchError);
                hasRole = true;
            }
        }
    }

}

module.exports = GuildMemberAdd;