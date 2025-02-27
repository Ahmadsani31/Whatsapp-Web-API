const { MessageMedia } = require("whatsapp-web.js");
const logMessage = require("../ultis/logger");
const path = require('path');

async function sendMessageFile(client, caption, attachmentFiles, id, groupName) {

    const extension = [".jpg", ".jpeg", ".png"];

    const ext = path.extname(attachmentFiles.originalname).toLowerCase();

    console.log(ext);

    let mimetype = attachmentFiles.mimetype;

    console.log(mimetype);
    if (mimetype === "application/octet-stream") {
        if (ext === ".jpg" || ext === ".jpeg") {
            mimetype = "image/jpeg";
        } else if (ext === ".png") {
            mimetype = "image/png";
        } else if (ext === ".gif") {
            mimetype = "image/gif";
        }
    }

    if (!extension.includes(ext)) {
        logMessage(`File image type not supported, to user ${groupName} please send image with type .jpg, .jpeg, .png`);
    }

    try {
        const mediaFile = new MessageMedia(
            attachmentFiles.mimetype,
            attachmentFiles.buffer.toString("base64"),
            attachmentFiles.originalname);

        let sentMessage = await client.sendMessage(id, mediaFile, {
            caption,
        });
        console.log(sentMessage.id._serialized);
        logMessage(
            `Report berhasil dikirim ke ${groupName} dengan ID pesan: ${sentMessage.id._serialized}`
        );
    } catch (error) {
        logMessage(`Error sending message: ${error}`);
    }
}

module.exports = sendMessageFile;