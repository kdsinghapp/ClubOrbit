/* Club Orbit SPA re-init helpers for React Router pages.
   Safe to call multiple times. Requires jQuery and (optionally) owlCarousel, select2, AOS.
*/
(function () {
  function initBackToTop($) {
    var wrap = document.querySelector('.progress-wrap');
    var path = document.querySelector('.progress-wrap path');
    if (!wrap || !path || typeof path.getTotalLength !== 'function') return;

    var length = path.getTotalLength();
    path.style.transition = path.style.WebkitTransition = 'none';
    path.style.strokeDasharray = length + ' ' + length;
    path.style.strokeDashoffset = String(length);
    path.getBoundingClientRect();
    path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

    function update() {
      var scroll = $(window).scrollTop();
      var height = $(document).height() - $(window).height();
      var progress = length - (scroll * length / (height || 1));
      path.style.strokeDashoffset = String(progress);
    }

    update();
    $(window).off('scroll.cluborbitProgress').on('scroll.cluborbitProgress', update);

    $(window)
      .off('scroll.cluborbitWrap')
      .on('scroll.cluborbitWrap', function () {
        if ($(this).scrollTop() > 50) $('.progress-wrap').addClass('active-progress');
        else $('.progress-wrap').removeClass('active-progress');
      });

    $('.progress-wrap')
      .off('click.cluborbit')
      .on('click.cluborbit', function (e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 550);
        return false;
      });
  }

  function initOwl($) {
    if (!$.fn || !$.fn.owlCarousel) return;

    function initCarousel(selector, opts) {
      $(selector).each(function () {
        var $el = $(this);
        if ($el.hasClass('owl-loaded')) return;
        try {
          $el.owlCarousel(opts);
        } catch (e) {
          // Ignore if plugin isn't ready
        }
      });
    }

    initCarousel('.featured-venues-slider', {
      loop: true,
      margin: 24,
      nav: true,
      dots: false,
      autoplay: false,
      smartSpeed: 2000,
      navText: ["<i class='feather-chevron-left'></i>", "<i class='feather-chevron-right'></i>"],
      responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 } }
    });

    initCarousel('.featured-coache-slider', {
      loop: true,
      margin: 24,
      nav: true,
      dots: false,
      autoplay: false,
      smartSpeed: 2000,
      navText: ["<i class='feather-chevron-left'></i>", "<i class='feather-chevron-right'></i>"],
      responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 4 } }
    });

    initCarousel('.testimonial-brand-slider', {
      loop: true,
      margin: 60,
      nav: false,
      dots: false,
      autoplay: true,
      smartSpeed: 2000,
      responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 3 }, 1000: { items: 5 } }
    });
  }

  function initSelect2($) {
    if (!$.fn || !$.fn.select2) return;
    $('.select').each(function () {
      var $el = $(this);
      // if select2 already applied, skip
      if ($el.data('select2')) return;
      try {
        $el.select2();
      } catch (e) {}
    });
  }

  function initAOS() {
    if (!window.AOS) return;
    try {
      if (!window.__clubOrbitAOSInited) {
        window.AOS.init({ duration: 1200, once: true });
        window.__clubOrbitAOSInited = true;
      } else {
        if (typeof window.AOS.refreshHard === 'function') window.AOS.refreshHard();
        else if (typeof window.AOS.refresh === 'function') window.AOS.refresh();
      }
    } catch (e) {}
  }

  function hideLoader($) {
    if (!$('#global-loader').length) return;
    try {
      setTimeout(function () {
        $('#global-loader').fadeOut('slow');
      }, 100);
    } catch (e) {}
  }

  function safeInit() {
    var $ = window.jQuery;
    if (!$) return;

    hideLoader($);
    initSelect2($);
    initOwl($);
    initAOS();
    initBackToTop($);
  }

  window.__clubOrbitSpaInit = function () {
    try {
      safeInit();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('ClubOrbit SPA init error:', e);
    }
  };
})();
