const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class UserListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async overListener(key, before, after) {
        if (before !== after) {
            void null;
        }
    }
}

module.exports = UserListener;