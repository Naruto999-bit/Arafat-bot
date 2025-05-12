const axios = require('axios');
module.exports = {
	config: {
		name: "coinflip",
		aliases: ["cf"],
		version: "1.0",
		author: "𝗦𝗵𝗔𝗻",
		countDown: 5,
		role: 0,
		shortDescription: "Flip the coin",
		longDescription: "Flip the coin",
		category: "𝗙𝗨𝗡",
		guide: {
			en: "{pn}"
		},
	},

	onStart: async function ({ message, args, api, event }) {
		api.setMessageReaction("✅", event.messageID, (err) => {}, true);
		const isFaceUp = Math.random() > 0.5;
		let link, body;
		if (isFaceUp) {
			link = "https://i.ibb.co/xSsMRL9/image.png", "https://i.ibb.co/4Zf3M07/image.png", "https://i.ibb.co/PCKdPg6/image.png";
			body = "Face is up!";
		} else {
			link = "https://i.ibb.co/FhMwzL9/image.png";
			body = "Face is down!";
		}
		const msg = {
			body: body,
			attachment: await global.utils.getStreamFromURL(link)
		};
		api.sendMessage(msg, event.threadID);
	}
}
