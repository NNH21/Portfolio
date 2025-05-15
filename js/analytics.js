// Analytics Functionality - Thu thập dữ liệu không hiển thị cho người dùng
document.addEventListener('DOMContentLoaded', function() {
    // Thu thập thông tin người dùng mà không hiển thị
    trackUserDataSilently();
});

// Thu thập dữ liệu người dùng mà không hiển thị thông báo hay giao diện
function trackUserDataSilently() {
    if (typeof gtag !== 'function') {
        console.warn('Google Analytics không được tải - không thể theo dõi dữ liệu');
        return;
    }
    
    // Theo dõi các tương tác của người dùng
    trackUserInteractions();
    
    // Thu thập thông tin thiết bị
    trackDeviceInfo();
    
    // Thu thập thời gian truy cập
    trackVisitTime();
    
    // Thu thập vị trí địa lý (nếu người dùng cho phép)
    trackGeolocation();
    
    // Thu thập dữ liệu trang người dùng đã xem
    trackPageViews();
}

// Theo dõi tương tác người dùng
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
    
    // Theo dõi cuộn trang
    let lastScrollY = window.scrollY;
    let scrollTimeout;
    
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(function() {
            const scrollY = window.scrollY;
            const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
            const scrollDepth = Math.round((scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (typeof gtag === 'function' && Math.abs(scrollY - lastScrollY) > 50) {
                gtag('event', 'scroll', {
                    'event_category': 'engagement',
                    'event_label': scrollDirection,
                    'value': scrollDepth
                });
                
                lastScrollY = scrollY;
            }
        }, 300);
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
        deviceType: getDeviceType(),
        browser: getBrowserInfo(),
        connectionType: getConnectionInfo()
    };
    
    // Gửi thông tin thiết bị đến Google Analytics
    gtag('event', 'device_info', {
        'event_category': 'device',
        'event_label': deviceInfo.deviceType,
        'device_info': JSON.stringify(deviceInfo)
    });
}

// Theo dõi thời gian truy cập
function trackVisitTime() {
    if (typeof gtag !== 'function') return;
    
    const now = new Date();
    const visitInfo = {
        timestamp: now.getTime(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        hour: now.getHours(),
        day: now.getDay(),
        month: now.getMonth() + 1,
        year: now.getFullYear()
    };
    
    gtag('event', 'visit_time', {
        'event_category': 'visit',
        'event_label': visitInfo.date,
        'visit_info': JSON.stringify(visitInfo)
    });
}

// Theo dõi vị trí địa lý
function trackGeolocation() {
    if (typeof gtag !== 'function') return;
    
    // Kiểm tra xem trình duyệt có hỗ trợ geolocation API không
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // Thành công
            function(position) {
                const geolocationInfo = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                gtag('event', 'geolocation', {
                    'event_category': 'visit',
                    'event_label': 'location',
                    'geolocation_info': JSON.stringify(geolocationInfo)
                });
            },
            // Lỗi
            function(error) {
                console.log("Geolocation error: " + error.message);
                
                // Gửi sự kiện lỗi
                gtag('event', 'geolocation_error', {
                    'event_category': 'error',
                    'event_label': error.message
                });
            },
            // Tùy chọn
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }
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

// Lấy thông tin trình duyệt
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "Unknown";
    
    // Xác định trình duyệt
    if (ua.indexOf("Chrome") > -1) {
        browserName = "Chrome";
    } else if (ua.indexOf("Safari") > -1) {
        browserName = "Safari";
    } else if (ua.indexOf("Firefox") > -1) {
        browserName = "Firefox";
    } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident/") > -1) {
        browserName = "Internet Explorer";
    } else if (ua.indexOf("Edge") > -1) {
        browserName = "Edge";
    } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
        browserName = "Opera";
    }
    
    // Trích xuất phiên bản
    const browserMatch = ua.match(/(Chrome|Safari|Firefox|MSIE|Edge|Opera|OPR)\/([0-9\.]+)/i);
    if (browserMatch && browserMatch[2]) {
        browserVersion = browserMatch[2];
    }
    
    return {
        name: browserName,
        version: browserVersion
    };
}

// Lấy thông tin về kết nối
function getConnectionInfo() {
    if (!navigator.connection) {
        return "Connection API not supported";
    }
    
    return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
    };
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

// Tạo mã định danh người dùng duy nhất để theo dõi phiên
function generateUserID() {
    let userId = localStorage.getItem('visitor_id');
    if (!userId) {
        userId = 'visitor_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('visitor_id', userId);
    }
    
    // Gửi ID người dùng đến GA
    if (typeof gtag === 'function') {
        gtag('set', {
            'user_id': userId
        });
    }
    
    return userId;
}

// Gửi sự kiện tùy chỉnh đến Google Analytics
function sendCustomEvent(eventName, params) {
    if (typeof gtag !== 'function') return;
    
    gtag('event', eventName, params);
}

// Khởi tạo theo dõi khi trang tải xong
window.addEventListener('load', function() {
    // Tạo ID người dùng nếu chưa có
    generateUserID();
    
    // Gửi sự kiện trang đã tải
    sendCustomEvent('page_loaded', {
        'page_path': window.location.pathname,
        'page_title': document.title,
        'referrer': document.referrer
    });
}); 