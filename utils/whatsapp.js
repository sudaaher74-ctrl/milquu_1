// utils/whatsapp.js  —  Twilio WhatsApp notification helper
const twilio = require('twilio');

const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_NUMBER,
    ADMIN_WHATSAPP_NUMBER
} = process.env;

// Initialise client only when credentials are present
const client =
    TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
        ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        : null;

/**
 * Format an order into a human-readable WhatsApp message.
 */
function formatOrderMessage(order) {
    const itemLines = order.items
        .map((item) => {
            const qty = item.unit ? `${item.qty}${item.unit}` : `x${item.qty}`;
            return `${item.e || '•'} ${item.name} — ${qty}`;
        })
        .join('\n');

    return [
        '🛒 *New Order Received*',
        '',
        `*Order ID:* ${order.orderId}`,
        `*Customer:* ${order.customer.name}`,
        `*Phone:* ${order.customer.phone}`,
        '',
        '*Items:*',
        itemLines,
        '',
        `*Total:* ₹${order.total}`,
        `*Payment:* ${order.paymentMethod.toUpperCase()}`,
        '',
        '*Address:*',
        order.customer.address,
        order.customer.notes ? `\n_Note: ${order.customer.notes}_` : ''
    ].join('\n');
}

/**
 * Send a WhatsApp notification to the admin for a new order.
 * Errors are logged but never thrown — the caller is not affected.
 *
 * @param {Object} order  Mongoose Order document
 * @returns {Promise<string|null>}  Twilio message SID or null on failure
 */
async function sendWhatsAppNotification(order) {
    try {
        if (!client) {
            console.warn('⚠️  WhatsApp notification skipped — Twilio credentials not configured.');
            return null;
        }

        if (!ADMIN_WHATSAPP_NUMBER) {
            console.warn('⚠️  WhatsApp notification skipped — ADMIN_WHATSAPP_NUMBER not set.');
            return null;
        }

        const message = await client.messages.create({
            from: TWILIO_WHATSAPP_NUMBER,
            to: ADMIN_WHATSAPP_NUMBER,
            body: formatOrderMessage(order)
        });

        console.log(`✅ WhatsApp notification sent for ${order.orderId} (SID: ${message.sid})`);
        return message.sid;
    } catch (err) {
        console.error(`❌ WhatsApp notification failed for ${order.orderId}:`, err.message);
        return null;
    }
}

module.exports = { sendWhatsAppNotification };
