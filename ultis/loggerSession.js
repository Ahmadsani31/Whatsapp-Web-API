const fs = require('fs');
const path = require('path');

const logSession = (accountId, client) => {
    // let logMessage = `- ${date} - ${message}`;
    // fs.appendFileSync(path.join(__dirname, '../logs/status.log'), logMessage + '\n');
    // return logMessage;


    const logDir = path.join(__dirname, "../logs/sessions/");


    // Tentukan nama file log berdasarkan tanggal
    const logFile = path.join(logDir, `${accountId}.json`);

    // Pastikan folder logs ada
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Cek apakah file log ada
    if (fs.existsSync(logFile)) {
        // Jika file sudah ada, baca isi file, tambahkan entri baru, lalu tulis ulang
        const fileData = fs.readFileSync(logFile, "utf8");
        const logs = JSON.parse(fileData);
        logs.push(JSON.stringify(client, null, 2));
        fs.writeFileSync(logFile, logs, "utf8");
        // console.log(`Log updated: ${logFile}`);
    } else {
        // Jika file belum ada, buat array baru dan simpan sebagai JSON
        fs.writeFileSync(logFile, JSON.stringify(client, null, 2), "utf8");
        // console.log(`New log file created: ${logFile}`);
    }
}

module.exports = logSession;