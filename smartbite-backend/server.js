const express = require('express');
const routes = require('./src/routes');
const { PORT } = require('./src/config/env');
const { mongoUri } = require('./src/config/database');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', routes);

app.get('/', (req, res) => res.send('SmartBite Backend Running'));

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    app.listen(PORT, () => console.log(`Server listening on port ${PORT} (MongoDB unavailable)`));
  });

module.exports = app;
