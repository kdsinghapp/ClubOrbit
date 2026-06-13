let _promise;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-legacy-src="${src}"]`);
    if (existing) return resolve();

    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.defer = false;
    s.setAttribute("data-legacy-src", src);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

export function loadLegacyScripts() {
  if (_promise) return _promise;

  // jQuery is loaded in index.html to guarantee availability.
  const scriptsInOrder = [
    "/assets/js/bootstrap.bundle.min.js",
    "/assets/plugins/select2/js/select2.min.js",
    "/assets/plugins/owl-carousel/owl.carousel.min.js",
    "/assets/plugins/aos/aos.js",
    "/assets/js/jquery.waypoints.js",
    "/assets/js/jquery.counterup.min.js",
    // Template main JS (contains delegated handlers, etc.)
    "/assets/js/script.js",
    // SPA re-init helper (idempotent, safe to call after route changes)
    "/assets/js/react-spa-init.js",
  ];

  _promise = scriptsInOrder.reduce(
    (p, src) => p.then(() => loadScript(src)),
    Promise.resolve()
  );

  return _promise;
}
