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
];

function showActivitiesScreen() {
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
      <h2 class="activityTitle">Activités possibles à faire ensemble :</h2>
      <p class="activitySubtitle">Choisis ce qui te fait le plus envie :</p>
      <div class="activityGrid">${buttons}</div>
    </div>
  `;

  card.querySelectorAll(".activityBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const activity = activities.find((a) => a.label === btn.dataset.activity);
      if (activity) showActivityConfirm(activity);
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
      burst(520);
      const chosen = new Date(val);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      const pretty = chosen.toLocaleString(undefined, options);

      const emailSubject = `💖 Nouvelle activité réservée : ${activity.label}`;
      const emailText = `💖 Ta Baby's a choisi l'activité suivante : ${activity.label}.\n📅 Elle a été réservée pour le ${pretty}.\n✨ J'espère que tu vas lui offrir une très belle expérience et un moment précieux ensemble !`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #4a2d3f; line-height: 1.6;">
          <p>💖 <strong>Ta Baby's a choisi</strong> l'activité suivante : <strong>${activity.label}</strong>.</p>
          <p>📅 Elle a été réservée pour le <strong>${pretty}</strong>.</p>
          <p>✨ J'espère que tu vas lui offrir une très belle expérience et un moment précieux ensemble !</p>
        </div>
      `;

      let emailSent = false;
      let emailError = '';
      try {
        // Backend URL resolution:
        // - In local dev -> http://localhost:3001
        // - In production -> either set PROD_BACKEND below to your deployed Railway URL
        //   or the script will use `location.origin`.
        const PROD_BACKEND = 'https://REPLACE_WITH_YOUR_RAILWAY_URL'; // <- replace after deploy
        const backendBase = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
          ? 'http://localhost:3001'
          : (PROD_BACKEND && PROD_BACKEND !== 'https://REPLACE_WITH_YOUR_RAILWAY_URL' ? PROD_BACKEND : location.origin);
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
      }

      card.innerHTML = `
        <div class="spark" aria-hidden="true"></div>
        <div class="result screenFade">
          <div class="resultIcon">${activity.emoji}</div>
          <div class="big">C'est réservé ! 🎉</div>
          <p class="sub">On se voit pour <strong>${activity.label.toLowerCase()}</strong> le ${pretty}.</p>
          ${emailSent ? '<p class="sub">Un e-mail automatique a été envoyé à l’adresse configurée.</p>' : `<p class="sub">${emailError || 'Impossible d\'envoyer l\'email automatique (serveur absent).'}</p>`}
          <button class="btn resultBtn" id="backActivities" type="button">Choisir une autre activité</button>
        </div>
      `;

      document.getElementById('backActivities').addEventListener('click', showActivitiesScreen);
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

  if (titleEl) titleEl.textContent = "Tu veux bien passer ta vie avec le boss (MOI) ?";
  if (descEl) descEl.textContent = "Je te promets : amour, rires, et plein de souvenirs. 💞";
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

// Move only when trying to click/tap on "Non"
noBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
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
  if (step === 1) {
    setStep2();
    return;
  }

  // Step 2: final cute success state
  card.innerHTML = `
    <div class="spark" aria-hidden="true"></div>
    <div class="result resultSuccess screenFade">
      <div class="big">Trop bieeeen 😭❤️</div>
      <p class="sub">Tu viens de me rendre la personne la plus heureuse !</p>
      <button class="btn resultBtn" id="startTogether" type="button">Commençons alors !</button>
    </div>
  `;

  document.getElementById("startTogether").addEventListener("click", showActivitiesScreen);
});
