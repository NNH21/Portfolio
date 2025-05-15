// Analytics Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Theo dõi tương tác của người dùng trên trang
    trackUserInteractions();
    
    // Theo dõi thông tin thiết bị
    trackDeviceInfo();
});

// Theo dõi các tương tác của người dùng
function trackUserInteractions() {
    // Theo dõi các lần click vào các liên kết quan trọng
    document.querySelectorAll('a.btn, .nav-links a, .project-links a').forEach(function(element) {
        element.addEventListener('click', function() {
            // Gửi sự kiện tới Google Analytics
            if (typeof gtag === 'function') {
                gtag('event', 'click', {
                    'event_category': 'interaction',
                    'event_label': this.innerText || this.href,
                    'value': 1
                });
            }
        });
    });
    
    // Theo dõi thời gian người dùng ở trên trang
    let startTime = new Date();
    window.addEventListener('beforeunload', function() {
        let endTime = new Date();
        let timeSpent = Math.round((endTime - startTime) / 1000);
        
        if (typeof gtag === 'function') {
            gtag('event', 'time_on_page', {
                'event_category': 'engagement',
                'event_label': 'seconds',
                'value': timeSpent
            });
        }
    });
}

// Theo dõi thông tin thiết bị
function trackDeviceInfo() {
    if (typeof gtag !== 'function') return;
    
    // Lấy thông tin thiết bị
    const deviceInfo = {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        deviceType: getDeviceType()
    };
    
    // Gửi thông tin thiết bị đến Google Analytics
    gtag('event', 'device_info', {
        'event_category': 'device',
        'event_label': deviceInfo.deviceType,
        'device_info': JSON.stringify(deviceInfo)
    });
}

// Xác định loại thiết bị
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
}

// Theo dõi trang người dùng đã xem
function trackPageViews() {
    // Thêm theo dõi cho từng phần của trang
    const sections = document.querySelectorAll('section');
    
    // Thiết lập IntersectionObserver để theo dõi khi nào người dùng xem một phần
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id || 'unknown-section';
                if (typeof gtag === 'function') {
                    gtag('event', 'view_section', {
                        'event_category': 'engagement',
                        'event_label': sectionId
                    });
                }
            }
        });
    }, { threshold: 0.5 }); // Theo dõi khi phần tử hiển thị ít nhất 50% trong viewport
    
    // Áp dụng observer cho tất cả các phần
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Chạy theo dõi chế độ xem trang khi trang được tải
document.addEventListener('DOMContentLoaded', trackPageViews); 