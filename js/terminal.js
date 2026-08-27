// //*
//  * ==========================================================================
//  * WINDOWS TERMINAL CONFIGURATION & INTERACTIVE NOTEBOOK ENGINE
//  * ==========================================================================
//  *
//  * This is where the personal side of the system lives.
//  *
//  * Edit the text, headings, colors, and experiments below to change
//  * what the terminal says about me.
//  *
//  * COLOR TAG SYNTAX:
//  * Wrap any word or phrase in color tags to style it:
//  *
//  *   {green}your text{/green}    -> Neon Green
//  *   {cyan}your text{/cyan}      -> Tech Cyan
//  *   {orange}your text{/orange}  -> Vibrant Amber / Orange
//  *   {pink}your text{/pink}      -> Manga Coral / Pink
//  *   {purple}your text{/purple}  -> Electric Violet
//  *   {yellow}your text{/yellow}  -> Spec Yellow
//  *   {accent}your text{/accent}  -> Kaizen Accent Color
//  *   {white}your text{/white}    -> Bright High-Contrast White
//  *   {muted}your text{/muted}    -> Subtle Monospace Gray
//  */

window.TERMINAL_ABOUT_CONFIG = {

  // Terminal Version Header
  version: "PowerShell 7.6.3",

  // Left ASCII Art
  asciiArt: `
                    ......
                ..-***++::::....
            .+===*++--:++-----....
         .+==%==**-:.::..:--++:::..
       .%%%@%%++---:......--++-::...
     .+=%%@++++::.........::**---....
    .====*++::::....     .:==+++::...
   .==**--+::...       .:===**:::...
  .**++::-....        ::%%***--:...
 ..**--......        .:@@@==*---....
 .:++::.....      ::@@@===*---....
...+++.....    ::+@@@===*+--.....
..:::------:::-=%%%====++++......
 ...---+++***==****=+--++......
  ...:::---+++***-----.......
   ......:::::::--:........
     ..................
       ..........
  `,

  // Main Greeting Heading
  greeting: "Hey, {white}Harshwardhan{/white}",

  // About Me & Personal Notebook Sections
  sections: [

    {
      title: "── About Me ─────────────────────────────────────────",
      titleColor: "cyan",

      content:
        "I'm Harshwardhan, a {purple}CS guy{/purple} who likes making things. " +
        "I code, draw, edit, experiment, play, and occasionally build " +
        "something just because I wondered if I could."
    },

    {

      title: "── What I Do ─────────────────────────────────────────",
      titleColor: "green",

      rows: [
        {
          label: "CODE",
          labelColor: "green",
          val: "Web development, Python, C++, JavaScript & DSA."
        },

        {
          label: "CREATE",
          labelColor: "green",
          val: "Drawing, editing, UI, animation & visual experiments."
        },

        {
          label: "EXPLORE",
          labelColor: "green",
          val: "AI, ML, new technologies & whatever looks interesting."
        },

        {
          label: "PLAY",
          labelColor: "green",
          val: "Games, interactive experiences & breaking things to see how they work."
        }
      ]

    },

    {

      title: "── How I Build ───────────────────────────────────────",
      titleColor: "yellow",

      content:
        "I don't really like staying inside one box. " +
        "Some ideas start as code, some start as visuals, and some " +
        "start with absolutely no plan. I build them, break them, " +
        "figure out why they broke, and make the next version better."
    },

    {

      title: "── Current Focus ─────────────────────────────────────",
      titleColor: "yellow",

      rows: [

        {
          label: "AI/ML",
          labelColor: "green",
          val: "Machine learning, AI tools & experimentation."
        },

        {
          label: "CODE",
          labelColor: "green",
          val: "{muted}Python{/muted}, {accent}C++{/accent}, JavaScript & problem solving."
        },

        {
          label: "WEB",
          labelColor: "green",
          val: "Interactive websites, creative interfaces & frontend experiments."
        },

        {
          label: "DSA",
          labelColor: "green",
          val: "Data structures, algorithms & problem solving."
        },

        {
          label: "CREATIVE",
          labelColor: "green",
          val: "Drawing, editing, animation, Manim & visual experiments."
        }

      ]

    },

    {

      title: "── The Messy Part ────────────────────────────────────",
      titleColor: "pink",

      content:
        "Not everything I make has a purpose. Some things are experiments. " +
        "Some are weird. Some are probably unnecessary. That's kind of the point."
    },

    {

      title: "── Session Telemetry ─────────────────────────────────",
      titleColor: "purple",

      rows: [

        {
          label: "SESSION",
          labelColor: "yellow",
          val: "{green}404{/green} // Brain.exe Not Responding.."
        },

        {
          label: "UPTIME",
          labelColor: "yellow",
          val: "??? // Somehow Still Running"
        }
      ]

    }

  ],

  // Bottom Quote
  quote: "Make something. Break something. Learn something. Repeat.",

  // Terminal Color Dots
  paletteDots: [
    '#f8fafc',
    '#38bdf8',
    '#3b82f6',
    '#c084fc',
    '#facc15',
    '#4ade80',
    '#f43f5e'
  ],

  // Prompt Line Path
  promptUser: "PS C:\\Users\\Harsh>"

};

(function () {
  'use strict';

  // Helper to parse {color}word{/color} tags into HTML spans
  function parseColorTags(text) {
    if (!text) return '';
    return text
      .replace(/\{green\}(.*?)\{\/green\}/g, '<span class="term-c-green">$1</span>')
      .replace(/\{cyan\}(.*?)\{\/cyan\}/g, '<span class="term-c-cyan">$1</span>')
      .replace(/\{orange\}(.*?)\{\/orange\}/g, '<span class="term-c-orange">$1</span>')
      .replace(/\{pink\}(.*?)\{\/pink\}/g, '<span class="term-c-pink">$1</span>')
      .replace(/\{purple\}(.*?)\{\/purple\}/g, '<span class="term-c-purple">$1</span>')
      .replace(/\{yellow\}(.*?)\{\/yellow\}/g, '<span class="term-c-yellow">$1</span>')
      .replace(/\{accent\}(.*?)\{\/accent\}/g, '<span class="term-c-accent">$1</span>')
      .replace(/\{white\}(.*?)\{\/white\}/g, '<span class="term-c-white">$1</span>')
      .replace(/\{muted\}(.*?)\{\/muted\}/g, '<span class="term-c-muted">$1</span>');
  }

  // Render Dynamic Read-Only Tab 1 View from Configuration
  function renderMainTerminalTab() {
    const container = document.getElementById('tab-pwsh-main');
    if (!container) return;

    const cfg = window.TERMINAL_ABOUT_CONFIG;

    let sectionsHtml = '';
    if (cfg.sections && Array.isArray(cfg.sections)) {
      cfg.sections.forEach((sec) => {
        let secBody = '';
        if (sec.content) {
          secBody = `<div class="term-bio-sentence font-mono">${parseColorTags(sec.content)}</div>`;
        } else if (sec.rows && Array.isArray(sec.rows)) {
          secBody = sec.rows.map((r) => `
            <div class="spec-row-term">
              <span class="term-lbl-${r.labelColor || 'green'}">${r.label}</span>
              <span class="term-val-white">${parseColorTags(r.val)}</span>
            </div>
          `).join('');
        }

        sectionsHtml += `
          <div class="term-boxed-spec">
            <div class="box-title-tag title-${sec.titleColor || 'cyan'} font-mono">${sec.title}</div>
            ${secBody}
            <div class="box-bottom-line">─────────────────────────────────────────────────────</div>
          </div>
        `;
      });
    }

    const dotsHtml = (cfg.paletteDots || []).map((dotColor) => `
      <span class="p-dot" style="background-color: ${dotColor};"></span>
    `).join('');

    container.innerHTML = `
      <div class="term-version-banner font-mono">${cfg.version}</div>

      <div class="term-split-grid">
        
        <!-- Left: ASCII Art Graphic -->
        <div class="term-ascii-col">
          <pre class="term-ascii-art font-mono">${cfg.asciiArt}</pre>
        </div>

        <!-- Right: Bio & Profile Sentences -->
        <div class="term-info-col font-mono">
          
          <div class="term-greeting">
            <span>${parseColorTags(cfg.greeting)}</span>
          </div>

          ${sectionsHtml}

          <!-- Quote & Palette Dots -->
          <div class="term-quote font-mono">
            <span class="quote-text">${parseColorTags(cfg.quote)}</span>
            <div class="palette-dots">
              ${dotsHtml}
            </div>
          </div>

        </div>

      </div>

      <!-- Terminal Command Prompt Line -->
      <div class="term-bottom-prompt font-mono">
        <span class="prompt-user">${cfg.promptUser}</span>
        <span class="term-cursor-blink">_</span>
      </div>
    `;
  }

  function initTerminalEngine() {
    renderMainTerminalTab();

    const tabsContainer = document.getElementById('terminalTabs');
    const newTabBtn = document.getElementById('terminalNewTabBtn');

    let tabCounter = 1;

    // Available commands for interactive notebook
    const COMMANDS = {
      help: `AVAILABLE COMMANDS:
  help      - Display this help manual
  whoami    - Show current developer profile
  about     - Overview of my work & philosophy
  skills    - List things I build, explore & experiment with
  projects  - List featured projects & experiments
  contact   - Contact routes & social links
  clear     - Clear terminal buffer
  date      - Print current system date & time
  neofetch  - Re-render system profile display
  notes     - Read / write quick developer notes`,

      whoami: `HARSHWARDHAN KAILASIA // CS GUY
Location: Gwalior, India
Status: Online // Building, experimenting & learning`,

      about: `PHILOSOPHY: BUILD // BREAK // LEARN // REPEAT.
I like turning random ideas into things I can actually interact with.
Sometimes that's code. Sometimes it's a drawing, an edit, an animation,
a game, or an experiment. I don't really like staying inside one box.`,

      skills: `CURRENT ARSENAL:
  [ CODE     ]  Python, C++, JavaScript, HTML, CSS, DSA
  [ WEB      ]  Interactive websites, creative interfaces & frontend experiments
  [ AI       ]  AI tools, machine learning & experimentation
  [ CREATIVE ]  Drawing, editing, animation, Manim & visual experiments
  [ BUILD    ]  Interactive experiences, UI experiments & random ideas
  [ PLAY     ]  Games, game-like interfaces & exploring how things work`,

      projects: `SELECTED CHRONICLES:
  01. WINDOWS COPY       - Game-like Windows-inspired interactive experience
                           35.272 hrs // 17 commits
  02. MORE INCOMING      - Experiments currently being built
  03. CLASSIFIED         - Idea.exe is still running...
  04. ???                - Probably another unnecessary project`,

      contact: `DIRECT DISPATCH:
  Email: harshwardhan1617@gmail.com
  Alternate: harshwardhan@kailasia.com
  GitHub: github.com/loserharsh
  Location: Gwalior, India`,

      date: () => `Current System Timestamp: ${new Date().toISOString()}`,

      neofetch: () => {
        renderMainTerminalTab();
        return `[OK] Neofetch profile reloaded.`;
      },

      notes: `--- HARSHWARDHAN'S NOTEBOOK [LIVE SCRATCHPAD] ---
1. Build something worth remembering.
2. Learn something I don't understand yet.
3. Break it. Figure out why. Fix it.
(Type anything to append notes to this session buffer)`
    };

    // Tab Switching
    function switchTab(targetTabId) {
      document.querySelectorAll('.term-tab').forEach((t) => {
        t.classList.toggle('active', t.getAttribute('data-tab') === targetTabId);
      });

      document.querySelectorAll('.terminal-tab-content').forEach((c) => {
        const isActive = c.getAttribute('id') === targetTabId;
        c.classList.toggle('active', isActive);
        if (isActive && targetTabId !== 'tab-pwsh-main') {
          focusCliInput();
        }
      });
    }

    // New Tab Creation
    function createNewNotebookTab() {
      tabCounter++;
      const newTabId = `tab-notebook-${tabCounter}`;

      // Create Tab Header
      const tabEl = document.createElement('div');
      tabEl.className = 'term-tab active';
      tabEl.setAttribute('data-tab', newTabId);
      tabEl.innerHTML = `
        <span class="tab-icon font-mono">PS</span>
        <span class="tab-title font-mono">notebook-${tabCounter}.ps1</span>
        <button class="tab-close-btn" aria-label="Close Tab">×</button>
      `;

      // Create Tab Content View
      const contentEl = document.createElement('div');
      contentEl.className = 'terminal-tab-content active';
      contentEl.id = newTabId;
      contentEl.innerHTML = `
        <div class="interactive-cli-view">
          <div class="cli-output font-mono"></div>
          <div class="cli-prompt-row font-mono">
            <span class="cli-prompt-path">PS C:\\Users\\Harsh\\notebooks></span>
            <input type="text" class="dynamic-cli-input" spellcheck="false" autocomplete="off" autofocus>
          </div>
        </div>
      `;

      // Deactivate other tabs
      document.querySelectorAll('.term-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.terminal-tab-content').forEach((c) => c.classList.remove('active'));

      // Append
      tabsContainer.insertBefore(tabEl, newTabBtn);
      document.querySelector('.terminal-window-body').appendChild(contentEl);

      // Wire Tab Click
      tabEl.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tab-close-btn')) {
          switchTab(newTabId);
        }
      });

      // Wire Tab Close
      tabEl.querySelector('.tab-close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        tabEl.remove();
        contentEl.remove();
        switchTab('tab-pwsh-main');
      });

      // Wire Interactive Input on dynamic tab
      const dynamicInput = contentEl.querySelector('.dynamic-cli-input');
      const dynamicOutput = contentEl.querySelector('.cli-output');

      if (dynamicInput) {
        dynamicInput.focus();
        dynamicInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const rawVal = dynamicInput.value.trim();
            const cmd = rawVal.toLowerCase();

            if (rawVal) {
              const cmdLine = document.createElement('div');
              cmdLine.className = 'cli-echo-line font-mono';
              cmdLine.innerHTML = `<span class="cli-prompt-path">PS C:\\Users\\Harsh\\notebooks></span> ${rawVal}`;
              dynamicOutput.appendChild(cmdLine);

              if (cmd === 'clear') {
                dynamicOutput.innerHTML = '';
              } else if (COMMANDS[cmd]) {
                const response = typeof COMMANDS[cmd] === 'function' ? COMMANDS[cmd]() : COMMANDS[cmd];
                const resLine = document.createElement('pre');
                resLine.className = 'cli-res-block font-mono';
                resLine.textContent = response;
                dynamicOutput.appendChild(resLine);
              } else {
                const noteLine = document.createElement('div');
                noteLine.className = 'cli-note-saved font-mono';
                noteLine.innerHTML = `<span class="text-accent">[NOTE SAVED]</span> ${rawVal}`;
                dynamicOutput.appendChild(noteLine);
              }

              dynamicInput.value = '';
              const winBody = document.querySelector('.terminal-window-body');
              if (winBody) {
                winBody.scrollTop = winBody.scrollHeight;
              }
            }
          }
        });
      }
    }

    const mainTab = document.querySelector('.term-tab[data-tab="tab-pwsh-main"]');
    if (mainTab) {
      mainTab.addEventListener('click', () => switchTab('tab-pwsh-main'));
    }

    if (newTabBtn) {
      newTabBtn.addEventListener('click', createNewNotebookTab);
    }

    function focusCliInput() {
      const activeInput = document.querySelector('.terminal-tab-content.active input');
      if (activeInput) {
        activeInput.focus();
      }
    }

    const terminalWindow = document.getElementById('terminalWindow');
    if (terminalWindow) {
      terminalWindow.addEventListener('click', () => {
        focusCliInput();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initTerminalEngine);
})();
