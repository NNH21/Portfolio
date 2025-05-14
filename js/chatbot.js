// AI Chatbot with Gemini API and Zalo support
document.addEventListener('DOMContentLoaded', function() {
    // Check if config is available
    if (typeof CHATBOT_CONFIG === 'undefined') {
        console.error('Chatbot configuration not found. Make sure chatbot-config.js is loaded.');
        return;
    }
    
    console.log('Initializing chatbot...');
    
    // Initialize image paths with correct fallbacks
    window.CHATBOT_IMAGE_PATHS = {
        botAvatar: 'images/chatbot/bot-avatar.png',
        userAvatar: 'images/chatbot/user-avatar.png',
        botIcon: 'images/chatbot/bot-avatar.png',
        botIconColor: 'images/chatbot/bot-avatar.png',
        fallbackUser: 'images/chatbot/user-avatar.png',
        fallbackBot: 'images/chatbot/bot-avatar.png'
    };
    
    try {
        // Ensure images are loaded (or use embedded data URIs as fallback)
        ensureImagesAreLoaded();
        
        // Create chatbot elements
        createChatbotElements();
        
        // Initialize Gemini API
        initGeminiAPI();
        
        // Initialize chatbot functionality
        initChatbot();
        
        // Show welcome message bubble
        showWelcomeBubble();
        
        // Apply UI settings from config
        applyUiSettings();
        
        // Add event listeners for suggested questions
        setTimeout(() => {
            document.querySelectorAll('.suggested-question').forEach(question => {
                question.addEventListener('click', function() {
                    const questionText = this.getAttribute('data-question');
                    if (questionText) {
                        // Add user message
                        addMessage(questionText, 'user');
                        
                        // Process the message and get AI response
                        processMessage(questionText);
                        
                        // Remove all suggested questions after clicking one
                        const suggestedQuestionsContainer = document.querySelector('.suggested-questions');
                        if (suggestedQuestionsContainer) {
                            suggestedQuestionsContainer.remove();
                        }
                    }
                });
            });
            
            // Kiểm tra container và cấu trúc chatbot
            const chatBody = document.querySelector('.chat-body');
            const messagesContainer = document.querySelector('.messages-container');
            
            if (chatBody && messagesContainer) {
                console.log('Chatbot structure is correct');
                
                // Ensure messages container is directly inside chat body
                if (messagesContainer.parentNode !== chatBody) {
                    console.warn('Messages container is not directly inside chat body, fixing structure');
                    const originalContainer = messagesContainer.cloneNode(true);
                    chatBody.innerHTML = '';
                    chatBody.appendChild(originalContainer);
                    chatElements.messagesContainer = originalContainer;
                }
            } else {
                console.error('Chatbot structure is incorrect, chat-body or messages-container missing');
            }
            
            // Check if Gemini API is initialized
            if (window.geminiAPI && typeof window.geminiAPI.sendMessage === 'function') {
                console.log('Chatbot is ready with Gemini API integration');
            } else {
                console.warn('Chatbot is using fallback responses. Gemini API not available.');
            }
            
            console.log('Chatbot initialization complete');
        }, 1000); // Small delay to ensure DOM is ready
    } catch (error) {
        console.error('Error initializing chatbot:', error);
    }
});

// Apply UI settings from config
function applyUiSettings() {
    if (!CHATBOT_CONFIG.ui) return;
    
    const ui = CHATBOT_CONFIG.ui;
    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--chatbot-primary-color', ui.primaryColor || '#4831d4');
    root.style.setProperty('--chatbot-secondary-color', ui.secondaryColor || '#f5f5f5');
    root.style.setProperty('--chatbot-text-color', ui.textColor || '#333333');
    root.style.setProperty('--chatbot-width', ui.width || '320px');
    root.style.setProperty('--chatbot-height', ui.height || '450px');
    root.style.setProperty('--chatbot-bubble-size', ui.bubbleSize || '60px');
    root.style.setProperty('--chatbot-animation-speed', ui.animationSpeed || '0.3s');
    
    // Position
    const chatWindow = document.querySelector('.chat-window');
    const chatBubble = document.querySelector('.chat-bubble');
    
    if (chatWindow && chatBubble) {
        if (ui.position === 'left') {
            chatWindow.style.left = '20px';
            chatWindow.style.right = 'auto';
            chatBubble.style.left = '20px';
            chatBubble.style.right = 'auto';
        } else {
            chatWindow.style.right = '20px';
            chatWindow.style.left = 'auto';
            chatBubble.style.right = '20px';
            chatBubble.style.left = 'auto';
        }
    }
}

// Create chatbot UI elements
function createChatbotElements() {
    // Create chat bubble
    const chatBubble = document.createElement('div');
    chatBubble.className = 'chat-bubble';
    chatBubble.innerHTML = `
        <div class="chat-icon">
            <img src="${window.CHATBOT_IMAGE_PATHS.botIconColor}" alt="AI Assistant" 
                onerror="this.src='${window.CHATBOT_IMAGE_PATHS.fallbackBot}'; this.onerror=null;">
        </div>
        <div class="notification-badge">1</div>
    `;
    document.body.appendChild(chatBubble);
    
    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window';
    chatWindow.innerHTML = `
        <div class="chat-header">
            <div class="chat-title">
                <img src="${window.CHATBOT_IMAGE_PATHS.botIcon}" alt="AI Assistant" 
                    onerror="this.src='${window.CHATBOT_IMAGE_PATHS.fallbackBot}'; this.onerror=null;">
                <span>${CHATBOT_CONFIG.botName || 'AI Assistant'}</span>
            </div>
            <div class="chat-actions">
                <button class="clear-history-btn" title="Xóa lịch sử trò chuyện"><i class="fas fa-trash-alt"></i></button>
                <button class="minimize-btn"><i class="fas fa-minus"></i></button>
                <button class="close-btn"><i class="fas fa-times"></i></button>
            </div>
        </div>
        <div class="chat-body">
            <div class="messages-container">
                <div class="message bot-message">
                    <div class="message-avatar">
                        <img src="${window.CHATBOT_IMAGE_PATHS.botAvatar}" alt="bot" 
                            onerror="this.onerror=null; this.src='${window.CHATBOT_IMAGE_PATHS.fallbackBot}';">
                    </div>
                    <div class="message-content">${CHATBOT_CONFIG.welcomeMessage}</div>
                </div>
                ${generateSuggestedQuestions()}
            </div>
        </div>
        <div class="chat-options">
            ${generateOptionButtons()}
        </div>
        <div class="chat-footer">
            <input type="text" class="chat-input" placeholder="Nhập tin nhắn...">
            <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
        </div>
        <div class="clear-history-tooltip">
            <div class="tooltip-text">
                <p>Xóa lịch sử trò chuyện?</p>
                <div class="tooltip-buttons">
                    <button class="confirm-clear">Xóa</button>
                    <button class="cancel-clear">Hủy</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(chatWindow);
    
    // Add custom CSS for UI improvements
    addCustomStyles();
}

// Add custom styles to improve chatbot aesthetics
function addCustomStyles() {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        :root {
            --chatbot-primary-color: #4831d4;
            --chatbot-secondary-color: #f5f5f5;
            --chatbot-text-color: #333333;
            --chatbot-width: 320px;
            --chatbot-height: 450px;
            --chatbot-bubble-size: 60px;
            --chatbot-animation-speed: 0.3s;
        }
        
        /* Đảm bảo CSS mạnh mẽ được áp dụng để ghi đè lên tất cả các styles khác */
        
        .chat-bubble {
            padding: 0;
            border-radius: 50%;
            width: var(--chatbot-bubble-size);
            height: var(--chatbot-bubble-size);
            background-color: var(--chatbot-primary-color);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            transition: all var(--chatbot-animation-speed) ease;
            cursor: pointer;
            z-index: 9999;
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .chat-bubble:hover {
            transform: scale(1.05);
        }
        
        .chat-bubble .chat-icon {
            width: 65%;
            height: 65%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .chat-bubble .chat-icon img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }
        
        .chat-window {
            width: var(--chatbot-width);
            height: var(--chatbot-height);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
            background: white;
            transition: all var(--chatbot-animation-speed) cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 9999;
            position: fixed;
            bottom: 20px;
            right: 20px;
            transform: scale(0.9);
            opacity: 0;
            pointer-events: none;
            transform-origin: bottom right;
            display: flex;
            flex-direction: column;
        }
        
        .chat-window.active {
            transform: scale(1);
            opacity: 1;
            pointer-events: all;
        }
        
        .chat-header {
            background-color: var(--chatbot-primary-color);
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        
        .chat-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
        }
        
        .chat-title img {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .chat-actions {
            display: flex;
            gap: 8px;
        }
        
        .chat-actions button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        }
        
        .chat-actions button:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        .chat-body {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background-color: #f9f9f9;
            position: relative;
        }
        
        .messages-container {
            padding: 15px;
            overflow-y: auto;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 10px;
            scroll-behavior: smooth;
            max-height: 100%;
        }
        
        .message {
            display: flex;
            margin-bottom: 15px;
            align-items: flex-start;
            position: relative;
            width: 100%;
            animation: fadeIn 0.3s ease;
            opacity: 1;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            margin: 0 8px;
            flex-shrink: 0;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .message-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        /* Xóa các quy tắc cũ */
        
        /* Bot message - avatar bên trái */
        .bot-message {
            flex-direction: row !important;
            justify-content: flex-start !important;
            align-self: flex-start !important;
            text-align: left !important;
            width: auto !important;
        }
        
        /* User message - cấu trúc đặc biệt */
        .user-message {
            flex-direction: row-reverse !important;
            justify-content: flex-end !important;
            align-self: flex-end !important;
            text-align: left !important;
            margin-left: auto !important;
            width: auto !important;
            display: flex !important;
            position: relative !important;
        }
        
        /* Vị trí avatar cho bot */
        .bot-message .message-avatar {
            margin-right: 8px !important;
            margin-left: 0 !important;
        }
        
        /* Vị trí avatar cho user - hiển thị bên phải */
        .user-message .message-avatar {
            display: block !important;
            margin-left: 8px !important;
            margin-right: 0 !important;
        }
        
        /* Xóa pseudo-element của avatar trong nội dung tin nhắn */
        .user-message .message-content {
            position: relative !important;
        }
        
        /* Loại bỏ cách hiển thị avatar bên trong tin nhắn */
        .user-message .message-content::after {
            display: none !important;
        }
        
        /* Nội dung tin nhắn */
        .bot-message .message-content {
            background-color: var(--chatbot-secondary-color);
            color: var(--chatbot-text-color);
            border-radius: 15px 15px 15px 0;
            text-align: left;
            max-width: 70%;
            padding: 10px 15px;
            margin-left: 0;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            word-wrap: break-word;
        }
        
        .user-message .message-content {
            background-color: var(--chatbot-primary-color);
            color: white;
            border-radius: 15px 15px 0 15px;
            text-align: left;
            max-width: 70%;
            padding: 10px 15px;
            margin-right: 0;
            margin-left: auto;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            word-wrap: break-word;
        }
        
        .typing .message-content {
            background-color: var(--chatbot-secondary-color);
            padding: 13px 15px;
        }
        
        .chat-footer {
            padding: 10px 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-top: 1px solid #eee;
            background: white;
            flex-shrink: 0;
        }
        
        .chat-input {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 20px;
            padding: 8px 15px;
            outline: none;
            transition: border 0.2s;
        }
        
        .chat-input:focus {
            border-color: var(--chatbot-primary-color);
        }
        
        .send-btn {
            background-color: var(--chatbot-primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .send-btn:hover {
            transform: scale(1.05);
        }
        
        .chat-options {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 10px 15px;
            border-top: 1px solid #eee;
            flex-shrink: 0;
        }
        
        .option-btn {
            background-color: var(--chatbot-secondary-color);
            color: var(--chatbot-text-color);
            border: none;
            border-radius: 20px;
            padding: 8px 15px;
            font-size: 0.9em;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .option-btn:hover {
            background-color: var(--chatbot-primary-color);
            color: white;
        }
        
        .zalo-btn {
            background-color: #0068ff;
            color: white;
        }
        
        .zalo-btn:hover {
            background-color: #0054cc;
        }
        
        .chat-bubble.hidden {
            transform: scale(0);
            opacity: 0;
            pointer-events: none;
        }
        
        .notification-badge {
            position: absolute;
            top: 0;
            right: 0;
            background-color: red;
            color: white;
            font-size: 12px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        .suggested-questions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 15px;
        }
        
        .suggested-question {
            background-color: var(--chatbot-secondary-color);
            color: var(--chatbot-text-color);
            padding: 8px 15px;
            border-radius: 15px;
            font-size: 0.9em;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
        }
        
        .suggested-question:hover {
            background-color: var(--chatbot-primary-color);
            color: white;
        }
        
        .typing-indicator {
            display: flex;
            gap: 5px;
            padding: 5px 0;
            align-items: center;
            justify-content: center;
            min-height: 20px;
        }
        
        .typing-indicator span {
            width: 8px;
            height: 8px;
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            display: inline-block;
            animation: typing 1.5s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        .chat-separator {
            text-align: center;
            font-size: 0.8em;
            color: #999;
            margin: 15px 0;
            position: relative;
        }
        
        .chat-separator:before, .chat-separator:after {
            content: '';
            position: absolute;
            top: 50%;
            width: 20%;
            height: 1px;
            background-color: #eee;
        }
        
        .chat-separator:before {
            left: 10%;
        }
        
        .chat-separator:after {
            right: 10%;
        }
        
        .welcome-bubble {
            position: fixed;
            bottom: 90px;
            right: 20px;
            background: white;
            padding: 12px 15px;
            border-radius: 10px;
            box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
            max-width: 250px;
            z-index: 9998;
            transform: scale(0.9) translateY(20px);
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
        }
        
        .welcome-bubble.active {
            transform: scale(1) translateY(0);
            opacity: 1;
            pointer-events: all;
        }
        
        .welcome-bubble p {
            margin: 0;
            font-size: 0.9em;
            color: #333;
        }
        
        .welcome-bubble:after {
            content: '';
            position: absolute;
            bottom: -10px;
            right: 30px;
            width: 20px;
            height: 20px;
            background: white;
            transform: rotate(45deg);
            box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.1);
            z-index: -1;
        }
        
        .close-welcome {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #999;
            font-size: 0.8em;
        }
        
        /* Tooltip xóa lịch sử */
        .clear-history-tooltip {
            position: absolute;
            top: 60px;
            right: 15px;
            background: white;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            display: none;
            transform-origin: top right;
            transform: scale(0.9);
            transition: all 0.2s ease;
        }
        
        .clear-history-tooltip.active {
            display: block;
            transform: scale(1);
        }
        
        .tooltip-text p {
            margin: 0 0 10px 0;
            font-size: 14px;
            font-weight: 500;
        }
        
        .tooltip-buttons {
            display: flex;
            gap: 8px;
        }
        
        .tooltip-buttons button {
            padding: 5px 12px;
            border-radius: 4px;
            border: none;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .confirm-clear {
            background-color: #ff4d4d;
            color: white;
        }
        
        .confirm-clear:hover {
            background-color: #ff3333;
        }
        
        .cancel-clear {
            background-color: #e0e0e0;
            color: #333;
        }
        
        .cancel-clear:hover {
            background-color: #d0d0d0;
        }
        
        @keyframes typing {
            0% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0); }
        }
        
        @media (max-width: 576px) {
            .chat-window {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }
            
            .bot-message .message-content,
            .user-message .message-content {
                max-width: 75%;
            }
        }
    `;
    document.head.appendChild(styleEl);
}

// Generate option buttons from config
function generateOptionButtons() {
    if (!CHATBOT_CONFIG.quickReplyOptions || !Array.isArray(CHATBOT_CONFIG.quickReplyOptions)) {
        return '';
    }
    
    return CHATBOT_CONFIG.quickReplyOptions.map(option => {
        const isZalo = option.value === 'zalo';
        const className = isZalo ? 'option-btn zalo-btn' : 'option-btn';
        return `<button class="${className}" data-option="${option.value}">${option.text}</button>`;
    }).join('');
}

// Generate suggested questions
function generateSuggestedQuestions() {
    if (!CHATBOT_CONFIG.suggestedQuestions || !Array.isArray(CHATBOT_CONFIG.suggestedQuestions)) {
        return '';
    }
    
    const questions = CHATBOT_CONFIG.suggestedQuestions.map(question => {
        return `<div class="suggested-question" data-question="${question}">${question}</div>`;
    }).join('');
    
    return `<div class="suggested-questions">${questions}</div>`;
}

// Variable to store references to chatbot elements
let chatElements = {
    messagesContainer: null,
    chatInput: null,
    chatBubble: null,
    chatWindow: null
};

// Initialize chatbot functionality
function initChatbot() {
    chatElements.chatBubble = document.querySelector('.chat-bubble');
    chatElements.chatWindow = document.querySelector('.chat-window');
    chatElements.messagesContainer = document.querySelector('.messages-container');
    chatElements.chatInput = document.querySelector('.chat-input');
    
    const minimizeBtn = document.querySelector('.minimize-btn');
    const closeBtn = document.querySelector('.close-btn');
    const clearHistoryBtn = document.querySelector('.clear-history-btn');
    const sendBtn = document.querySelector('.send-btn');
    const optionBtns = document.querySelectorAll('.option-btn');
    const clearHistoryTooltip = document.querySelector('.clear-history-tooltip');
    const confirmClearBtn = document.querySelector('.confirm-clear');
    const cancelClearBtn = document.querySelector('.cancel-clear');
    
    // Toggle chat window when bubble is clicked
    chatElements.chatBubble.addEventListener('click', () => {
        chatElements.chatWindow.classList.toggle('active');
        chatElements.chatBubble.classList.toggle('hidden');
        
        // Remove notification badge when chat is opened
        const badge = chatElements.chatBubble.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }
        
        // Load chat history when opening
        if (chatElements.chatWindow.classList.contains('active') && 
            localStorage.getItem('chatHistory')) {
            loadChatHistory();
        }
    });
    
    // Remove auto-open chat after 5 seconds
    // Only keep welcome bubble
    
    // Minimize chat window
    minimizeBtn.addEventListener('click', () => {
        chatElements.chatWindow.classList.remove('active');
        chatElements.chatBubble.classList.remove('hidden');
        
        // Đảm bảo tooltip xóa lịch sử cũng bị ẩn khi thu nhỏ chat
        clearHistoryTooltip.classList.remove('active');
    });
    
    // Close chat window
    closeBtn.addEventListener('click', () => {
        chatElements.chatWindow.classList.remove('active');
        chatElements.chatBubble.classList.remove('hidden');
        
        // Đảm bảo tooltip xóa lịch sử cũng bị ẩn khi đóng chat
        clearHistoryTooltip.classList.remove('active');
    });
    
    // Show tooltip khi click vào nút Clear History
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', (e) => {
            // Ngăn không cho event bubble lên parent elements
            e.stopPropagation();
            
            // Hiện tooltip xóa lịch sử
            clearHistoryTooltip.classList.add('active');
            
            // Click ngoài tooltip sẽ ẩn nó đi
            document.addEventListener('click', function hideTooltip(event) {
                // Kiểm tra nếu click không phải vào tooltip hoặc nút clear history
                if (!clearHistoryTooltip.contains(event.target) && event.target !== clearHistoryBtn) {
                    clearHistoryTooltip.classList.remove('active');
                    document.removeEventListener('click', hideTooltip);
                }
            });
        });
    }
    
    // Xác nhận xóa lịch sử chat
    confirmClearBtn.addEventListener('click', () => {
        // Clear chat history from localStorage
        localStorage.removeItem('chatHistory');
        
        // Update conversation history in Gemini API
        if (window.geminiAPI && typeof window.geminiAPI.clearHistory === 'function') {
            window.geminiAPI.clearHistory();
        }
        
        // Keep only the welcome message
        const welcomeMessage = chatElements.messagesContainer.querySelector('.bot-message');
        
        // Clear all messages
        chatElements.messagesContainer.innerHTML = '';
        
        // Add back the welcome message
        if (welcomeMessage) {
            chatElements.messagesContainer.appendChild(welcomeMessage.cloneNode(true));
        } else {
            // Create new welcome message if none exists
            addMessage(CHATBOT_CONFIG.welcomeMessage, 'bot', false);
        }
        
        // Add success notification
        const successNotice = document.createElement('div');
        successNotice.className = 'chat-notice';
        
        // Show appropriate message based on language
        const isVietnamese = document.documentElement.lang === 'vi';
        successNotice.textContent = isVietnamese 
            ? 'Lịch sử trò chuyện đã được xóa' 
            : 'Chat history has been cleared';
        
        chatElements.messagesContainer.appendChild(successNotice);
        
        // Hide tooltip
        clearHistoryTooltip.classList.remove('active');
        
        // Remove notification after 3 seconds with fade effect
        setTimeout(() => {
            if (successNotice.parentNode) {
                successNotice.classList.add('fade-out');
                setTimeout(() => {
                    if (successNotice.parentNode) {
                        successNotice.parentNode.removeChild(successNotice);
                    }
                }, 500);
            }
        }, 2500);
        
        // Scroll to bottom to show notification
        smoothScrollToBottom(chatElements.messagesContainer);
    });
    
    // Hủy xóa lịch sử chat
    cancelClearBtn.addEventListener('click', () => {
        clearHistoryTooltip.classList.remove('active');
    });
    
    // Send message when send button is clicked
    sendBtn.addEventListener('click', () => {
        sendMessage();
    });
    
    // Send message when Enter key is pressed
    chatElements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Handle predefined option buttons
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const option = btn.getAttribute('data-option');
            if (option === 'zalo') {
                // Open Zalo chat with the website owner
                window.open(`https://zalo.me/${CHATBOT_CONFIG.zaloId}`, '_blank');
            } else {
                // Handle other predefined options
                const optionMessages = {
                    'portfolio': 'I\'d like to know more about your portfolio',
                    'skills': 'What skills do you have?',
                    'contact': 'How can I contact you?'
                };
                
                if (optionMessages[option]) {
                    // Add user message
                    addMessage(optionMessages[option], 'user');
                    
                    // Process the message and get AI response
                    processMessage(optionMessages[option]);
                }
            }
        });
    });
    
    // Add style for chat notifications
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        .chat-notice {
            text-align: center;
            margin: 10px 0;
            padding: 5px 10px;
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
            font-size: 0.8em;
            color: #666;
            opacity: 1;
            transition: opacity 0.5s ease;
        }
        
        .chat-notice.fade-out {
            opacity: 0;
        }
    `;
    document.head.appendChild(styleEl);
}

// Function to send user message
function sendMessage() {
    if (!chatElements.chatInput) {
        console.error('Chat input not found');
        return;
    }
    
    const message = chatElements.chatInput.value.trim();
    
    if (message) {
        // Add user message to chat
        addMessage(message, 'user');
        
        // Clear input
        chatElements.chatInput.value = '';
        
        // Process the message and get AI response
        processMessage(message);
        
        // Remove suggested questions if they still exist
        const suggestedQuestionsContainer = document.querySelector('.suggested-questions');
        if (suggestedQuestionsContainer) {
            suggestedQuestionsContainer.remove();
        }
    }
}

// Function to add message to chat
function addMessage(message, sender, saveToHistory = true) {
    // Log for debugging
    console.log(`Adding message: ${sender}: ${message.substring(0, 20)}...`);
    
    if (!chatElements.messagesContainer) {
        chatElements.messagesContainer = document.querySelector('.messages-container');
        
        if (!chatElements.messagesContainer) {
            console.error('Messages container not found, creating a new one');
            const chatBody = document.querySelector('.chat-body');
            if (chatBody) {
                // Clear chat body and create a new messages container
                chatBody.innerHTML = '';
                chatElements.messagesContainer = document.createElement('div');
                chatElements.messagesContainer.className = 'messages-container';
                chatBody.appendChild(chatElements.messagesContainer);
            } else {
                console.error('Chat body not found, cannot create messages container');
                return;
            }
        }
    }
    
    try {
        // Create a unique message ID
        const messageId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.id = messageId;
        messageElement.dataset.persistent = "true"; // Mark as persistent to avoid removal
        
        // Format message with line breaks and links
        const formattedMessage = formatMessage(message);
        
        // Add avatar to messages
        const avatarSrc = sender === 'bot' 
            ? window.CHATBOT_IMAGE_PATHS.botAvatar
            : window.CHATBOT_IMAGE_PATHS.userAvatar;
        
        const fallbackSrc = sender === 'bot'
            ? window.CHATBOT_IMAGE_PATHS.fallbackBot
            : window.CHATBOT_IMAGE_PATHS.fallbackUser;
        
        // Sử dụng cùng một cấu trúc HTML cho cả tin nhắn bot và người dùng
        messageElement.innerHTML = `
            <div class="message-avatar">
                <img src="${avatarSrc}" alt="${sender}" 
                    onerror="this.onerror=null; this.src='${fallbackSrc}';">
            </div>
            <div class="message-content">${formattedMessage}</div>
        `;
        
        // Đảm bảo phần tử không bị xóa trước khi thêm vào
        if (messageElement) {
            // Kiểm tra xem messages-container có tồn tại không
            if (chatElements.messagesContainer.parentNode) {
                // Add the message to container
                chatElements.messagesContainer.appendChild(messageElement);
                
                // Force reflow/repaint để đảm bảo tin nhắn hiển thị ngay lập tức
                chatElements.messagesContainer.offsetHeight;
                
                // Ensure the message is visible
                messageElement.style.opacity = "1";
                
                // Scroll to bottom of chat
                smoothScrollToBottom(chatElements.messagesContainer);
                
                // Save message to history if requested
                if (saveToHistory && sender !== 'system') {
                    saveChatHistory(message, sender);
                }
                
                // Log thông tin để debug
                console.log(`Message added with ID: ${messageId} - Container has ${chatElements.messagesContainer.childNodes.length} messages`);
                
                // Kiểm tra và đảm bảo tin nhắn vẫn tồn tại sau khi thêm vào
                setTimeout(() => {
                    const addedMessage = document.getElementById(messageId);
                    if (!addedMessage) {
                        console.warn(`Message ${messageId} was removed unexpectedly, re-adding`);
                        const newElement = messageElement.cloneNode(true);
                        chatElements.messagesContainer.appendChild(newElement);
                        smoothScrollToBottom(chatElements.messagesContainer);
                    }
                }, 100); // Giảm thời gian chờ để kiểm tra nhanh hơn
                
                // Thêm kiểm tra thứ hai sau 500ms để đảm bảo tin nhắn không bị xóa
                setTimeout(() => {
                    const addedMessage = document.getElementById(messageId);
                    if (!addedMessage) {
                        console.warn(`Message ${messageId} was removed after 500ms, re-adding again`);
                        const newElement = messageElement.cloneNode(true);
                        chatElements.messagesContainer.appendChild(newElement);
                        smoothScrollToBottom(chatElements.messagesContainer);
                    }
                }, 500);
            } else {
                console.error('Messages container is not in the DOM');
                
                // Thử tạo lại container và thêm tin nhắn
                const chatBody = document.querySelector('.chat-body');
                if (chatBody) {
                    chatElements.messagesContainer = document.createElement('div');
                    chatElements.messagesContainer.className = 'messages-container';
                    chatBody.appendChild(chatElements.messagesContainer);
                    chatElements.messagesContainer.appendChild(messageElement);
                    smoothScrollToBottom(chatElements.messagesContainer);
                    
                    if (saveToHistory && sender !== 'system') {
                        saveChatHistory(message, sender);
                    }
                }
            }
        } else {
            console.error('Failed to create message element');
        }
    } catch (error) {
        console.error('Error adding message:', error);
    }
}

// Function to smoothly scroll to the bottom of the chat
function smoothScrollToBottom(element) {
    if (!element) {
        console.error('Cannot scroll: element is null');
        return;
    }
    
    if (!element.scrollHeight) {
        console.warn('Element has no scrollHeight, may not be in DOM');
        return;
    }
    
    try {
        // Thiết lập scrollTop trực tiếp trước
        element.scrollTop = element.scrollHeight;
        
        // Sử dụng requestAnimationFrame để đảm bảo cuộn mượt
        requestAnimationFrame(() => {
            element.scrollTop = element.scrollHeight;
            
            // Thêm lần cuộn thứ hai sau khi layout hoàn thành
            requestAnimationFrame(() => {
                element.scrollTop = element.scrollHeight;
            });
        });
        
        // Backup timeout để đảm bảo cuộn được thực hiện
        setTimeout(() => {
            // Kiểm tra xem element vẫn còn trong DOM không
            if (element && element.parentNode) {
                element.scrollTop = element.scrollHeight;
                
                // Log debug
                const isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
                console.log(`Scrolled to bottom: ${isScrolledToBottom}, scrollTop: ${element.scrollTop}, scrollHeight: ${element.scrollHeight}`);
            }
        }, 300);
    } catch (error) {
        console.error('Error scrolling to bottom:', error);
    }
}

// Format message - convert URLs to links and preserve line breaks
function formatMessage(message) {
    if (!message) return '';
    
    // First escape HTML to prevent XSS
    let formatted = message.replace(/&/g, '&amp;')
                         .replace(/</g, '&lt;')
                         .replace(/>/g, '&gt;')
                         .replace(/"/g, '&quot;')
                         .replace(/'/g, '&#039;');
    
    // Convert URLs to clickable links
    formatted = formatted.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Convert line breaks to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

// Function to process message and get AI response
async function processMessage(message) {
    if (!chatElements.messagesContainer) {
        chatElements.messagesContainer = document.querySelector('.messages-container');
    }
    
    if (!chatElements.messagesContainer) {
        console.error('Messages container not found');
        return;
    }
    
    // Create a unique ID for the typing indicator
    const indicatorId = `typing-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Show typing indicator with avatar
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing';
    typingIndicator.id = indicatorId;
    typingIndicator.innerHTML = `
        <div class="message-avatar">
            <img src="${window.CHATBOT_IMAGE_PATHS.botAvatar}" alt="bot" 
                onerror="this.onerror=null; this.src='${window.CHATBOT_IMAGE_PATHS.fallbackBot}';">
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    // Add the typing indicator to the container
    try {
        chatElements.messagesContainer.appendChild(typingIndicator);
        
        // Scroll to show the typing indicator
        smoothScrollToBottom(chatElements.messagesContainer);
        
        // Try to use Gemini API if available
        let botResponse;
        try {
            if (window.geminiAPI && typeof window.geminiAPI.sendMessage === 'function') {
                botResponse = await window.geminiAPI.sendMessage(message);
            } else {
                // Fall back to default responses if API is not available
                botResponse = getDefaultResponse(message);
            }
            
            // Remove the typing indicator safely
            const removeTypingIndicator = () => {
                const indicator = document.getElementById(indicatorId);
                if (indicator && indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            };
            
            removeTypingIndicator();
            
            // Wait a moment before adding the bot's response to avoid DOM conflicts
            setTimeout(() => {
                try {
                    // Add the bot's response to the chat
                    addMessage(botResponse, 'bot');
                    
                    // Kiểm tra lại sau 200ms để đảm bảo tin nhắn vẫn tồn tại
                    setTimeout(() => {
                        const messages = chatElements.messagesContainer.querySelectorAll('.message');
                        console.log(`Chat contains ${messages.length} messages after adding response`);
                    }, 200);
                } catch (err) {
                    console.error('Error adding bot response:', err);
                }
            }, 100);
        } catch (error) {
            console.error('Error processing message:', error);
            
            // Detect language for error message
            const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]|của|và|hoặc|trong|với|các|những|là|có|không|tôi|bạn/.test(message);
            const documentLang = document.documentElement.lang || 'en';
            const useVietnamese = isVietnamese || documentLang === 'vi';
            
            // Remove typing indicator safely
            const indicator = document.getElementById(indicatorId);
            if (indicator && indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
            
            // Wait a moment before adding the error message
            setTimeout(() => {
                try {
                    // Use the appropriate language for the error message
                    const errorMessage = useVietnamese
                        ? "Xin lỗi, tôi gặp lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại."
                        : "Sorry, I encountered an error processing your message. Please try again.";
                        
                    // Add the error message
                    addMessage(errorMessage, 'bot');
                } catch (err) {
                    console.error('Error adding error message:', err);
                }
            }, 100);
        }
    } catch (containerError) {
        console.error('Fatal error in chat container:', containerError);
    }
}

// Function to get default response (fallback until Gemini API is integrated)
function getDefaultResponse(message) {
    // Check if message is in Vietnamese
    const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]|của|và|hoặc|trong|với|các|những|là|có|không|tôi|bạn/.test(message);
    
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase();
    
    // Determine language for UI elements if not present in the message
    const documentLang = document.documentElement.lang || 'en';
    const useVietnamese = isVietnamese || documentLang === 'vi';
    
    if (useVietnamese) {
        // Vietnamese responses
        if (lowerMessage.includes('dự án') || lowerMessage.includes('portfolio') || lowerMessage.includes('project')) {
            return "Tôi đã làm nhiều dự án bao gồm các ứng dụng web, ứng dụng di động và các hệ thống AI. Bạn có thể xem chúng trong phần Projects!";
        } else if (lowerMessage.includes('kỹ năng') || lowerMessage.includes('skill')) {
            return "Tôi có kỹ năng trong phát triển web (HTML, CSS, JavaScript), phát triển backend và có kinh nghiệm với nhiều framework khác nhau. Xem phần Skills để biết thêm chi tiết!";
        } else if (lowerMessage.includes('liên hệ') || lowerMessage.includes('contact') || lowerMessage.includes('thuê') || lowerMessage.includes('hire') || lowerMessage.includes('email')) {
            return "Bạn có thể liên hệ với tôi qua form liên hệ trên trang web này, hoặc chat trực tiếp qua Zalo. Chỉ cần nhấn vào nút 'Chat qua Zalo'!";
        } else if (lowerMessage.includes('xin chào') || lowerMessage.includes('chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?";
        } else {
            return "Cảm ơn tin nhắn của bạn. Bạn muốn biết thêm về portfolio, kỹ năng của tôi, hay cách liên hệ với tôi?";
        }
    } else {
        // English responses
        if (lowerMessage.includes('portfolio') || lowerMessage.includes('project')) {
            return "I've worked on several projects including web applications, mobile apps, and AI systems. You can check them out in the Projects section!";
        } else if (lowerMessage.includes('skill') || lowerMessage.includes('know')) {
            return "I'm skilled in web development (HTML, CSS, JavaScript), backend development, and have experience with various frameworks. Check out the Skills section for more details!";
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('hire') || lowerMessage.includes('email')) {
            return "You can contact me through the Contact form on this website, or chat with me directly on Zalo. Just click the 'Chat on Zalo' button!";
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! How can I assist you today?";
        } else {
            return "Thanks for your message. Would you like to know more about my portfolio, skills, or how to contact me?";
        }
    }
}

// Function to initialize Gemini API
async function initGeminiAPI() {
    // Check if API key is available
    if (!CHATBOT_CONFIG.geminiApiKey || CHATBOT_CONFIG.geminiApiKey === 'YOUR_GEMINI_API_KEY') {
        console.warn('Gemini API key not set in config. Falling back to default responses.');
        return;
    }
    
    try {
        // Initialize the Gemini API
        if (window.geminiAPI && typeof window.geminiAPI.initializeContext === 'function') {
            // Initialize conversation context
            await window.geminiAPI.initializeContext();
            console.log('Gemini API initialized successfully');
        } else {
            console.error('Gemini API not available or missing required methods');
        }
    } catch (error) {
        console.error('Error initializing Gemini API:', error);
    }
}

// Show welcome message with a typing animation after first open
function showWelcomeBubble() {
    // Create a welcome bubble that appears after a delay
    if (!localStorage.getItem('welcomeShown')) {
        setTimeout(() => {
            // Create a floating message near the chat bubble
            const welcomeBubble = document.createElement('div');
            welcomeBubble.className = 'welcome-bubble';
            welcomeBubble.innerHTML = `
                <p>Xin chào! Nhấn vào đây để trò chuyện với trợ lý AI hoặc liên hệ với chủ sở hữu qua Zalo.</p>
                <span class="close-welcome"><i class="fas fa-times"></i></span>
            `;
            document.body.appendChild(welcomeBubble);
            
            // Add animation to make it appear
            setTimeout(() => {
                welcomeBubble.classList.add('active');
            }, 100);
            
            // Add close button functionality
            welcomeBubble.querySelector('.close-welcome').addEventListener('click', (e) => {
                e.stopPropagation();
                welcomeBubble.classList.remove('active');
                setTimeout(() => {
                    welcomeBubble.remove();
                }, 300);
            });
            
            // Also close and open chat when clicking on the welcome bubble
            welcomeBubble.addEventListener('click', () => {
                welcomeBubble.classList.remove('active');
                setTimeout(() => {
                    welcomeBubble.remove();
                    if (chatElements.chatWindow && chatElements.chatBubble) {
                        chatElements.chatWindow.classList.add('active');
                        chatElements.chatBubble.classList.add('hidden');
                    }
                }, 300);
            });
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (welcomeBubble.parentNode) {
                    welcomeBubble.classList.remove('active');
                    setTimeout(() => {
                        welcomeBubble.remove();
                    }, 300);
                }
            }, 10000);
            
            // Mark as shown
            localStorage.setItem('welcomeShown', 'true');
        }, 3000);
    }
}

// Expose functions to window object for external use
window.addMessage = addMessage;
window.processMessage = processMessage;

// Save chat history to localStorage
function saveChatHistory(message, sender) {
    try {
        // Get existing chat history
        let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        // Add new message
        chatHistory.push({
            message: message,
            sender: sender,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 20 messages
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(chatHistory.length - 20);
        }
        
        // Save updated history
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}

// Load chat history from localStorage
function loadChatHistory() {
    try {
        // Get chat history
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        // If no history, return
        if (chatHistory.length === 0) return;
        
        console.log('Loading chat history:', chatHistory.length, 'messages');
        
        // Get the welcome message first
        const welcomeMessage = chatElements.messagesContainer.querySelector('.bot-message');
        
        // Clear container elements safely
        while (chatElements.messagesContainer.firstChild) {
            chatElements.messagesContainer.removeChild(chatElements.messagesContainer.firstChild);
        }
        
        // Add back the welcome message if it exists
        if (welcomeMessage) {
            const welcomeClone = welcomeMessage.cloneNode(true);
            welcomeClone.dataset.persistent = "true"; // Đánh dấu là tin nhắn không được xóa
            chatElements.messagesContainer.appendChild(welcomeClone);
        } else {
            // Create welcome message if it doesn't exist
            addMessage(CHATBOT_CONFIG.welcomeMessage, 'bot', false);
        }
        
        // Get the most recent messages (up to 10)
        const recentMessages = chatHistory.slice(-10);
        
        // Add a small delay before adding messages to ensure DOM is ready
        setTimeout(() => {
            try {
                // Add each message to the chat
                recentMessages.forEach((item, index) => {
                    // Create unique message ID based on content and position
                    const messageId = `hist-msg-${index}-${Date.now()}`;
                    
                    const messageElement = document.createElement('div');
                    messageElement.className = `message ${item.sender}-message`;
                    messageElement.id = messageId;
                    messageElement.dataset.persistent = "true"; // Đánh dấu là tin nhắn không được xóa
                    
                    // Format the message
                    const formattedMessage = formatMessage(item.message);
                    
                    // Add avatar to messages
                    const avatarSrc = item.sender === 'bot' 
                        ? window.CHATBOT_IMAGE_PATHS.botAvatar
                        : window.CHATBOT_IMAGE_PATHS.userAvatar;
                    
                    const fallbackSrc = item.sender === 'bot'
                        ? window.CHATBOT_IMAGE_PATHS.fallbackBot
                        : window.CHATBOT_IMAGE_PATHS.fallbackUser;
                    
                    // Sử dụng cùng một cấu trúc HTML cho cả tin nhắn bot và người dùng
                    messageElement.innerHTML = `
                        <div class="message-avatar">
                            <img src="${avatarSrc}" alt="${item.sender}" 
                                onerror="this.onerror=null; this.src='${fallbackSrc}';">
                        </div>
                        <div class="message-content">${formattedMessage}</div>
                    `;
                    
                    // Add message directly to container (bypass addMessage to avoid recursion issues)
                    chatElements.messagesContainer.appendChild(messageElement);
                });
                
                // Scroll to bottom after adding all messages
                smoothScrollToBottom(chatElements.messagesContainer);
                
                // Kiểm tra số lượng tin nhắn sau khi tải để đảm bảo tất cả đều đã được tải
                setTimeout(() => {
                    const messageCount = chatElements.messagesContainer.querySelectorAll('.message').length;
                    console.log(`Chat contains ${messageCount} messages after loading history (expected: ${recentMessages.length + 1})`);
                    
                    // Nếu số lượng tin nhắn không đúng, thử tải lại
                    if (messageCount < recentMessages.length + 1) {
                        console.warn('Some messages were lost during loading, recreating them');
                        
                        // Tạo lại các tin nhắn bị thiếu
                        recentMessages.forEach((item, index) => {
                            // Kiểm tra xem tin nhắn đã tồn tại chưa
                            const existingId = `hist-msg-${index}-${Date.now()}`.split('-').slice(0, 2).join('-');
                            const exists = Array.from(chatElements.messagesContainer.querySelectorAll('.message'))
                                .some(el => el.id.startsWith(existingId));
                            
                            if (!exists) {
                                // Thêm tin nhắn bị thiếu
                                addMessage(item.message, item.sender, false);
                            }
                        });
                    }
                }, 500);
            } catch (innerError) {
                console.error('Error while adding chat history messages:', innerError);
            }
        }, 100);
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Global function to ensure scrolling happens whenever new content is added
window.ensureChatScroll = function() {
    if (chatElements.messagesContainer) {
        smoothScrollToBottom(chatElements.messagesContainer);
    }
}

// Add an event to ensure messages are scrolled into view after images load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Create a less aggressive observer that only scrolls when needed
        const chatObserver = new MutationObserver(function(mutations) {
            // Don't process if no mutations or container doesn't exist
            if (!mutations.length || !chatElements.messagesContainer) {
                return;
            }
            
            // Kiểm tra xem có tin nhắn nào bị xóa không
            let messagesRemoved = false;
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    // Kiểm tra nếu có node bị xóa là tin nhắn (không phải typing indicator)
                    messagesRemoved = Array.from(mutation.removedNodes).some(node => {
                        return node.nodeType === 1 && node.classList && 
                               node.classList.contains('message') && 
                               !node.classList.contains('typing') &&
                               node.dataset.persistent === "true"; // Chỉ quan tâm đến tin nhắn được đánh dấu là persistent
                    });
                    
                    if (messagesRemoved) {
                        console.warn('Persistent messages were incorrectly removed by mutation observer');
                    }
                }
            });
            
            // Only process if new nodes were added
            const hasAddedMessages = mutations.some(mutation => {
                if (mutation.type !== 'childList' || !mutation.addedNodes.length) {
                    return false;
                }
                
                // Check if any new nodes are actual messages (not typing indicators being removed)
                return Array.from(mutation.addedNodes).some(node => {
                    return node.nodeType === 1 && node.classList && 
                           node.classList.contains('message') && 
                           !node.classList.contains('typing');
                });
            });
            
            if (hasAddedMessages) {
                // Use requestAnimationFrame for smoother scrolling
                requestAnimationFrame(() => {
                    smoothScrollToBottom(chatElements.messagesContainer);
                });
            }
        });
        
        // Start observing the chat container once it's available
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            // Only observe child additions/removals, not attribute changes
            chatObserver.observe(messagesContainer, { 
                childList: true, 
                subtree: false 
            });
            console.log('Chat message observer attached');
        }
        
        // Add event listener for image loading to ensure scroll after images load
        document.body.addEventListener('load', function(e) {
            if (e.target.tagName === 'IMG' && 
                (e.target.closest('.message-avatar') || e.target.closest('.message-content')) && 
                chatElements.messagesContainer) {
                smoothScrollToBottom(chatElements.messagesContainer);
            }
        }, true);
        
        // Ensure we scroll to bottom when the chat window is opened
        const chatBubble = document.querySelector('.chat-bubble');
        if (chatBubble) {
            chatBubble.addEventListener('click', function() {
                setTimeout(() => {
                    if (chatElements.messagesContainer) {
                        smoothScrollToBottom(chatElements.messagesContainer);
                    }
                }, 300);
            });
        }
    }, 1000);
});

// Add a loading check function to ensure images are properly loaded
function ensureImagesAreLoaded() {
    const botAvatarImg = new Image();
    botAvatarImg.src = window.CHATBOT_IMAGE_PATHS.botAvatar;
    
    const userAvatarImg = new Image();
    userAvatarImg.src = window.CHATBOT_IMAGE_PATHS.userAvatar;
    
    botAvatarImg.onerror = function() {
        console.warn('Bot avatar image failed to load, using data URI');
        
        // Use embedded SVG data URI if the image fails to load
        window.CHATBOT_IMAGE_PATHS.botAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iIzQ4MzFkNCIvPjxwYXRoIGQ9Ik0xNjUgODVjLTI1LTIwLTQ4LTIwLTc0IDAtMTAgMTAtMTYgMjMtMTYgNDAgMCAwIDAgMTUgNCAxN3MxMiAxMyAyNSAxMyA2LTE2IDE2LTE2IDE3IDggMTcgMjEgNi0xMiAxNy05YzYgMiAxMiA2IDggMTVzLTggMTAtNSAxNWMzIDUgMTggMTAgMzIgMCAxNC05IDMwLTUwIDMwLTUwIDAtMjUtOC00MS0xOS01MXoiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMjQiIHI9IjEyIiBmaWxsPSIjMDAwIi8+PGNpcmNsZSBjeD0iMTU2IiBjeT0iMTI0IiByPSIxMiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
    };
    
    userAvatarImg.onerror = function() {
        console.warn('User avatar image failed to load, using data URI');
        
        // Use embedded SVG data URI if the image fails to load
        window.CHATBOT_IMAGE_PATHS.userAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iIzM0OTVlYiIvPjxwYXRoIGQ9Ik0xMjggNzBjLTIyIDAtNDAgMjQtNDAgNTJzMTggNTIgNDAgNTIgNDAtMjQgNDAtNTItMTgtNTItNDAtNTJ6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTY0IDE5MHM4LTQwIDY0LTQwIDY0IDQwIDY0IDQwdjhzLTIyIDI4LTY0IDI4LTY0LTI4LTY0LTI4di04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==';
    };
}

