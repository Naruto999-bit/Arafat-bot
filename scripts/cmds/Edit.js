const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || 'YOUR_PAGE_ACCESS_TOKEN';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'YOUR_VERIFY_TOKEN';

// ইউজারের শেষ কমান্ড সংরক্ষণ
const userCommands = new Map();

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    if (body.object !== 'page') return res.sendStatus(404);

    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message) {
        if (webhookEvent.message.text) {
          await handleTextMessage(senderId, webhookEvent.message.text);
        } else if (webhookEvent.message.attachments) {
          await handleAttachments(senderId, webhookEvent.message.attachments);
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// টেক্সট মেসেজ হ্যান্ডলার
async function handleTextMessage(senderId, text) {
  if (text.startsWith('/edit')) {
    const command = text.replace('/edit', '').trim().toLowerCase();
    if (!['grayscale', 'rotate', 'blur'].includes(command)) {
      await sendText(senderId, `Unknown command "${command}". Try: grayscale, rotate, blur`);
      return;
    }
    userCommands.set(senderId, command);
    await sendText(senderId, `Got it! Send me an image to apply the "${command}" effect.`);
  } else {
    await sendText(senderId, `Send /edit <command> to set an image edit command (grayscale, rotate, blur)`);
  }
}

// অ্যাটাচমেন্ট হ্যান্ডলার
async function handleAttachments(senderId, attachments) {
  for (const att of attachments) {
    if (att.type === 'image') {
      const imgUrl = att.payload.url;
      const command = userCommands.get(senderId) || 'grayscale';
      await processImage(senderId, imgUrl, command);
      userCommands.delete(senderId); // ক্লিয়ার কমান্ড পরে
    } else {
      await sendText(senderId, `Sorry, I can only process images.`);
    }
  }
}

// ইমেজ প্রসেসর
async function processImage(senderId, imgUrl, command) {
  const inputPath = path.join(__dirname, `${senderId}_input.jpg`);
  const outputPath = path.join(__dirname, `${senderId}_output.jpg`);

  try {
    const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(inputPath, response.data);

    let image = sharp(inputPath);

    switch (command) {
      case 'grayscale':
        image = image.grayscale();
        break;
      case 'rotate':
        image = image.rotate(90);
        break;
      case 'blur':
        image = image.blur(5);
        break;
    }

    await image.toFile(outputPath);

    // ফেসবুকে ছবি পাঠানো
    const formData = {
      recipient: JSON.stringify({ id: senderId }),
      message: JSON.stringify({ attachment: { type: 'image', payload: {} } }),
      filedata: fs.createReadStream(outputPath)
    };

    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // ক্লিনআপ
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error('Error processing image:', error);
    await sendText(senderId, 'Sorry, failed to process the image.');
  }
}

// টেক্সট মেসেজ পাঠানো ফাংশন
async function sendText(senderId, text) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      recipient: { id: senderId },
      message: { text }
    });
  } catch (e) {
    console.error('Failed to send message:', e);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GoatBot v2 image editor running on port ${PORT}`);
});
