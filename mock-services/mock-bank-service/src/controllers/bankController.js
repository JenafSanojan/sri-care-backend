const Card = require('../models/cardModel');
const generateOTP = require('../utils/otpGenerator');
const { sendEmailOTP, sendSmsOTP } = require('../utils/otpSender');


// POST /bank/validate-card
const validateCard = async (req, res) => {
  const { cardNumber, expiry, cvv, amount } = req.body;

  if (!cardNumber || !expiry || !cvv || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const card = await Card.findOne({ cardNumber, expiry, cvv });
  if (!card) {
    return res.status(404).json({ message: 'Card not found' });
  }

  if (card.availableBalance < amount) {
    return res.status(402).json({ message: 'Insufficient balance' });
  }

  // Generate OTP
  const otp = generateOTP();
  card.otp = otp;
  card.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
  await card.save();

  // Send OTP
  if (card.email) {
    sendEmailOTP(card.email, otp); // async
  }
  if (card.phone) {
    sendSmsOTP(card.phone, otp);   // async
  }

  res.json({
    otpRef: otp, // you can also return a ref ID if you want more abstraction
    transactionRef: `BANK-${Date.now()}`,
    message: 'OTP sent to user via available channels',
  });
};


// POST /bank/verify-otp
const verifyOtp = async (req, res) => {
  const { cardNumber, otp, amount } = req.body;

  if (!cardNumber || !otp || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const card = await Card.findOne({ cardNumber });
  if (!card) {
    return res.status(404).json({ message: 'Card not found' });
  }

  if (!card.otp || card.otp !== otp || card.otpExpires < new Date()) {
    return res.status(400).json({ status: 'FAILED', message: 'Invalid or expired OTP' });
  }

  // Deduct balance
  card.availableBalance -= amount;
  card.otp = null;
  card.otpExpires = null;
  await card.save();

  res.json({
    status: 'SUCCESS',
    message: 'Payment approved',
    transactionRef: `BANK-${Date.now()}`,
  });
};

// GET /bank/balance/:cardNumber
const getBalance = async (req, res) => {
  const { cardNumber } = req.params;
  const card = await Card.findOne({ cardNumber });
  if (!card) return res.status(404).json({ message: 'Card not found' });

  res.json({ availableBalance: card.availableBalance });
};

module.exports = { validateCard, verifyOtp, getBalance };
