const fs = require('fs');
const path = require('path');

const logMessage = (message) => {
    let date = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta", hour12: false, dateStyle: "full", timeStyle: "long" });
    // let logMessage = `- ${date} - ${message}`;
    // fs.appendFileSync(path.join(__dirname, '../logs/status.log'), logMessage + '\n');
    // return logMessage;

    const logDir = path.join(__dirname, "../logs");

    // Dapatkan tanggal hari ini (format YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // Tentukan nama file log berdasarkan tanggal
    const logFile = path.join(logDir, `log-${today}.json`);

    // Pastikan folder logs ada
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Data log yang akan ditambahkan
    const logEntry = {
        timestamp: date,
        message: message
    };

    // Cek apakah file log ada
    if (fs.existsSync(logFile)) {
        // Jika file sudah ada, baca isi file, tambahkan entri baru, lalu tulis ulang
        const fileData = fs.readFileSync(logFile, "utf8");
        const logs = JSON.parse(fileData);
        logs.push(logEntry);
        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2), "utf8");
        // console.log(`Log updated: ${logFile}`);
    } else {
        // Jika file belum ada, buat array baru dan simpan sebagai JSON
        fs.writeFileSync(logFile, JSON.stringify([logEntry], null, 2), "utf8");
        // console.log(`New log file created: ${logFile}`);
    }
    return logEntry;
}

module.exports = logMessage;