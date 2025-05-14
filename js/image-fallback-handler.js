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
        
        // Fallback based on context
        if (imgParent.includes('project-image') || img.closest('.project-image')) {
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"/%3E%3Ctext x="300" y="200" font-family="Arial" font-size="20" text-anchor="middle" fill="%23999999"%3EProject Image%3C/text%3E%3C/svg%3E';
        } else if (imgParent.includes('about-image') || img.closest('.about-image')) {
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"/%3E%3Ctext x="300" y="300" font-family="Arial" font-size="20" text-anchor="middle" fill="%23999999"%3EAbout Image%3C/text%3E%3C/svg%3E';
        } else if (imgParent.includes('hero-image') || img.closest('.hero-image')) {
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"/%3E%3Ctext x="400" y="300" font-family="Arial" font-size="24" text-anchor="middle" fill="%23999999"%3EProfile Image%3C/text%3E%3C/svg%3E';
        } else {
            // Default fallback
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Cpath d="M30,50 L70,50 M50,30 L50,70" stroke="%23aaa" stroke-width="4"/%3E%3C/svg%3E';
        }
        
        // Set a fixed size if dimensions are missing
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            img.style.minWidth = '100px';
            img.style.minHeight = '100px';
        }
        
        // Add alt text if missing
        if (!img.alt) {
            img.alt = 'Image could not be loaded';
        }
    }
});
