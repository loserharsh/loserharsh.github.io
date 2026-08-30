/**
 * ==========================================================================
 * BLOG ARCHIVE & CALENDAR SIDEBAR ENGINE
 * Dynamic manifest loading (posts/index.json) + Write / Import system.
 * Interactive Calendar Widget with Weekly, Monthly, and Range filters.
 * ==========================================================================
 */

(function () {
  'use strict';

  // Baseline fallback posts (when offline or file:// protocol prevents fetch)
  const DEFAULT_POSTS = [
    {
      slug: 'hello-world',
      title: 'Hello, World.',
      date: '2026-08-29',
      category: 'META · INTRO',
      tags: ['meta', 'intro'],
      dots: ['#3b82f6', '#f97316', '#ef4444'],
      excerpt: 'First post — what this space is for, and what I plan to write about.',
      host: true
    },
    {
      slug: 'building-this-site',
      title: 'Building This Site From Scratch',
      date: '2026-08-25',
      category: 'WEBDEV · CSS · DESIGN',
      tags: ['webdev', 'css', 'design'],
      dots: ['#f97316', '#3b82f6'],
      excerpt: 'No frameworks. No templates. Just HTML, CSS, and a lot of anime references. Here\'s how it came together.',
      host: true
    },
    {
      slug: 'why-i-like-terminal',
      title: 'Why I Live in the Terminal',
      date: '2026-07-20',
      category: 'TOOLS · LINUX · PRODUCTIVITY',
      tags: ['tools', 'linux', 'productivity'],
      dots: ['#10b981', '#3b82f6'],
      excerpt: 'Most people avoid the terminal. I\'ve made it my home. Here\'s what I use and why it beats clicking through menus.',
      host: true
    },
    {
      slug: 'anime-that-got-me-into-cs',
      title: 'The Anime That Got Me Into CS',
      date: '2026-07-10',
      category: 'ANIME · PERSONAL',
      tags: ['anime', 'personal'],
      dots: ['#ec4899', '#f97316'],
      excerpt: 'Sounds ridiculous. But hear me out — a handful of shows genuinely shaped how I think about code and problem-solving.',
      host: true
    }
  ];

  let POSTS_DATA = [];

  // Calendar & Filter State
  let currentCalView = 'weekly'; // 'weekly' | 'monthly' | 'range'
  let activeSelectedDate = '2026-08-29';
  let rangeStart = null;
  let rangeEnd = null;
  let isRangeFiltering = false;
  let isSingleDateFiltering = false;
  let searchQuery = '';

  const formatYMD = (d) => d.toLocaleDateString('en-CA');

  /**
   * Load posts from posts/index.json + localStorage
   */
  async function loadPostsData() {
    let remotePosts = [];
    try {
      const res = await fetch('posts/index.json');
      if (res.ok) {
        remotePosts = await res.json();
      }
    } catch (e) {
      // Offline / file protocol fallback
    }

    if (!remotePosts || remotePosts.length === 0) {
      remotePosts = DEFAULT_POSTS;
    }

    // Remote posts from main code file (posts/index.json) carry host boolean (true for official host posts)
    remotePosts = remotePosts.map((p) => ({ ...p, host: p.host === true }));

    // Load any user-imported or custom-written posts (always host: false)
    let localPosts = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('USER_CHRONICLES') || '[]');
      localPosts = parsed.map((p) => ({ ...p, host: false }));
    } catch (e) {}

    // Merge: official remote posts take priority for metadata
    const map = new Map();
    remotePosts.forEach((p) => {
      if (p && p.slug) map.set(p.slug, p);
    });
    localPosts.forEach((p) => {
      if (p && p.slug && !map.has(p.slug)) {
        map.set(p.slug, p);
      }
    });

    POSTS_DATA = Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
    if (POSTS_DATA.length > 0) {
      activeSelectedDate = POSTS_DATA[0].date;
    }
  }

  /**
   * Render single archive entry row matching Image 1
   */
  function renderArchiveEntry(post, index) {
    const d = new Date(post.date + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayNum = String(d.getDate()).padStart(2, '0');
    const dotsHtml = (post.dots || ['#3b82f6'])
      .map((c) => `<span class="color-dot" style="background-color: ${c};" aria-hidden="true"></span>`)
      .join('');

    const isHost = post.host === true;
    const hostBadgeHtml = isHost ? `
      <img src="assets/strawhat_pin.png" 
           alt="Host Chronicle" 
           class="entry-strawhat-pin" 
           title="Host Chronicle // Mugiwara" 
           loading="eager">
    ` : '';

    return `
      <a href="post.html?slug=${encodeURIComponent(post.slug)}"
         class="archive-entry font-mono${isHost ? ' has-host-badge' : ''}"
         aria-label="Read chronicle: ${post.title}">
        
        ${hostBadgeHtml}

        <!-- Left: Color dots & Day -->
        <div class="entry-day-col">
          <div class="entry-dots">${dotsHtml}</div>
          <span class="entry-day font-heading">${dayName}</span>
        </div>

        <!-- Center: Title, Description & Tags beside the day -->
        <div class="entry-content-col">
          <h2 class="entry-title font-heading">${post.title}</h2>
          <p class="entry-desc font-sans">${post.excerpt || ''}</p>
          <span class="entry-tags font-mono">${post.category || ''}</span>
        </div>

        <!-- Right: Big Number Date -->
        <div class="entry-date-col font-mono">
          <span class="entry-num-val font-heading">${dayNum}</span>
          <div class="entry-num-meta">
            <span class="entry-num-month">${monthShort}</span>
            <span>${d.getFullYear()}</span>
          </div>
        </div>

      </a>
    `;
  }

  /**
   * Filter and sort posts based on calendar selection and search query
   */
  function getFilteredPosts() {
    return POSTS_DATA.filter((post) => {
      if (isRangeFiltering && rangeStart && rangeEnd) {
        if (post.date < rangeStart || post.date > rangeEnd) return false;
      } else if (isSingleDateFiltering && activeSelectedDate) {
        if (post.date !== activeSelectedDate) return false;
      }

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchExcerpt = (post.excerpt || '').toLowerCase().includes(q);
      const matchCategory = (post.category || '').toLowerCase().includes(q);
      const matchTags = (post.tags || []).some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchExcerpt || matchCategory || matchTags;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Render filtered posts into the archive list
   */
  function renderFiltered() {
    const listEl = document.getElementById('blogArchiveList');
    const countEl = document.getElementById('archiveCount');
    const filterLabel = document.getElementById('calFilterName');

    if (!listEl) return;

    const filtered = getFilteredPosts();

    if (countEl) {
      countEl.textContent = String(filtered.length).padStart(3, '0');
    }

    if (filterLabel) {
      if (isRangeFiltering && rangeStart && rangeEnd) {
        filterLabel.textContent = `${rangeStart} → ${rangeEnd}`;
      } else if (isSingleDateFiltering && activeSelectedDate) {
        filterLabel.textContent = `${activeSelectedDate}`;
      } else {
        filterLabel.textContent = `ALL CHRONICLES`;
      }
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="archive-empty-state font-mono">
          <span class="empty-code">// 0 MATCHES FOUND</span>
          <p class="empty-msg">No chronicles found for this date or search.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map((post, idx) => renderArchiveEntry(post, idx)).join('');
  }

  /**
   * Render the Calendar Widget based on currentCalView and active date
   */
  function renderCalendarWidget() {
    const gridEl = document.getElementById('calDaysGrid');
    const heroMonthEl = document.getElementById('calHeroMonth');
    const heroDayEl = document.getElementById('calHeroDay');
    const rangeBarEl = document.getElementById('calRangeBar');
    const rangeLabelEl = document.getElementById('calRangeLabel');

    if (!gridEl) return;

    const baseDate = new Date(activeSelectedDate + 'T00:00:00');
    const postDates = new Set(POSTS_DATA.map((p) => p.date));

    // Update Hero Display (e.g. August 29)
    if (heroMonthEl) heroMonthEl.textContent = baseDate.toLocaleDateString('en-US', { month: 'long' });
    if (heroDayEl) heroDayEl.textContent = String(baseDate.getDate());

    // Toggle Range Bar
    if (rangeBarEl) {
      if (currentCalView === 'range') {
        rangeBarEl.style.display = 'flex';
        if (rangeStart && rangeEnd) {
          rangeLabelEl.textContent = `${rangeStart} → ${rangeEnd}`;
        } else if (rangeStart) {
          rangeLabelEl.textContent = `Start: ${rangeStart} (Pick end)`;
        } else {
          rangeLabelEl.textContent = `Click start & end dates`;
        }
      } else {
        rangeBarEl.style.display = 'none';
      }
    }

    gridEl.innerHTML = '';

    if (currentCalView === 'weekly') {
      const dayOfWeek = baseDate.getDay();
      const startOfWeek = new Date(baseDate);
      startOfWeek.setDate(baseDate.getDate() - dayOfWeek);

      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const ymd = formatYMD(d);
        const hasPost = postDates.has(ymd);
        const isSelected = isSingleDateFiltering && ymd === activeSelectedDate;

        const cell = document.createElement('div');
        cell.className = `cal-day-cell font-sans${isSelected ? ' active' : ''}${hasPost ? ' has-post' : ''}`;
        cell.dataset.date = ymd;
        cell.innerHTML = `
          <span class="cal-day-num">${d.getDate()}</span>
          <span class="cal-day-dot" aria-hidden="true"></span>
        `;

        cell.addEventListener('click', () => handleDateClick(ymd));
        gridEl.appendChild(cell);
      }
    } else {
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();

      for (let p = 0; p < firstDay; p++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cal-day-cell empty';
        emptyCell.style.opacity = '0.15';
        gridEl.appendChild(emptyCell);
      }

      for (let day = 1; day <= totalDays; day++) {
        const d = new Date(year, month, day);
        const ymd = formatYMD(d);
        const hasPost = postDates.has(ymd);

        let cellClass = 'cal-day-cell font-sans';
        if (hasPost) cellClass += ' has-post';

        if (currentCalView === 'range') {
          if (rangeStart && ymd === rangeStart) cellClass += ' range-start active';
          else if (rangeEnd && ymd === rangeEnd) cellClass += ' range-end active';
          else if (rangeStart && rangeEnd && ymd > rangeStart && ymd < rangeEnd) {
            cellClass += ' in-range';
          }
        } else {
          if (isSingleDateFiltering && ymd === activeSelectedDate) {
            cellClass += ' active';
          }
        }

        const cell = document.createElement('div');
        cell.className = cellClass;
        cell.dataset.date = ymd;
        cell.innerHTML = `
          <span class="cal-day-num">${day}</span>
          <span class="cal-day-dot" aria-hidden="true"></span>
        `;

        cell.addEventListener('click', () => handleDateClick(ymd));
        gridEl.appendChild(cell);
      }
    }
  }

  /**
   * Handle clicking a date cell in the calendar
   */
  function handleDateClick(ymd) {
    if (currentCalView === 'range') {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        rangeStart = ymd;
        rangeEnd = null;
        isRangeFiltering = false;
      } else if (rangeStart && !rangeEnd) {
        if (ymd >= rangeStart) {
          rangeEnd = ymd;
        } else {
          rangeEnd = rangeStart;
          rangeStart = ymd;
        }
        isRangeFiltering = true;
        isSingleDateFiltering = false;
      }
      activeSelectedDate = ymd;
    } else {
      if (isSingleDateFiltering && activeSelectedDate === ymd) {
        isSingleDateFiltering = false;
      } else {
        activeSelectedDate = ymd;
        isSingleDateFiltering = true;
        isRangeFiltering = false;
      }
    }

    renderCalendarWidget();
    renderFiltered();
  }

  /**
   * Setup Post Composer & Markdown Importer
   */
  function initComposer() {
    const modal = document.getElementById('composerModal');
    const openBtn = document.getElementById('openComposerBtn');
    const closeBtn = document.getElementById('closeComposerBtn');
    const form = document.getElementById('composerForm');
    const tabBtns = document.querySelectorAll('.composer-tab-btn');
    const tabPanes = document.querySelectorAll('.composer-tab-pane');
    const fileInput = document.getElementById('importMdFileInput');
    const triggerFileBtn = document.getElementById('triggerFilePicker');
    const dropzone = document.getElementById('composerDropzone');
    const downloadBtn = document.getElementById('downloadMdBtn');

    if (!modal) return;

    function openModal() {
      modal.style.display = 'flex';
      const dateInput = document.getElementById('postDateInput');
      if (dateInput && !dateInput.value) {
        dateInput.value = formatYMD(new Date());
      }
    }

    function closeModal() {
      modal.style.display = 'none';
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
      }
    });

    // Tab Switching
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        tabPanes.forEach((pane) => {
          if (pane.getAttribute('data-pane') === tab) {
            pane.style.display = 'block';
          } else {
            pane.style.display = 'none';
          }
        });
      });
    });

    // Parse Imported Markdown Text
    function handleMarkdownFileText(text, filename = '') {
      let title = '';
      let date = formatYMD(new Date());
      let category = 'GENERAL · NOTES';
      let tags = [];
      let excerpt = '';
      let body = text;

      // Check for YAML frontmatter
      const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (fmMatch) {
        const fm = fmMatch[1];
        body = fmMatch[2].trim();

        const tMatch = fm.match(/title:\s*["']?(.*?)["']?$/m);
        if (tMatch) title = tMatch[1].trim();

        const dMatch = fm.match(/date:\s*["']?(.*?)["']?$/m);
        if (dMatch) date = dMatch[1].trim();

        const cMatch = fm.match(/category:\s*["']?(.*?)["']?$/m);
        if (cMatch) category = cMatch[1].trim();

        const tagsMatch = fm.match(/tags:\s*\[(.*?)\]/);
        if (tagsMatch) {
          tags = tagsMatch[1].split(',').map((t) => t.replace(/['"]/g, '').trim());
        }
      }

      // If no title found in frontmatter, extract first # Heading
      if (!title) {
        const h1Match = body.match(/^#\s+(.+)$/m);
        if (h1Match) {
          title = h1Match[1].trim();
        } else if (filename) {
          title = filename.replace(/\.(md|markdown|txt)$/i, '').replace(/[-_]/g, ' ');
          title = title.charAt(0).toUpperCase() + title.slice(1);
        }
      }

      // Extract first paragraph for excerpt
      if (!excerpt) {
        const pMatch = body.replace(/^#+.*$/gm, '').trim().split(/\n\n+/)[0];
        if (pMatch) {
          excerpt = pMatch.replace(/[*_`#[\]]/g, '').trim().slice(0, 140);
          if (excerpt.length >= 140) excerpt += '...';
        }
      }

      // Populate form and switch to write tab
      document.getElementById('postTitleInput').value = title;
      document.getElementById('postDateInput').value = date;
      document.getElementById('postCategoryInput').value = category;
      document.getElementById('postTagsInput').value = tags.join(', ');
      document.getElementById('postExcerptInput').value = excerpt;
      document.getElementById('postContentInput').value = body;

      // Switch to write tab
      const writeTabBtn = document.querySelector('.composer-tab-btn[data-tab="write"]');
      if (writeTabBtn) writeTabBtn.click();
    }

    // File Input change
    if (triggerFileBtn && fileInput) {
      triggerFileBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => handleMarkdownFileText(evt.target.result, file.name);
        reader.readAsText(file);
      });
    }

    // Drag & Drop
    if (dropzone) {
      ['dragenter', 'dragover'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => handleMarkdownFileText(evt.target.result, file.name);
        reader.readAsText(file);
      });
    }

    // Download .MD button
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const title = document.getElementById('postTitleInput').value.trim() || 'untitled-post';
        const content = document.getElementById('postContentInput').value;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${slug}.md`;
        a.click();
      });
    }

    // Submit form: Save to localStorage and update UI
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('postTitleInput').value.trim();
        const date = document.getElementById('postDateInput').value;
        const category = (document.getElementById('postCategoryInput').value.trim() || 'GENERAL · NOTES').toUpperCase();
        const tagsRaw = document.getElementById('postTagsInput').value;
        const tags = tagsRaw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
        const excerpt = document.getElementById('postExcerptInput').value.trim();
        const content = document.getElementById('postContentInput').value;

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Host variable: false when blog is added from website locally.
        // When you upload the real blog to posts/ and set "host": true in posts/index.json, the badge shows!
        const host = false;

        const newPost = {
          slug,
          title,
          date,
          category,
          tags: tags.length ? tags : ['general'],
          dots: ['#79a6dc', '#3b82f6'],
          excerpt: excerpt || content.slice(0, 110) + '...',
          host
        };

        // Save markdown content
        try {
          localStorage.setItem('POST_CONTENT_' + slug, content);
          const saved = JSON.parse(localStorage.getItem('USER_CHRONICLES') || '[]');
          const filtered = saved.filter((p) => p.slug !== slug);
          filtered.unshift(newPost);
          localStorage.setItem('USER_CHRONICLES', JSON.stringify(filtered));
        } catch (err) {}

        // Add to active dataset
        POSTS_DATA = POSTS_DATA.filter((p) => p.slug !== slug);
        POSTS_DATA.unshift(newPost);
        activeSelectedDate = date;

        renderCalendarWidget();
        renderFiltered();
        closeModal();
      });
    }
  }

  /**
   * Initialize blog archive listing, search listener, and calendar widget
   */
  async function initBlogArchive() {
    await loadPostsData();

    const searchInput = document.getElementById('archiveSearchInput');
    const searchClear = document.getElementById('archiveSearchClear');
    const calSegBtns = document.querySelectorAll('.cal-seg-btn');
    const calResetBtn = document.getElementById('calResetBtn');
    const calAllPostsBtn = document.getElementById('calAllPostsBtn');
    const calTodayBtn = document.getElementById('calTodayBtn');
    const calRangeClear = document.getElementById('calRangeClear');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchClear) {
          searchClear.style.display = searchQuery ? 'block' : 'none';
        }
        renderFiltered();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchQuery = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchClear.style.display = 'none';
        renderFiltered();
      });
    }

    calSegBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        calSegBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentCalView = btn.getAttribute('data-cal-view') || 'weekly';

        if (currentCalView !== 'range') {
          isRangeFiltering = false;
          rangeStart = null;
          rangeEnd = null;
        }

        renderCalendarWidget();
        renderFiltered();
      });
    });

    function resetAllFilters() {
      isSingleDateFiltering = false;
      isRangeFiltering = false;
      rangeStart = null;
      rangeEnd = null;
      if (POSTS_DATA.length > 0) {
        activeSelectedDate = POSTS_DATA[0].date;
      }
      currentCalView = 'weekly';
      calSegBtns.forEach((b) => {
        if (b.getAttribute('data-cal-view') === 'weekly') b.classList.add('active');
        else b.classList.remove('active');
      });
      renderCalendarWidget();
      renderFiltered();
    }

    if (calResetBtn) calResetBtn.addEventListener('click', resetAllFilters);
    if (calAllPostsBtn) calAllPostsBtn.addEventListener('click', resetAllFilters);
    if (calRangeClear) calRangeClear.addEventListener('click', resetAllFilters);

    if (calTodayBtn) {
      calTodayBtn.addEventListener('click', () => {
        if (POSTS_DATA.length > 0) {
          activeSelectedDate = POSTS_DATA[0].date;
        }
        isSingleDateFiltering = true;
        isRangeFiltering = false;
        renderCalendarWidget();
        renderFiltered();
      });
    }

    initComposer();

    renderCalendarWidget();
    renderFiltered();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogArchive);
  } else {
    initBlogArchive();
  }
})();
