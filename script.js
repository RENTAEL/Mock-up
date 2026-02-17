const emailForm = document.getElementById('emailForm');
const emailInput = document.getElementById('emailInput');
const emailResult = document.getElementById('emailResult');

const numberForm = document.getElementById('numberForm');
const numberInput = document.getElementById('numberInput');
const numberResult = document.getElementById('numberResult');

const knownNumbers = new Set([
  '+14155550123',
  '+442071838750',
  '+918888777666',
  '+61293744000'
]);

function setResult(element, message, state) {
  element.textContent = message;
  element.className = `result ${state}`;
}

function normalizeNumber(value) {
  return value.replace(/[\s()-]/g, '');
}

emailForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const basicPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!basicPattern.test(email)) {
    setResult(emailResult, 'Invalid email format. Please review and try again.', 'error');
    return;
  }

  const domain = email.split('@')[1].toLowerCase();
  if (['test.com', 'mailinator.com', 'example.com'].includes(domain)) {
    setResult(emailResult, 'Disposable or demo domain detected. Use a business email.', 'warning');
    return;
  }

  setResult(emailResult, 'Email looks valid and ready for verification flow.', 'success');
});

numberForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const raw = numberInput.value.trim();
  const normalized = normalizeNumber(raw);

  if (!/^\+?\d{8,15}$/.test(normalized)) {
    setResult(numberResult, 'Enter a valid number with 8-15 digits (country code preferred).', 'error');
    return;
  }

  const canonical = normalized.startsWith('+') ? normalized : `+${normalized}`;

  if (knownNumbers.has(canonical)) {
    setResult(numberResult, 'Number exists in records.', 'success');
    return;
  }

  setResult(numberResult, 'Number not found in records.', 'warning');
});
