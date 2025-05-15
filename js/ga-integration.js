// Google Analytics Integration

// Configuration
const GA_CONFIG = {
    apiKey: '', // Sẽ được cập nhật từ form settings
    viewId: '', // Sẽ được cập nhật từ form settings
    gaPropertyId: 'G-09V4B9YHB1', // Google Analytics Property ID của bạn
    dateRanges: {
        '7': { startDate: '7daysAgo', endDate: 'today' },
        '30': { startDate: '30daysAgo', endDate: 'today' },
        '90': { startDate: '90daysAgo', endDate: 'today' },
        '365': { startDate: '365daysAgo', endDate: 'today' }
    }
};

// Khởi tạo Google Analytics API
function initGoogleAnalytics() {
    console.log("Initializing Google Analytics API");
    
    // Lấy thông tin cấu hình từ localStorage
    const gaId = localStorage.getItem('ga-id');
    const viewId = localStorage.getItem('view-id');
    const apiKey = localStorage.getItem('ga-api-key');
    
    if (gaId) GA_CONFIG.gaPropertyId = gaId;
    if (viewId) GA_CONFIG.viewId = viewId;
    if (apiKey) GA_CONFIG.apiKey = apiKey;
    
    console.log("Configuration loaded:", { 
        gaId: GA_CONFIG.gaPropertyId, 
        viewId: GA_CONFIG.viewId, 
        apiKey: GA_CONFIG.apiKey ? "API Key set" : "No API Key" 
    });
    
    // Nếu chưa có API key, hiển thị thông báo
    if (!GA_CONFIG.apiKey || !GA_CONFIG.viewId) {
        console.log("API Key or View ID missing, showing API required message");
        showApiKeyRequired();
        return;
    }
    
    // Khởi tạo Google Analytics API
    loadAnalyticsAPI();
}

// Hiển thị thông báo cần thêm API key
function showApiKeyRequired() {
    document.querySelectorAll('.chart').forEach(chart => {
        chart.innerHTML = `
            <div class="ga-auth-required">
                <p>Vui lòng cấu hình Google Analytics API trong trang Settings.</p>
                <p>Bạn cần tạo API key và chỉ định View ID.</p>
                <a href="#" onclick="switchToSettings()">Đi đến Settings</a>
            </div>
        `;
    });
    
    // Hiển thị dữ liệu placeholder
    document.getElementById('total-visitors').textContent = '---';
    document.getElementById('page-views').textContent = '---';
    document.getElementById('avg-duration').textContent = '--:--';
    document.getElementById('bounce-rate').textContent = '--%';
}

// Chuyển hướng đến tab Settings
function switchToSettings() {
    // Xóa active class từ tất cả sidebar items
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    
    // Thêm active class cho settings item
    document.querySelector('.sidebar-item[data-tab="settings"]').classList.add('active');
    
    // Ẩn tất cả tab content
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    
    // Hiển thị settings tab
    document.getElementById('settings').classList.add('active');
    
    return false; // Ngăn chặn hành vi mặc định của thẻ a
}

// Tải Google Analytics API
function loadAnalyticsAPI() {
    console.log("Loading Google Analytics API...");
    
    // Xóa comment để kích hoạt Google Analytics API thực tế
    gapi.load('client', () => {
        console.log("GAPI client loaded, initializing...");
        
        gapi.client.init({
            apiKey: GA_CONFIG.apiKey,
            discoveryDocs: ['https://analyticsreporting.googleapis.com/$discovery/rest?version=v4'],
        }).then(() => {
            console.log("API initialized successfully");
            // API đã được khởi tạo và đã sẵn sàng
            loadAnalyticsData();
        }).catch(error => {
            console.error('Error initializing Analytics API', error);
            showAPIError(error);
            
            // Nếu có lỗi, tải dữ liệu mẫu làm dự phòng
            loadSampleData();
        });
    });
}

// Hiển thị lỗi API
function showAPIError(error) {
    console.error("API Error:", error);
    
    document.querySelectorAll('.chart').forEach(chart => {
        chart.innerHTML = `
            <div class="ga-error">
                <p>Lỗi kết nối đến Google Analytics API.</p>
                <p>Chi tiết lỗi: ${error.message || 'Unknown error'}</p>
            </div>
        `;
    });
}

// Tải dữ liệu Google Analytics thực
function loadAnalyticsData() {
    console.log("Loading analytics data...");
    
    // Lấy phạm vi ngày từ dateRange selector
    const dateRange = document.getElementById('date-range')?.value || '30';
    const { startDate, endDate } = GA_CONFIG.dateRanges[dateRange];
    
    console.log(`Date range: ${startDate} to ${endDate}`);
    
    // Gọi API để lấy dữ liệu từ Google Analytics
    fetchOverviewData(startDate, endDate);
    fetchVisitorsOverTime(startDate, endDate);
    fetchTopPages(startDate, endDate);
}

// Lấy dữ liệu tổng quan
function fetchOverviewData(startDate, endDate) {
    console.log("Fetching overview data...");
    
    // Kiểm tra xem API đã sẵn sàng chưa
    if (!gapi.client || !GA_CONFIG.viewId) {
        console.log("GAPI client not ready or ViewID missing, loading sample data");
        loadSampleData();
        return;
    }
    
    try {
        gapi.client.request({
            path: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
            method: 'POST',
            body: {
                reportRequests: [
                    {
                        viewId: GA_CONFIG.viewId,
                        dateRanges: [{ startDate, endDate }],
                        metrics: [
                            { expression: 'ga:users' },
                            { expression: 'ga:pageviews' },
                            { expression: 'ga:avgSessionDuration' },
                            { expression: 'ga:bounceRate' }
                        ]
                    }
                ]
            }
        }).then(response => {
            console.log("Overview data received:", response);
            
            const report = response.result.reports[0];
            const data = report.data.totals[0].values;
            
            // Cập nhật card thống kê
            document.getElementById('total-visitors').textContent = parseInt(data[0]).toLocaleString();
            document.getElementById('page-views').textContent = parseInt(data[1]).toLocaleString();
            
            // Định dạng thời gian trung bình
            const avgDuration = parseInt(data[2]);
            const minutes = Math.floor(avgDuration / 60);
            const seconds = Math.round(avgDuration % 60);
            document.getElementById('avg-duration').textContent = `${minutes}m ${seconds}s`;
            
            // Định dạng tỷ lệ thoát
            document.getElementById('bounce-rate').textContent = `${parseFloat(data[3]).toFixed(1)}%`;
        }).catch(error => {
            console.error('Error fetching overview data', error);
            // Nếu có lỗi, sử dụng dữ liệu mẫu
            fetchOverviewDataFallback();
        });
    } catch (error) {
        console.error('Exception while fetching overview data', error);
        fetchOverviewDataFallback();
    }
}

// Dữ liệu tổng quan dự phòng nếu API không hoạt động
function fetchOverviewDataFallback() {
    console.log("Using fallback overview data");
    
    const sampleData = {
        totalVisitors: 1284,
        pageViews: 3429,
        avgDuration: '2m 15s',
        bounceRate: '38.5%'
    };
    
    // Cập nhật card thống kê
    document.getElementById('total-visitors').textContent = sampleData.totalVisitors.toLocaleString();
    document.getElementById('page-views').textContent = sampleData.pageViews.toLocaleString();
    document.getElementById('avg-duration').textContent = sampleData.avgDuration;
    document.getElementById('bounce-rate').textContent = sampleData.bounceRate;
}

// Lấy dữ liệu người dùng theo thời gian
function fetchVisitorsOverTime(startDate, endDate) {
    console.log("Fetching visitors over time data...");
    
    // Kiểm tra xem API đã sẵn sàng chưa
    if (!gapi.client || !GA_CONFIG.viewId) {
        console.log("GAPI client not ready or ViewID missing, using sample visitor data");
        const visitorData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [65, 59, 80, 81, 56, 55, 40]
        };
        createVisitorChart(visitorData);
        return;
    }
    
    try {
        gapi.client.request({
            path: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
            method: 'POST',
            body: {
                reportRequests: [
                    {
                        viewId: GA_CONFIG.viewId,
                        dateRanges: [{ startDate, endDate }],
                        dimensions: [{ name: 'ga:date' }],
                        metrics: [{ expression: 'ga:users' }],
                        orderBys: [{ fieldName: 'ga:date', sortOrder: 'ASCENDING' }]
                    }
                ]
            }
        }).then(response => {
            console.log("Visitors over time data received:", response);
            
            const report = response.result.reports[0];
            const rows = report.data.rows || [];
            
            const labels = [];
            const data = [];
            
            rows.forEach(row => {
                // Định dạng ngày (YYYYMMDD -> DD)
                const dateString = row.dimensions[0];
                const day = dateString.substring(6, 8);
                labels.push(day);
                
                // Lấy số lượng người dùng
                data.push(parseInt(row.metrics[0].values[0]));
            });
            
            createVisitorChart({ labels, data });
        }).catch(error => {
            console.error('Error fetching visitor data', error);
            // Nếu có lỗi, sử dụng dữ liệu mẫu
            const visitorData = {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                data: [65, 59, 80, 81, 56, 55, 40]
            };
            createVisitorChart(visitorData);
        });
    } catch (error) {
        console.error('Exception while fetching visitor data', error);
        const visitorData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [65, 59, 80, 81, 56, 55, 40]
        };
        createVisitorChart(visitorData);
    }
}

// Lấy dữ liệu các trang xem nhiều nhất
function fetchTopPages(startDate, endDate) {
    console.log("Fetching top pages data...");
    
    // Kiểm tra xem API đã sẵn sàng chưa
    if (!gapi.client || !GA_CONFIG.viewId) {
        console.log("GAPI client not ready or ViewID missing, using sample pages data");
        const pagesData = {
            labels: ['Home', 'About', 'Skills', 'Projects', 'Contact'],
            data: [300, 180, 150, 210, 120]
        };
        createPagesChart(pagesData);
        return;
    }
    
    try {
        gapi.client.request({
            path: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
            method: 'POST',
            body: {
                reportRequests: [
                    {
                        viewId: GA_CONFIG.viewId,
                        dateRanges: [{ startDate, endDate }],
                        dimensions: [{ name: 'ga:pagePath' }],
                        metrics: [{ expression: 'ga:pageviews' }],
                        orderBys: [{ fieldName: 'ga:pageviews', sortOrder: 'DESCENDING' }],
                        pageSize: 5
                    }
                ]
            }
        }).then(response => {
            console.log("Top pages data received:", response);
            
            const report = response.result.reports[0];
            const rows = report.data.rows || [];
            
            const labels = [];
            const data = [];
            
            rows.forEach(row => {
                // Lấy đường dẫn trang và định dạng nó
                let pagePath = row.dimensions[0];
                
                // Định dạng đường dẫn trang để hiển thị đẹp hơn
                if (pagePath === '/') {
                    pagePath = 'Home';
                } else {
                    pagePath = pagePath.replace(/^\/|\/$/g, ''); // Bỏ dấu / ở đầu và cuối
                    pagePath = pagePath.charAt(0).toUpperCase() + pagePath.slice(1); // Viết hoa chữ cái đầu
                }
                
                labels.push(pagePath);
                data.push(parseInt(row.metrics[0].values[0]));
            });
            
            createPagesChart({ labels, data });
        }).catch(error => {
            console.error('Error fetching top pages', error);
            // Nếu có lỗi, sử dụng dữ liệu mẫu
            const pagesData = {
                labels: ['Home', 'About', 'Skills', 'Projects', 'Contact'],
                data: [300, 180, 150, 210, 120]
            };
            createPagesChart(pagesData);
        });
    } catch (error) {
        console.error('Exception while fetching top pages', error);
        const pagesData = {
            labels: ['Home', 'About', 'Skills', 'Projects', 'Contact'],
            data: [300, 180, 150, 210, 120]
        };
        createPagesChart(pagesData);
    }
}

// Tải dữ liệu mẫu
function loadSampleData() {
    console.log("Loading sample data");
    
    const sampleData = {
        totalVisitors: 1284,
        pageViews: 3429,
        avgDuration: '2m 15s',
        bounceRate: '38.5%',
        visitorChart: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [65, 59, 80, 81, 56, 55, 40]
        },
        pagesChart: {
            labels: ['Home', 'About', 'Skills', 'Projects', 'Contact'],
            data: [300, 180, 150, 210, 120]
        }
    };

    // Cập nhật card thống kê
    document.getElementById('total-visitors').textContent = sampleData.totalVisitors.toLocaleString();
    document.getElementById('page-views').textContent = sampleData.pageViews.toLocaleString();
    document.getElementById('avg-duration').textContent = sampleData.avgDuration;
    document.getElementById('bounce-rate').textContent = sampleData.bounceRate;
    
    // Tạo biểu đồ
    createVisitorChart(sampleData.visitorChart);
    createPagesChart(sampleData.pagesChart);
}

// Tạo biểu đồ người dùng - Export cho window để admin-dashboard.js có thể sử dụng
window.createVisitorChart = function(data) {
    const ctx = document.getElementById('visitors-chart');
    
    // Xóa nội dung trước đó
    ctx.innerHTML = '';
    
    // Tạo thẻ canvas
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    
    // Tạo biểu đồ
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Visitors',
                data: data.data,
                backgroundColor: 'rgba(72, 49, 212, 0.2)',
                borderColor: 'rgba(72, 49, 212, 1)',
                borderWidth: 2,
                tension: 0.3,
                pointBackgroundColor: 'rgba(72, 49, 212, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Tạo biểu đồ top pages - Export cho window để admin-dashboard.js có thể sử dụng
window.createPagesChart = function(data) {
    const ctx = document.getElementById('pages-chart');
    
    // Xóa nội dung trước đó
    ctx.innerHTML = '';
    
    // Tạo thẻ canvas
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    
    // Tạo biểu đồ
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Page Views',
                data: data.data,
                backgroundColor: [
                    'rgba(72, 49, 212, 0.7)',
                    'rgba(204, 243, 129, 0.7)',
                    'rgba(255, 118, 118, 0.7)',
                    'rgba(44, 201, 188, 0.7)',
                    'rgba(255, 190, 11, 0.7)'
                ],
                borderColor: [
                    'rgba(72, 49, 212, 1)',
                    'rgba(204, 243, 129, 1)',
                    'rgba(255, 118, 118, 1)',
                    'rgba(44, 201, 188, 1)',
                    'rgba(255, 190, 11, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Export các hàm cho window để admin-dashboard.js có thể sử dụng
window.loadAnalyticsData = loadAnalyticsData;
window.loadAnalyticsAPI = loadAnalyticsAPI;
window.initGoogleAnalytics = initGoogleAnalytics;

// Cập nhật form Settings
function updateSettingsForm() {
    console.log("Updating settings form");
    
    const gaId = localStorage.getItem('ga-id');
    const viewId = localStorage.getItem('view-id');
    const apiKey = localStorage.getItem('ga-api-key');
    
    if (gaId && document.getElementById('ga-id')) document.getElementById('ga-id').value = gaId;
    if (viewId && document.getElementById('view-id')) document.getElementById('view-id').value = viewId;
    if (apiKey && document.getElementById('ga-api-key')) document.getElementById('ga-api-key').value = apiKey;
}

// Khởi tạo trang khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    console.log("GA Integration: DOM Content Loaded");
    
    // Cập nhật form settings
    updateSettingsForm();
    
    // Khởi tạo Google Analytics
    initGoogleAnalytics();
    
    // Xử lý sự kiện thay đổi date range
    document.getElementById('date-range')?.addEventListener('change', function() {
        loadAnalyticsData();
    });
    
    // Cập nhật xử lý form
    document.getElementById('analytics-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const gaId = document.getElementById('ga-id').value;
        const viewId = document.getElementById('view-id').value;
        const apiKey = document.getElementById('ga-api-key').value;
        
        console.log("Form submitted with values:", { 
            gaId: gaId, 
            viewId: viewId, 
            apiKey: apiKey ? "API Key set" : "No API Key" 
        });
        
        if (gaId && viewId) {
            // Lưu cấu hình
            localStorage.setItem('ga-id', gaId);
            localStorage.setItem('view-id', viewId);
            if (apiKey) localStorage.setItem('ga-api-key', apiKey);
            
            // Hiển thị thông báo thành công
            alert('Cài đặt Analytics đã được lưu. Đang tải lại dữ liệu...');
            
            // Khởi tạo lại Google Analytics
            GA_CONFIG.gaPropertyId = gaId;
            GA_CONFIG.viewId = viewId;
            if (apiKey) GA_CONFIG.apiKey = apiKey;
            
            // Tải lại dữ liệu
            loadAnalyticsAPI();
        } else {
            alert('Vui lòng nhập Google Analytics ID và View ID');
        }
    });
}); 