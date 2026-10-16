// Eclipse Client website: everything that moves.
(() => {
  const REPO = 'tatnatYT/tatnat-launcher';
  const $ = id => document.getElementById(id);
  const body = document.body;
  const rand = (a, b) => a + Math.random() * (b - a);

  // ---------- intro (once per visit, click to skip), then the hero animates in ----------
  let seen = false;
  try { seen = sessionStorage.getItem('eclipse-intro') === '1'; sessionStorage.setItem('eclipse-intro', '1'); } catch { /* storage off */ }
  if (seen) body.classList.add('intro-skip');
  const start = () => body.classList.add('ready');
  $('intro').addEventListener('click', () => { body.classList.add('intro-skip'); start(); });
  setTimeout(start, seen ? 50 : 2050);

  // ---------- hero backgrounds ----------
  const BG = ['assets/bg/1.webp', 'assets/bg/2.webp', 'assets/bg/3.webp'];
  const stage = $('heroBg'), dots = $('bgDots');
  let index = 0, layer = null, busy = false, auto;
  BG.forEach(src => { const i = new Image(); i.src = src; });
  const makeLayer = i => { const el = document.createElement('div'); el.className = 'hero-layer'; el.style.backgroundImage = `url("${BG[i]}")`; return el; };
  const mark = () => [...dots.children].forEach((d, i) => d.classList.toggle('on', i === index));
  function show(i) {
    i = (i + BG.length) % BG.length;
    if (i === index || busy) return;
    busy = true; index = i; mark();
    const old = layer;
    layer = makeLayer(i); layer.classList.add('enter'); stage.append(layer);
    old?.classList.add('leave');
    warp = 1; // the stars rush past while the picture changes
    setTimeout(() => { old?.remove(); layer.classList.remove('enter'); busy = false; }, 1020);
  }
  const restartAuto = () => { clearInterval(auto); auto = setInterval(() => show(index + 1), 9000); };
  BG.forEach((_, i) => { const d = document.createElement('button'); d.setAttribute('aria-label', `Background ${i + 1}`); d.addEventListener('click', () => { show(i); restartAuto(); }); dots.append(d); });
  layer = makeLayer(0); stage.append(layer); mark();
  $('bgPrev').addEventListener('click', () => { show(index - 1); restartAuto(); });
  $('bgNext').addEventListener('click', () => { show(index + 1); restartAuto(); });
  restartAuto();

  // ---------- starfield: depth, mouse parallax, shooting stars, warp on background swap ----------
  const canvas = $('starfield'), ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, stars = [], shooters = [], warp = 0, pmx = 0, pmy = 0;
  function resizeStars() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const n = Math.round(W * H / 5200);
    stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, z: rand(.2, 1), t: rand(0, Math.PI * 2), s: rand(.6, 1.8) }));
  }
  function frame(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    warp *= 0.94;
    for (const s of stars) {
      // Nearer stars (bigger z) move more with the mouse and drift faster.
      s.x -= (0.04 + warp * 14) * s.z;
      if (s.x < -10) { s.x = W + 10; s.y = Math.random() * H; }
      const x = s.x - pmx * 26 * s.z, y = s.y - pmy * 18 * s.z;
      const tw = 0.45 + 0.55 * Math.sin(t / 700 * s.s + s.t);
      ctx.globalAlpha = Math.max(0, tw) * (0.35 + s.z * 0.65);
      ctx.fillStyle = s.z > .8 ? '#f3eeff' : '#c9b8ff';
      const size = s.z * 2.2;
      if (warp > .05) {
        ctx.fillRect(x, y, size + warp * 40 * s.z, Math.max(1, size * .6));
      } else {
        ctx.fillRect(x, y, size, size);
        if (s.z > .85 && tw > .85) { ctx.globalAlpha *= .35; ctx.fillRect(x - size * 1.5, y + size / 2 - .5, size * 4, 1); ctx.fillRect(x + size / 2 - .5, y - size * 1.5, 1, size * 4); }
      }
    }
    if (Math.random() < 0.012) shooters.push({ x: rand(W * .4, W * 1.05), y: rand(0, H * .35), v: rand(9, 15), life: 0 });
    ctx.globalAlpha = 1;
    shooters = shooters.filter(sh => sh.life < 1);
    for (const sh of shooters) {
      sh.life += 0.016; sh.x -= sh.v; sh.y += sh.v * .5;
      const a = Math.sin(Math.PI * sh.life);
      const g = ctx.createLinearGradient(sh.x, sh.y, sh.x + 160, sh.y - 80);
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(180,156,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(sh.x + 160, sh.y - 80); ctx.stroke();
    }
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', resizeStars);
  resizeStars(); requestAnimationFrame(frame);

  // ---------- newest download ----------
  fetch(`https://api.github.com/repos/${REPO}/releases/latest`).then(r => (r.ok ? r.json() : null)).then(rel => {
    if (!rel) return;
    const setup = (rel.assets || []).find(a => /Setup-[\d.]+\.exe$/i.test(a.name));
    if (setup) document.querySelectorAll('.download-link').forEach(a => { a.href = setup.browser_download_url; });
    $('heroVersion').textContent = `Version ${String(rel.tag_name || '').replace(/^v/, '')} Beta`;
  }).catch(() => { /* the links still go to the releases page */ });

  // ---------- text effects: ECLIPSE letters, headings word by word, scrambled eyebrows ----------
  document.querySelectorAll('.letters').forEach(el => {
    const text = el.textContent; el.textContent = '';
    [...text].forEach((ch, i) => { const c = document.createElement('span'); c.className = 'ch'; c.textContent = ch; c.style.setProperty('--i', i); el.append(c); });
  });
  document.querySelectorAll('.section h2, .cta h2, .timeline h2').forEach(h => {
    const words = h.textContent.trim().split(/\s+/); h.textContent = '';
    words.forEach((w, i) => {
      const o = document.createElement('span'); o.className = 'w';
      const s = document.createElement('span'); s.textContent = w; s.style.setProperty('--i', i);
      o.append(s); h.append(o, document.createTextNode(' '));
    });
  });
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>';
  function scramble(el) {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    let f = 0;
    const id = setInterval(() => {
      el.textContent = [...final].map((ch, i) => (ch === ' ' || i < f / 2 ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join('');
      if (++f > final.length * 2) { clearInterval(id); el.textContent = final; }
    }, 35);
  }

  // ---------- marquee of mod names ----------
  const MODS = ['Keystrokes', 'FPS Counter', 'CPS Counter', 'Zoom', 'Freecam', 'Tier Tagger', 'Totem Pops', 'Totem Counter', 'Armor Status', 'Potion Status',
    'Coordinates', 'Waypoints', 'Item Physic', 'Hitboxes', 'Hit Color', 'Full Bright', 'Time Changer', 'Custom Crosshair', 'Motion Blur', 'Nick Hider',
    'Chunk Animator', 'Death Info', 'Pack Display', 'Reconnect', 'Toggle Sprint', 'Clear Water', 'Block Overlay', 'Enchant Glint', 'Capes', 'Speed Meter'];
  const fill = (el, list) => { const html = list.map(m => `<span>${m}</span>`).join(''); el.innerHTML = html + html; };
  fill($('marqueeA'), MODS.slice(0, 15));
  fill($('marqueeB'), MODS.slice(15));

  // ---------- floating pixel cubes ----------
  for (let n = 0; n < 18; n++) {
    const c = document.createElement('i'); c.className = 'cube';
    c.style.setProperty('--s', `${Math.round(rand(8, 24))}px`); c.style.setProperty('--x', `${rand(0, 100)}%`);
    c.style.setProperty('--t', `${rand(18, 40)}s`); c.style.setProperty('--delay', `${-rand(0, 40)}s`);
    c.style.setProperty('--r', `${(Math.random() < .5 ? -1 : 1) * rand(180, 540)}deg`);
    $('cubes').append(c);
  }
  // Twinkling stars in the final banner.
  for (let n = 0; n < 30; n++) {
    const s = document.createElement('i'); s.className = 'star';
    s.style.left = `${rand(0, 100)}%`; s.style.top = `${rand(0, 100)}%`;
    s.style.setProperty('--d', `${rand(3, 7)}s`); s.style.setProperty('--delay', `${-rand(0, 7)}s`);
    $('ctaStars').append(s);
  }

  // ---------- bento demos ----------
  // FPS: the number races between "without" and "with Eclipse", with a live graph.
  const fpsNum = $('fpsNum'), graph = $('fpsGraph'), gctx = graph.getContext('2d');
  const hist = Array(90).fill(274);
  let fpsTarget = 909, fpsVal = 274, fpsFlip = 0;
  function drawGraph() {
    const w = graph.clientWidth, h = graph.clientHeight, r = Math.min(2, devicePixelRatio || 1);
    if (graph.width !== w * r) { graph.width = w * r; graph.height = h * r; }
    gctx.setTransform(r, 0, 0, r, 0, 0); gctx.clearRect(0, 0, w, h);
    const y = v => h - 8 - (v / 1000) * (h - 16);
    gctx.strokeStyle = 'rgba(255,255,255,.06)'; gctx.lineWidth = 1;
    for (const v of [250, 500, 750]) { gctx.beginPath(); gctx.moveTo(0, y(v)); gctx.lineTo(w, y(v)); gctx.stroke(); }
    const grad = gctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#5b3fae'); grad.addColorStop(.6, '#b49cff'); grad.addColorStop(1, '#e07aff');
    gctx.beginPath();
    hist.forEach((v, i) => { const x = i / (hist.length - 1) * w; i ? gctx.lineTo(x, y(v)) : gctx.moveTo(x, y(v)); });
    gctx.strokeStyle = grad; gctx.lineWidth = 3; gctx.shadowColor = 'rgba(180,156,255,.8)'; gctx.shadowBlur = 12; gctx.stroke(); gctx.shadowBlur = 0;
    gctx.lineTo(w, h); gctx.lineTo(0, h); gctx.closePath();
    const fillG = gctx.createLinearGradient(0, 0, 0, h); fillG.addColorStop(0, 'rgba(138,99,232,.35)'); fillG.addColorStop(1, 'rgba(138,99,232,0)');
    gctx.fillStyle = fillG; gctx.fill();
  }
  setInterval(() => {
    if (++fpsFlip % 70 === 0) fpsTarget = fpsTarget === 909 ? 274 : 909;
    fpsVal += (fpsTarget - fpsVal) * 0.08 + rand(-12, 12);
    hist.push(Math.max(0, fpsVal)); hist.shift();
    fpsNum.textContent = Math.round(fpsVal);
    drawGraph();
  }, 60);

  // Keystrokes: someone strafing and clicking.
  const keyEls = {};
  document.querySelectorAll('.key').forEach(k => { keyEls[k.dataset.k] = k; });
  const PATTERN = ['w', 'w', 'a', 'wl', 'wl', 'd', 'wl', 'l', 'wd', 's', 'l', 'wa', 'r', 'w', 'wl', 'wl', 'd', 'a'];
  let pi = 0, clicks = [];
  setInterval(() => {
    const p = PATTERN[pi++ % PATTERN.length];
    Object.values(keyEls).forEach(k => k.classList.remove('down'));
    for (const ch of p) keyEls[ch]?.classList.add('down');
    if (p.includes('l')) clicks.push(Date.now());
    clicks = clicks.filter(c => Date.now() - c < 1000);
    $('cpsL').textContent = `${clicks.length * 3} CPS`;
  }, 170);

  // Versions ticker.
  const VERSIONS = ['1.8.9', '1.12.2', '1.16.5', '1.18.2', '1.20.1', '1.21.1', '1.21.11', '26.1', '26.2', '26.3'];
  const ticker = $('ticker');
  ticker.innerHTML = [...VERSIONS, ...VERSIONS].map(v => `<span>${v}</span>`).join('');
  let ti = 0;
  setInterval(() => {
    ti++;
    if (ti >= VERSIONS.length) { ticker.style.transition = 'none'; ti = 0; ticker.style.transform = 'translateY(23px)'; void ticker.offsetHeight; ticker.style.transition = ''; ti = 1; }
    ticker.style.transform = `translateY(${23 - ti * 46}px)`;
    [...ticker.children].forEach((s, i) => s.classList.toggle('on', i === ti));
  }, 1300);
  ticker.style.transform = 'translateY(23px)'; ticker.children[0].classList.add('on');

  // Minecraft head: add the hat layer around the head.
  (() => {
    const head = $('mcHead');
    const hat = document.createElement('div'); hat.className = 'mc-hat';
    hat.innerHTML = '<i class="f front"></i><i class="f back"></i><i class="f left"></i><i class="f right"></i><i class="f top"></i><i class="f bottom"></i>';
    head.append(hat);
  })();

  // Mod updates: each row downloads and turns green, then it starts over.
  const rows = [...document.querySelectorAll('.modrow')];
  const NEW = ['0.8.14', '1.10.8', 'r5.9.3'], OLD = rows.map(r => r.querySelector('.ver').textContent);
  let ri = 0;
  setInterval(() => {
    if (ri === rows.length) { rows.forEach((r, i) => { r.classList.remove('updating', 'done'); r.querySelector('.ver').textContent = OLD[i]; }); ri = 0; return; }
    const r = rows[ri], i = ri++;
    r.classList.add('updating');
    setTimeout(() => { r.classList.remove('updating'); r.classList.add('done'); r.querySelector('.ver').textContent = NEW[i]; }, 1100);
  }, 1500);

  // Accounts: the two swap places.
  const accs = [...document.querySelectorAll('.acc')];
  setInterval(() => {
    const [a, b] = accs;
    const h = a.offsetHeight + 8;
    const top = a.style.order === '1' ? b : a, bottom = top === a ? b : a;
    top.style.transform = `translateY(${h}px)`; bottom.style.transform = `translateY(${-h}px)`;
    setTimeout(() => {
      accs.forEach(x => { x.style.transition = 'none'; x.style.transform = ''; });
      top.style.order = '1'; bottom.style.order = '0';
      accs.forEach(x => { x.classList.toggle('on'); x.querySelector('em').textContent = x.classList.contains('on') ? 'IN USE' : 'SWITCH'; });
      void a.offsetHeight; accs.forEach(x => { x.style.transition = ''; });
    }, 650);
  }, 3200);

  // ---------- reveal on scroll ----------
  function countTo(el) {
    const to = Number(el.dataset.to), t0 = performance.now();
    const suffix = el.dataset.suffix || '';
    (function step(t) { const p = Math.min(1, (t - t0) / 1800), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e) + suffix; if (p < 1) requestAnimationFrame(step); })(t0);
  }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.classList.contains('scramble')) scramble(e.target);
    if (e.target.id === 'compare' || e.target.classList.contains('stat')) e.target.querySelectorAll('[data-to]').forEach(countTo);
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal, .section h2, .cta h2, .timeline h2, .eyebrow, #steps').forEach(el => io.observe(el));

  // ---------- sticky showcase: the screenshot follows the step in the middle of the screen ----------
  const steps = [...document.querySelectorAll('.story-step')], shots = [...document.querySelectorAll('.shot')];
  const TITLES = ['Eclipse Launcher', 'Minecraft · Eclipse main menu', 'Minecraft · Eclipse mod menu', 'Eclipse Launcher · Skins', 'Eclipse Launcher · Mods'];
  const storyIo = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const n = Number(e.target.dataset.shot);
    steps.forEach(s => s.classList.toggle('on', s === e.target));
    shots.forEach((s, i) => s.classList.toggle('on', i === n));
    $('windowTitle').textContent = TITLES[n];
  }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => storyIo.observe(s));

  // ---------- nav: solid when scrolled, sliding pill under the current section, progress bar ----------
  const nav = $('nav'), progress = $('progress'), pill = $('linksPill');
  const links = [...document.querySelectorAll('.links a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href')));
  function movePill(a) {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1; pill.style.left = `${a.offsetLeft}px`; pill.style.width = `${a.offsetWidth}px`;
    links.forEach(l => l.classList.toggle('on', l === a));
  }
  // Hero: scrolling eclipses the logo (--ec) and pushes the content away (--sp).
  const heroEl = $('hero'), heroContent = heroEl.querySelector('.hero-content'), logoWrap = heroEl.querySelector('.logo-wrap');
  // Timeline: pinned while the cards slide sideways.
  const tl = $('timeline'), track = $('tlTrack'), tlFill = $('tlFill'), tlCards = [...track.children];
  function onScroll() {
    nav.classList.toggle('solid', window.scrollY > 40);
    const sp = Math.min(1, Math.max(0, window.scrollY / (heroEl.offsetHeight * .6)));
    heroEl.style.setProperty('--sp', sp.toFixed(3));
    // Totality is reached while the logo is still well on screen, whatever the window height.
    const logoMid = logoWrap.offsetTop + heroContent.offsetTop + logoWrap.offsetHeight / 2;
    const ecDist = Math.min(320, Math.max(140, logoMid - 110));
    heroEl.style.setProperty('--ec', Math.min(1, window.scrollY / ecDist).toFixed(3));
    const tr = tl.getBoundingClientRect();
    if (tr.bottom > 0 && tr.top < innerHeight) {
      const tp = Math.min(1, Math.max(0, -tr.top / (tr.height - innerHeight)));
      track.style.transform = `translate3d(${-tp * Math.max(0, track.scrollWidth - innerWidth)}px, 0, 0)`;
      tlFill.parentElement.style.setProperty('--tp', tp.toFixed(4));
      // The card nearest the middle of the screen lights up.
      let best = null, bestD = Infinity;
      tlCards.forEach(c => { const r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - innerWidth / 2); if (d < bestD) { bestD = d; best = c; } });
      tlCards.forEach(c => c.classList.toggle('on', c === best));
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    let current = null;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < window.innerHeight * .4) current = links[i]; });
    movePill(current);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ---------- mouse: glow + ring cursor, hero parallax, magnetic buttons, tilting tiles ----------
  const glow = $('cursorGlow'), ring = $('cursorRing'), hero = $('hero');
  let mx = -500, my = -500, gx = -500, gy = -500, rx = -500, ry = -500;
  let lastMove = -1e9;
  window.addEventListener('mousemove', e => {
    if (mx > -500) sprinkle(e.clientX, e.clientY, Math.hypot(e.clientX - mx, e.clientY - my));
    mx = e.clientX; my = e.clientY; lastMove = performance.now(); body.classList.add('mouse');
    const px = e.clientX / innerWidth - .5, py = e.clientY / innerHeight - .5;
    hero.style.setProperty('--mx', px.toFixed(3)); hero.style.setProperty('--my', py.toFixed(3));
    pmx = px; pmy = py;
  }, { passive: true });
  document.addEventListener('mouseleave', () => body.classList.remove('mouse'));
  (function follow() {
    gx += (mx - gx) * .12; gy += (my - gy) * .12; rx += (mx - rx) * .35; ry += (my - ry) * .35;
    glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(follow);
  })();
  document.querySelectorAll('a, button, summary, .tile').forEach(el => {
    el.addEventListener('mouseenter', () => body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => body.classList.remove('hovering'));
  });
  document.querySelectorAll('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--bx', `${(e.clientX - r.left - r.width / 2) * .25}px`);
      b.style.setProperty('--by', `${(e.clientY - r.top - r.height / 2) * .35}px`);
    });
    b.addEventListener('mouseleave', () => { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
  });
  document.querySelectorAll('.tile').forEach(t => {
    t.addEventListener('mousemove', e => {
      const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      t.classList.add('tilting');
      t.style.setProperty('--px', `${x * 100}%`); t.style.setProperty('--py', `${y * 100}%`);
      t.style.setProperty('--ry', `${(x - .5) * 10}deg`); t.style.setProperty('--rx', `${(.5 - y) * 8}deg`);
    });
    t.addEventListener('mouseleave', () => { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
  });
  document.querySelectorAll('.btn').forEach(b => b.addEventListener('click', e => {
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
    s.className = 'ripple'; s.style.width = s.style.height = `${d}px`;
    s.style.left = `${e.clientX - r.left - d / 2}px`; s.style.top = `${e.clientY - r.top - d / 2}px`;
    b.append(s); setTimeout(() => s.remove(), 650);
  }));

  // ---------- stardust: a trail behind the cursor and a burst on every click ----------
  const dust = $('dust'), dctx = dust.getContext('2d'), COLORS = ['#ffffff', '#d9ccff', '#b49cff', '#e07aff', '#7ad8ff'];
  let motes = [], dustOn = false;
  function sizeDust() { const r = Math.min(2, devicePixelRatio || 1); dust.width = innerWidth * r; dust.height = innerHeight * r; dctx.setTransform(r, 0, 0, r, 0, 0); }
  function mote(x, y, vx, vy, life) { motes.push({ x, y, vx, vy, life, max: life, s: rand(1, 2.6), c: COLORS[Math.floor(Math.random() * COLORS.length)] }); }
  function sprinkle(x, y, speed) {
    for (let n = Math.min(3, Math.floor(speed / 14)); n >= 0; n--) if (Math.random() < .7) mote(x + rand(-4, 4), y + rand(-4, 4), rand(-.5, .5), rand(-.2, .8), rand(28, 50));
    wakeDust();
  }
  function burst(x, y) {
    for (let n = 0; n < 34; n++) { const a = rand(0, Math.PI * 2), v = rand(1.5, 6.5); mote(x, y, Math.cos(a) * v, Math.sin(a) * v, rand(35, 70)); }
    wakeDust();
  }
  function wakeDust() { if (!dustOn) { dustOn = true; requestAnimationFrame(drawDust); } }
  function drawDust() {
    dctx.clearRect(0, 0, innerWidth, innerHeight);
    motes = motes.filter(m => --m.life > 0);
    for (const m of motes) {
      m.x += m.vx; m.y += m.vy; m.vx *= .95; m.vy = m.vy * .95 + .04;
      const a = m.life / m.max, s = m.s * (.5 + a);
      dctx.globalAlpha = a; dctx.fillStyle = m.c;
      dctx.fillRect(m.x - s / 2, m.y - s / 2, s, s);
      if (m.s > 2.2) { dctx.globalAlpha = a * .4; dctx.fillRect(m.x - s * 2, m.y - .5, s * 4, 1); dctx.fillRect(m.x - .5, m.y - s * 2, 1, s * 4); }
    }
    dctx.globalAlpha = 1;
    if (motes.length) requestAnimationFrame(drawDust); else { dustOn = false; dctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  sizeDust(); window.addEventListener('resize', sizeDust);
  window.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') burst(e.clientX, e.clientY); });

  // ---------- the skin head looks at the cursor, and spins on its own when the mouse rests ----------
  const mcHead = $('mcHead'), headStage = mcHead.parentElement;
  let yaw = 0, pitch = -14;
  (function look() {
    const r = headStage.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) {
      if (performance.now() - lastMove < 2500) {
        const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
        yaw = ((yaw + 180) % 360 + 360) % 360 - 180;
        yaw += (Math.max(-70, Math.min(70, dx / 5)) - yaw) * .1;
        pitch += (Math.max(-40, Math.min(40, -dy / 6)) - pitch) * .1;
      } else {
        yaw += .7; pitch += (-18 - pitch) * .04;
      }
      mcHead.style.transform = `rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`;
    }
    requestAnimationFrame(look);
  })();

  // ---------- footer wordmark: spotlight under the mouse ----------
  const giant = document.querySelector('.giant');
  window.addEventListener('mousemove', e => {
    const r = giant.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) return;
    giant.style.setProperty('--gx', `${e.clientX - r.left}px`); giant.style.setProperty('--gy', `${e.clientY - r.top}px`);
  }, { passive: true });

  // ---------- easter egg: type "eclipse" ----------
  let typed = '';
  window.addEventListener('keydown', e => {
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-7);
    if (typed !== 'eclipse') return;
    typed = '';
    const t = $('totality');
    t.classList.remove('on'); void t.offsetWidth; t.classList.add('on');
    warp = 1; burst(innerWidth / 2, innerHeight / 2);
    setTimeout(() => t.classList.remove('on'), 4300);
  });
})();
