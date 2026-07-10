require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname, { dotfiles: 'ignore' }));

app.use((req, res, next) => {
  req.setTimeout(15000); // 15s request timeout
  res.setTimeout(15000);
  next();
});

const PORT = process.env.PORT || 3001;

app.post('/send-email', async (req, res) => {
  const { subject, text, html } = req.body;
  if (!subject || !text) {
    return res.status(400).json({ error: 'subject and text required' });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;
  const defaultRecipient = process.env.DEFAULT_TO_EMAIL || process.env.MAIL_TO || smtpUser || smtpFrom;
  const to = req.body.to || defaultRecipient;

  if (!to) {
    return res.status(400).json({ error: 'No recipient configured. Set DEFAULT_TO_EMAIL in .env.' });
  }

  if (!smtpHost || !smtpUser || !smtpPass) {
    return res.status(500).json({
      error: 'SMTP credentials not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS and SMTP_FROM in .env.',
    });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  try {
    const mailOptions = {
      from: smtpFrom,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
      // Add MIME-Version to be explicit; leave Content-Type/encoding to Nodemailer
      headers: {
        'MIME-Version': '1.0',
      },
    };

    const info = await transporter.sendMail(mailOptions);
    return res.json({ messageId: info.messageId });
  } catch (err) {
    console.error('SMTP error:', err);
    const isTimeout =
      err.code === 'ETIMEDOUT' ||
      err.code === 'ECONNECTION' ||
      (typeof err.message === 'string' && err.message.toLowerCase().includes('connection timeout'));
    if (isTimeout) {
      return res.status(500).json({
        error: 'SMTP connection timeout. Vérifie SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, et le mot de passe d’application Gmail.',
      });
    }
    return res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Scheduler server listening on http://localhost:${PORT}`);
});
