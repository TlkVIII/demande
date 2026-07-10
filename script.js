// Background hearts
const heartsWrap = document.getElementById("hearts");
const heartCount = 44;
const heartEmojis = ["❤️", "💕", "💖", "💗", "💘", "💝"];

for (let i = 0; i < heartCount; i++) {
  const h = document.createElement("span");
  h.className = "heartEmoji";
  h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];

  const left = Math.random() * 100;
  const delay = Math.random() * 6;
  const dur = 6 + Math.random() * 10;
  const swayDur = 1.6 + Math.random() * 2.8;
  const size = 12 + Math.random() * 26;
  const opacity = 0.22 + Math.random() * 0.55;

  h.style.left = `${left}vw`;
  h.style.animationDelay = `${-delay}s`;
  h.style.animationDuration = `${dur}s, ${swayDur}s`;
  h.style.fontSize = `${size}px`;
  h.style.opacity = `${opacity}`;

  heartsWrap.appendChild(h);
}

// Runaway button + result state
const card = document.getElementById("card");
const btnRow = document.getElementById("btnRow");
const noBtn = document.getElementById("no");
const noGhost = document.getElementById("noGhost");
const yesBtn = document.getElementById("yes");
let noDetached = false;
let yesResetTimer = null;
let yesScale = 1;
let noIsBlinking = false;
let step = 1;
let noIsMoving = false;
let lastNoMoveAt = 0;
const NO_MOVE_COOLDOWN_MS = 140;
let noScaleFactor = 1;

const titleEl = card.querySelector("h1");
const descEl = card.querySelector("p");
const footerEl = card.querySelector(".footer");

// Force correct flex centering on the btnRow right at load time
// (ensures consistent layout across all browsers/platforms on first render)
btnRow.style.display = 'flex';
btnRow.style.justifyContent = 'center';
btnRow.style.alignItems = 'center';
btnRow.style.width = '100%';

const activities = [
  {
    label: "Randonnée jolie",
    emoji: "🥾",
    image: "./images/randonnée.JPEG",
  },
  {
    label: "Pique-nique",
    emoji: "🧺",
    image: "./images/Piquenique.jpg",
  },
  {
    label: "Balade",
    emoji: "🌆",
    image: "./images/Baladee.JPEG",
  },
  {
    label: "Soirée film",
    emoji: "🎬",
    image: "./images/Soireefilm.JPEG",
  },
  {
    label: "Cuisiner ensemble",
    emoji: "🍳",
    image: "./images/cuisiner.JPEG",
  },
  {
    label: "Te prendre en photo",
    emoji: "📸",
    image: "./images/prendreenphoto.JPEG",
  },
  {
    label: "Bowling",
    emoji: "🎳",
    image: "./images/Bowling.jpg",
  },
  {
    label: "Visiter les villes à côté",
    emoji: "🏙️",
    image: "./images/visiterville.JPEG",
  },
  {
    label: "Proposer une activité",
    emoji: "💡",
    image: "./images/default.jpg",
  },
];

// Floating praise texts (e.g. "Youpiii", "Excellent") that appear briefly
// when the user lands on the celebration/result screen.
const PRAISE_TEXTS = [
  { text: "Youpiii", emoji: "🎉" },
  { text: "Excellent", emoji: "👏" },
  { text: "Formidable", emoji: "✨" },
  { text: "C'est la fête", emoji: "🥳" },
];
let _floatingPraisesInterval = null;
let _floatingPraisesContainer = null;

function startFloatingPraises(parent = document.body) {
  stopFloatingPraises();
  _floatingPraisesContainer = document.createElement('div');
  _floatingPraisesContainer.className = 'floating-praises';
  parent.appendChild(_floatingPraisesContainer);

  function spawnOne() {
    const info = PRAISE_TEXTS[Math.floor(Math.random() * PRAISE_TEXTS.length)];
    const el = document.createElement('span');
    el.className = 'floating-praise';
    el.innerHTML = `${info.emoji} ${info.text}`;

    // Random horizontal start inside the parent
    const parentRect = parent.getBoundingClientRect();
    const x = Math.random() * Math.max(0, parentRect.width - 120);
    el.style.left = `${x}px`;
    // Slight random delay so they don't all look the same
    el.style.animationDelay = `${Math.random() * 0.6}s`;

    _floatingPraisesContainer.appendChild(el);

    // Remove after animation (2.8s matches CSS animation)
    window.setTimeout(() => {
      if (el && el.parentElement) el.parentElement.removeChild(el);
    }, 3000);
  }

  // Spawn a few immediately so effect is visible right away
  for (let i = 0; i < 5; i++) spawnOne();

  _floatingPraisesInterval = window.setInterval(spawnOne, 420);
}

function stopFloatingPraises() {
  if (_floatingPraisesInterval) {
    clearInterval(_floatingPraisesInterval);
    _floatingPraisesInterval = null;
  }
  if (_floatingPraisesContainer) {
    // fade out existing children quickly
    _floatingPraisesContainer.querySelectorAll('.floating-praise').forEach((el) => {
      el.style.transition = 'opacity .25s ease, transform .25s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-6px)';
    });
    window.setTimeout(() => {
      if (_floatingPraisesContainer && _floatingPraisesContainer.parentElement) {
        _floatingPraisesContainer.parentElement.removeChild(_floatingPraisesContainer);
      }
      _floatingPraisesContainer = null;
    }, 300);
  }
}


function showTropBieeeenScreen() {
  stopFloatingPraises();
  card.innerHTML = `
    <div class="spark" aria-hidden="true"></div>
    <div class="result resultSuccess screenFade">
      <button class="backLink" type="button" id="backFromWow">← Retour</button>
      <div class="big">Trop bieeeen 😭❤️</div>
      <p class="sub">Tu viens de me rendre la personne la plus heureuse !</p>
      <button class="btn resultBtn" id="startTogether" type="button">Commençons alors !</button>
    </div>
  `;
  startFloatingPraises();
  document.getElementById('backFromWow').addEventListener('click', showStep2Rebuilt);
  document.getElementById('startTogether').addEventListener('click', showActivitiesScreen);
}

function showStep2Rebuilt() {
  stopFloatingPraises();
  card.innerHTML = `
    <div class="spark" aria-hidden="true"></div>
    <button class="backLink" type="button" id="step2-back">← Retour</button>
    <h1>Tu veux bien passer ta vie avec le boss (MOI) ?</h1>
    <p>Je te promets : Amour, Rires, et plein plein de SOUVENIIIRS. 💞</p>
    <div class="btnRow">
      <button class="btn" id="yes-r" type="button" style="background:linear-gradient(135deg,rgba(44,255,179,1),rgba(44,255,179,.65));color:#04130d">Oui ❤️</button>
      <button class="btn" id="no-r" type="button" style="background:linear-gradient(135deg,rgba(255,77,166,1),rgba(255,77,166,.7));color:#fff">Non 😈</button>
    </div>
    <div class="footer">Essaie de cliquer sur non si tu peux.</div>
  `;
  document.getElementById('step2-back').addEventListener('click', () => location.reload());
  document.getElementById('yes-r').addEventListener('click', showTropBieeeenScreen);
  // Non fuit (version simplifiée sans le mécanisme runaway)
  document.getElementById('no-r').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    noClickCount++;
    if (noClickCount % 3 === 0) showNoMessage();
    const btn = document.getElementById('no-r');
    if (btn) {
      const cardRect = card.getBoundingClientRect();
      const pad = 14;
      const bw = btn.offsetWidth;
      const bh = btn.offsetHeight;
      const x = pad + Math.random() * (cardRect.width - bw - pad * 2);
      const y = pad + Math.random() * (cardRect.height - bh - pad * 2);
      btn.style.position = 'absolute';
      btn.style.left = `${x}px`;
      btn.style.top = `${y}px`;
      btn.style.transition = 'left .3s ease, top .3s ease';
    }
  });
}


function showActivitiesScreen() {
  // ensure any floating praises are stopped when returning to the activities list
  stopFloatingPraises();
  const buttons = activities
    .map(
      (a) =>
        `<button class="activityBtn" type="button" data-activity="${a.label}">
          <span class="activityEmoji">${a.emoji}</span>
          <span class="activityLabel">${a.label}</span>
        </button>`,
    )
    .join("");

  card.innerHTML = `
    <div class="spark" aria-hidden="true"></div>
    <div class="activityScreen screenFade">
      <button class="backLink" type="button" id="backToStep2">← Retour</button>
      <h2 class="activityTitle">Activités possibles à faire ensemble :</h2>
      <p class="activitySubtitle">Choisis ce qui te fait le plus envie :</p>
      <div class="activityGrid">${buttons}</div>
    </div>
  `;

  document.getElementById('backToStep2').addEventListener('click', showTropBieeeenScreen);

  card.querySelectorAll(".activityBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const activity = activities.find((a) => a.label === btn.dataset.activity);
      if (!activity) return;
      if (activity.label === 'Proposer une activité') {
        showProposeActivityForm();
      } else {
        showActivityConfirm(activity);
      }
    });
  });
}

function showProposeActivityForm() {
  card.innerHTML = `
    <div class="spark" aria-hidden="true"></div>
    <div class="proposeScreen screenFade">
      <button class="backLink" type="button" id="backToList">← Retour</button>
      <h2 class="confirmTitle">Proposer une activité</h2>
      <p class="confirmHint">Décris l'activité que tu veux proposer :</p>
      <input type="text" id="proposalTitle" placeholder="Titre de l'activité" class="textInput" />
      <textarea id="proposalDetails" placeholder="Détails de l'activité (lieu, durée, autre)" class="textArea"></textarea>
      <p class="confirmHint">Propose une date et une heure (optionnel) :</p>
      <input type="datetime-local" id="proposalDateTime" class="datetimeInput" />
      <div class="confirmBtns">
        <button class="btn confirmYes" type="button" id="submitProposal">Envoyer la proposition</button>
        <button class="btn confirmNo" type="button" id="cancelProposal">Annuler</button>
      </div>
    </div>
  `;

  document.getElementById("backToList").addEventListener("click", showActivitiesScreen);
  document.getElementById("cancelProposal").addEventListener("click", showActivitiesScreen);

  // Prefill datetime to next hour like other flow
  const dtInput = card.querySelector('#proposalDateTime');
  const now = new Date();
  now.setMinutes(0,0,0);
  now.setHours(now.getHours()+1);
  const toLocalDateTimeString = (d) => {
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0,16);
  };
  dtInput.value = toLocalDateTimeString(now);

  document.getElementById('submitProposal').addEventListener('click', async () => {
    const title = document.getElementById('proposalTitle').value.trim();
    const details = document.getElementById('proposalDetails').value.trim();
    const val = document.getElementById('proposalDateTime').value;
    if (!title && !details) {
      alert('Ajoute au moins un titre ou une description pour la proposition.');
      return;
    }
    const sendBtn = document.getElementById('submitProposal');
    sendBtn.textContent = 'Envoi...';
    sendBtn.disabled = true;

    let pretty = val ? new Date(val).toLocaleString(undefined, { weekday: 'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' }) : 'Date non fournie';

    const emailSubject = `💡 Proposition d'activité : ${title || 'Nouvelle proposition'}`;
    const emailText = `💡 Proposition:\n${title ? title + '\n' : ''}${details ? details + '\n' : ''}${val ? 'Proposée pour : ' + pretty + '\n' : ''}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #4a2d3f; line-height: 1.6;">
        <p>💡 <strong>Nouvelle proposition d'activité</strong></p>
        ${title ? `<p><strong>Titre:</strong> ${title}</p>` : ''}
        ${details ? `<p><strong>Détails:</strong> ${details.replace(/\n/g,'<br/>')}</p>` : ''}
        ${val ? `<p><strong>Date proposée:</strong> ${pretty}</p>` : '<p><em>Aucune date proposée</em></p>'}
      </div>
    `;

    let emailSent = false;
    let emailError = '';
    try {
      const PROD_BACKEND = 'https://demande-production.up.railway.app';
      const backendBase = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
        ? 'http://localhost:3001'
        : PROD_BACKEND;
      const backendUrl = `${backendBase.replace(/\/$/, '')}/send-email`;
      const resp = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: emailSubject, text: emailText, html: emailHtml }),
      });
      if (resp.ok) {
        emailSent = true;
      } else {
        const errorText = await resp.text();
        emailError = `Erreur serveur (${resp.status}): ${errorText}`;
        console.warn('Email API returned', resp.status, errorText);
      }
    } catch (err) {
      emailError = err.message || 'Impossible de joindre le serveur.';
      console.warn('Failed to call Email API', err);
    } finally {
      sendBtn.textContent = 'Envoyer la proposition';
      sendBtn.disabled = false;
    }

    card.innerHTML = `
      <div class="spark" aria-hidden="true"></div>
      <div class="result screenFade">
        <div class="resultIcon">💡</div>
        <div class="big">Proposition envoyée !</div>
        <p class="sub">Ta proposition ${title ? '« ' + title + ' »' : ''} a été envoyée.</p>
        ${emailSent ? '<p class="sub">Un e-mail a été envoyé.</p>' : `<p class="sub">${emailError || 'Impossible d\'envoyer la proposition (serveur absent).'}</p>`}
        <button class="btn resultBtn" id="backActivities" type="button">Retour aux activités</button>
      </div>
    `;

    // start floating praises for a short celebration (rendered in body so they float behind the card)
    startFloatingPraises();

    document.getElementById('backActivities').addEventListener('click', () => {
      stopFloatingPraises();
      showActivitiesScreen();
    });
  });
}

function loadActivityImage(img, activity) {
  if (activity.image) {
    img.src = activity.image;
    img.onerror = () => {
      img.src = './images/default.jpg';
    };
  } else {
    img.src = './images/default.jpg';
  }
}

function showActivityConfirm(activity) {
  card.innerHTML = `
    <div class="spark" aria-hidden="true"></div>
    <div class="confirmScreen screenFade">
      <button class="backLink" type="button" id="backToList">← Retour</button>

      <div class="confirmImageWrap">
        <img class="confirmImage" src="" alt="${activity.label}" />
        <div class="confirmImageGlow" aria-hidden="true"></div>
      </div>

      <div class="confirmChoicePill">${activity.emoji} ${activity.label}</div>
      <h2 class="confirmTitle">Tu es sûre de ton choix ?</h2>
      <p class="confirmHint">Si oui, c'est parti pour de vrais souvenirs.</p>

      <div class="confirmBtns">
        <button class="btn confirmYes" type="button">Oui ❤️</button>
        <button class="btn confirmNo" type="button">Non, je change</button>
      </div>
    </div>
  `;

  loadActivityImage(card.querySelector(".confirmImage"), activity);

  document.getElementById("backToList").addEventListener("click", showActivitiesScreen);
  // When user confirms, open a date/time picker to schedule the activity
  card.querySelector(".confirmYes").addEventListener("click", () => {
    card.innerHTML = `
      <div class="spark" aria-hidden="true"></div>
      <div class="scheduleScreen screenFade">
        <h2 class="confirmTitle">Choisis la date et l'heure</h2>
        <p class="confirmHint">Quand veux-tu faire ${activity.label.toLowerCase()} ?</p>
        <input type="datetime-local" id="activityDateTime" class="datetimeInput" />
        <p class="confirmHint scheduleOptLabel">Message optionnel — consignes, lieu, détails… ✏️</p>
        <textarea id="activityMessage" class="textArea scheduleTextarea" placeholder="Ex : retrouve-moi à 14h devant le parc, prévois des chaussures confortables…"></textarea>
        <div class="confirmBtns">
          <button class="btn confirmYes" type="button" id="confirmSchedule">Confirmer</button>
          <button class="btn confirmNo" type="button" id="cancelSchedule">Annuler</button>
        </div>
      </div>
    `;

    // Prefill datetime-local to next whole hour
    const dtInput = card.querySelector('#activityDateTime');
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const toLocalDateTimeString = (d) => {
      const off = d.getTimezoneOffset();
      const local = new Date(d.getTime() - off * 60000);
      return local.toISOString().slice(0, 16);
    };
    dtInput.value = toLocalDateTimeString(now);

    document.getElementById('cancelSchedule').addEventListener('click', () => showActivityConfirm(activity));

    document.getElementById('confirmSchedule').addEventListener('click', async () => {
      const val = dtInput.value;
      if (!val) {
        alert('Choisis une date et une heure.');
        return;
      }
      const sendButton = document.getElementById('confirmSchedule');
      if (sendButton) {
        sendButton.textContent = 'Envoi...';
        sendButton.disabled = true;
      }
      burst(520);
      const chosen = new Date(val);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      const pretty = chosen.toLocaleString(undefined, options);
      const activityMsg = (document.getElementById('activityMessage').value || '').trim();

      const emailSubject = `💖 Nouvelle activité réservée : ${activity.label}`;
      const emailText = `💖 Ta Baby's a choisi l'activité suivante : ${activity.label}.\n📅 Elle a été réservée pour le ${pretty}.\n${activityMsg ? '📝 Message : ' + activityMsg + '\n' : ''}✨ J'espère que tu vas lui offrir une très belle expérience et un moment précieux ensemble !`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #4a2d3f; line-height: 1.6;">
          <p>💖 <strong>Ta Baby's a choisi</strong> l'activité suivante : <strong>${activity.label}</strong>.</p>
          <p>📅 Elle a été réservée pour le <strong>${pretty}</strong>.</p>
          ${activityMsg ? `<p>📝 <strong>Message :</strong> ${activityMsg.replace(/\n/g, '<br/>')}</p>` : ''}
          <p>✨ J'espère que tu vas lui offrir une très belle expérience et un moment précieux ensemble !</p>
        </div>
      `;

      let emailSent = false;
      let emailError = '';
      try {
        // Site public : https://tlkviii.github.io/demande/
        // Emails envoyés via Railway (invisible pour l'utilisateur).
        const PROD_BACKEND = 'https://demande-production.up.railway.app';
        const backendBase = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
          ? 'http://localhost:3001'
          : PROD_BACKEND;
        const backendUrl = `${backendBase.replace(/\/$/, '')}/send-email`;
        const resp = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: emailSubject, text: emailText, html: emailHtml }),
        });
        if (resp.ok) {
          emailSent = true;
        } else {
          const errorText = await resp.text();
          emailError = `Erreur serveur (${resp.status}): ${errorText}`;
          console.warn('Email API returned', resp.status, errorText);
        }
      } catch (err) {
        emailError = err.message || 'Impossible de joindre le serveur local.';
        console.warn('Failed to call Email API', err);
      } finally {
        if (sendButton) {
          sendButton.textContent = 'Confirmer';
          sendButton.disabled = false;
        }
      }

      card.innerHTML = `
        <div class="spark" aria-hidden="true"></div>
        <div class="result screenFade">
          <div class="resultIcon">${activity.emoji}</div>
          <div class="big">C'est réservé ! 🎉</div>
          <p class="sub">On se voit pour <strong>${activity.label.toLowerCase()}</strong> le ${pretty}.</p>
          ${activityMsg ? `<p class="sub scheduleMsg">📝 ${activityMsg}</p>` : ''}
          ${emailSent ? '<p class="sub">Un e-mail automatique a été envoyé à l’adresse configurée.</p>' : `<p class="sub">${emailError || 'Impossible d\'envoyer l\'email automatique (serveur absent).'}</p>`}
          <button class="btn resultBtn" id="backActivities" type="button">Choisir une autre activité</button>
        </div>
      `;

      // celebration floating praises (rendered in body so they float behind the card)
      startFloatingPraises();

      document.getElementById('backActivities').addEventListener('click', () => {
        stopFloatingPraises();
        showActivitiesScreen();
      });
    });
  });

  card.querySelector(".confirmNo").addEventListener("click", showActivitiesScreen);
}

function restoreNoIntoRow() {
  // Put "Non" back next to "Oui" (so layout is correct for the next step)
  if (noBtn.parentElement !== btnRow) {
    btnRow.insertBefore(noBtn, noGhost);
  }
  noGhost.style.display = "none";
  noDetached = false;
  noIsBlinking = false;
  noBtn.style.position = "relative";
  noBtn.style.left = "auto";
  noBtn.style.top = "auto";
  noBtn.style.opacity = "1";
  noBtn.style.transition = "";
  noBtn.style.transform = "none";
  noScaleFactor = 1;
}

function setStep2() {
  step = 2;
  restoreNoIntoRow();

  // hide the logo — only visible on the initial "Oh princesse" screen
  const logoEl = document.getElementById('site-logo');
  if (logoEl) logoEl.style.display = 'none';

  // show the back button to return to step 1
  const backBtn = document.getElementById('step-back-btn');
  if (backBtn) {
    backBtn.style.display = 'block';
    backBtn.onclick = () => {
      backBtn.style.display = 'none';
      card.style.paddingTop = '';
      if (logoEl) logoEl.style.display = '';
      step = 1;
      restoreNoIntoRow();
      if (titleEl) titleEl.textContent = 'Oh princesse, j\'ai une petite question !!!';
      if (descEl) descEl.textContent = 'C\'est vraiment important !';
      if (footerEl) footerEl.textContent = 'Essaie de cliquer sur non si tu peux.';
      yesScale = 1;
      yesBtn.style.transform = '';
    };
  }

  // Add top padding to card so backLink button doesn't overlap h1
  card.style.paddingTop = '60px';

  if (titleEl) titleEl.textContent = "Tu veux bien passer ta vie avec le boss (MOI) ?";
  if (descEl) descEl.textContent = "Je te promets : Amour, Rires, et plein plein de SOUVENIIIRS. 💞";
  if (footerEl) footerEl.textContent = "Essaie de cliquer sur non si tu peux.";
  yesScale = 1;
  yesBtn.style.transform = "";
}

function boostYes() {
  // "Oui" garde sa taille, et grandit à chaque fuite (avec un cap).
  yesScale = Math.min(1.85, yesScale + 0.08);
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.style.filter = "brightness(1.14) drop-shadow(0 0 16px rgba(44,255,179,.55))";
  yesBtn.style.boxShadow =
    "0 18px 40px rgba(44, 255, 179, 0.26), 0 0 28px rgba(44, 255, 179, 0.25)";

  clearTimeout(yesResetTimer);
  yesResetTimer = window.setTimeout(() => {
    yesBtn.style.filter = "";
    yesBtn.style.boxShadow = "";
  }, 650);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function moveNo(smooth = true) {
  const now = Date.now();
  if (now - lastNoMoveAt < NO_MOVE_COOLDOWN_MS) return;
  if (noIsMoving || noIsBlinking) return;
  lastNoMoveAt = now;
  noIsMoving = true;

  if (!noDetached) {
    noDetached = true;

    // Keep the "Oui" button from shifting by showing a hidden placeholder.
    noGhost.style.display = "inline-block";

    // Convert current position to absolute coordinates inside the card to avoid a jump.
    const cardRect = card.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const startLeft = btnRect.left - cardRect.left;
    const startTop = btnRect.top - cardRect.top;

    // Detach the button from the flex row so it can move freely inside the card
    card.appendChild(noBtn);
    noBtn.style.position = "absolute";
    noBtn.style.left = `${startLeft}px`;
    noBtn.style.top = `${startTop}px`;
    noBtn.style.transform = "translate(0,0)";
  }

  const a = card.getBoundingClientRect();
  const b = noBtn.getBoundingClientRect();
  const pad = 14;

  const maxX = a.width - b.width - pad;
  const maxY = a.height - b.height - pad;

  // Avoid overlapping the "Oui" button (never cover it).
  const yesRectAbs = yesBtn.getBoundingClientRect();
  const yesX = yesRectAbs.left - a.left;
  const yesY = yesRectAbs.top - a.top;
  const yesW = yesRectAbs.width;
  const yesH = yesRectAbs.height;
  const safety = 18; // extra margin around "Oui"

  let x = pad + Math.random() * maxX;
  let y = pad + Math.random() * maxY;
  let tries = 0;
  while (
    tries < 30 &&
    overlaps(
      x,
      y,
      b.width,
      b.height,
      yesX - safety,
      yesY - safety,
      yesW + safety * 2,
      yesH + safety * 2,
    )
  ) {
    x = pad + Math.random() * maxX;
    y = pad + Math.random() * maxY;
    tries += 1;
  }

  // Becomes smaller at each click attempt
  noScaleFactor = Math.max(0.38, noScaleFactor - 0.07);
  const scale = noScaleFactor;
  const tilt = (Math.random() * 16 - 8).toFixed(1);
  const transition = smooth
    ? "left .36s cubic-bezier(.2,.9,.2,1), top .36s cubic-bezier(.2,.9,.2,1), transform .36s cubic-bezier(.2,.9,.2,1), opacity .14s ease"
    : "none";
  noBtn.style.transition = transition;
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.opacity = "1";
  noBtn.style.transform = `translate(0,0) rotate(${tilt}deg) scale(${scale.toFixed(2)})`;

  // Incite en agrandissant "Oui" à chaque fuite de "Non"
  boostYes();

  // Sometimes blink out then reappear elsewhere
  if (Math.random() < 0.33) {
    noIsBlinking = true;
    let nextX = pad + Math.random() * maxX;
    let nextY = pad + Math.random() * maxY;
    let t2 = 0;
    while (
      t2 < 30 &&
      overlaps(
        nextX,
        nextY,
        b.width,
        b.height,
        yesX - safety,
        yesY - safety,
        yesW + safety * 2,
        yesH + safety * 2,
      )
    ) {
      nextX = pad + Math.random() * maxX;
      nextY = pad + Math.random() * maxY;
      t2 += 1;
    }
    noBtn.style.opacity = "0";
    window.setTimeout(() => {
      noBtn.style.left = `${nextX}px`;
      noBtn.style.top = `${nextY}px`;
      noBtn.style.opacity = "1";
      noIsBlinking = false;
      noIsMoving = false;
    }, 120);
    return;
  }

  window.setTimeout(() => {
    noIsMoving = false;
  }, smooth ? 220 : 80);
}

// Counter to track how many times the user tried to click "Non"
let noClickCount = 0;
let noMessageEl = null;

function showNoMessage() {
  if (noMessageEl) return; // already visible
  // level = 0 at 3 clicks, +1 every 3 extra clicks (capped at 5 for sanity)
  const level = Math.min(5, Math.floor(noClickCount / 3) - 1);
  noMessageEl = document.createElement('div');
  noMessageEl.className = 'no-message-toast';
  noMessageEl.textContent = 'Clique sur OUI wsh y\'a quoi ???';
  // base font-size 15px, +8px per level
  const fontSize = 15 + level * 8;
  const padding = `${13 + level * 5}px ${24 + level * 10}px`;
  noMessageEl.style.fontSize = `${fontSize}px`;
  noMessageEl.style.padding = padding;
  document.body.appendChild(noMessageEl);
  // auto-hide after 3s
  window.setTimeout(hideNoMessage, 3000);
}

function hideNoMessage() {
  if (!noMessageEl) return;
  noMessageEl.classList.add('no-message-hide');
  window.setTimeout(() => {
    if (noMessageEl && noMessageEl.parentElement) {
      noMessageEl.parentElement.removeChild(noMessageEl);
    }
    noMessageEl = null;
  }, 350);
}

// Reset counter when user advances (called from step changes)
function resetNoCounter() {
  noClickCount = 0;
  hideNoMessage();
}

// Move only when trying to click/tap on "Non"
noBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  noClickCount++;
  if (noClickCount % 3 === 0) showNoMessage();
  moveNo(false);
});
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNo(false);
});

// Confetti
const cvs = document.getElementById("confetti");
const ctx = cvs.getContext("2d");
let confetti = [];
let raf;
let confettiRunning = false;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  cvs.width = Math.floor(window.innerWidth * dpr);
  cvs.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

window.addEventListener("resize", resize);
resize();

function burst(count = 380) {
  const colors = ["#2cffb3", "#ff4da6", "#8c5aff", "#ffffff", "#ffd1e8"];
  const n = count;

  for (let i = 0; i < n; i++) {
    // Guaranteed balanced spawn from all 4 sides
    const edge = i % 4; // 0:left 1:right 2:top 3:bottom
    let startX = 0;
    let startY = 0;
    let vx = 0;
    let vy = 0;

    if (edge === 0) {
      // left
      startX = -20;
      startY = Math.random() * window.innerHeight;
      vx = 4 + Math.random() * 7;
      vy = (Math.random() * 2 - 1) * 3.2;
    } else if (edge === 1) {
      // right
      startX = window.innerWidth + 20;
      startY = Math.random() * window.innerHeight;
      vx = -(4 + Math.random() * 7);
      vy = (Math.random() * 2 - 1) * 3.2;
    } else if (edge === 2) {
      // top
      startX = Math.random() * window.innerWidth;
      startY = -20;
      vx = (Math.random() * 2 - 1) * 3.2;
      vy = 3 + Math.random() * 7;
    } else {
      // bottom
      startX = Math.random() * window.innerWidth;
      startY = window.innerHeight + 20;
      vx = (Math.random() * 2 - 1) * 3.2;
      vy = -(4 + Math.random() * 7);
    }

    confetti.push({
      x: startX,
      y: startY,
      vx,
      vy,
      g: 0.18 + Math.random() * 0.12,
      r: 2 + Math.random() * 4,
      a: 1,
      rot: Math.random() * Math.PI,
      vr: (Math.random() * 2 - 1) * 0.2,
      c: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  if (!confettiRunning) {
    confettiRunning = true;
    animate();
  }
}

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const p of confetti) {
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.a *= 0.992;

    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.r, -p.r, p.r * 2.2, p.r * 1.2);
    ctx.restore();
  }

  confetti = confetti.filter((p) => p.a > 0.05 && p.y < window.innerHeight + 60);
  if (confetti.length) {
    raf = requestAnimationFrame(animate);
  } else {
    confettiRunning = false;
  }
}

yesBtn.addEventListener("pointerdown", () => {
  // Show confetti as soon as the press starts
  burst(320);
});

yesBtn.addEventListener("click", () => {
  // Add an extra bigger wave on click
  burst(520);
  resetNoCounter();
  if (step === 1) {
    setStep2();
    return;
  }

  // Step 2: final cute success state
  card.innerHTML = `
    <div class="spark" aria-hidden="true"></div>
    <div class="result resultSuccess screenFade">
      <button class="backLink" type="button" id="backFromWow">← Retour</button>
      <div class="big">Trop bieeeen 😭❤️</div>
      <p class="sub">Tu viens de me rendre la personne la plus heureuse !</p>
      <button class="btn resultBtn" id="startTogether" type="button">Commençons alors !</button>
    </div>
  `;

  startFloatingPraises();

  document.getElementById('backFromWow').addEventListener('click', showStep2Rebuilt);
  document.getElementById("startTogether").addEventListener("click", showActivitiesScreen);
});
