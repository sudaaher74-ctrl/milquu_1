import nodemailer from 'nodemailer';
import logger from './logger.js';

/**
 * Configure standard nodemailer transport
 * Requires SMTP credentials in .env:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an email
 * @param {Object} options - { to, subject, text, html }
 */
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MilQuu Fresh" <noreply@milquu.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId} to ${options.to}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    // We don't want to throw an error and break the request if email fails, 
    // unless explicitly needed. Returning false allows caller to handle it softly.
    return false;
  }
};
