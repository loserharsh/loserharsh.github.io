/**
 * ==========================================================================
 * EDITORIAL ABOUT SECTION JAVASCRIPT
 * ==========================================================================
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for in-page anchors (#skills, #interests, etc.)
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
              block: 'start'
            });
          }
        }
      });
    });

    // Subtle gentle entrance for the editorial stage if reduced motion is off
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const leftCol = document.querySelector('.editorial-left-region');
      const rightCol = document.querySelector('.editorial-right-region');

      if (leftCol && rightCol) {
        leftCol.style.opacity = '0';
        leftCol.style.transform = 'translateY(16px)';
        leftCol.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';

        rightCol.style.opacity = '0';
        rightCol.style.transform = 'translateY(16px)';
        rightCol.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s';

        requestAnimationFrame(() => {
          leftCol.style.opacity = '1';
          leftCol.style.transform = 'translateY(0)';
          rightCol.style.opacity = '1';
          rightCol.style.transform = 'translateY(0)';
        });
      }
    }
  });
})();
