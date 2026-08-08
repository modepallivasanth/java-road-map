/* ===== Progress Tracking, Bookmarks & Weak Topics Filter ===== */
(function () {
  'use strict';

  var app = (window.RoadmapApp = window.RoadmapApp || {});

  var LS_PROGRESS = 'roadmap-progress';
  var LS_BOOKMARKS = 'roadmap-bookmarks';
  var progressData = {};
  var bookmarkData = {};
  var isWeakMode = false;

  /* ══════════════════════════════════════════
     Generate Stable IDs
     Format: {sectionId}-c{cardIndex}-i{itemIndex}
     ══════════════════════════════════════════ */
  function generateIds() {
    document.querySelectorAll('.topic-section').forEach(function (sec) {
      var sid = sec.id;
      sec.querySelectorAll('.topic-card').forEach(function (card, ci) {
        card.querySelectorAll('li').forEach(function (li, ii) {
          li.setAttribute('data-item-id', sid + '-c' + ci + '-i' + ii);
        });
      });
    });
  }

  /* ══════════════════════════════════════════
     Inject Checkboxes & Bookmark Buttons
     ══════════════════════════════════════════ */
  function injectControls() {
    document.querySelectorAll('.topic-card li[data-item-id]').forEach(function (li) {
      var id = li.getAttribute('data-item-id');

      // ── Checkbox ──
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'topic-checkbox';
      cb.checked = !!progressData[id];
      cb.setAttribute('aria-label', 'Mark as completed');

      cb.addEventListener('change', function () {
        if (cb.checked) {
          progressData[id] = true;
          li.classList.add('completed');
        } else {
          delete progressData[id];
          li.classList.remove('completed');
        }
        persist();
        updateBars();
      });

      li.insertBefore(cb, li.firstChild);
      if (progressData[id]) li.classList.add('completed');

      // ── Bookmark Flag ──
      var bm = document.createElement('button');
      bm.className = 'bookmark-btn' + (bookmarkData[id] ? ' active' : '');
      bm.innerHTML = '⚑';
      bm.setAttribute('aria-label', 'Flag as weak topic');
      bm.setAttribute('title', 'Flag as weak topic');

      bm.addEventListener('click', function (e) {
        e.stopPropagation();
        if (bookmarkData[id]) {
          delete bookmarkData[id];
          bm.classList.remove('active');
          li.classList.remove('bookmarked');
        } else {
          bookmarkData[id] = true;
          bm.classList.add('active');
          li.classList.add('bookmarked');
        }
        persist();
        updateWeakCount();
        if (isWeakMode) applyWeakFilter();
      });

      li.appendChild(bm);
      if (bookmarkData[id]) li.classList.add('bookmarked');
    });
  }

  /* ══════════════════════════════════════════
     Section Progress Bars
     ══════════════════════════════════════════ */
  function createBars() {
    document.querySelectorAll('.topic-section').forEach(function (sec) {
      var hdr = sec.querySelector('.section-header');
      if (!hdr) return;

      var bar = document.createElement('div');
      bar.className = 'section-progress';
      bar.innerHTML =
        '<div class="section-progress-info">' +
        '<span class="section-progress-text">0 / 0</span>' +
        '</div>' +
        '<div class="section-progress-track">' +
        '<div class="section-progress-fill"></div>' +
        '</div>';

      // Insert after the section-header
      hdr.parentNode.insertBefore(bar, hdr.nextSibling);
    });
  }

  function updateBars() {
    var totalDone = 0;
    var totalCount = 0;

    document.querySelectorAll('.topic-section').forEach(function (sec) {
      var items = sec.querySelectorAll('li[data-item-id]');
      var done = 0;

      items.forEach(function (li) {
        totalCount++;
        if (progressData[li.getAttribute('data-item-id')]) {
          done++;
          totalDone++;
        }
      });

      var bar = sec.querySelector('.section-progress');
      if (bar && items.length) {
        var pct = Math.round((done / items.length) * 100);
        bar.querySelector('.section-progress-text').textContent = done + ' / ' + items.length;
        bar.querySelector('.section-progress-fill').style.width = pct + '%';
      }
    });

    // Overall progress
    var fill = document.getElementById('overallProgressFill');
    var txt = document.getElementById('overallProgressText');
    var sum = document.getElementById('progressSummary');

    if (fill && txt) {
      var p = totalCount ? Math.round((totalDone / totalCount) * 100) : 0;
      txt.textContent = p + '% (' + totalDone + '/' + totalCount + ')';
      fill.style.width = p + '%';
    }
    if (sum) {
      sum.textContent = totalDone + ' / ' + totalCount + ' completed';
    }
  }

  function updateWeakCount() {
    var n = Object.keys(bookmarkData).length;
    var btn = document.getElementById('weakTopicsToggle');
    if (btn) {
      btn.textContent = n > 0 ? '⚑ Weak Topics (' + n + ')' : '⚑ Weak Topics';
    }
  }

  /* ══════════════════════════════════════════
     Weak Topics Filter
     ══════════════════════════════════════════ */
  function setupWeakToggle() {
    var btn = document.getElementById('weakTopicsToggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      isWeakMode = !isWeakMode;
      btn.classList.toggle('active', isWeakMode);
      if (isWeakMode) {
        applyWeakFilter();
      } else {
        removeWeakFilter();
      }
    });
  }

  function applyWeakFilter() {
    var anyVisible = false;

    document.querySelectorAll('.topic-section').forEach(function (sec) {
      var secHas = false;

      sec.querySelectorAll('.topic-card').forEach(function (card) {
        var cardHas = false;

        card.querySelectorAll('li[data-item-id]').forEach(function (li) {
          if (bookmarkData[li.getAttribute('data-item-id')]) {
            li.classList.remove('weak-hidden');
            cardHas = true;
            secHas = true;
          } else {
            li.classList.add('weak-hidden');
          }
        });

        card.classList.toggle('weak-hidden', !cardHas);
      });

      sec.classList.toggle('weak-hidden', !secHas);
      if (secHas) anyVisible = true;
    });

    // Show message if nothing is bookmarked
    var nr = document.getElementById('noResults');
    if (nr && !anyVisible) {
      nr.textContent = 'No weak topics flagged yet. Click ⚑ on any topic to bookmark it.';
      nr.classList.add('show');
    }
  }

  function removeWeakFilter() {
    document.querySelectorAll('.weak-hidden').forEach(function (el) {
      el.classList.remove('weak-hidden');
    });
    var nr = document.getElementById('noResults');
    if (nr) {
      nr.textContent = 'No topics match your search.';
      nr.classList.remove('show');
    }
  }

  /* ══════════════════════════════════════════
     Data Persistence
     ══════════════════════════════════════════ */
  function loadLocal() {
    try {
      progressData = JSON.parse(localStorage.getItem(LS_PROGRESS) || '{}');
      bookmarkData = JSON.parse(localStorage.getItem(LS_BOOKMARKS) || '{}');
    } catch (e) {
      progressData = {};
      bookmarkData = {};
    }
  }

  function persist() {
    localStorage.setItem(LS_PROGRESS, JSON.stringify(progressData));
    localStorage.setItem(LS_BOOKMARKS, JSON.stringify(bookmarkData));
    if (app.firebaseReady && app.user) syncFirestore();
  }

  function syncFirestore() {
    if (!app.db || !app.user) return;
    app.db
      .collection('users')
      .doc(app.user.uid)
      .set(
        {
          progress: progressData,
          bookmarks: bookmarkData,
          lastSynced: firebase.firestore.FieldValue.serverTimestamp(),
          profile: {
            displayName: app.user.displayName || '',
            email: app.user.email || '',
          },
        },
        { merge: true }
      )
      .catch(function (e) {
        console.warn('Firestore sync failed:', e);
      });
  }

  function mergeOnSignIn() {
    if (!app.db || !app.user) return;
    app.db
      .collection('users')
      .doc(app.user.uid)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          var data = doc.data();
          // Merge: local data wins on conflicts (user was working offline)
          progressData = Object.assign({}, data.progress || {}, progressData);
          bookmarkData = Object.assign({}, data.bookmarks || {}, bookmarkData);
        }
        // Save merged data back
        localStorage.setItem(LS_PROGRESS, JSON.stringify(progressData));
        localStorage.setItem(LS_BOOKMARKS, JSON.stringify(bookmarkData));
        syncFirestore();
        refreshUI();
      })
      .catch(function (e) {
        console.warn('Firestore merge failed:', e);
      });
  }

  function refreshUI() {
    document.querySelectorAll('.topic-card li[data-item-id]').forEach(function (li) {
      var id = li.getAttribute('data-item-id');
      var cb = li.querySelector('.topic-checkbox');
      var bm = li.querySelector('.bookmark-btn');

      if (cb) cb.checked = !!progressData[id];
      li.classList.toggle('completed', !!progressData[id]);

      if (bm) bm.classList.toggle('active', !!bookmarkData[id]);
      li.classList.toggle('bookmarked', !!bookmarkData[id]);
    });
    updateBars();
    updateWeakCount();
  }

  /* ══════════════════════════════════════════
     Auth State Listener
     ══════════════════════════════════════════ */
  document.addEventListener('roadmap-auth-changed', function (e) {
    if (e.detail.user) mergeOnSignIn();
  });

  /* ══════════════════════════════════════════
     Initialization
     ══════════════════════════════════════════ */
  function init() {
    loadLocal();
    generateIds();
    injectControls();
    createBars();
    updateBars();
    updateWeakCount();
    setupWeakToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
