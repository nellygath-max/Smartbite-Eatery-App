const nodemailer = require('nodemailer');
const dns = require('dns');
const {
  ADMIN_EMAIL,
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
} = require('../config/env');

dns.setDefaultResultOrder('ipv4first');

let transporter;
let loggedMailConfig = false;

const createTransporter = () => {
  if (!SMTP_HOST) {
    throw new Error('SMTP_HOST is not configured.');
  }

  if (!loggedMailConfig) {
    console.log('SMTP mail config loaded:', {
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      user: SMTP_USER,
      from: SMTP_FROM || ADMIN_EMAIL,
      adminEmail: ADMIN_EMAIL,
      hasPassword: Boolean(SMTP_PASS),
    });
    loggedMailConfig = true;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    family: 4,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
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

const getMissingMailConfigKeys = () => {
  const required = {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SENDER_ADDRESS: SMTP_FROM || ADMIN_EMAIL,
  };

  return Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
};

const isMailConfigured = () => getMissingMailConfigKeys().length === 0;

const checkSmtpHealth = async () => {
  const missingKeys = getMissingMailConfigKeys();
  if (missingKeys.length > 0) {
    return {
      ok: false,
      configured: false,
      missingKeys,
      message: 'SMTP configuration is incomplete.',
    };
  }

  try {
    await getTransporter().verify();
    return {
      ok: true,
      configured: true,
      missingKeys: [],
      message: 'SMTP is configured and reachable.',
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      missingKeys: [],
      message: 'SMTP is configured but not reachable.',
      error: error?.message || 'Unknown SMTP verification error.',
    };
  }
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
  const [adminEmail, customerEmail] = await Promise.allSettled([
    sendAdminContactEmail(contactMessage),
    sendCustomerContactConfirmation(contactMessage),
  ]);

  return {
    adminEmail,
    customerEmail,
  };
};

const sendPasswordResetOtpEmail = async ({ email, name, otp, expiresInMinutes }) => (
  getTransporter().sendMail({
    from: SMTP_FROM || ADMIN_EMAIL,
    to: email,
    subject: 'Your SmartBite password reset code',
    text: [
      `Hello ${name || 'there'},`,
      '',
      'We received a request to reset your SmartBite password.',
      `Use this one-time code to continue: ${otp}`,
      `This code expires in ${expiresInMinutes} minutes.`,
      '',
      'If you did not request this, you can ignore this email.',
      '',
      'SmartBite Eatery',
    ].join('\n'),
  })
);

module.exports = {
  checkSmtpHealth,
  getTransporter,
  getMissingMailConfigKeys,
  isMailConfigured,
  sendAdminContactEmail,
  sendContactEmails,
  sendCustomerContactConfirmation,
  sendPasswordResetOtpEmail,
};
