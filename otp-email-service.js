'use strict';

const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can replace this with your email service provider
    auth: {
        user: 'your-email@gmail.com', // Your email address
        pass: 'your-email-password' // Your email password or app password
    }
});

// Function to send OTP email
const sendOtpEmail = (recipientEmail, otp) => {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: recipientEmail,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error sending email:', error);
        }
        console.log('Email sent: ' + info.response);
    });
};

module.exports = sendOtpEmail;
