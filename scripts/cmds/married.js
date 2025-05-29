const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "married",
    version: "1.0",
    author: "Arafaf",
    countDown: 5,
    role: 0,
    shortDescription: "ম্যারেড ইমেজ জেনারেটর",
    longDescription: "ম্যারেড ইফেক্টে দুইজন ইউজারের প্রোফাইল ছবি বসিয়ে একটি মজার ইমেজ তৈরি করে।",
    category: "image",
    guide: "{pn} @mention"
  },

  onStart: async function ({ event, message, usersData, args }) {
    const mention = Object.keys(event.mentions);
    if (!mention[0]) return message.reply("⚠️ দয়া করে কাউকে ট্যাগ করো।");

    const one = event.senderID;
    const two = mention[0];

    const imgPath = await makeImage({ one, two });
    return message.send({
      body: "💍 আপনারা এখন ম্যারেড!",
      attachment: fs.createReadStream(imgPath)
    }, () => fs.unlinkSync(imgPath));
  },

  onLoad: async () => {
    const cachePath = path.join(__dirname, "cache", "canvas");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

    const imgURL = "https://i.imgur.com/txnRTKf.png";
    const marriedPath = path.join(cachePath, "married.png");
    if (!fs.existsSync(marriedPath)) {
      const res = await axios.get(imgURL, { responseType: "arraybuffer" });
      fs.writeFileSync(marriedPath, res.data);
    }
  }
};

async function makeImage({ one, two }) {
  const __root = path.join(__dirname, "cache", "canvas");

  const background = await jimp.read(path.join(__root, "married.png"));
  const avatarOnePath = path.join(__root, `avt_${one}.png`);
  const avatarTwoPath = path.join(__root, `avt_${two}.png`);

  const avtOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarOnePath, Buffer.from(avtOne, "utf-8"));

  const avtTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarTwoPath, Buffer.from(avtTwo, "utf-8"));

  const circleOne = await jimp.read(await circle(avatarOnePath));
  const circleTwo = await jimp.read(await circle(avatarTwoPath));

  background
    .composite(circleOne.resize(170, 170), 1520, 210)
    .composite(circleTwo.resize(170, 170), 980, 300);

  const outPath = path.join(__root, `married_${one}_${two}.png`);
  await background.writeAsync(outPath);

  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return outPath;
}

async function circle(imagePath) {
  const image = await jimp.read(imagePath);
  image.circle();
  return await image.getBufferAsync("image/png");
      }
