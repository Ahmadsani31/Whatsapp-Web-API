const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
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

const SESSIONS_DIR = path.join(__dirname, 'sessions_auth');


const whatsapp = (app, clients) => {

    console.log('whatsapp');


    const SESSION_FILE = './registered_numbers.json';
    let registeredNumbers = [];

    if (fs.existsSync(SESSION_FILE)) {
        registeredNumbers = JSON.parse(fs.readFileSync(SESSION_FILE));
        console.log('load file', registeredNumbers);
    } else {
        // fs.writeFileSync(SESSION_FILE, JSON.stringify(registeredNumbers));
        console.log('tidak ada file');

    }



    console.log(clients);


    app.post("/init-app", authMiddleware, (req, res) => {

        const { accountId } = req.body;

        if (!accountId) {
            return res.status(400).json({ success: false, message: "Account ID is required" });
        }

        if (clients.has(accountId)) {
            return res.status(400).json({ success: false, message: "Account already initialized" });
        }
        const clientId = accountId;
        const client = new Client({
            authStrategy: new LocalAuth({ clientId, dataPath: SESSIONS_DIR }),
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

        if (!registeredNumbers.includes(accountId)) {
            registeredNumbers.push(accountId);
            fs.writeFileSync(SESSION_FILE, JSON.stringify(registeredNumbers));
        }

        res.status(200).json({ success: true, message: "Initializing new client..." });

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

                    let chat = await client.getChatById(chatId);
                    let groupName = chat.name;


                    if (message) {
                        await sendMessage(client, message, chatId, groupName);
                    }
                    await sendMessageFile(client, caption, attachmentFiles, chatId, groupName);

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
                    let chat = await client.getChatById(chatId);
                    let groupName = chat.name;

                    await sendMessage(client, message, chatId, groupName);
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
    app.post("/delete", authMiddleware, (req, res) => {

        const { accountId } = req.body;

        if (!accountId) {
            return res.status(400).json({ success: false, message: "Account ID is required" });
        }

        try {
            destroyAccount(clients, accountId);
            res.status(200).json({ success: true, message: "Successfully delete" });

        } catch (error) {
            res.status(500).json({ status: false, message: "Failed to send messages: " + error.message });
        }


    });

    // app.post("/send-message", async (req, res) => {
    //     const { accountId, numbers, message } = req.body;
    //     console.log('body ', JSON.stringify(req.body));

    //     if (!accountId || !numbers || !message) {
    //         return res
    //             .status(400)
    //             .send({ success: false, message: "Account ID, numbers, and message are required" });
    //     }

    //     // const client = await store.sessionExists({ session: accountId });
    //     // const client = new Client({
    //     //     authStrategy: new RemoteAuth({
    //     //         store: accountId,
    //     //         backupSyncIntervalMs: 300000
    //     //     })
    //     // });

    //     // const client = clients.get(accountId);
    //     console.log(client);

    //     if (!client) {
    //         return res.status(4001).json({ success: false, message: "Client not initialized" });
    //     }

    //     try {
    //         for (const number of numbers) {
    //             const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
    //             await client.sendMessage(chatId, message);
    //         }
    //         res.status(200).json({ status: true, message: "Messages sent successfully" });
    //     } catch (error) {
    //         res.status(500).json({ status: true, message: "Failed to send messages: " + error.message });
    //     }
    // });

    // app.post("/send-image", async (req, res) => {
    //     const { accountId, numbers, imageUrl, caption } = req.body;

    //     if (!accountId || !numbers || !imageUrl) {
    //         return res
    //             .status(400)
    //             .send("Account ID, numbers, and image URL are required");
    //     }

    //     const client = clients.get(accountId);

    //     if (!client) {
    //         return res.status(400).send("Client not initialized");
    //     }

    //     try {
    //         for (const number of numbers) {
    //             const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
    //             const media = await MessageMedia.fromUrl(imageUrl);
    //             await client.sendMessage(chatId, media, { caption });
    //         }
    //         res.send("Images sent successfully");
    //     } catch (error) {
    //         res.status(500).send("Failed to send images: " + error.message);
    //     }
    // });
}

module.exports = whatsapp;