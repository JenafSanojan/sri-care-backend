// src/controllers/paymentController.js
const Transaction = require('../models/transactionModel');
const axios = require('axios');

// Mock Payment Gateway helper
const mockPaymentGateway = async (amount, cardInfo) => {
  try {
    const response = await axios.post(`${process.env.GATEWAY_URL}/api/gateway/pay`, {
      amount,
      ...cardInfo, // cardNumber, expiry, cvv, userId, billId, purpose
    });

    return {
      status: response.data.status,
      providerRef: response.data.transactionRef,
      otpSent: response.data.otpSent || false, // whether OTP was triggered
    };
  } catch (err) {
    console.error('Payment Gateway error:', err.message);
    return {
      status: 'FAILED',
      providerRef: `mock_${Date.now()}`,
      otpSent: false,
    };
  }
};

// @desc Initiate payment (bill or top-up)
// @route POST /api/payments/pay
// @access Private
const initiatePayment = async (req, res) => {
  const { billId, amount, cardNumber, expiry, cvv, purpose } = req.body;
  const userId = req.userId;

  if (!userId || !amount || !cardNumber || !expiry || !cvv || !purpose) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    //  Call Payment Gateway (which calls the Bank Service)
    const gatewayResponse = await mockPaymentGateway(amount, {
      userId,
      billId,
      cardNumber,
      expiry,
      cvv,
      purpose,
    });

    // Save transaction with PENDING status (waiting for OTP verification)
    const transaction = await Transaction.create({
      userId,
      billId: billId || null,
      amount,
      purpose,
      status: gatewayResponse.status || 'PENDING',
      providerRef: gatewayResponse.transactionRef,
    });

    res.status(201).json({
      message: `Payment ${gatewayResponse.status}`,
      transaction,
      otpSent: gatewayResponse.otpSent,
    });
  } catch (err) {
    console.error('Payment error:', err.message);

    const transaction = await Transaction.create({
      userId,
      billId: billId || null,
      amount,
      purpose,
      status: 'FAILED',
      providerRef: `mock_${Date.now()}`,
    });

    res.status(500).json({
      message: 'Payment FAILED',
      transaction,
    });
  }
};

module.exports = { initiatePayment };
