/**
 * ==========================================================================
 * POST READER ENGINE
 * Fetches and renders markdown chronicles directly from posts/<slug>.md
 * ==========================================================================
 */

(function () {
  'use strict';

  // ── Post metadata for instant header render ──────────────────────────────
  const POSTS_META = [
    {
      slug: 'hello-world',
      title: 'Hello, World.',
      date: '2026-08-29',
      tags: ['meta', 'intro']
    },
    {
      slug: 'building-this-site',
      title: 'Building This Site From Scratch',
      date: '2026-08-25',
      tags: ['webdev', 'css', 'design']
    },
    {
      slug: 'why-i-like-terminal',
      title: 'Why I Live in the Terminal',
      date: '2026-07-20',
      tags: ['tools', 'linux', 'productivity']
    },
    {
      slug: 'anime-that-got-me-into-cs',
      title: 'The Anime That Got Me Into CS',
      date: '2026-07-10',
      tags: ['anime', 'personal']
    }
  ];

  /**
   * Format ISO date string to human-readable
   */
  function formatDate(dateStr) {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Estimate reading time
   */
  function readingTime(text) {
    const words = text.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min read`;
  }

  /**
   * Render the post — fetches markdown directly from posts/<slug>.md
   */
  async function initPostReader() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    const titleEl    = document.getElementById('postTitle');
    const dateEl     = document.getElementById('postDate');
    const tagsEl     = document.getElementById('postTags');
    const readTimeEl = document.getElementById('postReadTime');
    const bodyEl     = document.getElementById('postBody');

    if (!slug || !bodyEl) {
      if (bodyEl) bodyEl.innerHTML = '<p class="blog-loading font-mono">// NO POST SPECIFIED.</p>';
      return;
    }

    // Merge user-imported posts from localStorage with manifest
    let userPosts = [];
    try {
      userPosts = JSON.parse(localStorage.getItem('USER_CHRONICLES') || '[]');
    } catch (e) {}
    const allMeta = [...userPosts, ...POSTS_META];

    const postIndex = allMeta.findIndex((p) => p.slug === slug);
    const postMeta  = postIndex !== -1 ? allMeta[postIndex] : null;
    const postNum   = postIndex !== -1 ? String(postIndex + 1).padStart(2, '0') : '01';

    const giantNumEl = document.getElementById('postGiantNumber');
    const eyebrowEl  = document.getElementById('postEyebrow');
    const subtitleEl = document.getElementById('postSubtitle');

    if (giantNumEl) giantNumEl.textContent = postNum;

    // Render metadata immediately
    if (postMeta) {
      if (titleEl) titleEl.textContent = postMeta.title;
      document.title = `${postMeta.title} — Harsh`;
      if (dateEl) dateEl.textContent = formatDate(postMeta.date);
      if (eyebrowEl) {
        eyebrowEl.textContent = `CHRONICLE // ${postNum} · ${formatDate(postMeta.date).toUpperCase()}`;
      }
      if (subtitleEl) {
        subtitleEl.textContent = (postMeta.tags || []).map((t) => t.toUpperCase()).join(' · ');
      }
      if (tagsEl) {
        tagsEl.innerHTML = (postMeta.tags || [])
          .map((t) => `<span class="blog-tag font-mono">${t}</span>`)
          .join('');
      }
    }

    // Check localStorage first (for user-written or imported posts)
    let mdText = localStorage.getItem('POST_CONTENT_' + slug);

    // If not in localStorage, fetch the .md file directly
    if (!mdText) {
      try {
        const mdRes = await fetch(`posts/${slug}.md`);
        if (mdRes.ok) {
          mdText = await mdRes.text();
        }
      } catch (e) {
        // Fetch error fallback
      }
    }

    if (!mdText) {
      bodyEl.innerHTML = '<p class="blog-loading font-mono">// POST NOT FOUND OR FETCH RESTRICTED.</p>';
      return;
    }

    if (readTimeEl) readTimeEl.textContent = readingTime(mdText);

    // Render Markdown with marked.js
    if (typeof marked === 'undefined') {
      bodyEl.innerHTML = '<p class="blog-loading font-mono">// MARKDOWN RENDERER NOT LOADED.</p>';
      return;
    }

    marked.setOptions({ breaks: true, gfm: true });
    bodyEl.innerHTML = marked.parse(mdText);
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPostReader);
  } else {
    initPostReader();
  }
})();
