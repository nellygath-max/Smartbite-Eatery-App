const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

// Accept a URI copied from a connection dialog that includes a label or other
// leading text, while always passing only a valid MongoDB URI to Mongoose.
const configuredMongoUri = process.env.MONGO_URI || '';
const mongoUriMatch = configuredMongoUri.match(/mongodb(?:\+srv)?:\/\/\S+/);
const mongoUri = mongoUriMatch ? mongoUriMatch[0] : configuredMongoUri;
// Keep the application on one explicit database even when the Atlas URI omits
// a database path (which otherwise makes MongoDB use its default `test` DB).
const mongoDbName = process.env.MONGO_DB_NAME || 'SmartbiteEateryApp';

// Authentication must never fall back to a source-controlled or predictable
// signing key. Refuse to start until each environment supplies its own secret.
const jwtSecret = process.env.JWT_SECRET;
const configuredJwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
const placeholderSecrets = new Set([
  'replace-with-a-unique-random-secret',
  'changeme',
  'secret',
]);

if (!jwtSecret || jwtSecret.length < 32 || placeholderSecrets.has(jwtSecret.toLowerCase())) {
  throw new Error('JWT_SECRET must be a unique, random secret of at least 32 characters.');
}

// Keep bearer credentials short-lived and reject ambiguous jsonwebtoken durations.
const expiryMatch = /^(\d+)\s*([smhd])$/i.exec(configuredJwtExpiresIn);
const expiryMultiplier = { s: 1, m: 60, h: 60 * 60, d: 24 * 60 * 60 };
const maxTokenLifetimeSeconds = 24 * 60 * 60;
const tokenLifetimeSeconds = expiryMatch
  && Number(expiryMatch[1]) * expiryMultiplier[expiryMatch[2].toLowerCase()];

if (!tokenLifetimeSeconds || tokenLifetimeSeconds > maxTokenLifetimeSeconds) {
  throw new Error('JWT_EXPIRES_IN must be between 1 second and 1 day (for example, 15m or 1d).');
}

const jwtExpiresIn = `${expiryMatch[1]}${expiryMatch[2].toLowerCase()}`;

// These options determine which payment choices Paystack displays in its
// hosted checkout. Paystack only shows options that are enabled and supported
// for the business account and its market.
const paystackPaymentChannels = (process.env.PAYSTACK_PAYMENT_CHANNELS || 'card,bank_transfer')
  .split(',')
  .map((channel) => channel.trim())
  .filter(Boolean);

module.exports = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: jwtSecret,
  JWT_ISSUER: process.env.JWT_ISSUER || 'smartbite-api',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'smartbite-api-client',
  JWT_EXPIRES_IN: jwtExpiresIn,
  MONGO_URI: mongoUri,
  MONGO_DB_NAME: mongoDbName,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || '',
  PAYSTACK_PAYMENT_CHANNELS: paystackPaymentChannels,
};
