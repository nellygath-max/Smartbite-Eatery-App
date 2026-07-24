const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');
const { PORT, HOST } = require('./src/config/env');
const { mongoUri, mongoOptions } = require('./src/config/database');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://smartbite-frontend-24fn.onrender.com',
];
const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredOrigins]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.send('SmartBite Backend Running'));

mongoose
  .connect(mongoUri, { ...mongoOptions, serverSelectionTimeoutMS: 10_000 })
  .then(() => {
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
    app.listen(PORT, HOST, () => {
      console.log(`Server listening on http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exitCode = 1;
  });

module.exports = app;
