const userCommands = {};

module.exports = {
  name: "edit",
  aliases: ["editimg"],
  description: "Set an image editing command (grayscale, rotate, blur)",
  usage: "/edit grayscale",
  cooldown: 3,
  async execute({ api, event, args }) {
    const command = args[0]?.toLowerCase();

    if (!command || !["grayscale", "rotate", "blur"].includes(command)) {
      return api.sendMessage(
        "দয়া করে একটি কমান্ড লিখুন:\n- grayscale\n- rotate\n- blur\n\nউদাহরণ: /edit grayscale",
        event.threadID,
        event.messageID
      );
    }

    // Save user command to memory
    userCommands[event.senderID] = command;
    return api.sendMessage(`ঠিক আছে! এখন একটি ছবি পাঠাও, আমি ${command} প্রয়োগ করব।`, event.threadID, event.messageID);
  },

  // imageHandler এভাবে আলাদা করে export করো
  imageHandler: async function ({ api, event, download }) {
    const command = userCommands[event.senderID] || "grayscale";

    try {
      const imagePath = await download(); // default: downloads image and returns path
      const sharp = require("sharp");
      const fs = require("fs");

      const editedPath = __dirname + "/edited_" + Date.now() + ".jpg";

      let image = sharp(imagePath);

      switch (command) {
        case "grayscale":
          image = image.grayscale();
          break;
        case "rotate":
          image = image.rotate(90);
          break;
        case "blur":
          image = image.blur(5);
          break;
      }

      await image.toFile(editedPath);

      await api.sendMessage(
        {
          body: `এখানে তোমার ${command} করা ছবি!`,
          attachment: fs.createReadStream(editedPath),
        },
        event.threadID,
        () => {
          // Cleanup
          fs.unlinkSync(imagePath);
          fs.unlinkSync(editedPath);
        },
        event.messageID
      );

      delete userCommands[event.senderID];

    } catch (err) {
      console.error(err);
      api.sendMessage("ছবি প্রসেস করতে সমস্যা হয়েছে!", event.threadID, event.messageID);
    }
  }
};
