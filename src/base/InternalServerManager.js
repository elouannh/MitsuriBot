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