const Command = require("../../base/Command");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");

class Webhook extends Command {
    constructor() {
        super({
            name: "clear-webhook",
            description: "Commande permettant de clear tous les webhooks d'un channel.",
            descriptionLocalizations: {
                "en-US": "Command to clear all webhooks of a channel.",
            },
            options: [],
            type: [1],
            dmPermission: false,
            category: "Staff",
            cooldown: 10,
            completedRequests: ["clear-webhook"],
            authorizationBitField: 0b010,
            permissions: 8n,
        });
    }

    async run() {
        const webhooks = await this.interaction.channel.fetchWebhooks().catch(this.client.catchError);
        if (!webhooks) return this.end();

        for (const webhook of webhooks.values()) {
            webhook.delete().catch(this.client.catchError);
        }

        await this.interaction.channel.bulkDelete(99).catch(this.client.catchError);
        await this.interaction.reply({ ephemeral: true, content: "Done." }).catch(this.client.catchError);

        return this.end();
    }
}

module.exports = Webhook;