// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initDashboard();
    
    // Tab switching functionality
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all sidebar items
            sidebarItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all tab content
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Load data for the selected tab
            loadTabData(tabId);
        });
    });
    
    // Theme switcher
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            themeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const theme = this.getAttribute('data-theme');
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
                localStorage.setItem('dashboard-theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('dashboard-theme', 'light');
            }
            
            // Redraw charts if needed
            updateChartsForTheme();
        });
    });
    
    // Date range selector
    const dateRange = document.getElementById('date-range');
    if (dateRange) {
        dateRange.addEventListener('change', function() {
            // Update all data based on new date range
            const range = this.value;
            if (typeof loadAnalyticsData === 'function') {
                loadAnalyticsData(); // Sử dụng hàm từ ga-integration.js
            } else {
                updateDataForDateRange(range);
            }
        });
    }
    
    // Analytics form submission
    const analyticsForm = document.getElementById('analytics-form');
    if (analyticsForm) {
        analyticsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const gaId = document.getElementById('ga-id').value;
            const viewId = document.getElementById('view-id').value;
            const apiKey = document.getElementById('ga-api-key').value;
            
            if (gaId && viewId) {
                // Save to localStorage
                localStorage.setItem('ga-id', gaId);
                localStorage.setItem('view-id', viewId);
                if (apiKey) localStorage.setItem('ga-api-key', apiKey);
                
                // Show success message
                alert('Analytics settings saved successfully. Refreshing data...');
                
                // Tải lại dữ liệu sử dụng ga-integration.js nếu có
                if (typeof loadAnalyticsAPI === 'function') {
                    // Cập nhật cấu hình
                    if (typeof GA_CONFIG !== 'undefined') {
                        GA_CONFIG.gaPropertyId = gaId;
                        GA_CONFIG.viewId = viewId;
                        if (apiKey) GA_CONFIG.apiKey = apiKey;
                    }
                    loadAnalyticsAPI();
                } else {
                    // Fallback đến function trong file này
                    initDashboard();
                }
            } else {
                alert('Vui lòng nhập Google Analytics ID và View ID');
            }
        });
    }
    
    // Chuyển đổi tab trên admin dashboard
    setupTabNavigation();
    
    // Tải dữ liệu analytics nếu có cấu hình
    loadAnalyticsData();
    
    // Hiển thị dữ liệu người dùng đã thu thập
    displayUserData();
    
    // Lưu cài đặt analytics khi biểu mẫu được gửi
    setupAnalyticsForm();
    
    // Xử lý chuyển đổi theme 
    setupThemeToggle();
});

// Initialize dashboard
function initDashboard() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.querySelector('.theme-btn[data-theme="dark"]').classList.add('active');
        document.querySelector('.theme-btn[data-theme="light"]').classList.remove('active');
    }
    
    // Load saved analytics credentials if available
    const gaId = localStorage.getItem('ga-id');
    const viewId = localStorage.getItem('view-id');
    const apiKey = localStorage.getItem('ga-api-key');
    
    if (gaId && viewId) {
        document.getElementById('ga-id').value = gaId;
        document.getElementById('view-id').value = viewId;
        if (apiKey && document.getElementById('ga-api-key')) {
            document.getElementById('ga-api-key').value = apiKey;
        }
        
        // Khởi tạo Google Analytics nếu ga-integration.js đã được tải
        if (typeof initGoogleAnalytics === 'function') {
            initGoogleAnalytics();
        } else {
            // Fallback nếu ga-integration.js chưa được tải
            loadOverviewData();
        }
    } else {
        // Show placeholder data or message
        showPlaceholderData();
    }
}

// Load data for the selected tab
function loadTabData(tabId) {
    // Nếu ga-integration.js đã được tải, sử dụng chức năng của nó
    if (typeof loadAnalyticsData === 'function') {
        // Tải dữ liệu cho tab tương ứng từ ga-integration.js
        if (tabId === 'overview') {
            loadAnalyticsData();
            return;
        }
    }
    
    // Fallback nếu ga-integration.js chưa được tải hoặc không hỗ trợ tab
    switch (tabId) {
        case 'overview':
            loadOverviewData();
            break;
        case 'visitors':
            loadVisitorData();
            break;
        case 'devices':
            loadDeviceData();
            break;
        case 'pages':
            loadPageData();
            break;
        case 'sources':
            loadSourceData();
            break;
        case 'settings':
            // Settings tab doesn't need data loading
            break;
    }
}

// Load overview data
function loadOverviewData() {
    // Nếu ga-integration.js đã được tải, sử dụng chức năng của nó
    if (typeof loadAnalyticsData === 'function') {
        loadAnalyticsData();
        return;
    }
    
    // Check if credentials are available
    const gaId = localStorage.getItem('ga-id');
    const viewId = localStorage.getItem('view-id');
    
    if (!gaId || !viewId) {
        showPlaceholderData();
        return;
    }
    
    // For demonstration, showing sample data
    // In a real application, this would fetch data from Google Analytics API
    
    // Sample data
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
    
    // Update stat cards
    document.getElementById('total-visitors').textContent = sampleData.totalVisitors.toLocaleString();
    document.getElementById('page-views').textContent = sampleData.pageViews.toLocaleString();
    document.getElementById('avg-duration').textContent = sampleData.avgDuration;
    document.getElementById('bounce-rate').textContent = sampleData.bounceRate;
    
    // Create visitor chart
    createVisitorChart(sampleData.visitorChart);
    
    // Create pages chart
    createPagesChart(sampleData.pagesChart);
}

// Create visitors chart - cái này được sử dụng nếu ga-integration.js không được tải
function createVisitorChart(data) {
    // Nếu có hàm tương tự trong ga-integration.js, ưu tiên sử dụng nó
    if (typeof window.createVisitorChart === 'function' && this !== window) {
        window.createVisitorChart(data);
        return;
    }
    
    const ctx = document.getElementById('visitors-chart');
    
    // Clear previous content
    ctx.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    
    // Create chart
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

// Create pages chart - cái này được sử dụng nếu ga-integration.js không được tải
function createPagesChart(data) {
    // Nếu có hàm tương tự trong ga-integration.js, ưu tiên sử dụng nó
    if (typeof window.createPagesChart === 'function' && this !== window) {
        window.createPagesChart(data);
        return;
    }
    
    const ctx = document.getElementById('pages-chart');
    
    // Clear previous content
    ctx.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    
    // Create chart
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

// Load visitor data
function loadVisitorData() {
    // Số lượng người truy cập (đọc từ localStorage)
    let visitorCount = 0;
    const visitorIds = [];
    
    // Thu thập ID người dùng đã lưu
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('visitor_')) {
            visitorIds.push(key);
            visitorCount++;
        }
    }
    
    // Hiển thị số liệu tổng quan
    updateDashboardStats(visitorCount);
    
    // Tạo biểu đồ nếu có dữ liệu
    createVisitorCharts();
    
    // Tạo bảng dữ liệu người dùng
    createVisitorTable(visitorIds);
}

// Cập nhật số liệu trên dashboard
function updateDashboardStats(visitorCount) {
    // Cập nhật số liệu thống kê
    if (document.getElementById('total-visitors')) {
        document.getElementById('total-visitors').textContent = visitorCount || '-';
    }
    
    // Các thống kê khác - sử dụng dữ liệu giả
    if (document.getElementById('page-views')) {
        document.getElementById('page-views').textContent = visitorCount > 0 ? visitorCount * 3 : '-';
    }
    
    if (document.getElementById('avg-duration')) {
        document.getElementById('avg-duration').textContent = visitorCount > 0 ? '2m 35s' : '-';
    }
    
    if (document.getElementById('bounce-rate')) {
        document.getElementById('bounce-rate').textContent = visitorCount > 0 ? '45%' : '-';
    }
}

// Tạo biểu đồ người dùng
function createVisitorCharts() {
    // Thông tin thiết bị - Dữ liệu mẫu
    const deviceData = {
        desktop: 65,
        mobile: 30,
        tablet: 5
    };
    
    // Tạo biểu đồ thiết bị nếu thư viện Chart.js có sẵn
    const deviceChart = document.getElementById('device-categories-chart');
    if (deviceChart && typeof Chart !== 'undefined') {
        // Xóa nội dung hiện tại
        deviceChart.innerHTML = '';
        
        // Tạo canvas
        const canvas = document.createElement('canvas');
        deviceChart.appendChild(canvas);
        
        // Tạo biểu đồ
        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Desktop', 'Mobile', 'Tablet'],
                datasets: [{
                    data: [deviceData.desktop, deviceData.mobile, deviceData.tablet],
                    backgroundColor: ['#4831d4', '#ccf381', '#fd8a8a']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } else if (deviceChart) {
        // Hiển thị dạng văn bản nếu không có Chart.js
        deviceChart.innerHTML = `
            <div class="chart-fallback">
                <p>Desktop: ${deviceData.desktop}%</p>
                <p>Mobile: ${deviceData.mobile}%</p>
                <p>Tablet: ${deviceData.tablet}%</p>
            </div>
        `;
    }
    
    // Tạo các biểu đồ khác nếu cần
}

// Tạo bảng thông tin người dùng
function createVisitorTable(visitorIds) {
    const visitorsTable = document.getElementById('visitors-table');
    if (!visitorsTable) return;
    
    // Tạo header cho bảng
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID Người dùng</th>
                    <th>Thiết bị</th>
                    <th>Trình duyệt</th>
                    <th>Thời gian xem</th>
                    <th>Trang đã xem</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Thêm dữ liệu vào bảng (từ visitorIds hoặc dữ liệu mẫu)
    if (visitorIds.length === 0) {
        tableHTML += `
            <tr>
                <td colspan="5" class="no-data">Chưa có dữ liệu người dùng</td>
            </tr>
        `;
    } else {
        // Sử dụng dữ liệu mẫu
        for (let i = 0; i < Math.min(visitorIds.length, 10); i++) {
            tableHTML += `
                <tr>
                    <td>${visitorIds[i].replace('visitor_', 'usr_')}</td>
                    <td>Desktop</td>
                    <td>Chrome</td>
                    <td>3m 22s</td>
                    <td>Trang chủ, Dự án</td>
                </tr>
            `;
        }
    }
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    visitorsTable.innerHTML = tableHTML;
}

// Load device data
function loadDeviceData() {
    // Sample device data
    const deviceCategories = {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        data: [55, 40, 5]
    };
    
    // Sample browser data
    const browsers = {
        labels: ['Chrome', 'Safari', 'Firefox', 'Edge', 'Others'],
        data: [60, 15, 10, 8, 7]
    };
    
    // Sample resolution data
    const resolutions = {
        labels: ['1920x1080', '1366x768', '375x812', '414x896', '360x640'],
        data: [30, 25, 15, 10, 20]
    };
    
    // Create device categories chart
    createDeviceCategoriesChart(deviceCategories);
    
    // Create browsers chart
    createBrowsersChart(browsers);
    
    // Create resolutions chart
    createResolutionsChart(resolutions);
}

// Create device categories chart
function createDeviceCategoriesChart(data) {
    const ctx = document.getElementById('device-categories-chart');
    
    // Clear previous content
    ctx.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    
    // Create chart
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: [
                    'rgba(72, 49, 212, 0.7)',
                    'rgba(204, 243, 129, 0.7)',
                    'rgba(255, 118, 118, 0.7)'
                ],
                borderColor: [
                    'rgba(72, 49, 212, 1)',
                    'rgba(204, 243, 129, 1)',
                    'rgba(255, 118, 118, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create browsers chart
function createBrowsersChart(data) {
    const ctx = document.getElementById('browsers-chart');
    
    // Clear previous content
    ctx.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    
    // Create chart
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
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
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create resolutions chart
function createResolutionsChart(data) {
    const ctx = document.getElementById('resolutions-chart');
    
    // Clear previous content
    ctx.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    
    // Create chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Screen Resolutions',
                data: data.data,
                backgroundColor: 'rgba(72, 49, 212, 0.7)',
                borderColor: 'rgba(72, 49, 212, 1)',
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

// Load page data
function loadPageData() {
    // Sample page data
    const pagesTableData = [
        {page: 'Home', views: 1250, avgTime: '1m 45s', bounceRate: '35%'},
        {page: 'About', views: 820, avgTime: '2m 10s', bounceRate: '40%'},
        {page: 'Skills', views: 650, avgTime: '1m 30s', bounceRate: '45%'},
        {page: 'Projects', views: 950, avgTime: '3m 20s', bounceRate: '25%'},
        {page: 'Contact', views: 420, avgTime: '1m 10s', bounceRate: '55%'}
    ];
    
    // Sample entry pages data
    const entryPages = {
        labels: ['Home', 'Projects', 'About', 'Skills', 'Contact'],
        data: [65, 15, 10, 7, 3]
    };
    
    // Sample exit pages data
    const exitPages = {
        labels: ['Home', 'Projects', 'About', 'Skills', 'Contact'],
        data: [25, 15, 20, 10, 30]
    };
    
    // Populate pages table
    populatePagesTable(pagesTableData);
    
    // Create entry pages chart
    createEntryPagesChart(entryPages);
    
    // Create exit pages chart
    createExitPagesChart(exitPages);
}

// Populate pages table
function populatePagesTable(data) {
    const table = document.getElementById('pages-table');
    
    // Clear previous content
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add rows
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.page}</td>
            <td>${item.views}</td>
            <td>${item.avgTime}</td>
            <td>${item.bounceRate}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Create entry pages chart
function createEntryPagesChart(data) {
    const ctx = document.getElementById('entry-pages-chart');
    
    // Clear previous content
    ctx.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    
    // Create chart
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
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
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create exit pages chart
function createExitPagesChart(data) {
    const ctx = document.getElementById('exit-pages-chart');
    
    // Clear previous content
    ctx.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    
    // Create chart
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
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
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load source data
function loadSourceData() {
    // Sample channel data
    const channels = {
        labels: ['Direct', 'Organic Search', 'Referral', 'Social', 'Email'],
        data: [40, 30, 15, 10, 5]
    };
    
    // Sample referrer data
    const referrers = {
        labels: ['Google', 'Facebook', 'Twitter', 'LinkedIn', 'GitHub'],
        data: [45, 25, 15, 10, 5]
    };
    
    // Sample referrers table data
    const referrersTableData = [
        {source: 'Google', visitors: 580, newUsers: 320, bounceRate: '35%'},
        {source: 'Facebook', visitors: 320, newUsers: 180, bounceRate: '40%'},
        {source: 'Twitter', visitors: 190, newUsers: 95, bounceRate: '45%'},
        {source: 'LinkedIn', visitors: 130, newUsers: 70, bounceRate: '30%'},
        {source: 'GitHub', visitors: 65, newUsers: 40, bounceRate: '25%'}
    ];
    
    // Create channels chart
    createChannelsChart(channels);
    
    // Create referrers chart
    createReferrersChart(referrers);
    
    // Populate referrers table
    populateReferrersTable(referrersTableData);
}

// Create channels chart
function createChannelsChart(data) {
    const ctx = document.getElementById('channels-chart');
    
    // Clear previous content
    ctx.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    
    // Create chart
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
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
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create referrers chart
function createReferrersChart(data) {
    const ctx = document.getElementById('referrers-chart');
    
    // Clear previous content
    ctx.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    
    // Create chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Referrers',
                data: data.data,
                backgroundColor: 'rgba(72, 49, 212, 0.7)',
                borderColor: 'rgba(72, 49, 212, 1)',
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

// Populate referrers table
function populateReferrersTable(data) {
    const table = document.getElementById('referrers-table');
    
    // Clear previous content
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add rows
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.source}</td>
            <td>${item.visitors}</td>
            <td>${item.newUsers}</td>
            <td>${item.bounceRate}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Update data for date range
function updateDataForDateRange(range) {
    // Reload all data based on date range
    loadOverviewData();
    
    // If we're in a specific tab, reload that tab's data
    const activeTab = document.querySelector('.sidebar-item.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        loadTabData(tabId);
    }
}

// Update charts for theme
function updateChartsForTheme() {
    // Reload all charts based on current theme
    const activeTab = document.querySelector('.sidebar-item.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        loadTabData(tabId);
    }
}

// Show placeholder data when not connected to Google Analytics
function showPlaceholderData() {
    // Placeholder for stat cards
    document.getElementById('total-visitors').textContent = '---';
    document.getElementById('page-views').textContent = '---';
    document.getElementById('avg-duration').textContent = '--:--';
    document.getElementById('bounce-rate').textContent = '--%';
    
    // Show login message in charts
    document.getElementById('visitors-chart').innerHTML = '<p class="login-message">Connect to Google Analytics API to view data</p>';
    document.getElementById('pages-chart').innerHTML = '<p class="login-message">Connect to Google Analytics API to view data</p>';
}

// Chuyển đổi tab trên admin dashboard
function setupTabNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Xóa trạng thái active
            menuItems.forEach(i => i.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Đặt trạng thái active mới
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Tải dữ liệu analytics
function loadAnalyticsData() {
    // Kiểm tra thông tin cấu hình từ localStorage
    const gaSettings = getAnalyticsSettings();
    
    if (!gaSettings || !gaSettings.gaId || !gaSettings.apiKey) {
        showSettingsNotification('Vui lòng cấu hình Google Analytics trong phần Cài đặt');
        return;
    }
    
    // Tải dữ liệu từ Google Analytics API
    loadGAData(gaSettings);
}

// Hiển thị dữ liệu người dùng đã thu thập
function displayUserData() {
    // Lấy dữ liệu người dùng đã thu thập từ localStorage 
    // (giả định dữ liệu được lưu từ analytics.js)
    const userDataKeys = [];
    let totalVisitors = 0;
    
    // Tìm tất cả các khóa trong localStorage liên quan đến người dùng truy cập
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('visitor_')) {
            userDataKeys.push(key);
            totalVisitors++;
        }
    }
    
    // Hiển thị tổng số người truy cập
    if (document.getElementById('total-visitors')) {
        document.getElementById('total-visitors').textContent = totalVisitors || '-';
    }
    
    // Tạo bảng thông tin chi tiết người dùng
    createVisitorsTable(userDataKeys);
    
    // Hiển thị thông tin thiết bị
    displayDeviceStats();
}

// Tạo bảng hiển thị thông tin người dùng
function createVisitorsTable(visitorKeys) {
    const visitorsTableContainer = document.getElementById('visitors-table-container');
    if (!visitorsTableContainer) return;
    
    // Kiểm tra nếu không có dữ liệu
    if (!visitorKeys || visitorKeys.length === 0) {
        visitorsTableContainer.innerHTML = '<p>Chưa có dữ liệu người dùng nào được ghi nhận</p>';
        return;
    }
    
    // Tạo bảng
    let tableHTML = `
        <table class="data-table" id="visitors-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Thiết bị</th>
                    <th>Trình duyệt</th>
                    <th>Thời gian truy cập</th>
                    <th>Trang đã xem</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Thêm dữ liệu vào bảng (dữ liệu mẫu, cần thay thế bằng dữ liệu thực)
    for (let i = 0; i < Math.min(visitorKeys.length, 10); i++) {
        const visitorId = visitorKeys[i];
        
        tableHTML += `
            <tr>
                <td>${visitorId.replace('visitor_', '')}</td>
                <td>Desktop</td>
                <td>Chrome</td>
                <td>${new Date().toLocaleString()}</td>
                <td>Homepage</td>
            </tr>
        `;
    }
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    visitorsTableContainer.innerHTML = tableHTML;
}

// Hiển thị thống kê thiết bị
function displayDeviceStats() {
    // Dữ liệu mẫu - thay bằng dữ liệu thực từ Google Analytics
    const deviceData = {
        desktop: 65,
        mobile: 30,
        tablet: 5
    };
    
    // Cập nhật thống kê
    updateDeviceCharts(deviceData);
}

// Cập nhật biểu đồ thiết bị
function updateDeviceCharts(deviceData) {
    const deviceChartContainer = document.getElementById('device-categories-chart');
    if (!deviceChartContainer) return;
    
    // Xóa nội dung hiện tại
    deviceChartContainer.innerHTML = '';
    
    // Tạo canvas cho biểu đồ
    const canvas = document.createElement('canvas');
    canvas.id = 'deviceChart';
    deviceChartContainer.appendChild(canvas);
    
    // Tạo biểu đồ với Chart.js
    if (typeof Chart !== 'undefined') {
        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Desktop', 'Mobile', 'Tablet'],
                datasets: [{
                    data: [deviceData.desktop, deviceData.mobile, deviceData.tablet],
                    backgroundColor: ['#4831d4', '#ccf381', '#fd8a8a']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });
    } else {
        // Fallback nếu không có Chart.js
        deviceChartContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p>Desktop: ${deviceData.desktop}%</p>
                <p>Mobile: ${deviceData.mobile}%</p>
                <p>Tablet: ${deviceData.tablet}%</p>
            </div>
        `;
    }
}

// Lưu cài đặt analytics
function setupAnalyticsForm() {
    const analyticsForm = document.getElementById('analytics-form');
    if (!analyticsForm) return;
    
    analyticsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Lấy giá trị từ form
        const gaId = document.getElementById('ga-id').value;
        const viewId = document.getElementById('view-id').value;
        const apiKey = document.getElementById('ga-api-key').value;
        
        // Lưu cài đặt vào localStorage
        localStorage.setItem('ga-settings', JSON.stringify({
            gaId: gaId,
            viewId: viewId,
            apiKey: apiKey,
            lastUpdated: new Date().toISOString()
        }));
        
        // Cập nhật ID Google Analytics hiện tại
        localStorage.setItem('ga-id', gaId);
        
        // Hiển thị thông báo thành công
        alert('Cài đặt đã được lưu thành công!');
        
        // Tải lại dữ liệu analytics
        loadAnalyticsData();
    });
    
    // Điền giá trị từ localStorage vào form
    const settings = getAnalyticsSettings();
    if (settings) {
        document.getElementById('ga-id').value = settings.gaId || '';
        document.getElementById('view-id').value = settings.viewId || '';
        document.getElementById('ga-api-key').value = settings.apiKey || '';
    }
}

// Lấy cài đặt analytics từ localStorage
function getAnalyticsSettings() {
    const settingsStr = localStorage.getItem('ga-settings');
    if (!settingsStr) return null;
    
    try {
        return JSON.parse(settingsStr);
    } catch (e) {
        console.error('Lỗi khi đọc cài đặt analytics:', e);
        return null;
    }
}

// Hiển thị thông báo cài đặt
function showSettingsNotification(message) {
    // Tìm container thông báo hoặc tạo mới
    let notificationContainer = document.querySelector('.settings-notification');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'settings-notification';
        notificationContainer.style.cssText = `
            background-color: #ffbe0b;
            color: #333;
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
        `;
        
        // Thêm vào đầu trang
        const mainContent = document.querySelector('.main-content');
        if (mainContent && mainContent.firstChild) {
            mainContent.insertBefore(notificationContainer, mainContent.firstChild);
        }
    }
    
    notificationContainer.textContent = message;
}

// Xử lý chuyển đổi theme
function setupThemeToggle() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Xóa lớp active từ tất cả các nút
            themeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Thêm lớp active cho nút hiện tại
            this.classList.add('active');
            
            // Cập nhật theme dựa trên nút được chọn
            const theme = this.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('admin-theme', theme);
        });
    });
    
    // Khôi phục theme từ localStorage
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        themeButtons.forEach(button => {
            if (button.getAttribute('data-theme') === savedTheme) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
}

// Tải dữ liệu từ Google Analytics API
function loadGAData(settings) {
    // Đây chỉ là giả định - bạn cần tích hợp thực tế với Google Analytics API
    console.log('Đang tải dữ liệu từ Google Analytics với cài đặt:', settings);
    
    // Cập nhật số liệu mẫu
    updateSampleMetrics();
}

// Cập nhật số liệu mẫu
function updateSampleMetrics() {
    // Tổng số người truy cập
    if (document.getElementById('total-visitors')) {
        document.getElementById('total-visitors').textContent = getRandomInt(100, 1000);
    }
    
    // Số lượt xem trang
    if (document.getElementById('page-views')) {
        document.getElementById('page-views').textContent = getRandomInt(500, 5000);
    }
    
    // Thời gian xem trung bình
    if (document.getElementById('avg-duration')) {
        document.getElementById('avg-duration').textContent = getRandomInt(1, 5) + 'm ' + getRandomInt(1, 59) + 's';
    }
    
    // Tỷ lệ thoát
    if (document.getElementById('bounce-rate')) {
        document.getElementById('bounce-rate').textContent = getRandomInt(30, 70) + '%';
    }
}

// Hàm trợ giúp để tạo số ngẫu nhiên
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 