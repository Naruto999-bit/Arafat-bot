const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "2.0",
    author: "Arafat", // চাইলে নিজের নাম দিও
    countDown: 5,
    role: 0,
    shortDescription: "Show bot uptime",
    longDescription: "Display the current uptime, ping, and status image",
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

    const imageUrl = "https://i.imgur.com/NmE5wSm.jpeg"; // এখানে তোমার পছন্দের ছবি দাও
    const path = __dirname + "/cache/uptime.jpg";

    const img = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(img.data, "binary"));

    message.send({
      body:
`━━ BOT STATUS ━━
⏳ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s
⚡ Ping: ${ping}ms
👑 Owner: Arafat

Bot is alive and ready to rule!`,
      attachment: fs.createReadStream(path)
    }, () => fs.unlinkSync(path));
  }
};
