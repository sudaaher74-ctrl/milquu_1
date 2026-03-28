const crypto = require('crypto');

function generatePublicId(prefix) {
    const raw = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().replace(/-/g, '')
        : crypto.randomBytes(16).toString('hex');

    return `${prefix}-${raw.slice(0, 12).toUpperCase()}`;
}

module.exports = {
    generatePublicId
};
