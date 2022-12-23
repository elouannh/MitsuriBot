const { Client: DiscordClient, User, Guild, GuildMember, IntentsBitField } = require("discord.js");
const chalk = require("chalk");
const InternalServerManager = require("./InternalServerManager");
const CommandManager = require("./CommandManager");
const EventManager = require("./EventManager");
const InteractionManager = require("./InteractionManager");
const CollectionManager = require("./CollectionManager");
const LanguageManager = require("./LanguageManager");
const Util = require("./Util");
const Enumerations = require("./Enumerations");
const Duration = require("./Duration");
const config = require("../config.json");
const _package = require("../../package.json");
const UserDb = require("./database/tables/UserDb");
const fs = require("fs");
const flags = IntentsBitField.Flags;

class Client extends DiscordClient {
    constructor() {
        super({
            intents: new IntentsBitField().add(
                flags.GuildPresences, flags.Guilds,
                flags.GuildBans, flags.GuildMessages,
                flags.GuildMessageReactions, flags.GuildVoiceStates,
                flags.GuildMessageTyping, flags.Guilds,
                flags.GuildMembers, flags.GuildInvites,
                flags.GuildWebhooks, flags.GuildIntegrations,
                flags.GuildMessageReactions, flags.GuildMessageTyping,
                flags.DirectMessages, flags.DirectMessageReactions,
                flags.DirectMessageTyping,
            ),
            failIfNotExists: false,
        });
        this.chalk = chalk;
        this.util = Util;
        this.util.timelog("Starting bot process...");

        this.env = { ...process.env };

        this.commandManager = new CommandManager(this);
        this.eventManager = new EventManager(this);
        this.interactionManager = new InteractionManager(this);
        this.languageManager = new LanguageManager(this);
        this.requestsManager = new CollectionManager(
            this, "requests", this.util.reqCallbackFunction, Date.now,
        );
        this.cooldownsManager = new CollectionManager(
            this, "cooldowns", this.util.callbackFunction, () => 0,
        );
        this.lastChannelsManager = new CollectionManager(
            this, "lastChannels", this.util.callbackFunction, () => null,
        );

        this.mainLanguage = this.languageManager.getLang("fr");

        this.userDb = new UserDb(this);
        this.internalServerManager = new InternalServerManager(this);

        this.duration = Duration;
        this.enums = Enumerations;
        this.config = config;
        this.bitfield = 8n;
        this.version = _package.version;
        this.maxRequests = 30;

        this.texts = {};
        for (const file of fs.readdirSync("./src/texts")) {
            this.texts[file.split(".")[0]] = require(`../texts/${file}`);
        }

        this.token = require("../../token.json").token;
        this.interactionManager.loadFiles();
        this.eventManager.loadFiles();

        setInterval(() => {
            this.util.timelog("................", "blackBright");
        }, 900_000);
    }

    /**
     * Catch an error and log it (in a beautiful bright red).
     * @param {Error} error The error instance
     * @returns {void}
     */
    catchError(error) {
        const date = new Date();
        const data = {
            day: String(date.getDate()),
            month: String(date.getMonth() + 1),
            hour: String(date.getHours()),
            min: String(date.getMinutes()),
            sec: String(date.getSeconds()),
        };
        if (data.day.length < 2) data.day = "0" + data.day;
        if (data.month.length < 2) data.month = "0" + data.month;
        if (data.hour.length < 2) data.hour = "0" + data.hour;
        if (data.min.length < 2) data.min = "0" + data.min;
        if (data.sec.length < 2) data.sec = "0" + data.sec;
        console.log(chalk.redBright(`[${data.month}/${data.day}] [${data.hour}:${data.hour}:${data.sec}]  |  Error: ${error.stack}`));
    }

    /**
     * Returns the user if the id is able to be fetched.
     * @param {String} id The user ID
     * @param {*} secureValue The value to be returned if the user is not found
     * @returns {Promise<User & {cached: Boolean}>}
     */
    async getUser(id, secureValue) {
        let user = secureValue;
        let cached = false;

        try {
            if ((await this.users.fetch(id) instanceof User)) {
                user = await this.users.fetch(id);
                cached = true;
            }
        }
        catch (err) {
            this.catchError(err);
        }

        return Object.assign(user, { cached });
    }

    /**
     * Returns the membre of the guild if the id is able to be fetched.
     * @param {String} id The user ID
     * @param {Guild} guild The guild instance
     * @param {*} secureValue The value to be returned if the user is not found
     * @returns {Promise<GuildMember & {cached: Boolean}>}
     */
    async getMember(id, guild, secureValue) {
        let member = secureValue;
        let cached = false;

        try {
            if ((await guild.members.fetch(id) instanceof GuildMember)) {
                member = await guild.members.fetch(id);
                cached = true;
            }
        }
        catch (err) {
            this.catchError(err);
        }

        return Object.assign(member, { cached });
    }

    /**
     * Get the link of the message above the context.
     * @param {TextChannel} channel The channel instance
     * @returns {Promise<String>}
     */
    async getPlaceLink(channel) {
        let link = null;
        try {
            link = `https://discord.com/channels/${channel.guildId}/${channel.id}/${channel.lastMessageId}`;
        }
        catch (err) {
            this.catchError(err);
        }
        return link;
    }

    /**
     * Returns the channel if able to be fetched.
     * @param {String} id The channel ID
     * @param {*} secureValue The value to be returned if the channel is not found
     * @returns {Promise<TextChannel & {cached: Boolean}>}
     */
    async getChannel(id, secureValue) {
        let channel = secureValue;
        let cached = false;

        try {
            if ((await this.channels.fetch(id) instanceof Object)) {
                channel = await this.channels.fetch(id);
                cached = true;
            }
        }
        catch (err) {
            this.catchError(err);
        }

        return Object.assign(channel, { cached });
    }

    /**
     * Notify the user in a specific channel.
     * @param {TextChannel} channel The channel instance
     * @param {MessagePayload|MessageCreateOptions} payload The payload to send
     * @returns {Promise<string>}
     */
    async notify(channel, payload) {
        await channel.send(payload).catch(this.catchError);
    }

    launch() {
        return this.login(this.token);
    }

    async evalCode(code) {
        code = `(async () => {\n${code}\n})();`;
        const clean = text => {
            if (typeof text === "string") {
                return text.replace(/`/g, "`" + String.fromCharCode(8203))
                    .replace(/@/g, "@" + String.fromCharCode(8203));
            }
            else {
                return text;
            }
        };
        let response = `📥 **Input**\n\`\`\`js\n${clean(code)}\n\`\`\`\n📤 **Output**\n`;
        try {
            let evaled = await eval(code);
            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

            const cleanEvaled = clean(evaled);
            if (cleanEvaled === "undefined") {
                response += "```cs\n# Voided processus```";
            }
            else {
                response += `\`\`\`xl\n${cleanEvaled.substring(0, 2000 - response.length - 20)}\`\`\``;
            }
        }
        catch (err) {
            const cleanErr = clean(err.message);
            response += `\`\`\`xl\n${cleanErr.substring(0, 2000 - response.length - 20)}\`\`\``;
        }

        return response;
    }
}

module.exports = Client;