const SQLiteTable = require("../../SQLiteTable");
const UserData = require("../dataclasses/UserData");
const UserListener = require("../listeners/UserListener");
const { EmbedBuilder } = require("discord.js");

function schema(id) {
    return {
        id: id,
    };
}

class UserDb extends SQLiteTable {
    constructor(client) {
        super(client, "user", schema, UserListener);
    }

    async load(id) {
        return new UserData(this.client, this.get(id));
    }

    /**
     * Get the embed of the player profile.
     * @param {Object} lang The language object
     * @param {UserData} data The user data
     * @param {User} user The user
     * @returns {Promise<EmbedBuilder>}
     */
    async getEmbed(lang, data, user) {
        return new EmbedBuilder();
    }
}

module.exports = UserDb;