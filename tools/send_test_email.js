const http = require('http');

const payload = {
  subject: '💖 Test mail décoré — validation UTF-8',
  text: "💖 Ta Baby's a choisi l'activité suivante : Pique-nique.\n📅 Elle a été réservée pour le mercredi 10 juillet 2026 à 19:00.\n✨ J'espère que tu vas lui offrir une très belle expérience et un moment précieux ensemble !",
  html: `
    <div style="font-family: Arial, sans-serif; color: #4a2d3f; line-height: 1.6;">
      <p>💖 <strong>Ta Baby's a choisi</strong> l'activité suivante : <strong>Pique-nique</strong>.</p>
      <p>📅 Elle a été réservée pour le <strong>mercredi 10 juillet 2026 à 19:00</strong>.</p>
      <p>✨ J'espère que tu vas lui offrir une très belle expérience et un moment précieux ensemble !</p>
    </div>
  `
};

const body = JSON.stringify(payload);

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/send-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log(data);
  });
});

req.on('error', (err) => { console.error('Request error', err); process.exit(1); });
req.write(body);
req.end();

// Run with: node tools/send_test_email.js
