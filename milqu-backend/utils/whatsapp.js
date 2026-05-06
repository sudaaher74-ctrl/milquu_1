const twilio = require('twilio');

const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_NUMBER,
    ADMIN_WHATSAPP_NUMBER,
    ENABLE_CUSTOMER_WHATSAPP
} = process.env;

const client = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
    ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    : null;

function normalizeWhatsAppNumber(rawValue) {
    if (!rawValue) return '';
    const value = String(rawValue).trim();
    if (value.startsWith('whatsapp:')) {
        return value;
    }
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10) {
        return `whatsapp:+91${digits}`;
    }
    if (digits.startsWith('91') && digits.length === 12) {
        return `whatsapp:+${digits}`;
    }
    return `whatsapp:+${digits}`;
}

async function sendWhatsAppMessage(to, body) {
    try {
        if (!client || !TWILIO_WHATSAPP_NUMBER || !to || !body) {
            return null;
        }
        const message = await client.messages.create({
            from: normalizeWhatsAppNumber(TWILIO_WHATSAPP_NUMBER),
            to: normalizeWhatsAppNumber(to),
            body
        });
        return message.sid;
    } catch (err) {
        console.error('[WhatsApp] Message failed:', err.message);
        return null;
    }
}

function formatOrderAdminMessage(order) {
    const itemLines = (order.items || [])
        .map((item) => `${item.e || '•'} ${item.name} x${item.qty}`)
        .join('\n');

    return [
        'New order received',
        `Order ID: ${order.orderId}`,
        `Customer: ${order.customer?.name || 'Customer'}`,
        `Phone: ${order.customer?.phone || '-'}`,
        `Total: Rs ${order.total}`,
        `Payment: ${(order.paymentMethod || '').toUpperCase()}`,
        'Items:',
        itemLines || 'No items',
        `Address: ${order.customer?.address || '-'}`
    ].join('\n');
}

function formatOrderConfirmation(order) {
    return [
        `Hi ${order.customer?.name || 'there'}, your Milqu Fresh order is confirmed.`,
        `Order ID: ${order.orderId}`,
        `Total: Rs ${order.total}`,
        `Delivery window: ${order.deliveryWindow || 'morning'}`,
        'We will share delivery updates on WhatsApp.'
    ].join('\n');
}

function formatDeliveryUpdate(order) {
    const statusText = (order.status || '').replace(/_/g, ' ');
    return [
        `Milqu Fresh delivery update for order ${order.orderId}`,
        `Current status: ${statusText}`,
        order.deliveryOtp?.code ? `Delivery OTP: ${order.deliveryOtp.code}` : '',
        order.deliveredAt ? 'Delivered successfully. Thank you for ordering with us.' : ''
    ].filter(Boolean).join('\n');
}

function formatSubscriptionMessage(subscription, type) {
    if (type === 'payment_reminder') {
        return [
            `Hi ${subscription.name || 'there'}, this is a payment reminder from Milqu Fresh.`,
            `Subscription ID: ${subscription.subscriptionId}`,
            `Monthly total: Rs ${subscription.monthlyTotal || 0}`,
            'Please complete payment to avoid delivery interruption.'
        ].join('\n');
    }

    return [
        `Hi ${subscription.name || 'there'}, your Milqu Fresh subscription is active.`,
        `Subscription ID: ${subscription.subscriptionId}`,
        `Schedule: ${subscription.schedule}`,
        `Monthly total: Rs ${subscription.monthlyTotal || 0}`
    ].join('\n');
}

async function sendAdminOrderNotification(order) {
    if (!ADMIN_WHATSAPP_NUMBER) {
        return null;
    }
    return sendWhatsAppMessage(ADMIN_WHATSAPP_NUMBER, formatOrderAdminMessage(order));
}

async function sendOrderConfirmation(order) {
    if (ENABLE_CUSTOMER_WHATSAPP !== 'true') {
        return null;
    }
    return sendWhatsAppMessage(order.customer?.phone, formatOrderConfirmation(order));
}

async function sendDeliveryStatusUpdate(order) {
    if (ENABLE_CUSTOMER_WHATSAPP !== 'true') {
        return null;
    }
    return sendWhatsAppMessage(order.customer?.phone, formatDeliveryUpdate(order));
}

async function sendSubscriptionNotification(subscription, type = 'confirmation') {
    if (ENABLE_CUSTOMER_WHATSAPP !== 'true') {
        return null;
    }
    return sendWhatsAppMessage(subscription.phone, formatSubscriptionMessage(subscription, type));
}

module.exports = {
    sendAdminOrderNotification,
    sendDeliveryStatusUpdate,
    sendOrderConfirmation,
    sendSubscriptionNotification,
    sendWhatsAppMessage
};
