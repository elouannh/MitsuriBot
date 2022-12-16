const SQLiteTable = require("./SQLiteTable");

function schema() {
    return {
        staff: {
            owners: [],
            administrators: [],
            moderators: [],
        },
        status: {
            latency: 0,
            mode: "0b0000",
        },
        webhooks: {
            rolesFr: {
                id: "",
                token: "",
            },
        },
    };
}

class InternalServerManager extends SQLiteTable {
    constructor(client) {
        super(client, "internalServer", schema);
    }

    get main() {
        this.ensureInDeep("main");
        return this.get("main");
    }

    get owners() {
        return this.main.staff.owners;
    }

    addOwner(id) {
        if (!this.main.staff.owners.includes(id)) this.db.push("main", id, "staff.owners");
    }

    get administrators() {
        return this.main.staff.administrators;
    }

    get moderators() {
        return this.main.staff.moderators;
    }

    get staff() {
        const staff = {};
        for (const owner of this.owners) {
            if (!(staff instanceof Array)) staff[owner] = [];
            staff[owner].push("owner");
        }
        for (const admin of this.administrators) {
            if (!(staff instanceof Array)) staff[admin] = [];
            staff[admin].push("administrator");
        }
        for (const moderator of this.moderators) {
            if (!(staff instanceof Array)) staff[moderator] = [];
            staff[moderator].push("moderator");
        }
        return Object.entries(staff);
    }

    get latency() {
        return this.main.status.latency;
    }

    get statusMode() {
        return this.main.status.mode;
    }

    get webhooks() {
        return this.main.webhooks;
    }

    async getWebhook(channel, webhookData, webhookName) {
        const wh = this.webhooks?.[webhookName];

        let webhook = null;
        if (
            !wh ||
            wh.id.length < 1 ||
            wh.token.length < 1 ||
            !(await this.client.fetchWebhook(wh.id, wh.token).catch(() => null))
        ) {
            webhook = await channel.createWebhook({
                name: webhookData.name,
                avatar: this.client.enums.Images.Webhook.Roles,
                reason: "Created a webhook.",
            }).catch(this.client.catchError);

            this.db.set("main", { id: webhook.id, token: webhook.token }, `webhooks.${webhookName}`);
        }
        else {
            webhook = await this.client.fetchWebhook(wh.id, wh.token).catch(this.client.catchError);
        }

        return webhook;
    }

    userBitField(userId) {
        let bitfield = "0b";
        for (const grade of ["owners", "administrators", "moderators"]) {
            if (this[grade].includes(userId)) bitfield += "1";
            else bitfield += "0";
        }
        return bitfield;
    }
}

module.exports = InternalServerManager;