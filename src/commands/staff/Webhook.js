const Command = require("../../base/Command");
const { EmbedBuilder } = require("discord.js");

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
            cooldown: 1,
            completedRequests: [],
            authorizationBitField: 0b010,
            permissions: 0n,
        });
    }

    async run() {
        const channel = this.interaction.options.getChannel("channel", true);

        const tracked = this.client.util.trackValue(channel.id, this.client.config);
        if (!tracked) return this.end();

        const [type, id, lang] = tracked.split(".");

        if (type === "channels") {
            if (id === "roles") {
                const text = this.client.texts.roles[lang];
                const webhook = await this.client.internalServerManager.getWebhook(
                    channel, this.client.texts.webhooks.roles[lang], `roles${this.client.util.capitalize(lang)}`,
                );
                webhook.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Number(this.client.config.colors.roles))
                            .setImage(text.roles)
                            .setThumbnail("https://cdn.discordapp.com/attachments/995812450970652672/1053243603041923092/Empty.png"),
                        new EmbedBuilder()
                            .setColor(Number(this.client.config.colors.roles))
                            .setDescription(text.list.join("\n"))
                            .setThumbnail("https://cdn.discordapp.com/attachments/995812450970652672/1053243603041923092/Empty.png"),
                    ],
                }).catch(this.client.catchError);
            }
            else if (id === "rules") {
                const text = this.client.texts.rules[lang];
                const webhook = await this.client.internalServerManager.getWebhook(
                    channel, this.client.texts.webhooks.rules[lang], `rules${this.client.util.capitalize(lang)}`,
                );
                webhook.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Number(this.client.config.colors.rules))
                            .setImage(text.rules)
                            .setThumbnail("https://cdn.discordapp.com/attachments/995812450970652672/1053243603041923092/Empty.png"),
                        new EmbedBuilder()
                            .setColor(Number(this.client.config.colors.rules))
                            .setDescription(text.list.join("\n"))
                            .setThumbnail("https://cdn.discordapp.com/attachments/995812450970652672/1053243603041923092/Empty.png"),
                    ],
                }).catch(this.client.catchError);
            }
            else if (id === "infos") {
                const text = this.client.texts.infos[lang];
                const webhook = await this.client.internalServerManager.getWebhook(
                    channel, this.client.texts.webhooks.infos[lang], `infos${this.client.util.capitalize(lang)}`,
                );
                webhook.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Number(this.client.config.colors.infos))
                            .setImage(text.infos)
                            .setThumbnail("https://cdn.discordapp.com/attachments/995812450970652672/1053243603041923092/Empty.png"),
                        new EmbedBuilder()
                            .setColor(Number(this.client.config.colors.infos))
                            .setDescription(text.list.join("\n"))
                            .setThumbnail("https://cdn.discordapp.com/attachments/995812450970652672/1053243603041923092/Empty.png"),
                    ],
                }).catch(this.client.catchError);
            }
        }

        await this.interaction.reply({ ephemeral: true, content: "Done." }).catch(this.client.catchError);
        return this.end();
    }
}

module.exports = Webhook;