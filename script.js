const STORAGE_KEY = 'verifyHubSession';

const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginResult = document.getElementById('loginResult');

const authView = document.getElementById('authView');
const appView = document.getElementById('appView');
const activeUser = document.getElementById('activeUser');
const logoutBtn = document.getElementById('logoutBtn');

const emailForm = document.getElementById('emailForm');
const emailInput = document.getElementById('emailInput');
const emailResult = document.getElementById('emailResult');

const numberForm = document.getElementById('numberForm');
const numberInput = document.getElementById('numberInput');
const numberResult = document.getElementById('numberResult');

const savedList = document.getElementById('savedList');

const knownNumbers = new Set(['+14155550123', '+442071838750', '+918888777666', '+61293744000']);
const riskyDomains = new Set(['mailinator.com', '10minutemail.com', 'example.com', 'test.com']);

function setResult(element, message, state) {
  element.textContent = message;
  element.className = `result ${state}`;
}

function normalizeNumber(value) {
  return value.replace(/[\s()-]/g, '');
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function setAuthState(isLoggedIn, session) {
  authView.classList.toggle('hidden', isLoggedIn);
  appView.classList.toggle('hidden', !isLoggedIn);
  appView.setAttribute('aria-hidden', String(!isLoggedIn));

  if (isLoggedIn && session) {
    activeUser.textContent = session.userEmail;
  }
}

function updateSavedList(session) {
  const items = [];
  if (session?.userEmail) {
    items.push(`Logged user: ${session.userEmail}`);
  }
  if (session?.lastEmailScan) {
    items.push(`Last email scan: ${session.lastEmailScan}`);
  }
  if (session?.lastNumberCheck) {
    items.push(`Last number check: ${session.lastNumberCheck}`);
  }

  savedList.innerHTML = items.length
    ? items.map((item) => `<li>${item}</li>`).join('')
    : '<li>No saved data yet.</li>';
}

async function hasMxRecords(domain) {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`;
  const response = await fetch(url, { headers: { Accept: 'application/dns-json' } });
  if (!response.ok) {
    throw new Error('DNS request failed');
  }

  const data = await response.json();
  return Array.isArray(data.Answer) && data.Answer.length > 0;
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailPattern.test(email)) {
    setResult(loginResult, 'Please enter a valid login email.', 'error');
    return;
  }

  if (password.length < 6) {
    setResult(loginResult, 'Password must be at least 6 characters.', 'error');
    return;
  }

  const existing = readSession() || {};
  const updated = { ...existing, userEmail: email };
  saveSession(updated);
  updateSavedList(updated);
  setAuthState(true, updated);
  setResult(loginResult, 'Logged in successfully.', 'success');
});

logoutBtn.addEventListener('click', () => {
  clearSession();
  setAuthState(false);
  updateSavedList(null);
  loginForm.reset();
  setResult(loginResult, 'Logged out and local session cleared.', 'warning');
});

emailForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  const basicPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!basicPattern.test(email)) {
    setResult(emailResult, 'Invalid email format.', 'error');
    return;
  }

  const domain = email.split('@')[1];
  if (riskyDomains.has(domain)) {
    setResult(emailResult, 'This looks like a disposable/demo domain.', 'warning');
    return;
  }

  setResult(emailResult, 'Scanning domain activity…', 'warning');

  try {
    const hasMx = await hasMxRecords(domain);
    const state = hasMx ? 'success' : 'warning';
    const text = hasMx
      ? 'Domain has active MX records. Email appears likely deliverable.'
      : 'No MX records found. Email may be inactive or unable to receive mail.';
    setResult(emailResult, text, state);

    const existing = readSession() || {};
    const updated = { ...existing, lastEmailScan: `${email} → ${text}` };
    saveSession(updated);
    updateSavedList(updated);
  } catch {
    const fallback =
      'Could not run live DNS scan in this environment. Format passed, but activity not confirmed.';
    setResult(emailResult, fallback, 'warning');

    const existing = readSession() || {};
    const updated = { ...existing, lastEmailScan: `${email} → ${fallback}` };
    saveSession(updated);
    updateSavedList(updated);
  }
});

numberForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const raw = numberInput.value.trim();
  const normalized = normalizeNumber(raw);

  if (!/^\+?\d{8,15}$/.test(normalized)) {
    setResult(numberResult, 'Enter a valid number with 8-15 digits.', 'error');
    return;
  }

  const canonical = normalized.startsWith('+') ? normalized : `+${normalized}`;
  const exists = knownNumbers.has(canonical);
  const text = exists ? 'Number exists in records.' : 'Number not found in records.';

  setResult(numberResult, text, exists ? 'success' : 'warning');

  const existing = readSession() || {};
  const updated = { ...existing, lastNumberCheck: `${canonical} → ${text}` };
  saveSession(updated);
  updateSavedList(updated);
});

const session = readSession();
if (session?.userEmail) {
  setAuthState(true, session);
}
updateSavedList(session);
