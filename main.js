// Eclipse Client website: hero backgrounds (drift, twinkling and shooting stars, animated swap),
// the newest download from GitHub, the screenshot tabs, the nav and reveal-on-scroll.
(() => {
  const REPO = 'tatnatYT/tatnat-launcher';
  const $ = id => document.getElementById(id);

  // ---------- hero backgrounds ----------
  const BG = ['assets/bg/1.webp', 'assets/bg/2.webp', 'assets/bg/3.webp'];
  const stage = $('heroBg'), dots = $('bgDots');
  let index = 0, layer = null, busy = false;
  BG.forEach(src => { const i = new Image(); i.src = src; }); // preload so swaps are instant

  function makeLayer(i) {
    const el = document.createElement('div');
    el.className = 'hero-layer';
    el.style.backgroundImage = `url("${BG[i]}")`;
    return el;
  }
  function mark() { [...dots.children].forEach((d, i) => d.classList.toggle('on', i === index)); }
  function show(i) {
    i = (i + BG.length) % BG.length;
    if (i === index || busy) return;
    busy = true;
    index = i;
    mark();
    const old = layer;
    layer = makeLayer(i);
    layer.classList.add('enter');
    stage.append(layer);
    old?.classList.add('leave');
    setTimeout(() => { old?.remove(); layer.classList.remove('enter'); busy = false; }, 920);
  }
  BG.forEach((_, i) => {
    const d = document.createElement('button');
    d.setAttribute('aria-label', `Background ${i + 1}`);
    d.addEventListener('click', () => { show(i); restartAuto(); });
    dots.append(d);
  });
  layer = makeLayer(0);
  stage.append(layer);
  mark();
  $('bgPrev').addEventListener('click', () => { show(index - 1); restartAuto(); });
  $('bgNext').addEventListener('click', () => { show(index + 1); restartAuto(); });
  // Changes by itself every 9 seconds (until the visitor picks one).
  let auto;
  function restartAuto() { clearInterval(auto); auto = setInterval(() => show(index + 1), 9000); }
  restartAuto();

  const stars = $('heroStars');
  for (let n = 0; n < 46; n++) {
    const s = document.createElement('i');
    s.className = 'star';
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 65}%`;
    s.style.setProperty('--d', `${3 + Math.random() * 4}s`);
    s.style.setProperty('--delay', `${-Math.random() * 7}s`);
    stars.append(s);
  }
  (function shoot() {
    if (!document.hidden) {
      const s = document.createElement('i');
      s.className = 'shoot';
      s.style.left = `${40 + Math.random() * 55}%`;
      s.style.top = `${Math.random() * 35}%`;
      stars.append(s);
      setTimeout(() => s.remove(), 1300);
    }
    setTimeout(shoot, 2500 + Math.random() * 4500);
  })();

  // ---------- newest download ----------
  fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
    .then(r => (r.ok ? r.json() : null))
    .then(rel => {
      if (!rel) return;
      const setup = (rel.assets || []).find(a => /Setup-[\d.]+\.exe$/i.test(a.name));
      if (setup) document.querySelectorAll('.download-link').forEach(a => { a.href = setup.browser_download_url; });
      $('heroVersion').textContent = `Version ${String(rel.tag_name || '').replace(/^v/, '')} Beta`;
    })
    .catch(() => { /* offline or rate-limited: the links still go to the releases page */ });

  // ---------- screenshot tabs ----------
  const SHOTS = [
    ['assets/shots/launcher-play.png', 'The launcher: your background, the version and loader picker, and Flappy Bird with your own head while you wait.'],
    ['assets/shots/game-main-menu.png', 'The Eclipse main menu in game, with the same night skies and your own buttons.'],
    ['assets/shots/game-mod-menu.png', 'Right Shift opens the mod menu: 80 mods to switch on, set up and move around with the HUD editor.'],
    ['assets/shots/launcher-skins.png', 'Skins and capes with a live 3D preview and your name tag, just like in game.'],
    ['assets/shots/launcher-mods.png', 'Everything you installed in one place, with update arrows and a version switcher for each mod, pack and shader.'],
  ];
  const shot = $('shot'), caption = $('shotCaption');
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === t));
    const [src, text] = SHOTS[Number(t.dataset.shot)];
    shot.classList.add('fading');
    setTimeout(() => {
      shot.onload = () => {
        shot.classList.remove('fading');
        shot.classList.add('coming');
        void shot.offsetWidth; // restart from the right-hand side
        shot.classList.remove('coming');
      };
      shot.src = src;
      caption.textContent = text;
    }, 220);
  }));
  SHOTS.forEach(([src]) => { const i = new Image(); i.src = src; });

  // ---------- animations ----------
  const body = document.body;

  // Intro (the eclipse) once per visit (click to skip), then the hero animates in.
  let seen = false;
  try { seen = sessionStorage.getItem('eclipse-intro') === '1'; sessionStorage.setItem('eclipse-intro', '1'); } catch { /* storage off */ }
  if (seen) body.classList.add('intro-skip');
  $('intro').addEventListener('click', () => { body.classList.add('intro-skip'); body.classList.add('ready'); });
  setTimeout(() => body.classList.add('ready'), seen ? 50 : 1750);

  // ECLIPSE letter by letter.
  document.querySelectorAll('.letters').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const c = document.createElement('span');
      c.className = 'ch';
      c.textContent = ch;
      c.style.setProperty('--i', i);
      el.append(c);
    });
  });

  // Headings word by word.
  document.querySelectorAll('.section h2, .cta h2').forEach(h => {
    const words = h.textContent.trim().split(/\s+/);
    h.textContent = '';
    words.forEach((w, i) => {
      const outer = document.createElement('span');
      outer.className = 'w';
      const inner = document.createElement('span');
      inner.textContent = w;
      inner.style.setProperty('--i', i);
      outer.append(inner);
      h.append(outer, document.createTextNode(' '));
    });
  });

  // Floating pixel cubes.
  const cubes = $('cubes');
  for (let n = 0; n < 16; n++) {
    const c = document.createElement('i');
    c.className = 'cube';
    c.style.setProperty('--s', `${8 + Math.round(Math.random() * 16)}px`);
    c.style.setProperty('--x', `${Math.random() * 100}%`);
    c.style.setProperty('--t', `${18 + Math.random() * 22}s`);
    c.style.setProperty('--delay', `${-Math.random() * 40}s`);
    c.style.setProperty('--r', `${(Math.random() < .5 ? -1 : 1) * (180 + Math.random() * 360)}deg`);
    cubes.append(c);
  }

  // Stat numbers count up when they come into view.
  function countUp(el) {
    const to = Number(el.dataset.count), pre = el.dataset.prefix || '', post = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1400;
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(to * e) + post;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  // Reveal on scroll: cards, steps, headings, eyebrows, counters.
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.classList.contains('stats')) e.target.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal, .section h2, .cta h2, .eyebrow, #steps').forEach(el => io.observe(el));

  // Nav background, scroll progress and the showcase frame flattening as it scrolls into view.
  const nav = $('nav'), progress = $('progress'), frame = $('frame');
  function onScroll() {
    nav.classList.toggle('solid', window.scrollY > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    const r = frame.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (window.innerHeight * 0.75)));
    frame.style.setProperty('--fx', `${(1 - p) * 22}deg`);
    frame.style.setProperty('--fs', `${0.9 + p * 0.1}`);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Mouse: a soft glow follows the cursor, the hero shifts with it (parallax).
  const glow = $('cursorGlow'), hero = document.querySelector('.hero');
  let mx = 0, my = 0, gx = 0, gy = 0, moving = false;
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    body.classList.add('mouse');
    hero.style.setProperty('--mx', (e.clientX / window.innerWidth - 0.5).toFixed(3));
    hero.style.setProperty('--my', (e.clientY / window.innerHeight - 0.5).toFixed(3));
    if (!moving) { moving = true; requestAnimationFrame(follow); }
  }, { passive: true });
  function follow() {
    gx += (mx - gx) * 0.18; gy += (my - gy) * 0.18;
    glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    if (Math.abs(mx - gx) + Math.abs(my - gy) > 0.5) requestAnimationFrame(follow); else moving = false;
  }
  document.addEventListener('mouseleave', () => body.classList.remove('mouse'));

  // Feature cards tilt towards the mouse with a spotlight under it.
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.classList.add('tilting');
      card.style.setProperty('--px', `${x * 100}%`);
      card.style.setProperty('--py', `${y * 100}%`);
      card.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
      card.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // Buttons ripple where they're clicked.
  document.querySelectorAll('.btn').forEach(b => b.addEventListener('click', e => {
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.width = s.style.height = `${d}px`;
    s.style.left = `${e.clientX - r.left - d / 2}px`;
    s.style.top = `${e.clientY - r.top - d / 2}px`;
    b.append(s);
    setTimeout(() => s.remove(), 650);
  }));
})();
