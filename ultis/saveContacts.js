const fs = require("fs");
const path = require("path");

const saveContacts = (contacts, accountId) => {

    const contactDir = path.join(__dirname, "../contacts");

    const contactFile = path.join(contactDir, `contacts-${accountId}.json`);

    // Menghapus file lama jika sudah ada
    if (fs.existsSync(contactFile)) {
        fs.unlinkSync(contactFile);
        console.log(`File lama ditemukan dan dihapus: ${contactFile}`);
    }

    // Memformat data ke dalam JSON
    const formattedContacts = contacts.map(contact => ({
        name: contact.name || contact.pushname || "Unknown",
        number: contact.id.user, // Nomor tanpa @c.us
        id: contact.id._serialized
    }));

    // Menyimpan ke file baru
    fs.writeFileSync(contactFile, JSON.stringify(formattedContacts, null, 2), 'utf-8');
}

module.exports = saveContacts;