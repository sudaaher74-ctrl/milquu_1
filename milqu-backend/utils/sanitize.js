function normalizeSingleLine(value) {
    return String(value === undefined || value === null ? '' : value)
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeMultiline(value) {
    return String(value === undefined || value === null ? '' : value)
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function sanitizeText(value) {
    return escapeHtml(normalizeSingleLine(value));
}

function sanitizeMultilineText(value) {
    return escapeHtml(normalizeMultiline(value));
}

module.exports = {
    sanitizeText,
    sanitizeMultilineText
};
