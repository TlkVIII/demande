require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed =
      origin === 'https://tlkviii.github.io' ||
      origin === 'https://demande-production.up.railway.app' ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    callback(null, allowed);
  },
}));
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
  const attachments = arguments[0].attachments || [];
  const resendAttachments = attachments.map((att) => ({
    filename: att.filename,
    content: Buffer.from(att.content, 'utf8').toString('base64'),
    contentType: att.contentType,
  }));
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
      ...(resendAttachments.length ? { attachments: resendAttachments } : {}),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || data.error || JSON.stringify(data);
    throw new Error(message);
  }
  return { messageId: data.id, provider: 'resend' };
}

async function sendViaSmtp({ from, to, subject, text, html, smtpHost, smtpPort, smtpUser, smtpPass, attachments = [] }) {
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
    attachments,
    icalEvent: attachments.find((att) => att.contentType && att.contentType.includes('text/calendar'))
      ? {
          method: 'REQUEST',
          filename: 'reservation.ics',
          content: attachments.find((att) => att.contentType && att.contentType.includes('text/calendar')).content,
        }
      : undefined,
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

function icsEscape(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function toIcsDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;

  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

function buildCalendarAttachment(calendarEvent) {
  if (!calendarEvent || !calendarEvent.title || !calendarEvent.startIso) return null;

  const dtStart = toIcsDate(calendarEvent.startIso);
  if (!dtStart) return null;

  const endIso = calendarEvent.endIso || new Date(new Date(calendarEvent.startIso).getTime() + 60 * 60 * 1000).toISOString();
  const dtEnd = toIcsDate(endIso);
  if (!dtEnd) return null;

  const dtStamp = toIcsDate(new Date().toISOString());
  const uid = `demande-${Date.now()}-${Math.random().toString(36).slice(2)}@tlkviii.github.io`;
  const organizer = calendarEvent.organizerEmail || process.env.RESEND_FROM || process.env.SMTP_FROM || 'onboarding@resend.dev';
  const attendee = calendarEvent.attendeeEmail || process.env.DEFAULT_TO_EMAIL || process.env.MAIL_TO || organizer;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'PRODID:-//tlkviii//demande//FR',
    'X-WR-CALNAME:Demande',
    'X-WR-TIMEZONE:UTC',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${icsEscape(calendarEvent.title)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    `ORGANIZER:mailto:${icsEscape(organizer)}`,
    `ATTENDEE;CN=${icsEscape(attendee)};RSVP=TRUE:mailto:${icsEscape(attendee)}`,
  ];

  if (calendarEvent.description) lines.push(`DESCRIPTION:${icsEscape(calendarEvent.description)}`);
  if (calendarEvent.location) lines.push(`LOCATION:${icsEscape(calendarEvent.location)}`);
  if (calendarEvent.url) lines.push(`URL:${icsEscape(calendarEvent.url)}`);
  lines.push('BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(calendarEvent.title)}`, 'END:VALARM');

  lines.push('END:VEVENT', 'END:VCALENDAR');

  const folded = lines
    .map((line) => {
      const chunks = [];
      let remaining = line;
      while (remaining.length > 75) {
        chunks.push(remaining.slice(0, 75));
        remaining = ` ${remaining.slice(75)}`;
      }
      chunks.push(remaining);
      return chunks.join('\r\n');
    })
    .join('\r\n');

  return {
    filename: 'reservation.ics',
    content: folded,
    contentType: 'text/calendar; charset=utf-8; method=REQUEST',
    contentDisposition: 'attachment',
  };
}

function buildCalendarIcs(calendarEvent) {
  const attachment = buildCalendarAttachment(calendarEvent);
  return attachment ? attachment.content : null;
}

app.get('/calendar.ics', (req, res) => {
  const raw = req.query.event;
  if (!raw || typeof raw !== 'string') {
    return res.status(400).send('Missing event payload');
  }

  let calendarEvent;
  try {
    calendarEvent = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch (err) {
    return res.status(400).send('Invalid event payload');
  }

  const ics = buildCalendarIcs(calendarEvent);
  if (!ics) {
    return res.status(400).send('Invalid event data');
  }

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8; method=REQUEST');
  res.setHeader('Content-Disposition', 'attachment; filename="reservation.ics"');
  res.send(ics);
});

app.post('/send-email', async (req, res) => {
  const { subject, text, html, calendarEvent, secondaryEmail } = req.body;
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
  const defaultSecondaryRecipient = process.env.SECONDARY_TO_EMAIL || '';
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
    const attachments = [];
    const calendarAttachment = buildCalendarAttachment(calendarEvent);
    if (calendarAttachment) attachments.push(calendarAttachment);

    const sendWithConfiguredProvider = async ({ recipient, mailSubject, mailText, mailHtml, mailAttachments }) => {
      if (resendKey) {
        return sendViaResend({
          from: resendFrom,
          to: recipient,
          subject: mailSubject,
          text: mailText,
          html: mailHtml,
          attachments: mailAttachments,
        });
      }

      return sendViaSmtp({
        from: smtpFrom,
        to: recipient,
        subject: mailSubject,
        text: mailText,
        html: mailHtml,
        attachments: mailAttachments,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
      });
    };

    const primaryInfo = await sendWithConfiguredProvider({
      recipient: to,
      mailSubject: subject,
      mailText: text,
      mailHtml: html,
      mailAttachments: attachments,
    });

    const secondaryTo = (secondaryEmail && secondaryEmail.to) || defaultSecondaryRecipient;
    let secondaryInfo = null;
    let secondaryError = '';

    if (secondaryTo) {
      const secondaryCalendarEvent = secondaryEmail && secondaryEmail.calendarEvent ? secondaryEmail.calendarEvent : calendarEvent;
      const secondaryAttachments = [];
      if (!secondaryEmail || secondaryEmail.includeCalendar !== false) {
        const secondaryCalendarAttachment = buildCalendarAttachment(secondaryCalendarEvent);
        if (secondaryCalendarAttachment) secondaryAttachments.push(secondaryCalendarAttachment);
      }

      const secondarySubject = (secondaryEmail && secondaryEmail.subject) || `[Copie] ${subject}`;
      const secondaryText =
        (secondaryEmail && secondaryEmail.text) ||
        `Notification automatique:\n\nUne nouvelle demande a ete envoyee via le site.\n\nResume:\n${text}`;
      const secondaryHtml =
        (secondaryEmail && secondaryEmail.html) ||
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;"><p><strong>Notification automatique</strong></p><p>Une nouvelle demande a ete envoyee via le site.</p><p><strong>Resume :</strong></p><pre style="white-space: pre-wrap;">${text}</pre></div>`;

      try {
        secondaryInfo = await sendWithConfiguredProvider({
          recipient: secondaryTo,
          mailSubject: secondarySubject,
          mailText: secondaryText,
          mailHtml: secondaryHtml,
          mailAttachments: secondaryAttachments,
        });
      } catch (secondaryErr) {
        console.error('Secondary email error:', secondaryErr);
        secondaryError = secondaryErr.message || 'Secondary email send failed';
      }
    }

    return res.json({
      primary: primaryInfo,
      secondary: secondaryInfo,
      secondaryError,
    });
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
