/**
 * Mobile Image Fixes
 * This file contains specific fixes for mobile image display issues
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a mobile device
    const isMobile = window.innerWidth <= 768;
    
    // Apply fixes only if we're on mobile
    if (isMobile) {
        // Fix image container heights
        fixImageContainerHeights();
        
        // Add touch zoom functionality
        setupTouchZoom();
        
        // Fix aspect ratios
        fixMobileAspectRatios();
        
        // Improve error handling
        improveErrorHandling();
        
        // Apply performance optimizations
        optimizeImagesForPerformance();
    }
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', function() {
        // Small delay to ensure the orientation change completes
        setTimeout(() => {
            fixImageContainerHeights();
            fixMobileAspectRatios();
        }, 300);
    });
    
    /**
     * Fix image container heights on mobile
     */
    function fixImageContainerHeights() {
        // Fix hero image container
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            heroImage.style.height = 'auto';
            heroImage.style.maxHeight = '250px';
            heroImage.style.margin = '0 auto 20px';
            
            const img = heroImage.querySelector('img');
            if (img) {
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.maxHeight = '250px';
                img.style.objectFit = 'cover';
                img.style.objectPosition = 'center top';
                img.style.borderRadius = '8px';
            }
        }
        
        // Fix about image container
        const aboutImage = document.querySelector('.about-image');
        if (aboutImage) {
            aboutImage.style.height = 'auto';
            aboutImage.style.maxHeight = '250px';
            
            const img = aboutImage.querySelector('img');
            if (img) {
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
            }
        }
        
        // Fix project image containers
        const projectImages = document.querySelectorAll('.project-image');
        projectImages.forEach(container => {
            // Force a consistent aspect ratio for all project images on mobile
            container.style.paddingBottom = '75%'; // 4:3 ratio
        });
    }
    
    /**
     * Setup touch zoom for images on mobile
     */
    function setupTouchZoom() {
        const images = document.querySelectorAll('.project-image img, .hero-image img, .about-image img');
        
        images.forEach(img => {
            // Remove any existing listeners to prevent duplicates
            img.removeEventListener('touchstart', handleTouchZoom);
            
            // Add new touch zoom handler
            img.addEventListener('touchstart', handleTouchZoom);
        });
        
        function handleTouchZoom(e) {
            // Prevent default behavior
            e.preventDefault();
            
            // Skip if image failed to load
            if (this.naturalWidth === 0 || this.classList.contains('img-error')) {
                return;
            }
            
            // Toggle zoomed state
            this.classList.toggle('touch-zoomed');
            
            if (this.classList.contains('touch-zoomed')) {
                // Create overlay for closing
                const overlay = document.createElement('div');
                overlay.className = 'zoom-overlay';
                document.body.appendChild(overlay);
                
                // Create close button
                const closeBtn = document.createElement('button');
                closeBtn.className = 'zoom-close-btn';
                closeBtn.innerHTML = '&times;';
                closeBtn.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; ' +
                                       'background: rgba(0,0,0,0.5); color: white; border: none; ' +
                                       'width: 40px; height: 40px; border-radius: 50%; font-size: 24px; ' +
                                       'display: flex; align-items: center; justify-content: center;';
                document.body.appendChild(closeBtn);
                
                // Close function
                const closeZoom = () => {
                    this.classList.remove('touch-zoomed');
                    overlay.remove();
                    closeBtn.remove();
                    document.body.style.overflow = '';
                };
                
                // Add event listeners
                overlay.addEventListener('touchstart', closeZoom);
                overlay.addEventListener('click', closeZoom);
                closeBtn.addEventListener('touchstart', closeZoom);
                closeBtn.addEventListener('click', closeZoom);
                
                // Prevent scrolling while zoomed
                document.body.style.overflow = 'hidden';
            } else {
                // Restore scrolling
                document.body.style.overflow = '';
                
                // Remove overlay if it exists
                const overlay = document.querySelector('.zoom-overlay');
                if (overlay) overlay.remove();
                
                // Remove close button if it exists
                const closeBtn = document.querySelector('.zoom-close-btn');
                if (closeBtn) closeBtn.remove();
            }
        }
    }
    
    /**
     * Fix aspect ratios for mobile
     */
    function fixMobileAspectRatios() {
        // Hero image should be squarish on mobile
        const heroImg = document.querySelector('.hero-image img');
        if (heroImg) {
            heroImg.style.aspectRatio = '1/1';
        }
        
        // About image should be 3:2 on mobile
        const aboutImg = document.querySelector('.about-image img');
        if (aboutImg) {
            aboutImg.style.aspectRatio = '3/2';
        }
        
        // Project images should all be 4:3 on mobile for consistency
        const projectImgs = document.querySelectorAll('.project-image img');
        projectImgs.forEach(img => {
            img.style.aspectRatio = '4/3';
        });
    }
    
    /**
     * Improve error handling
     */
    function improveErrorHandling() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Check for already broken images
            if (img.complete && img.naturalWidth === 0) {
                handleBrokenImage(img);
            }
            
            // Add error handler
            img.onerror = function() {
                handleBrokenImage(this);
            };
        });
        
        function handleBrokenImage(img) {
            // Add error class
            img.classList.add('image-load-error');
            
            // Create better placeholder
            if (img.closest('.hero-image')) {
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect width="300" height="300" fill="%23f0f0f0"/%3E%3Ctext x="150" y="150" font-family="Arial" font-size="14" text-anchor="middle" fill="%23999"%3EProfile Image%3C/text%3E%3C/svg%3E';
            } else if (img.closest('.about-image')) {
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f0f0f0"/%3E%3Ctext x="150" y="100" font-family="Arial" font-size="14" text-anchor="middle" fill="%23999"%3EAbout Image%3C/text%3E%3C/svg%3E';
            } else if (img.closest('.project-image')) {
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="225" viewBox="0 0 300 225"%3E%3Crect width="300" height="225" fill="%23f0f0f0"/%3E%3Ctext x="150" y="112" font-family="Arial" font-size="14" text-anchor="middle" fill="%23999"%3EProject Image%3C/text%3E%3C/svg%3E';
            }
        }
    }
    
    /**
     * Optimize images for better performance on mobile
     */
    function optimizeImagesForPerformance() {
        const allImages = document.querySelectorAll('img');
        
        allImages.forEach(img => {
            // Add loading attribute for browsers that support it
            if (!img.hasAttribute('loading') && !img.hasAttribute('importance')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Fix common image rendering issues on mobile
            img.style.backfaceVisibility = 'hidden';
            
            // Add proper error handling
            if (!img.hasAttribute('onerror')) {
                img.onerror = function() {
                    this.onerror = null;
                    
                    // Try to determine image type to provide appropriate fallback
                    let fallbackSrc = 'images/personal/placeholder.jpg';
                    
                    if (this.src.includes('projects')) {
                        fallbackSrc = 'images/projects/placeholder.png';
                    } else if (this.src.includes('icons')) {
                        fallbackSrc = 'images/icons/placeholder.png';
                    }
                    
                    // Set fallback image if not already the fallback
                    if (!this.src.includes('placeholder')) {
                        this.src = fallbackSrc;
                    }
                    
                    // Add error class
                    this.classList.add('img-error');
                };
            }
            
            // Optimize image sizes on mobile
            if (window.innerWidth < 600) {
                // For smaller screens, use smaller images if possible
                const currentSrc = img.src;
                
                // Only optimize non-placeholder images
                if (!currentSrc.includes('placeholder')) {
                    // If a mobile version exists, use it
                    if (currentSrc.includes('.png') || currentSrc.includes('.jpg') || currentSrc.includes('.jpeg')) {
                        const fileExt = currentSrc.substring(currentSrc.lastIndexOf('.'));
                        const mobileSrc = currentSrc.replace(fileExt, '-mobile' + fileExt);
                        
                        // Try to preload the mobile version to check if it exists
                        const preloadImg = new Image();
                        preloadImg.onload = function() {
                            img.src = mobileSrc; // Use mobile version if it exists
                        };
                        preloadImg.src = mobileSrc;
                    }
                }
            }
        });
    }
});
