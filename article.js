/**
 * CATARSIS COLECTIVA — Article Interactivity
 * Reading progress · TOC scroll-spy · Smooth navigation · Reading time
 */

document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  initTocScrollSpy();
  initSmoothScroll();
  calculateReadingTime();
});

// ═══════════════════════════════════════════════════════════════════════════
// Reading Progress Bar
// ═══════════════════════════════════════════════════════════════════════════
function initReadingProgress() {
  const progressBar = document.getElementById('readingProgress');
  if (!progressBar) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ═══════════════════════════════════════════════════════════════════════════
// TOC Scroll-Spy with IntersectionObserver
// ═══════════════════════════════════════════════════════════════════════════
function initTocScrollSpy() {
  const sections = document.querySelectorAll('.article-section[id], .article-epilogue[id]');
  const tocLinks = document.querySelectorAll('.toc-link');

  if (sections.length === 0 || tocLinks.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;

          tocLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    {
      rootMargin: '-10% 0px -70% 0px',
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

// ═══════════════════════════════════════════════════════════════════════════
// Smooth Scroll for TOC Links
// ═══════════════════════════════════════════════════════════════════════════
function initSmoothScroll() {
  const tocLinks = document.querySelectorAll('.toc-link');

  tocLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Reading Time Calculator
// ═══════════════════════════════════════════════════════════════════════════
function calculateReadingTime() {
  const articleBody = document.querySelector('.article-body');
  const readingTimeEl = document.getElementById('readingTime');

  if (!articleBody || !readingTimeEl) return;

  const text = articleBody.textContent || '';
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);

  readingTimeEl.textContent = `${minutes} min de lectura`;
}
