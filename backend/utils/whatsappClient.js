import axios from 'axios';

let totalMessagesSent = 0;

export const getWhatsAppStatus = () => {
    // If the tokens are present in env, we consider it 'connected' for the frontend's sake.
    const isConfigured = !!process.env.WHATSAPP_ACCESS_TOKEN && !!process.env.WHATSAPP_PHONE_ID;
    
    return { 
        status: isConfigured ? 'connected' : 'disconnected', 
        qr: null,
        messagesSent: totalMessagesSent
    };
};

export const sendWhatsAppMessage = async (mobileNo, message) => {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
        console.log('Cannot send Meta WhatsApp message: API Keys are not configured in .env');
        return false;
    }

    try {
        // Meta API requires the phone number without '+' but with country code.
        const countryCode = mobileNo.startsWith('91') ? '' : '91';
        const formattedNumber = `${countryCode}${mobileNo}`;

        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedNumber,
            type: "text",
            text: {
                preview_url: false,
                body: message
            }
        };

        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${phoneId}/messages`,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.status === 200) {
            console.log(`Meta WhatsApp Message sent to ${formattedNumber}`);
            totalMessagesSent++;
            return true;
        }
    } catch (error) {
        console.error('Failed to send Meta WhatsApp message:', error.response?.data || error.message);
        return false;
    }
};
