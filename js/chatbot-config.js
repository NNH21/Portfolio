// This configuration file contains settings for the chatbot

const CHATBOT_CONFIG = {
    // Your Zalo ID - replace with your actual Zalo ID
    zaloId: '0337982569',
    
    // Gemini API key - replace with your actual API key
    geminiApiKey: 'AIzaSyC-XhSIu3F_vKL9DVHtwv6ZSYsqbEyWhck',
    
    // Initial greeting message
    welcomeMessage: "Xin chào! Tôi là trợ lý ảo Mis. Tôi có thể giúp gì cho bạn?",
    
    // Chatbot name
    botName: "Trợ lý Mis",
    
    // Quick reply options
    quickReplyOptions: [
        {
            text: "Dự án",
            value: "portfolio"
        },
        {
            text: "Kỹ năng",
            value: "skills"
        },
        {
            text: "Liên hệ",
            value: "contact"
        },
        {
            text: "Chat qua Zalo",
            value: "zalo"
        }
    ],
    
    // Suggested questions
    suggestedQuestions: [
        "Bạn có những dự án nào?",
        "Bạn có kinh nghiệm với công nghệ gì?",
        "Làm thế nào để liên hệ với bạn?"
    ],
    
    // UI Configuration
    ui: {
        // Chatbot colors
        primaryColor: "#4831d4",
        secondaryColor: "#f5f5f5",
        textColor: "#333333",
        
        // Chatbot size and position
        width: "320px",
        height: "450px",
        position: "right", // right or left
        
        // Chatbot bubble
        bubbleSize: "60px",
        
        // Animation
        animationSpeed: "0.3s"
    }
};
