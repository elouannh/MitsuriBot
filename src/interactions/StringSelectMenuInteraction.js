const Interaction = require("../base/Interaction");

class StringSelectMenuInteraction extends Interaction {
    constructor(client) {
        super({
            name: "StringSelectMenuInteraction",
        }, client);
    }

    async exe(client, interaction, lang) {
        if (interaction.customId === "notificationsMenu") {
            const member = await this.client.getMember(interaction.user.id, interaction.guild);
            const notificationsRoles = interaction.guild.roles.cache.filter(r => this.client.config.roles.notifications.includes(r.id));

            const before = member.roles.cache;
            const index = [ "animation", "global", "important", "community", "special"];

            const added = [];
            const removed = [];
            const after = before;
            for (const value of interaction.values) {
                const role = notificationsRoles.find(r => r.id === this.client.config.roles.notifications[index.indexOf(value)]);
                if (before.has(role.id)) {
                    removed.push(role);
                    after.delete(role.id);
                }
                else {
                    added.push(role);
                    after.set(role.id, role);
                }
            }
            await member.roles.set(after).catch(this.client.catchError);
            await interaction.reply({
                content: `${lang.interactions.notificationsUpdated}\n\n${
                        added.length > 0 ? `> **${lang.interactions.rolesAdded}:**\n`
                        + `${added.map(r => r.toString()).join(", ")}\n` : ""
                    }${
                        removed.length > 0 ? `> **${lang.interactions.rolesRemoved}:**\n`
                        + `${removed.map(r => r.toString()).join(", ")}\n` : ""
                    }`
                    + `\n__${lang.interactions.yourRoles}:__ ${after
                        .filter(r => this.client.config.roles.notifications.includes(r.id))
                        .map(r => r.toString()).join(", ")
                    }`,
                ephemeral: true,
            }).catch(this.client.catchError);
        }
        if (interaction.customId === "languagesMenu") {
            const member = await this.client.getMember(interaction.user.id, interaction.guild);
            const languagesRoles = interaction.guild.roles.cache.filter(r => this.client.config.roles.languages.includes(r.id));

            const before = member.roles.cache;
            const index = [ "fr", "en"];

            const added = [];
            const removed = [];
            const after = before;
            for (const value of interaction.values) {
                const role = languagesRoles.find(r => r.id === this.client.config.roles.languages[index.indexOf(value)]);
                if (before.has(role.id)) {
                    removed.push(role);
                    after.delete(role.id);
                }
                else {
                    added.push(role);
                    after.set(role.id, role);
                }
            }
            await member.roles.set(after).catch(this.client.catchError);
            await interaction.reply({
                content: `${lang.interactions.languagesUpdated}\n\n${
                        added.length > 0 ? `> **${lang.systems.rolesAdded}:**\n`
                            + `${added.map(r => r.toString()).join(", ")}\n` : ""
                    }${
                        removed.length > 0 ? `> **${lang.interactions.rolesRemoved}:**\n`
                            + `${removed.map(r => r.toString()).join(", ")}\n` : ""
                    }`
                    + `\n__${lang.interactions.yourRoles}:__ ${after
                        .filter(r => this.client.config.roles.languages.includes(r.id))
                        .map(r => r.toString()).join(", ")
                    }`,
                ephemeral: true,
            }).catch(this.client.catchError);
        }
        else if (interaction.customId === "botLanguageMenu") {
            const choosen = interaction.values[0];
            this.client.userDb.setLang(interaction.user.id, choosen);
            lang = this.client.languageManager.getLang(this.client.userDb.getLang(interaction.user.id)).json;

            await interaction.reply({
                content: `${lang.interactions.talkInThisLanguage}`,
                ephemeral: true,
            }).catch(this.client.catchError);
        }
    }
}

module.exports = StringSelectMenuInteraction;