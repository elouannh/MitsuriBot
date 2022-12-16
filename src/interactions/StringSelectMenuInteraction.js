const Interaction = require("../base/Interaction");

class StringSelectMenuInteraction extends Interaction {
    constructor(client) {
        super({
            name: "StringSelectMenuInteraction",
        }, client);
    }

    async exe(client, interaction) {
        console.log(interaction);
    }
}

module.exports = StringSelectMenuInteraction;