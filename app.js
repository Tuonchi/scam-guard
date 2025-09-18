    // Character counter
        const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');
    const loading = document.getElementById('loading');
    const resultCard = document.getElementById('resultCard');
    const verdictBadge = document.getElementById('verdictBadge');
    const verdictIcon = document.getElementById('verdictIcon');
    const scoreBar = document.getElementById('scoreBar');
    const scoreText = document.getElementById('scoreText');
    const reasonsList = document.getElementById('reasonsList');
    const originalText = document.getElementById('originalText');
    const safetyTips = document.getElementById('safetyTips');

    // Character counter
    messageInput.addEventListener('input', () => {
      const count = messageInput.value.length;
      charCount.textContent = `${count} characters`;
      charCount.style.color = count > 1000 ? '#dc2626' : '';
    });

    clearBtn.addEventListener('click', () => {
      messageInput.value = '';
      charCount.textContent = '0 characters';
      charCount.style.color = '';
      resultCard.classList.add('hidden');
      loading.classList.add('hidden');
      messageInput.focus();
    });

    analyzeBtn.addEventListener('click', () => {
      const text = messageInput.value.trim();
      if (!text) {
        messageInput.focus();
        messageInput.style.borderColor = '#dc2626';
        setTimeout(() => {
          messageInput.style.borderColor = '';
        }, 2000);
        return;
      }

      resultCard.classList.add('hidden');
      loading.classList.remove('hidden');

      // Simulate realistic analysis time
      setTimeout(() => {
        loading.classList.add('hidden');
        analyzeMessage(text);
      }, 2000);
    });

    function analyzeMessage(text) {
      const reasons = [];
      let score = 0;
      const textLower = text.toLowerCase();

      const patterns = [
        { name: '🔑 Requests personal credentials (PIN/OTP/Password)', regex: /\b(pin|otp|password|passcode|verification code|cvv|security code)\b/i, weight: 35 },
        { name: '⚡ Creates false urgency', regex: /\b(urgent|immediately|expires|suspend|within 24|act now|limited time)\b/i, weight: 20 },
        { name: '💰 Requests money transfers', regex: /\b(mpesa|send money|deposit|transfer|bitcoin|cryptocurrency|wire)\b/i, weight: 30 },
        { name: '🔗 Contains suspicious links', regex: /(http:\/\/|https:\/\/|bit\.ly|tinyurl|short\.link|click here)/i, weight: 25 },
        { name: '💼 Unrealistic job/money offers', regex: /\b(work from home|earn \$?\d+|guaranteed income|easy money|no experience)\b/i, weight: 20 },
        { name: '🏆 Too-good-to-be-true prizes', regex: /\b(you.*won|congratulations.*winner|claim.*prize|lottery|jackpot)\b/i, weight: 25 },
        { name: '⚠️ Threatens account closure', regex: /\b(account.*suspend|account.*close|verify.*account|update.*details)\b/i, weight: 20 },
        { name: '👤 Impersonates trusted entities', regex: /\b(bank|paypal|amazon|microsoft|apple|government|irs|police)\b/i, weight: 15 },
      ];

      for (const p of patterns) {
        if (p.regex.test(text)) {
          score += p.weight;
          reasons.push(p.name);
        }
      }

      // Grammar and spelling check for additional indicators
      const grammarIssues = (text.match(/\b(recieve|loose|there|your welcome|wont|cant)\b/gi) || []).length;
      if (grammarIssues > 0) {
        score += grammarIssues * 5;
        reasons.push('📝 Contains spelling/grammar errors');
      }

      score = Math.min(100, score);
      
      let verdict, badgeClass, iconBg, iconColor, tips, barColor;

      if (score >= 70) {
        verdict = '🚨 HIGH RISK - Likely Scam';
        badgeClass = 'bg-red-600 text-white';
        iconBg = 'bg-red-600';
        iconColor = 'text-white';
        barColor = '#dc2626';
        tips = '• Never share personal information via text/email<br>• Do not click suspicious links<br>• Contact the organization directly through official channels<br>• Report this message to authorities';
      } else if (score >= 40) {
        verdict = '⚠️ MEDIUM RISK - Be Cautious';
        badgeClass = 'bg-orange-500 text-white';
        iconBg = 'bg-orange-500';
        iconColor = 'text-white';
        barColor = '#f97316';
        tips = '• Verify sender through official channels<br>• Be cautious with any requests<br>• Double-check all links before clicking<br>• Trust your instincts';
      } else {
        verdict = '✅ LOW RISK - Appears Safe';
        badgeClass = 'bg-green-600 text-white';
        iconBg = 'bg-green-600';
        iconColor = 'text-white';
        barColor = '#16a34a';
        tips = '• Message appears legitimate<br>• Still verify sender if unsure<br>• Always practice safe online habits<br>• Report any suspicious activity';
      }

      // Update UI
      verdictBadge.textContent = verdict;
      verdictBadge.className = `px-6 py-2 rounded-full text-lg font-bold ${badgeClass}`;

      verdictIcon.className = `w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`;
      verdictIcon.innerHTML = `<svg class="w-6 h-6 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${score >= 70 ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : score >= 40 ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M5 13l4 4L19 7'}"/>
      </svg>`;

      // Animate score bar
      setTimeout(() => {
        scoreBar.style.width = score + '%';
        scoreBar.style.background = barColor;
      }, 100);
      
      scoreText.textContent = score + '%';

      // Update reasons
      reasonsList.innerHTML = '';
      if (reasons.length === 0) {
        reasonsList.innerHTML = '<li class="flex items-start gap-2"><span class="text-green-600">✓</span><span>No major warning signs detected</span></li>';
      } else {
        reasons.forEach(reason => {
          const li = document.createElement('li');
          li.className = 'flex items-start gap-2';
          li.innerHTML = `<span class="text-orange-600 mt-1">•</span><span>${reason}</span>`;
          reasonsList.appendChild(li);
        });
      }

      safetyTips.innerHTML = tips;
      originalText.textContent = text;
      
      resultCard.classList.remove('hidden');
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Add enter key support
    messageInput.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        analyzeBtn.click();
      }
    });

    // Focus on input when page loads
    window.addEventListener('load', () => {
      messageInput.focus();
    });
