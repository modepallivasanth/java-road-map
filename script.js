(function () {
  'use strict';

  const STORAGE_KEY = 'java-roadmap-progress-v1';
  const THEME_KEY = 'java-roadmap-theme';

  // ===== Theme =====
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
  });

  // ===== Progress =====
  const checkboxes = document.querySelectorAll('input[type="checkbox"][data-id]');
  const progressBadge = document.getElementById('progressBadge');
  const total = checkboxes.length;

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      checkboxes.forEach(cb => {
        if (saved[cb.dataset.id]) {
          cb.checked = true;
        }
      });
      updateProgress();
    } catch (e) {
      console.warn('Could not load progress', e);
    }
  }

  function saveProgress() {
    const data = {};
    checkboxes.forEach(cb => {
      if (cb.checked) data[cb.dataset.id] = true;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    updateProgress();
  }

  function updateProgress() {
    const done = document.querySelectorAll('input[type="checkbox"][data-id]:checked').length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    progressBadge.textContent = pct + '%';
    progressBadge.title = `${done} / ${total} topics completed`;
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', saveProgress);
  });

  document.getElementById('resetProgress').addEventListener('click', () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      checkboxes.forEach(cb => (cb.checked = false));
      updateProgress();
    }
  });

  loadProgress();

  // ===== Search =====
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 180);
  });

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    const sections = document.querySelectorAll('.topic-section');

    if (!query) {
      // Reset everything
      sections.forEach(s => s.classList.remove('hidden'));
      document.querySelectorAll('details').forEach(d => {
        d.classList.remove('hidden');
        // leave open/closed as user left them
      });
      document.querySelectorAll('.topic-list li').forEach(li => {
        li.classList.remove('hidden');
        // remove previous highlights
        const label = li.querySelector('label');
        if (label && label.dataset.originalHtml) {
          label.innerHTML = label.dataset.originalHtml;
          delete label.dataset.originalHtml;
        }
      });
      return;
    }

    sections.forEach(section => {
      let sectionHasMatch = false;
      const detailsList = section.querySelectorAll('details');

      detailsList.forEach(details => {
        let detailsHasMatch = false;
        const items = details.querySelectorAll('.topic-list li');

        items.forEach(li => {
          const label = li.querySelector('label');
          if (!label) return;

          // Store original if not already
          if (!label.dataset.originalHtml) {
            label.dataset.originalHtml = label.innerHTML;
          }

          const text = label.textContent.toLowerCase();
          if (text.includes(query)) {
            li.classList.remove('hidden');
            detailsHasMatch = true;
            sectionHasMatch = true;

            // Highlight
            const original = label.dataset.originalHtml;
            // Simple highlight on text nodes only (keep HTML structure)
            const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
            // We re-apply on the text content carefully
            label.innerHTML = original.replace(regex, '<span class="highlight">$1</span>');
          } else {
            li.classList.add('hidden');
            // restore
            label.innerHTML = label.dataset.originalHtml;
          }
        });

        if (detailsHasMatch) {
          details.classList.remove('hidden');
          details.open = true; // auto-open matching groups
        } else {
          details.classList.add('hidden');
        }
      });

      if (sectionHasMatch) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ===== Active nav on scroll =====
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.topic-section');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('href') === '#' + id);
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    }
  );

  sections.forEach(s => observer.observe(s));

  // Smooth click for nav
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // let default hash work, but ensure open if needed
      const targetId = item.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        // open first details if closed
        const firstDetails = target.querySelector('details');
        if (firstDetails && !firstDetails.open) {
          firstDetails.open = true;
        }
      }
    });
  });

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      performSearch();
      searchInput.blur();
    }
  });
})();
