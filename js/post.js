/**
 * ==========================================================================
 * POST READER ENGINE
 * Fetches and renders markdown chronicles directly from posts/<slug>.md
 * ==========================================================================
 */

(function () {
  'use strict';

  // ── Baseline fallback post metadata ─────────────────────────────────────
  const DEFAULT_POSTS_META = [
    {
      slug: 'the-first-build',
      title: 'THE FIRST BUILD',
      date: '2026-08-30',
      category: 'WEBDEV',
      tags: ['webdev', 'portfolio', 'development'],
      dots: ['#f97316', '#3b82f6'],
      excerpt: "The first entry in the log. Building a portfolio, breaking things, and figuring out what the hell I'm doing along the way.",
      host: true
    },
    {
      slug: 'hello-world',
      title: 'Hello, World.',
      date: '2026-08-29',
      category: 'META · INTRO',
      tags: ['meta', 'intro'],
      dots: ['#3b82f6', '#f97316', '#ef4444'],
      excerpt: 'First post — what this space is for, and what I plan to write about.',
      host: true
    }
  ];

  // ── Offline fallback markdown content (works on file:// and offline) ───
//   const FALLBACK_MARKDOWN = {
//     'the-first-build': `# THE FIRST BUILD

// > BUILD LOG

// ---

// ## BEGIN SESSION

// I started with a simple idea:

// > Build a portfolio.

// Simple enough.

// Except it didn't stay simple.

// One layout turned into another.  
// A normal portfolio turned into a terminal.  
// The terminal turned into an entire interface.

// Then came the small stuff.

// Typography. Spacing. Animations. Buttons. Random details that technically didn't need to exist but somehow became important.

// At some point, I stopped trying to make a "portfolio" and started trying to make something that actually felt like **mine**.

// It's not perfect.

// Some parts are probably overdesigned. Some ideas will get deleted. Some things will break.

// Good.

// If I come back to this six months from now and think this version is terrible, that's probably a good sign.

// It means I got better.

// ---

// ## CURRENT STATE

// \`\`\`txt
// STATUS     ONLINE
// FOCUS      WEB DEVELOPMENT
// STACK      HTML / CSS / JAVASCRIPT
// MODE       EXPERIMENTAL
// VERSION    01.0
// NEXT       KEEP BUILDING
// \`\`\`
// `,
//     'hello-world': `# Hello, World.

// > *"The world is not in your books and maps. It's out there."*  
// > — Gandalf

// So I finally have a blog. This space isn't meant to be polished or professional — it's just somewhere I can write things down.

// ---

// ## What this is

// I'm **Harshwardhan** — a CS guy. I build web things, experiment with AI, and spend too much time down rabbit holes that probably won't show up on my resume.

// This blog is my place to document:

// - **Things I'm learning** — web dev, systems, anything that catches my attention
// - **Projects I'm building** — behind-the-scenes notes on what went wrong (mostly)
// - **Thoughts that don't fit anywhere else** — opinions, observations, whatever

// Not everything will be useful. That's kind of the point.

// ---

// ## Why Markdown?

// Because it gets out of the way. I can write in any editor, version-control it with git, and the site just picks it up. No CMS, no database, no login. Just files.

// ---

// ## What's coming

// No promises — but I'm thinking about writing on:

// - Building this portfolio from scratch
// - Why I think everyone should break something on purpose at least once
// - Anime recommendations nobody asked for

// Stay tuned, or don't. Either way, I'll keep writing.

// \`\`\`
// > whoami
// harshwardhan
// > _
// \`\`\`
// `
//   };

  /**
   * Format ISO date string to human-readable
   */
  function formatDate(dateStr) {
    if (!dateStr) return 'Recent';
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
   * Convert slug into human-readable title
   */
  function slugToTitle(slug) {
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Render the post — fetches markdown and manifest dynamically
   */
  async function initPostReader() {
    const params = new URLSearchParams(window.location.search);
    let slug = params.get('slug');

    const titleEl    = document.getElementById('postTitle');
    const dateEl     = document.getElementById('postDate');
    const tagsEl     = document.getElementById('postTags');
    const readTimeEl = document.getElementById('postReadTime');
    const bodyEl     = document.getElementById('postBody');
    const giantNumEl = document.getElementById('postGiantNumber');
    const eyebrowEl  = document.getElementById('postEyebrow');
    const subtitleEl = document.getElementById('postSubtitle');

    // 1. Fetch remote posts manifest from posts/index.json
    let remotePosts = [];
    try {
      const res = await fetch('posts/index.json');
      if (res.ok) {
        remotePosts = await res.json();
      }
    } catch (e) {
      // Local file or offline fallback
    }

    // 2. Merge with user drafts from localStorage and default baseline
    let userPosts = [];
    try {
      userPosts = JSON.parse(localStorage.getItem('USER_CHRONICLES') || '[]');
    } catch (e) {}

    const manifest = (remotePosts && remotePosts.length) ? remotePosts : DEFAULT_POSTS_META;
    const allMeta = [...userPosts, ...manifest];

    // Default to the first post if no slug is provided in URL
    if (!slug) {
      slug = allMeta[0] ? allMeta[0].slug : 'the-first-build';
    }

    const postIndex = allMeta.findIndex((p) => p.slug === slug);
    const postMeta  = postIndex !== -1 ? allMeta[postIndex] : null;
    const postNum   = postIndex !== -1 ? String(postIndex + 1).padStart(2, '0') : '01';

    if (giantNumEl) giantNumEl.textContent = postNum;

    // 3. Immediately set Title and Metadata so it NEVER stays stuck on "Loading…"
    const resolvedTitle = postMeta ? postMeta.title : slugToTitle(slug);
    const resolvedDate  = postMeta ? formatDate(postMeta.date) : 'August 2026';
    const resolvedTags  = postMeta && postMeta.tags ? postMeta.tags : ['chronicle'];

    if (titleEl) titleEl.textContent = resolvedTitle;
    document.title = `${resolvedTitle} — Harsh`;

    if (dateEl) dateEl.textContent = resolvedDate;
    if (eyebrowEl) eyebrowEl.textContent = `CHRONICLE ${postNum} · ${resolvedDate.toUpperCase()}`;
    if (subtitleEl) subtitleEl.textContent = resolvedTags.map((t) => t.toUpperCase()).join(' · ');
    if (tagsEl) {
      tagsEl.innerHTML = resolvedTags
        .map((t) => `<span class="blog-tag font-mono">${t}</span>`)
        .join('');
    }

    // 4. Fetch Markdown content
    // A. Check localStorage first (user-drafted posts)
    let mdText = localStorage.getItem('POST_CONTENT_' + slug);

    // B. Fetch markdown file from posts/<slug>.md
    if (!mdText) {
      try {
        const mdRes = await fetch(`posts/${slug}.md`);
        if (mdRes.ok) {
          mdText = await mdRes.text();
        }
      } catch (e) {
        // Fetch failed (e.g. file:// protocol CORS restriction)
      }
    }

    // C. Check embedded fallback for standard posts
    if (!mdText && FALLBACK_MARKDOWN[slug]) {
      mdText = FALLBACK_MARKDOWN[slug];
    }

    if (!mdText) {
      if (bodyEl) {
        bodyEl.innerHTML = `
          <div class="blog-loading font-mono">
            <p> POST NOT FOUND.</p>
            <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">Ensure <code>posts/${slug}.md</code> exists in your repository.</p>
          </div>`;
      }
      return;
    }

    if (readTimeEl) readTimeEl.textContent = readingTime(mdText);

    // 5. Render Markdown with marked.js
    if (bodyEl) {
      if (typeof marked !== 'undefined') {
        marked.setOptions({ breaks: true, gfm: true });
        bodyEl.innerHTML = marked.parse(mdText);
      } else {
        // Fallback plain text renderer if marked.js hasn't loaded
        bodyEl.innerHTML = `<pre class="font-mono" style="white-space: pre-wrap;">${mdText}</pre>`;
      }
    }
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPostReader);
  } else {
    initPostReader();
  }
})();
