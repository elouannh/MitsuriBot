const Command = require("../../base/Command");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");

class Webhook extends Command {
    constructor() {
        super({
            name: "webhook",
            description: "Commande permettant de renvoyer un webhook dans un channel.",
            descriptionLocalizations: {
                "en-US": "Command to send a webhook in a channel.",
            },
            options: [
                {
                    name: "channel",
                    description: "Le channel dans lequel envoyer le webhook.",
                    descriptionLocalizations: {
                        "en-US": "The channel in which to send the webhook.",
                    },
                    type: 7,
                    required: true,
                },
            ],
            type: [1],
            dmPermission: false,
            category: "Staff",
            cooldown: 10,
            completedRequests: ["webhook"],
            authorizationBitField: 0b010,
            permissions: 0n,
        });
    }

    async run() {
        await this.interaction.reply({ ephemeral: true, content: "Done." }).catch(this.client.catchError);

        const channel = this.interaction.options.getChannel("channel", true);

        const tracked = this.client.util.trackValue(channel.id, this.client.config);
        if (!tracked) return this.end();

        const [type, id, lang] = tracked.split(".");

        if (type === "channels") {
            if (id === "roles") {
                const text = this.client.texts.roles.fr;
                const webhook = await this.client.internalServerManager.getWebhook(
                    channel, this.client.texts.webhooks.roles[lang], `roles${this.client.util.capitalize(lang)}`,
                );
                webhook.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(this.client.enums.Colors.Blurple)
                            .setTitle(text.roles)
                            .setDescription(text.list.join("\n"))
                            .setThumbnail("https://cdn.discordapp.com/attachments/995812450970652672/1053243603041923092/Empty.png"),
                        new EmbedBuilder()
                            .setColor(this.client.enums.Colors.Blurple)
                            .setTitle(text.takeOne)
                            .setDescription(text.takeOneDescription)
                            .setThumbnail("https://cdn.discordapp.com/attachments/995812450970652672/1053243603041923092/Empty.png"),
                    ],
                }).catch(this.client.catchError);
                webhook.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(this.client.enums.Colors.Blurple)
                            .setTitle(text.notifications)
                            .setDescription(text.notificationsList.join("\n"))
                            .setThumbnail("https://cdn.discordapp.com/attachments/995812450970652672/1053243603041923092/Empty.png"),
                    ],
                    components: [
                        new ActionRowBuilder()
                            .setComponents(
                                new StringSelectMenuBuilder()
                                    .setMaxValues(5)
                                    .setCustomId("notificationsMenu")
                                    .setOptions(text.notificationsOptions),
                            ),
                    ],
                }).catch(this.client.catchError);
                webhook.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(this.client.enums.Colors.Blurple)
                            .setTitle(text.languages)
                            .setDescription(text.languagesList.join("\n"))
                            .setThumbnail("https://cdn.discordapp.com/attachments/995812450970652672/1053243603041923092/Empty.png"),
                    ],
                    components: [
                        new ActionRowBuilder()
                            .setComponents(
                                new StringSelectMenuBuilder()
                                    .setMaxValues(2)
                                    .setCustomId("languagesMenu")
                                    .setOptions(text.languagesOptions),
                            ),
                    ],
                }).catch(this.client.catchError);
            }
        }

        return this.end();
    }
}

module.exports = Webhook;