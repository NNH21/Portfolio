// Analytics Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị thông báo cho người dùng lần đầu truy cập
    showVisitNotification();
    
    // Theo dõi tương tác của người dùng trên trang
    trackUserInteractions();
    
    // Theo dõi thông tin thiết bị
    trackDeviceInfo();
    
    // Theo dõi thời gian truy cập
    trackVisitTime();
    
    // Theo dõi vị trí địa lý (nếu người dùng cho phép)
    trackGeolocation();
    
    // Thêm nút thống kê
    addStatsButton();
    
    // Chạy theo dõi chế độ xem trang
    trackPageViews();
});

// Hiển thị thông báo cho người dùng
function showVisitNotification() {
    // Kiểm tra xem đây có phải là lần đầu truy cập không
    if (!localStorage.getItem('hasVisitedBefore')) {
        // Tạo một thông báo nhỏ ở góc màn hình
        const notification = document.createElement('div');
        notification.className = 'visit-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-chart-line"></i>
                <p>Chào mừng bạn đến với website của tôi! Thông tin truy cập của bạn được ghi nhận để cải thiện trải nghiệm.</p>
                <button class="close-notification"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Thêm CSS cho thông báo
        const style = document.createElement('style');
        style.textContent = `
            .visit-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                max-width: 320px;
                background-color: #4831d4;
                color: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                animation: slide-in 0.3s ease-out;
            }
            
            .notification-content {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .notification-content i {
                font-size: 20px;
            }
            
            .notification-content p {
                margin: 0;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .close-notification {
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 14px;
            }
            
            @keyframes slide-in {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Xử lý đóng thông báo
        document.querySelector('.close-notification').addEventListener('click', function() {
            notification.style.display = 'none';
        });
        
        // Lưu trạng thái đã truy cập
        localStorage.setItem('hasVisitedBefore', 'true');
        
        // Tự động ẩn thông báo sau 8 giây
        setTimeout(function() {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            
            setTimeout(function() {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 8000);
    }
}

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

// Thêm nút thống kê vào trang
function addStatsButton() {
    // Tạo nút thống kê
    const statsButton = document.createElement('div');
    statsButton.className = 'visitor-stats';
    statsButton.innerHTML = '<i class="fas fa-chart-bar"></i>';
    
    // Tạo bảng thống kê
    const statsPanel = document.createElement('div');
    statsPanel.className = 'stats-panel';
    statsPanel.id = 'stats-panel';
    statsPanel.innerHTML = `
        <h3>Thông tin truy cập</h3>
        <div class="stats-item">
            <span class="stats-label">Thiết bị:</span>
            <span class="stats-value" id="stats-device">${getDeviceType()}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Trình duyệt:</span>
            <span class="stats-value" id="stats-browser">${getBrowserInfo().name}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Thời gian:</span>
            <span class="stats-value" id="stats-time">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Ngày:</span>
            <span class="stats-value" id="stats-date">${new Date().toLocaleDateString()}</span>
        </div>
    `;
    
    // Thêm vào trang
    document.body.appendChild(statsButton);
    document.body.appendChild(statsPanel);
    
    // Xử lý sự kiện click
    let isVisible = false;
    statsButton.addEventListener('click', function() {
        isVisible = !isVisible;
        statsPanel.style.display = isVisible ? 'block' : 'none';
    });
} 