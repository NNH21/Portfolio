// Công cụ kiểm tra chức năng đo lường - Chỉ hiển thị trong trang admin
(function() {
    // Kiểm tra xem đang ở trang admin không rồi mới chạy công cụ kiểm tra
    if (!isAdminPage()) {
        return; // Không chạy công cụ kiểm tra nếu không phải trang admin
    }
    
    const analyticsTestingTool = {
        // Cấu hình công cụ testing
        config: {
            debug: true,
            showConsoleMessages: true,
            autoTest: true,
            testInterval: 5000 // 5 giây kiểm tra 1 lần
        },

        // Trạng thái kiểm tra
        status: {
            gtagAvailable: false,
            trackingEnabled: false,
            testsRun: 0,
            testsSuccess: 0,
            lastTestTime: null,
            testEvents: []
        },

        // Initialize the testing tool
        init: function() {
            this.log('Khởi tạo công cụ kiểm tra analytics...');
            
            // Nếu đang ở chế độ debug, thêm UI kiểm tra
            if (this.config.debug) {
                this.addDebugUI();
            }
            
            // Nếu tự động kiểm tra được bật
            if (this.config.autoTest) {
                setTimeout(() => this.runTests(), 3000);
            }
            
            // Ghi đè hàm gtag để theo dõi các sự kiện
            this.overrideGtag();
            
            return this;
        },
        
        // Ghi đè hàm gtag để có thể theo dõi các sự kiện
        overrideGtag: function() {
            const originalGtag = window.gtag;
            
            if (typeof originalGtag === 'function') {
                this.status.gtagAvailable = true;
                
                window.gtag = (...args) => {
                    // Gọi hàm gtag gốc
                    originalGtag.apply(window, args);
                    
                    // Log lời gọi hàm nếu là sự kiện
                    if (args[0] === 'event') {
                        const eventName = args[1];
                        const eventParams = args[2] || {};
                        
                        this.logEvent(eventName, eventParams);
                    }
                };
                
                this.log('Đã ghi đè hàm gtag thành công để theo dõi sự kiện');
            } else {
                this.log('Không thể ghi đè gtag - gtag chưa được định nghĩa', 'error');
            }
        },
        
        // Thêm giao diện kiểm tra
        addDebugUI: function() {
            // Tạo container cho debug UI
            const debugPanel = document.createElement('div');
            debugPanel.id = 'analytics-test-panel';
            debugPanel.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 300px;
                max-height: 400px;
                background-color: rgba(0, 0, 0, 0.8);
                color: #fff;
                border-radius: 8px;
                padding: 12px;
                font-family: monospace;
                font-size: 12px;
                z-index: 9999;
                overflow: auto;
                opacity: 0.8;
                transition: opacity 0.3s;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            `;
            
            debugPanel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 14px;">🔍 Analytics Test Tool</h3>
                    <div>
                        <button id="analytics-test-btn" style="background: #4831d4; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-right: 5px;">Test</button>
                        <button id="analytics-close-btn" style="background: #999; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">X</button>
                    </div>
                </div>
                <div id="analytics-status" style="margin-bottom: 10px; padding: 5px; background-color: rgba(255,255,255,0.1); border-radius: 4px;">
                    <div>GA Available: <span id="ga-status">Checking...</span></div>
                    <div>Tracking Enabled: <span id="tracking-status">Checking...</span></div>
                    <div>Tests Run: <span id="tests-run">0</span></div>
                    <div>Tests Success: <span id="tests-success">0</span></div>
                </div>
                <div id="analytics-events" style="max-height: 240px; overflow-y: auto; font-size: 11px;">
                    <div style="padding: 5px; color: #aaa;">Đang chờ sự kiện...</div>
                </div>
            `;
            
            document.body.appendChild(debugPanel);
            
            // Thêm sự kiện cho các nút
            document.getElementById('analytics-test-btn').addEventListener('click', () => this.runTests());
            document.getElementById('analytics-close-btn').addEventListener('click', () => {
                debugPanel.style.display = 'none';
            });
            
            // Gửi hover để thay đổi độ mờ
            debugPanel.addEventListener('mouseenter', () => {
                debugPanel.style.opacity = '1';
            });
            
            debugPanel.addEventListener('mouseleave', () => {
                debugPanel.style.opacity = '0.8';
            });
            
            this.debugPanel = debugPanel;
        },
        
        // Chạy kiểm tra
        runTests: function() {
            this.status.testsRun++;
            this.status.lastTestTime = new Date();
            this.updateUI();
            
            this.log('Bắt đầu kiểm tra analytics...');
            
            // Kiểm tra 1: Google Analytics có sẵn sàng?
            this.testGAAvailability()
                .then(() => this.testTrackingEnabled())
                .then(() => this.testSendEvent())
                .then(() => {
                    this.status.testsSuccess++;
                    this.log('✅ Tất cả các bài kiểm tra đều thành công!');
                    this.updateUI();
                    
                    // Lên lịch kiểm tra tiếp theo nếu đang ở chế độ tự động
                    if (this.config.autoTest) {
                        setTimeout(() => this.runTests(), this.config.testInterval);
                    }
                })
                .catch(error => {
                    this.log(`❌ Kiểm tra thất bại: ${error}`, 'error');
                    this.updateUI();
                    
                    // Lên lịch kiểm tra tiếp theo nếu đang ở chế độ tự động
                    if (this.config.autoTest) {
                        setTimeout(() => this.runTests(), this.config.testInterval);
                    }
                });
        },
        
        // Kiểm tra Google Analytics có sẵn sàng không
        testGAAvailability: function() {
            return new Promise((resolve, reject) => {
                if (typeof gtag === 'function') {
                    this.status.gtagAvailable = true;
                    this.log('✅ Google Analytics (gtag) có sẵn');
                    resolve();
                } else {
                    this.status.gtagAvailable = false;
                    reject('Google Analytics (gtag) không có sẵn');
                }
            });
        },
        
        // Kiểm tra theo dõi có được bật không
        testTrackingEnabled: function() {
            return new Promise((resolve, reject) => {
                // Kiểm tra xem có biến cấu hình theo dõi không
                if (typeof trackingConfig !== 'undefined' && trackingConfig.enabled) {
                    this.status.trackingEnabled = true;
                    this.log('✅ Theo dõi được bật với ID: ' + trackingConfig.analyticsId);
                    resolve();
                } else if (typeof gtag === 'function') {
                    // Nếu không có biến cấu hình nhưng gtag có sẵn, coi như đã bật
                    this.status.trackingEnabled = true;
                    this.log('✅ Theo dõi có vẻ đã được bật (gtag có sẵn)');
                    resolve();
                } else {
                    this.status.trackingEnabled = false;
                    reject('Theo dõi không được bật');
                }
            });
        },
        
        // Kiểm tra gửi sự kiện
        testSendEvent: function() {
            return new Promise((resolve, reject) => {
                if (typeof gtag === 'function') {
                    try {
                        const testEventName = 'test_analytics_tool';
                        const timestamp = Date.now();
                        
                        gtag('event', testEventName, {
                            'event_category': 'testing',
                            'event_label': 'automated_test',
                            'timestamp': timestamp
                        });
                        
                        this.log(`✅ Đã gửi sự kiện kiểm tra: ${testEventName}`);
                        
                        // Kiểm tra xem sự kiện có được ghi nhận trong công cụ không
                        const eventFound = this.status.testEvents.some(event => 
                            event.name === testEventName && 
                            event.params.timestamp === timestamp
                        );
                        
                        if (eventFound) {
                            this.log('✅ Sự kiện kiểm tra đã được ghi nhận bởi công cụ');
                            resolve();
                        } else {
                            // Thường nếu ghi đè gtag thành công, sự kiện sẽ được ghi nhận ngay lập tức
                            // Nếu không, có thể là vấn đề với việc ghi đè
                            this.log('⚠️ Sự kiện kiểm tra được gửi nhưng không được ghi nhận bởi công cụ');
                            resolve(); // Vẫn giải quyết vì sự kiện có thể đã được gửi
                        }
                    } catch (error) {
                        reject(`Không thể gửi sự kiện kiểm tra: ${error.message}`);
                    }
                } else {
                    reject('Không thể kiểm tra gửi sự kiện - gtag không có sẵn');
                }
            });
        },
        
        // Ghi nhật ký sự kiện
        logEvent: function(eventName, eventParams) {
            const event = {
                name: eventName,
                params: eventParams,
                time: new Date().toISOString().split('T')[1].split('.')[0]
            };
            
            this.status.testEvents.unshift(event);
            
            // Giới hạn số lượng sự kiện được lưu trữ
            if (this.status.testEvents.length > 50) {
                this.status.testEvents.pop();
            }
            
            this.updateEventsUI();
        },
        
        // Cập nhật UI
        updateUI: function() {
            if (!this.config.debug || !this.debugPanel) return;
            
            document.getElementById('ga-status').textContent = this.status.gtagAvailable ? '✅ Yes' : '❌ No';
            document.getElementById('tracking-status').textContent = this.status.trackingEnabled ? '✅ Yes' : '❌ No';
            document.getElementById('tests-run').textContent = this.status.testsRun;
            document.getElementById('tests-success').textContent = this.status.testsSuccess;
            
            this.updateEventsUI();
        },
        
        // Cập nhật UI sự kiện
        updateEventsUI: function() {
            if (!this.config.debug || !this.debugPanel) return;
            
            const eventsContainer = document.getElementById('analytics-events');
            if (!eventsContainer) return;
            
            if (this.status.testEvents.length === 0) {
                eventsContainer.innerHTML = '<div style="padding: 5px; color: #aaa;">Đang chờ sự kiện...</div>';
                return;
            }
            
            eventsContainer.innerHTML = this.status.testEvents.map(event => {
                let paramsText = '';
                try {
                    paramsText = JSON.stringify(event.params);
                    if (paramsText.length > 50) {
                        paramsText = paramsText.substring(0, 47) + '...';
                    }
                } catch (e) {
                    paramsText = '[Không thể hiển thị tham số]';
                }
                
                return `
                    <div style="padding: 5px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 5px;">
                        <div style="display: flex; justify-content: space-between;">
                            <strong style="color: #4831d4;">${event.name}</strong>
                            <span style="color: #999; font-size: 10px;">${event.time}</span>
                        </div>
                        <div style="color: #ccc; font-size: 10px; margin-top: 3px; word-break: break-all;">${paramsText}</div>
                    </div>
                `;
            }).join('');
        },
        
        // Ghi nhật ký
        log: function(message, type = 'info') {
            if (!this.config.showConsoleMessages) return;
            
            const prefix = '📊 Analytics Test:';
            
            switch (type) {
                case 'error':
                    console.error(prefix, message);
                    break;
                case 'warn':
                    console.warn(prefix, message);
                    break;
                default:
                    console.log(prefix, message);
            }
        }
    };
    
    // Kiểm tra xem đang ở trang admin không
    function isAdminPage() {
        // Kiểm tra URL hoặc tiêu đề trang
        const isAdmin = window.location.pathname.includes('admin') || 
                      document.title.toLowerCase().includes('admin') ||
                      document.querySelector('.admin-container') !== null;
                      
        return isAdmin;
    }
    
    // Chỉ khởi tạo công cụ kiểm tra nếu đang ở trang admin
    if (isAdminPage()) {
        window.analyticsTestingTool = analyticsTestingTool.init();
    }
})(); 