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
  req.setTimeout(15000);
  res.setTimeout(15000);
  next();
});

const PORT = process.env.PORT || 3001;
const IS_RAILWAY = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);

const RAILWAY_RESEND_HELP =
  'Sur Railway, Gmail SMTP ne fonctionne pas (ports bloqués). ' +
  '1) Crée un compte sur resend.com  2) API Keys → Create API Key  ' +
  '3) Dans Railway → Variables, ajoute RESEND_API_KEY=re_... et RESEND_FROM=Réservation <onboarding@resend.dev>  ' +
  '4) Redéploie le service. Inscris-toi sur Resend avec la même adresse que DEFAULT_TO_EMAIL.';

function normalizeSmtpPass(pass) {
  if (!pass) return pass;
  return pass.replace(/\s/g, '');
}

async function sendViaResend({ from, to, subject, text, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html: html || `<p>${text}</p>`,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || data.error || JSON.stringify(data);
    throw new Error(message);
  }
  return { messageId: data.id, provider: 'resend' };
}

async function sendViaSmtp({ from, to, subject, text, html, smtpHost, smtpPort, smtpUser, smtpPass }) {
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
    requireTLS: smtpPort === 587,
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`,
    headers: {
      'MIME-Version': '1.0',
    },
  });

  return { messageId: info.messageId, provider: 'smtp' };
}

function isSmtpTimeout(err) {
  return (
    err.code === 'ETIMEDOUT' ||
    err.code === 'ECONNECTION' ||
    err.code === 'ESOCKET' ||
    (typeof err.message === 'string' && err.message.toLowerCase().includes('connection timeout'))
  );
}

app.post('/send-email', async (req, res) => {
  const { subject, text, html } = req.body;
  if (!subject || !text) {
    return res.status(400).json({ error: 'subject and text required' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = normalizeSmtpPass(process.env.SMTP_PASS);
  const smtpFrom = process.env.SMTP_FROM || smtpUser;
  const resendFrom = process.env.RESEND_FROM || smtpFrom || 'Réservation <onboarding@resend.dev>';
  const defaultRecipient = process.env.DEFAULT_TO_EMAIL || process.env.MAIL_TO || smtpUser || smtpFrom;
  const to = req.body.to || defaultRecipient;

  if (!to) {
    return res.status(400).json({ error: 'No recipient configured. Set DEFAULT_TO_EMAIL in Railway.' });
  }

  if (!resendKey && IS_RAILWAY) {
    return res.status(500).json({ error: RAILWAY_RESEND_HELP });
  }

  if (!resendKey && (!smtpHost || !smtpUser || !smtpPass)) {
    return res.status(500).json({
      error: 'Email not configured. Set RESEND_API_KEY on Railway, or SMTP_HOST/SMTP_USER/SMTP_PASS for local dev.',
    });
  }

  try {
    if (resendKey) {
      const info = await sendViaResend({ from: resendFrom, to, subject, text, html });
      return res.json(info);
    }

    const info = await sendViaSmtp({
      from: smtpFrom,
      to,
      subject,
      text,
      html,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
    });
    return res.json(info);
  } catch (err) {
    console.error('Email error:', err);

    if (isSmtpTimeout(err)) {
      return res.status(500).json({ error: RAILWAY_RESEND_HELP });
    }

    return res.status(500).json({ error: err.message || 'Email send failed' });
  }
});

app.get('/email-status', (_req, res) => {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  res.json({
    railway: IS_RAILWAY,
    provider: hasResend ? 'resend' : IS_RAILWAY ? 'none (configure RESEND_API_KEY)' : 'smtp',
    recipientConfigured: Boolean(process.env.DEFAULT_TO_EMAIL || process.env.MAIL_TO),
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const mode = hasResend ? 'Resend API' : IS_RAILWAY ? 'NON CONFIGURÉ (ajoute RESEND_API_KEY)' : 'SMTP local';
  console.log(`Scheduler server listening on http://localhost:${PORT} — email: ${mode}`);
});
