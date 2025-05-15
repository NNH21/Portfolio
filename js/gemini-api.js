// Gemini API Integration
// This file contains the integration with Google's Gemini API

// Get API key from config
const GEMINI_API_KEY = typeof CHATBOT_CONFIG !== 'undefined' ? CHATBOT_CONFIG.geminiApiKey : 'YOUR_GEMINI_API_KEY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Initialize conversation history
let conversationHistory = [];

// Initialize with system prompt
function initConversation() {
    // Clear previous history
    conversationHistory = [];
    
    // Add system message with context about the portfolio owner
    conversationHistory.push({
        role: "system",
        parts: [{
            text: "You are an AI assistant for HoangDev21's portfolio website. You have two main functions:\n\n1. Help visitors learn about HoangDev21's skills, projects, experience, and how to contact them. HoangDev21 is a web and mobile developer specializing in HTML, CSS, JavaScript, React, Vue.js and Java. They've worked on several projects including a Tutor-Platform website, Mis Assistant, Mobile Weather App, UI/UX redesigns, and more. If a visitor wants to hire HoangDev21, direct them to use the contact form or chat via Zalo.\n\n2. Answer general questions on any topic using your knowledge. You can respond to questions about science, history, technology, current events, or any other topic to the best of your abilities.\n\nIMPORTANT: You must ALWAYS respond in Vietnamese when users write in Vietnamese, and respond in English when users write in English. Always match the language of the user's input in your responses. Your responses should be concise, helpful, and well-formatted. Be friendly and conversational when responding to any type of question."
        }]
    });
    
    return conversationHistory;
}

// Function to detect language (simple version)
function isVietnamese(text) {
    // Vietnamese-specific characters
    const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    
    // Common Vietnamese words
    const vietnameseWords = /\b(của|và|hoặc|trong|với|các|những|là|có|không|tôi|bạn|chúng|mình|được|làm|người|thì|cho|về|đã|sẽ|từ|khi)\b/i;
    
    return vietnameseChars.test(text) || vietnameseWords.test(text);
}

// Function to ensure response is in the same language as the input
function ensureLanguageMatch(message, response) {
    const isInputVietnamese = isVietnamese(message);
    const isResponseVietnamese = isVietnamese(response);
    
    // If there's a mismatch, prepend a request to fix the language
    if (isInputVietnamese && !isResponseVietnamese) {
        // The response should be in Vietnamese, but it's not
        return "Xin lỗi, đây là phản hồi bằng tiếng Việt: " + response;
    } else if (!isInputVietnamese && isResponseVietnamese) {
        // The response should be in English, but it's in Vietnamese
        return "Sorry, here is the response in English: " + response;
    }
    
    return response;
}

// Function to send a message to Gemini API and get a response
async function sendMessageToGemini(message) {
    console.log('Sending message to Gemini API:', message.substring(0, 30) + '...');
    
    try {
        // If conversation history is empty, initialize it
        if (conversationHistory.length === 0) {
            initConversation();
        }
        
        // Add user message to history
        conversationHistory.push({
            role: "user",
            parts: [{ text: message }]
        });
        
        // Prepare conversation for API request (limit to last 10 messages to avoid token limits)
        const recentConversation = conversationHistory.slice(-10);
        
        // Check if API key is available or valid
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
            console.warn('Gemini API key not set or invalid. Using fallback response.');
            return getFallbackResponse(message);
        }
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: recentConversation,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received response from Gemini API');
        
        // Extract the text from the response
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            let responseText = data.candidates[0].content.parts[0].text;
            
            // Ensure the response is in the same language as the input
            responseText = ensureLanguageMatch(message, responseText);
            
            // Add assistant response to history
            conversationHistory.push({
                role: "model",
                parts: [{ text: responseText }]
            });
            
            console.log('Returning response:', responseText.substring(0, 30) + '...');
            return responseText;
        } else {
            console.error('Unexpected response structure:', data);
            return getFallbackResponse(message);
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return getFallbackResponse(message);
    }
}

// Function to get a fallback response when API fails
function getFallbackResponse(message) {
    // Check if message is in Vietnamese
    const isMessageVietnamese = isVietnamese(message);
    
    message = message.toLowerCase();
    
    if (isMessageVietnamese) {
        // Vietnamese fallback responses
        if (message.includes('dự án') || message.includes('portfolio') || message.includes('project')) {
            return "Tôi đã làm nhiều dự án bao gồm các ứng dụng web, ứng dụng di động và các hệ thống AI. Bạn có thể xem chúng trong phần Projects!";
        } else if (message.includes('kỹ năng') || message.includes('skill')) {
            return "Tôi có kỹ năng trong phát triển web (HTML, CSS, JavaScript), phát triển backend và có kinh nghiệm với nhiều framework khác nhau. Xem phần Skills để biết thêm chi tiết!";
        } else if (message.includes('liên hệ') || message.includes('contact') || message.includes('thuê') || message.includes('hire') || message.includes('email')) {
            return "Bạn có thể liên hệ với tôi qua form liên hệ trên trang web này, hoặc chat trực tiếp qua Zalo. Chỉ cần nhấn vào nút 'Chat on Zalo'!";
        } else if (message.includes('xin chào') || message.includes('chào') || message.includes('hello') || message.includes('hi')) {
            return "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?";
        } else {
            return "Cảm ơn tin nhắn của bạn. Bạn muốn biết thêm về portfolio, kỹ năng của tôi, hay cách liên hệ với tôi?";
        }
    } else {
        // English fallback responses
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
}

// Function to clear conversation history
function clearConversationHistory() {
    conversationHistory = [];
    initConversation();
}

// Export functions to be used in the main chatbot.js file
window.geminiAPI = {
    sendMessage: sendMessageToGemini,
    initializeContext: initConversation,
    clearHistory: clearConversationHistory
};