let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('installBtn');
  btn.style.display = 'inline-block';
  btn.onclick = async () => {
    if (!deferredPrompt) return alert('No momento, instale manualmente: Compartilhar → Adicionar à Tela Inicial.');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') deferredPrompt = null;
  };
});

// Registrar service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}

const askPermBtn = document.getElementById('askPerm');
const nowBtn = document.getElementById('notifyNow');
const laterBtn = document.getElementById('notifyLater');

async function ensurePermission() {
  if (!('Notification' in window)) {
    alert('Seu navegador não suporta Notificações.');
    return false;
  }
  let perm = Notification.permission;
  if (perm === 'default') {
    perm = await Notification.requestPermission();
  }
  if (perm !== 'granted') {
    alert('Permissão negada. Ative nas configurações do sistema.');
    return false;
  }
  return true;
}

askPermBtn.onclick = ensurePermission;

function getFormData() {
  const title = document.getElementById('titleInput').value || '';
  const body = document.getElementById('bodyInput').value || '';
  const icon = document.getElementById('iconInput').value || 'icons/images.png';
  return { title, body, icon };
}

// Disparar agora
nowBtn.onclick = async () => {
  const ok = await ensurePermission();
  if (!ok) return;

  const { title, body, icon } = getFormData();

  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      payload: { title, body, icon }
    });
  } else {
    new Notification(title, { body, icon });
  }
};

// Agendar com X segundos (somente com app aberto)
laterBtn.onclick = async () => {
  const ok = await ensurePermission();
  if (!ok) return;
  const { title, body, icon } = getFormData();
  const seconds = Math.max(1, parseInt(document.getElementById('delaySec').value || '3', 10));

  setTimeout(() => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: { title, body, icon }
      });
    } else {
      new Notification(title, { body, icon });
    }
  }, seconds * 1000);

  alert(`Notificação em ${seconds}s (mantendo o app aberto).`);
};
