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
    // Check if credentials are available
    const gaId = localStorage.getItem('ga-id');
    const viewId = localStorage.getItem('view-id');
    
    if (!gaId || !viewId) {
        return;
    }
    
    // Sample visitor trend data
    const visitorTrends = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [500, 600, 750, 800, 950, 1200]
    };
    
    // Sample visitor types data
    const visitorTypes = {
        labels: ['New', 'Returning'],
        data: [65, 35]
    };
    
    // Sample geo data
    const geoData = {
        labels: ['USA', 'India', 'UK', 'Canada', 'Germany'],
        data: [45, 20, 15, 10, 5]
    };
    
    // Create visitor trends chart
    createVisitorTrendsChart(visitorTrends);
    
    // Create visitor types chart
    createVisitorTypesChart(visitorTypes);
    
    // Create geo chart
    createGeoChart(geoData);
}

// Create visitor trends chart
function createVisitorTrendsChart(data) {
    const ctx = document.getElementById('visitor-trends-chart');
    
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
                label: 'Monthly Visitors',
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

// Create visitor types chart
function createVisitorTypesChart(data) {
    const ctx = document.getElementById('visitor-types-chart');
    
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
                    'rgba(204, 243, 129, 0.7)'
                ],
                borderColor: [
                    'rgba(72, 49, 212, 1)',
                    'rgba(204, 243, 129, 1)'
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

// Create geo chart
function createGeoChart(data) {
    const ctx = document.getElementById('geo-chart');
    
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
                label: 'Visitors by Country',
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
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
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