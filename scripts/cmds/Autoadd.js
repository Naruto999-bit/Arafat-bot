// Auto Add Command by Arafat Da

// প্রথমে globally একটি Map তৈরি করে নিই:
if (!global.autoAdd) global.autoAdd = new Map();

module.exports = {
  config: {
    name: "autoadd",
    version: "1.2",
    author: "Arafat Da",
    countDown: 0,
    role: 1,
    shortDescription: {
      en: "Toggle auto add user on leave"
    },
    longDescription: {
      en: "Automatically re-add users who leave the group"
    },
    category: "group",
    guide: {
      en: "{pn} on | off"
    }
  },

  onStart: async function ({ message, event, args }) {
    const threadID = event.threadID;

    if (args[0] === "on") {
      global.autoAdd.set(threadID, true);
      return message.reply("✅ Auto-add is now ON. If someone leaves, bot will re-add them.");
    } else if (args[0] === "off") {
      global.autoAdd.set(threadID, false);
      return message.reply("❌ Auto-add is now OFF.");
    } else {
      const status = global.autoAdd.get(threadID) ? "ON ✅" : "OFF ❌";
      return message.reply(`Current status: ${status}\nUse: #autoadd on/off`);
    }
  },

  onEvent: async function ({ event, api }) {
    const { threadID, logMessageType, logMessageData } = event;

    if (logMessageType === "log:unsubscribe") {
      const isOn = global.autoAdd.get(threadID);
      if (isOn) {
        const leftUID = logMessageData.leftParticipantFbId;
        try {
          await api.addUserToGroup(leftUID, threadID);
        } catch (err) {
          console.log("❌ Couldn't re-add user:", err);
        }
      }
    }
  }
};
