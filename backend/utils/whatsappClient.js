import { Client, RemoteAuth } from 'whatsapp-web.js';
import { MongoStore } from 'wwebjs-mongo';
import mongoose from 'mongoose';
import qrcode from 'qrcode';

let client;
let qrCodeData = null;
let status = 'disconnected'; // disconnected, qr, connected

export const initWhatsApp = async () => {
    try {
        console.log('Initializing WhatsApp Client...');
        const store = new MongoStore({ mongoose: mongoose });
        
        client = new Client({
            authStrategy: new RemoteAuth({
                store: store,
                backupSyncIntervalMs: 300000
            }),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                headless: true
            }
        });

        client.on('qr', async (qr) => {
            console.log('QR RECEIVED');
            qrCodeData = await qrcode.toDataURL(qr);
            status = 'qr';
        });

        client.on('ready', () => {
            console.log('WhatsApp Client is ready!');
            qrCodeData = null;
            status = 'connected';
        });

        client.on('remote_session_saved', () => {
            console.log('WhatsApp session saved securely in MongoDB');
        });

        client.on('disconnected', (reason) => {
            console.log('WhatsApp Client disconnected', reason);
            status = 'disconnected';
            qrCodeData = null;
            // Optionally, we could destroy and reinitialize here, but let's keep it simple
        });

        client.initialize();
    } catch (error) {
        console.error('Error initializing WhatsApp:', error);
    }
};

export const getWhatsAppStatus = () => {
    return { status, qr: qrCodeData };
};

export const sendWhatsAppMessage = async (mobileNo, message) => {
    if (status !== 'connected') {
        console.log('Cannot send message: WhatsApp is not connected');
        return false;
    }
    try {
        // Format the mobile number to match WhatsApp ID (e.g. 91xxxxxxxxxx@c.us)
        const countryCode = mobileNo.startsWith('91') ? '' : '91';
        const formattedNumber = `${countryCode}${mobileNo}@c.us`;
        await client.sendMessage(formattedNumber, message);
        console.log(`Message sent to ${formattedNumber}`);
        return true;
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        return false;
    }
};
