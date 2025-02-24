const formatNumber = (number) => {
    if (number.includes('@c.us')) return number;
    const cleaned = number.replace(/[^0-9]/g, '');
    return `${cleaned}@c.us`;
}

module.exports = formatNumber;