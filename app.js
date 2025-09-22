// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing ScamGuard');

    // Tab switching
    const textTab = document.getElementById('textTab');
    const imageTab = document.getElementById('imageTab');
    const textInput = document.getElementById('textInput');
    const imageInput = document.getElementById('imageInput');

    if (textTab && imageTab && textInput && imageInput) {
        textTab.addEventListener('click', () => {
            textTab.classList.add('bg-white', 'shadow-sm', 'text-primary');
            textTab.classList.remove('text-gray-600');
            imageTab.classList.remove('bg-white', 'shadow-sm', 'text-primary');
            imageTab.classList.add('text-gray-600');
            textInput.classList.remove('hidden');
            imageInput.classList.add('hidden');
        });

        imageTab.addEventListener('click', () => {
            imageTab.classList.add('bg-white', 'shadow-sm', 'text-primary');
            imageTab.classList.remove('text-gray-600');
            textTab.classList.remove('bg-white', 'shadow-sm', 'text-primary');
            textTab.classList.add('text-gray-600');
            imageInput.classList.remove('hidden');
            textInput.classList.add('hidden');
        });
    }

    // Character count
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');
    if (messageInput && charCount) {
        messageInput.addEventListener('input', () => {
            const count = messageInput.value.length;
            charCount.textContent = `${count} characters`;
        });
    }

    // Image upload
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImage = document.getElementById('removeImage');

    if (uploadArea && fileInput && imagePreview && previewImg && removeImage) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    uploadArea.classList.add('hidden');
                    imagePreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });

        removeImage.addEventListener('click', () => {
            fileInput.value = '';
            uploadArea.classList.remove('hidden');
            imagePreview.classList.add('hidden');
        });
    }

    // Analysis
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const loading = document.getElementById('loading');
    const resultCard = document.getElementById('resultCard');
    const senderSelect = document.getElementById('senderSelect');

    if (analyzeBtn && clearBtn && loading && resultCard && senderSelect) {
        analyzeBtn.addEventListener('click', async () => {
            const textValue = messageInput ? messageInput.value.trim() : '';
            const hasImage = fileInput && fileInput.files.length > 0;
            const senderValue = senderSelect.value;

            if (!textValue && !hasImage) {
                alert('Please enter a message or upload an image to analyze.');
                return;
            }
            if (!senderValue) {
                alert('Please select the message sender.');
                return;
            }

            loading.classList.remove('hidden');
            resultCard.classList.add('hidden');

            // Simulate processing delay
            setTimeout(async () => {
                loading.classList.add('hidden');
                const {
                    riskScore,
                    scamReasons,
                    safeReasons
                } = await analyzeMessage(textValue || 'Screenshot analysis', senderValue);
                showResults(textValue || 'Screenshot analysis complete', senderValue, riskScore, scamReasons, safeReasons);
            }, 1500);
        });

        clearBtn.addEventListener('click', () => {
            if (messageInput) messageInput.value = '';
            if (fileInput) fileInput.value = '';
            if (senderSelect) senderSelect.value = '';
            if (charCount) charCount.textContent = '0 characters';
            if (uploadArea) uploadArea.classList.remove('hidden');
            if (imagePreview) imagePreview.classList.add('hidden');
            if (resultCard) resultCard.classList.add('hidden');
        });
    }

    // Dynamic analysis using JSON dictionary
    async function analyzeMessage(message, sender) {
        // Load dictionary dynamically
        const knowledgeBase = await fetch('/knowledgeBase.json').then(res => res.json());

        let scamReasons = [];
        let safeReasons = [];

        // Scam pattern matching
        knowledgeBase.scam_patterns.forEach(rule => {
            const regex = new RegExp(rule.pattern, "gi");
            if (regex.test(message)) {
                scamReasons.push(rule.reason);
            }
        });

        // Safe pattern matching
        knowledgeBase.safe_patterns.forEach(rule => {
            const regex = new RegExp(rule.pattern, "gi");
            if (regex.test(message)) {
                safeReasons.push(rule.reason);
            }
        });

        // Decide score
        let riskScore = 0;
        if (scamReasons.length > 0) {
            riskScore = 70 + scamReasons.length * 5;
        } else {
            riskScore = 20 - safeReasons.length * 3;
        }

        // Adjust based on sender
        if (sender === 'friend' || sender === 'family') riskScore -= 15;
        if (sender === 'unknown') riskScore += 15;

        // Clamp
        riskScore = Math.max(0, Math.min(100, riskScore));

        return {
            riskScore,
            scamReasons,
            safeReasons
        };
    }

    function showResults(message, sender, riskScore, scamReasons, safeReasons) {
        const verdictIcon = document.getElementById('verdictIcon');
        const verdictBadge = document.getElementById('verdictBadge');
        const scoreBar = document.getElementById('scoreBar');
        const scoreText = document.getElementById('scoreText');
        const reasonsList = document.getElementById('reasonsList');
        const safetyTips = document.getElementById('safetyTips');
        const originalText = document.getElementById('originalText');
        const senderResult = document.getElementById('senderResult');

        // Verdict UI
        if (riskScore >= 70) {
            verdictIcon.textContent = '🚨';
            verdictBadge.textContent = 'HIGH RISK';
            verdictBadge.className = 'px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-800';
            scoreBar.className = 'h-4 rounded-full transition-all bg-gradient-to-r from-red-500 to-red-600';
        } else if (riskScore >= 40) {
            verdictIcon.textContent = '⚠️';
            verdictBadge.textContent = 'MEDIUM RISK';
            verdictBadge.className = 'px-4 py-2 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800';
            scoreBar.className = 'h-4 rounded-full transition-all bg-gradient-to-r from-yellow-500 to-yellow-600';
        } else {
            verdictIcon.textContent = '✅';
            verdictBadge.textContent = 'LOW RISK';
            verdictBadge.className = 'px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800';
            scoreBar.className = 'h-4 rounded-full transition-all bg-gradient-to-r from-green-500 to-green-600';
        }

        scoreBar.style.width = `${riskScore}%`;
        scoreText.textContent = `${riskScore}%`;
        senderResult.textContent = sender;

        // Detection reasons (🚨 for scam, ✅ for safe)
        let reasonsHTML = '';
        scamReasons.forEach(reason => {
            reasonsHTML += `
      <li class="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
        <span class="text-red-600">🚨</span>
        <span class="text-gray-700">${reason}</span>
      </li>`;
        });
        safeReasons.forEach(reason => {
            reasonsHTML += `
      <li class="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
        <span class="text-green-600">✅</span>
        <span class="text-gray-700">${reason}</span>
      </li>`;
        });

        reasonsList.innerHTML = reasonsHTML || `
    <li class="text-gray-500">No significant indicators detected</li>
  `;

        // Safety tips
        if (riskScore >= 70) {
            safetyTips.innerHTML = '<p class="text-red-700 font-medium">⚠️ Clear scam indicators. Do not reply, delete and block sender.</p>';
        } else if (riskScore >= 40) {
            safetyTips.innerHTML = '<p class="text-orange-700 font-medium">⚠️ Be cautious. Verify sender before taking any action.</p>';
        } else {
            safetyTips.innerHTML = '<p class="text-green-700 font-medium">✅ Appears safe, but remain alert.</p>';
        }

        // Original message
        originalText.textContent = message;

        document.getElementById('resultCard').classList.remove('hidden');
    }

    // Display results
    function showResults(message, sender, riskScore, scamReasons, safeReasons) {
        const verdictIcon = document.getElementById('verdictIcon');
        const verdictBadge = document.getElementById('verdictBadge');
        const scoreBar = document.getElementById('scoreBar');
        const scoreText = document.getElementById('scoreText');
        const reasonsList = document.getElementById('reasonsList');
        const safetyTips = document.getElementById('safetyTips');
        const originalText = document.getElementById('originalText');
        const senderResult = document.getElementById('senderResult');

        const senderDisplayText = {
            'unknown': 'Unknown SMS/WhatsApp Message',
            'whatsapp_group': 'WhatsApp Group',
            'friend': 'A Friend',
            'family': 'Family Member',
            'official': 'Official Company/Bank',
            'social_media': 'Social Media Contact'
        } [sender] || 'Unknown';

        senderResult.textContent = senderDisplayText;

        // Verdict
        if (riskScore >= 70) {
            verdictIcon.textContent = '🚨';
            verdictBadge.textContent = 'HIGH RISK';
            verdictBadge.className = 'px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-800';
            scoreBar.className = 'h-4 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-red-500 to-red-600';
        } else if (riskScore >= 40) {
            verdictIcon.textContent = '⚠️';
            verdictBadge.textContent = 'MEDIUM RISK';
            verdictBadge.className = 'px-4 py-2 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800';
            scoreBar.className = 'h-4 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-yellow-500 to-yellow-600';
        } else {
            verdictIcon.textContent = '✅';
            verdictBadge.textContent = 'LOW RISK';
            verdictBadge.className = 'px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800';
            scoreBar.className = 'h-4 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-green-500 to-green-600';
        }

        scoreBar.style.width = `${riskScore}%`;
        scoreText.textContent = `${riskScore}%`;

        // Reasons list
        const allReasons = [
            ...scamReasons.map(r => ({
                text: r,
                icon: '🚨',
                color: 'text-red-600'
            })),
            ...safeReasons.map(r => ({
                text: r,
                icon: '✅',
                color: 'text-green-600'
            }))
        ];

        reasonsList.innerHTML = allReasons.map(reason =>
            `<li class="flex items-start gap-2 p-2 bg-white rounded-lg">
        <span class="${reason.color}">${reason.icon}</span>
        <span class="text-gray-700">${reason.text}</span>
      </li>`
        ).join('');

        // Safety tips
        if (riskScore >= 70) {
            safetyTips.innerHTML = '<p class="text-red-700 font-medium">⚠️ This message shows clear scam indicators. Do not respond or provide any personal information. Delete the message and block the sender if possible.</p>';
        } else if (riskScore >= 40) {
            safetyTips.innerHTML = '<p class="text-orange-700 font-medium">⚠️ Exercise caution. Verify the sender before taking any action.</p>';
        } else {
            if (sender === 'friend' || sender === 'family') {
                safetyTips.innerHTML = '<p class="text-green-700 font-medium">✅ This message appears safe and is from a trusted contact. Still, remain cautious with personal information.</p>';
            } else {
                safetyTips.innerHTML = '<p class="text-green-700 font-medium">✅ This message appears safe, but always verify the sender if unsure.</p>';
            }
        }

        originalText.textContent = message;
        resultCard.classList.remove('hidden');
        resultCard.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                const mobileMenu = document.getElementById('mobileMenu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Button animation
    if (analyzeBtn) {
        analyzeBtn.addEventListener('mouseenter', () => {
            analyzeBtn.style.transform = 'scale(1.05)';
        });
        analyzeBtn.addEventListener('mouseleave', () => {
            analyzeBtn.style.transform = 'scale(1)';
        });
    }

    // Auto-resize textarea
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }

    console.log('ScamGuard initialized successfully');
});