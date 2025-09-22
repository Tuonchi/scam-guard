// === DOM Elements ===
const $ = (id) => document.getElementById(id);

const analyzeBtn = $('analyzeBtn');
const clearBtn = $('clearBtn');
const messageInput = $('messageInput');
const charCount = $('charCount');
const loading = $('loading');
const resultCard = $('resultCard');
const verdictBadge = $('verdictBadge');
const verdictIcon = $('verdictIcon');
const scoreBar = $('scoreBar');
const scoreText = $('scoreText');
const reasonsList = $('reasonsList');
const originalText = $('originalText');
const safetyTips = $('safetyTips');

// === Risk Patterns ===
const riskPatterns = [
  { name: '🔑 Requests personal credentials', regex: /\b(pin|otp|password|passcode|verification code|cvv|account number)\b/i, weight: 35 },
  { name: '⚡ Creates false urgency', regex: /\b(urgent|immediately|expires|suspend|act now|last chance)\b/i, weight: 20 },
  { name: '💰 Requests money transfers', regex: /\b(mpesa|send money|deposit|transfer|bitcoin|gift cards|paypal|western union)\b/i, weight: 30 },
  { name: '🔗 Contains suspicious links', regex: /(https?:\/\/|bit\.ly|tinyurl|click here)/i, weight: 25 },
  { name: '💼 Unrealistic job/money offers', regex: /\b(work from home|earn \$?\d+|guaranteed income|no experience)\b/i, weight: 20 },
  { name: '🏆 Too-good-to-be-true prizes', regex: /\b(won|winner|claim.*prize|lottery|jackpot|free iphone)\b/i, weight: 25 },
  { name: '⚠️ Threatens account closure', regex: /\b(account.*(suspend|close|restricted))\b/i, weight: 20 },
  { name: '👤 Impersonates trusted entities', regex: /\b(kcb|equity|safaricom|paypal|amazon|gov)\b/i, weight: 15 },
  { name: '🔐 Requests login credentials', regex: /\b(login|username|password|account access)\b/i, weight: 30 },
  { name: '📈 Unrealistic investments', regex: /\b(investment|quick profit|forex|crypto|returns)\b/i, weight: 25 },
  { name: '💳 Credit card fraud', regex: /\b(credit card|cvv|billing information)\b/i, weight: 25 },
  { name: '🔒 Social engineering', regex: /\b(help|assist|emergency|stuck|urgent help)\b/i, weight: 20 },
  { name: '💼 Fake invoices/bills', regex: /\b(invoice|payment due|balance owed)\b/i, weight: 20 },
];

// === Utility Functions ===
function resetUI() {
  resultCard.classList.add('hidden');
  loading.classList.add('hidden');
  charCount.textContent = '0 characters';
  messageInput.style.borderColor = '';
  messageInput.focus();
}

function updateCharCount() {
  const count = messageInput.value.length;
  charCount.textContent = `${count} characters`;
  charCount.style.color = count > 1000 ? '#dc2626' : '';
}

// === Risk Score & Verdict Logic ===
function analyzeMessage(text) {
  let score = 0;
  const reasons = [];

  riskPatterns.forEach(({ name, regex, weight }) => {
    if (regex.test(text)) {
      score += weight;
      reasons.push({ name, weight });
    }
  });

  const grammarMatches = (text.match(/\b(recieve|loose|your welcome|wont|cant|to recieve|youre)\b/gi) || []).length;
  if (grammarMatches > 0) {
    score += grammarMatches * 5;
    reasons.push({ name: '📝 Contains spelling/grammar errors', weight: grammarMatches * 5 });
  }

  score = Math.min(100, score);
  return { score, reasons };
}

function displayResults(score, reasons, text) {
  let verdict, badgeClass, iconPath, barColor, tips;

  if (score >= 70) {
    verdict = '🚨 HIGH RISK - Likely Scam';
    badgeClass = 'bg-red-600 text-white';
    iconPath = 'M6 18L18 6M6 6l12 12'; // X icon
    barColor = '#dc2626';
    tips = `
      • Never share personal information<br>
      • Avoid clicking links<br>
      • Verify sender through official channels<br>
      • Report suspicious messages
    `;
    if (navigator.vibrate) navigator.vibrate(200); // vibrate on high risk
  } else if (score >= 40) {
    verdict = '⚠️ MEDIUM RISK - Be Cautious';
    badgeClass = 'bg-orange-500 text-white';
    iconPath = 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'; // exclamation
    barColor = '#f97316';
    tips = `
      • Be cautious with personal info<br>
      • Verify links and offers<br>
      • Use official contact numbers<br>
      • Report if unsure
    `;
  } else {
    verdict = '✅ LOW RISK - Appears Safe';
    badgeClass = 'bg-green-600 text-white';
    iconPath = 'M5 13l4 4L19 7'; // checkmark
    barColor = '#16a34a';
    tips = `
      • Message appears legitimate<br>
      • Still verify the sender<br>
      • Stay alert for future scams
    `;
  }

  verdictBadge.textContent = verdict;
  verdictBadge.className = `px-6 py-2 rounded-full text-lg font-bold ${badgeClass}`;
  verdictIcon.className = `w-10 h-10 rounded-full flex items-center justify-center ${badgeClass}`;
  verdictIcon.innerHTML = `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}" />
  </svg>`;

  scoreText.textContent = `${score}%`;
  scoreBar.style.width = `${score}%`;
  scoreBar.style.background = barColor;

  // Color-coded reasons
  reasonsList.innerHTML = reasons.length
    ? reasons.map(r => {
        const color = r.weight >= 30 ? 'text-red-600' : r.weight >= 15 ? 'text-orange-600' : 'text-yellow-600';
        return `<li class="flex items-start gap-2"><span class="${color} mt-1">•</span><span>${r.name} (+${r.weight})</span></li>`;
      }).join('')
    : `<li class="flex items-start gap-2"><span class="text-green-600">✓</span><span>No major warning signs detected</span></li>`;

  safetyTips.innerHTML = tips;
  originalText.textContent = text;

  // Add Copy button dynamically
  const copyBtn = document.createElement('button');
  copyBtn.textContent = '📋 Copy Report';
  copyBtn.className = 'mt-3 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm';
  copyBtn.onclick = () => {
    const report = `Message:\n${text}\n\nVerdict: ${verdict}\nScore: ${score}%\n\nReasons:\n${reasons.map(r => `- ${r.name}`).join('\n')}\n\nTips:\n${tips.replace(/<br>/g, '\n')}`;
    navigator.clipboard.writeText(report);
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => (copyBtn.textContent = '📋 Copy Report'), 2000);
  };

  // Ensure no duplicates
  safetyTips.parentNode.appendChild(copyBtn);

  resultCard.classList.remove('hidden');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// === Event Listeners ===
messageInput.addEventListener('input', updateCharCount);

clearBtn.addEventListener('click', () => {
  messageInput.value = '';
  resetUI();
});

analyzeBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();
  if (!text) {
    messageInput.style.borderColor = '#dc2626';
    setTimeout(() => (messageInput.style.borderColor = ''), 2000);
    return;
  }

  resultCard.classList.add('hidden');
  loading.classList.remove('hidden');

  setTimeout(() => {
    loading.classList.add('hidden');
    const result = analyzeMessage(text);
    displayResults(result.score, result.reasons, text);
  }, 1500);
});

messageInput.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') analyzeBtn.click();
});

window.addEventListener('load', () => {
  messageInput.focus();
  updateCharCount();
});
