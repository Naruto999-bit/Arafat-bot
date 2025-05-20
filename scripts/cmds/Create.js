const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "create",
    version: "1.0.0",
    author: "Islamick Chat",
    countDown: 2,
    role: 0,
    shortDescription: "Generate AI images",
    longDescription: "Use this command to generate AI images from text prompt.",
    category: "image",
    guide: {
      en: "{pn} <text>"
    }
  },

  onStart: async function ({ message, args }) {
    const query = args.join(" ");
    if (!query) return message.reply("𝖯𝗅𝖾𝖺𝗌𝖾 𝗎𝗌𝖾 ✓𝗀𝖾𝗇𝗆𝖺𝗀𝖾 <𝗍𝖾𝗑𝗍>");

    const imgPath = path.join(__dirname, "cache", "poli.png");

    try {
      const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
        responseType: "arraybuffer"
      });

      await fs.ensureDir(path.dirname(imgPath));
      fs.writeFileSync(imgPath, Buffer.from(response.data, "utf-8"));

      await message.reply({
        body: "𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐅𝐨𝐫 𝐘𝐨𝐮𝐫 𝐂𝐫𝐞𝐚𝐭𝐞 𝐈𝐦𝐠✨🌺",
        attachment: fs.createReadStream(imgPath)
      });

      fs.unlinkSync(imgPath);
    } catch (e) {
      console.error(e);
      message.reply("❌ 𝙀𝙧𝙧𝙤𝙧 𝙬𝙝𝙞𝙡𝙚 𝙘𝙧𝙚𝙖𝙩𝙞𝙣𝙜 𝙞𝙢𝙖𝙜𝙚.");
    }
  }
};
