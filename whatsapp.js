const { Client, RemoteAuth } = require("whatsapp-web.js");


const whatsapp = (app, clients) => {


    app.post("/send-message", async (req, res) => {
        const { accountId, numbers, message } = req.body;
        console.log('body ', JSON.stringify(req.body));

        if (!accountId || !numbers || !message) {
            return res
                .status(400)
                .send({ success: false, message: "Account ID, numbers, and message are required" });
        }

        // const client = await store.sessionExists({ session: accountId });
        // const client = new Client({
        //     authStrategy: new RemoteAuth({
        //         store: accountId,
        //         backupSyncIntervalMs: 300000
        //     })
        // });

        // const client = clients.get(accountId);
        console.log(client);

        if (!client) {
            return res.status(4001).json({ success: false, message: "Client not initialized" });
        }

        try {
            for (const number of numbers) {
                const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
                await client.sendMessage(chatId, message);
            }
            res.status(200).json({ status: true, message: "Messages sent successfully" });
        } catch (error) {
            res.status(500).json({ status: true, message: "Failed to send messages: " + error.message });
        }
    });

    app.post("/send-image", async (req, res) => {
        const { accountId, numbers, imageUrl, caption } = req.body;

        if (!accountId || !numbers || !imageUrl) {
            return res
                .status(400)
                .send("Account ID, numbers, and image URL are required");
        }

        const client = clients.get(accountId);

        if (!client) {
            return res.status(400).send("Client not initialized");
        }

        try {
            for (const number of numbers) {
                const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
                const media = await MessageMedia.fromUrl(imageUrl);
                await client.sendMessage(chatId, media, { caption });
            }
            res.send("Images sent successfully");
        } catch (error) {
            res.status(500).send("Failed to send images: " + error.message);
        }
    });
}

module.exports = whatsapp;