const fs = require("fs");
const { Collection } = require("discord.js");

class InteractionManager {
    constructor(client, dir = "./src/interactions/") {
        this.client = client;
        this.dir = dir;

        // .............<string, Command>
        this.interactions = new Collection();
    }

    loadFiles() {
        const interactionFolder = fs.readdirSync(this.dir);
        interactionFolder.forEach(file => {
            const interaction = new (require(`../interactions/${file}`))(this.client);
            this.interactions.set(interaction.interactionInfos.name, interaction);
        });
    }

    getInteraction(name) {
        if (this.interactions.has(name)) { return this.interactions.get(name); }
        else {
            return 0;
        }
    }
}

module.exports = InteractionManager;