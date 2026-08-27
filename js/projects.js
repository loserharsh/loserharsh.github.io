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
      const targetUrl = this.githubUrl || this.liveUrl || 'https://github.com/loserharsh';
      const isLink = Boolean(targetUrl);
      const tagElement = isLink ? 'a' : 'article';
      const linkAttrs = isLink ? `href="${targetUrl}" target="_blank" rel="noopener noreferrer" aria-label="${this.name} repository"` : '';

      return `
        <${tagElement} ${linkAttrs} class="project-spec-tag ${spanClass} spring-project-card anime-scroll-item">
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
            ${targetUrl ? `<span class="tag-repo-badge font-mono"><svg class="tag-repo-ic" viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg> REPO <span class="tag-link-arrow">↗</span></span>` : ''}
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
                <h3 class="tag-project-name font-heading">${this.name} <span class="tag-name-arrow" aria-hidden="true">↗</span></h3>
                ${subMeta ? `<span class="tag-spec-sub">${subMeta}</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Middle Breakdown Row -->
          ${this.renderBreakdowns()}

          <!-- Bottom Segmented Language Bar Graph -->
          ${this.renderLanguageGraph()}
        </${tagElement}>
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
      hoursSpent: '35.27',
      commits: '27',
      category: 'GAMELIKE',
      topHeader: 'Database Detective',
      glyphStamp: '⊕ ⊗ ⊙ ⊚',
      spanTwo: true,
      githubUrl: 'https://github.com/loserharsh/web-dev/tree/main/project/databaseditative',
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

    new ProjectCard({
      name: 'FULL STACK',
      subMeta: 'learning full stack webdev',
      hoursSpent: '110.4',
      commits: '117',
      category: 'WEBGL / WASM',
      topHeader: 'learning full stack webdev',
      glyphStamp: '⊕ ⊗ ⊙ ⊚',
      spanTwo: true,
      githubUrl: 'https://github.com/loserharsh/web-dev',
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
