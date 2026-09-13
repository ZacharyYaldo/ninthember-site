(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sticky nav */
  var nav = document.querySelector('.nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Playable demo: the iframe is only created on demand */
  var phone = document.querySelector('.phone[data-src]');
  if (phone) {
    var overlay = phone.querySelector('.play-overlay');
    overlay.addEventListener('click', function () {
      if (phone.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.className = 'screen';
      f.src = phone.getAttribute('data-src');
      f.title = 'Crystal Road, playable demo';
      f.setAttribute('allow', 'autoplay');
      f.setAttribute('loading', 'lazy');
      phone.appendChild(f);
      phone.classList.add('playing');
    });
  }

  /* Ember particles */
  var canvas = document.getElementById('embers');
  if (!canvas || reduced) return;
  var ctx = canvas.getContext('2d');
  var W, H, dpr, parts = [], mouse = { x: 0.5, y: 0.5 }, running = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var target = Math.round(Math.min(160, Math.max(50, (W * H) / 9000)));
    while (parts.length < target) parts.push(spawn(true));
    parts.length = target;
  }

  function spawn(anywhere) {
    var r = Math.random();
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 10,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.25 + Math.random() * 0.9),
      s: 0.6 + r * r * 2.6,
      life: Math.random(),
      decay: 0.0012 + Math.random() * 0.0025,
      hue: 18 + Math.random() * 28,
      wob: Math.random() * Math.PI * 2,
      depth: 0.3 + Math.random() * 0.7
    };
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    var px = (mouse.x - 0.5) * 30, py = (mouse.y - 0.5) * 20;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.wob += 0.02;
      p.x += p.vx + Math.sin(p.wob) * 0.18;
      p.y += p.vy * p.depth;
      p.life -= p.decay;
      if (p.life <= 0 || p.y < -10) { parts[i] = spawn(false); continue; }
      var a = Math.min(1, p.life * 3) * 0.85 * p.depth;
      var x = p.x + px * p.depth, y = p.y + py * p.depth;
      var g = ctx.createRadialGradient(x, y, 0, x, y, p.s * 4);
      g.addColorStop(0, 'hsla(' + p.hue + ',100%,70%,' + a + ')');
      g.addColorStop(0.35, 'hsla(' + p.hue + ',100%,55%,' + a * 0.5 + ')');
      g.addColorStop(1, 'hsla(' + p.hue + ',100%,50%,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, p.s * 4, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', function (e) {
    mouse.x = e.clientX / window.innerWidth; mouse.y = e.clientY / window.innerHeight;
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });
  resize();
  requestAnimationFrame(frame);
})();
