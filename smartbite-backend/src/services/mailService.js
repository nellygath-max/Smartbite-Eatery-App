const nodemailer = require('nodemailer');
const {
  ADMIN_EMAIL,
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
} = require('../config/env');

let transporter;

const createTransporter = () => {
  if (!SMTP_HOST) {
    throw new Error('SMTP_HOST is not configured.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: SMTP_USER && SMTP_PASS
      ? {
          user: SMTP_USER,
          pass: SMTP_PASS,
        }
      : undefined,
  });
};

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

const formatDateTime = (date) => new Intl.DateTimeFormat('en-NG', {
  dateStyle: 'full',
  timeStyle: 'medium',
  timeZone: 'Africa/Lagos',
}).format(date);

const sendAdminContactEmail = async (contactMessage) => {
  if (!ADMIN_EMAIL) {
    throw new Error('ADMIN_EMAIL is not configured.');
  }

  const submittedAt = contactMessage.createdAt || new Date();
  return getTransporter().sendMail({
    from: SMTP_FROM || ADMIN_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: contactMessage.email,
    subject: contactMessage.subject
      ? `New Contact Message: ${contactMessage.subject}`
      : `New Contact Message from ${contactMessage.name}`,
    text: [
      'New contact message received.',
      '',
      `Name: ${contactMessage.name}`,
      `Email: ${contactMessage.email}`,
      `Subject: ${contactMessage.subject || 'Not provided'}`,
      `Submitted: ${formatDateTime(submittedAt)}`,
      '',
      contactMessage.message,
    ].join('\n'),
  });
};

const sendCustomerContactConfirmation = async (contactMessage) => (
  getTransporter().sendMail({
    from: SMTP_FROM || ADMIN_EMAIL,
    to: contactMessage.email,
    subject: 'SmartBite Eatery received your message',
    text: [
      `Hello ${contactMessage.name},`,
      '',
      'Thank you for contacting SmartBite Eatery. We have received your message and will respond as soon as possible.',
      '',
      'Your message:',
      contactMessage.subject ? `Subject: ${contactMessage.subject}` : null,
      contactMessage.message,
      '',
      'SmartBite Eatery',
    ].filter(Boolean).join('\n'),
  })
);

const sendContactEmails = async (contactMessage) => {
  await sendAdminContactEmail(contactMessage);
  await sendCustomerContactConfirmation(contactMessage);
};

module.exports = {
  getTransporter,
  sendAdminContactEmail,
  sendContactEmails,
  sendCustomerContactConfirmation,
};
