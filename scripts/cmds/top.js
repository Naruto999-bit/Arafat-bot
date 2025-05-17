module.exports = {
  config: {
    name: "top",
    version: "1.2",
    author: "Shikaki",
    category: "economy",
    shortDescription: {
      vi: "Xem 10 người giàu nhất",
      en: "View the top 10 richest people",
    },
    longDescription: {
      vi: "Xem danh sách 10 người giàu nhất trong nhóm",
      en: "View the list of the top 10 richest people in the group",
    },
    guide: {
      en: "{pn} 1\n{pn} 50\n{pn} 100",
    },
    role: 0,
  },

  onStart: async function ({ message, usersData, args }) {
    const allUserData = await usersData.getAll();
    const sortedUsers = allUserData
      .filter(user => !isNaN(user.money))
      .sort((a, b) => b.money - a.money);

    let msg = "------- Top Richest People -------\n";

    const topCount = Math.min(parseInt(args[0]) || 10, sortedUsers.length);
    if (topCount <= 0) return message.reply("Please enter a number greater than 0.");

    sortedUsers.slice(0, topCount).forEach((user, index) => {
      const formattedBalance = formatNumberWithFullForm(user.money);
      msg += `${index + 1}. ${user.name} (UID: ${user.userID}) | $${formattedBalance}\n`;
    });

    msg += "----------------------------------";
    message.reply(msg);
  },
};

function formatNumberWithFullForm(number) {
  const fullForms = [
    "", "Thousand", "Million", "Billion", "Trillion", "Quadrillion",
    "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion",
    "Decillion", "Undecillion", "Duodecillion", "Tredecillion",
    "Quattuordecillion", "Quindecillion", "Sexdecillion", "Septendecillion",
    "Octodecillion", "Novemdecillion", "Vigintillion", "Unvigintillion",
    "Duovigintillion", "Tresvigintillion", "Quattuorvigintillion",
    "Quinvigintillion", "Sesvigintillion", "Septemvigintillion",
    "Octovigintillion", "Novemvigintillion", "Trigintillion",
    "Untrigintillion", "Duotrigintillion", "Googol",
  ];

  let fullFormIndex = 0;
  while (number >= 1000 && fullFormIndex < fullForms.length - 1) {
    number /= 1000;
    fullFormIndex++;
  }

  const formattedNumber = number.toFixed(2);
  return `${formattedNumber} ${fullForms[fullFormIndex]}`;
}
