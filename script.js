/* ---------- Ícones pixelados (8x8) ---------- */
const ART = {
  heart:   [".XX..XX.","XXXXXXXX","XXXXXXXX","XXXXXXXX",".XXXXXX.","..XXXX..","...XX...","........"],
  star:    ["...XX...","...XX...","XXXXXXXX",".XXXXXX.","..XXXX..",".XXXXXX.",".XX..XX.","XX....XX"],
  ghost:   ["..XXXX..",".XXXXXX.","XX.XX.XX","XX.XX.XX","XXXXXXXX","XXXXXXXX","XX.XX.XX","X..XX..X"],
  coffee:  ["..X..X..","...X..X.","XXXXXX..","XXXXXXXX","XXXXXX.X","XXXXXXXX",".XXXXXX.","........"],
  rocket:  ["...XX...","..XXXX..","..X..X..","..XXXX..",".XXXXXX.","XX.XX.XX","X..XX..X","...XX..."],
  pizza:   ["XXXXXXXX","X.XXX.XX",".XXXXXX.",".XX.XXX.","..XXXX..","..X.XX..","...XX...","...X...."],
  cat:     ["X......X","XX....XX","XXXXXXXX","X.XXXX.X","XXXXXXXX","XXX..XXX",".XXXXXX.","........"],
  gamepad: ["........","........",".XXXXXX.","XX.XXXXX","X.X.X.XX","XX.XXXXX","XXXXXXXX",".XX..XX."],
  crown:   ["X..XX..X","XX.XX.XX","XXXXXXXX","XXXXXXXX","XXXXXXXX",".XXXXXX.","........","........"],
  planet:  ["..XXXX..",".XXXXXX.","XXXXXXXX","XXXXXXXX","XXXXXXXX","XXXXXXXX",".XXXXXX.","..XXXX.."],
  skull:   [".XXXXXX.","XXXXXXXX","XX.XX.XX","XXXXXXXX",".XX..XX.","..XXXX..","..X..X..","........"],
  bolt:    ["...XXX..","..XXX...",".XXX....","XXXXXX..","..XXX...","..XX....",".XX.....",".X......"],
  gem:     ["..XXXX..",".XXXXXX.","XXXXXXXX",".XXXXXX.","..XXXX..","...XX...","........","........"]
};

document.querySelectorAll("[data-icon]").forEach(el => {
  const g = ART[el.dataset.icon]; if (!g) return;
  let r = "";
  g.forEach((row, y) => [...row].forEach((c, x) => { if (c === "X") r += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }));
  el.innerHTML = `<svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">${r}</svg>`;
});

/* ---------- Skyline pixelado ---------- */
document.querySelectorAll("[data-city]").forEach((el, n) => {
  let seed = 7 + n * 13; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let x = 0, out = "";
  while (x < 200) {
    const w = 6 + Math.floor(rnd() * 10), h = 5 + Math.floor(rnd() * 14);
    out += `<rect x="${x}" y="${24 - h}" width="${w}" height="${h}" fill="#4a8aa3"/>`;
    for (let wy = 24 - h + 2; wy < 22; wy += 3)
      for (let wx = x + 2; wx < x + w - 1; wx += 3)
        if (rnd() > .45) out += `<rect x="${wx}" y="${wy}" width="1" height="1" fill="#13dbe3"/>`;
    x += w + 1;
  }
  el.innerHTML = `<svg viewBox="0 0 200 24" preserveAspectRatio="none" shape-rendering="crispEdges">${out}</svg>`;
});

/* ---------- Mosaico de cores ---------- */
document.querySelectorAll("[data-mosaic]").forEach(el => {
  const pal = ["#7ab7cc", "#4a8aa3", "#a9d6e6", "#b4f23c", "#ef3b3b", "#13dbe3", "#ffd23f"];
  for (let i = 0; i < 48; i++) {
    const b = document.createElement("b");
    b.style.background = pal[(i * 7 + (i >> 2)) % pal.length];
    b.style.animationDelay = ((i % 12) * .18) + "s";
    el.appendChild(b);
  }
});

/* ---------- Céu animado ---------- */
const cv = document.getElementById("sky"), ctx = cv.getContext("2d");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
let W, H, stars = [], missiles = [], booms = [], last = 0, spawn = 0;
function resize() {
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  stars = Array.from({ length: Math.floor(W * H / 8000) }, () => ({
    x: Math.random() * W, y: Math.random() * H, s: Math.random() < .18 ? 2 : 1, p: Math.random() * 6
  }));
}
addEventListener("resize", resize); resize();
function frame(t) {
  const dt = Math.min(50, t - last) / 1000; last = t;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#cfe8ff";
  for (const s of stars) { ctx.globalAlpha = .25 + .45 * Math.abs(Math.sin(t / 1100 + s.p)); ctx.fillRect(s.x, s.y, s.s, s.s); }
  if (!still) {
    spawn -= dt;
    if (spawn <= 0) {
      spawn = .9 + Math.random() * 1.4;
      const x0 = Math.random() * W, x1 = x0 + (Math.random() - .5) * W * .4;
      missiles.push({ x0, x1, y0: -10, y1: H * (.75 + Math.random() * .2), t: 0, d: 3 + Math.random() * 3 });
    }
    for (const m of missiles) m.t += dt / m.d;
    for (const m of missiles) {
      const k = Math.min(1, m.t), x = m.x0 + (m.x1 - m.x0) * k, y = m.y0 + (m.y1 - m.y0) * k;
      const k2 = Math.max(0, k - .12), xt = m.x0 + (m.x1 - m.x0) * k2, yt = m.y0 + (m.y1 - m.y0) * k2;
      ctx.globalAlpha = .55; ctx.strokeStyle = "#ef3b3b"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(xt, yt); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.fillRect(x - 1, y - 1, 3, 3);
      if (m.t >= 1) booms.push({ x, y, r: 0 });
    }
    missiles = missiles.filter(m => m.t < 1);
    for (const b of booms) {
      b.r += dt * 70; const a = Math.max(0, 1 - b.r / 46);
      ctx.globalAlpha = a * .7; ctx.fillStyle = b.r < 22 ? "#ffd23f" : "#ef3b3b";
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
    }
    booms = booms.filter(b => b.r < 46);
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- Controlos da Apresentação ---------- */
const slides = [...document.querySelectorAll(".slide")];
const counter = document.getElementById("counter");
const bar = document.getElementById("progress");
const score = document.getElementById("score");
slides.forEach(s => s.querySelectorAll(".box, .placeholder, .img-box, pre").forEach((el, k) => el.style.setProperty("--i", k)));

let i = 0;
function show(n) {
  i = Math.max(0, Math.min(slides.length - 1, n));
  slides.forEach((s, k) => s.classList.toggle("active", k === i));
  counter.textContent = (i + 1) + " / " + slides.length;
  bar.style.width = ((i + 1) / slides.length * 100) + "%";
  score.textContent = String((i + 1) * 1500).padStart(6, "0");
  history.replaceState(null, "", "#" + (i + 1));
}

document.getElementById("prev").onclick = () => show(i - 1);
document.getElementById("next").onclick = () => show(i + 1);

document.querySelectorAll(".insert-coin").forEach(el => {
  el.onclick = () => show(i + 1);
});

document.addEventListener("keydown", e => {
  if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); show(i + 1); }
  if (["ArrowLeft", "PageUp"].includes(e.key)) show(i - 1);
  if (e.key === "Home") show(0);
  if (e.key === "End") show(slides.length - 1);
});

let tx = null;
addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
addEventListener("touchend", e => {
  if (tx === null) return;
  const dx = e.changedTouches[0].clientX - tx; tx = null;
  if (Math.abs(dx) > 60) show(i + (dx < 0 ? 1 : -1));
}, { passive: true });

show((parseInt(location.hash.slice(1)) || 1) - 1);