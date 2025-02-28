const { MessageMedia } = require("whatsapp-web.js");
const logMessage = require("../ultis/logger");
const path = require('path');

async function sendMessageFile(client, caption, attachmentFiles, id, groupName, res) {

    const extension = [".jpg", ".jpeg", ".png"];

    const ext = path.extname(attachmentFiles.originalname).toLowerCase();

    console.log('extension', ext);

    let mimetype = attachmentFiles.mimetype;

    console.log('mimetype', mimetype);

    if (mimetype === "application/octet-stream") {
        if (ext === ".jpg" || ext === ".jpeg") {
            mimetype = "image/jpeg";
        } else if (ext === ".png") {
            mimetype = "image/png";
        }
    }

    if (!extension.includes(ext)) {
        logMessage(`File image type not supported, to user please send image with type .jpg, .jpeg, .png`);

        return res.status(403).json({
            status: false,
            message: `File image type not supported, to user please send image with type .jpg, .jpeg, .png!`,
        })
    }

    try {
        const mediaFile = new MessageMedia(
            attachmentFiles.mimetype,
            attachmentFiles.buffer.toString("base64"),
            attachmentFiles.originalname);

        let sentMessage = await client.sendMessage(id, mediaFile, {
            caption: caption,
        });
        console.log(sentMessage.id._serialized);
        logMessage(
            `Report berhasil dikirim ke ${groupName} dengan ID pesan: ${sentMessage.id._serialized}`
        );
    } catch (error) {
        logMessage(`Error sending message: ${error}`);
        return res.status(404).json({
            status: false,
            message: `Error sending message: ${error}`,
        })
    }
}

module.exports = sendMessageFile;