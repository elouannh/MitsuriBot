const Interaction = require("../base/Interaction");

class StringSelectMenuInteraction extends Interaction {
    constructor(client) {
        super({
            name: "StringSelectMenuInteraction",
        }, client);
    }

    async exe(client, interaction, lang) {
        this.client.util.timelog("StringSelectMenuInteraction");
    }
}

module.exports = StringSelectMenuInteraction;