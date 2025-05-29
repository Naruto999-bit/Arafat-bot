const axios = require("axios");

module.exports = {
  config: {
    name: "ip",
    version: "1.0.0",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Check IP info"
    },
    longDescription: {
      en: "View your IP information or another IP"
    },
    category: "tools",
    guide: {
      en: "{pn} [ip address]"
    }
  },

  onStart: async function ({ message, args, event }) {
    const timeStart = Date.now();

    if (!args[0]) {
      return message.reply("⚠️ Please enter the IP address you want to check.");
    }

    try {
      const res = await axios.get(`http://ip-api.com/json/${args.join(' ')}?fields=66846719`);
      const infoip = res.data;

      if (infoip.status === 'fail') {
        return message.reply(`❌ Error: ${infoip.message}`);
      }

      const replyText = `====== ${(Date.now() - timeStart)}ms ======
🗺️ Continent: ${infoip.continent}
🏳️ Nation: ${infoip.country}
🎊 Country Code: ${infoip.countryCode}
🕋 Area: ${infoip.region}
⛱️ Region/State: ${infoip.regionName}
🏙️ City: ${infoip.city}
🛣️ District: ${infoip.district}
📮 ZIP Code: ${infoip.zip}
🧭 Latitude: ${infoip.lat}
🧭 Longitude: ${infoip.lon}
⏱️ Timezone: ${infoip.timezone}
👨‍✈️ Organization: ${infoip.org}
💵 Currency: ${infoip.currency}`;

      return message.send({
        body: replyText,
        location: {
          latitude: infoip.lat,
          longitude: infoip.lon,
          current: true
        }
      });

    } catch (err) {
      console.log(err);
      return message.reply("❌ An unexpected error occurred. Please try again later.");
    }
  }
};
