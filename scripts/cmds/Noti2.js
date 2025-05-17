const { getStreamsFromAttachment } = global.utils;

module.exports = {
	config: {
		name: "notification2",
		aliases: ["noti2"],
		version: "1.2",
		author: "Arafat Da",
		countDown: 5,
		role: 2,
		description: {
			en: "Send notification with message + replied attachment to a selected group"
		},
		category: "OWNER"
	},

	onStart: async function ({ message, api, event, args, threadsData }) {
		const allThreads = (await threadsData.getAll())
			.filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);

		if (allThreads.length === 0)
			return message.reply("কোনো গ্রুপ পাই নাই!");

		let listText = "সব গ্রুপ:\n\n";
		const mapIndexToThread = [];

		allThreads.forEach((thread, index) => {
			const name = thread.threadName || `Unnamed (${thread.threadID})`;
			listText += `${index + 1}. ${name}\n`;
			mapIndexToThread.push({ index: index + 1, threadID: thread.threadID, name });
		});

		message.reply(listText + "\n\nযেই নাম্বারে পাঠাবি, ওটা reply কর (attachment ছাড়াও চলবে)।", (err, info) => {
			global.GoatBot.onReply.set(info.messageID, {
				commandName: "notification2",
				messageID: info.messageID,
				mapIndexToThread,
				originalArgs: args,
				author: event.senderID,
				attachmentReply: event.messageReply?.attachments || []
			});
		});
	},

	onReply: async function ({ message, api, event, Reply }) {
		if (event.senderID !== Reply.author)
			return;

		const index = parseInt(event.body);
		if (isNaN(index) || index < 1 || index > Reply.mapIndexToThread.length)
			return message.reply("সঠিক নাম্বার দে ভাই!");

		const chosen = Reply.mapIndexToThread.find(i => i.index === index);

		const allAttachments = [
			...Reply.attachmentReply
		].filter(item =>
			["photo", "png", "animated_image", "video", "audio"].includes(item.type)
		);

		const formSend = {
			body: `~🗣️ ADMIN Ⓐⓡⓐⓕⓐⓣ\n────────────────\n${Reply.originalArgs.join(" ")}`,
			attachment: await getStreamsFromAttachment(allAttachments)
		};

		try {
			await api.sendMessage(formSend, chosen.threadID);
			message.reply(`✅ "${chosen.name}" গ্রুপে পাঠানো হইছে!`);
		} catch (e) {
			message.reply("❌ পাঠাতে সমস্যা হইছে:\n" + e.message);
		}
	}
};
