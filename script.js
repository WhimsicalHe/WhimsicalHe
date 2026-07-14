/* ══════════════════════════════════════════════════════════
   Racco Ho — Personal Website V2
   Animation & Interaction Engine
   ══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ─── Theme Toggle (Light / Dark) ─── */
  const Theme = {
    key: 'racco-theme',
    init() {
      const stored = localStorage.getItem(this.key);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = stored || (prefersDark ? 'dark' : 'light');
      this.apply(theme);

      // Listen for toggle button clicks
      document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => this.toggle());
      });

      // Listen for system preference changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(this.key)) this.apply(e.matches ? 'dark' : 'light');
      });
    },
    apply(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.key, theme);
      // Update icon (sun ↔ moon)
      document.querySelectorAll('.theme-btn svg').forEach(svg => {
        const isSun = svg.querySelector('[data-icon="sun"]');
        if (isSun) isSun.style.display = theme === 'dark' ? 'block' : 'none';
      });
    },
    toggle() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      this.apply(current === 'dark' ? 'light' : 'dark');
    }
  };

  /* ─── Mobile Navigation ─── */
  const MobileNav = {
    overlay: null,
    panel: null,
    hamburger: null,
    isOpen: false,

    init() {
      this.overlay = document.querySelector('.mobile-nav-overlay');
      this.panel = document.querySelector('.mobile-nav-panel');
      this.hamburger = document.querySelector('.hamburger');
      if (!this.panel) return;

      this.hamburger.addEventListener('click', () => this.toggle());

      // Close on overlay click
      this.overlay.addEventListener('click', () => this.close());

      // Close on ESC
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });

      // Close on nav link click
      this.panel.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => this.close());
      });
    },

    toggle() { this.isOpen ? this.close() : this.open(); },
    open() {
      this.isOpen = true;
      this.hamburger.classList.add('active');
      this.overlay.classList.add('active');
      this.panel.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Focus first link for accessibility
      setTimeout(() => this.panel.querySelector('a')?.focus(), 300);
    },
    close() {
      this.isOpen = false;
      this.hamburger.classList.remove('active');
      this.overlay.classList.remove('active');
      this.panel.classList.remove('active');
      document.body.style.overflow = '';
      this.hamburger.focus();
    }
  };

  /* ─── Hero Breathing Animation (35-40s cycle) ─── */
  const HeroBreath = {
    el: null,
    raf: null,
    start: 0,
    period: 38000, // 38 seconds

    init() {
      this.el = document.querySelector('.hero-visual-img');
      if (!this.el) return;
      this.start = performance.now();
      this.tick();
    },

    tick() {
      this.raf = requestAnimationFrame((t) => {
        const elapsed = t - this.start;
        const progress = (elapsed % this.period) / this.period;
        // Gentle scale oscillation: 1.0 → 1.015 → 1.0
        const scale = 1 + Math.sin(progress * Math.PI * 2) * .0075;
        // Subtle Y drift: ±6px
        const y = Math.sin(progress * Math.PI * 2 * 0.7) * 6;
        // Slight rotation: ±0.4deg
        const rot = Math.cos(progress * Math.PI * 2 * 0.5) * .4;

        this.el.style.transform = `scale(${scale}) translateY(${y}px) rotate(${rot}deg)`;
        this.tick();
      });
    }
  };

  /* ─── Mouse Parallax on Hero Visual ─── */
  const Parallax = {
    hero: null,
    visual: null,
    floaters: null,
    active: false,

    init() {
      this.hero = document.querySelector('.hero');
      this.visual = document.querySelector('.hero-visual');
      this.floaters = document.querySelectorAll('.hero-floater');
      if (!this.hero || !this.visual) return;

      // Disable on touch devices
      if (window.matchMedia('(pointer: coarse)').matches) return;

      this.hero.addEventListener('mousemove', (e) => this.onMove(e));
      this.hero.addEventListener('mouseleave', () => this.reset());
    },

    onMove(e) {
      const rect = this.hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      // Move visual slightly against cursor
      this.visual.style.transform = `translate(${-x * 12}px, ${-y * 8}px)`;

      // Floaters move more dramatically at different rates
      this.floaters.forEach((f, i) => {
        const factor = (i + 1) * 3;
        f.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    },

    reset() {
      if (this.visual) this.visual.style.transform = '';
      this.floaters.forEach(f => f.style.transform = '');
    }
  };

  /* ─── Mouse Glow Effect (follows cursor) ─── */
  const MouseGlow = {
    glow: null,
    raf: null,
    x: -200, y: -200,

    init() {
      this.glow = document.querySelector('.mouse-glow');
      if (!this.glow) return;

      // Disable on touch devices
      if (window.matchMedia('(pointer: coarse)').matches) return;

      document.addEventListener('mousemove', (e) => {
        this.x = e.clientX;
        this.y = e.clientY;
        if (!this.raf) this.raf = requestAnimationFrame(() => this.update());
      });
    },

    update() {
      this.raf = null;
      this.glow.style.left = (this.x - 120) + 'px';
      this.glow.style.top = (this.y - 120) + 'px';
    }
  };

  /* ─── Scroll Reveal (IntersectionObserver) ─── */
  const Reveal = {
    observer: null,

    init() {
      this.observer = new IntersectionObserver(
        (entries) => entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer.unobserve(entry.target);
          }
        }),
        {
          threshold: 0.12,
          rootMargin: '0px 0px -40px 0px'
        }
      );

      document.querySelectorAll('.reveal').forEach(el => this.observer.observe(el));
    }
  };

  /* ─── Magnetic Button Effect ─── */
  const MagneticBtn = {
    init() {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      document.querySelectorAll('.btn-primary, .btn-view').forEach(btn => {
        btn.addEventListener('mousemove', (e) => this.onMove(e, btn));
        btn.addEventListener('mouseleave', () => btn.style.transform = '');
      });
    },

    onMove(e, btn) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    }
  };

  /* ─── Glass Hover Cards ─── */
  const GlassHover = {
    init() {
      // Already handled via CSS hover states
      // JS only needed for tilt effect on desktop
      if (window.matchMedia('(pointer: coarse)').matches) return;
      document.querySelectorAll('.work-card, .sticker-row').forEach(card => {
        card.addEventListener('mousemove', (e) => this.tilt(e, card));
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    },

    tilt(e, card) {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
    }
  };

  /* ─── Smooth scroll for anchor links ─── */
  function smoothScrollLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ─── Back to top button ─── */
  const BackToTop = {
    btn: null,

    init() {
      this.btn = document.querySelector('.back-to-top');
      if (!this.btn) return;

      window.addEventListener('scroll', () => this.toggle(), { passive: true });
      this.btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    },

    toggle() {
      const show = window.scrollY > window.innerHeight * 0.6;
      this.btn.style.opacity = show ? '1' : '0';
      this.btn.style.pointerEvents = show ? 'auto' : 'none';
    }
  };

  /* ─── Lazy load images with IntersectionObserver ─── */
  const LazyLoad = {
    init() {
      const images = document.querySelectorAll('img[data-src]');
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              obs.unobserve(img);
            }
          });
        }, { rootMargin: '80px' });
        images.forEach(img => obs.observe(img));
      } else {
        // Fallback: load all immediately
        images.forEach(img => { img.src = img.dataset.src; });
      }
    }
  };

  /* ─── Initialize everything ─── */
  function init() {
    Theme.init();
    MobileNav.init();
    HeroBreath.init();
    Parallax.init();
    MouseGlow.init();
    Reveal.init();
    MagneticBtn.init();
    GlassHover.init();
    BackToTop.init();
    LazyLoad.init();
    smoothScrollLinks();

    // Page load entrance animation
    document.body.classList.add('loaded');
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
