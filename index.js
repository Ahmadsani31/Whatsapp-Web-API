const express = require("express");
const bodyParser = require("body-parser");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const authMiddleware = require("./ultis/authMiddleware");
const whatsapp = require("./whatsapp");
const logMessage = require("./ultis/logger");

const app = express();
// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const clients = new Map();
whatsapp(app, clients);
app.post("/init", authMiddleware, (req, res) => {

  logMessage('hit init');

  console.log(req.body);

  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ success: false, message: "Account ID is required" });
  }

  if (clients.has(accountId)) {
    return res.status(400).json({ success: false, message: "Account already initialized" });
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: accountId }),
    puppeteer: { headless: true },
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log(`Client ${accountId} is ready!`);
    res.send("Client initialized and ready");
  });

  client.on("disconnected", () => {
    console.log(`Client ${accountId} disconnected`);
    clients.delete(accountId);
  });

  client.initialize();
  clients.set(accountId, client);

  res.send("Initializing client...");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logMessage(`Server is running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});
