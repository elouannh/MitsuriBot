const { Client: DiscordClient, User } = require("discord.js");


class Client extends DiscordClient {
    constructor() {
        super({
            intents: 3276799,
            failIfNotExists: false,
        });

        this.token = require("../../token.json").token;
    }

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
            void err;
        }

        return Object.assign(user, { cached });
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