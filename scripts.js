/* =====================================================
   Nav scroll active state
===================================================== */
const navAnchors = document.querySelectorAll(".nav-menu a");
const sections = document.querySelectorAll("section[id]");
const topHeader = document.getElementById("top-header");

function headerScrollOffset() {
  return topHeader ? topHeader.offsetHeight + 16 : 96;
}

function setActiveNavLink() {
  let current = "";
  const offset = headerScrollOffset();

  sections.forEach((section) => {
    const top = section.offsetTop - offset;
    const height = section.offsetHeight;

    if (window.scrollY >= top && window.scrollY < top + height) {
      current = section.getAttribute("id") || "";
    }
  });

  navAnchors.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href") || "";
    const id = href.startsWith("#") ? href.slice(1) : "";

    if (id && id === current) {
      link.classList.add("active");
    }
  });
}

function updateTopHeaderScrollState() {
  if (topHeader) {
    topHeader.classList.toggle("is-scrolled", window.scrollY > 40);
  }
}

function onNavScroll() {
  setActiveNavLink();
  updateTopHeaderScrollState();
}

window.addEventListener("scroll", onNavScroll, { passive: true });
window.addEventListener("load", () => {
  setActiveNavLink();
  updateTopHeaderScrollState();
});

/* =====================================================
   Hero Canvas — particles, ambient orbs, dot grid
===================================================== */
(function initHeroCanvas() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W, H, animId;
  let mouse = { x: -9999, y: -9999 };
  let paused = false;

  /* ---- resize ---- */
  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  /* ---- particles ---- */
  const PARTICLE_COUNT = 70;
  const particles = [];

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * (W || 1200),
      y: Math.random() * (H || 800),
      r: randBetween(0.8, 2.4),
      vx: randBetween(-0.18, 0.18),
      vy: randBetween(-0.14, 0.14),
      alpha: randBetween(0.18, 0.55),
      /* slow pulse */
      pulseSpeed: randBetween(0.006, 0.016),
      pulseOffset: Math.random() * Math.PI * 2,
    });
  }

  /* ---- ambient orbs ---- */
  const orbs = [
    {
      baseX: 0.72, baseY: 0.22,
      radius: 320,
      color: "rgba(255, 122, 0, 0.13)",
      driftAmp: 0.06, driftFreqX: 0.00028, driftFreqY: 0.00021,
    },
    {
      baseX: 0.18, baseY: 0.65,
      radius: 260,
      color: "rgba(180, 130, 255, 0.07)",
      driftAmp: 0.05, driftFreqX: 0.00019, driftFreqY: 0.00031,
    },
    {
      baseX: 0.55, baseY: 0.88,
      radius: 200,
      color: "rgba(255, 200, 80, 0.06)",
      driftAmp: 0.04, driftFreqX: 0.00035, driftFreqY: 0.00017,
    },
  ];

  /* ---- dot grid ---- */
  const GRID_COLS = 28;
  const GRID_ROWS = 18;

  function drawDotGrid(t) {
    const colSpacing = W / GRID_COLS;
    const rowSpacing = H / GRID_ROWS;
    const warpStrength = 14;
    const mouseInfluenceRadius = 200;

    ctx.fillStyle = "rgba(255, 255, 255, 0.09)";

    for (let r = 0; r <= GRID_ROWS; r++) {
      for (let c = 0; c <= GRID_COLS; c++) {
        let gx = c * colSpacing;
        let gy = r * rowSpacing;

        /* subtle time-based undulation */
        gx += Math.sin(t * 0.00045 + r * 0.6) * 1.8;
        gy += Math.cos(t * 0.00038 + c * 0.5) * 1.8;

        /* warp toward mouse */
        const dx = mouse.x - gx;
        const dy = mouse.y - gy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseInfluenceRadius && dist > 0) {
          const pull = (1 - dist / mouseInfluenceRadius) * warpStrength;
          gx += (dx / dist) * pull;
          gy += (dy / dist) * pull;
        }

        const dotR = 0.9;
        ctx.beginPath();
        ctx.arc(gx, gy, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* ---- draw ambient orbs ---- */
  function drawOrbs(t) {
    orbs.forEach((orb) => {
      const cx = (orb.baseX + Math.sin(t * orb.driftFreqX) * orb.driftAmp) * W;
      const cy = (orb.baseY + Math.cos(t * orb.driftFreqY) * orb.driftAmp) * H;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.radius);
      grad.addColorStop(0, orb.color);
      grad.addColorStop(1, "transparent");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, orb.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ---- draw particles ---- */
  function drawParticles(t) {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      /* wrap at edges */
      if (p.x < -4) p.x = W + 4;
      if (p.x > W + 4) p.x = -4;
      if (p.y < -4) p.y = H + 4;
      if (p.y > H + 4) p.y = -4;

      const pulse = 0.5 + 0.5 * Math.sin(t * p.pulseSpeed + p.pulseOffset);
      const alpha = p.alpha * (0.65 + 0.35 * pulse);

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ---- main loop ---- */
  function loop(t) {
    if (paused) { animId = requestAnimationFrame(loop); return; }

    ctx.clearRect(0, 0, W, H);

    /* dark base */
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    drawOrbs(t);
    drawDotGrid(t);
    drawParticles(t);

    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);

  /* pause when tab hidden — save battery/CPU */
  document.addEventListener("visibilitychange", () => {
    paused = document.hidden;
  });

  /* ---- cursor tracking (for canvas warp + CSS glow) ---- */
  const heroSection = document.querySelector(".hero");
  const cursorGlow = document.querySelector(".hero-cursor-glow");

  if (heroSection) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      if (cursorGlow) {
        const px = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
        const py = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
        cursorGlow.style.setProperty("--cx", `${px}%`);
        cursorGlow.style.setProperty("--cy", `${py}%`);
      }
    });

    heroSection.addEventListener("mouseleave", () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });
  }
})();

/* =====================================================
   Hero — staggered entrance animations
===================================================== */
(function heroEntrance() {
  const selectors = [".eyebrow", "h1", ".hero-text", ".hero-buttons"];
  const delays = [0, 160, 320, 480];

  selectors.forEach((sel, i) => {
    const el = document.querySelector(`.hero-content ${sel}`);
    if (!el) return;
    setTimeout(() => el.classList.add("visible"), delays[i]);
  });
})();

/* =====================================================
   Hero — scroll parallax
===================================================== */
(function heroParallax() {
  const hero = document.querySelector(".hero");
  const content = document.querySelector(".hero-content");
  if (!hero || !content) return;

  function onScroll() {
    const heroH = hero.offsetHeight;
    const scrollY = window.scrollY;

    /* only apply while hero is visible */
    if (scrollY > heroH) return;

    content.style.transform = `translateY(${scrollY * 0.18}px)`;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* =====================================================
   FAQ accordion
===================================================== */
(function initFaqAccordion() {
  const items = document.querySelectorAll("#faqs .faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector(".faq-trigger");
    const panel = item.querySelector(".faq-panel");
    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");

      items.forEach((other) => {
        other.classList.remove("is-open");
        const b = other.querySelector(".faq-trigger");
        const p = other.querySelector(".faq-panel");
        if (b) b.setAttribute("aria-expanded", "false");
        if (p) p.setAttribute("aria-hidden", "true");
      });

      if (willOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
      }
    });
  });
})();

/* =====================================================
   Contact form → Supabase Edge Function
===================================================== */
(function initContactForm() {
  const SUPABASE_URL      = 'https://wthxedaitotnfvzrmjxm.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aHhlZGFpdG90bmZ2enJtanhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTM4MDMsImV4cCI6MjA5MTc4OTgwM30.Jhl0Oh5z36crSC-gpLTVTCcuDaHarQMhmQNWti4PyFA';
  const FUNCTION_URL      = SUPABASE_URL + '/functions/v1/submit-lead';

  const form   = document.getElementById('contact-form');
  let status = document.getElementById('contact-form-status');
  const btn    = form ? form.querySelector('button[type="submit"]') : null;

  if (!form || !btn) return;

  if (!status) {
    console.warn('[contact-form] Missing #contact-form-status; creating fallback status element.');
    status = document.createElement('div');
    status.id = 'contact-form-status';
    status.setAttribute('role', 'alert');
    status.setAttribute('aria-live', 'polite');
    form.appendChild(status);
  }

  function setStatus(type, msg) {
    status.className = type ? 'contact-form-status--' + type : '';
    status.textContent = msg;
  }

  /**
   * Turnstile may inject `cf-turnstile-response` outside the <form> or only
   * expose the token via the JS API — so we resolve the token several ways.
   */
  function getTurnstileToken(formEl) {
    const sel =
      'input[name="cf-turnstile-response"],textarea[name="cf-turnstile-response"]';

    function lastNonEmpty(root) {
      let last = '';
      root.querySelectorAll(sel).forEach((el) => {
        const v = (el.value && el.value.trim()) || '';
        if (v) last = v;
      });
      return last;
    }

    let t = lastNonEmpty(formEl);
    if (t) return t;
    t = lastNonEmpty(document);
    if (t) return t;

    if (typeof window.turnstile !== 'undefined' && typeof window.turnstile.getResponse === 'function') {
      try {
        const g = window.turnstile.getResponse();
        if (g && String(g).trim()) return String(g).trim();
      } catch (_) { /* try widget id */ }
      const wid = formEl.querySelector('[id^="cf-chl-widget"]');
      if (wid && wid.id) {
        try {
          const g = window.turnstile.getResponse(wid.id);
          if (g && String(g).trim()) return String(g).trim();
        } catch (_) { /* ignore */ }
      }
    }
    return '';
  }

  function resetTurnstileWidget(formEl) {
    if (typeof window.turnstile === 'undefined' || typeof window.turnstile.reset !== 'function') {
      return;
    }
    const wid = formEl.querySelector('[id^="cf-chl-widget"]');
    try {
      if (wid && wid.id) window.turnstile.reset(wid.id);
      else window.turnstile.reset();
    } catch (_) { /* ignore */ }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* honeypot check */
    if (form.querySelector('[name="_gotcha"]').value) return;

    const token = getTurnstileToken(form);
    if (!token) {
      setStatus('error', 'Please complete the security check before submitting.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending\u2026';
    setStatus('', '');

    let res, data;
    try {
      res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          token,
          full_name:           form.querySelector('[name="name"]').value.trim(),
          email:               form.querySelector('[name="email"]').value.trim(),
          company_name:        form.querySelector('[name="company"]').value.trim() || null,
          phone:               form.querySelector('[name="phone"]').value.trim() || null,
          service_type:        form.querySelector('[name="service_needed"]').value || null,
          timeline:            form.querySelector('[name="timeline"]').value || null,
          project_description: form.querySelector('[name="message"]').value.trim(),
        }),
      });
      data = await res.json();
    } catch (_) {
      data = { error: 'Network error' };
    }

    if (!res || !res.ok || data.error) {
      setStatus('error', 'Something went wrong. Please try again or email us directly.');
      resetTurnstileWidget(form);
      btn.disabled = false;
      btn.textContent = 'Send inquiry';
    } else {
      setStatus('success', 'Your inquiry was received. We\u2019ll be in touch within 24\u201348 business hours.');
      form.reset();
      btn.textContent = 'Send inquiry';
    }
  });
})();
