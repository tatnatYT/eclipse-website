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
    setTimeout(shoot, 5000 + Math.random() * 8000);
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
      shot.src = src;
      caption.textContent = text;
      shot.onload = () => shot.classList.remove('fading');
    }, 200);
  }));
  SHOTS.forEach(([src]) => { const i = new Image(); i.src = src; });

  // ---------- nav + reveal ----------
  const nav = $('nav');
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
