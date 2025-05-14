// Chatbot suggested questions handler
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the chatbot to be fully initialized
    setTimeout(() => {
        // Setup event listeners for suggested questions
        setupSuggestedQuestions();
        
        // Add dynamic suggested questions if needed
        addDynamicSuggestedQuestions();
    }, 1500);
});

// Setup event listeners for the suggested questions
function setupSuggestedQuestions() {
    document.querySelectorAll('.suggested-question').forEach(question => {
        question.addEventListener('click', function() {
            const questionText = this.getAttribute('data-question');
            if (questionText && window.addMessage && window.processMessage) {
                // Add user message
                window.addMessage(questionText, 'user');
                
                // Process the message and get AI response
                window.processMessage(questionText);
                
                // Remove all suggested questions after clicking one
                const suggestedQuestionsContainer = document.querySelector('.suggested-questions');
                if (suggestedQuestionsContainer) {
                    suggestedQuestionsContainer.remove();
                }
                
                // Open chat window if it's not already open
                const chatWindow = document.querySelector('.chat-window');
                const chatBubble = document.querySelector('.chat-bubble');
                if (chatWindow && chatBubble && !chatWindow.classList.contains('active')) {
                    chatWindow.classList.add('active');
                    chatBubble.classList.add('hidden');
                }
            }
        });
    });
    
    // Log a message to indicate the suggested questions are ready
    console.log('Suggested questions initialized');
}

// Function to add new suggested questions after a chat session
function addDynamicSuggestedQuestions() {
    // Listen for messages and add new suggestions after certain responses
    const messagesContainer = document.querySelector('.messages-container');
    
    if (messagesContainer) {
        // Create a MutationObserver to watch for new messages
        const observer = new MutationObserver((mutations) => {
            try {
                // Chỉ xử lý khi có thêm node mới và không xử lý nếu có node bị xóa
                const hasAddedMessages = mutations.some(mutation => 
                    mutation.type === 'childList' && mutation.addedNodes.length > 0 && mutation.removedNodes.length === 0);
                
                if (!hasAddedMessages) return;
                
                // Đợi một chút để đảm bảo DOM đã ổn định
                setTimeout(() => {
                    try {
                        // Check if the last message is from the bot and not a typing indicator
                        const lastMessage = messagesContainer.lastElementChild;
                        if (lastMessage && 
                            lastMessage.classList.contains('bot-message') && 
                            !lastMessage.classList.contains('typing') &&
                            !document.querySelector('.suggested-questions')) {
                            
                            // Add new suggested questions based on the conversation context
                            addContextualSuggestedQuestions();
                        }
                    } catch (innerError) {
                        console.error('Error checking for new messages:', innerError);
                    }
                }, 300);
            } catch (error) {
                console.error('Error in dynamic suggested questions:', error);
            }
        });
        
        // Start observing the messages container - chỉ theo dõi thay đổi childList trực tiếp
        observer.observe(messagesContainer, { 
            childList: true, 
            subtree: false,
            characterData: false,
            attributeFilter: [] // Không theo dõi attribute
        });
        
        console.log('Suggested questions observer attached');
    }
}

// Add suggested questions based on the conversation context
function addContextualSuggestedQuestions() {
    // Don't add suggestions if we already have them
    if (document.querySelector('.suggested-questions')) {
        return;
    }
    
    // Get all bot messages to analyze context
    const botMessages = Array.from(document.querySelectorAll('.bot-message'));
    if (botMessages.length < 2) {
        return; // Not enough context yet
    }
    
    // Get the latest bot message content
    const latestBotMessage = botMessages[botMessages.length - 1].querySelector('.message-content').textContent;
    
    // Check if the message is in Vietnamese
    const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]|của|và|hoặc|trong|với|các|những|là|có|không|tôi|bạn/.test(latestBotMessage);
    
    // Create suggested questions container
    const suggestedQuestionsContainer = document.createElement('div');
    suggestedQuestionsContainer.className = 'suggested-questions';
    
    // Default follow-up questions based on language
    const followUpQuestions = isVietnamese ? 
        ['Làm thế nào để liên hệ với bạn?'] : 
        [];
    
    // Only add questions if we have any
    if (followUpQuestions.length > 0) {
        // Add questions to the container
        followUpQuestions.forEach(question => {
            const questionElement = document.createElement('div');
            questionElement.className = 'suggested-question';
            questionElement.setAttribute('data-question', question);
            questionElement.textContent = question;
            suggestedQuestionsContainer.appendChild(questionElement);
        });
        
        // Add to the messages container
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.appendChild(suggestedQuestionsContainer);
            
            // Setup event listeners for these new questions
            setupSuggestedQuestions();
            
            // Use improved scrolling method if available
            if (window.ensureChatScroll) {
                window.ensureChatScroll();
            } else {
                // Fallback to standard scrolling with multiple attempts
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // Try scrolling again after a delay to ensure rendered content is accounted for
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 100);
                
                // Final scroll attempt
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 500);
            }
        }
    }
}
