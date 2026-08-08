/* ===== Firebase Configuration ===== */
/* Replace the values below with your own Firebase project config.
 * 1. Go to https://console.firebase.google.com
 * 2. Create a project (or use an existing one)
 * 3. Add a Web app
 * 4. Copy the config object here
 * 5. Enable Authentication → Google + Email/Password providers
 * 6. Enable Cloud Firestore (start in test mode)
 */
(function () {
  'use strict';

  var firebaseConfig = {
    apiKey: 'AIzaSyCTRJDAJRoEUHvfZTYgrqzfQBQKyLKhK34',
    authDomain: 'java-road-map.firebaseapp.com',
    projectId: 'java-road-map',
    storageBucket: 'java-road-map.firebasestorage.app',
    messagingSenderId: '228549402803',
    appId: '1:228549402803:web:31e87e8550079d582890c6',
  };

  window.RoadmapApp = window.RoadmapApp || {};

  // Only initialize if Firebase SDK is loaded AND config is filled in
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== 'YOUR_API_KEY') {
    try {
      firebase.initializeApp(firebaseConfig);
      window.RoadmapApp.auth = firebase.auth();
      window.RoadmapApp.db = firebase.firestore();
      window.RoadmapApp.firebaseReady = true;

      // Enable offline persistence (best-effort)
      window.RoadmapApp.db.enablePersistence().catch(function (err) {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence: multiple tabs open');
        }
      });

      console.info('Firebase initialized — cloud sync enabled.');
    } catch (e) {
      console.warn('Firebase init failed:', e);
      window.RoadmapApp.firebaseReady = false;
    }
  } else {
    window.RoadmapApp.firebaseReady = false;
    if (typeof firebase === 'undefined') {
      console.info('Firebase SDK not loaded. Progress is localStorage-only.');
    } else {
      console.info(
        'Firebase not configured. Edit firebase-config.js with your project credentials to enable cloud sync.'
      );
    }
  }
})();
