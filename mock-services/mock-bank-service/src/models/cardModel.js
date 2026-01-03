const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cardNumber: { type: String, required: true, unique: true },
  expiry: { type: String, required: true },
  cvv: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  availableBalance: { type: Number, required: true, default: 0 },
  otp: { type: String }, // Store current OTP for verification
  otpExpires: { type: Date },
});

module.exports = mongoose.model('Card', cardSchema);
