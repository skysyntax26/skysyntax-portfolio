// ============================================================
//  SKYSYNTAX PORTFOLIO — script.js
//  Vanilla JS: particles, tilt, scroll reveal, typed text,
//  counters, mobile menu, cursor, flip cards
// ============================================================

'use strict';

/* ── Custom Cursor ─────────────────────────────────────── */
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

if (cursorDot && cursorRing) {
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  // Smooth ring follow
  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Hover detection
  document.querySelectorAll('a, button, .member-card, .project-card, .stat-card, .contact-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
  });
}

/* ── Navbar scroll effect ──────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
  updateActiveNav();
}, { passive: true });

/* ── Active nav link ───────────────────────────────────── */
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

/* ── Mobile Menu ───────────────────────────────────────── */
const hamburger  = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

hamburger && hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileMenu && mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Smooth Scroll ─────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Hero Canvas — 3D Particle System ─────────────────── */
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: null, y: null };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); createParticles(); }, { passive: true });
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  const COLORS = ['rgba(56,189,248,', 'rgba(196,181,253,', 'rgba(14,165,233,', 'rgba(167,139,250,'];
  const COUNT  = window.innerWidth < 600 ? 60 : 120;
  const CONN_DIST = 140;

  function Particle() {
    this.x     = Math.random() * W;
    this.y     = Math.random() * H;
    this.z     = Math.random() * 3 + 0.5;   // depth 0.5-3.5
    this.vx    = (Math.random() - 0.5) * 0.4 / this.z;
    this.vy    = (Math.random() - 0.5) * 0.4 / this.z;
    this.r     = (Math.random() * 2 + 1) * this.z * 0.4;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = (0.3 + Math.random() * 0.5) / this.z;
  }
  Particle.prototype.update = function() {
    // Parallax mouse push
    if (mouse.x !== null) {
      const dx = mouse.x - this.x, dy = mouse.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 150) {
        const force = (150 - dist) / 150 * 0.6 / this.z;
        this.vx -= (dx / dist) * force * 0.03;
        this.vy -= (dy / dist) * force * 0.03;
      }
    }
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.99;
    this.vy *= 0.99;
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  };
  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.fill();
    // Glow halo for close particles
    if (this.z > 2) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = this.color + (this.alpha * 0.15) + ')';
      ctx.fill();
    }
  };

  function createParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
  }
  createParticles();

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < CONN_DIST) {
          const opacity = (1 - dist / CONN_DIST) * 0.25;
          const depthFade = Math.min(a.z, b.z) / 3.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(56,189,248,${opacity * depthFade})`;
          ctx.lineWidth = depthFade * 0.8;
          ctx.stroke();
        }
      }
    }
  }

  let animFrame;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(animate);
  }
  animate();

  // Pause when hero out of view
  const heroObs = new IntersectionObserver(entries => {
    entries[0].isIntersecting ? animate() : cancelAnimationFrame(animFrame);
  }, { threshold: 0 });
  const heroSection = document.getElementById('hero');
  if (heroSection) heroObs.observe(heroSection);
})();

/* ── Typed Text Effect ─────────────────────────────────── */
(function typed() {
  const el = document.querySelector('.hero-slogan');
  if (!el) return;
  const texts = [
    'Ideas Take Flight in Code.',
    'Engineering Tomorrow, Today.',
    'Sky is Not the Limit — It\'s the Launch Pad.',
    'Where Syntax Meets the Stars.'
  ];
  let tIdx = 0, cIdx = 0, deleting = false;

  function tick() {
    const full = texts[tIdx];
    if (!deleting) {
      el.textContent = full.slice(0, ++cIdx);
      if (cIdx === full.length) { deleting = true; return setTimeout(tick, 2600); }
      setTimeout(tick, 65);
    } else {
      el.textContent = full.slice(0, --cIdx);
      if (cIdx === 0) { deleting = false; tIdx = (tIdx + 1) % texts.length; setTimeout(tick, 400); }
      else setTimeout(tick, 35);
    }
  }
  setTimeout(tick, 1000);
})();

/* ── Scroll Reveal (Intersection Observer) ─────────────── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
revealEls.forEach(el => revealObs.observe(el));

/* ── Counter Animation ─────────────────────────────────── */
function animateCounter(el, target, duration = 1800) {
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(ease * target);
    el.textContent = prefix + val + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statsObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-number[data-target]');
      nums.forEach(el => animateCounter(el, parseInt(el.dataset.target), 1800));
      statsObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
const statsSection = document.querySelector('.about-stats');
if (statsSection) statsObs.observe(statsSection);

/* ── 3D Tilt Effect for Cards ──────────────────────────── */
function applyTilt(cardSelector, options = {}) {
  const { maxTilt = 12, scale = 1.04, perspective = 900, shine = true } = options;

  document.querySelectorAll(cardSelector).forEach(card => {
    const shineEl = shine ? card.querySelector('.shine') : null;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const rx = (e.clientY - cy) / (rect.height / 2) * -maxTilt;
      const ry = (e.clientX - cx) / (rect.width  / 2) *  maxTilt;
      card.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;

      if (shineEl) {
        const mx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
        const my = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
        shineEl.style.setProperty('--mx', mx);
        shineEl.style.setProperty('--my', my);
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(${perspective}px) rotateX(0) rotateY(0) scale(1)`;
      card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      setTimeout(() => card.style.transition = '', 500);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
}

// Apply tilt to project cards and stat cards (NOT member cards — they flip)
applyTilt('.project-card',  { maxTilt: 10, scale: 1.03, shine: true });
applyTilt('.stat-card',     { maxTilt: 8,  scale: 1.04, perspective: 800, shine: false });
applyTilt('.contact-card',  { maxTilt: 6,  scale: 1.03, perspective: 900, shine: false });

/* ── Member Card Flip on Click (Mobile) ────────────────── */
document.querySelectorAll('.member-card').forEach(card => {
  // Click/tap to toggle flip (mainly for touch devices)
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});

/* ── Logo 3D Rotation on scroll ────────────────────────── */
const heroLogo = document.querySelector('.hero-logo-svg');
if (heroLogo) {
  window.addEventListener('scroll', () => {
    const angle = window.scrollY * 0.2;
    heroLogo.style.transform = `rotateY(${angle}deg) rotateZ(${angle * 0.1}deg)`;
  }, { passive: true });
}

/* ── Parallax Hero Grid ────────────────────────────────── */
const heroBgGrid = document.querySelector('.hero-bg-grid');
if (heroBgGrid) {
  window.addEventListener('scroll', () => {
    const offset = window.scrollY * 0.3;
    heroBgGrid.style.transform = `translateY(${offset}px)`;
  }, { passive: true });
}

/* ── Project card mouse shine (global) ─────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const my = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    card.style.setProperty('--mx', mx + '%');
    card.style.setProperty('--my', my + '%');
  });
});

/* ── Floating social links pulse on hover ──────────────── */
document.querySelectorAll('.member-social-link, .footer-social-link').forEach(link => {
  link.addEventListener('mouseenter', () => {
    link.style.transform = 'translateY(-3px) scale(1.15)';
  });
  link.addEventListener('mouseleave', () => {
    link.style.transform = '';
  });
});

/* ── Init: set initial nav state ───────────────────────── */
updateActiveNav();

/* ── Accessibility: keyboard flip for member cards ─────── */
document.querySelectorAll('.member-card').forEach(card => {
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('flipped');
    }
  });
});

console.log('%c✈ SkySyntax — Ideas Take Flight in Code.', 'color: #38bdf8; font-size: 16px; font-weight: bold;');
