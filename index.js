const express = require("express");
const logMessage = require("./ultis/logger");
const { Client, LocalAuth } = require("whatsapp-web.js");

const authMiddleware = require("./ultis/authMiddleware");
const formatNumber = require("./ultis/formatNumber");
const sendMessage = require("./hooks/sendMessage");
const sendMessageFile = require("./hooks/sendMessageFile");

const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");

const multer = require("multer");
const destroyAccount = require("./hooks/destroyAccount");
const upload = multer({
  storage: multer.memoryStorage(),
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const CREATE_DIR = ["sessions_auth", "logs"];

for (const dir of CREATE_DIR) {
  if (!fs.existsSync(path.join(__dirname, dir))) {
    fs.mkdirSync(path.join(__dirname, dir));
  }
}

const clients = new Map();

app.post("/init-app", authMiddleware, (req, res) => {

  console.log("get/init-app");


  const { accountId } = req.body;

  if (!accountId) {
    return res
      .status(400)
      .json({ success: false, message: "Account ID is required" });
  }

  if (clients.has(accountId)) {
    return res
      .status(400)
      .json({ success: false, message: "Account already initialized" });
  }

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: accountId,
      dataPath: CREATE_DIR[0],
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    webVersionCache: {
      type: "remote",
      remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1020350206-alpha.html`,
    },
  });

  client.on("qr", (qr) => {
    console.log(`QR for ${accountId}:`);
    qrcode.generate(qr, { small: true });
  });

  client.on("loading_screen", (percent, message) => {
    console.log(`Loading ${percent}% : ${message}`);
    logMessage(`Loading ${percent}% : ${message}`);
  });

  client.on("auth_failure", () => {
    console.log(`Auth failure for ${accountId}`);
    logMessage(`Auth failure for ${accountId}`);
  });

  client.on("authenticated", () => {
    // saveSession(client, session);

    console.log(`Client ${accountId} AUTHENTICATED!`);
    logMessage(`Client ${accountId} authenticated!`);

  });

  client.on("disconnected", () => {
    console.log(`Client ${accountId} disconnected`);
    clients.delete(accountId);
  });

  client.on("ready", () => {
    console.log(`Client ${accountId} is READY!`);
    // console.log(clients);
    logMessage(`Client ${accountId} is ready!`);

  });

  client.initialize();

  clients.set(accountId, client);
  // logSession(accountId, client);

  res
    .status(200)
    .json({ success: true, message: "Initializing new client..." });
});

app.post(
  "/send-message/:accountId",
  authMiddleware,
  upload.single("attachment"),
  async (req, res) => {
    // console.log(clients);

    const accountId = req.params.accountId;

    if (!accountId) {
      logMessage("Account ID is required");
      return res
        .status(400)
        .json({ success: false, message: "Account ID is required" });
    }
    const { numbers, message, caption } = req.body;
    const attachmentFiles = req.file;

    // console.log("attachmentFiles", attachmentFiles);
    console.log("body ", JSON.stringify(req.body));

    const client = clients.get(accountId);
    if (!client) {
      logMessage("Client not initialized");
      return res
        .status(401)
        .json({ success: false, message: "Client not initialized" });
    }

    const numberArray = numbers.split(",").map((num) => num.trim() + "@c.us");
    console.log("numberArray", numberArray);

    try {
      let nameUser = [];

      if (attachmentFiles) {
        if (!numbers || attachmentFiles.length > 0) {
          logMessage("Numbers and attachmentFiles are required");
          return res.status(400).json({
            success: false,
            message: "Numbers and attachmentFiles are required",
          });
        }

        console.log("send message file");

        for (const number of numberArray) {
          const chatId = formatNumber(number);

          if (await client.isRegisteredUser(chatId)) {
            let chat = await client.getChatById(chatId);
            var groupName = chat.name;

            if (message) {
              await sendMessage(client, message, chatId, groupName);
            }
            await sendMessageFile(
              client,
              caption,
              attachmentFiles,
              chatId,
              groupName
            );
          } else {
            var groupName = chatId + " not aktif";
          }

          nameUser.push(groupName);
          // sleep(3);
        }
      } else {
        if (!numbers || !message) {
          return res.status(400).json({
            success: false,
            message: "Numbers and message are required",
          });
        }
        console.log("send message");
        for (const number of numberArray) {
          const chatId = formatNumber(number);
          if (await client.isRegisteredUser(chatId)) {
            let chat = await client.getChatById(chatId);
            var groupName = chat.name;

            await sendMessage(client, message, chatId, groupName);
          } else {
            var groupName = chatId + " tidak aktif";
          }

          nameUser.push(groupName);
          // sleep(3);
        }
      }
      logMessage(`messages successfully send to ${JSON.stringify(nameUser)}!`);
      res.status(200).json({
        status: true,
        message: `messages successfully send to ${JSON.stringify(nameUser)}!`,
      });
    } catch (error) {
      logMessage(`Error sending message: ${error.message}`);
      res.status(500).json({
        status: false,
        message: "Failed to send messages: " + error.message,
      });
    }
  }
);

// Destroy client
app.post("/delete", authMiddleware, async (req, res) => {
  const { accountId } = req.body;

  if (!accountId) {
    logMessage("Account ID is required");
    return res
      .status(400)
      .json({ success: false, message: "Account ID is required" });
  }

  try {
    let destroy = await destroyAccount(clients, accountId);
    res.status(destroy.status == true ? 200 : 403).json(destroy);
  } catch (error) {
    logMessage(`Error destroyed account: ${error.message}`);
    res.status(500).json({
      status: false,
      message: "Failed to send messages: " + error.message,
    });
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

app.listen(PORT, () => {
  logMessage(`Server is running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});
