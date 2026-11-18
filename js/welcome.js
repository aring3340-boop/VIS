(() => {
  const splash = document.getElementById('welcome-splash');
  if (!splash) return;

  document.documentElement.classList.add('welcome-active');
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    splash.classList.add('welcome-splash--leaving');
    document.documentElement.classList.remove('welcome-active');
    window.setTimeout(() => splash.remove(), 700);
  };

  document.getElementById('welcome-continue')?.addEventListener('click', dismiss);
  window.setTimeout(dismiss, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 700 : 2300);
})();
