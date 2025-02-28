const logMessage = require("../ultis/logger");

async function sendMessage(client, message, id, groupName, res) {
    try {

        let sentMessage = await client.sendMessage(id, message);
        console.log(sentMessage.id._serialized);

        logMessage(
            `Report berhasil dikirim ke ${groupName} dengan ID pesan: ${sentMessage.id._serialized}`
        );
        return groupName;
    } catch (error) {
        logMessage(`Error sending message: ${error}`);
        return res.status(404).json({
            status: false,
            message: `Error sending message: ${error}`,
        })
    }
}

module.exports = sendMessage;