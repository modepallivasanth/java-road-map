const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');

const newScript = `(function () {
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

  /* ===== Category Tabs ===== */
  const categoryTabs = document.querySelectorAll('.category-tab');
  const allSections = document.querySelectorAll('.topic-section');
  let currentCategory = 'all';

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-target');
      
      // When changing category, re-run search if there is a query, or just apply filter
      performSearch();
    });
  });

  function applyCategoryFilter() {
    allSections.forEach(section => {
      const sectionCat = section.getAttribute('data-category');
      if (currentCategory === 'all' || sectionCat === currentCategory) {
        section.classList.remove('category-hidden');
      } else {
        section.classList.add('category-hidden');
      }
    });
  }

  /* ===== Scroll Reveal ===== */
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

  allSections.forEach((s) => revealObserver.observe(s));

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

    if (!query) {
      resetSearch();
      applyCategoryFilter();
      return;
    }

    let totalMatches = 0;

    allSections.forEach((section) => {
      const sectionCat = section.getAttribute('data-category');
      // If we are in a specific category, ignore sections not in it
      if (currentCategory !== 'all' && sectionCat !== currentCategory) {
        section.classList.add('search-hidden');
        section.classList.add('category-hidden');
        return;
      }

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
        section.classList.remove('category-hidden');
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

    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      performSearch();
      searchInput.blur();
    }
  });
})();
`;

fs.writeFileSync(scriptPath, newScript, 'utf8');
console.log('Successfully updated script.js');
