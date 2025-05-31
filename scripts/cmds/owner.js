const { GoatWrapper } = require('fca-liane-utils');
const axios = require('axios');
const path = require('path');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "owner",
    aurthor: "Arafat", // Don't Change It
    role: 0,
    shortDescription: "Owner info",
    longDescription: "Show info of the owner",
    category: "𝗜𝗡𝗙𝗢",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, args }) {
    const content = (event.body || "").toLowerCase();
    if (!content.includes("owner") && !content.includes("arafat")) return;

    api.setMessageReaction('😍', event.messageID, (err) => {}, true);

    try {
      const ShanInfo = {
        name: '(╹◡╹)𝐀𝐫𝐚𝐟𝐚𝐭Ψ',
        nick: '𝐀𝐫𝐚𝐟𝐚𝐭',
        gender: '𝑴𝒂𝑳𝒆',
        birthday: '23-11-𝟐𝟎𝟎7',
        age: '17',
        Status: 'আমি বললুম না আমার শরম করে😝🤭',
        hobby: '𝑺𝒍𝒆𝒆𝑷𝒊𝒏𝑮',
        religion: '𝙄𝒔𝒍𝑨𝒎',
        height: '5"3',
        Fb: 'https://www.facebook.com/arafatas602',
        messenger: 'https://m.me/arafat602',
        authorNumber: 'এইটা পার্সোনাল',
        insta: 'https://www.instagram.com/iam_Arafat_602',
        tg: 'https://t.me/arafatas602',
        capcut: 'কোনো আইড়ি নাই , Alight motion ব্যবহার করি।',
        tiktok: 'আমি প্রতিবন্ধী না 🙂',
        youtube: 'নিজের কোনো চ্যানেল নাই ☺️',
      };

      const now = moment().tz('Asia/Jakarta');
      const date = now.format('MMMM Do YYYY');
      const time = now.format('h:mm:ss A');
      const uptime = process.uptime();
      const seconds = Math.floor(uptime % 60);
      const minutes = Math.floor((uptime / 60) % 60);
      const hours = Math.floor((uptime / (60 * 60)) % 24);
      const days = Math.floor(uptime / (60 * 60 * 24));
      const uptimeString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;

      const ShAn = [
        'https://drive.google.com/uc?export=download&id=1-9Ob2FcX6nBxbL4tdIV_kHAKYT0mHJfb',
        'https://drive.google.com/uc?export=download&id=1-ByBR7FxnkLSKJWssY4rXRd_l-FiDefT',
        'https://drive.google.com/uc?export=download&id=1-HUnw2WpSAFPRqooNZrZPzowvqa9dzAT',
        'https://drive.google.com/uc?export=download&id=1-HvGg1Zq7IUgAtivU0N0nTJuUnNKPPmN',
        'https://drive.google.com/uc?export=download&id=1-OLyztNqnp4YWE7u071xarp57A5SFVYA',
        'https://drive.google.com/uc?export=download&id=1-LPTq8EECOjJBqYSOipIHR30GQnIVH6o',
        'https://drive.google.com/uc?export=download&id=1-Rk4wIlxJ42WTAQgSiQP8VR2eFgLFdno',
        'https://drive.google.com/uc?export=download&id=1-U4-X7XDXi9U_qXjjLJYujAeBSuT2C21',
        'https://drive.google.com/uc?export=download&id=1-CrrCXKnnqOsc8ZSlgHwTRqZxt-mqp-J',
        'https://drive.google.com/uc?export=download&id=1-V4WqHGSG1Gsfo2-mba_B8AftRMvdzOa'
      ];
      const ShaN = ShAn[Math.floor(Math.random() * ShAn.length)];

      const response = `💫《 ⩸__𝐁𝐨𝐭 𝐀𝐧𝐝 𝐎𝐰𝐧𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧__⩸ 》💫
\🤖彡𝐵𝑜𝑡 𝑁𝑎𝑚𝑒 : ⩸__${global.GoatBot.config.nickNameBot}__⩸
\👾彡𝐵𝑜𝑡 𝑆𝑦𝑠𝑡𝑒𝑚 𝑃𝑟𝑒𝑓𝑖𝑥 : ${global.GoatBot.config.prefix}
\💙彡𝑂𝑤𝑛𝑒𝑟 𝑁𝑎𝑚𝑒 : ${ShanInfo.name}
\🙆🏻‍♂️彡𝐺𝑒𝑛𝑑𝑒𝑟 : ${ShanInfo.gender}
\😶彡𝐵𝑖𝑟𝑡ℎ𝑑𝑎𝑦 : ${ShanInfo.birthday}
\📝彡𝐴𝑔𝑒  : ${ShanInfo.age}
\💕彡𝑅𝑒𝑙𝑎𝑡𝑖𝑜𝑛𝑆ℎ𝑖𝑝 : ${ShanInfo.Status}
\🐸彡𝐻𝑜𝑏𝑏𝑦 : ${ShanInfo.hobby}
\🕋彡𝑅𝑒𝑙𝑖𝑔𝑖𝑜𝑛 : ${ShanInfo.religion}
\🙎🏻‍♂️彡𝐻𝑖𝑔ℎ𝑡 : ${ShanInfo.height}
\🌍彡𝐹𝑎𝑐𝑒𝑏𝑜𝑜𝑘 𝐿𝑖𝑛𝑘 : ${ShanInfo.Fb}
\🌐彡𝑊𝑝 : ${ShanInfo.authorNumber}
\🔖彡𝐼𝑛𝑠𝑡𝑎𝑔𝑟𝑎𝑚 : ${ShanInfo.insta}
\🏷彡️𝑇𝑒𝑙𝑒𝑔𝑟𝑎𝑚 : ${ShanInfo.tg}
\☠彡️𝐶𝑎𝑝𝐶𝑢𝑡 : ${ShanInfo.capcut}
\🤡彡𝑇𝑖𝑘𝑇𝑜𝑘 : ${ShanInfo.tiktok}
\🤐彡𝑌𝑜𝑢𝑇𝑢𝑏𝑒 : ${ShanInfo.youtube}
\🗓彡𝐷𝑎𝑡𝑒 : ${date}
\⏰彡𝑁𝑜𝑤 𝑇𝑖𝑚𝑒 : ${time}
\🔰彡𝐴𝑛𝑦 𝐻𝑒𝑙𝑝 𝐶𝑜𝑛𝑡𝑎𝑐𝑡 :⩸__${ShanInfo.messenger}__⩸
\📛彡𝐵𝑜𝑡 𝐼𝑠 𝑅𝑢𝑛𝑛𝑖𝑛𝑔 𝐹𝑜𝑟 : ${uptimeString}
\===============`;

      await api.sendMessage({
        body: response,
        attachment: await global.utils.getStreamFromURL(ShaN)
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error('Error in ownerinfo command:', error);
      return api.sendMessage('❌ কিছু একটা ভুল হয়েছে!', event.threadID);
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
