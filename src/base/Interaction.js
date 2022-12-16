class Interaction {
    constructor(interactionInfos = {
        name: "",
    }, client) {
        this.interactionInfos = interactionInfos;
        this.client = client;
    }

    async exe() {
        this.client.util.timelog(this.client.chalk.red("Default interaction (without configuration/implementation)."));
    }
}

module.exports = Interaction;