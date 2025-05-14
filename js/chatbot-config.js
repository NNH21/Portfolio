// This configuration file contains settings for the chatbot

const CHATBOT_CONFIG = {
    // Your Zalo ID - replace with your actual Zalo ID
    zaloId: '0337982569',
    
    // Gemini API key - replace with your actual API key
    geminiApiKey: 'AIzaSyC-XhSIu3F_vKL9DVHtwv6ZSYsqbEyWhck',
    
    // Initial greeting message
    welcomeMessage: "Hello! I'm your Mis assistant. How can I help you today?",
    
    // Chatbot name
    botName: "Trợ lý Mis",
    
    // Quick reply options
    quickReplyOptions: [
        {
            text: "Portfolio",
            value: "portfolio"
        },
        {
            text: "Skills",
            value: "skills"
        },
        {
            text: "Contact",
            value: "contact"
        },
        {
            text: "Chat on Zalo",
            value: "zalo"
        }
    ],
    
    // Suggested questions
    suggestedQuestions: [
        "Bạn đã làm những dự án nào?",
        "Bạn sử dụng công nghệ nào?",
        "Tôi có thể thuê bạn cho dự án của tôi như thế nào?",
        "Kinh nghiệm làm việc của bạn là gì?"
    ]
};
