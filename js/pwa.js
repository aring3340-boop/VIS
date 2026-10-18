if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('./sw.js').catch(error => {
    console.error('Could not register the VIS offline shell:', error);
  });
}

let installPromptEvent = null;
const installButton = document.getElementById('install-app');
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPromptEvent = event;
  if (installButton) installButton.hidden = false;
});
window.addEventListener('appinstalled', () => {
  installPromptEvent = null;
  if (installButton) installButton.hidden = true;
});
if (installButton) installButton.addEventListener('click', async () => {
  if (!installPromptEvent) return;
  await installPromptEvent.prompt();
  await installPromptEvent.userChoice;
  installPromptEvent = null;
  installButton.hidden = true;
});
