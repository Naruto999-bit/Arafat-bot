const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "hugv2",
    aliases: [],
    version: "3.1.1",
    author: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    countDown: 5,
    role: 0,
    shortDescription: "Hug someone 🥰",
    longDescription: "Send a hug image by tagging someone!",
    category: "image",
    guide: "{pn} @mention"
  },

  onStart: async function ({ api, event, args }) {
    const mention = Object.keys(event.mentions);
    const { threadID, messageID, senderID } = event;

    if (!mention[0]) {
      return api.sendMessage("❌ একজনকে ট্যাগ করো যাকে তুমি হাগ দিতে চাও।", threadID, messageID);
    }

    const one = senderID;
    const two = mention[0];
    const imagePath = await makeImage({ one, two });

    return api.sendMessage(
      {
        body: "",
        attachment: fs.createReadStream(imagePath)
      },
      threadID,
      () => fs.unlinkSync(imagePath),
      messageID
    );
  },

  onLoad: async function () {
    const dir = path.join(__dirname, "cache/canvas");
    const imgPath = path.join(dir, "hugv2.png");

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(imgPath)) {
      const response = await axios.get("https://i.ibb.co/zRdZJzG/1626342271-28-kartinkin-com-p-anime-obnimashki-v-posteli-anime-krasivo-30.jpg", { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(response.data, "utf-8"));
    }
  }
};

async function makeImage({ one, two }) {
  const __root = path.resolve(__dirname, "cache", "canvas");
  const baseImg = await jimp.read(path.join(__root, "hugv2.png"));

  const avatarOnePath = path.join(__root, `avt_${one}.png`);
  const avatarTwoPath = path.join(__root, `avt_${two}.png`);
  const outputPath = path.join(__root, `hug_${one}_${two}.png`);

  const avatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  const avatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;

  fs.writeFileSync(avatarOnePath, Buffer.from(avatarOne, 'utf-8'));
  fs.writeFileSync(avatarTwoPath, Buffer.from(avatarTwo, 'utf-8'));

  const circleOne = await jimp.read(await circle(avatarOnePath));
  const circleTwo = await jimp.read(await circle(avatarTwoPath));

  baseImg.composite(circleOne.resize(100, 100), 370, 40);
  baseImg.composite(circleTwo.resize(100, 100), 330, 150);

  const raw = await baseImg.getBufferAsync("image/png");
  fs.writeFileSync(outputPath, raw);
  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return outputPath;
}

async function circle(imagePath) {
  const image = await jimp.read(imagePath);
  image.circle();
  return await image.getBufferAsync("image/png");
}
