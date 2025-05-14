/**
 * Mobile Optimizer
 * Script to optimize website performance on mobile devices
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only run on mobile devices
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) {
        return;
    }
    
    console.log('Mobile optimizer activated');
    
    // Check connection speed and optimize accordingly
    checkConnectionAndOptimize();
    
    // Handle orientation changes more efficiently
    optimizeOrientationChanges();
    
    // Fix input zooming issues
    preventInputZoom();
    
    // Optimize animations for better performance
    optimizeAnimations();
    
    // Optimize scroll performance
    optimizeScrollPerformance();
    
    /**
     * Check connection speed and optimize based on network conditions
     */
    function checkConnectionAndOptimize() {
        // Check if Network Information API is available
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            console.log('Network type:', connection.effectiveType);
            
            // Handle slow connections
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Add low-bandwidth mode
                document.body.classList.add('low-bandwidth');
                
                // Apply low-bandwidth optimizations
                disableHeavyAnimations();
                deferNonCriticalResources();
            }
            
            // Listen for changes to connection
            connection.addEventListener('change', function() {
                console.log('Connection type changed to ' + connection.effectiveType);
                
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    document.body.classList.add('low-bandwidth');
                    disableHeavyAnimations();
                } else {
                    document.body.classList.remove('low-bandwidth');
                }
            });
        }
    }
    
    /**
     * Disable heavy animations for better performance on low-end devices
     */
    function disableHeavyAnimations() {
        // Add styles to disable heavy animations
        const style = document.createElement('style');
        style.textContent = `
            .animate-float,
            .animate-pulse,
            .animate-bounce {
                animation: none !important;
            }
            
            .particle-background {
                opacity: 0.2 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Defer loading of non-critical resources for faster initial load
     */
    function deferNonCriticalResources() {
        // Find and defer non-critical scripts
        const scripts = document.querySelectorAll('script:not([data-critical])');
        
        scripts.forEach(script => {
            if (script.src && !script.src.includes('preloader') && !script.src.includes('main')) {
                script.setAttribute('defer', 'defer');
            }
        });
        
        // Lazy load images below the fold
        const lazyImages = document.querySelectorAll('img:not([loading])');
        lazyImages.forEach(img => {
            if (!img.hasAttribute('importance')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }
    
    /**
     * Optimize handling of orientation changes
     */
    function optimizeOrientationChanges() {
        let orientationTimer;
        
        window.addEventListener('orientationchange', function() {
            // Add class during orientation change
            document.body.classList.add('orientation-changing');
            
            // Clear previous timer
            clearTimeout(orientationTimer);
            
            // Set timer to remove class after orientation change completes
            orientationTimer = setTimeout(function() {
                document.body.classList.remove('orientation-changing');
                
                // Fix any potential layout issues after orientation change
                fixLayoutAfterOrientationChange();
            }, 300);
        });
    }
    
    /**
     * Fix layout issues that might occur after orientation change
     */
    function fixLayoutAfterOrientationChange() {
        // Reset any fixed heights that might cause issues
        document.querySelectorAll('.hero-image, .about-image').forEach(img => {
            img.style.height = 'auto';
        });
        
        // Fix scroll position issues
        window.scrollTo(0, window.scrollY);
    }
    
    /**
     * Prevent zooming on input elements on iOS
     */
    function preventInputZoom() {
        // Set font size for inputs to 16px to prevent iOS zoom
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                input, select, textarea {
                    font-size: 16px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Optimize animations for better performance
     */
    function optimizeAnimations() {
        // Check if the device has low performance
        const isLowPerformance = window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
                                isLowEndDevice();
        
        if (isLowPerformance) {
            console.log('Low performance device detected - optimizing animations');
            
            // Add a class to the body for CSS optimizations
            document.body.classList.add('low-performance');
            
            // Disable heavy animations using CSS
            const style = document.createElement('style');
            style.textContent = `
                .low-performance * {
                    animation-duration: 0.001ms !important;
                    transition-duration: 0.001ms !important;
                    animation-iteration-count: 1 !important;
                }
                
                .low-performance .animate {
                    opacity: 1 !important;
                    transform: none !important;
                }
                
                .low-performance .particle-background {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Detect if this is likely a low-end device
     */
    function isLowEndDevice() {
        // Check for indicators of low-end devices
        const memory = navigator.deviceMemory || 4; // Default to 4 if not available
        const cores = navigator.hardwareConcurrency || 4; // Default to 4 if not available
        
        return memory <= 2 || cores <= 2;
    }
    
    /**
     * Optimize scroll performance
     */
    function optimizeScrollPerformance() {
        let scrollTimeout;
        let isScrolling = false;
        
        // Throttle scroll events
        window.addEventListener('scroll', function() {
            if (!isScrolling) {
                isScrolling = true;
                document.body.classList.add('is-scrolling');
            }
            
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(function() {
                isScrolling = false;
                document.body.classList.remove('is-scrolling');
            }, 100);
        }, { passive: true });
        
        // Add style to reduce animations during scroll
        const style = document.createElement('style');
        style.textContent = `
            .is-scrolling * {
                animation-play-state: paused !important;
                transition: none !important;
            }
            
            .is-scrolling .animate-float,
            .is-scrolling .animate-pulse,
            .is-scrolling .animate-bounce {
                animation: none !important;
            }
        `;
        document.head.appendChild(style);
    }
});
