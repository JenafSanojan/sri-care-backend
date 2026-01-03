const express = require('express');
const router = express.Router();
const { validateCard, verifyOtp, getBalance } = require('../controllers/bankController');

router.post('/validate-card', validateCard);
router.post('/verify-otp', verifyOtp);
router.get('/balance/:cardNumber', getBalance);

module.exports = router;
