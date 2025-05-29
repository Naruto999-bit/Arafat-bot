const axios = require("axios");
const fs = require("fs");
const request = require("request");

const videoLinks = [
  "https://i.imgur.com/kfJCVZe.mp4"
];

module.exports = {
  config: {
    name: "😭",
    version: "1.0.0",
    credits: "Arafat",
    description: "auto reply to 😭 message",
    usage: "😭",
    cooldown: 5,
    permissions: [0],
    commandCategory: "noprefix",
    dependencies: {
      "request": "",
      "axios": "",
      "fs-extra": ""
    }
  },

  languages: {
    en: {
      on: "on",
      off: "off",
      successText: "Success!"
    },
    vi: {
      on: "Bật",
      off: "Tắt",
      successText: "Thành công!"
    }
  },

  onStart: async function ({ message, event, threadsData, getLang }) {
    const threadID = event.threadID;
    let data = await threadsData.get(threadID);
    if (!data) data = {};
    if (typeof data["😭"] === "undefined" || data["😭"]) data["😭"] = false;
    else data["😭"] = true;
    await threadsData.set(threadID, data);
    return message.reply(`${data["😭"] ? getLang("off") : getLang("on")} ${getLang("successText")}`);
  },

  onChat: async function ({ message, event, threadsData }) {
    const { threadID, body } = event;
    if (!body) return;

    const text = body.toLowerCase();
    const data = await threadsData.get(threadID) || {};
    if (data["😭"] === false) return;

    if (text.startsWith("😭")) {
      const captions = [
        "╭•┄┅════❁🎀❁════┅┄•╮\n\nআমি বলবো কেমন করে এরিন এবং মিকাসার স্টোরি-!!😭\n\n╰•┄┅════❁🎀❁════┅┄•╯",
        "╭•┄┅════❁🎀❁════┅┄•╮\n\nআমি বলবো কেমন করে এরিন এবং মিকাসার স্টোরি-!!😭\n\n╰•┄┅════❁🎀❁════┅┄•╯"
      ];
      const messageText = captions[Math.floor(Math.random() * captions.length)];
      const videoUrl = videoLinks[Math.floor(Math.random() * videoLinks.length)];
      const videoPath = __dirname + "/cache/😭.mp4";

      request(encodeURI(videoUrl))
        .pipe(fs.createWriteStream(videoPath))
        .on("close", () => {
          message.reply({
            body: messageText,
            attachment: fs.createReadStream(videoPath)
          }, () => fs.unlinkSync(videoPath));
        });
    }
  }
};
