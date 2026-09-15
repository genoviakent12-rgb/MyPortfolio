/* ==========================================================================
   Kent Genovia — site behaviour
   Every block is null-guarded so this one file can run on every page.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* --- Theme toggle ------------------------------------------------------
     The stored preference is applied by a small inline script in <head> so
     the page never flashes the wrong theme. This just handles the button.  */

  var themeBtn = document.getElementById('theme-toggle');
  var themeIcon = document.getElementById('theme-icon');

  var SUN = 'M12 4V2M12 22v-2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M5.6 18.4l-1.4 1.4M18.4 5.6l1.4-1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z';
  var MOON = 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z';

  function paintThemeIcon(theme) {
    if (!themeIcon) return;
    themeIcon.innerHTML = '<path d="' + (theme === 'dark' ? MOON : SUN) + '"/>';
    if (themeBtn) {
      var next = theme === 'dark' ? 'light' : 'dark';
      themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      themeBtn.setAttribute('title', 'Switch to ' + next + ' theme');
    }
  }

  paintThemeIcon(root.getAttribute('data-theme') || 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      paintThemeIcon(next);
      try { localStorage.setItem('kg-theme', next); } catch (e) { /* private mode */ }
    });
  }


  /* --- Mobile navigation ------------------------------------------------- */

  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');

  function closeNav() {
    if (!navMenu) return;
    navMenu.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = navMenu.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    document.addEventListener('click', function (e) {
      if (!navMenu.classList.contains('is-open')) return;
      if (navMenu.contains(e.target) || navToggle.contains(e.target)) return;
      closeNav();
    });
  }


  /* --- Header shadow on scroll ------------------------------------------- */

  var header = document.querySelector('.site-header');

  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* --- Scroll reveal -----------------------------------------------------
     One light entrance per element, then the observer lets it go.          */

  var revealables = document.querySelectorAll('[data-reveal]');

  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      root.classList.remove('reveal-ready');
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      root.classList.add('reveal-ready');
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var delay = parseInt(entry.target.getAttribute('data-reveal-delay') || '0', 10);
          setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, delay);
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

      revealables.forEach(function (el) { observer.observe(el); });
    }
  }


  /* --- Active section in the nav ------------------------------------------ */

  var sections = document.querySelectorAll('[data-nav-section]');
  var navAnchors = document.querySelectorAll('.nav-links a[href*="#"]');

  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    var setActive = function (id) {
      navAnchors.forEach(function (a) {
        var href = a.getAttribute('href') || '';
        a.classList.toggle('is-active', href.indexOf('#' + id) > -1);
      });
    };

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }


  /* --- Contact form -------------------------------------------------------
     No backend on a static host, so the form opens the visitor's mail app
     with everything pre-filled. Swap the handler for a Formspree / Netlify
     endpoint later and the markup stays exactly the same.                  */

  var form = document.getElementById('contact-form');
  var formNote = document.getElementById('form-note');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var topic = (data.get('topic') || '').toString().trim();
      var message = (data.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        if (formNote) formNote.textContent = 'Add your name, email and a message first.';
        return;
      }

      var subject = topic ? topic + ' — message from ' + name : 'Message from ' + name;
      var body = message + '\n\n—\n' + name + '\n' + email;

      window.location.href =
        'mailto:genovia.kent12@gmail.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      if (formNote) formNote.textContent = 'Opening your mail app…';
    });
  }


  /* --- Profile photo fallback ---------------------------------------------
     If the photo file is missing, show initials instead of a broken image. */

  var photo = document.querySelector('.profile-photo img');
  if (photo) {
    photo.addEventListener('error', function () {
      photo.remove();
      var holder = document.querySelector('.profile-photo');
      if (holder && !holder.querySelector('.initials')) {
        var span = document.createElement('span');
        span.className = 'initials';
        span.textContent = 'KG';
        holder.appendChild(span);
      }
    });
  }

})();