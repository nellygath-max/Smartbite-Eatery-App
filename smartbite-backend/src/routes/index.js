const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// mount sample routes
const sample = require('./sample');
router.use('/sample', sample);

module.exports = router;
