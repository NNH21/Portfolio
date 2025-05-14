// Image optimization for better mobile performance
document.addEventListener('DOMContentLoaded', function() {
    // Fix image aspect ratios to prevent layout shifts
    preserveImageAspectRatios();
    
    // Preload critical images
    preloadCriticalImages();
    
    // Make sure all images have proper error handling
    addImageErrorHandling();
    
    // Add touch-friendly zooming for project images
    addTouchImageZoom();
    
    // Convert images to use data-src for lazy loading - do this last
    prepareImagesForLazyLoading();
    
    /**
     * Add error handling for all images
     */
    function addImageErrorHandling() {
        const allImages = document.querySelectorAll('img');
        
        allImages.forEach(img => {
            // Add error handler if not already present
            if (!img.hasAttribute('onerror')) {
                img.onerror = function() {
                    // If image fails to load, try a few things:
                    
                    // 1. Try to load from data-src if available
                    const dataSrc = this.getAttribute('data-src');
                    if (dataSrc && this.src !== dataSrc) {
                        this.src = dataSrc;
                        return;
                    }
                    
                    // 2. If no data-src or already tried, use a fallback image
                    if (this.closest('.project-image')) {
                        // Project image fallback
                        this.src = 'images/projects/placeholder.png';
                    } else if (this.closest('.about-image')) {
                        // About image fallback
                        this.src = 'images/personal/placeholder.jpg';
                    } else {
                        // General fallback
                        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Cpath d="M30,50 L70,50 M50,30 L50,70" stroke="%23aaa" stroke-width="4"/%3E%3C/svg%3E';
                    }
                    
                    // 3. Add a class to indicate error
                    this.classList.add('image-load-error');
                };
            }
        });
    }
    
    /**
     * Convert regular images to lazy loading format
     */
    function prepareImagesForLazyLoading() {
        // Skip critical above-the-fold images
        const images = document.querySelectorAll('img:not(.hero-image img):not(.logo img)');
        
        images.forEach(img => {
            // Only process images without data-src already set
            if (!img.getAttribute('data-src') && img.src) {
                // Save original src to data attribute
                const originalSrc = img.src;
                img.setAttribute('data-src', originalSrc);
                
                // Set a lightweight placeholder - but don't replace images that are already loaded
                if (img.complete && img.naturalWidth > 0) {
                    // Image is already loaded, don't replace it
                    img.removeAttribute('data-src');
                } else {
                    // Set appropriate placeholder based on image type
                    if (img.closest('.project-image')) {
                        // Project thumbnails - maintain aspect ratio with a placeholder
                        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"%3E%3C/svg%3E';
                    } else {
                        // Other images
                        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                    }
                }
                
                // Add loading="lazy" for native browser lazy loading as fallback
                img.setAttribute('loading', 'lazy');
            }
        });
        
        // Initialize observer for lazy loading
        initLazyLoading();
    }
    
    /**
     * Initialize proper lazy loading with Intersection Observer
     */
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const loadImage = (image) => {
                const src = image.getAttribute('data-src');
                if (!src) return;
                
                // Create a new image to preload
                const preloadImg = new Image();
                
                // When preload succeeds, update the visible image
                preloadImg.onload = function() {
                    image.src = src;
                    image.classList.add('img-loaded');
                    image.removeAttribute('data-src');
                };
                
                // Handle preload failure
                preloadImg.onerror = function() {
                    // Try direct loading instead
                    image.src = src;
                    image.removeAttribute('data-src');
                };
                
                // Start preloading
                preloadImg.src = src;
            };
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadImage(entry.target);
                        imageObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px' // Start loading 50px before image enters viewport
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without intersection observer
            lazyImages.forEach(img => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            });
        }
    }
    
    /**
     * Add touch-friendly image zoom for project images
     */
    function addTouchImageZoom() {
        const projectImages = document.querySelectorAll('.project-image img');
        
        projectImages.forEach(img => {
            // Create a touchstart event listener
            img.addEventListener('touchstart', function(e) {
                // Only if on mobile
                if (window.innerWidth <= 768) {
                    // Prevent default behavior
                    e.preventDefault();
                    
                    // Toggle a zoomed class
                    this.classList.toggle('touch-zoomed');
                    
                    // If zoomed, create an overlay to handle unzoom
                    if (this.classList.contains('touch-zoomed')) {
                        const overlay = document.createElement('div');
                        overlay.className = 'zoom-overlay';
                        document.body.appendChild(overlay);
                        
                        overlay.addEventListener('touchstart', function() {
                            img.classList.remove('touch-zoomed');
                            overlay.remove();
                        });
                    }
                }
            });
        });
    }
    
    /**
     * Preserve image aspect ratios to prevent layout shifts
     */
    function preserveImageAspectRatios() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const imgContainer = card.querySelector('.project-image');
            if (!imgContainer) return; // Skip if container not found
            
            const img = imgContainer.querySelector('img');
            if (!img) return; // Skip if image not found
            
            // Set a default aspect ratio for project cards
            imgContainer.style.paddingBottom = '66.67%'; // 3:2 aspect ratio
            
            // If image is already loaded
            if (img.complete && img.naturalWidth > 0) {
                const aspectRatio = (img.naturalHeight / img.naturalWidth) * 100;
                imgContainer.style.paddingBottom = aspectRatio + '%';
            } else {
                // When the image loads, adjust to its actual ratio
                img.onload = function() {
                    if (this.naturalWidth && this.naturalHeight) {
                        const aspectRatio = (this.naturalHeight / this.naturalWidth) * 100;
                        imgContainer.style.paddingBottom = aspectRatio + '%';
                    }
                };
            }
        });
    }
    
    /**
     * Preload critical images that appear above the fold
     */
    function preloadCriticalImages() {
        // List of important images to preload
        const criticalSelectors = [
            '.hero-image img',
            '.logo img',
            '.about-image img'
        ];
        
        const criticalImages = criticalSelectors
            .map(selector => document.querySelector(selector))
            .filter(img => img !== null);
        
        criticalImages.forEach(img => {
            const imgSrc = img.getAttribute('src');
            if (imgSrc) {
                // Create a preload link
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preload';
                preloadLink.href = imgSrc;
                preloadLink.as = 'image';
                document.head.appendChild(preloadLink);
                
                // Also force load the image to ensure it displays
                const tempImg = new Image();
                tempImg.src = imgSrc;
                
                // Mark as important - don't lazy load these
                img.setAttribute('importance', 'high');
                img.removeAttribute('loading');
                img.removeAttribute('data-src');
            }
        });
    }
});
