const logMessage = require("../ultis/logger");

async function sendMessageFile(client, caption, attachmentFiles, id) {

    const ext = path.extname(attachmentFiles.originalname).toLowerCase();

    console.log(ext);

    let mimetype = attachmentFiles.mimetype;

    console.log(mimetype);
    if (mimetype === "application/octet-stream") {
        if (ext === ".jpg" || ext === ".jpeg") {
            mimetype = "image/jpeg";
        } else if (ext === ".png") {
            mimetype = "image/png";
        }
    }



    const mediaFile = new MessageMedia(
        attachmentFiles.mimetype,
        attachmentFiles.buffer.toString("base64"),
        attachmentFiles.originalname);


    try {
        let chat = await client.getChatById(id);
        let groupName = chat.name;
        await client.sendMessage(id, mediaFile, {
            caption,
        });
        let sentMessage = await client.sendMessage(id, message);
        console.log(sentMessage.body);

        logMessage(
            `Report berhasil dikirim ke ${groupName} dengan ID pesan: ${sentMessage.body}`
        );

        return groupName;
    } catch (error) {
        logMessage(`Error sending message: ${error}`);
    }
}

module.exports = sendMessageFile;