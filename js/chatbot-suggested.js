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
            // Check if the last message is from the bot
            const lastMessage = messagesContainer.lastElementChild;
            if (lastMessage && lastMessage.classList.contains('bot-message')) {
                // Check if there are no suggested questions already
                if (!document.querySelector('.suggested-questions')) {
                    // Add new suggested questions based on the conversation context
                    addContextualSuggestedQuestions();
                }
            }
        });
        
        // Start observing the messages container
        observer.observe(messagesContainer, { childList: true });
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
    
    // Create suggested questions container
    const suggestedQuestionsContainer = document.createElement('div');
    suggestedQuestionsContainer.className = 'suggested-questions';
    
    // Default follow-up questions
    const followUpQuestions = [
        "Tell me more about your projects",
        "What technologies do you use?",
        "How can I contact you?",
        "Do you have any work samples?"
    ];
    
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
    }
}
