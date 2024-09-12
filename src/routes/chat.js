const express = require('express');
const router = express.Router();
const { chatCompletion } = require('../services/openaiService');

router.post('/', async (req, res, next) => {
  try {
    const response = await chatCompletion(req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;