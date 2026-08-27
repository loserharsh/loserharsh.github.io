/**
 * ==========================================================================
 * PROJECT SPEC CARDS ENGINE (TEMPLATE & CLASS SYSTEM)
 * ==========================================================================
 * Allows creating physical hangtag spec cards dynamically via the ProjectCard
 * class with custom attributes (name, hours spent, languages, commits, etc.)
 */

(function () {
  'use strict';

  // Segment colors cycling palette
  const SEGMENT_COLORS = ['seg-primary', 'seg-secondary', 'seg-accent', 'seg-muted'];

  /**
   * ProjectCard Class
   * Blueprint for creating physical hangtag project cards
   */
  class ProjectCard {
    /**
     * @param {Object} config
     * @param {string} config.name - Project Name (e.g. 'LANDAGER CLOUD')
     * @param {number|string} config.hoursSpent - Hours build time (e.g. 17.26 or '17.26')
     * @param {number|string} [config.commits] - Total commits (e.g. 873 or '873')
     * @param {string} [config.category] - Tagline/category (e.g. 'ENTERPRISE SAAS')
     * @param {string} [config.topHeader] - Top meta text header
     * @param {string} [config.glyphStamp='⊕ ⊗ ⊙ ⊚'] - Decorative glyph stamp
     * @param {Array<{label: string, value: string}>} [config.breakdowns=[]] - 4-column time/task breakdown
     * @param {Array<{name: string, percentage: number, colorClass?: string}>} [config.languages=[]] - Language distribution
     * @param {boolean} [config.spanTwo=false] - Whether card spans 2 columns in the grid
     * @param {string} [config.githubUrl] - GitHub repository link
     * @param {string} [config.liveUrl] - Live demo/deployment link
     */
    constructor({
      name = 'UNTITLED PROJECT',
      hoursSpent = '0.00',
      commits = null,
      category = 'SOFTWARE SPEC',
      topHeader = 'TOTAL REFACTOR TIME CALCULATED BY KAIZEN REPO ENGINE // V2.4',
      glyphStamp = '⊕ ⊗ ⊙ ⊚',
      breakdowns = [],
      languages = [],
      spanTwo = false,
      githubUrl = '',
      liveUrl = ''
    } = {}) {
      this.name = name;
      this.hoursSpent = hoursSpent;
      this.commits = commits;
      this.category = category;
      this.topHeader = topHeader;
      this.glyphStamp = glyphStamp;
      this.breakdowns = breakdowns;
      this.languages = languages;
      this.spanTwo = Boolean(spanTwo);
      this.githubUrl = githubUrl;
      this.liveUrl = liveUrl;
    }

    /**
     * Generate language segment HTML markup
     * @returns {string}
     */
    renderLanguageGraph() {
      if (!this.languages || this.languages.length === 0) return '';

      const segmentsHtml = this.languages
        .map((lang, index) => {
          const colorClass = lang.colorClass || SEGMENT_COLORS[index % SEGMENT_COLORS.length];
          const pct = Math.max(0, Math.min(100, lang.percentage || 0));
          return `<div class="lang-seg ${colorClass}" style="width: ${pct}%;"></div>`;
        })
        .join('');

      const legendHtml = this.languages
        .map((lang) => {
          const pct = Math.max(0, Math.min(100, lang.percentage || 0));
          return `
            <div class="legend-item" style="width: ${pct}%;">
              <span class="leg-percent">${pct}%</span>
              <span class="leg-lang font-mono">${lang.name}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div class="tag-lang-graph">
          <div class="lang-bar-segments">
            ${segmentsHtml}
          </div>
          <div class="lang-bar-legend font-mono">
            ${legendHtml}
          </div>
        </div>
      `;
    }

    /**
     * Generate 4-column breakdown HTML markup
     * @returns {string}
     */
    renderBreakdowns() {
      if (!this.breakdowns || this.breakdowns.length === 0) return '';

      const colsHtml = this.breakdowns
        .map(
          (b) => `
          <div class="breakdown-col">
            <span class="b-lbl">${b.label}</span>
            <span class="b-val">${b.value}</span>
          </div>
        `
        )
        .join('');

      return `<div class="tag-breakdown-row font-mono">${colsHtml}</div>`;
    }

    /**
     * Generate complete Hangtag Card HTML String
     * @returns {string}
     */
    renderHTML() {
      const spanClass = this.spanTwo ? 'card-span-2' : '';
      const commitsText = this.commits
        ? `${typeof this.commits === 'number' ? this.commits.toLocaleString() : this.commits} COMMITS`
        : '';
      const subMeta = [commitsText, this.category].filter(Boolean).join(' // ');

      return `
        <article class="project-spec-tag ${spanClass} spring-project-card anime-scroll-item">
          <!-- Grommet Eyelet & String Cord -->
          <div class="tag-eyelet-wrap" aria-hidden="true">
            <div class="tag-eyelet"></div>
            <svg class="tag-string-svg" viewBox="0 0 160 80" fill="none">
              <path d="M10 40 C 45 10, 95 65, 155 35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M10 40 C 55 70, 110 20, 158 55" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"/>
            </svg>
          </div>

          <!-- Top Tag Meta Header -->
          <div class="tag-top-header font-mono">
            <span>${this.topHeader}</span>
          </div>

          <!-- Main Tag Hero Row: Time + Project Name & Glyph Stamp -->
          <div class="tag-hero-row">
            <div class="tag-time-group">
              <span class="tag-time-val font-heading">${this.hoursSpent}</span>
              <span class="tag-time-unit font-mono">hrs build</span>
            </div>

            <div class="tag-project-meta font-mono">
              <div class="tag-glyph-stamp font-mono">${this.glyphStamp}</div>
              <div class="tag-name-col">
                <span class="tag-meta-lbl">PROJECT NAME</span>
                <h3 class="tag-project-name font-heading">${this.name}</h3>
                ${subMeta ? `<span class="tag-spec-sub">${subMeta}</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Middle Breakdown Row -->
          ${this.renderBreakdowns()}

          <!-- Bottom Segmented Language Bar Graph -->
          ${this.renderLanguageGraph()}
        </article>
      `;
    }

    /**
     * Create DOM element directly
     * @returns {HTMLElement}
     */
    createDOMElement() {
      const template = document.createElement('template');
      template.innerHTML = this.renderHTML().trim();
      return template.content.firstElementChild;
    }
  }

  /**
   * Default Projects Dataset
   * Fully configured with initial projects
   */
  const DEFAULT_PROJECTS = [
    new ProjectCard({
      name: 'windows copy',
      hoursSpent: '35.272',
      commits: '27',
      category: 'GAMELIKE',
      topHeader: 'Database Detective',
      glyphStamp: '⊕ ⊗ ⊙ ⊚',
      spanTwo: true,
      breakdowns: [
        { label: 'FRONTEND // CSS & html', value: '8.94 hrs' },
        { label: 'BACKEND // javascript', value: '27.51 hrs' },
        { label: 'DATABASE // non', value: '2.76 hrs' },
        { label: 'DEVOPS // non', value: '1.03 hrs' }
      ],
      languages: [
        { name: 'javascript ', percentage: 75, colorClass: 'seg-primary' },
        { name: 'HTML5', percentage: 3, colorClass: 'seg-secondary' },
        { name: 'css', percentage: 16, colorClass: 'seg-accent' },
        { name: 'Docker', percentage: 6, colorClass: 'seg-muted' }
      ]
    }),

    // new ProjectCard({
    //   name: 'XINE TELEMETRY',
    //   hoursSpent: '84.50',
    //   commits: '1,240',
    //   category: 'WEBSOCKETS',
    //   topHeader: 'REAL-TIME TELEMETRY ENGINE // BENCHMARK 0.4MS',
    //   glyphStamp: '⊕ ⊗ ⊙ ⊚',
    //   spanTwo: false,
    //   breakdowns: [
    //     { label: 'SOCKETS', value: '42.10 hrs' },
    //     { label: 'REDIS CACHE', value: '18.25 hrs' },
    //     { label: 'RUST CORE', value: '14.75 hrs' },
    //     { label: 'E2E TESTS', value: '9.40 hrs' }
    //   ],
    //   languages: [
    //     { name: 'TypeScript', percentage: 68, colorClass: 'seg-primary' },
    //     { name: 'WebSockets', percentage: 14, colorClass: 'seg-secondary' },
    //     { name: 'Rust / Wasm', percentage: 12, colorClass: 'seg-accent' },
    //     { name: 'Go', percentage: 6, colorClass: 'seg-muted' }
    //   ]
    // }),

    // new ProjectCard({
    //   name: 'SAHARA COMMERCE',
    //   hoursSpent: '48.15',
    //   commits: '612',
    //   category: 'GRAPHQL',
    //   topHeader: 'HEADLESS STOREFRONT // SUB-SECOND CHECKOUT',
    //   glyphStamp: '⊕ ⊗ ⊙ ⊚',
    //   spanTwo: false,
    //   breakdowns: [
    //     { label: 'GRAPHQL', value: '22.40 hrs' },
    //     { label: 'STOREFRONT', value: '15.10 hrs' },
    //     { label: 'SHOPIFY API', value: '6.85 hrs' },
    //     { label: 'EDGE WORKERS', value: '3.80 hrs' }
    //   ],
    //   languages: [
    //     { name: 'Next.js 15', percentage: 58, colorClass: 'seg-primary' },
    //     { name: 'GraphQL', percentage: 24, colorClass: 'seg-secondary' },
    //     { name: 'Tailwind', percentage: 12, colorClass: 'seg-accent' },
    //     { name: 'Shopify', percentage: 6, colorClass: 'seg-muted' }
    //   ]
    // }),

    new ProjectCard({
      name: 'FULL STACK',
      hoursSpent: '110.4',
      commits: '117',
      category: 'WEBGL / WASM',
      topHeader: 'learning full stack webdev',
      glyphStamp: '⊕ ⊗ ⊙ ⊚',
      spanTwo: true,
      breakdowns: [
        { label: 'JAVASCRIPT', value: '45.2 hrs' },
        { label: 'CSS', value: '30.6 hrs' },
        { label: 'HTML', value: '25.4 hrs' },
      ],
      languages: [
        { name: 'CSS3 Animations', percentage: 72, colorClass: 'seg-primary' },
        { name: 'Canvas / WebGL', percentage: 20, colorClass: 'seg-secondary' },
        { name: 'TypeScript', percentage: 8, colorClass: 'seg-accent' },
      ]
    })
  ];

  /**
   * Render projects array to container
   * @param {string} containerId - Target container element ID
   * @param {ProjectCard[]} [projectsList] - List of ProjectCard instances
   */
  function renderProjects(containerId = 'projectsGrid', projectsList = window.PROJECTS_DATA) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = (projectsList || window.PROJECTS_DATA).map((p) => p.renderHTML()).join('');

    // Re-bind spring hover interactions if main engine is active
    if (window.initSpringCards) {
      window.initSpringCards();
    }
  }

  /**
   * Helper function to add a new project card dynamically
   * @param {Object} projectConfig
   * @param {boolean} [autoRender=true]
   * @returns {ProjectCard}
   */
  function addProject(projectConfig, autoRender = true) {
    const card = new ProjectCard(projectConfig);
    window.PROJECTS_DATA.push(card);
    if (autoRender) {
      renderProjects('projectsGrid', window.PROJECTS_DATA);
    }
    return card;
  }

  // Export to window for global access and customization
  window.ProjectCard = ProjectCard;
  window.PROJECTS_DATA = DEFAULT_PROJECTS;
  window.renderProjects = renderProjects;
  window.addProject = addProject;

  // Auto-render on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderProjects());
  } else {
    renderProjects();
  }
})();
