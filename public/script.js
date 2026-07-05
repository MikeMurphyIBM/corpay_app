// script.js — Corpay 2025 Annual Report
// Accordion observations, smooth scroll, active nav highlighting.

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // 1. ACCORDION — click header to expand/collapse observations
  // ------------------------------------------------------------------
  document.querySelectorAll('.observation__header').forEach(function (header) {
    header.addEventListener('click', function () {
      var observation = this.closest('.observation');
      var isOpen = observation.classList.contains('is-open');

      // Close all
      document.querySelectorAll('.observation').forEach(function (obs) {
        obs.classList.remove('is-open');
        obs.querySelector('.observation__header').setAttribute('aria-expanded', 'false');
      });

      // Open clicked one if it was closed
      if (!isOpen) {
        observation.classList.add('is-open');
        this.setAttribute('aria-expanded', 'true');
        // Scroll into view smoothly
        setTimeout(function () {
          observation.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    });

    // Keyboard support
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // ------------------------------------------------------------------
  // 2. CONTINUE READING buttons — open next observation
  // ------------------------------------------------------------------
  document.querySelectorAll('.continue-link').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var nextId = this.getAttribute('data-next');
      var target = document.getElementById(nextId);
      if (!target) return;

      // If it's an observation, open it
      if (target.classList.contains('observation')) {
        // Close all, open next
        document.querySelectorAll('.observation').forEach(function (obs) {
          obs.classList.remove('is-open');
          obs.querySelector('.observation__header').setAttribute('aria-expanded', 'false');
        });
        target.classList.add('is-open');
        target.querySelector('.observation__header').setAttribute('aria-expanded', 'true');
      }

      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    });
  });

  // ------------------------------------------------------------------
  // 3. HERO CTA — scroll to first observation
  // ------------------------------------------------------------------
  var heroCta = document.getElementById('hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', function () {
      var first = document.getElementById('obs-1');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ------------------------------------------------------------------
  // 4. CLOSING CTA — scroll to top
  // ------------------------------------------------------------------
  var closingCta = document.getElementById('closing-cta');
  if (closingCta) {
    closingCta.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ------------------------------------------------------------------
  // 5. SMOOTH SCROLL — all anchor links
  // ------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();

      // If it's an observation, open it first
      if (target.classList.contains('observation')) {
        document.querySelectorAll('.observation').forEach(function (obs) {
          obs.classList.remove('is-open');
          obs.querySelector('.observation__header').setAttribute('aria-expanded', 'false');
        });
        target.classList.add('is-open');
        target.querySelector('.observation__header').setAttribute('aria-expanded', 'true');
      }

      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    });
  });

  // ------------------------------------------------------------------
  // 6. ACTIVE NAV — IntersectionObserver on observations
  // ------------------------------------------------------------------
  var sideNavItems = document.querySelectorAll('.side-nav__item[data-section]');
  var mobileNavItems = document.querySelectorAll('.mobile-nav a');

  function setActiveNav(sectionId) {
    sideNavItems.forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-section') === sectionId);
    });
    mobileNavItems.forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('href') === '#' + sectionId);
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
        setActiveNav(entry.target.id);
      }
    });
  }, { threshold: [0.2, 0.5] });

  document.querySelectorAll('.observation').forEach(function (obs) {
    observer.observe(obs);
  });

})();
