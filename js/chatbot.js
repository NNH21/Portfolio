// AI Chatbot with Gemini API and Zalo support
document.addEventListener('DOMContentLoaded', function() {
    // Check if config is available
    if (typeof CHATBOT_CONFIG === 'undefined') {
        console.error('Chatbot configuration not found. Make sure chatbot-config.js is loaded.');
        return;
    }
    
    // Create chatbot elements
    createChatbotElements();
    
    // Initialize Gemini API
    initGeminiAPI();
    
    // Initialize chatbot functionality
    initChatbot();
    
    // Show welcome message bubble
    showWelcomeBubble();
    
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
        
        // Check if Gemini API is initialized
        if (window.geminiAPI && typeof window.geminiAPI.sendMessage === 'function') {
            console.log('Chatbot is ready with Gemini API integration');
        } else {
            console.warn('Chatbot is using fallback responses. Gemini API not available.');
        }
    }, 1000); // Small delay to ensure DOM is ready
});

// Create chatbot UI elements
function createChatbotElements() {
    // Create chat bubble
    const chatBubble = document.createElement('div');
    chatBubble.className = 'chat-bubble';
    chatBubble.innerHTML = `
        <div class="chat-icon">
            <img src="images/chatbot/chatbot-icon-color.svg" alt="AI Assistant" onerror="this.src='images/personal/my-photo.jpg'; this.onerror=null;">
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
                <img src="images/chatbot/chatbot-icon.svg" alt="AI Assistant" onerror="this.src='images/personal/my-photo.jpg'; this.onerror=null;">
                <span>AI Assistant</span>
            </div>
            <div class="chat-actions">
                <button class="clear-history-btn" title="Clear Chat History"><i class="fas fa-trash-alt"></i></button>
                <button class="minimize-btn"><i class="fas fa-minus"></i></button>
                <button class="close-btn"><i class="fas fa-times"></i></button>
            </div>
        </div>
        <div class="chat-body">
            <div class="messages-container">
                <div class="message bot-message">
                    <div class="message-content">${CHATBOT_CONFIG.welcomeMessage}</div>
                </div>
                ${generateSuggestedQuestions()}
            </div>
        </div>
        <div class="chat-options">
            ${generateOptionButtons()}
        </div>
        <div class="chat-footer">
            <input type="text" class="chat-input" placeholder="Type a message...">
            <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    document.body.appendChild(chatWindow);
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
            localStorage.getItem('chatHistory') && 
            !chatElements.messagesContainer.querySelector('.chat-separator')) {
            loadChatHistory();
        }
    });
    
    // Remove auto-open chat after 5 seconds
    // Only keep welcome bubble
    
    // Minimize chat window
    minimizeBtn.addEventListener('click', () => {
        chatElements.chatWindow.classList.remove('active');
        chatElements.chatBubble.classList.remove('hidden');
    });
    
    // Close chat window
    closeBtn.addEventListener('click', () => {
        chatElements.chatWindow.classList.remove('active');
        chatElements.chatBubble.classList.remove('hidden');
    });
    
    // Clear chat history
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            // Clear chat history from localStorage
            localStorage.removeItem('chatHistory');
            
            // Clear all messages except the welcome message
            while (chatElements.messagesContainer.childNodes.length > 1) {
                chatElements.messagesContainer.removeChild(chatElements.messagesContainer.lastChild);
            }
            
            // Also clear Gemini API conversation history if available
            if (window.geminiAPI && typeof window.geminiAPI.clearHistory === 'function') {
                window.geminiAPI.clearHistory();
            }
            
            // Add fresh welcome message
            addMessage(CHATBOT_CONFIG.welcomeMessage, 'bot', false);
            
            // Show confirmation
            const confirmationElement = document.createElement('div');
            confirmationElement.className = 'chat-separator';
            confirmationElement.textContent = 'Chat history cleared';
            chatElements.messagesContainer.appendChild(confirmationElement);
            
            // Remove confirmation after 3 seconds
            setTimeout(() => {
                if (confirmationElement.parentNode) {
                    confirmationElement.parentNode.removeChild(confirmationElement);
                }
            }, 3000);
        });
    }
    
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
    if (!chatElements.messagesContainer) {
        chatElements.messagesContainer = document.querySelector('.messages-container');
    }
    
    if (!chatElements.messagesContainer) {
        console.error('Messages container not found');
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.innerHTML = `
        <div class="message-content">${message}</div>
    `;
    
    chatElements.messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom of chat
    chatElements.messagesContainer.scrollTop = chatElements.messagesContainer.scrollHeight;
    
    // Save message to history if requested
    if (saveToHistory && sender !== 'system') {
        saveChatHistory(message, sender);
    }
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
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing';
    typingIndicator.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatElements.messagesContainer.appendChild(typingIndicator);
    chatElements.messagesContainer.scrollTop = chatElements.messagesContainer.scrollHeight;
    
    try {
        // Try to use Gemini API if available
        let botResponse;
        if (window.geminiAPI && typeof window.geminiAPI.sendMessage === 'function') {
            botResponse = await window.geminiAPI.sendMessage(message);
        } else {
            // Fall back to default responses if API is not available
            botResponse = getDefaultResponse(message);
        }
        
        // Remove typing indicator
        chatElements.messagesContainer.removeChild(typingIndicator);
        
        // Add bot response
        addMessage(botResponse, 'bot');
    } catch (error) {
        console.error('Error processing message:', error);
        
        // Remove typing indicator
        chatElements.messagesContainer.removeChild(typingIndicator);
        
        // Add fallback response
        addMessage("I'm sorry, I encountered an error. Please try again.", 'bot');
    }
}

// Function to get default response (fallback until Gemini API is integrated)
function getDefaultResponse(message) {
    message = message.toLowerCase();
    
    if (message.includes('portfolio') || message.includes('project')) {
        return "I've worked on several projects including web applications, mobile apps, and AI systems. You can check them out in the Projects section!";
    } else if (message.includes('skill') || message.includes('know')) {
        return "I'm skilled in web development (HTML, CSS, JavaScript), backend development, and have experience with various frameworks. Check out the Skills section for more details!";
    } else if (message.includes('contact') || message.includes('hire') || message.includes('email')) {
        return "You can contact me through the Contact form on this website, or chat with me directly on Zalo. Just click the 'Chat on Zalo' button!";
    } else if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return "Hello! How can I assist you today?";
    } else {
        return "Thanks for your message. Would you like to know more about my portfolio, skills, or how to contact me?";
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
                <p>Hi there! Click me to chat with AI assistant or talk to the portfolio owner on Zalo.</p>
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
        
        // Display last 5 messages max
        const recentMessages = chatHistory.slice(-5);
        
        // Add separator
        if (recentMessages.length > 0) {
            const separatorElement = document.createElement('div');
            separatorElement.className = 'chat-separator';
            separatorElement.textContent = 'Previous conversation';
            chatElements.messagesContainer.appendChild(separatorElement);
        }
        
        // Add messages to chat
        recentMessages.forEach(item => {
            addMessage(item.message, item.sender, false);
        });
        
        // Add separator for new conversation
        if (recentMessages.length > 0) {
            const separatorElement = document.createElement('div');
            separatorElement.className = 'chat-separator';
            separatorElement.textContent = 'New conversation';
            chatElements.messagesContainer.appendChild(separatorElement);
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}
