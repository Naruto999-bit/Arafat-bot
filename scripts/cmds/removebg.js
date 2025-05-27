module.exports.config = {
  name: "removebg",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Arafat",
  description: "Remove background from image using remove.bg API",
  commandCategory: "image",
  usages: "[reply image]",
  cooldowns: 5,
  aliases: ["rmbg"]
};

module.exports.onStart = async function ({ api, event }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const request = require("request");
  const { messageID, threadID, type, messageReply } = event;

  if (type !== "message_reply" || !["photo", "sticker"].includes(messageReply.attachments[0]?.type)) {
    return api.sendMessage("অনুগ্রহ করে একটি ছবিতে রিপ্লাই দিয়ে কমান্ড দিন।", threadID, messageID);
  }

  const imageUrl = messageReply.attachments[0].url;
  const inputPath = __dirname + `/cache/input.png`;
  const outputPath = __dirname + `/cache/output.png`;

  const downloadImg = (uri, filename, callback) => {
    request.head(uri, () => {
      request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
    });
  };

  downloadImg(imageUrl, inputPath, () => {
    const formData = {
      image_file: fs.createReadStream(inputPath),
      size: "auto",
    };

    api.sendMessage("ছবির ব্যাকগ্রাউন্ড রিমুভ হচ্ছে, একটু অপেক্ষা করো...", threadID, async () => {
      try {
        const response = await axios({
          method: "post",
          url: "https://api.remove.bg/v1.0/removebg",
          data: formData,
          responseType: "arraybuffer",
          headers: {
            ...formData.getHeaders?.() || { "Content-Type": "multipart/form-data" },
            "X-Api-Key": "pU61q1YWP8hu2RB2tDpuYFqR",
          },
        });

        fs.writeFileSync(outputPath, response.data);
        api.sendMessage(
          {
            body: "ব্যাকগ্রাউন্ড রিমুভ হয়ে গেছে!",
            attachment: fs.createReadStream(outputPath),
          },
          threadID,
          () => {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
          },
          messageID
        );
      } catch (err) {
        console.error(err);
        api.sendMessage("ব্যাকগ্রাউন্ড রিমুভ করতে সমস্যা হয়েছে!", threadID, messageID);
      }
    });
  });
};
