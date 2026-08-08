/* ===== Authentication — Google + Email Sign-In ===== */
(function () {
  'use strict';

  var app = (window.RoadmapApp = window.RoadmapApp || {});

  function init() {
    var signInBtn = document.getElementById('signInBtn');
    var userMenu = document.getElementById('userMenu');
    var userAvatar = document.getElementById('userAvatar');
    var userName = document.getElementById('userName');
    var signOutBtn = document.getElementById('signOutBtn');
    var authModal = document.getElementById('authModal');
    var authModalClose = document.getElementById('authModalClose');
    var googleSignInBtn = document.getElementById('googleSignInBtn');
    var emailAuthForm = document.getElementById('emailAuthForm');
    var authEmail = document.getElementById('authEmail');
    var authPassword = document.getElementById('authPassword');
    var authSubmitBtn = document.getElementById('authSubmitBtn');
    var authToggleBtn = document.getElementById('authToggleBtn');
    var authToggleText = document.getElementById('authToggleText');
    var authError = document.getElementById('authError');

    var isSignUp = false;

    // If Firebase isn't ready, hide sign-in and exit
    if (!app.firebaseReady) {
      if (signInBtn) signInBtn.style.display = 'none';
      return;
    }

    /* ── Modal Controls ── */
    function openModal() {
      authModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      authModal.style.display = 'none';
      document.body.style.overflow = '';
      if (authError) authError.textContent = '';
    }

    signInBtn.addEventListener('click', openModal);
    authModalClose.addEventListener('click', closeModal);

    authModal.addEventListener('click', function (e) {
      if (e.target === authModal) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && authModal.style.display === 'flex') closeModal();
    });

    /* ── Google Sign-In ── */
    googleSignInBtn.addEventListener('click', function () {
      authError.textContent = '';
      var provider = new firebase.auth.GoogleAuthProvider();
      app.auth
        .signInWithPopup(provider)
        .then(function () {
          closeModal();
        })
        .catch(function (err) {
          if (err.code !== 'auth/popup-closed-by-user') {
            authError.textContent = err.message;
          }
        });
    });

    /* ── Email Sign-In / Sign-Up ── */
    emailAuthForm.addEventListener('submit', function (e) {
      e.preventDefault();
      authError.textContent = '';
      var email = authEmail.value.trim();
      var password = authPassword.value;

      var promise = isSignUp
        ? app.auth.createUserWithEmailAndPassword(email, password)
        : app.auth.signInWithEmailAndPassword(email, password);

      promise
        .then(function () {
          closeModal();
        })
        .catch(function (err) {
          authError.textContent = err.message;
        });
    });

    /* ── Toggle Sign-In / Sign-Up Mode ── */
    authToggleBtn.addEventListener('click', function () {
      isSignUp = !isSignUp;
      authSubmitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
      authToggleText.textContent = isSignUp
        ? 'Already have an account?'
        : "Don't have an account?";
      authToggleBtn.textContent = isSignUp ? 'Sign In' : 'Sign Up';
      authError.textContent = '';
    });

    /* ── Sign Out ── */
    signOutBtn.addEventListener('click', function () {
      app.auth.signOut();
    });

    /* ── Auth State Observer ── */
    app.auth.onAuthStateChanged(function (user) {
      app.user = user;

      if (user) {
        signInBtn.style.display = 'none';
        userMenu.style.display = 'flex';

        if (user.photoURL) {
          userAvatar.src = user.photoURL;
          userAvatar.style.display = '';
        } else {
          userAvatar.style.display = 'none';
        }

        userName.textContent = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
      } else {
        signInBtn.style.display = '';
        userMenu.style.display = 'none';
        app.user = null;
      }

      // Notify progress module
      document.dispatchEvent(
        new CustomEvent('roadmap-auth-changed', { detail: { user: user } })
      );
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
