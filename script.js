const toast = document.getElementById('toast');
const tabs = [...document.querySelectorAll('.tab')];
const panels = [...document.querySelectorAll('.verify-panel')];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1600);
}

function activateTab(nextTab) {
  const panelId = nextTab.dataset.panel;

  tabs.forEach((tab) => {
    const active = tab === nextTab;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  panels.forEach((panel) => {
    const active = panel.id === panelId;
    panel.classList.toggle('active', active);
    panel.hidden = !active;
  });
}

document.querySelectorAll('.copy-btn').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    const command = target?.textContent?.trim();

    if (!command) {
      showToast('No command found.');
      return;
    }

    try {
      await navigator.clipboard.writeText(command);
      showToast('Command copied.');
    } catch {
      showToast('Clipboard unavailable in this environment.');
    }
  });
});

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();

    if (event.key === 'Home') return activateTab(tabs[0]);
    if (event.key === 'End') return activateTab(tabs[tabs.length - 1]);

    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (index + direction + tabs.length) % tabs.length;
    activateTab(tabs[nextIndex]);
    tabs[nextIndex].focus();
  });
});

document.querySelectorAll('.submit-btn').forEach((button) => {
  button.addEventListener('click', () => {
    showToast('Mock verification sent.');
  });
});
