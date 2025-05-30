module.exports = {
	config: {
		name: "balance2", // নতুন নাম
		aliases: ["bal2"], // নতুন শর্টকাট
		version: "1.5",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "xem số tiền hiện có của bạn hoặc người được tag",
			en: "view your money or the money of the tagged person"
		},
		category: "economy",
		guide: {
			vi: "   {pn}: xem số tiền của bạn"
				+ "\n   {pn} <@tag>: xem số tiền của người được tag"
				+ "\n   {pn} <reply>: xem số tiền của người được reply"
				+ "\n   {pn} <uid>: xem số tiền của người có UID tương ứng",
			en: "   {pn}: view your money"
				+ "\n   {pn} <@tag>: view the money of the tagged person"
				+ "\n   {pn} <reply>: view the money of the replied person"
				+ "\n   {pn} <uid>: view the money of the user with the given UID"
		}
	},

	langs: {
		vi: {
			money: "Bạn đang có %1$",
			moneyOf: "%1 đang có %2$"
		},
		en: {
			money: "𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 %1$",
			moneyOf: "%2 𝐡𝐚𝐬 %1$"
		}
	},

	formatBalance: function (amount) {
		if (amount < 1000) return amount + "$";
		else if (amount < 1000000) return (amount / 1000).toFixed(1) + "k$";
		else if (amount < 1000000000) return (amount / 1000000).toFixed(1) + "M$";
		else if (amount < 1000000000000) return (amount / 1000000000).toFixed(1) + "B$";
		else if (amount < 1000000000000000) return (amount / 1000000000000).toFixed(1) + "T$";
		else if (amount < 1000000000000000000) return (amount / 1000000000000000).toFixed(1) + "Q$";
		else if (amount < 1000000000000000000000) return (amount / 1000000000000000000).toFixed(1) + "A$";
		else return (amount / 1000000000000000000000000).toFixed(1) + "D$";
	},

	onStart: async function ({ message, usersData, event, getLang, args }) {
		let targetIDs = [];

		if (Object.keys(event.mentions).length > 0) {
			targetIDs = Object.keys(event.mentions);
		}
		if (event.messageReply) {
			targetIDs.push(event.messageReply.senderID);
		}
		if (args.length > 0) {
			for (const arg of args) {
				if (!isNaN(arg)) {
					targetIDs.push(arg);
				}
			}
		}

		if (targetIDs.length === 0) {
			targetIDs.push(event.senderID);
		}

		let msg = "";
		for (const targetID of targetIDs) {
			const userData = await usersData.get(targetID, "money");
			const formattedMoney = this.formatBalance(userData);
			const userName = (await usersData.get(targetID, "name")) || "User";
			if (targetID === event.senderID) {
				msg += getLang("money", formattedMoney) + '\n';
			} else {
				msg += `${userName} 𝐡𝐚𝐬 ${formattedMoney} balance\n\n`;
			}
		}
		return message.reply(msg);
	}
};
