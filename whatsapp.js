

const whatsapp = (app, clients) => {


    app.post("/send-message", async (req, res) => {
        const { accountId, numbers, message } = req.body;

        if (!accountId || !numbers || !message) {
            return res
                .status(400)
                .send("Account ID, numbers, and message are required");
        }

        const client = clients.get(accountId);

        if (!client) {
            return res.status(400).send("Client not initialized");
        }

        try {
            for (const number of numbers) {
                const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
                await client.sendMessage(chatId, message);
            }
            res.send("Messages sent successfully");
        } catch (error) {
            res.status(500).send("Failed to send messages: " + error.message);
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