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
        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        
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
                        // Project image fallback - use absolute path
                        this.src = basePath + '/images/projects/placeholder.png';
                    } else if (this.closest('.about-image')) {
                        // About image fallback - use absolute path
                        this.src = basePath + '/images/personal/placeholder.jpg';
                    } else if (this.closest('.hero-image')) {
                        // Hero image fallback - use absolute path
                        this.src = basePath + '/images/personal/placeholder.jpg';
                    } else {
                        // General fallback as inline SVG
                        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f0f0f0"/%3E%3Ctext x="150" y="100" font-family="Arial" font-size="14" text-anchor="middle" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';
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
        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        
        images.forEach(img => {
            // Only process images without data-src already set
            if (!img.getAttribute('data-src') && img.src) {
                // Save original src to data attribute
                const originalSrc = img.src;
                img.setAttribute('data-src', originalSrc);
                
                // Generate a small placeholder with the correct aspect ratio
                const width = img.width || img.naturalWidth || 600;
                const height = img.height || img.naturalHeight || 400;
                
                // Set a lightweight placeholder - but don't replace images that are already loaded
                if (img.complete && img.naturalWidth > 0) {
                    // Image is already loaded, don't replace it
                    img.removeAttribute('data-src');
                } else {
                    // Set appropriate placeholder based on image type
                    if (img.closest('.project-image')) {
                        // Project thumbnails - maintain aspect ratio with a placeholder
                        img.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"%3E%3Crect width="${width}" height="${height}" fill="%23f0f0f0"/%3E%3Ctext x="${width/2}" y="${height/2}" font-family="Arial" font-size="${width/30}" text-anchor="middle" fill="%23999"%3ELoading...%3C/text%3E%3C/svg%3E`;
                    } else if (img.closest('.about-image')) {
                        // About images
                        img.src = basePath + '/images/personal/placeholder.jpg';
                    } else {
                        // Other images
                        img.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"%3E%3Crect width="${width}" height="${height}" fill="%23f0f0f0"/%3E%3C/svg%3E`;
                    }
                }
                
                // Add loading="lazy" for native browser lazy loading as fallback
                img.setAttribute('loading', 'lazy');
                
                // Add a temporary class that will be removed when the image loads
                img.classList.add('img-loading');
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
                    // Apply the loaded image
                    image.src = src;
                    image.classList.remove('img-loading');
                    image.classList.add('img-loaded');
                    image.removeAttribute('data-src');
                    
                    // Dispatch an event that can be used by other components
                    const event = new CustomEvent('imageLoaded', { detail: { image } });
                    document.dispatchEvent(event);
                };
                
                // Handle preload failure gracefully
                preloadImg.onerror = function() {
                    console.warn('Failed to preload image:', src);
                    // Fallback to original error handling by triggering the onerror handler
                    image.src = src;
                    image.removeAttribute('data-src');
                    image.classList.remove('img-loading');
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
                rootMargin: '100px 0px', // Start loading 100px before image enters viewport
                threshold: 0.1 // Start loading when 10% of the image is visible
            });
            
            lazyImages.forEach(img => {
                // Add a small delay to avoid blocking main thread
                setTimeout(() => {
                    imageObserver.observe(img);
                }, 100);
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
        const projectImages = document.querySelectorAll('.project-image img, .hero-image img, .about-image img');
        
        projectImages.forEach(img => {
            // Remove any existing listeners
            img.removeEventListener('touchstart', touchZoomHandler);
            img.removeEventListener('click', touchZoomHandler);
            
            // Add new listeners
            img.addEventListener('touchstart', touchZoomHandler);
            img.addEventListener('click', touchZoomHandler);
        });
        
        function touchZoomHandler(e) {
            // Only if on mobile
            if (window.innerWidth <= 768) {
                // Prevent default behavior
                e.preventDefault();
                
                // Check if image has loaded properly
                if (this.naturalWidth === 0 || this.classList.contains('img-error')) {
                    console.log('Cannot zoom broken image');
                    return;
                }
                
                // Toggle a zoomed class
                this.classList.toggle('touch-zoomed');
                
                // If zoomed, create an overlay to handle unzoom
                if (this.classList.contains('touch-zoomed')) {
                    // Remove any existing overlays
                    const existingOverlay = document.querySelector('.zoom-overlay');
                    if (existingOverlay) {
                        existingOverlay.remove();
                    }
                    
                    const overlay = document.createElement('div');
                    overlay.className = 'zoom-overlay';
                    document.body.appendChild(overlay);
                    
                    // Create a close button
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'zoom-close-btn';
                    closeBtn.innerHTML = '&times;';
                    closeBtn.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; ' +
                                            'background: rgba(0,0,0,0.5); color: white; border: none; ' +
                                            'width: 40px; height: 40px; border-radius: 50%; font-size: 24px; ' +
                                            'display: flex; align-items: center; justify-content: center;';
                    document.body.appendChild(closeBtn);
                    
                    const imgSrc = this.src;
                    const imgAlt = this.alt || 'Image';
                    
                    // Handle close events
                    const closeZoom = () => {
                        this.classList.remove('touch-zoomed');
                        overlay.remove();
                        closeBtn.remove();
                    };
                    
                    overlay.addEventListener('touchstart', closeZoom);
                    overlay.addEventListener('click', closeZoom);
                    closeBtn.addEventListener('touchstart', closeZoom);
                    closeBtn.addEventListener('click', closeZoom);
                    
                    // Prevent scrolling on body when zoomed
                    document.body.style.overflow = 'hidden';
                } else {
                    // Enable scrolling when unzoomed
                    document.body.style.overflow = '';
                }
            }
        }
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
        
        // Also preserve aspect ratios for hero and about images
        preserveHeroImageAspectRatio();
    }
    
    /**
     * Special handling for hero and about images
     * These often have different requirements than project images
     */
    function preserveHeroImageAspectRatio() {
        const heroImage = document.querySelector('.hero-image img');
        const aboutImage = document.querySelector('.about-image img');
        
        // Handle hero image
        if (heroImage) {
            // For mobile, make sure the aspect ratio is appropriate
            if (window.innerWidth <= 768) {
                heroImage.style.aspectRatio = '1/1'; // Square for mobile
            } else {
                heroImage.style.aspectRatio = 'auto'; // Natural ratio for desktop
            }
            
            // Error handling
            if (heroImage.complete && heroImage.naturalWidth === 0) {
                // Image failed to load, apply fallback
                const container = heroImage.closest('.hero-image');
                if (container) {
                    container.style.minHeight = '250px';
                    container.style.backgroundColor = '#f8f8f8';
                }
            }
        }
        
        // Handle about image
        if (aboutImage) {
            // Similar mobile optimization
            if (window.innerWidth <= 768) {
                aboutImage.style.aspectRatio = '3/2'; // 3:2 for mobile
            } else {
                aboutImage.style.aspectRatio = 'auto'; // Natural ratio for desktop
            }
            
            // Error handling
            if (aboutImage.complete && aboutImage.naturalWidth === 0) {
                const container = aboutImage.closest('.about-image');
                if (container) {
                    container.style.minHeight = '200px';
                    container.style.backgroundColor = '#f8f8f8';
                }
            }
        }
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
