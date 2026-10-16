/**
 * ==========================================================================
 * DIAGONAL HORIZONTAL PROJECT SHOWCASE ENGINE (OFFF CDMX + POSTCARD HYBRID)
 * ==========================================================================
 * Features:
 * - Perfectly aligned parallel cards (56° angle from X-axis via skewX(-34deg))
 * - Real user projects imported from GitHub (loserharsh)
 * - Custom vertical bookmark artwork cropped from user reference images
 * - Split postcard layout on expand (matching user Reference Image 3):
 *   * Vinyl / cassette / camera stamp icon at top
 *   * Project name on top
 *   * Description from GitHub
 *   * Clean repo exploration link & close button
 * - Slow continuous right-to-left marquee motion (pauses on hover/expand)
 * - Imaginary vertical center line (window.innerWidth / 2) interaction:
 *   * Right-side card clicked -> opens RIGHT, moves ONLY right-side cards
 *   * Left-side card clicked  -> opens LEFT, moves ONLY left-side cards
 */

(function () {
  'use strict';

  const DEFAULT_HUD = {
    eyebrow: 'Featured Projects',
    title: 'SELECTED CHRONICLES',
    sub: '2026'
  };

  // Stamp SVG icons matching Image 3 (Vinyl record, cassette tape, camera)
  const STAMP_ICONS = {
    vinyl: `
      <svg class="postcard-stamp-icon" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="#000000" stroke="#ffffff" stroke-width="1.8"/>
        <circle cx="24" cy="24" r="16" stroke="rgba(255,255,255,0.25)" stroke-width="1" stroke-dasharray="2 3"/>
        <circle cx="24" cy="24" r="11" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <circle cx="24" cy="24" r="7" fill="#ffffff"/>
        <circle cx="24" cy="24" r="2.5" fill="#000000"/>
      </svg>
    `,
    tape: `
      <svg class="postcard-stamp-icon" viewBox="0 0 54 36" fill="none">
        <rect x="2" y="2" width="50" height="32" rx="4" fill="#000000" stroke="#ffffff" stroke-width="1.8"/>
        <rect x="9" y="8" width="36" height="15" rx="2" fill="rgba(255,255,255,0.08)" stroke="#ffffff" stroke-width="1.2"/>
        <circle cx="19" cy="15.5" r="4.5" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="35" cy="15.5" r="4.5" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M19 15.5 L35 15.5" stroke="#ffffff" stroke-width="1" stroke-dasharray="2 2"/>
        <polygon points="12,30 15,26 39,26 42,30" fill="rgba(255,255,255,0.2)"/>
      </svg>
    `,
    camera: `
      <svg class="postcard-stamp-icon" viewBox="0 0 48 40" fill="none">
        <path d="M16 6 L20 2 L28 2 L32 6 L44 6 C45.5 6 46.5 7 46.5 8.5 L46.5 35 C46.5 36.5 45.5 37.5 44 37.5 L4 37.5 C2.5 37.5 1.5 36.5 1.5 35 L1.5 8.5 C1.5 7 2.5 6 4 6 Z" fill="#000000" stroke="#ffffff" stroke-width="1.8"/>
        <circle cx="24" cy="22" r="9" fill="none" stroke="#ffffff" stroke-width="2"/>
        <circle cx="24" cy="22" r="5" fill="#ffffff"/>
        <circle cx="39" cy="12" r="2" fill="#ffffff"/>
      </svg>
    `
  };

  const STAMP_KEYS = ['vinyl', 'tape', 'camera'];

  // 7 Vertical Watercolor Pine Forest Bookmarks Cropped from User Reference
  const BOOKMARK_IMAGES = [
    'assets/cards/forest_bm_1.jpg',
    'assets/cards/forest_bm_2.jpg',
    'assets/cards/forest_bm_3.jpg',
    'assets/cards/forest_bm_4.jpg',
    'assets/cards/forest_bm_5.jpg',
    'assets/cards/forest_bm_6.jpg',
    'assets/cards/forest_bm_7.jpg'
  ];

  /**
   * ProjectCard Class
   */
  class ProjectCard {
    constructor({
      id = '',
      name = 'UNTITLED PROJECT',
      description = '',
      githubUrl = 'https://github.com/loserharsh',
      language = 'Code',
      image = '',
      stars = 0
    } = {}) {
      this.id = id || name;
      this.name = name;
      this.description = description || 'A personal software chronicle exploring algorithms, web architecture, and creative code.';
      this.githubUrl = githubUrl;
      this.language = language || 'General';
      this.image = image || BOOKMARK_IMAGES[0];
      this.stars = stars;
    }

    /**
     * Render the slanted card with split ticket layout (matching media_1792171630281.jpg)
     * @param {number} index - Index in track
     * @returns {string}
     */
    renderHTML(index = 0) {
      const cleanName = this.escapeAttr(this.name);
      const cleanDesc = this.escapeAttr(this.description);
      const repoUrl = this.githubUrl || 'https://github.com/loserharsh';

      return `
        <article
          class="showcase-card"
          data-card-index="${index}"
          data-title="${cleanName}"
          data-eyebrow="${this.escapeAttr(this.language)} // PROJECT"
          data-sub="GITHUB REPO"
          tabindex="0"
          role="button"
          aria-expanded="false"
          aria-label="${cleanName} — ${this.escapeAttr(this.language)}"
        >
          <div class="showcase-card-inner">
            <div class="showcase-split-wrap">
              
              <!-- Art Column: Vertical Bookmark Artwork (Tilted along card angle) -->
              <div class="card-art-col">
                <img
                  src="${this.image}"
                  alt="${cleanName} bookmark artwork"
                  class="showcase-card-bg"
                />
                <div class="showcase-card-sheen" aria-hidden="true"></div>
              </div>

              <!-- Ticket Info Column (Matching media_1792171630281.jpg: Name on top, Description below) -->
              <div class="card-info-col font-sans">
                <div class="ticket-card-layout">
                  
                  <div class="ticket-text-col">
                    <button
                      type="button"
                      class="ticket-close-btn"
                      data-action="close-card"
                      aria-label="Close project preview"
                      title="Close"
                    >×</button>

                    <div class="ticket-header-meta">
                      <span class="ticket-lang-badge">${this.escapeAttr(this.language)} // ARCHIVE</span>
                      <span class="ticket-serial-badge">NO. ${String((index % 13) + 1).padStart(2, '0')}</span>
                    </div>

                    <!-- Project Name on Top: Much larger than description (Space Grotesk) -->
                    <h3 class="ticket-title font-heading">${this.name}</h3>

                    <!-- GitHub Description: Proportional ratio below title -->
                    <p class="ticket-desc font-sans">${this.description}</p>

                    <!-- View Repo Action -->
                    <div class="ticket-actions-row">
                      <a
                        href="${repoUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="ticket-link-btn font-mono"
                      >
                        <span>VIEW REPO</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </article>
      `;
    }

    escapeAttr(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }

  /**
   * Complete Repositories Dataset from loserharsh Git
   */
  const ALL_GIT_REPOS = [
    {
      name: 'GalaxySimulation',
      description: 'A C++-based galaxy simulation exploring celestial bodies, orbital mechanics, and the mathematics behind the motion of objects in space.',
      githubUrl: 'https://github.com/loserharsh/GalaxySimulation',
      language: 'C++'
    },
    {
      name: 'web-dev',
      description: 'Learning web development by building projects, experimental animations, and interactive interfaces from scratch.',
      githubUrl: 'https://github.com/loserharsh/web-dev',
      language: 'HTML / JS'
    },
    {
      name: 'cellular-automation',
      description: 'Cellular Automata simulation in C++ exploring emergent life patterns, Conway rules, and grid dynamics.',
      githubUrl: 'https://github.com/loserharsh/cellular-automation',
      language: 'C++'
    },
    {
      name: 'enigma',
      description: 'A project exploring cryptography, cryptographic ciphers, machine rotors, and the art of solving historical puzzles.',
      githubUrl: 'https://github.com/loserharsh/enigma',
      language: 'C++'
    },
    {
      name: 'vault',
      description: 'Minimalist personal finance tracker & PWA built with pure Vanilla JavaScript and zero external dependencies.',
      githubUrl: 'https://github.com/loserharsh/vault',
      language: 'JavaScript'
    },
    {
      name: 'axiom',
      description: 'Axiom: a JEV-powered study planner that turns your syllabus, goals, and deadlines into a personalized, color-coded study schedule.',
      githubUrl: 'https://github.com/loserharsh/axiom',
      language: 'JavaScript'
    },
    {
      name: 'databaseditative',
      description: 'Database Detective: An investigative desktop mystery game where players query SQL databases to solve crimes.',
      githubUrl: 'https://github.com/loserharsh/web-dev/tree/main/project/databaseditative',
      language: 'SQL / JS'
    },
    {
      name: 'jev-by-harsh',
      description: 'What is JEV? A breakdown of its architecture, algorithmic reasoning, and neural decision workflows.',
      githubUrl: 'https://github.com/loserharsh/jev-by-harsh',
      language: 'Python'
    },
    {
      name: 'manim',
      description: 'Animation engine for mathematical visualization, explanatory videos, and algorithmic geometry.',
      githubUrl: 'https://github.com/loserharsh/manim',
      language: 'Python'
    },
    {
      name: 'stock_exchange',
      description: 'Simulated electronic stock exchange and limit order book matching engine with real-time order processing.',
      githubUrl: 'https://github.com/loserharsh/stock_exchange',
      language: 'Python / C++'
    },
    {
      name: 'gotee',
      description: 'A fast, lightweight Go terminal utility and stream pipe multiplexer experiment.',
      githubUrl: 'https://github.com/loserharsh/gotee',
      language: 'Go'
    },
    {
      name: 'learing-manim',
      description: 'Mathematical laboratory for programmatic motion graphics, LaTeX coordinate transforms, and visual proofs.',
      githubUrl: 'https://github.com/loserharsh/learing-manim',
      language: 'Python'
    },
    {
      name: 'loserharsh.github.io',
      description: 'Personal portfolio website showcasing engineering chronicles, fastfetch terminal OS, and creative dev experiments.',
      githubUrl: 'https://github.com/loserharsh/loserharsh.github.io',
      language: 'JavaScript'
    }
  ];

  // Map Git repositories to ProjectCard instances with assigned artwork
  const DEFAULT_PROJECTS = ALL_GIT_REPOS.map((repo, i) => {
    return new ProjectCard({
      id: repo.name,
      name: repo.name,
      description: repo.description,
      githubUrl: repo.githubUrl,
      language: repo.language,
      image: BOOKMARK_IMAGES[i % BOOKMARK_IMAGES.length]
    });
  });

  // Showcase Runtime State
  let rafId = null;
  let scrollX = 0;
  let singleSetWidth = 0;
  let isHovered = false;
  let expandedCardEl = null;
  let expandedSide = null;
  let currentTrackEl = null;

  const MARQUEE_SPEED = 0.45; // Slow right-to-left drift (px per frame)
  const CLONE_SETS = 3;       // Cycle all 13 git projects seamlessly

  /**
   * Update centered 3-line overlay typography
   */
  function updateCenterHud(eyebrow, title, sub) {
    const eyebrowEl = document.getElementById('showcaseHudEyebrow');
    const titleEl = document.getElementById('showcaseHudTitle');
    const subEl = document.getElementById('showcaseHudSub');

    if (eyebrowEl && eyebrowEl.textContent !== eyebrow) eyebrowEl.textContent = eyebrow;
    if (titleEl && titleEl.textContent !== title) titleEl.textContent = title;
    if (subEl && subEl.textContent !== sub) subEl.textContent = sub;
  }

  /**
   * Viewport Section Metrics (Invisible Boundaries)
   * - Left zone: 0 to 22% (cards drift through)
   * - Middle zone ("can open card"): 22% to 78% (56vw wide, cards can open)
   * - Right zone: 78% to 100% (cards drift through)
   * - Midline: 50% (determines open direction inside middle zone)
   */
  const ZONE_LEFT_RATIO = 0.22;   // 22% from left (~20-25%)
  const ZONE_RIGHT_RATIO = 0.78;  // 78% from left (~20-25%)
  const MIDLINE_RATIO = 0.50;     // Center midline (50%)

  function getShowcaseMetrics() {
    const vw = window.innerWidth;
    const zoneLeft = vw * ZONE_LEFT_RATIO;
    const zoneRight = vw * ZONE_RIGHT_RATIO;
    const midline = vw * MIDLINE_RATIO;
    const midSectionWidth = zoneRight - zoneLeft;
    return { vw, zoneLeft, zoneRight, midline, midSectionWidth };
  }

  /**
   * Determine if a card is currently inside the middle "can open" section
   * and which side of the center midline it occupies ('mid' | 'right' | 'left' | null)
   */
  function getCardOpenZone(cardEl) {
    if (!cardEl || !currentTrackEl) return null;
    const trackRect = currentTrackEl.getBoundingClientRect();
    const cardBaseW = cardEl.offsetWidth || 135;
    const currentLeft = trackRect.left + cardEl.offsetLeft;
    const center = currentLeft + cardBaseW / 2;
    const { vw, midline } = getShowcaseMetrics();

    // Hit box for opening cards:
    // Left boundary: ~18%
    // Right boundary: ~86% (generous hit box on right as requested)
    const isWithinOpen = (center >= vw * 0.18) && (center <= vw * 0.86);
    if (!isWithinOpen) {
      return null;
    }

    const distFromMid = center - midline;
    if (Math.abs(distFromMid) <= 35) {
      return 'mid'; // At the midline
    } else if (distFromMid > 35) {
      return 'right'; // Right of midline
    } else {
      return 'left'; // Left of midline
    }
  }

  /**
   * Dynamically update data-can-open and data-side on all visible cards
   */
  function updateCardsOpenState() {
    if (!currentTrackEl) return;
    const allCards = currentTrackEl.querySelectorAll('.showcase-card');
    const { vw, midline } = getShowcaseMetrics();
    const trackRect = currentTrackEl.getBoundingClientRect();

    allCards.forEach((card) => {
      if (card === expandedCardEl) return;
      const cardBaseW = card.offsetWidth || 135;
      const currentLeft = trackRect.left + card.offsetLeft;
      const center = currentLeft + cardBaseW / 2;
      const canOpen = (center >= vw * 0.18) && (center <= vw * 0.86);
      card.dataset.canOpen = canOpen ? 'true' : 'false';

      if (canOpen) {
        const distFromMid = center - midline;
        if (Math.abs(distFromMid) <= 35) {
          card.dataset.side = 'mid';
        } else if (distFromMid > 35) {
          card.dataset.side = 'right';
        } else {
          card.dataset.side = 'left';
        }
      } else {
        card.dataset.side = '';
        if (card.classList.contains('is-hovered')) {
          card.classList.remove('is-hovered');
        }
      }
    });
  }

  /**
   * Collapse any currently expanded card and resume marquee
   */
  function collapseAllCards() {
    if (!currentTrackEl) return;
    const sectionEl = currentTrackEl.closest('.projects-showcase-section');
    const allCards = currentTrackEl.querySelectorAll('.showcase-card');
    const prevExpanded = expandedCardEl;

    allCards.forEach((card) => {
      card.classList.remove('is-expanded');
      card.setAttribute('aria-expanded', 'false');
      card.style.setProperty('--shift-x', '0px');
    });

    if (sectionEl) {
      sectionEl.classList.remove('has-expanded-card');
    }

    // Preserve direction class on the collapsing card until width shrinks back
    // so columns don't swap and text doesn't jitter while closing
    if (prevExpanded) {
      setTimeout(() => {
        prevExpanded.classList.remove('expand-right', 'expand-left');
      }, 700);
    }

    expandedCardEl = null;
    expandedSide = null;

    if (!isHovered) {
      updateCenterHud(DEFAULT_HUD.eyebrow, DEFAULT_HUD.title, DEFAULT_HUD.sub);
    }
  }

  /**
   * Expand Card Covering Entire Middle Section:
   * - Right of midline: Card opens to LEFT, art on right, info on left, covers middle section.
   * - Left of midline: Card opens to RIGHT, art on left, info on right, covers middle section.
   * - Mid of section: Card moves to left start of middle section, opens to RIGHT, covering all of mid.
   * - Left neighbours stay packed before 22% (left zone).
   * - Right neighbours stay packed after 78% (right zone).
   */
  function expandCard(targetCard) {
    if (!currentTrackEl || !targetCard) return;

    const sectionEl = currentTrackEl.closest('.projects-showcase-section');
    const allCards = Array.from(currentTrackEl.querySelectorAll('.showcase-card'));
    const targetIndex = allCards.indexOf(targetCard);
    if (targetIndex === -1) return;

    const openZone = getCardOpenZone(targetCard);
    if (!openZone) return; // Cannot open outside middle section

    // Reset previous states
    allCards.forEach((c) => {
      c.classList.remove('is-expanded', 'expand-right', 'expand-left');
      c.setAttribute('aria-expanded', 'false');
      c.style.setProperty('--shift-x', '0px');
    });

    const { zoneLeft, zoneRight, midSectionWidth } = getShowcaseMetrics();
    const trackRect = currentTrackEl.getBoundingClientRect();
    const currentLeft = trackRect.left + targetCard.offsetLeft;

    if (sectionEl) {
      sectionEl.style.setProperty('--mid-section-w', `${midSectionWidth}px`);
      sectionEl.classList.add('has-expanded-card');
    }

    expandedCardEl = targetCard;
    expandedSide = openZone;

    targetCard.dataset.side = openZone;
    targetCard.setAttribute('aria-expanded', 'true');

    // Direction assignment:
    // - Right card: opens to LEFT (art on right, info on left) -> 'expand-left'
    // - Left card: opens to RIGHT (art on left, info on right) -> 'expand-right'
    // - Mid card: moves to left of mid section, opens to RIGHT -> 'expand-right'
    const isExpandLeft = (openZone === 'right');
    targetCard.classList.add('is-expanded', isExpandLeft ? 'expand-left' : 'expand-right');

    // Mathematical shift to anchor card's left at zoneLeft and span to zoneRight
    const targetShift = zoneLeft - currentLeft;

    allCards.forEach((card) => {
      card.style.setProperty('--shift-x', `${targetShift}px`);
    });

    updateCenterHud(
      targetCard.dataset.eyebrow || DEFAULT_HUD.eyebrow,
      targetCard.dataset.title || DEFAULT_HUD.title,
      'ESC TO CLOSE'
    );
  }

  /**
   * Measure track metrics for seamless wrapping
   */
  function measureTrackMetrics(projectsCount) {
    if (!currentTrackEl || projectsCount === 0) return;
    const allCards = currentTrackEl.querySelectorAll('.showcase-card');
    if (allCards.length < projectsCount * 2) return;

    const firstCard = allCards[0];
    const secondSetFirstCard = allCards[projectsCount];
    const dist = secondSetFirstCard.offsetLeft - firstCard.offsetLeft;

    if (dist > 0) {
      const wasUninitialized = singleSetWidth === 0;
      singleSetWidth = dist;
      if (wasUninitialized) {
        scrollX = -singleSetWidth;
        currentTrackEl.style.transform = `translate3d(${scrollX}px, 0, 0)`;
      }
    }
  }

  /**
   * Slow continuous right-to-left marquee loop
   */
  function startMarqueeLoop(projectsCount) {
    if (rafId) cancelAnimationFrame(rafId);

    function step() {
      if (currentTrackEl && !isHovered && !expandedCardEl && singleSetWidth > 0) {
        scrollX -= MARQUEE_SPEED;

        if (scrollX <= -singleSetWidth * 2) {
          scrollX += singleSetWidth;
        }

        currentTrackEl.style.transform = `translate3d(${scrollX}px, 0, 0)`;
        updateCardsOpenState();
      }
      rafId = requestAnimationFrame(step);
    }

    rafId = requestAnimationFrame(step);
  }

  /**
   * Bind hover, click, and keyboard listeners
   */
  function bindShowcaseEvents(trackEl, projectsCount) {
    const allCards = Array.from(trackEl.querySelectorAll('.showcase-card'));

    allCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        // Only trigger hover highlight if card is currently in the open section
        if (card.dataset.canOpen !== 'true') return;

        isHovered = true;
        const openZone = getCardOpenZone(card);
        card.dataset.side = openZone || '';

        allCards.forEach((c) => {
          if (c !== card) c.classList.remove('is-hovered');
        });
        card.classList.add('is-hovered');

        if (!expandedCardEl) {
          updateCenterHud(
            card.dataset.eyebrow || DEFAULT_HUD.eyebrow,
            card.dataset.title || DEFAULT_HUD.title,
            '[ CLICK TO EXPAND ]'
          );
        }
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-hovered');
        if (!expandedCardEl) {
          isHovered = false;
          updateCenterHud(DEFAULT_HUD.eyebrow, DEFAULT_HUD.title, DEFAULT_HUD.sub);
        }
      });

      card.addEventListener('click', (e) => {
        if (e.target.closest('.ticket-link-btn') || e.target.closest('a')) {
          return; // Let the repo link open in new tab
        }

        if (e.target.closest('[data-action="close-card"]')) {
          e.stopPropagation();
          collapseAllCards();
          return;
        }

        if (expandedCardEl === card) {
          collapseAllCards();
          return;
        }

        // Only cards in the middle open section can open
        if (card.dataset.canOpen !== 'true') {
          return;
        }

        expandCard(card);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('.ticket-link-btn') || e.target.closest('[data-action="close-card"]')) {
            return;
          }
          e.preventDefault();
          if (expandedCardEl === card) {
            collapseAllCards();
          } else if (card.dataset.canOpen === 'true') {
            expandCard(card);
          }
        }
      });
    });

    const sectionEl = trackEl.closest('.projects-showcase-section');
    if (sectionEl && !sectionEl.dataset.showcaseBound) {
      sectionEl.dataset.showcaseBound = 'true';

      sectionEl.addEventListener('mouseleave', () => {
        isHovered = false;
        if (!expandedCardEl) {
          updateCenterHud(DEFAULT_HUD.eyebrow, DEFAULT_HUD.title, DEFAULT_HUD.sub);
        }
      });

      sectionEl.addEventListener('click', (e) => {
        if (expandedCardEl && !e.target.closest('.showcase-card')) {
          collapseAllCards();
        }
      });
    }

    if (!window.__showcaseGlobalBound) {
      window.__showcaseGlobalBound = true;

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && expandedCardEl) {
          collapseAllCards();
        }
      });

      window.addEventListener('resize', () => {
        const list = window.PROJECTS_DATA || DEFAULT_PROJECTS;
        measureTrackMetrics(list.length);
        if (expandedCardEl) {
          expandCard(expandedCardEl);
        } else {
          updateCardsOpenState();
        }
      });
    }

    requestAnimationFrame(() => {
      measureTrackMetrics(projectsCount);
      updateCardsOpenState();
      startMarqueeLoop(projectsCount);
    });
  }

  /**
   * Render projects array to the showcase track
   */
  function renderProjects(containerId = 'projectsGrid', projectsList = window.PROJECTS_DATA) {
    const trackEl = document.getElementById(containerId);
    if (!trackEl) return;

    currentTrackEl = trackEl;
    expandedCardEl = null;
    expandedSide = null;
    singleSetWidth = 0;

    const list = projectsList && projectsList.length ? projectsList : DEFAULT_PROJECTS;

    const repeatedCardsHtml = [];
    let globalIndex = 0;
    for (let setIdx = 0; setIdx < CLONE_SETS; setIdx++) {
      for (let i = 0; i < list.length; i++) {
        repeatedCardsHtml.push(list[i].renderHTML(globalIndex++));
      }
    }

    trackEl.innerHTML = repeatedCardsHtml.join('');
    bindShowcaseEvents(trackEl, list.length);
  }

  /**
   * Optionally fetch fresh repos from GitHub live
   */
  async function fetchLiveGitRepos() {
    try {
      const res = await fetch('https://api.github.com/users/loserharsh/repos?sort=updated&per_page=100');
      if (!res.ok) return;
      const repos = await res.json();
      if (!Array.isArray(repos) || repos.length === 0) return;

      const updatedList = repos.map((r, i) => {
        return new ProjectCard({
          id: r.name,
          name: r.name,
          description: r.description || `GitHub repository by loserharsh in ${r.language || 'Code'}.`,
          githubUrl: r.html_url,
          language: r.language || 'Code',
          image: BOOKMARK_IMAGES[i % BOOKMARK_IMAGES.length],
          stars: r.stargazers_count || 0
        });
      });

      window.PROJECTS_DATA = updatedList;
      renderProjects('projectsGrid', updatedList);
    } catch (e) {
      // Fallback is already loaded
    }
  }

  // Export to window
  window.ProjectCard = ProjectCard;
  window.PROJECTS_DATA = DEFAULT_PROJECTS;
  window.renderProjects = renderProjects;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderProjects();
      fetchLiveGitRepos();
    });
  } else {
    renderProjects();
    fetchLiveGitRepos();
  }
})();
