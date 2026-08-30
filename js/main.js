/**
 * ==========================================================================
 * PORTFOLIO JAVASCRIPT — EDITORIAL MANGA & SPRING MOTION ENGINE (ANIME.JS)
 * ==========================================================================
 */

(function () {
  'use strict';

  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Dark / Light Theme Switcher
  function initTheme() {
    const html = document.documentElement;
    const toggleBtn = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';

    html.setAttribute('data-theme', savedTheme);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', nextTheme);
        localStorage.setItem('portfolio-theme', nextTheme);

        if (window.lucide) {
          window.lucide.createIcons();
        }
      });
    }
  }

  // 3. Tech Stack Ticker Duplication
  function initTechTickers() {
    const upContent = document.getElementById('tickerUpContent');
    const downContent = document.getElementById('tickerDownContent');

    if (upContent) {
      upContent.innerHTML += upContent.innerHTML;
    }
    if (downContent) {
      downContent.innerHTML += downContent.innerHTML;
    }
  }

  // 4. Hero Spring Entrance Sequence (Anime.js)
  function playHeroEntrance() {
    if (typeof anime === 'undefined') return;

    // Stagger in Hero items with yui540 elastic bounce
    anime({
      targets: '.anime-hero-item',
      translateY: [35, 0],
      opacity: [0, 1],
      scale: [0.96, 1],
      delay: anime.stagger(90, { start: 100 }),
      duration: 1100,
      easing: 'easeOutElastic(1, .6)'
    });

    // Fade in background artwork with full clarity
    anime({
      targets: '.hero-bg-art',
      opacity: [0, 1],
      scale: [1.04, 1],
      duration: 1400,
      easing: 'easeOutCubic'
    });
  }

  // 5. Scroll Stagger Reveals & Counter Roll-ups
  function initScrollStaggers() {
    if (typeof anime === 'undefined') return;

    const sections = document.querySelectorAll('.scroll-section');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.anime-scroll-item');
          if (items.length) {
            anime({
              targets: items,
              translateY: [35, 0],
              opacity: [0, 1],
              scale: [0.97, 1],
              delay: anime.stagger(100, { start: 50 }),
              duration: 900,
              easing: 'easeOutBack(1.4)'
            });
          }

          // Animate stat counters
          const statNumbers = entry.target.querySelectorAll('.stat-number');
          statNumbers.forEach((statEl) => {
            const targetVal = parseInt(statEl.getAttribute('data-target'), 10) || 0;
            const obj = { val: 0 };

            anime({
              targets: obj,
              val: targetVal,
              round: 1,
              duration: 1400,
              easing: 'easeOutExpo',
              update: () => {
                statEl.textContent = obj.val;
              }
            });
          });

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    sections.forEach((sec) => observer.observe(sec));
  }

  // 6. Playful Spring Micro-Interactions
  function initSpringCards() {
    if (typeof anime === 'undefined') return;
    const projectCards = document.querySelectorAll('.spring-project-card:not([data-spring-bound])');
    projectCards.forEach((card, index) => {
      card.dataset.springBound = 'true';
      const tiltAngle = index % 2 === 0 ? 0.6 : -0.6;

      card.addEventListener('mouseenter', () => {
        anime.remove(card);
        anime({
          targets: card,
          translateY: -6,
          scale: 1.02,
          duration: 500,
          easing: 'easeOutElastic(1, .6)'
        });
      });

      card.addEventListener('mouseleave', () => {
        anime.remove(card);
        anime({
          targets: card,
          translateY: 0,
          scale: 1,
          duration: 450,
          easing: 'easeOutElastic(1, .5)'
        });
      });
    });
  }
  window.initSpringCards = initSpringCards;

  function initSpringInteractions() {
    if (typeof anime === 'undefined') return;

    // A. Project Cards Elastic Lift (No Tilt, Enlarge Only)
    initSpringCards();

    // B. Spring Buttons & Links (Squish and Pop, Enlarge Only)
    const springButtons = document.querySelectorAll('.spring-btn');
    springButtons.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        anime.remove(btn);
        anime({
          targets: btn,
          scale: 1.05,
          translateY: -2.5,
          duration: 500,
          easing: 'easeOutElastic(1, .5)'
        });
      });

      btn.addEventListener('mouseleave', () => {
        anime.remove(btn);
        anime({
          targets: btn,
          scale: 1,
          translateY: 0,
          duration: 450,
          easing: 'easeOutElastic(1, .5)'
        });
      });
    });

    // C. Stat & Tech Cards Elastic Hover
    const springCards = document.querySelectorAll('.spring-card');
    springCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        anime.remove(card);
        anime({
          targets: card,
          translateY: -5,
          scale: 1.02,
          duration: 500,
          easing: 'easeOutElastic(1, .6)'
        });
      });

      card.addEventListener('mouseleave', () => {
        anime.remove(card);
        anime({
          targets: card,
          translateY: 0,
          scale: 1,
          duration: 450,
          easing: 'easeOutElastic(1, .5)'
        });
      });
    });

    // D. Project Tags Playful Wobble
    const tags = document.querySelectorAll('.spring-tag');
    tags.forEach((tag) => {
      tag.addEventListener('mouseenter', () => {
        anime.remove(tag);
        anime({
          targets: tag,
          rotate: [-3, 3, -1, 0],
          scale: [1, 1.1, 1],
          duration: 650,
          easing: 'easeOutElastic(1, .4)'
        });
      });
    });

    // E. Giant "LET'S TALK" Staggered Letter Wave
    const hugeCta = document.getElementById('hugeCtaLink');
    if (hugeCta) {
      const letters = hugeCta.querySelectorAll('.cta-letter');

      hugeCta.addEventListener('mouseenter', () => {
        anime.remove(letters);
        anime({
          targets: letters,
          translateY: [
            { value: -18, duration: 250, easing: 'easeOutQuad' },
            { value: 0, duration: 600, easing: 'easeOutElastic(1, .4)' }
          ],
          rotate: [
            { value: -5, duration: 250, easing: 'easeOutQuad' },
            { value: 0, duration: 600, easing: 'easeOutElastic(1, .4)' }
          ],
          delay: anime.stagger(40)
        });
      });
    }

    // F. Straw Hat Keychain Playful Jiggle on Click
    const keychain = document.getElementById('strawhatKeychain');
    if (keychain) {
      keychain.addEventListener('click', () => {
        anime.remove(keychain);
        anime({
          targets: keychain,
          rotate: [0, 24, -20, 15, -10, 5, 0],
          scale: [1, 1.25, 1],
          duration: 900,
          easing: 'easeOutElastic(1, .4)'
        });
      });
    }
  }

  // 8. Active Navigation Tracking & Back to Top
  function initNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('backToTop');
    const currentYear = document.getElementById('currentYear');

    if (currentYear) {
      currentYear.textContent = new Date().getFullYear();
    }

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 200;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('data-nav') === current) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  // 6. Bottom-Left Mini Vinyl Record Audio Player
  function initVinylPlayer() {
    const playerEl = document.getElementById('miniVinylPlayer');
    const triggerEl = document.getElementById('vinylTrigger');
    const audioEl = document.getElementById('vinylAudio');
    const fileInput = document.getElementById('vinylFileInput');
    const uploadBtn = document.getElementById('vinylUploadBtn');

    if (!playerEl || !triggerEl || !audioEl) return;

    let isPlaying = false;
    let audioCtx = null;
    let synthOscillators = [];

    // Fallback Ambient Lo-Fi Generator using Web Audio API
    function startAmbientSynth() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        if (!audioCtx) {
          audioCtx = new AudioContext();
        }

        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        stopAmbientSynth();

        const chords = [220, 277.18, 329.63, 440]; // A major 7th chord lo-fi drone
        chords.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const filter = audioCtx.createBiquadFilter();

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500, audioCtx.currentTime);

          gain.gain.setValueAtTime(0.015, audioCtx.currentTime);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start();
          synthOscillators.push(osc);
        });
      } catch (err) {
        console.warn('Web Audio playback error:', err);
      }
    }

    function stopAmbientSynth() {
      synthOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      });
      synthOscillators = [];
    }

    function playAudio() {
      isPlaying = true;
      playerEl.classList.add('is-playing');

      if (audioEl.src && audioEl.src !== window.location.href) {
        audioEl.play().catch(() => {
          startAmbientSynth();
        });
      } else {
        startAmbientSynth();
      }
    }

    function pauseAudio() {
      isPlaying = false;
      playerEl.classList.remove('is-playing');
      audioEl.pause();
      stopAmbientSynth();
    }

    function togglePlayback() {
      if (isPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    }

    // Trigger Click
    triggerEl.addEventListener('click', togglePlayback);

    // Keyboard support
    triggerEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePlayback();
      }
    });

    // Upload from local storage
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          stopAmbientSynth();
          const fileUrl = URL.createObjectURL(file);
          audioEl.src = fileUrl;
          playAudio();
        }
      });
    }
  }

  // 7. Speculative Preloading on Hover for instantaneous transitions
  function initSpeculativePreload() {
    const prefetched = new Set();
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

      const cleanUrl = href.split('#')[0];
      if (!cleanUrl || prefetched.has(cleanUrl)) return;

      prefetched.add(cleanUrl);
      const prefetchTag = document.createElement('link');
      prefetchTag.rel = 'prefetch';
      prefetchTag.href = cleanUrl;
      document.head.appendChild(prefetchTag);
    }, { passive: true });
  }

  // 8. Interactive Direct Contact Modal with KokonutUI AI Shimmer Button & Inline Error
  function initContactModal() {
    const hugeCta = document.getElementById('hugeCtaLink');
    const contactModal = document.getElementById('contactModal');
    const closeContactBtn = document.getElementById('closeContactBtn');
    const contactForm = document.getElementById('directContactForm');
    const submitBtn = document.getElementById('submitContactBtn');
    const btnText = document.getElementById('kokonutBtnText');
    const inlineError = document.getElementById('contactInlineError');

    if (!contactModal) return;

    function openContactModal() {
      contactModal.style.display = 'flex';
      const firstInput = document.getElementById('contactFirstName');
      if (firstInput) setTimeout(() => firstInput.focus(), 80);
    }

    function closeContactModal() {
      contactModal.style.display = 'none';
      if (inlineError) {
        inlineError.style.display = 'none';
        inlineError.innerHTML = '';
      }
    }

    if (hugeCta) {
      hugeCta.addEventListener('click', (e) => {
        e.preventDefault();
        openContactModal();
      });
    }

    if (closeContactBtn) closeContactBtn.addEventListener('click', closeContactModal);

    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) closeContactModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && contactModal.style.display === 'flex') {
        closeContactModal();
      }
    });

    function setAnimatedText(newText) {
      if (!btnText) return;
      btnText.classList.add('kokonut-exit');
      setTimeout(() => {
        btnText.textContent = newText;
        btnText.classList.remove('kokonut-exit');
        btnText.classList.add('kokonut-enter');
        void btnText.offsetWidth; // trigger reflow
        btnText.classList.remove('kokonut-enter');
      }, 250);
    }

    function setButtonSending() {
      if (!submitBtn) return;
      submitBtn.classList.remove('is-success', 'is-failed');
      submitBtn.classList.add('is-loading');
      setAnimatedText("Sending...");
      if (inlineError) {
        inlineError.style.display = 'none';
        inlineError.innerHTML = '';
      }
    }

    function setButtonSuccess() {
      if (!submitBtn) return;
      submitBtn.classList.remove('is-loading', 'is-failed');
      submitBtn.classList.add('is-success');
      setAnimatedText("Sent!");

      if (inlineError) {
        inlineError.style.display = 'none';
        inlineError.innerHTML = '';
      }

      if (contactForm) contactForm.reset();

      setTimeout(() => {
        submitBtn.classList.remove('is-success');
        setAnimatedText("Send Message");
      }, 4500);
    }

    function setButtonFailed(errorMessage, mailtoUrl) {
      if (!submitBtn) return;
      submitBtn.classList.remove('is-loading', 'is-success');
      submitBtn.classList.add('is-failed');
      setAnimatedText("Failed");

      if (inlineError) {
        inlineError.style.display = 'inline-flex';
        inlineError.innerHTML = `⚠ ${errorMessage} ${mailtoUrl ? `(<a href="${mailtoUrl}">mailto</a>)` : ''}`;
      }

      setTimeout(() => {
        submitBtn.classList.remove('is-failed');
        setAnimatedText("Send Message");
      }, 4500);
    }

    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('contactFirstName')?.value.trim() || '';
        const lastName = document.getElementById('contactLastName')?.value.trim() || '';
        const name = `${firstName} ${lastName}`.trim() || 'Visitor';
        const service = document.getElementById('contactService')?.value.trim() || 'Portfolio Inquiry';
        const email = document.getElementById('contactEmail')?.value.trim();
        const message = document.getElementById('contactMessage')?.value.trim();

        if (!email || !message) return;

        setButtonSending();

        try {
          const response = await fetch('https://formsubmit.co/ajax/harshwardhan1617@gmail.com', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              name,
              email,
              _replyto: email,
              _subject: `[Portfolio Contact] ${service} - from ${name}`,
              service,
              message,
              _template: 'table'
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          if (data && data.success === 'false') {
            throw new Error(data.message || 'Submission rejected');
          }

          setButtonSuccess();
        } catch (err) {
          const isFileProtocol = window.location.protocol === 'file:';
          const errMsg = isFileProtocol ? 'Local file (CORS blocked)' : (err.message || 'Transmission failed');
          const mailtoUrl = `mailto:harshwardhan1617@gmail.com?subject=${encodeURIComponent(`[Portfolio Contact] ${service} - from ${name}`)}&body=${encodeURIComponent(message)}`;
          setButtonFailed(errMsg, mailtoUrl);
        }
      });
    }
  }

  // DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTechTickers();
    initNavigation();
    initSpringInteractions();
    initScrollStaggers();
    initVinylPlayer();
    initSpeculativePreload();
    initContactModal();

    // Trigger hero entrance
    setTimeout(playHeroEntrance, 100);
  });
})();

