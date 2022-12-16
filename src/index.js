require("dotenv").config();
const Client = require("./base/Client.js");
const main = require("./main");

const client = new Client();

void main(client);

void client.launch();