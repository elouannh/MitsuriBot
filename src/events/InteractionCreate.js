const { Events } = require("discord.js");
const Event = require("../base/Event");

class InteractionCreate extends Event {
    constructor(client) {
        super({
            name: Events.InteractionCreate,
            once: false,
        }, client);
        this.interaction = null;
    }

    async exe(interaction) {
        if (interaction.user.bot) return;
        this.interaction = interaction;

        if (this.interaction?.isChatInputCommand()) {
            await this.executeCommand();
        }
        else if (this.interaction?.isContextMenuCommand()) {
            this.interaction.commandName = this.interaction.commandName.toLowerCase();
            await this.executeCommand();
        }
        else if (this.interaction?.isStringSelectMenu()) {
            const script = this.client.interactionManager.getInteraction("StringSelectMenuInteraction");
            try {
                await script.exe(
                    this.client,
                    this.interaction,
                    this.client.languageManager.getLang(this.client.getLang(this.interaction.user.id)).json,
                );
            }
            catch (err) {
                this.client.catchError(err);
            }
        }
    }

    async executeCommand() {
        try {
            let cmd = this.client.commandManager.getCommand(this.interaction.commandName);
            if (cmd === 0) return;

            const userLang = (await this.client.userDb.get(this.interaction.user.id)).lang;

            cmd = new cmd();
            cmd.init(this.client, this.interaction, this.client.languageManager.getLang(userLang));

            const cooldownReady = await cmd.cooldownReady(true);
            if (!cooldownReady) return;

            const requestReady = await cmd.requestReady();
            if (!requestReady) return;

            const permissionsReady = await cmd.permissionsReady();
            if (!permissionsReady) return;

            const clientPermissionsReady = await cmd.clientPermissionsReady();
            if (!clientPermissionsReady) return;

            const authorizationsReady = await cmd.authorizationsReady();
            if (!authorizationsReady) return;

            const clientStatusReady = await cmd.clientStatusReady();
            if (!clientStatusReady) return;

            if (await this.client.commandManager.isOverloaded()) {
                return this.interaction.channel.send("Le bot est actuellement surchargé, veuillez réessayer plus tard.");
            }

            this.client.lastChannelsManager.add(
                this.interaction.user.id, { key: "main", value: this.interaction.channel },
            );

            const placeLink = await this.client.getPlaceLink(this.interaction.channel)
                ?? `https://discord.com/channels/${this.interaction.guildId}/${this.interaction.channelId}`;
            this.client.requestsManager.add(
                this.interaction.user.id,
                {
                    key: cmd.infos.name,
                    value: {
                        ts: Date.now(),
                        link: placeLink,
                    },
                },
            );

            try {
                this.client.util.timelog(`[Command] ${cmd.infos.name} - ${cmd.interaction.user.tag} (${cmd.interaction.user.id})`, "yellowBright");
                await cmd.run();
            }
            catch (err) {
                await this.interaction.channel.send({ content: ":x: **An error occurred.**" }).catch(this.client.catchError);
                await this.client.catchError(err);
                this.client.requestsManager.remove(this.interaction.user.id, cmd.infos.name);
            }
        }
        catch (err) {
            await this.interaction.channel.send({ content: ":x: **An error occurred.**" }).catch(this.client.catchError);
            await this.client.catchError(err);
        }
    }
}

module.exports = InteractionCreate;