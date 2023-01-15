const { ActivityType, Events } = require("discord.js");
const Event = require("../base/Event");

class Ready extends Event {
	constructor(client) {
		super({
			name: Events.ClientReady,
			once: true,
		}, client);
	}

	async exe() {
		this.client.commandManager.loadFiles();
		this.client.util.timelog(`Bot connecté en tant que ${this.client.chalk.bold(this.client.user.tag)} !`);

		try {
			let statusIndex = 0;
			setInterval(async () => {
				const activities = [
					{ name: "🌐 Support", type: ActivityType.Competing },
					{ name: `Version ${this.client.version}`, type: ActivityType.Watching },
				];
				this.client.user.setPresence({
					activities: [activities[statusIndex]],
					status: "online",
				});
				statusIndex += (statusIndex === (activities.length - 1) ? -statusIndex : 1);
			}, 15_000);
			setInterval(async () => {
				const guild = await this.client.guilds.cache.get("922404341107798036").members.fetch();

				for (const member of guild.map(m => m)) {
					if (!member.user.bot && member.user.id !== this.client.user.id && !member.roles.cache.has("1025812198276206662")) {
						member.roles.add("1025812198276206662").catch(this.client.catchError);
					}
				}
			}, 120_000);
		}
		catch (err) {
			await this.client.catchError(err);
		}
	}
}

module.exports = Ready;