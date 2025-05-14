/**
 * Image Fallback Handler - Ensures all images display properly
 * with proper error handling and fallback mechanisms
 */
document.addEventListener('DOMContentLoaded', function() {
    // Handle all images in the document
    setupImageFallbacks();
    
    // Set up a global error handler for images
    window.addEventListener('error', function(e) {
        // Check if the error is from an image element
        if (e.target && e.target.tagName === 'IMG') {
            handleImageError(e.target);
        }
    }, true);
    
    /**
     * Set up fallbacks for all images on the page
     */
    function setupImageFallbacks() {
        const allImages = document.querySelectorAll('img');
        
        allImages.forEach(img => {
            // Make sure each image has an error handler
            img.onerror = function() {
                handleImageError(this);
            };
            
            // Handle images that are already broken
            if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
                handleImageError(img);
            }
            
            // Add load event to remove placeholder and add loaded class
            img.addEventListener('load', function() {
                if (this.naturalWidth > 0) {
                    this.classList.add('img-loaded');
                    this.classList.remove('img-loading', 'img-error');
                }
            });
            
            // Add loading class if not yet loaded
            if (!img.complete) {
                img.classList.add('img-loading');
            }
        });
    }
      /**
     * Handle image loading errors with appropriate fallbacks
     */
    function handleImageError(img) {
        // Prevent infinite error loops
        img.onerror = null;
        
        // Add error class
        img.classList.add('img-error');
        img.classList.remove('img-loading', 'img-loaded');
        
        // Try to determine the image type to provide an appropriate fallback
        const imgClasses = img.className || '';
        const imgParent = img.parentElement ? img.parentElement.className || '' : '';
        
        // Get base path for absolute image references
        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) || '';
        
        // Check if we're on mobile to adjust placeholder size
        const isMobile = window.innerWidth <= 768;
        const width = isMobile ? 300 : 600;
        const height = isMobile ? 200 : 400;
        
        // Fallback based on context
        if (imgParent.includes('project-image') || img.closest('.project-image')) {
            // Try to load from images folder first
            img.src = `${basePath}/images/projects/placeholder.png`;
            
            // Add a data attribute for monitoring
            img.setAttribute('data-fallback-type', 'project');
            
            // If this fails, set a backup SVG fallback
            img.onerror = function() {
                this.onerror = null; // Prevent infinite loop
                this.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"/%3E%3Ctext x="${width/2}" y="${height/2}" font-family="Arial" font-size="${isMobile ? 14 : 20}" text-anchor="middle" fill="%23999999"%3EProject Image%3C/text%3E%3C/svg%3E`;
            };
        } else if (imgParent.includes('about-image') || img.closest('.about-image')) {
            img.src = `${basePath}/images/personal/placeholder.jpg`;
            img.setAttribute('data-fallback-type', 'about');
            
            img.onerror = function() {
                this.onerror = null;
                this.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 ${width} ${width}"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"/%3E%3Ctext x="${width/2}" y="${width/2}" font-family="Arial" font-size="${isMobile ? 14 : 20}" text-anchor="middle" fill="%23999999"%3EAbout Image%3C/text%3E%3C/svg%3E`;
            };
        } else if (imgParent.includes('hero-image') || img.closest('.hero-image')) {
            img.src = `${basePath}/images/personal/placeholder.jpg`;
            img.setAttribute('data-fallback-type', 'profile');
            
            img.onerror = function() {
                this.onerror = null;
                this.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width*1.5}" height="${width}" viewBox="0 0 ${width*1.5} ${width}"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"/%3E%3Ctext x="${width*0.75}" y="${width/2}" font-family="Arial" font-size="${isMobile ? 16 : 24}" text-anchor="middle" fill="%23999999"%3EProfile Image%3C/text%3E%3C/svg%3E`;
            };
        } else {
            // Default fallback
            img.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${isMobile ? 50 : 100}" height="${isMobile ? 50 : 100}" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Cpath d="M30,50 L70,50 M50,30 L50,70" stroke="%23aaa" stroke-width="4"/%3E%3C/svg%3E`;
        }
          // Set a fixed size if dimensions are missing
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                img.style.minWidth = '100%';
                img.style.minHeight = isMobile ? '150px' : '200px';
            } else {
                img.style.minWidth = '100%';
                img.style.minHeight = '200px';
            }
        }
        
        // Add alt text if missing
        if (!img.alt) {
            img.alt = 'Image could not be loaded';
        }
        
        // Add a message element for better UX
        if (!img.nextElementSibling || !img.nextElementSibling.classList.contains('image-error-message')) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'image-error-message';
            errorMsg.textContent = 'Image could not be loaded';
            errorMsg.style.cssText = 'font-size: 12px; color: #999; text-align: center; padding: 5px; background: #f8f8f8; border-radius: 0 0 4px 4px; margin-top: -4px;';
            
            // Only append for certain image types
            if (img.closest('.project-image') || img.closest('.about-image')) {
                const container = img.closest('.project-image') || img.closest('.about-image');
                container.style.position = 'relative';
                container.appendChild(errorMsg);
            }
        }
    }
    
    // Handle window resize events to adjust image placeholders
    window.addEventListener('resize', function() {
        const errorImages = document.querySelectorAll('.img-error');
        if (errorImages.length > 0) {
            setupImageFallbacks();
        }
    });
});
