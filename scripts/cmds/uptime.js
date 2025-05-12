const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "2.0",
    author: "Arafat",
    countDown: 5,
    role: 0,
    shortDescription: "Show bot uptime",
    longDescription: "Display the current uptime with a status image",
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event }) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / (60 * 60 * 24));
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const minutes = Math.floor((uptime / 60) % 60);
    const seconds = Math.floor(uptime % 60);
    const ping = Date.now() - event.timestamp;

    const imagePath = path.join(__dirname, "assets", "uptime.jpg");

    if (!fs.existsSync(imagePath)) {
      return message.reply("❌ ফাইল পাওয়া যায়নি: assets/uptime.jpg");
    }

    message.send({
      body: 
`━━ BOT STATUS ━━
⏳ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s
⚡ Ping: ${ping}ms
✅ Status: Online
👑 Owner: Arafat`,
      attachment: fs.createReadStream(imagePath)
    });
  }
};
