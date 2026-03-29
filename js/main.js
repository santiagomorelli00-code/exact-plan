/* ============================================================
   EXACT.PLAN GmbH — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navigation: scroll behaviour + logo size ────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    const hasHero = !!document.querySelector('.hero, .page-hero, .pdetail-slideshow');
    const updateNav = () => {
      const scrolled = window.scrollY > 60;
      nav.classList.toggle('scrolled', scrolled);
      if (hasHero) nav.classList.toggle('nav-transparent', !scrolled);
    };
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  /* ── Mobile menu ──────────────────────────────────────── */
  const hamburger  = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Hero Slideshow — advances 1.2 s before video ends ── */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots   = document.querySelectorAll('.hero-dot');

  if (heroSlides.length > 1) {
    let cur   = 0;
    let timer = null;

    const playSlideVideo = (slide) => {
      const v = slide.querySelector('video');
      if (!v) return;
      v.currentTime = 0;
      v.play().catch(() => {});
      // Advance 1.2 s before the video ends so it never freezes
      const onUpdate = () => {
        if (v.duration && v.currentTime >= v.duration - 1.2) {
          v.removeEventListener('timeupdate', onUpdate);
          stop();
          goTo(cur + 1);
          start();
        }
      };
      v.addEventListener('timeupdate', onUpdate);
      v._cleanup = () => v.removeEventListener('timeupdate', onUpdate);
    };

    const pauseSlideVideo = (slide) => {
      const v = slide.querySelector('video');
      if (!v) return;
      v.pause();
      if (v._cleanup) { v._cleanup(); delete v._cleanup; }
    };

    const goTo = (idx) => {
      pauseSlideVideo(heroSlides[cur]);
      heroSlides[cur].classList.remove('active');
      heroDots[cur]?.classList.remove('active');
      cur = (idx + heroSlides.length) % heroSlides.length;
      heroSlides[cur].classList.add('active');
      heroDots[cur]?.classList.add('active');
      playSlideVideo(heroSlides[cur]);
    };

    // Fallback interval (8 s) in case timeupdate doesn't fire
    const start = () => { timer = setInterval(() => goTo(cur + 1), 8000); };
    const stop  = () => { clearInterval(timer); };

    playSlideVideo(heroSlides[0]);
    start();

    heroDots.forEach((dot, i) => {
      dot.addEventListener('click', () => { stop(); goTo(i); start(); });
    });

    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      heroEl.addEventListener('mouseenter', stop);
      heroEl.addEventListener('mouseleave', start);
    }
  }

  /* ── Hero Parallax ───────────────────────────────────── */
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const slidesWrap = heroSection.querySelector('.hero-slides');
    if (slidesWrap) {
      slidesWrap.style.willChange = 'transform';
      const onScroll = () => {
        const y = window.scrollY;
        if (y <= heroSection.offsetHeight * 1.1) {
          slidesWrap.style.transform = `translateY(${y * 0.38}px)`;
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  /* ── Leistungen references slider ───────────────────── */
  const refSliders = document.querySelectorAll('.leis-ref-slider');
  refSliders.forEach((slider) => {
    const slides = slider.querySelectorAll('.leis-ref-slide');
    const dots = slider.querySelectorAll('.leis-ref-dot');
    const prevBtn = slider.querySelector('.leis-ref-prev');
    const nextBtn = slider.querySelector('.leis-ref-next');

    if (slides.length < 2 || !prevBtn || !nextBtn) return;

    let cur = 0;
    let timer = null;

    const goTo = (idx) => {
      slides[cur].classList.remove('active');
      dots[cur]?.classList.remove('active');
      cur = (idx + slides.length) % slides.length;
      slides[cur].classList.add('active');
      dots[cur]?.classList.add('active');
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => goTo(cur + 1), 5000);
    };

    prevBtn.addEventListener('click', () => {
      stop();
      goTo(cur - 1);
      start();
    });

    nextBtn.addEventListener('click', () => {
      stop();
      goTo(cur + 1);
      start();
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        stop();
        goTo(idx);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    start();
  });

  /* ── Scroll reveal (IntersectionObserver) ─────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if ('IntersectionObserver' in window && revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Active nav link ──────────────────────────────────── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

  /* ── Smooth page transitions ──────────────────────────── */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('http') &&
        !href.startsWith('mailto') && !href.startsWith('tel') && href.endsWith('.html')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        setTimeout(() => { window.location.href = href; }, 300);
      });
    }
  });

  /* fade in */
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.45s ease';
  requestAnimationFrame(() => requestAnimationFrame(() => { document.body.style.opacity = '1'; }));

});
