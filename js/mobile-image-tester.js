/**
 * Mobile Testing Helper
 * This script helps identify and fix image display issues on mobile devices
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only run on mobile devices
    if (window.innerWidth > 768) {
        console.log('Mobile testing helper only runs on mobile devices');
        return;
    }
    
    console.log('Mobile testing helper activated - checking images...');
    
    // Log mobile device info
    logDeviceInfo();
    
    // Monitor image loading events
    monitorImageLoading();
    
    // Check for common issues with images
    checkImageIssues();
    
    // Apply emergency fixes if needed
    applyEmergencyFixes();
    
    /**
     * Log mobile device information for debugging
     */
    function logDeviceInfo() {
        const deviceInfo = {
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            devicePixelRatio: window.devicePixelRatio,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            orientation: window.screen.orientation ? window.screen.orientation.type : 'unknown'
        };
        
        console.log('Mobile Device Info:', deviceInfo);
        
        // Add to session storage for later access
        sessionStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
    }
    
    /**
     * Monitor image loading events
     */
    function monitorImageLoading() {
        const allImages = document.querySelectorAll('img');
        let loadedCount = 0;
        let errorCount = 0;
        
        allImages.forEach(img => {
            // For already loaded images
            if (img.complete) {
                if (img.naturalWidth === 0) {
                    errorCount++;
                    console.warn('Image failed to load:', img.src);
                    
                    // Apply instant fix
                    fixBrokenImage(img);
                } else {
                    loadedCount++;
                }
            }
            
            // For images still loading
            img.addEventListener('load', function() {
                loadedCount++;
                console.log(`Image loaded (${loadedCount}/${allImages.length}):`, this.src);
                
                // Check image dimensions
                checkImageDimensions(this);
            });
            
            img.addEventListener('error', function() {
                errorCount++;
                console.warn(`Image failed to load (${errorCount}/${allImages.length}):`, this.src);
                
                // Apply instant fix
                fixBrokenImage(this);
            });
        });
    }
    
    /**
     * Check for common issues with images
     */
    function checkImageIssues() {
        // Check hero image
        const heroImage = document.querySelector('.hero-image img');
        if (heroImage) {
            ensureImageDisplaysCorrectly(heroImage, 'hero');
        }
        
        // Check about image
        const aboutImage = document.querySelector('.about-image img');
        if (aboutImage) {
            ensureImageDisplaysCorrectly(aboutImage, 'about');
        }
        
        // Check project images
        const projectImages = document.querySelectorAll('.project-image img');
        projectImages.forEach(img => {
            ensureImageDisplaysCorrectly(img, 'project');
        });
    }
    
    /**
     * Ensure specific image displays correctly
     */
    function ensureImageDisplaysCorrectly(img, type) {
        // Set appropriate sizes
        switch(type) {
            case 'hero':
                img.style.width = '100%';
                img.style.maxHeight = '300px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '8px';
                break;
                
            case 'about':
                img.style.width = '100%';
                img.style.maxHeight = '250px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '8px';
                break;
                
            case 'project':
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                break;
        }
        
        // Set explicit width and height to prevent layout shifts
        if (img.complete && img.naturalWidth > 0) {
            // Calculate aspect ratio
            const aspectRatio = img.naturalHeight / img.naturalWidth;
            
            // Set explicit aspect ratio to maintain proportions
            img.style.aspectRatio = type === 'hero' ? '1/1' : 
                                   type === 'about' ? '3/2' : '4/3';
        }
        
        // Force GPU acceleration to fix rendering issues
        img.style.transform = 'translateZ(0)';
        img.style.willChange = 'transform';
        img.style.backfaceVisibility = 'hidden';
    }
    
    /**
     * Check image dimensions
     */
    function checkImageDimensions(img) {
        // Get actual dimensions
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        
        // If image is very large, warn about possible performance issues
        if (width > 1200 || height > 1200) {
            console.warn('Large image detected, consider resizing:', img.src, `${width}x${height}`);
        }
        
        // If image is too small, it might appear pixelated
        if ((width < 300 || height < 300) && img.closest('.hero-image, .about-image')) {
            console.warn('Image resolution may be too low for hero/about section:', img.src, `${width}x${height}`);
        }
    }
    
    /**
     * Fix broken images
     */
    function fixBrokenImage(img) {
        // Add error class
        img.classList.add('image-load-error');
        
        // Determine replacement image based on context
        let replacementSrc = '';
        
        if (img.closest('.hero-image')) {
            replacementSrc = 'images/personal/placeholder.jpg';
        } else if (img.closest('.about-image')) {
            replacementSrc = 'images/personal/placeholder.jpg';
        } else if (img.closest('.project-image')) {
            replacementSrc = 'images/projects/placeholder.png';
        } else {
            // Default fallback
            replacementSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f0f0f0"/%3E%3Ctext x="100" y="75" font-family="Arial" font-size="12" text-anchor="middle" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';
        }
        
        // Replace the image source
        if (img.src !== replacementSrc) {
            img.src = replacementSrc;
        }
        
        // Apply necessary styles
        ensureImageDisplaysCorrectly(img, img.closest('.hero-image') ? 'hero' : 
                                       img.closest('.about-image') ? 'about' : 'project');
    }
    
    /**
     * Apply emergency fixes if needed
     */
    function applyEmergencyFixes() {
        // Fix transparent images
        fixTransparentImages();
        
        // Fix image containers
        fixImageContainers();
        
        // Check image loading after 3 seconds (emergency check)
        setTimeout(checkUnloadedImages, 3000);
    }
    
    /**
     * Fix transparent images
     */
    function fixTransparentImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add background color to prevent transparency issues
            img.style.backgroundColor = '#f8f8f8';
        });
    }
    
    /**
     * Fix image containers
     */
    function fixImageContainers() {
        // Fix hero image container
        const heroImageContainer = document.querySelector('.hero-image');
        if (heroImageContainer) {
            heroImageContainer.style.minHeight = '200px';
            heroImageContainer.style.backgroundColor = '#f8f8f8';
            heroImageContainer.style.borderRadius = '8px';
            heroImageContainer.style.overflow = 'hidden';
        }
        
        // Fix about image container
        const aboutImageContainer = document.querySelector('.about-image');
        if (aboutImageContainer) {
            aboutImageContainer.style.minHeight = '200px';
            aboutImageContainer.style.backgroundColor = '#f8f8f8';
            aboutImageContainer.style.borderRadius = '8px';
            aboutImageContainer.style.overflow = 'hidden';
        }
        
        // Fix project image containers
        const projectImageContainers = document.querySelectorAll('.project-image');
        projectImageContainers.forEach(container => {
            container.style.backgroundColor = '#f8f8f8';
            container.style.borderRadius = '8px 8px 0 0';
            container.style.overflow = 'hidden';
        });
    }
    
    /**
     * Check for unloaded images after delay (emergency check)
     */
    function checkUnloadedImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            if (!img.complete || img.naturalWidth === 0) {
                console.warn('Image still not loaded after 3s:', img.src);
                fixBrokenImage(img);
            }
        });
    }
});
