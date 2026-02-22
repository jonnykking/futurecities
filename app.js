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

  function renderCityCanvas() {
    if (!cityCtx) return;

    const w = cityCanvas.width = cityCanvas.offsetWidth * (window.devicePixelRatio || 1);
    const h = cityCanvas.height = cityCanvas.offsetHeight * (window.devicePixelRatio || 1);
    const scale = w / 600;

    cityCtx.clearRect(0, 0, w, h);

    // Theme colors based on environment
    const themes = {
      urban:   { sky1: '#0a0a2a', sky2: '#1a0a30', ground: '#111128', accent: '#00f0ff' },
      coastal: { sky1: '#0a1a2a', sky2: '#0a2540', ground: '#0a1520', accent: '#22d3ee' },
      mountain:{ sky1: '#0a0a20', sky2: '#151530', ground: '#0d0d22', accent: '#a78bfa' },
      desert:  { sky1: '#1a0f0a', sky2: '#301a0a', ground: '#1a1008', accent: '#fb923c' },
      arctic:  { sky1: '#0a1520', sky2: '#102030', ground: '#0f1820', accent: '#60a5fa' }
    };

    const theme = themes[configState.environment] || themes.urban;

    // Sky gradient
    const skyGrad = cityCtx.createLinearGradient(0, 0, 0, h * 0.6);
    skyGrad.addColorStop(0, theme.sky1);
    skyGrad.addColorStop(1, theme.sky2);
    cityCtx.fillStyle = skyGrad;
    cityCtx.fillRect(0, 0, w, h * 0.6);

    // Stars
    const starCount = Math.floor(20 + configState.tech * 0.3);
    for (let i = 0; i < starCount; i++) {
      const sx = Math.random() * w;
      const sy = Math.random() * h * 0.5;
      const ss = Math.random() * 1.5 * scale;
      cityCtx.beginPath();
      cityCtx.arc(sx, sy, ss, 0, Math.PI * 2);
      cityCtx.fillStyle = `rgba(255,255,255,${Math.random() * 0.6 + 0.2})`;
      cityCtx.fill();
    }

    // Ground
    const groundY = h * 0.6;
    const groundGrad = cityCtx.createLinearGradient(0, groundY, 0, h);
    groundGrad.addColorStop(0, theme.ground);
    groundGrad.addColorStop(1, theme.sky1);
    cityCtx.fillStyle = groundGrad;
    cityCtx.fillRect(0, groundY, w, h - groundY);

    // Horizon glow
    const horizonGrad = cityCtx.createRadialGradient(w / 2, groundY, 0, w / 2, groundY, w * 0.5);
    horizonGrad.addColorStop(0, theme.accent + '30');
    horizonGrad.addColorStop(1, 'transparent');
    cityCtx.fillStyle = horizonGrad;
    cityCtx.fillRect(0, groundY - h * 0.15, w, h * 0.3);

    // Buildings
    const buildingCount = Math.floor(8 + configState.population * 0.2);
    const maxHeight = h * 0.15 + (configState.population / 100) * h * 0.35;

    for (let i = 0; i < buildingCount; i++) {
      const bx = (i / buildingCount) * w + (Math.random() - 0.5) * w * 0.05;
      const bw = (15 + Math.random() * 25) * scale;
      const bh = (30 + Math.random() * maxHeight / scale) * scale;
      const by = groundY - bh;

      // Building body
      const bGrad = cityCtx.createLinearGradient(bx, by, bx + bw, groundY);
      bGrad.addColorStop(0, `rgba(30, 30, 60, 0.9)`);
      bGrad.addColorStop(1, `rgba(15, 15, 40, 0.95)`);
      cityCtx.fillStyle = bGrad;
      cityCtx.fillRect(bx, by, bw, bh);

      // Building edge glow
      cityCtx.strokeStyle = theme.accent + '20';
      cityCtx.lineWidth = scale;
      cityCtx.strokeRect(bx, by, bw, bh);

      // Windows
      const windowRows = Math.floor(bh / (8 * scale));
      const windowCols = Math.floor(bw / (8 * scale));
      for (let wy = 0; wy < windowRows; wy++) {
        for (let wx = 0; wx < windowCols; wx++) {
          if (Math.random() > 0.4) {
            const wxx = bx + 3 * scale + wx * 8 * scale;
            const wyy = by + 3 * scale + wy * 8 * scale;
            const lit = Math.random();
            cityCtx.fillStyle = lit > 0.5 
              ? theme.accent + (Math.floor(lit * 80 + 20).toString(16).padStart(2, '0'))
              : `rgba(255, 200, 100, ${lit * 0.5 + 0.1})`;
            cityCtx.fillRect(wxx, wyy, 3 * scale, 3 * scale);
          }
        }
      }

      // Antenna on tall buildings
      if (bh > maxHeight * 0.6 && configState.tech > 50) {
        cityCtx.strokeStyle = theme.accent + '60';
        cityCtx.lineWidth = scale;
        cityCtx.beginPath();
        cityCtx.moveTo(bx + bw / 2, by);
        cityCtx.lineTo(bx + bw / 2, by - 15 * scale);
        cityCtx.stroke();

        // Blinking light
        cityCtx.beginPath();
        cityCtx.arc(bx + bw / 2, by - 15 * scale, 2 * scale, 0, Math.PI * 2);
        cityCtx.fillStyle = theme.accent;
        cityCtx.fill();
      }
    }

    // Trees / Green coverage
    if (configState.greenery > 10) {
      const treeCount = Math.floor(configState.greenery * 0.3);
      for (let i = 0; i < treeCount; i++) {
        const tx = Math.random() * w;
        const ty = groundY - (Math.random() * 5 + 2) * scale;
        const ts = (3 + Math.random() * 5) * scale;

        // Tree top
        cityCtx.beginPath();
        cityCtx.arc(tx, ty - ts, ts, 0, Math.PI * 2);
        const green = configState.greenery > 50 ? '80' : '50';
        cityCtx.fillStyle = `rgba(34, 197, ${94 + Math.floor(Math.random() * 50)}, 0.${green})`;
        cityCtx.fill();

        // Trunk
        cityCtx.fillStyle = 'rgba(100, 70, 40, 0.5)';
        cityCtx.fillRect(tx - scale, ty - ts * 0.3, 2 * scale, ts * 0.8);
      }
    }

    // Flying vehicles (if tech > 40)
    if (configState.tech > 40 && configState.transport === 'aerial') {
      const vehicleCount = Math.floor(configState.tech * 0.05);
      for (let i = 0; i < vehicleCount; i++) {
        const vx = Math.random() * w;
        const vy = h * 0.1 + Math.random() * h * 0.3;
        cityCtx.beginPath();
        cityCtx.ellipse(vx, vy, 4 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        cityCtx.fillStyle = theme.accent + '80';
        cityCtx.fill();

        // Trail
        cityCtx.beginPath();
        cityCtx.moveTo(vx - 4 * scale, vy);
        cityCtx.lineTo(vx - 20 * scale, vy);
        cityCtx.strokeStyle = theme.accent + '20';
        cityCtx.lineWidth = scale;
        cityCtx.stroke();
      }
    }

    // Hyperloop tubes
    if (configState.transport === 'hyperloop') {
      for (let i = 0; i < 2; i++) {
        const py = groundY - (20 + i * 30) * scale;
        cityCtx.beginPath();
        cityCtx.moveTo(0, py);
        cityCtx.quadraticCurveTo(w / 2, py - 20 * scale, w, py);
        cityCtx.strokeStyle = theme.accent + '40';
        cityCtx.lineWidth = 3 * scale;
        cityCtx.stroke();

        // Capsule
        const cx = (Date.now() / 20 + i * 200) % w;
        cityCtx.beginPath();
        cityCtx.ellipse(cx, py - 5 * scale, 8 * scale, 3 * scale, 0, 0, Math.PI * 2);
        cityCtx.fillStyle = theme.accent + '90';
        cityCtx.fill();
      }
    }

    // Teleport beams
    if (configState.transport === 'teleport') {
      for (let i = 0; i < 3; i++) {
        const bx2 = w * 0.2 + (i * w * 0.3);
        const beamGrad = cityCtx.createLinearGradient(bx2, 0, bx2, groundY);
        beamGrad.addColorStop(0, 'transparent');
        beamGrad.addColorStop(0.3, theme.accent + '10');
        beamGrad.addColorStop(0.7, theme.accent + '30');
        beamGrad.addColorStop(1, theme.accent + '05');
        cityCtx.fillStyle = beamGrad;
        cityCtx.fillRect(bx2 - 3 * scale, 0, 6 * scale, groundY);
      }
    }

    // Energy source overlay
    if (configState.energy === 'fusion') {
      // Fusion reactor glow
      cityCtx.beginPath();
      const fGrad = cityCtx.createRadialGradient(w * 0.8, groundY, 0, w * 0.8, groundY, 40 * scale);
      fGrad.addColorStop(0, theme.accent + '40');
      fGrad.addColorStop(0.5, theme.accent + '15');
      fGrad.addColorStop(1, 'transparent');
      cityCtx.fillStyle = fGrad;
      cityCtx.arc(w * 0.8, groundY, 40 * scale, 0, Math.PI * 2);
      cityCtx.fill();
    }

    if (configState.energy === 'solar') {
      // Solar panels on rooftops
      for (let i = 0; i < 5; i++) {
        const sx2 = w * 0.15 + i * w * 0.15;
        const sy2 = groundY - maxHeight * (0.3 + Math.random() * 0.4);
        cityCtx.fillStyle = `rgba(100, 160, 255, 0.3)`;
        cityCtx.fillRect(sx2, sy2, 15 * scale, 4 * scale);
        cityCtx.strokeStyle = theme.accent + '40';
        cityCtx.lineWidth = 0.5 * scale;
        cityCtx.strokeRect(sx2, sy2, 15 * scale, 4 * scale);
      }
    }

    if (configState.energy === 'wind') {
      // Wind turbines
      for (let i = 0; i < 4; i++) {
        const wx2 = w * 0.1 + i * w * 0.25;
        const wy2 = groundY - 50 * scale;
        // Pole
        cityCtx.strokeStyle = 'rgba(200,200,200,0.3)';
        cityCtx.lineWidth = 2 * scale;
        cityCtx.beginPath();
        cityCtx.moveTo(wx2, groundY);
        cityCtx.lineTo(wx2, wy2);
        cityCtx.stroke();
        // Blades
        for (let b = 0; b < 3; b++) {
          const angle = (b * Math.PI * 2 / 3) + (Date.now() / 1000);
          cityCtx.beginPath();
          cityCtx.moveTo(wx2, wy2);
          cityCtx.lineTo(wx2 + Math.cos(angle) * 20 * scale, wy2 + Math.sin(angle) * 20 * scale);
          cityCtx.strokeStyle = 'rgba(200,200,255,0.4)';
          cityCtx.lineWidth = 1.5 * scale;
          cityCtx.stroke();
        }
      }
    }
  }

  // Initial render
  if (cityCanvas) {
    // Wait for container to have dimensions
    setTimeout(() => {
      renderCityCanvas();
    }, 100);
    window.addEventListener('resize', debounce(renderCityCanvas, 200));
  }

  // Animate city canvas for dynamic effects
  if (cityCanvas && !prefersReducedMotion) {
    let cityAnimFrame;
    function animateCity() {
      renderCityCanvas();
      cityAnimFrame = requestAnimationFrame(animateCity);
    }
    
    // Start animation when configurator is visible
    const configSection = document.getElementById('configurator');
    if (configSection) {
      const configObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCity();
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
      
      // Show toast
      showToast(`"${name}" blueprint saved! Livability: ${scores.livability}`);
      
      // Haptic-like button feedback
      saveCityBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        saveCityBtn.style.transform = '';
      }, 150);
    });
  }

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
    // Escape closes mobile menu
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
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
