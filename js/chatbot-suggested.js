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
    
    // Default follow-up questions based on language and context
    let followUpQuestions = [];
    
    if (isVietnamese) {
        // Portfolio related context
        if (latestBotMessage.includes('dự án') || latestBotMessage.includes('project') || latestBotMessage.includes('portfolio')) {
            followUpQuestions = [
                'Chi tiết hơn về dự án Tutor-Platform?',
                'Công nghệ nào được sử dụng cho các dự án?',
                'Có link demo cho các dự án không?'
            ];
        } 
        // Skills related context
        else if (latestBotMessage.includes('kỹ năng') || latestBotMessage.includes('skill') || latestBotMessage.includes('công nghệ')) {
            followUpQuestions = [
                'Bạn đánh giá kỹ năng JavaScript của mình thế nào?',
                'Kinh nghiệm làm việc với framework nào?',
                'Có kinh nghiệm với công nghệ AI không?'
            ];
        }
        // Contact related context
        else if (latestBotMessage.includes('liên hệ') || latestBotMessage.includes('contact') || latestBotMessage.includes('email')) {
            followUpQuestions = [
                'Thời gian phản hồi email là bao lâu?',
                'Có thể thuê làm dự án freelance không?',
                'Có làm việc remote không?'
            ];
        }
        // AI or tech related context
        else if (latestBotMessage.includes('trí tuệ nhân tạo') || latestBotMessage.includes('AI') || latestBotMessage.includes('công nghệ')) {
            followUpQuestions = [
                'AI sẽ thay thế lập trình viên không?',
                'Xu hướng công nghệ hàng đầu hiện nay?',
                'Gemini so với ChatGPT thì sao?'
            ];
        }
        // Blockchain related context
        else if (latestBotMessage.includes('blockchain') || latestBotMessage.includes('crypto') || latestBotMessage.includes('bitcoin')) {
            followUpQuestions = [
                'Smart contract là gì?',
                'NFT có phải là tương lai không?',
                'Blockchain ứng dụng vào các lĩnh vực nào?'
            ];
        }
        // Learning related context
        else if (latestBotMessage.includes('học') || latestBotMessage.includes('lập trình') || latestBotMessage.includes('tài liệu')) {
            followUpQuestions = [
                'Khóa học lập trình nào tốt nhất?',
                'Tài liệu học React tốt nhất?',
                'Nên bắt đầu với ngôn ngữ nào?'
            ];
        }
        // Default Vietnamese questions
        else {
            followUpQuestions = [
                'Bạn có thể kể về kinh nghiệm làm việc không?',
                'Những xu hướng công nghệ nào đang hot?',
                'Nên chọn ngôn ngữ lập trình nào để bắt đầu?'
            ];
        }
    } else {
        // English context-based questions
        // Portfolio related
        if (latestBotMessage.includes('project') || latestBotMessage.includes('portfolio')) {
            followUpQuestions = [
                'More details about the Tutor Platform project?',
                'What technologies were used in your projects?',
                'Do you have demo links for your projects?'
            ];
        }
        // Skills related
        else if (latestBotMessage.includes('skill') || latestBotMessage.includes('technology')) {
            followUpQuestions = [
                'How would you rate your JavaScript skills?',
                'Experience with which frameworks?',
                'Any experience with AI technologies?'
            ];
        }
        // Contact related
        else if (latestBotMessage.includes('contact') || latestBotMessage.includes('hire') || latestBotMessage.includes('email')) {
            followUpQuestions = [
                'What is your email response time?',
                'Are you available for freelance projects?',
                'Do you work remotely?'
            ];
        }
        // AI or tech related
        else if (latestBotMessage.includes('artificial intelligence') || latestBotMessage.includes('AI') || latestBotMessage.includes('technology')) {
            followUpQuestions = [
                'Will AI replace programmers?',
                'Top technology trends right now?',
                'How does Gemini compare to ChatGPT?'
            ];
        }
        // Blockchain related
        else if (latestBotMessage.includes('blockchain') || latestBotMessage.includes('crypto') || latestBotMessage.includes('bitcoin')) {
            followUpQuestions = [
                'What are smart contracts?',
                'Are NFTs the future?',
                'Applications of blockchain in various fields?'
            ];
        }
        // Learning related
        else if (latestBotMessage.includes('learn') || latestBotMessage.includes('programming') || latestBotMessage.includes('resources')) {
            followUpQuestions = [
                'What are the best programming courses?',
                'Best resources to learn React?',
                'Which language should beginners start with?'
            ];
        }
        // Default English questions
        else {
            followUpQuestions = [
                'Can you tell me about your work experience?',
                'What technology trends are hot right now?',
                'Which programming language should I start with?'
            ];
        }
    }
    
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
