const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // You can change this to your preferred email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use app password for Gmail
    }
  });
};

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to send email
app.post('/send-email', async (req, res) => {
  try {
    const { recipientEmail, recipientName } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }

    const transporter = createTransporter();

    // Email content
    const mailOptions = {
      from: `"Mail Service" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: '👋 Hello from Mail Service!',
      html: generateEmailTemplate(recipientName || 'there'),
      text: generatePlainTextEmail(recipientName || 'there')
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    res.json({
      success: true,
      message: 'Email sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    let errorMessage = 'Failed to send email. Please try again.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email configuration.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection failed. Please check your internet connection.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Function to generate HTML email template
function generateEmailTemplate(name) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hello from Mail Service!</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .email-container {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #4CAF50;
          margin: 0;
          font-size: 28px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 20px;
        }
        .highlight {
          background-color: #e8f5e8;
          padding: 15px;
          border-left: 4px solid #4CAF50;
          margin: 20px 0;
          border-radius: 0 5px 5px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 15px 0;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🎉 Welcome!</h1>
        </div>
        
        <div class="greeting">
          Hello ${name}! 👋
        </div>
        
        <div class="content">
          <p>Thank you for trying out our Mail Service application! This is an automated introductory email to let you know that everything is working perfectly.</p>
          
          <div class="highlight">
            <strong>🚀 What is Mail Service?</strong><br>
            Mail Service is a simple yet powerful application that allows you to send personalized emails programmatically. It's built with modern web technologies and designed to be easy to use and customize.
          </div>
          
          <p><strong>Features include:</strong></p>
          <ul>
            <li>✅ Simple web interface for sending emails</li>
            <li>✅ Personalized email templates</li>
            <li>✅ Support for both HTML and plain text emails</li>
            <li>✅ Error handling and validation</li>
            <li>✅ Responsive design that works on all devices</li>
          </ul>
          
          <p>Whether you're testing email functionality, sending welcome messages, or just exploring how email automation works, this service has got you covered!</p>
        </div>
        
        <div class="footer">
          <p>This email was sent automatically by Mail Service.</p>
          <p>Built with ❤️ using Node.js, Express, and Nodemailer</p>
          <p><small>If you received this email in error, you can safely ignore it.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Function to generate plain text email
function generatePlainTextEmail(name) {
  return `
Hello ${name}!

Thank you for trying out our Mail Service application! This is an automated introductory email to let you know that everything is working perfectly.

What is Mail Service?
Mail Service is a simple yet powerful application that allows you to send personalized emails programmatically. It's built with modern web technologies and designed to be easy to use and customize.

Features include:
- Simple web interface for sending emails
- Personalized email templates
- Support for both HTML and plain text emails
- Error handling and validation
- Responsive design that works on all devices

Whether you're testing email functionality, sending welcome messages, or just exploring how email automation works, this service has got you covered!

---
This email was sent automatically by Mail Service.
Built with love using Node.js, Express, and Nodemailer

If you received this email in error, you can safely ignore it.
  `;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Mail Service'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mail Service is running on port ${PORT}`);
  console.log(`📧 Access the application at http://localhost:${PORT}`);
});

module.exports = app;