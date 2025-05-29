const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json");
  return base.data.api;
};

async function downloadStream(url, filePath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer'
  });

  const sizeInMB = Buffer.byteLength(response.data) / (1024 * 1024);
  if (sizeInMB > 50) throw new Error("⭕ ভিডিওটা ৫০MB এর বেশি। ছোট একটা ভিডিও ট্রাই কর।");

  fs.writeFileSync(filePath, Buffer.from(response.data));
  return fs.createReadStream(filePath);
}

module.exports = {
  config: {
    name: "zakaria",
    aliases: ["zmak"],
    version: "1.0",
    author: "Arafat Da",
    countDown: 5,
    role: 0,
    shortDescription: "📥 ZMAK থেকে ভিডিও আনো",
    longDescription: "📥 YouTube চ্যানেল @zmak708 থেকে র‍্যান্ডম ভিডিও আনো",
    category: "media",
    guide: "{pn} অথবা {pn} zmak"
  },

  onStart: async function ({ api, event, message }) {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const channelHandle = "@zmak708";
      const apiBase = await baseApiUrl();

      // চ্যানেল নাম দিয়ে ভিডিও সার্চ
      const searchRes = await axios.get(`${apiBase}/ytFullSearch?songName=${channelHandle}`);
      const videos = searchRes.data;

      if (!videos || videos.length === 0)
        return message.reply("❌ কোনো ভিডিও পাওয়া যায়নি!");

      // র‍্যান্ডম ভিডিও বেছে নেওয়া
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      const { id, title } = randomVideo;

      // ডাউনলোড লিংক আনা
      const { data: { downloadLink, quality } } = await axios.get(`${apiBase}/ytDl3?link=${id}&format=mp4`);

      const filePath = path.join(__dirname, "cache", "zmakVideo.mp4");
      const stream = await downloadStream(downloadLink, filePath);

      await message.reply({
        body: `🎬 ${title}\n📥 Quality: ${quality}`,
        attachment: stream
      });

      fs.unlinkSync(filePath);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (err) {
      console.error(err);
      message.reply("❌ ভিডিও আনতে সমস্যা হচ্ছে, পরে আবার চেষ্টা করো!");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
