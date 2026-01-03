const nodemailer = require('nodemailer');
const axios = require('axios');

// Send OTP via email
const sendEmailOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SIRIMATH BANKUWA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Payment OTP",
      text: `Your OTP for the payment is: ${otp}. Reply karanna epa balanne na api`,
    });

    console.log(`OTP sent via EMAIL to ${email}`);
  } catch (err) {
    console.error("Error sending email OTP:", err.message);
  }
};

// Send OTP via SMS (Textbelt)
const sendSmsOTP = async (phone, otp) => {
  try {
    const response = await axios.post('https://textbelt.com/text', {
      phone,
      message: `Your OTP for the payment is: ${otp}`,
      key: process.env.TEXTBELT_API_KEY,
    });

    if (response.data.success) {
      console.log(`OTP sent via SMS to ${phone}`);
    } else {
      console.warn(`SMS failed:`, response.data);
    }
  } catch (err) {
    console.error("Error sending SMS OTP:", err.message);
  }
};

module.exports = { sendEmailOTP, sendSmsOTP };
