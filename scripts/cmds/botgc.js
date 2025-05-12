module.exports = {
	config: {
		name: "botgc",
		version: "1.0",
		author: "𝗦𝗵𝗔𝗻",
		role: 0,
		shortDescription: {
			en: "Adds the user to a specific thread."
		},
		longDescription: {
			en: "Adds the user to a specific thread and sends them a notification message."
		},
		category: "𝗕𝗢𝗫 𝗖𝗛𝗔𝗧",
		uide: {
			en: "Use {p}join to add yourself to the specified thread."
		}
	},
	onStart: async function ({ api, event, args }) {
		const threadID = "8500721853363569"; // ID of the thread to add the user to

		try {
			await api.addUserToGroup(event.senderID, threadID);
			api.sendMessage("You have been added to the group chat. Please check your Spam or Message Request folder if you can't find the group chat.", event.senderID);
		} catch (error) {
			api.sendMessage("Failed to add you to the group chat.", event.senderID);
		}
	}
};
