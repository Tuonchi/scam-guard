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

    // Character count with enhanced feedback
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');
    if (messageInput && charCount) {
        messageInput.addEventListener('input', () => {
            const count = messageInput.value.length;
            charCount.textContent = `${count} characters`;
            
            // Add visual feedback for message length
            if (count > 1000) {
                charCount.classList.add('text-orange-600');
                charCount.classList.remove('text-gray-500');
            } else {
                charCount.classList.remove('text-orange-600');
                charCount.classList.add('text-gray-500');
            }
        });
    }

    // Image upload with better error handling
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
                // Validate file type
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    alert('Please upload a valid image file (JPEG, PNG, or WebP)');
                    fileInput.value = '';
                    return;
                }
                
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image file size should be less than 5MB');
                    fileInput.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    uploadArea.classList.add('hidden');
                    imagePreview.classList.remove('hidden');
                };
                reader.onerror = () => {
                    alert('Error reading the image file. Please try again.');
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

    // Analysis with enhanced error handling
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
                showAlert('Please enter a message or upload an image to analyze.', 'warning');
                return;
            }
            if (!senderValue) {
                showAlert('Please select the message sender.', 'warning');
                return;
            }

            // Disable analyze button during processing
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyzing...';
            loading.classList.remove('hidden');
            resultCard.classList.add('hidden');

            try {
                // Simulate processing delay with realistic timing
                setTimeout(async () => {
                    try {
                        const analysisText = textValue || 'Screenshot analysis';
                        const {
                            riskScore,
                            scamReasons,
                            safeReasons,
                            confidence
                        } = await analyzeMessage(analysisText, senderValue);
                        
                        loading.classList.add('hidden');
                        showResults(analysisText, senderValue, riskScore, scamReasons, safeReasons, confidence);
                        
                        // Log analysis for debugging (remove in production)
                        console.log('Analysis completed:', {
                            text: analysisText,
                            sender: senderValue,
                            riskScore,
                            scamReasons: scamReasons.length,
                            safeReasons: safeReasons.length
                        });
                        
                    } catch (error) {
                        console.error('Analysis error:', error);
                        loading.classList.add('hidden');
                        showAlert('Analysis failed. Please try again.', 'error');
                    } finally {
                        analyzeBtn.disabled = false;
                        analyzeBtn.textContent = 'Analyze Message';
                    }
                }, Math.random() * 1000 + 1000); // Random delay between 1-2 seconds
                
            } catch (error) {
                console.error('Unexpected error:', error);
                loading.classList.add('hidden');
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = 'Analyze Message';
                showAlert('An unexpected error occurred. Please try again.', 'error');
            }
        });

        clearBtn.addEventListener('click', () => {
            if (messageInput) messageInput.value = '';
            if (fileInput) fileInput.value = '';
            if (senderSelect) senderSelect.value = '';
            if (charCount) charCount.textContent = '0 characters';
            if (uploadArea) uploadArea.classList.remove('hidden');
            if (imagePreview) imagePreview.classList.add('hidden');
            if (resultCard) resultCard.classList.add('hidden');
            
            // Reset any visual states
            if (charCount) {
                charCount.classList.remove('text-orange-600');
                charCount.classList.add('text-gray-500');
            }
        });
    }

    // Enhanced analysis function with improved pattern matching
    async function analyzeMessage(message, sender) {
        try {

            // Normalize message
            message = message.toLowerCase().trim();


            // Load dictionary dynamically with error handling
            const response = await fetch('/knowledgeBase.json');
            if (!response.ok) {
                throw new Error(`Failed to load knowledge base: ${response.status}`);
            }
            const knowledgeBase = await response.json();

            let scamReasons = [];
            let safeReasons = [];
            let matchedPatterns = [];

            // Enhanced scam pattern matching
            knowledgeBase.scam_patterns.forEach((rule, index) => {
                try {
                    // The patterns already include (?i) flag for case insensitivity
                    const regex = new RegExp(rule.pattern, "gi");
                    const matches = message.match(regex);
                    
                    if (matches && matches.length > 0) {
                        scamReasons.push(rule.reason);
                        matchedPatterns.push({
                            type: 'scam',
                            pattern: rule.pattern,
                            matches: matches,
                            reason: rule.reason
                        });
                    }
                } catch (regexError) {
                    console.warn(`Invalid regex pattern at index ${index}:`, rule.pattern, regexError);
                }
            });

            // Enhanced safe pattern matching
            knowledgeBase.safe_patterns.forEach((rule, index) => {
                try {
                    const regex = new RegExp(rule.pattern, "gi");
                    const matches = message.match(regex);
                    
                    if (matches && matches.length > 0) {
                        safeReasons.push(rule.reason);
                        matchedPatterns.push({
                            type: 'safe',
                            pattern: rule.pattern,
                            matches: matches,
                            reason: rule.reason
                        });
                    }
                } catch (regexError) {
                    console.warn(`Invalid regex pattern at index ${index}:`, rule.pattern, regexError);
                }
            });

            // Enhanced scoring algorithm
            let riskScore = calculateRiskScore(scamReasons, safeReasons, sender, message);
            let confidence = calculateConfidence(matchedPatterns, message);

            // Additional heuristics for Kenyan context
            riskScore = applyKenyanContextHeuristics(message, sender, riskScore);

            // Clamp score between 0 and 100
            riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
            confidence = Math.max(0, Math.min(100, Math.round(confidence)));

            return {
                riskScore,
                scamReasons: [...new Set(scamReasons)], // Remove duplicates
                safeReasons: [...new Set(safeReasons)], // Remove duplicates
                confidence,
                matchedPatterns // For debugging
            };

        } catch (error) {
            console.error('Error in analyzeMessage:', error);
            // Fallback analysis
            return {
                riskScore: 50,
                scamReasons: ['Unable to complete full analysis - please verify manually'],
                safeReasons: [],
                confidence: 25
            };
        }
    }

    // Enhanced risk calculation
    function calculateRiskScore(scamReasons, safeReasons, sender, message) {
        let baseScore = 30; // Neutral starting point

        // Scam indicators add risk
        if (scamReasons.length > 0) {
            baseScore = 65 + (scamReasons.length * 8);
            
            // High-risk patterns get extra weight
            const highRiskKeywords = ['pin', 'otp', 'password', 'urgent', 'winner', 'claim'];
            const messageWords = message.toLowerCase().split(/\s+/);
            const highRiskMatches = messageWords.filter(word => 
                highRiskKeywords.some(keyword => word.includes(keyword))
            );
            
            if (highRiskMatches.length > 0) {
                baseScore += highRiskMatches.length * 5;
            }
        }

        // Safe indicators reduce risk
        if (safeReasons.length > 0 && scamReasons.length === 0) {
            baseScore = Math.max(5, 25 - (safeReasons.length * 4));
        }

        // Sender-based adjustments
        const senderAdjustments = {
            'friend': -20,
            'family': -25,
            'official': -10,
            'unknown': +20,
            'whatsapp_group': +10,
            'social_media': +5
        };

        baseScore += senderAdjustments[sender] || 0;

        // Message length heuristic (very short or very long messages can be suspicious)
        if (message.length < 20 && scamReasons.length > 0) {
            baseScore += 10; // Short urgent messages are often scams
        }
        if (message.length > 500 && scamReasons.length > 0) {
            baseScore += 5; // Very long scam messages
        }

        return baseScore;
    }

    // Calculate confidence level
    function calculateConfidence(matchedPatterns, message) {
        let confidence = 50; // Base confidence

        // More matched patterns = higher confidence
        confidence += Math.min(matchedPatterns.length * 15, 40);

        // Longer messages with matches = higher confidence
        if (message.length > 100 && matchedPatterns.length > 0) {
            confidence += 10;
        }

        // Multiple pattern types = higher confidence
        const hasScamPatterns = matchedPatterns.some(p => p.type === 'scam');
        const hasSafePatterns = matchedPatterns.some(p => p.type === 'safe');
        
        if (hasScamPatterns || hasSafePatterns) {
            confidence += 10;
        }

        return confidence;
    }

    // Apply Kenyan-specific contextual rules
    function applyKenyanContextHeuristics(message, sender, riskScore) {
        const lowerMessage = message.toLowerCase();

        // Common Kenyan scam indicators
        const kenyanScamWords = [
            'mpesa', 'm-pesa', 'safaricom', 'airtel money',
            'ksh', 'shillings', 'loan approved', 'crb',
            'hustler fund', 'helb', 'nssf', 'nhif'
        ];

        const kenyanMatches = kenyanScamWords.filter(word => 
            lowerMessage.includes(word)
        );

        if (kenyanMatches.length > 2 && sender === 'unknown') {
            riskScore += 15; // Multiple Kenyan financial terms from unknown sender
        }

        // Swahili mixed with financial terms
        const swahiliFinancial = [
            'tuma', 'pesa', 'haraka', 'sasa', 'leo',
            'mkopo', 'riba', 'malipo'
        ];

        const swahiliMatches = swahiliFinancial.filter(word =>
            lowerMessage.includes(word)
        );

        if (swahiliMatches.length > 1 && kenyanMatches.length > 1) {
            riskScore += 10;
        }

        return riskScore;
    }

    // Enhanced results display
    function showResults(message, sender, riskScore, scamReasons, safeReasons, confidence) {
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
        }[sender] || 'Unknown';

        senderResult.textContent = senderDisplayText;

        // Enhanced verdict display with confidence
        let riskLevel, riskColor, riskBg;
        
        if (riskScore >= 70) {
            verdictIcon.textContent = '🚨';
            verdictBadge.textContent = 'HIGH RISK';
            riskColor = 'text-red-800';
            riskBg = 'bg-red-100';
            scoreBar.className = 'h-4 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-red-500 to-red-600';
        } else if (riskScore >= 40) {
            verdictIcon.textContent = '⚠️';
            verdictBadge.textContent = 'MEDIUM RISK';
            riskColor = 'text-yellow-800';
            riskBg = 'bg-yellow-100';
            scoreBar.className = 'h-4 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-yellow-500 to-yellow-600';
        } else {
            verdictIcon.textContent = '✅';
            verdictBadge.textContent = 'LOW RISK';
            riskColor = 'text-green-800';
            riskBg = 'bg-green-100';
            scoreBar.className = 'h-4 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-green-500 to-green-600';
        }

        verdictBadge.className = `px-4 py-2 rounded-full text-sm font-bold ${riskBg} ${riskColor}`;
        
        // Animate score bar
        setTimeout(() => {
            scoreBar.style.width = `${riskScore}%`;
        }, 100);
        
        scoreText.innerHTML = `${riskScore}%`;

        // Enhanced reasons list with better formatting
        const allReasons = [
            ...scamReasons.map(r => ({
                text: r,
                icon: '🚨',
                bgColor: 'bg-red-50',
                iconColor: 'text-red-600'
            })),
            ...safeReasons.map(r => ({
                text: r,
                icon: '✅',
                bgColor: 'bg-green-50',
                iconColor: 'text-green-600'
            }))
        ];

        if (allReasons.length > 0) {
            reasonsList.innerHTML = allReasons.map(reason =>
                `<li class="flex items-start gap-3 p-3 ${reason.bgColor} rounded-lg border border-gray-100">
                    <span class="${reason.iconColor} text-lg flex-shrink-0">${reason.icon}</span>
                    <span class="text-gray-700 text-sm leading-relaxed">${reason.text}</span>
                </li>`
            ).join('');
        } else {
            reasonsList.innerHTML = `
                <li class="text-gray-500 text-center py-4 italic">
                    No specific indicators detected. Manual verification recommended.
                </li>
            `;
        }

        // Enhanced safety tips based on risk level and context
        generateSafetyTips(riskScore, sender, scamReasons, safetyTips);

        // Display original message with better formatting
        originalText.textContent = message.length > 200 ? 
            message.substring(0, 200) + '...' : message;

        // Show results with smooth animation
        resultCard.classList.remove('hidden');
        setTimeout(() => {
            resultCard.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 300);
    }

    // Generate contextual safety tips
    function generateSafetyTips(riskScore, sender, scamReasons, safetyTipsElement) {
        let tipsHTML = '';

        if (riskScore >= 70) {
            tipsHTML = `
                <div class="text-red-700 space-y-2">
                    <p class="font-medium flex items-center gap-2">
                        <span class="text-xl">⚠️</span>
                        <strong>DANGER: Clear scam indicators detected!</strong>
                    </p>
                    <ul class="list-disc list-inside space-y-1 text-sm ml-6">
                        <li>DO NOT respond to this message</li>
                        <li>DO NOT provide any personal information, PIN, or passwords</li>
                        <li>DO NOT click any links or call any numbers</li>
                        <li>Block and delete this message immediately</li>
                        <li>Report to relevant authorities if needed</li>
                    </ul>
                </div>
            `;
        } else if (riskScore >= 40) {
            tipsHTML = `
                <div class="text-orange-700 space-y-2">
                    <p class="font-medium flex items-center gap-2">
                        <span class="text-xl">⚠️</span>
                        <strong>CAUTION: Suspicious elements detected</strong>
                    </p>
                    <ul class="list-disc list-inside space-y-1 text-sm ml-6">
                        <li>Verify the sender through a separate communication channel</li>
                        <li>Be skeptical of any urgent requests</li>
                        <li>Don't provide sensitive information without verification</li>
                        <li>Check official websites or call official numbers directly</li>
                    </ul>
                </div>
            `;
        } else {
            const isKnownContact = sender === 'friend' || sender === 'family';
            tipsHTML = `
                <div class="text-green-700 space-y-2">
                    <p class="font-medium flex items-center gap-2">
                        <span class="text-xl">✅</span>
                        <strong>${isKnownContact ? 'Appears safe from trusted contact' : 'Appears safe, but stay vigilant'}</strong>
                    </p>
                    <ul class="list-disc list-inside space-y-1 text-sm ml-6">
                        ${isKnownContact ? 
                            '<li>Message appears normal from a trusted contact</li>' :
                            '<li>Always verify sender identity for financial requests</li>'
                        }
                        <li>Never share PINs, passwords, or OTPs</li>
                        <li>When in doubt, verify through official channels</li>
                    </ul>
                </div>
            `;
        }

        safetyTipsElement.innerHTML = tipsHTML;
    }

    // Utility function to show alerts
    function showAlert(message, type = 'info') {
        // Create a simple alert system (you can replace with a more sophisticated one)
        const alertColors = {
            'success': 'bg-green-100 border-green-400 text-green-700',
            'warning': 'bg-yellow-100 border-yellow-400 text-yellow-700',
            'error': 'bg-red-100 border-red-400 text-red-700',
            'info': 'bg-blue-100 border-blue-400 text-blue-700'
        };

        const alert = document.createElement('div');
        alert.className = `fixed top-4 right-4 z-50 p-4 border rounded-lg ${alertColors[type]} max-w-sm shadow-lg`;
        alert.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 font-bold">×</button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }

    // Smooth scrolling for navigation
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

    // Enhanced mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Enhanced button interactions
    if (analyzeBtn) {
        analyzeBtn.addEventListener('mouseenter', () => {
            if (!analyzeBtn.disabled) {
                analyzeBtn.style.transform = 'scale(1.05)';
            }
        });
        analyzeBtn.addEventListener('mouseleave', () => {
            analyzeBtn.style.transform = 'scale(1)';
        });
    }

    // Auto-resize textarea with better handling
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 200) + 'px'; // Max height limit
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    if (analyzeBtn && !analyzeBtn.disabled) {
                        analyzeBtn.click();
                    }
                    break;
                case 'k':
                    e.preventDefault();
                    if (clearBtn) {
                        clearBtn.click();
                    }
                    break;
            }
        }
    });

    console.log('ScamGuard initialized successfully with enhanced features');
});