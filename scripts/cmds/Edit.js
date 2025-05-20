const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = 'YOUR_PAGE_ACCESS_TOKEN';
const VERIFY_TOKEN = 'YOUR_VERIFY_TOKEN';

// In-memory store for last command per user
const userCommands = {};

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message) {
        const msg = webhookEvent.message;

        if (msg.text && msg.text.startsWith('/edit')) {
          const command = msg.text.replace('/edit', '').trim();
          userCommands[senderId] = command;
          sendText(senderId, `Okay, send me an image to apply: ${command}`);
        } else if (msg.attachments) {
          for (const att of msg.attachments) {
            if (att.type === 'image') {
              const imgUrl = att.payload.url;
              const command = userCommands[senderId] || 'grayscale';
              await processImage(senderId, imgUrl, command);
            }
          }
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Send simple text message
function sendText(senderId, text) {
  request({
    uri: 'https://graph.facebook.com/v18.0/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: senderId },
      message: { text }
    }
  });
}

// Image processor
async function processImage(senderId, imgUrl, command) {
  const inputPath = path.join(__dirname, 'input.jpg');
  const outputPath = path.join(__dirname, 'output.jpg');

  try {
    const img = await axios({ url: imgUrl, responseType: 'arraybuffer' });
    fs.writeFileSync(inputPath, img.data);

    let edit = sharp(inputPath);

    // Apply command
    switch (command) {
      case 'grayscale':
        edit = edit.grayscale();
        break;
      case 'rotate':
        edit = edit.rotate(90);
        break;
      case 'blur':
        edit = edit.blur(5);
        break;
      default:
        sendText(senderId, `Unknown edit: ${command}`);
        return;
    }

    await edit.toFile(outputPath);

    // Send edited image
    const file = fs.createReadStream(outputPath);
    const formData = {
      recipient: JSON.stringify({ id: senderId }),
      message: JSON.stringify({ attachment: { type: 'image', payload: {} } }),
      filedata: file
    };

    request.post({
      uri: `https://graph.facebook.com/v18.0/me/messages`,
      qs: { access_token: PAGE_ACCESS_TOKEN },
      formData
    }, (err) => {
      if (err) console.error('Error sending image:', err);
    });
  } catch (err) {
    console.error('Image processing failed:', err);
    sendText(senderId, 'Failed to process image.');
  }
}

app.listen(process.env.PORT || 3000, () => console.log('Bot is live'));
