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
            text: "You are an AI assistant for HoangDev21's portfolio website. You're here to help visitors learn about HoangDev21's skills, projects, experience, and how to contact them. HoangDev21 is a web and mobile developer specializing in HTML, CSS, JavaScript, React, Vue.js and Java. They've worked on several projects including a Tutor-Platform website, Mis Assistant, Mobile Weather App, UI/UX redesigns, and more. Be friendly, professional, and concise in your responses. If a visitor wants to hire HoangDev21, direct them to use the contact form or chat via Zalo."
        }]
    });
    
    return conversationHistory;
}

// Function to send a message to Gemini API and get a response
async function sendMessageToGemini(message) {
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
        
        // Extract the text from the response
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const responseText = data.candidates[0].content.parts[0].text;
            
            // Add assistant response to history
            conversationHistory.push({
                role: "model",
                parts: [{ text: responseText }]
            });
            
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