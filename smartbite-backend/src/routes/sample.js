const express = require('express');
const router = express.Router();
const { getSampleData } = require('../services/sampleService');
const { validateSample } = require('../validators/sampleValidator');

router.get('/', (req, res) => {
  res.json(getSampleData());
});

router.post('/', validateSample, (req, res) => {
  res.json({ received: req.body });
});

module.exports = router;
