const TableData = require("../../TableData");
const UserLevel = require("../../UserLevel");

class UserData extends TableData {
    constructor(client, userData, lang) {
        super(client, userData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        this.data.level = new UserLevel(this.data.exp);
        delete this.data.exp;
        console.log(this.data.level);
    }
}

module.exports = UserData;