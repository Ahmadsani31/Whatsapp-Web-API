const express = require("express");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const multer = require("multer");
const qrcode = require("qrcode-terminal");
const authMiddleware = require("./ultis/authMiddleware");
const logMessage = require("./ultis/logger");
const fs = require('fs');
const path = require('path');
const formatNumber = require("./ultis/formatNumber");
const app = express();
const upload = multer({
  storage: multer.memoryStorage()
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

const SESSIONS_DIR = path.join(__dirname, 'logs/sessions');

const clients = new Map();

// whatsapp(app, clients);
console.log(clients);

app.post("/init-app", authMiddleware, (req, res) => {

  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ success: false, message: "Account ID is required" });
  }

  if (clients.has(accountId)) {
    return res.status(400).json({ success: false, message: "Account already initialized" });
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: accountId }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    webVersionCache: {
      type: 'remote',
      remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2407.3.html`
    }
  });

  client.on("qr", (qr) => {
    console.log(`QR for ${accountId}:`);
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log(`Client ${accountId} is ready!`);
    // console.log(clients);

    res.status(200).json({ success: true, message: "Client initialized and ready" });
  });

  // Handle session saving
  client.on('session', (session) => {
    // saveSession(client, session);
  });

  client.on('authenticated', () => {
    // saveSession(client, session);
    console.log(`Client ${accountId} authenticated!`);
  });

  client.on("disconnected", () => {
    console.log(`Client ${accountId} disconnected`);
    clients.delete(accountId);
  });

  client.initialize();
  clients.set(accountId, client);
  // logSession(accountId, client);

  res.status(200).json({ success: true, message: "Initializing client..." });

});

app.post("/send-message/:accountId", authMiddleware, upload.single("attachment"), async (req, res) => {
  const accountId = req.params.accountId;
  if (!accountId) {
    return res.status(400).json({ success: false, message: "Account ID is required" });
  }
  const { numbers, message, caption } = req.body;
  const attachmentFiles = req.file;

  console.log('attachmentFiles', attachmentFiles);
  console.log('body ', JSON.stringify(req.body));

  if (!numbers || !message) {
    return res
      .status(400)
      .json({ success: false, message: "Account ID, numbers, and message are required" });
  }

  const client = clients.get(accountId);
  if (!client) {
    return res.status(401).json({ success: false, message: "Client not initialized" });
  }

  const numberArray = numbers.split(',').map(num => num.trim() + '@c.us')
  console.log('numberArray', numberArray);


  try {
    let nameUser = [];

    if (attachmentFiles) {
      console.log('send message file');

      const mediaFile = new MessageMedia(attachmentFiles.mimetype, attachmentFiles.buffer.toString("base64"), attachmentFiles.originalname);

      for (const number of numberArray) {
        const chatId = formatNumber(number);
        if (message) {
          await client.sendMessage(chatId, message);
        }
        await client.sendMessage(chatId, mediaFile, { caption });
        const chat = await client.getChatById(chatId);
        nameUser.push(chat.name);
        // sleep(3);
      }
    } else {
      console.log('send message');
      for (const number of numberArray) {
        const chatId = formatNumber(number);
        await client.sendMessage(chatId, message);
        const chat = await client.getChatById(chatId);
        nameUser.push(chat.name);
        // sleep(3);
      }
    }

    res.status(200).json({ status: true, message: `messages successfully send to ${JSON.stringify(nameUser)}!` });
  } catch (error) {
    res.status(500).json({ status: true, message: "Failed to send messages: " + error.message });
  }
});

// app.post("/send-image", async (req, res) => {
//   const { accountId, numbers, imageUrl, caption } = req.body;
//   console.log('body', JSON.stringify(req.body));

//   if (!accountId || !numbers || !imageUrl) {
//     return res
//       .status(400)
//       .send("Account ID, numbers, and image URL are required");
//   }

//   const client = clients.get(accountId);

//   if (!client) {
//     return res.status(400).send("Client not initialized");
//   }

//   try {
//     for (const number of numbers) {
//       const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
//       const media = await MessageMedia.fromUrl(imageUrl);
//       await client.sendMessage(chatId, media, { caption });
//     }
//     res.send("Images sent successfully");
//   } catch (error) {
//     res.status(500).send("Failed to send images: " + error.message);
//   }
// });

const sleep = (seconds) => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// const saveSession = (clientId, sessionData) => {
//   const sessionPath = path.join(SESSIONS_DIR, clientId, 'session.json');
//   fs.mkdirSync(path.dirname(sessionPath), { recursive: true });
//   fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
//   console.log(`Session saved for ${clientId}`);
// };

app.listen(PORT, () => {
  logMessage(`Server is running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});
