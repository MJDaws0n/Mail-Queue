const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Could not be bothered to implement .env system but you probs should

// Constants
const PORT = 1056; // 443 through proxy in my case but up to you how you do this
const API_KEY = 'your own api key that you need for the PHP';
const ALLOWED_IPS = ['0.0.0.0', '1.2.3.4'];
const EMAIL_API_KEY = 'your brevo api key';
const ALLOWED_HOSTNAME = 'your-domain-name.com';

// Initialize app
const app = express();
app.use(bodyParser.json());

// Email queue
const emailQueue = [];
let sendingEmail = false;

// Middleware for API key and IP check
app.use((req, res, next) => {
  const clientIP = req.headers['x-forwarded-for'];
  const requestIP = (req.ip || req.connection.remoteAddress).replace(/^::ffff:/, '');
  const apiKey = req.headers['api-key'];
  const hostname = req.headers['host'];
    
  if (!ALLOWED_IPS.includes(requestIP)) {
    return res.status(403).json({ error: 'IP not allowed' });
  }

  if (hostname !== ALLOWED_HOSTNAME) {
    return res.status(403).json({ error: 'Invalid hostname' });
  }

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  if (!ALLOWED_IPS.includes(clientIP)) {
    return res.status(403).json({ error: 'IP not allowed' });
  }

  next();
});

// Email sending route
app.post('/send-email', (req, res) => {
  const { toEmail, toName, html, subject } = req.body;

  if (!toEmail || !toName || !html || !subject) {
    return res.status(400).json({ error: 'Missing required fields: toEmail, toName, html, subject' });
  }

  // Add email to the queue
  emailQueue.push({ toEmail, toName, html, subject });
  res.status(200).json({ message: 'Email queued for sending' });
});

// Function to send email using Brevo API
async function sendEmail({ toEmail, toName, html, subject }) {
  const emailData = {
    sender: { 
      name: "Name of sender", 
      email: "email@address.net"
    },
    to: [{ email: toEmail, name: toName }],
    subject: subject,
    htmlContent: html
  };

  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': EMAIL_API_KEY
      }
    });
    console.log(`Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
  }
}

// Process the email queue every second
setInterval(() => {
  if (!sendingEmail && emailQueue.length > 0) {
    sendingEmail = true;
    const emailData = emailQueue.shift();
    sendEmail(emailData).finally(() => {
      sendingEmail = false;
    });
  }
}, 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on (change this on the laste like)`);
});
