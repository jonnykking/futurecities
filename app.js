/* ============================================
   FUTURE CITIES PLAYGROUND — App Logic
   ============================================ */

(function () {
  'use strict';

  // ------------------------------------------
  // Utility: Debounce / Throttle
  // ------------------------------------------
  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function throttle(fn, ms) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  // ------------------------------------------
  // Check reduced-motion preference
  // ------------------------------------------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------
  // Cursor Glow Effect
  // ------------------------------------------
  const cursorGlow = document.getElementById('cursor-glow');

  if (!prefersReducedMotion && cursorGlow && window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorGlow.classList.add('active');
    });

    document.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('active');
    });

    function animateCursorGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
      requestAnimationFrame(animateCursorGlow);
    }
    animateCursorGlow();
  }

  // ------------------------------------------
  // Particle System
  // ------------------------------------------
  const particleCanvas = document.getElementById('particle-canvas');

  if (!prefersReducedMotion && particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;

    function resizeParticleCanvas() {
      particleCanvas.width = window.innerWidth;
      particleCanvas.height = window.innerHeight;
    }
    resizeParticleCanvas();
    window.addEventListener('resize', debounce(resizeParticleCanvas, 200));

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * particleCanvas.width;
        this.y = Math.random() * particleCanvas.height;
        this.size = Math.random() * 1.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.6
          ? 'rgba(0, 240, 255,'
          : Math.random() > 0.4
            ? 'rgba(168, 85, 247,'
            : 'rgba(244, 114, 182,';
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < -10 || this.x > particleCanvas.width + 10 ||
          this.y < -10 || this.y > particleCanvas.height + 10) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ------------------------------------------
  // Navigation
  // ------------------------------------------
  const nav = document.getElementById('main-nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navLinkEls = document.querySelectorAll('.nav-link');

  // Scroll-based nav styling
  let lastScrollY = 0;
  window.addEventListener('scroll', throttle(() => {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScrollY = scrollY;

    // Active nav link
    const sections = ['hero', 'scenarios', 'configurator', 'about'];
    let currentSection = 'hero';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 200) {
        currentSection = id;
      }
    });

    navLinkEls.forEach(link => {
      link.classList.toggle('active', link.dataset.section === currentSection);
    });
  }, 100));

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ------------------------------------------
  // Scroll Animations (Intersection Observer)
  // ------------------------------------------
  const animatedElements = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    animatedElements.forEach(el => el.classList.add('is-visible'));
  }

  // ------------------------------------------
  // Counter Animation
  // ------------------------------------------
  function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.count, 10);
      const duration = 1500;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        counter.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }
      requestAnimationFrame(updateCounter);
    });
  }

  // Trigger counters when hero stats are visible
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statsObserver.observe(heroStats);
  }

  // ------------------------------------------
  // Smooth Scroll for anchor links
  // ------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // ------------------------------------------
  // Configurator Logic
  // ------------------------------------------
  const configState = {
    environment: 'urban',
    population: 60,
    energy: 'solar',
    greenery: 45,
    transport: 'aerial',
    tech: 75
  };

  // Toggle groups
  document.querySelectorAll('.config-toggle-group').forEach(group => {
    group.querySelectorAll('.config-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.config-toggle').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');

        if (group.id === 'config-energy') {
          configState.energy = btn.dataset.value;
        } else if (group.id === 'config-transport') {
          configState.transport = btn.dataset.value;
        }
        updatePreview();
      });
    });
  });

  // Sliders
  const popSlider = document.getElementById('config-population');
  const greenSlider = document.getElementById('config-greenery');
  const techSlider = document.getElementById('config-tech');
  const popValue = document.getElementById('pop-value');
  const greenValue = document.getElementById('green-value');
  const techValue = document.getElementById('tech-value');

  popSlider.addEventListener('input', () => {
    configState.population = parseInt(popSlider.value);
    popValue.textContent = popSlider.value + '%';
    updatePreview();
  });

  greenSlider.addEventListener('input', () => {
    configState.greenery = parseInt(greenSlider.value);
    greenValue.textContent = greenSlider.value + '%';
    updatePreview();
  });

  techSlider.addEventListener('input', () => {
    configState.tech = parseInt(techSlider.value);
    techValue.textContent = techSlider.value + '%';
    updatePreview();
  });

  // Select
  const envSelect = document.getElementById('config-environment');
  envSelect.addEventListener('change', () => {
    configState.environment = envSelect.value;
    updatePreview();
  });

  // Scoring
  function computeScores() {
    const { population, greenery, tech, energy, transport, environment } = configState;

    const energyBonus = { solar: 20, fusion: 15, wind: 18, tidal: 22 };
    const transportBonus = { aerial: 10, hyperloop: 15, teleport: 8 };
    const envBonus = { urban: 5, coastal: 12, mountain: 10, desert: 3, arctic: 7 };

    const sustainability = Math.min(100, Math.round(
      greenery * 0.6 + (energyBonus[energy] || 10) + (100 - population) * 0.15 + (envBonus[environment] || 5)
    ));

    const innovation = Math.min(100, Math.round(
      tech * 0.7 + (transportBonus[transport] || 10) + (energyBonus[energy] || 10) * 0.3
    ));

    const quality = Math.min(100, Math.round(
      greenery * 0.3 + (100 - population) * 0.25 + tech * 0.2 + (envBonus[environment] || 5) * 1.5
    ));

    const resilience = Math.min(100, Math.round(
      (100 - population) * 0.2 + greenery * 0.2 + tech * 0.3 + (energyBonus[energy] || 10) + 10
    ));

    const livability = Math.round((sustainability + innovation + quality + resilience) / 4);

    return { sustainability, innovation, quality, resilience, livability };
  }

  function updatePreview() {
    const scores = computeScores();

    // Update bars
    updateStatBar('stat-sustainability', scores.sustainability);
    updateStatBar('stat-innovation', scores.innovation);
    updateStatBar('stat-quality', scores.quality);
    updateStatBar('stat-resilience', scores.resilience);

    // Update score
    const scoreEl = document.getElementById('preview-score');
    scoreEl.textContent = `Livability: ${scores.livability}`;

    // Update city canvas
    renderCityCanvas();
  }

  function updateStatBar(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const fill = el.querySelector('.stat-fill');
    const val = el.querySelector('.stat-val');
    if (fill) fill.style.setProperty('--fill', value + '%');
    if (val) val.textContent = value + '%';
  }

  // ------------------------------------------
  // City Canvas Visualization
  // ------------------------------------------
  const cityCanvas = document.getElementById('city-canvas');
  const cityCtx = cityCanvas ? cityCanvas.getContext('2d') : null;

  // Seeded PRNG for stable, non-flickering element placement
  function createSeededRNG(seed) {
    let s = seed;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // Cache for the static scene layer to avoid redrawing every frame
  let staticSceneCache = null;
  let lastConfigKey = '';

  function getConfigKey() {
    return [
      configState.environment,
      configState.population,
      configState.energy,
      configState.greenery,
      configState.transport,
      configState.tech,
      cityCanvas ? cityCanvas.offsetWidth : 0,
      cityCanvas ? cityCanvas.offsetHeight : 0
    ].join('|');
  }

  // Theme colors based on environment
  const themes = {
    urban: { sky1: '#0a0a2a', sky2: '#1a0a30', ground: '#111128', accent: '#00f0ff' },
    coastal: { sky1: '#0a1a2a', sky2: '#0a2540', ground: '#0a1520', accent: '#22d3ee' },
    mountain: { sky1: '#0a0a20', sky2: '#151530', ground: '#0d0d22', accent: '#a78bfa' },
    desert: { sky1: '#1a0f0a', sky2: '#301a0a', ground: '#1a1008', accent: '#fb923c' },
    arctic: { sky1: '#0a1520', sky2: '#102030', ground: '#0f1820', accent: '#60a5fa' }
  };

  function renderStaticScene(w, h, scale, theme) {
    // Create offscreen canvas for static elements
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext('2d');
    const rng = createSeededRNG(42);

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    skyGrad.addColorStop(0, theme.sky1);
    skyGrad.addColorStop(1, theme.sky2);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.6);

    // Stars (stable positions from seeded RNG)
    const starCount = Math.floor(15 + configState.tech * 0.2);
    for (let i = 0; i < starCount; i++) {
      const sx = rng() * w;
      const sy = rng() * h * 0.5;
      const ss = rng() * 1.2 * scale + 0.3 * scale;
      const alpha = rng() * 0.5 + 0.15;
      ctx.beginPath();
      ctx.arc(sx, sy, ss, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }

    // Ground
    const groundY = h * 0.6;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
    groundGrad.addColorStop(0, theme.ground);
    groundGrad.addColorStop(1, theme.sky1);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, w, h - groundY);

    // Horizon glow
    const horizonGrad = ctx.createRadialGradient(w / 2, groundY, 0, w / 2, groundY, w * 0.4);
    horizonGrad.addColorStop(0, theme.accent + '25');
    horizonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, groundY - h * 0.12, w, h * 0.24);

    // Buildings (stable with seeded RNG)
    const buildingCount = Math.floor(6 + configState.population * 0.15);
    const maxHeight = h * 0.12 + (configState.population / 100) * h * 0.3;

    for (let i = 0; i < buildingCount; i++) {
      const jitter = (rng() - 0.5) * w * 0.04;
      const bx = (i / buildingCount) * w + jitter;
      const bw = (18 + rng() * 22) * scale;
      const bh = (30 + rng() * maxHeight / scale) * scale;
      const by = groundY - bh;

      // Building body
      const bGrad = ctx.createLinearGradient(bx, by, bx + bw, groundY);
      bGrad.addColorStop(0, 'rgba(30, 30, 60, 0.9)');
      bGrad.addColorStop(1, 'rgba(15, 15, 40, 0.95)');
      ctx.fillStyle = bGrad;
      ctx.fillRect(bx, by, bw, bh);

      // Building edge glow
      ctx.strokeStyle = theme.accent + '15';
      ctx.lineWidth = scale;
      ctx.strokeRect(bx, by, bw, bh);

      // Windows (stable pattern)
      const windowRows = Math.floor(bh / (8 * scale));
      const windowCols = Math.floor(bw / (8 * scale));
      for (let wy = 0; wy < windowRows; wy++) {
        for (let wx = 0; wx < windowCols; wx++) {
          const chance = rng();
          if (chance > 0.45) {
            const wxx = bx + 3 * scale + wx * 8 * scale;
            const wyy = by + 3 * scale + wy * 8 * scale;
            const lit = rng();
            ctx.fillStyle = lit > 0.5
              ? theme.accent + (Math.floor(lit * 60 + 15).toString(16).padStart(2, '0'))
              : `rgba(255, 200, 100, ${lit * 0.35 + 0.08})`;
            ctx.fillRect(wxx, wyy, 3 * scale, 3 * scale);
          } else {
            rng(); // consume to keep sequence aligned
          }
        }
      }

      // Antenna on tall buildings
      if (bh > maxHeight * 0.6 && configState.tech > 50) {
        ctx.strokeStyle = theme.accent + '40';
        ctx.lineWidth = scale;
        ctx.beginPath();
        ctx.moveTo(bx + bw / 2, by);
        ctx.lineTo(bx + bw / 2, by - 12 * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(bx + bw / 2, by - 12 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = theme.accent + 'aa';
        ctx.fill();
      }
    }

    // Trees / Green coverage (stable)
    if (configState.greenery > 10) {
      const treeCount = Math.floor(configState.greenery * 0.2);
      for (let i = 0; i < treeCount; i++) {
        const tx = rng() * w;
        const ty = groundY - (rng() * 4 + 2) * scale;
        const ts = (3 + rng() * 4) * scale;
        const greenVal = 94 + Math.floor(rng() * 50);

        // Tree top
        ctx.beginPath();
        ctx.arc(tx, ty - ts, ts, 0, Math.PI * 2);
        const greenAlpha = configState.greenery > 50 ? '0.55' : '0.35';
        ctx.fillStyle = `rgba(34, 197, ${greenVal}, ${greenAlpha})`;
        ctx.fill();

        // Trunk
        ctx.fillStyle = 'rgba(100, 70, 40, 0.35)';
        ctx.fillRect(tx - scale, ty - ts * 0.3, 2 * scale, ts * 0.6);
      }
    }

    // Static flying vehicles (stable positions)
    if (configState.tech > 40 && configState.transport === 'aerial') {
      const vehicleCount = Math.min(Math.floor(configState.tech * 0.03), 3);
      for (let i = 0; i < vehicleCount; i++) {
        const vx = rng() * w * 0.8 + w * 0.1;
        const vy = h * 0.12 + rng() * h * 0.25;
        ctx.beginPath();
        ctx.ellipse(vx, vy, 4 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fillStyle = theme.accent + '60';
        ctx.fill();

        // Trail
        ctx.beginPath();
        ctx.moveTo(vx - 4 * scale, vy);
        ctx.lineTo(vx - 16 * scale, vy);
        ctx.strokeStyle = theme.accent + '18';
        ctx.lineWidth = scale;
        ctx.stroke();
      }
    }

    // Hyperloop tube tracks (static part)
    if (configState.transport === 'hyperloop') {
      for (let i = 0; i < 2; i++) {
        const py = groundY - (20 + i * 30) * scale;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.quadraticCurveTo(w / 2, py - 15 * scale, w, py);
        ctx.strokeStyle = theme.accent + '25';
        ctx.lineWidth = 2.5 * scale;
        ctx.stroke();
      }
    }

    // Teleport beams (static)
    if (configState.transport === 'teleport') {
      for (let i = 0; i < 3; i++) {
        const bx2 = w * 0.2 + (i * w * 0.3);
        const beamGrad = ctx.createLinearGradient(bx2, 0, bx2, groundY);
        beamGrad.addColorStop(0, 'transparent');
        beamGrad.addColorStop(0.3, theme.accent + '08');
        beamGrad.addColorStop(0.7, theme.accent + '18');
        beamGrad.addColorStop(1, theme.accent + '04');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(bx2 - 3 * scale, 0, 6 * scale, groundY);
      }
    }

    // Energy source: Fusion reactor glow (static)
    if (configState.energy === 'fusion') {
      ctx.beginPath();
      const fGrad = ctx.createRadialGradient(w * 0.8, groundY, 0, w * 0.8, groundY, 35 * scale);
      fGrad.addColorStop(0, theme.accent + '30');
      fGrad.addColorStop(0.5, theme.accent + '10');
      fGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = fGrad;
      ctx.arc(w * 0.8, groundY, 35 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Energy source: Solar panels (stable positions)
    if (configState.energy === 'solar') {
      const solarRng = createSeededRNG(99);
      for (let i = 0; i < 4; i++) {
        const sx2 = w * 0.15 + i * w * 0.18;
        const sy2 = groundY - maxHeight * (0.3 + solarRng() * 0.35);
        ctx.fillStyle = 'rgba(100, 160, 255, 0.2)';
        ctx.fillRect(sx2, sy2, 14 * scale, 3 * scale);
        ctx.strokeStyle = theme.accent + '25';
        ctx.lineWidth = 0.5 * scale;
        ctx.strokeRect(sx2, sy2, 14 * scale, 3 * scale);
      }
    }

    // Energy source: Wind turbine poles (static part)
    if (configState.energy === 'wind') {
      for (let i = 0; i < 3; i++) {
        const wx2 = w * 0.15 + i * w * 0.3;
        const wy2 = groundY - 45 * scale;
        ctx.strokeStyle = 'rgba(200,200,200,0.2)';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(wx2, groundY);
        ctx.lineTo(wx2, wy2);
        ctx.stroke();

        // Hub dot
        ctx.beginPath();
        ctx.arc(wx2, wy2, 2 * scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,200,220,0.3)';
        ctx.fill();
      }
    }

    return offscreen;
  }

  function renderCityCanvas() {
    if (!cityCtx) return;

    const w = cityCanvas.width = cityCanvas.offsetWidth * (window.devicePixelRatio || 1);
    const h = cityCanvas.height = cityCanvas.offsetHeight * (window.devicePixelRatio || 1);
    const scale = w / 600;
    const theme = themes[configState.environment] || themes.urban;
    const groundY = h * 0.6;

    // Rebuild static cache if config changed
    const currentKey = getConfigKey();
    if (currentKey !== lastConfigKey) {
      staticSceneCache = renderStaticScene(w, h, scale, theme);
      lastConfigKey = currentKey;
    }

    // Draw cached static scene
    cityCtx.clearRect(0, 0, w, h);
    if (staticSceneCache) {
      cityCtx.drawImage(staticSceneCache, 0, 0);
    }

    // --- Animated overlay elements (only these update per frame) ---

    const now = Date.now();

    // Animated: Hyperloop capsules (very slow glide)
    if (configState.transport === 'hyperloop') {
      for (let i = 0; i < 2; i++) {
        const py = groundY - (20 + i * 30) * scale;
        // Slow speed: divide by 80 instead of 20
        const cx = (now / 80 + i * 350) % w;
        // Calculate Y offset along the curve
        const t = cx / w;
        const curveY = py - 15 * scale * 4 * t * (1 - t);
        cityCtx.beginPath();
        cityCtx.ellipse(cx, curveY - 3 * scale, 6 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        cityCtx.fillStyle = theme.accent + '70';
        cityCtx.fill();
        // Subtle glow
        cityCtx.beginPath();
        cityCtx.ellipse(cx, curveY - 3 * scale, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
        cityCtx.fillStyle = theme.accent + '10';
        cityCtx.fill();
      }
    }

    // Animated: Wind turbine blades (gentle spin)
    if (configState.energy === 'wind') {
      for (let i = 0; i < 3; i++) {
        const wx2 = w * 0.15 + i * w * 0.3;
        const wy2 = groundY - 45 * scale;
        for (let b = 0; b < 3; b++) {
          // Very slow rotation: divide by 4000 instead of 1000
          const angle = (b * Math.PI * 2 / 3) + (now / 4000) + (i * 0.8);
          cityCtx.beginPath();
          cityCtx.moveTo(wx2, wy2);
          cityCtx.lineTo(wx2 + Math.cos(angle) * 18 * scale, wy2 + Math.sin(angle) * 18 * scale);
          cityCtx.strokeStyle = 'rgba(200,200,255,0.25)';
          cityCtx.lineWidth = 1.2 * scale;
          cityCtx.stroke();
        }
      }
    }

    // Animated: Subtle antenna blink (slow pulse)
    if (configState.tech > 50) {
      const blinkAlpha = 0.3 + Math.sin(now / 1500) * 0.3;
      const buildingCount = Math.floor(6 + configState.population * 0.15);
      const maxHeight = h * 0.12 + (configState.population / 100) * h * 0.3;
      const rng = createSeededRNG(42);
      // Skip through RNG to find antenna positions (must match static scene)
      // Consume star RNG calls
      const starCount = Math.floor(15 + configState.tech * 0.2);
      for (let i = 0; i < starCount; i++) { rng(); rng(); rng(); rng(); }

      for (let i = 0; i < buildingCount; i++) {
        rng(); // jitter
        const bx = (i / buildingCount) * w + 0; // don't need exact - just the antenna center
        const bw = (18 + rng() * 22) * scale;
        rng(); // consume bw rng
        const bh = (30 + rng() * maxHeight / scale) * scale;
        const by = groundY - bh;

        // Skip window RNG calls
        const windowRows = Math.floor(bh / (8 * scale));
        const windowCols = Math.floor(bw / (8 * scale));
        for (let wy = 0; wy < windowRows; wy++) {
          for (let wx = 0; wx < windowCols; wx++) {
            rng(); rng(); // chance + lit
          }
        }

        // Only blink top-most antenna lights
        if (bh > maxHeight * 0.6) {
          const ax = (i / buildingCount) * w + (0) + bw / 2; // approximate
          cityCtx.beginPath();
          cityCtx.arc(ax, by - 12 * scale, 1.5 * scale, 0, Math.PI * 2);
          cityCtx.fillStyle = theme.accent + Math.floor(blinkAlpha * 255).toString(16).padStart(2, '0');
          cityCtx.fill();
        }
      }
    }
  }

  // Initial render
  if (cityCanvas) {
    setTimeout(() => {
      renderCityCanvas();
    }, 100);
    window.addEventListener('resize', debounce(() => {
      lastConfigKey = ''; // Force cache invalidation on resize
      renderCityCanvas();
    }, 200));
  }

  // Animate city canvas — only runs when configurator is visible
  // Uses a slower update rate (~20fps) since only subtle elements animate
  if (cityCanvas && !prefersReducedMotion) {
    let cityAnimFrame;
    let lastCityFrame = 0;
    const CITY_FRAME_INTERVAL = 50; // ~20fps, much gentler

    function animateCity(timestamp) {
      if (timestamp - lastCityFrame >= CITY_FRAME_INTERVAL) {
        lastCityFrame = timestamp;
        renderCityCanvas();
      }
      cityAnimFrame = requestAnimationFrame(animateCity);
    }

    const configSection = document.getElementById('configurator');
    if (configSection) {
      const configObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            cityAnimFrame = requestAnimationFrame(animateCity);
          } else {
            cancelAnimationFrame(cityAnimFrame);
          }
        });
      }, { threshold: 0.1 });
      configObserver.observe(configSection);
    }
  }

  // ------------------------------------------
  // Save City Button
  // ------------------------------------------
  const saveCityBtn = document.getElementById('save-city-btn');
  const cityNameInput = document.getElementById('city-name-input');

  if (saveCityBtn) {
    saveCityBtn.addEventListener('click', () => {
      const name = cityNameInput.value.trim() || 'Unnamed City';
      const scores = computeScores();
      showToast(`"${name}" blueprint saved! Livability: ${scores.livability}`);
      saveCityBtn.style.transform = 'scale(0.95)';
      setTimeout(() => { saveCityBtn.style.transform = ''; }, 150);
    });
  }

  // ------------------------------------------
  // Export PNG
  // ------------------------------------------
  const exportPngBtn = document.getElementById('export-png-btn');
  if (exportPngBtn && cityCanvas) {
    exportPngBtn.addEventListener('click', () => {
      renderCityCanvas(); // Ensure fresh render
      const link = document.createElement('a');
      const name = cityNameInput.value.trim() || 'future-city';
      link.download = name.replace(/\s+/g, '-').toLowerCase() + '-blueprint.png';
      link.href = cityCanvas.toDataURL('image/png');
      link.click();
      showToast('Blueprint exported as PNG!');
    });
  }

  // ------------------------------------------
  // Share URL
  // ------------------------------------------
  const shareUrlBtn = document.getElementById('share-url-btn');
  if (shareUrlBtn) {
    shareUrlBtn.addEventListener('click', () => {
      const params = new URLSearchParams({
        env: configState.environment,
        pop: configState.population,
        nrg: configState.energy,
        grn: configState.greenery,
        trn: configState.transport,
        tch: configState.tech,
        name: cityNameInput.value.trim() || ''
      });
      const url = window.location.origin + window.location.pathname + '?' + params.toString();
      navigator.clipboard.writeText(url).then(() => {
        showToast('Shareable link copied to clipboard!');
      }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('Shareable link copied!');
      });
    });
  }

  // Load config from URL params on startup
  (function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('env')) {
      configState.environment = params.get('env');
      document.getElementById('config-environment').value = configState.environment;
    }
    if (params.has('pop')) {
      configState.population = parseInt(params.get('pop'));
      document.getElementById('config-population').value = configState.population;
      document.getElementById('pop-value').textContent = configState.population + '%';
    }
    if (params.has('nrg')) {
      configState.energy = params.get('nrg');
      document.querySelectorAll('#config-energy .config-toggle').forEach(b => {
        b.classList.toggle('active', b.dataset.value === configState.energy);
        b.setAttribute('aria-checked', b.dataset.value === configState.energy);
      });
    }
    if (params.has('grn')) {
      configState.greenery = parseInt(params.get('grn'));
      document.getElementById('config-greenery').value = configState.greenery;
      document.getElementById('green-value').textContent = configState.greenery + '%';
    }
    if (params.has('trn')) {
      configState.transport = params.get('trn');
      document.querySelectorAll('#config-transport .config-toggle').forEach(b => {
        b.classList.toggle('active', b.dataset.value === configState.transport);
        b.setAttribute('aria-checked', b.dataset.value === configState.transport);
      });
    }
    if (params.has('tch')) {
      configState.tech = parseInt(params.get('tch'));
      document.getElementById('config-tech').value = configState.tech;
      document.getElementById('tech-value').textContent = configState.tech + '%';
    }
    if (params.has('name')) {
      cityNameInput.value = params.get('name');
    }
  })();

  // ------------------------------------------
  // Toast Notification
  // ------------------------------------------
  let toastEl = null;
  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'alert');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3000);
  }

  // ------------------------------------------
  // Scroll Progress Bar
  // ------------------------------------------
  const scrollProgress = document.getElementById('scroll-progress');
  if (scrollProgress) {
    window.addEventListener('scroll', throttle(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = progress + '%';
    }, 30));
  }

  // ------------------------------------------
  // Hero Morph Text Animation
  // ------------------------------------------
  const morphEl = document.getElementById('morph-text');
  if (morphEl && !prefersReducedMotion) {
    const phrases = ['Cities of Tomorrow', 'World of 2076', 'Urban Future', 'Next Frontier', 'Dream Cityscape'];
    let phraseIndex = 0;

    setInterval(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;

      // Morph out
      morphEl.classList.add('morphing-out');

      setTimeout(() => {
        morphEl.textContent = phrases[phraseIndex];
        morphEl.classList.remove('morphing-out');
        morphEl.classList.add('morphing-in');

        // Force reflow
        void morphEl.offsetWidth;

        // Reset to visible
        requestAnimationFrame(() => {
          morphEl.classList.remove('morphing-in');
        });
      }, 400);
    }, 4000);
  }

  // ------------------------------------------
  // Scenario Detail Modal
  // ------------------------------------------
  const scenarioData = {
    neon: {
      title: 'Neon Metropolis',
      tag: 'Cyberpunk',
      tagClass: 'neon',
      img: 'assets/images/neon-metropolis.png',
      hook: 'Where light never sleeps and data flows like rivers through canyons of chrome and glass.',
      motif: 'Vertical Infinity — towers stretching beyond the clouds',
      features: [
        { icon: '⚡', text: 'Quantum-mesh power grid — zero blackouts, zero waste' },
        { icon: '🌐', text: 'Holographic overlay network with real-time city data' },
        { icon: '🚀', text: 'Autonomous aerial transit — 3-minute commutes anywhere' },
        { icon: '🛡️', text: 'AI-governed safety mesh with predictive incident response' }
      ],
      lore: 'Founded in 2057 by a consortium of tech megacorps, the Neon Metropolis rose from the bones of old-world cities. Every surface is a display. Every molecule of air is tracked. Privacy is a luxury commodity, but so is boredom — because in the Neon Metropolis, the city itself is alive, adapting to your mood, your movement, your heartbeat. The question isn\'t whether you can live here. It\'s whether you can ever leave.'
    },
    sky: {
      title: 'Sky Citadel',
      tag: 'Utopian',
      tagClass: 'sky',
      img: 'assets/images/sky-citadel.png',
      hook: 'An archipelago of floating platforms where humanity touched the sky and decided to stay.',
      motif: 'Eternal Sunrise — light cascading through crystal architecture',
      features: [
        { icon: '☁️', text: 'Anti-gravity foundation platforms — self-stabilizing at 3,000m' },
        { icon: '🌿', text: 'Bioluminescent sky-gardens with atmospheric carbon capture' },
        { icon: '🔗', text: 'Light-bridge transit connecting 47 floating districts' },
        { icon: '🌅', text: 'Panoramic living — 360° horizon views from every residence' }
      ],
      lore: 'When the floods came, they didn\'t just retreat — they ascended. Using breakthrough anti-gravity lattice technology, the architects of the Sky Citadel engineered platforms that ride the atmosphere itself. Residents wake to sunrises below them. Children grow up knowing the horizon as a circle, not a line. It\'s humanity\'s boldest declaration: the ground was never meant to hold us.'
    },
    ocean: {
      title: 'Ocean Depths',
      tag: 'Aquatic',
      tagClass: 'ocean',
      img: 'assets/images/ocean-depths.png',
      hook: 'Beneath the waves, pressure becomes possibility. A civilization thriving in Earth\'s last frontier.',
      motif: 'Bioluminescent Pulse — living light guiding every path',
      features: [
        { icon: '🫧', text: 'Pressure-adaptive biodomes — seamless transition to 500m depth' },
        { icon: '🐠', text: 'Symbiotic coral ecosystems integrated into city infrastructure' },
        { icon: '🌊', text: 'Tidal energy converters powering entire city districts' },
        { icon: '🔬', text: 'Deep-sea research labs with live marine observation decks' }
      ],
      lore: 'Marine biologist Dr. Yuki Tanaka once said: "We knew more about Mars than our own ocean floor." Ocean Depths changed that. Built at crushing depths using self-healing polymer domes, this city doesn\'t fight the ocean — it collaborates with it. Coral structures double as load-bearing walls. Bioluminescent organisms replace electricity in ambient lighting. Here, architecture breathes.'
    },
    mars: {
      title: 'Mars Colony',
      tag: 'Extraterrestrial',
      tagClass: 'mars',
      img: 'assets/images/mars-colony.png',
      hook: 'Red dust. Green domes. The first human civilization on another world, proving we were always meant to wander.',
      motif: 'Iron Horizon — rust and renewal under twin moons',
      features: [
        { icon: '🏗️', text: 'Regolith 3D-printed habitats — built from Martian soil itself' },
        { icon: '☀️', text: 'Concentrated solar arrays with dust-resistant nanocoating' },
        { icon: '🧬', text: 'Terraforming gardens — gene-edited flora for CO₂ conversion' },
        { icon: '🚄', text: 'Hyperloop tunnel network connecting 12 colony domes' }
      ],
      lore: 'The first colonists arrived in 2071 — 142 souls crammed into three landers, carrying enough seeds to start a world. Five years later, the first Martian-born child took her first breath under an amber sky. The Mars Colony isn\'t just an outpost; it\'s proof that human stubbornness, when aimed at the stars, can move mountains — even ones on another planet.'
    }
  };

  const modal = document.getElementById('scenario-modal');
  const modalClose = document.getElementById('modal-close');

  function openScenarioModal(scenarioKey) {
    const data = scenarioData[scenarioKey];
    if (!data || !modal) return;

    document.getElementById('modal-img').src = data.img;
    document.getElementById('modal-img').alt = data.title;
    document.getElementById('modal-tag').textContent = data.tag;
    document.getElementById('modal-tag').className = 'scenario-tag ' + data.tagClass;
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-hook').textContent = data.hook;
    document.getElementById('modal-motif-value').textContent = data.motif;
    document.getElementById('modal-lore').textContent = data.lore;

    const featuresList = document.getElementById('modal-features');
    featuresList.innerHTML = data.features.map(f =>
      `<li><span class="feature-icon">${f.icon}</span><span>${f.text}</span></li>`
    ).join('');

    modal.classList.add('active');
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    // Configure button: scroll to configurator
    const configBtn = document.getElementById('modal-configure-btn');
    configBtn.onclick = () => {
      closeModal();
      setTimeout(() => {
        document.getElementById('configurator').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    };
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 500);
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Make scenario cards clickable
  document.querySelectorAll('.scenario-card.clickable').forEach(card => {
    const handler = () => {
      const key = card.dataset.scenario;
      if (key) openScenarioModal(key);
    };
    card.addEventListener('click', handler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });

  // ------------------------------------------
  // Compare Mode
  // ------------------------------------------
  const compareToggle = document.getElementById('compare-toggle');
  const comparePanel = document.getElementById('compare-panel');
  const compareA = document.getElementById('compare-a');
  const compareB = document.getElementById('compare-b');
  const compareGrid = document.getElementById('compare-grid');

  if (compareToggle && comparePanel) {
    compareToggle.addEventListener('click', () => {
      const isHidden = comparePanel.hidden;
      comparePanel.hidden = !isHidden;
      compareToggle.querySelector('span').textContent = isHidden ? 'Hide Compare' : 'Compare Scenarios';
    });
  }

  function renderCompare() {
    if (!compareGrid || !compareA || !compareB) return;
    const a = compareA.value;
    const b = compareB.value;
    if (!a || !b || a === b) {
      compareGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--c-text-muted);font-size:var(--f-size-sm);">Select two different scenarios above to compare.</p>';
      return;
    }
    const dataA = scenarioData[a];
    const dataB = scenarioData[b];
    if (!dataA || !dataB) return;

    compareGrid.innerHTML = [dataA, dataB].map(d => `
      <div class="compare-card">
        <span class="scenario-tag ${d.tagClass}" style="margin-bottom:var(--s-md);display:inline-block">${d.tag}</span>
        <h4>${d.title}</h4>
        <p style="font-size:var(--f-size-sm);color:var(--c-text-secondary);margin-bottom:var(--s-md);font-style:italic;line-height:1.6">${d.hook}</p>
        <ul class="scenario-features">
          ${d.features.map(f => `<li><span class="feature-icon">${f.icon}</span><span>${f.text}</span></li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  if (compareA) compareA.addEventListener('change', renderCompare);
  if (compareB) compareB.addEventListener('change', renderCompare);

  // ------------------------------------------
  // Ambient Sound (Web Audio API)
  // ------------------------------------------
  const ambientToggle = document.getElementById('ambient-toggle');
  const ambientIcon = document.getElementById('ambient-icon');
  let audioCtx = null;
  let ambientPlaying = false;
  let ambientNodes = [];

  function startAmbientSound() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Deep drone
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 55; // Low A
    gain1.gain.value = 0;
    gain1.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 2);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();

    // Ethereal pad
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    osc2.type = 'triangle';
    osc2.frequency.value = 220;
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 5;
    gain2.gain.value = 0;
    gain2.gain.linearRampToValueAtTime(0.025, audioCtx.currentTime + 3);
    osc2.connect(filter);
    filter.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start();

    // Very subtle high shimmer
    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.type = 'sine';
    osc3.frequency.value = 880;
    gain3.gain.value = 0;
    gain3.gain.linearRampToValueAtTime(0.008, audioCtx.currentTime + 4);
    osc3.connect(gain3);
    gain3.connect(audioCtx.destination);
    osc3.start();

    // Slow LFO on pad frequency for movement
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Very slow
    lfoGain.gain.value = 15;
    lfo.connect(lfoGain);
    lfoGain.connect(osc2.frequency);
    lfo.start();

    ambientNodes = [
      { osc: osc1, gain: gain1 },
      { osc: osc2, gain: gain2 },
      { osc: osc3, gain: gain3 },
      { osc: lfo, gain: lfoGain }
    ];
  }

  function stopAmbientSound() {
    ambientNodes.forEach(n => {
      try {
        n.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
        setTimeout(() => { try { n.osc.stop(); } catch (e) { } }, 1200);
      } catch (e) { }
    });
    ambientNodes = [];
  }

  if (ambientToggle) {
    ambientToggle.addEventListener('click', () => {
      ambientPlaying = !ambientPlaying;
      if (ambientPlaying) {
        startAmbientSound();
        ambientToggle.classList.add('active');
        ambientIcon.textContent = '🔊';
        showToast('Ambient city sounds enabled');
      } else {
        stopAmbientSound();
        ambientToggle.classList.remove('active');
        ambientIcon.textContent = '🔇';
        showToast('Ambient sounds muted');
      }
    });
  }

  // ------------------------------------------
  // Scenario Card Parallax (subtle)
  // ------------------------------------------
  if (!prefersReducedMotion) {
    const scenarioCards = document.querySelectorAll('.scenario-card');
    window.addEventListener('scroll', throttle(() => {
      scenarioCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const screenCenter = window.innerHeight / 2;
        const offset = (centerY - screenCenter) / window.innerHeight;
        const img = card.querySelector('.scenario-img');
        if (img) {
          img.style.transform = `scale(1.05) translateY(${offset * -15}px)`;
        }
      });
    }, 50));
  }

  // ------------------------------------------
  // Keyboard Navigation
  // ------------------------------------------
  document.addEventListener('keydown', (e) => {
    // Escape closes mobile menu or modal
    if (e.key === 'Escape') {
      if (modal && modal.classList.contains('active')) {
        closeModal();
      } else if (navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    }
  });

  // ------------------------------------------
  // Performance: Lazy-load observer for images
  // ------------------------------------------
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.classList.add('loaded');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    lazyImages.forEach(img => imgObserver.observe(img));
  }

  // Initial preview update
  updatePreview();

  console.log('%c🏙️ Future Cities Playground', 'color: #00f0ff; font-size: 16px; font-weight: bold;');
  console.log('%cExploring tomorrow\'s urban visions.', 'color: #9898b8; font-size: 12px;');

})();
