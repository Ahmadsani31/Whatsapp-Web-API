const express = require("express");
const logMessage = require("./ultis/logger");
const whatsapp = require("./whatsapp");
const authMiddleware = require("./ultis/authMiddleware");
const formatNumber = require("./ultis/formatNumber");
const sendMessage = require("./hooks/sendMessage");
const sendMessageFile = require("./hooks/sendMessageFile");

const fs = require('fs');
const path = require('path');
const qrcode = require("qrcode-terminal");

const multer = require("multer");
const destroyAccount = require("./hooks/destroyAccount");
const upload = multer({
  storage: multer.memoryStorage()
});

const { Client, LocalAuth } = require("whatsapp-web.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const SESSIONS_DIR = path.join(__dirname, 'sessions_auth');

if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR);
}


const clients = new Map();

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
    authStrategy: new LocalAuth({
      clientId: accountId,
      dataPath: SESSIONS_DIR
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    webVersionCache: {
      type: 'remote',
      remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1020350206-alpha.html`
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

  res.status(200).json({ success: true, message: "Initializing new client..." });

});

app.post("/send-message/:accountId", authMiddleware, upload.single("attachment"), async (req, res) => {

  // console.log(clients);


  const accountId = req.params.accountId;

  if (!accountId) {
    return res.status(400).json({ success: false, message: "Account ID is required" });
  }
  const { numbers, message, caption } = req.body;
  const attachmentFiles = req.file;

  console.log('attachmentFiles', attachmentFiles);
  console.log('body ', JSON.stringify(req.body));

  const client = clients.get(accountId);
  if (!client) {
    return res.status(401).json({ success: false, message: "Client not initialized" });
  }

  const numberArray = numbers.split(',').map(num => num.trim() + '@c.us')
  console.log('numberArray', numberArray);

  try {
    let nameUser = [];

    if (attachmentFiles) {
      if (!numbers || attachmentFiles.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Numbers and attachmentFiles are required" });
      }

      console.log('send message file');

      for (const number of numberArray) {
        const chatId = formatNumber(number);

        if (await client.isRegisteredUser(chatId)) {
          let chat = await client.getChatById(chatId);
          var groupName = chat.name;


          if (message) {
            await sendMessage(client, message, chatId, groupName);
          }
          await sendMessageFile(client, caption, attachmentFiles, chatId, groupName);

        } else {
          var groupName = chatId + 'not aktif'
        }

        nameUser.push(groupName);
        // sleep(3);
      }
    } else {
      if (!numbers || !message) {
        return res
          .status(400)
          .json({ success: false, message: "Numbers and message are required" });
      }
      console.log('send message');
      for (const number of numberArray) {
        const chatId = formatNumber(number);
        if (await client.isRegisteredUser(chatId)) {
          let chat = await client.getChatById(chatId);
          var groupName = chat.name;

          await sendMessage(client, message, chatId, groupName);
        } else {
          var groupName = chatId + ' tidak aktif'
        }

        nameUser.push(groupName);
        // sleep(3);
      }
    }

    res.status(200).json({ status: true, message: `messages successfully send to ${JSON.stringify(nameUser)}!` });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to send messages: " + error.message });
  }
});

// Destroy client
app.post("/delete", authMiddleware, async (req, res) => {

  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ success: false, message: "Account ID is required" });
  }

  try {
    let destroy = await destroyAccount(clients, accountId);
    res.status(destroy.status == true ? 200 : 403).json(destroy);

  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to send messages: " + error.message });
  }


});


// for (const clt of clients) {
//   console.log(clt);

//   clt['081247179841'].on('message', async (msg) => {
//     const chat = await msg.getChat();
//     console.log('chat', chat);
//     console.log('msg', msg);
//     console.log('msg.body', msg.body);
//     console.log('msg.from', msg.from);
//     console.log('msg.to', msg.to);
//     console.log('msg.isGroupMsg', msg.isGroupMsg);
//     console.log('msg.isMedia', msg.isMedia);
//   });
// }

// function formatNumber(number) {
//   return number.replace(/ /g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '') + '@c.us';
// }


app.listen(PORT, () => {
  logMessage(`Server is running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});
