const logMessage = require("../ultis/logger");

async function sendMessage(client, message, id) {
    try {
        let chat = await client.getChatById(id);
        let groupName = chat.name;
        let sentMessage = await client.sendMessage(id, message);
        console.log(sentMessage.body);

        logMessage(
            `Report berhasil dikirim ke ${groupName} dengan ID pesan: ${sentMessage.body}`
        );
        return groupName;
    } catch (error) {
        logWithDate(`Error sending message: ${error}`);
    }
}

module.exports = sendMessage;