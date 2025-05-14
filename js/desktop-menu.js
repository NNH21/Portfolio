// Desktop Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Show/hide desktop menu on scroll
    const desktopMenu = document.querySelector('.desktop-menu');
    let lastScrollTop = 0;
    
    if (desktopMenu && window.innerWidth >= 992) {
        // Initially show the menu
        desktopMenu.classList.remove('hidden');
        
        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // If scrolled down more than 100px and scrolling down
            if (scrollTop > 100 && scrollTop > lastScrollTop) {
                desktopMenu.classList.add('hidden');
            } else {
                desktopMenu.classList.remove('hidden');
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
    }
    
    // Highlight active category based on the current section
    function updateActiveCategory() {
        // Only run on desktop
        if (window.innerWidth < 992) return;
        
        const sections = document.querySelectorAll('section[id]');
        const menuCategories = document.querySelectorAll('.main-menu-category');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= (sectionTop - 300)) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // Remove active class from all categories
        menuCategories.forEach(category => {
            const categoryTarget = category.getAttribute('data-target');
            
            if (categoryTarget === currentSection) {
                category.classList.add('active');
            } else {
                category.classList.remove('active');
            }
        });
    }
    
    // Check on scroll and on page load
    window.addEventListener('scroll', updateActiveCategory);
    updateActiveCategory();
});

// Desktop Menu Enhancement
document.addEventListener('DOMContentLoaded', function() {
    // Only run this code on desktop
    const isDesktop = window.innerWidth >= 992;
    
    if (isDesktop) {
        const menuCategories = document.querySelectorAll('.main-menu-category');
        const sections = document.querySelectorAll('section[id]');
        
        // Track active section for menu highlighting
        function highlightActiveSection() {
            const scrollY = window.scrollY;
            
            // Find the current section
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    // Remove active from all menu items
                    menuCategories.forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active to the current section's menu item
                    const activeMenuItem = document.querySelector(`.main-menu-category[data-target="${sectionId}"]`);
                    if (activeMenuItem) {
                        activeMenuItem.classList.add('active');
                    }
                }
            });
        }
        
        // Add hover animations to desktop menu
        menuCategories.forEach(category => {
            // Create hover effect for menu items
            category.addEventListener('mouseenter', function() {
                this.querySelector('.category-title i').style.transform = 'rotate(180deg)';
            });
            
            category.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.querySelector('.category-title i').style.transform = 'rotate(0)';
                }
            });
            
            // Add click handler to track active item on mobile
            category.querySelector('.category-title').addEventListener('click', function() {
                const isActive = category.classList.contains('active');
                
                // Remove active from all categories
                menuCategories.forEach(item => {
                    item.classList.remove('active');
                });
                
                // Toggle active state
                if (!isActive) {
                    category.classList.add('active');
                }
            });
        });
        
        // Add animation to Hire Me button
        const hireButton = document.querySelector('.menu-button');
        if (hireButton) {
            // Add pulse animation
            setInterval(() => {
                hireButton.classList.add('pulse-animation');
                setTimeout(() => {
                    hireButton.classList.remove('pulse-animation');
                }, 1000);
            }, 5000);
        }
        
        // Update active section on scroll
        window.addEventListener('scroll', function() {
            highlightActiveSection();
        });
        
        // Initial check for active section
        highlightActiveSection();
    }
});
