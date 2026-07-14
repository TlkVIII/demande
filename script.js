// Background hearts
const heartsWrap = document.getElementById("hearts");
const heartCount = 30;
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
  h.style.animationDuration = `${dur}s`;
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
const bgMiniImagesEl = document.getElementById("bg-mini-images");

// Force correct centering on btnRow (most reliable cross-browser/iOS approach)
btnRow.style.textAlign = 'center';
btnRow.style.width = '100%';

const backgroundImages = [
  "./images/imagefond/IMG_2463.jpeg",
  "./images/imagefond/IMG_2465.jpeg",
  "./images/imagefond/IMG_2466.jpeg",
  "./images/imagefond/IMG_2518.jpeg",
  "./images/imagefond/IMG_2520.jpeg",
  "./images/imagefond/IMG_2524.jpeg",
  "./images/imagefond/IMG_2526.jpeg",
  "./images/imagefond/IMG_2529.jpeg",
  "./images/imagefond/IMG_2530.jpeg",
  "./images/imagefond/IMG_2533.jpeg",
  "./images/imagefond/IMG_2534 (1).jpeg",
  "./images/imagefond/IMG_2534.jpeg",
  "./images/imagefond/IMG_2544.jpeg",
  "./images/imagefond/IMG_2598.jpeg",
  "./images/imagefond/IMG_2605.jpeg",
  "./images/imagefond/IMG_2606.jpeg",
  "./images/imagefond/IMG_2607.jpeg",
  "./images/imagefond/IMG_2610.jpeg",
  "./images/imagefond/IMG_2634 (1).jpeg",
  "./images/imagefond/IMG_2634.jpeg",
  "./images/imagefond/IMG_2635.jpeg",
  "./images/imagefond/IMG_2636.jpeg",
  "./images/imagefond/IMG_2651.jpeg",
  "./images/imagefond/IMG_2702.jpg",
];

let bgSwapTimeout = null;
let bgCycleInterval = null;
const bgTiles = [];

function ensureBackgroundTiles(tileCount) {
  if (!bgMiniImagesEl) return;
  if (bgTiles.length === tileCount) return;

  bgMiniImagesEl.innerHTML = '';
  bgTiles.length = 0;

  const frag = document.createDocumentFragment();
  for (let i = 0; i < tileCount; i++) {
    const tile = document.createElement('span');
    tile.className = 'bg-mini-image';
    frag.appendChild(tile);
    bgTiles.push(tile);
  }
  bgMiniImagesEl.appendChild(frag);
}

function setRandomBackground() {
  if (!bgMiniImagesEl || !backgroundImages.length) return;

  const tileCount = Math.min(window.innerWidth < 700 ? 9 : 12, backgroundImages.length);
  ensureBackgroundTiles(tileCount);

  for (const tile of bgTiles) {
    tile.classList.remove('is-visible');
  }

  if (bgSwapTimeout) {
    clearTimeout(bgSwapTimeout);
    bgSwapTimeout = null;
  }

  bgSwapTimeout = window.setTimeout(() => {
    if (!bgMiniImagesEl) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cols = viewportWidth < 700 ? 3 : 4;
    const rows = Math.ceil(tileCount / cols);
    const cellWidth = viewportWidth / cols;
    const cellHeight = viewportHeight / rows;

    const shuffledIndexes = backgroundImages.map((_, idx) => idx);
    for (let i = shuffledIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndexes[i], shuffledIndexes[j]] = [shuffledIndexes[j], shuffledIndexes[i]];
    }

    for (let i = 0; i < tileCount; i++) {
      const imageIndex = shuffledIndexes[i];

      const tile = bgTiles[i];
      const width = 70 + Math.random() * 72;
      const height = 70 + Math.random() * 72;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const baseX = col * cellWidth;
      const baseY = row * cellHeight;
      const maxOffsetX = Math.max(0, cellWidth - width - 24);
      const maxOffsetY = Math.max(0, cellHeight - height - 24);
      const x = baseX + 12 + Math.random() * maxOffsetX;
      const y = baseY + 12 + Math.random() * maxOffsetY;

      tile.style.setProperty('--mini-src', `url("${backgroundImages[imageIndex]}")`);
      tile.style.setProperty('--mini-w', `${width}px`);
      tile.style.setProperty('--mini-h', `${height}px`);
      tile.style.setProperty('--mini-x', `${x}px`);
      tile.style.setProperty('--mini-y', `${y}px`);
      tile.style.setProperty('--mini-rot', `${Math.random() * 24 - 12}deg`);
      tile.style.setProperty('--mini-opacity', `${0.18 + Math.random() * 0.18}`);

      window.requestAnimationFrame(() => {
        tile.classList.add('is-visible');
      });
    }
  }, 140);
}

setRandomBackground();
bgCycleInterval = window.setInterval(setRandomBackground, 7000);
window.addEventListener('resize', () => {
  setRandomBackground();
});


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
    label: "Cinéma",
    emoji: "🎞️",
    image: "./images/cinema.JPEG",
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
const PRAISE_LANES = [8, 22, 36, 50, 64, 78, 92];
const PRAISE_LANES_MOBILE = [16, 34, 50, 66, 84];
let _floatingPraisesInterval = null;
let _floatingPraisesContainer = null;
const _floatingPraiseLaneBusy = new Set();
let _buttonConfettiLayer = null;

function startFloatingPraises(parent = document.body) {
  stopFloatingPraises();
  _floatingPraisesContainer = document.createElement('div');
  _floatingPraisesContainer.className = 'floating-praises';
  parent.appendChild(_floatingPraisesContainer);

  function spawnOne() {
    if (!_floatingPraisesContainer) return;

    const lanePool = window.innerWidth <= 560 ? PRAISE_LANES_MOBILE : PRAISE_LANES;
    const freeLanes = lanePool.filter((lane) => !_floatingPraiseLaneBusy.has(lane));
    if (!freeLanes.length) return;
    const lane = freeLanes[Math.floor(Math.random() * freeLanes.length)];

    const info = PRAISE_TEXTS[Math.floor(Math.random() * PRAISE_TEXTS.length)];
    const el = document.createElement('span');
    el.className = 'floating-praise';
    el.innerHTML = `${info.emoji} ${info.text}`;

    _floatingPraiseLaneBusy.add(lane);
    const viewportW = window.innerWidth;
    const baseX = (lane / 100) * viewportW;
    el.style.left = `${baseX}px`;
    el.style.transform = 'translateX(-50%)';
    // Slight random delay so they don't all look the same
    el.style.animationDelay = `${Math.random() * 0.6}s`;

    _floatingPraisesContainer.appendChild(el);

    // Keep the bubble inside screen bounds even for wider text.
    const bubbleRect = el.getBoundingClientRect();
    const halfW = bubbleRect.width / 2;
    const safeMargin = window.innerWidth <= 560 ? 18 : 24;
    const clampedX = Math.max(halfW + safeMargin, Math.min(viewportW - halfW - safeMargin, baseX));
    el.style.left = `${clampedX}px`;

    // Remove after animation (2.8s matches CSS animation)
    window.setTimeout(() => {
      _floatingPraiseLaneBusy.delete(lane);
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
  _floatingPraiseLaneBusy.clear();
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

function getButtonConfettiLayer() {
  if (_buttonConfettiLayer && _buttonConfettiLayer.parentElement) return _buttonConfettiLayer;

  _buttonConfettiLayer = document.createElement('div');
  _buttonConfettiLayer.className = 'button-confetti-layer';
  document.body.appendChild(_buttonConfettiLayer);
  return _buttonConfettiLayer;
}

function launchButtonConfetti(button, count = 34) {
  if (!button) return;

  const layer = getButtonConfettiLayer();
  const rect = button.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  const colors = ['#2cffb3', '#ff4da6', '#ffd166', '#ffffff', '#8c5aff'];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'btn-confetti-piece';

    const angle = (-120 + Math.random() * 240) * (Math.PI / 180);
    const distance = 90 + Math.random() * 180;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - (90 + Math.random() * 130);

    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.width = `${4 + Math.random() * 5}px`;
    piece.style.height = `${6 + Math.random() * 7}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--dx', `${dx.toFixed(1)}px`);
    piece.style.setProperty('--dy', `${dy.toFixed(1)}px`);
    piece.style.setProperty('--rot', `${(Math.random() * 520 - 260).toFixed(1)}deg`);
    piece.style.animationDuration = `${760 + Math.random() * 280}ms`;

    layer.appendChild(piece);

    window.setTimeout(() => {
      if (piece.parentElement) piece.parentElement.removeChild(piece);
    }, 1200);
  }
}

function runYesConfettiThen(button, next) {
  if (!button || button.dataset.busy === '1') return;
  button.dataset.busy = '1';
  launchButtonConfetti(button);
  window.setTimeout(() => {
    try {
      next();
    } finally {
      // Unlock button in case it remains in DOM for the next step.
      if (button && button.dataset) button.dataset.busy = '0';
    }
  }, 360);
}

function buildCalendarIcsLink(calendarEvent) {
  if (!calendarEvent) return '';
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(calendarEvent))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  const httpsUrl = `https://demande-production.up.railway.app/calendar.ics?event=${payload}`;
  return {
    httpsUrl,
    webcalUrl: httpsUrl.replace(/^https:/, 'webcal:'),
  };
}

async function postEmail(payload, timeoutMs = 15000) {
  const PROD_BACKEND = 'https://demande-production.up.railway.app';
  const backendBase = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : PROD_BACKEND;
  const backendUrl = `${backendBase.replace(/\/$/, '')}/send-email`;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timer);
  }
}


function showTropBieeeenScreen() {
  stopFloatingPraises();
  card.innerHTML = `
    <button class="backLink" type="button" id="backFromWow">← Retour</button>
    <div class="spark" aria-hidden="true"></div>
    <div class="result resultSuccess screenFade">
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
  const yesRebuiltBtn = document.getElementById('yes-r');
  yesRebuiltBtn.addEventListener('click', () => {
    runYesConfettiThen(yesRebuiltBtn, showTropBieeeenScreen);
  });
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
    <button class="backLink" type="button" id="backToStep2">← Retour</button>
    <div class="spark" aria-hidden="true"></div>
    <div class="activityScreen screenFade">
      <h2 class="activityTitle">Activités possibles à faire enseeeeemble :</h2>
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
    <button class="backLink" type="button" id="backToList">← Retour</button>
    <div class="spark" aria-hidden="true"></div>
    <div class="proposeScreen screenFade">
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
    const proposalStart = val ? new Date(val) : null;
    const proposalEnd = proposalStart ? new Date(proposalStart.getTime() + 60 * 60 * 1000) : null;
    const emailSubject = `💡 Proposition d'activité : ${title || 'Nouvelle proposition'}`;
    const emailText = `💡 Proposition:\n${title ? title + '\n' : ''}${details ? details + '\n' : ''}${val ? 'Proposée pour : ' + pretty + '\n' : ''}`;
    const proposalCalendarLinks = proposalStart
      ? buildCalendarIcsLink({
          title: title || 'Proposition d\'activite',
          startIso: proposalStart.toISOString(),
          endIso: proposalEnd.toISOString(),
          description: details || emailText,
          location: '',
          url: location.href,
        })
      : null;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #4a2d3f; line-height: 1.6;">
        <p>💡 <strong>Nouvelle proposition d'activité</strong></p>
        ${title ? `<p><strong>Titre:</strong> ${title}</p>` : ''}
        ${details ? `<p><strong>Détails:</strong> ${details.replace(/\n/g,'<br/>')}</p>` : ''}
        ${val ? `<p><strong>Date proposée:</strong> ${pretty}</p>` : '<p><em>Aucune date proposée</em></p>'}
        ${proposalCalendarLinks ? `<p><a href="${proposalCalendarLinks.webcalUrl}">Ajouter au calendrier</a> | <a href="${proposalCalendarLinks.httpsUrl}">Ouvrir le fichier calendrier</a></p>` : ''}
      </div>
    `;

    let emailSent = false;
    let emailError = '';
    try {
      const resp = await postEmail({
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
        calendarUrl: proposalCalendarLinks ? proposalCalendarLinks.httpsUrl : '',
        calendarEvent: proposalStart
          ? {
              title: title || 'Proposition d\'activite',
              startIso: proposalStart.toISOString(),
              endIso: proposalEnd.toISOString(),
              description: details || emailText,
              location: '',
              url: location.href,
            }
          : null,
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
      <button class="backLink" type="button" id="backFromProposal">← Retour</button>
      <div class="spark" aria-hidden="true"></div>
      <div class="result screenFade">
        <div class="resultIcon">💡</div>
        <div class="big">Proposition envoyée !</div>
        <p class="sub">Ta proposition ${title ? '« ' + title + ' »' : ''} a été envoyée.</p>
        ${emailSent ? '<p class="sub">Un e-mail a été envoyé.</p>' : `<p class="sub">${emailError || 'Impossible d\'envoyer la proposition (serveur absent).'}</p>`}
        <button class="btn resultBtn" id="backActivitiesProposal" type="button">Retour aux activités</button>
      </div>
    `;

    // start floating praises for a short celebration (rendered in body so they float behind the card)
    startFloatingPraises();

    document.getElementById('backFromProposal').addEventListener('click', () => {
      stopFloatingPraises();
      showActivitiesScreen();
    });
    document.getElementById('backActivitiesProposal').addEventListener('click', () => {
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
    <button class="backLink" type="button" id="backToList">← Retour</button>
    <div class="spark" aria-hidden="true"></div>
    <div class="confirmScreen screenFade">
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
      <button class="backLink" type="button" id="backFromSchedule">← Retour</button>
      <div class="spark" aria-hidden="true"></div>
      <div class="scheduleScreen screenFade">
        <h2 class="confirmTitle">Choisis la date et l'heure</h2>
        <p class="confirmHint">Quand veux-tu faire ${activity.label.toLowerCase()} ?</p>
        <input type="datetime-local" id="activityDateTime" class="datetimeInput" />
        <p class="confirmHint scheduleOptLabel">Message optionnel — consignes, lieu, détails… ✏️</p>
        <textarea id="activityMessage" class="textArea scheduleTextarea" placeholder="Ex : retrouve-moi à 14h devant le parc, prévois des chaussures confortables…"></textarea>
        <div class="confirmBtns">
          <button class="btn confirmYes" type="button" id="confirmSchedule">Confirmer</button>
          <button class="btn confirmNo" type="button" id="cancelScheduleBtn">Annuler</button>
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

    document.getElementById('backFromSchedule').addEventListener('click', () => showActivityConfirm(activity));
    document.getElementById('cancelScheduleBtn').addEventListener('click', () => showActivityConfirm(activity));

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
      const chosen = new Date(val);
      const chosenEnd = new Date(chosen.getTime() + 2 * 60 * 60 * 1000);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      const pretty = chosen.toLocaleString(undefined, options);
      const prettyDate = chosen.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const prettyTime = chosen.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      const activityMsg = (document.getElementById('activityMessage').value || '').trim();
      const emailSubject = `💖 Nouvelle activité réservée : ${activity.label}`;
      const emailText = `💕 Ta Baby's a choisi l'activité suivante : ${activity.label}.\n📅 Elle a été réservée pour le ${pretty}.\n${activityMsg ? '📝 Message : ' + activityMsg + '\n' : ''}✨ J'espère que tu vas lui offrir une très belle expérience et un moment précieux ensemble !`;
      const activityCalendarLinks = buildCalendarIcsLink({
        title: `${activity.label} avec Baby's`,
        startIso: chosen.toISOString(),
        endIso: chosenEnd.toISOString(),
        description: activityMsg || emailText,
        location: '',
        url: location.href,
      });
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #4a2d3f; line-height: 1.6;">
          <p>💖 <strong>Ta Baby's a choisi</strong> l'activité suivante : <strong>${activity.label}</strong>.</p>
          <p>📅 Elle a été réservée pour le <strong>${pretty}</strong>.</p>
          ${activityMsg ? `<p>📝 <strong>Message :</strong> ${activityMsg.replace(/\n/g, '<br/>')}</p>` : ''}
          ${activityCalendarLinks ? `<p><a href="${activityCalendarLinks.webcalUrl}">Ajouter au calendrier</a> | <a href="${activityCalendarLinks.httpsUrl}">Ouvrir le fichier calendrier</a></p>` : ''}
          <p>✨ J'espère que tu vas lui offrir une très belle expérience et un moment précieux ensemble !</p>
        </div>
      `;

      let emailSent = false;
      let emailError = '';
        let secondaryEmailError = '';
      try {
          // Site public : https://tlkviii.github.io/demande/
          // Emails envoyés via Railway (invisible pour l'utilisateur).
          const resp = await postEmail({
            subject: emailSubject,
            text: emailText,
            html: emailHtml,
            secondaryEmail: {
              to: 'juniordemai976@gmail.com',
              includeCalendar: true,
              subject: `💖 Activité réservée : ${activity.label}`,
              text: `💖 Ton chéri, le meilleur du monde, va te préparer l'activité suivante : ${activity.label}.\n📅 Que tu as réservée le ${prettyDate} à ${prettyTime}.\n📆 Ajouter au calendrier: ${activityCalendarLinks ? activityCalendarLinks.webcalUrl : ''}\n📎 Ouvrir le fichier calendrier: ${activityCalendarLinks ? activityCalendarLinks.httpsUrl : ''}\n✨ J'espère qu'il t'offrira une très belle expérience et un moment précieux ensemble !`,
              html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;"><p>💖 Ton chéri, <strong>le meilleur du monde</strong>, va te préparer l'activité suivante : <strong>${activity.label}</strong>.</p><p>📅 Que tu as réservée le <strong>${prettyDate}</strong> à <strong>${prettyTime}</strong>.</p>${activityCalendarLinks ? `<p><a href="${activityCalendarLinks.webcalUrl}">Ajouter au calendrier</a> | <a href="${activityCalendarLinks.httpsUrl}">Ouvrir le fichier calendrier</a></p>` : ''}<p>✨ J'espère qu'il t'offrira une très belle expérience et un moment précieux ensemble.</p></div>`,
            },
            calendarUrl: activityCalendarLinks ? activityCalendarLinks.httpsUrl : '',
            calendarEvent: {
              title: `${activity.label} avec Baby's`,
              startIso: chosen.toISOString(),
              endIso: chosenEnd.toISOString(),
              description: activityMsg || emailText,
              location: '',
              url: location.href,
            },
          });
        let respData = null;
        try {
          respData = await resp.json();
        } catch (_) {
          respData = null;
        }
        if (resp.ok) {
          emailSent = true;
          if (respData && respData.secondaryError) {
            secondaryEmailError = `Deuxième email non envoyé: ${respData.secondaryError}`;
            console.warn('Secondary email failure:', respData.secondaryError);
          }
        } else {
          const errorText = respData && respData.error ? respData.error : await resp.text();
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

      card.innerHTML = `        <button class="backLink" type="button" id="backFromResult">← Retour</button>        <div class="spark" aria-hidden="true"></div>
        <div class="result screenFade">
          <div class="resultIcon">${activity.emoji}</div>
          <div class="big">C'est réservé ! 🎉</div>
          <p class="sub">On se voit pour <strong>${activity.label.toLowerCase()}</strong> le ${pretty}h.</p>
          ${activityMsg ? `<p class="sub scheduleMsg">📝 ${activityMsg}</p>` : ''}
          ${emailSent ? '<p class="sub">Un e-mail automatique a été envoyé à l’adresse configurée.</p>' : `<p class="sub">${emailError || 'Impossible d\'envoyer l\'email automatique (serveur absent).'}</p>`}
          ${secondaryEmailError ? `<p class="sub">⚠️ ${secondaryEmailError}</p>` : ''}
          <button class="btn resultBtn" id="backActivities" type="button">Choisir une autre activité</button>
        </div>
      `;

      // celebration floating praises (rendered in body so they float behind the card)
      startFloatingPraises();

      document.getElementById('backFromResult').addEventListener('click', () => {
        stopFloatingPraises();
        showActivitiesScreen();
      });
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
  card.style.paddingTop = '48px';

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
let noMessageTimeout = null;

function showNoMessage() {
  // level = 0 at 3 clicks, +1 every 3 extra clicks (capped at 5 for sanity)
  const level = Math.min(5, Math.floor(noClickCount / 3) - 1);
  
  if (!noMessageEl) {
    // Create new element
    noMessageEl = document.createElement('div');
    noMessageEl.className = 'no-message-toast';
    noMessageEl.textContent = 'Clique sur OUI wsh y\'a quoi ???';
    document.body.appendChild(noMessageEl);
  }
  
  // Update size (grows on each click)
  const fontSize = 15 + level * 8;
  const padding = `${13 + level * 5}px ${24 + level * 10}px`;
  noMessageEl.style.fontSize = `${fontSize}px`;
  noMessageEl.style.padding = padding;
  noMessageEl.style.transition = 'font-size .3s ease, padding .3s ease';
  
  // Reset the auto-hide timer
  if (noMessageTimeout) clearTimeout(noMessageTimeout);
  noMessageTimeout = window.setTimeout(hideNoMessage, 3000);
}

function hideNoMessage() {
  if (!noMessageEl) return;
  if (noMessageTimeout) {
    clearTimeout(noMessageTimeout);
    noMessageTimeout = null;
  }
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

yesBtn.addEventListener("click", () => {
  resetNoCounter();
  if (step === 1) {
    runYesConfettiThen(yesBtn, setStep2);
    return;
  }

  runYesConfettiThen(yesBtn, () => {
    // Step 2: final cute success state
    card.innerHTML = `
      <button class="backLink" type="button" id="backFromWow">← Retour</button>
      <div class="spark" aria-hidden="true"></div>
      <div class="result resultSuccess screenFade">
        <div class="big">Trop bieeeen 😭❤️</div>
        <p class="sub">Tu viens de me rendre la personne la plus heureuse !</p>
        <button class="btn resultBtn" id="startTogether" type="button">Commençons alors !</button>
      </div>
    `;

    startFloatingPraises();

    document.getElementById('backFromWow').addEventListener('click', showStep2Rebuilt);
    document.getElementById("startTogether").addEventListener("click", showActivitiesScreen);
  });
});
