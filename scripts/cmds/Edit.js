const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ইন-মেমোরি ইউজারের শেষ কমান্ড
const userCommands = {};

module.exports = {
  name: "edit",
  aliases: ["editimg"],
  description: "Send command like /edit grayscale then send image to edit",
  usage: "/edit [grayscale|rotate|blur]",
  async execute({ msg, sock, args }) {
    const senderId = msg.key.remoteJid;
    const command = args[0]?.toLowerCase();

    if (!command || !["grayscale", "rotate", "blur"].includes(command)) {
      return sock.sendMessage(senderId, { text: "Please specify a valid command: grayscale, rotate, or blur.\nExample: /edit grayscale" }, { quoted: msg });
    }

    userCommands[senderId] = command;

    return sock.sendMessage(senderId, { text: `Okay, send me an image to apply: ${command}` }, { quoted: msg });
  },

  // ছবির মেসেজগুলো এখানে প্রসেস করো
  async onImage({ msg, sock }) {
    const senderId = msg.key.remoteJid;
    const command = userCommands[senderId] || "grayscale"; // ডিফল্ট গ্রেস্কেল

    if (!msg.message.imageMessage) {
      return;
    }

    try {
      // ছবি ডাউনলোড করা
      const buffer = await sock.downloadMediaMessage(msg);

      const inputPath = path.join(__dirname, "input.jpg");
      const outputPath = path.join(__dirname, "output.jpg");

      fs.writeFileSync(inputPath, buffer);

      let edit = sharp(inputPath);

      switch (command) {
        case "grayscale":
          edit = edit.grayscale();
          break;
        case "rotate":
          edit = edit.rotate(90);
          break;
        case "blur":
          edit = edit.blur(5);
          break;
      }

      await edit.toFile(outputPath);

      const editedBuffer = fs.readFileSync(outputPath);

      // ছবি সেন্ড করা
      await sock.sendMessage(senderId, {
        image: editedBuffer,
        caption: `Here is your ${command} edited image!`
      }, { quoted: msg });

      // ইউজারের কমান্ড রিসেট
      delete userCommands[senderId];

      // টেম্প ফাইল ডিলিট
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

    } catch (err) {
      console.error("Image processing error:", err);
      await sock.sendMessage(senderId, { text: "Failed to process the image." }, { quoted: msg });
    }
  }
};
