const heartField = document.getElementById("heartField");
const particlesCanvas = document.getElementById("particles");
const loveCanvas = document.getElementById("loveCanvas");
const messageCard = document.getElementById("messageCard");
const revealBtn = document.getElementById("revealBtn");
const soundBtn = document.getElementById("soundBtn");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Background floating hearts ----------
const hearts = ["♡", "♥", "❤", "♡", "♥"];

for (let i = 0; i < 34; i++) {
  const el = document.createElement("span");
  el.className = "bg-heart";
  el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
  el.style.left = `${Math.random() * 100}%`;
  el.style.animationDuration = `${8 + Math.random() * 13}s`;
  el.style.animationDelay = `${-Math.random() * 20}s`;
  el.style.opacity = `${0.18 + Math.random() * 0.5}`;
  heartField.appendChild(el);
}

// ---------- Full-screen particles ----------
const pctx = particlesCanvas.getContext("2d");
let particles = [];

function resizeParticleCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  particlesCanvas.width = innerWidth * dpr;
  particlesCanvas.height = innerHeight * dpr;
  pctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  particles = Array.from({ length: Math.min(120, Math.floor(innerWidth / 7)) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 2.3 + .3,
    vx: (Math.random() - .5) * .15,
    vy: -(Math.random() * .25 + .03),
    a: Math.random() * .6 + .1
  }));
}

function drawParticles() {
  pctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -5) { p.y = innerHeight + 5; p.x = Math.random() * innerWidth; }

    pctx.beginPath();
    pctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    pctx.fillStyle = `rgba(255,100,180,${p.a})`;
    pctx.fill();
  }
  if (!reduceMotion) requestAnimationFrame(drawParticles);
}
resizeParticleCanvas();
if (!reduceMotion) drawParticles();
window.addEventListener("resize", resizeParticleCanvas);

// ---------- Heart galaxy inside card ----------
const ctx = loveCanvas.getContext("2d");
let W = 0, H = 0;
let heartPoints = [];
let stars = [];
let startTime = performance.now();

function resizeLoveCanvas() {
  const rect = loveCanvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = rect.width;
  H = rect.height;
  loveCanvas.width = W * dpr;
  loveCanvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Parametric heart, plus depth/noise.
  heartPoints = [];
  for (let i = 0; i < 1450; i++) {
    const t = Math.random() * Math.PI * 2;
    const scale = Math.pow(Math.random(), .55);
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    const noise = (Math.random() - .5) * 1.8;
    heartPoints.push({
      x: x * (6.1 + Math.random() * 2.4) * scale + noise,
      y: y * (6.1 + Math.random() * 2.4) * scale + noise,
      size: Math.random() * 1.8 + .35,
      phase: Math.random() * Math.PI * 2
    });
  }

  stars = Array.from({length: 250}, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.2,
    a: Math.random() * .65
  }));
}

function drawLove(t) {
  ctx.clearRect(0, 0, W, H);

  // Star field.
  for (const s of stars) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,70,120,${s.a})`;
    ctx.fill();
  }

  // Glowing red rings / galaxy.
  const cx = W / 2, cy = H * .61;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy + i * 2, 35 + i * 25, 7 + i * 3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,20,75,${.16 - i*.012})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Heart particle cloud.
  const scale = Math.min(W, H) / 500;
  for (const p of heartPoints) {
    const wobble = Math.sin(t * .002 + p.phase) * .7;
    const x = cx + p.x * scale + wobble;
    const y = H * .34 + p.y * scale + wobble;
    const alpha = .35 + .45 * (0.5 + 0.5 * Math.sin(t * .003 + p.phase));
    ctx.beginPath();
    ctx.arc(x, y, p.size * scale, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,${25 + Math.floor(alpha*45)},${35 + Math.floor(alpha*25)},${alpha})`;
    ctx.fill();
  }

  // Bright core / eye.
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
  g.addColorStop(0, "rgba(255,245,220,.95)");
  g.addColorStop(.07, "rgba(255,160,130,.7)");
  g.addColorStop(.25, "rgba(255,30,70,.28)");
  g.addColorStop(1, "rgba(255,0,60,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - 100, cy - 100, 200, 200);

  if (!reduceMotion) requestAnimationFrame(drawLove);
}
resizeLoveCanvas();
drawLove(startTime);
window.addEventListener("resize", resizeLoveCanvas);

// ---------- Reveal interaction ----------
revealBtn.addEventListener("click", () => {
  const open = messageCard.classList.toggle("open");
  revealBtn.innerHTML = open
    ? 'Close my heart <span>↑</span>'
    : 'Open my heart <span>→</span>';

  if (open) {
    messageCard.animate(
      [{ transform: "scale(.985)" }, { transform: "scale(1)" }],
      { duration: 500, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
  }
});

// ---------- Tiny synthesized chime; no external audio file required ----------
let audioCtx = null;
let muted = true;

function playChime() {
  if (muted) return;
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();

  const now = audioCtx.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(.0001, now + i*.09);
    gain.gain.exponentialRampToValueAtTime(.07, now + i*.09 + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, now + i*.09 + .55);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now + i*.09);
    osc.stop(now + i*.09 + .6);
  });
}

soundBtn.addEventListener("click", () => {
  muted = !muted;
  soundBtn.textContent = muted ? "♪" : "♫";
  if (!muted) playChime();
});

// Make the reveal feel alive.
setInterval(() => {
  if (!document.hidden && !reduceMotion) {
    const card = document.querySelector(".message-card");
    card.style.boxShadow = `0 30px 90px rgba(0,0,0,.65), 0 0 ${45 + Math.random()*20}px rgba(255,0,126,.${18 + Math.floor(Math.random()*12)})`;
  }
}, 1800);
