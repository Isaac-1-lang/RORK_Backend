const nodemailer = require('nodemailer');

// Replace these with your actual email and app password
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: 'isaprecieux112@gmail.com',
    pass: 'your-app-password', // This is the app password, NOT your main email password
  },
});

async function sendVerificationEmail(to, verificationLink) {
  const mailOptions = {
    from: '"HR Team" <your-email@gmail.com>',
    to,
    subject: 'Verify Your Email',
    html: `
      <h2>Welcome to the HR System!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };