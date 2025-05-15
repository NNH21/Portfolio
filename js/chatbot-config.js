// This configuration file contains settings for the chatbot

const CHATBOT_CONFIG = {
    // Your Zalo ID - replace with your actual Zalo ID
    zaloId: '0337982569',
    
    // Gemini API key - replace with your actual API key
    geminiApiKey: 'AIzaSyC-XhSIu3F_vKL9DVHtwv6ZSYsqbEyWhck',
    
    // Initial greeting message
    welcomeMessage: "Xin chào! Tôi là trợ lý ảo Mis. Tôi có thể giúp gì cho bạn? Bạn có thể hỏi tôi về portfolio hoặc bất kỳ câu hỏi nào khác.",
    
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
        "Làm thế nào để liên hệ với bạn?",
        "Blockchain là gì?",
        "Làm thế nào để học lập trình hiệu quả?",
        "Giải thích về trí tuệ nhân tạo"
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

// Cấu hình chatbot và tracking
const chatbotConfig = {
  enabled: true,
  apiEndpoint: 'https://api.example.com/chatbot',
  initialMessage: 'Chào bạn! Tôi có thể giúp gì cho bạn?',
  suggestedQueries: [
    'Các dự án của bạn',
    'Kỹ năng của bạn',
    'Cách liên hệ'
  ]
};

// Cấu hình theo dõi người dùng
const trackingConfig = {
  enabled: true,
  analyticsId: 'G-09V4B9YHB1',
  trackPageViews: true,
  trackEvents: true,
  trackUserInteractions: true,
  debugMode: true // Bật chế độ debug để kiểm tra
};

// Hàm kiểm tra trạng thái chức năng analytics
function checkAnalyticsStatus() {
  // Kiểm tra xem Google Analytics đã được tải chưa
  if (typeof gtag === 'undefined') {
    console.error('Google Analytics không được tải đúng cách');
    return false;
  }
  
  console.log('Google Analytics đã được tải thành công');
  
  // Gửi sự kiện test để kiểm tra
  if (trackingConfig.enabled && trackingConfig.debugMode) {
    gtag('event', 'test_event', {
      'event_category': 'testing',
      'event_label': 'analytics_check',
      'value': Date.now()
    });
    console.log('Đã gửi sự kiện test đến Google Analytics');
  }
  
  return true;
}

// Gọi hàm kiểm tra sau khi trang đã tải xong
window.addEventListener('load', function() {
  setTimeout(checkAnalyticsStatus, 2000); // Chờ 2 giây để đảm bảo GA đã tải xong
});
