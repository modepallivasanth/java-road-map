(function () {
  'use strict';

  const THEME_KEY = 'java-roadmap-theme';

  /* ===== Theme Toggle ===== */
  const themeBtn = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem(THEME_KEY) || (prefersDark ? 'dark' : 'light');
  applyTheme(saved);

  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeBtn.setAttribute('title', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  }

  /* ===== Scroll Reveal ===== */
  const sections = document.querySelectorAll('.topic-section');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -30px 0px' }
  );

  sections.forEach((s) => revealObserver.observe(s));

  /* ===== Search ===== */
  const searchInput = document.getElementById('searchInput');
  const noResults = document.getElementById('noResults');
  let debounceTimer;

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(performSearch, 140);
  });

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    const allSections = document.querySelectorAll('.topic-section');

    if (!query) {
      resetSearch();
      return;
    }

    let totalMatches = 0;

    allSections.forEach((section) => {
      let sectionMatch = false;
      const cards = section.querySelectorAll('.topic-card');

      cards.forEach((card) => {
        let cardMatch = false;
        const items = card.querySelectorAll('li');

        items.forEach((li) => {
          const text = li.textContent.toLowerCase();
          if (text.includes(query)) {
            li.classList.remove('search-hidden');
            cardMatch = true;
            sectionMatch = true;
            totalMatches++;
          } else {
            li.classList.add('search-hidden');
          }
        });

        if (cardMatch) {
          card.classList.remove('search-hidden');
        } else {
          card.classList.add('search-hidden');
        }
      });

      if (sectionMatch) {
        section.classList.remove('search-hidden');
        section.classList.add('visible');
      } else {
        section.classList.add('search-hidden');
      }
    });

    if (noResults) {
      noResults.classList.toggle('show', totalMatches === 0);
    }
  }

  function resetSearch() {
    document.querySelectorAll('.search-hidden').forEach((el) => {
      el.classList.remove('search-hidden');
    });
    if (noResults) {
      noResults.classList.remove('show');
    }
  }

  /* ===== Keyboard Shortcuts ===== */
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K or / to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }

    if (
      e.key === '/' &&
      document.activeElement !== searchInput &&
      document.activeElement.tagName !== 'INPUT' &&
      document.activeElement.tagName !== 'TEXTAREA'
    ) {
      e.preventDefault();
      searchInput.focus();
    }

    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      performSearch();
      searchInput.blur();
    }
  });
})();
