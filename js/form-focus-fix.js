/**
 * Form Focus Fix - Special script to prevent unwanted scrolling when focusing form elements
 * This script runs after all other scripts to ensure it fixes issues that might be caused by other scripts
 */
(function() {
    // Wait for window to fully load
    window.addEventListener('load', function() {
        // Wait a bit to make sure all other scripts have initialized
        setTimeout(fixFormFocusIssues, 500);
    });
    
    function fixFormFocusIssues() {
        console.log('Applying final form focus fixes');
        
        // Get all form fields
        const formFields = document.querySelectorAll('input, textarea, select');
        
        // Store the current scroll position globally
        let lastScrollPosition = window.scrollY;
        
        // Update scroll position periodically
        window.addEventListener('scroll', function() {
            // Only update when not in focus mode
            if (!document.activeElement || 
                (document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA' && 
                document.activeElement.tagName !== 'SELECT')) {
                lastScrollPosition = window.scrollY;
            }
        });
        
        formFields.forEach(field => {
            // Prevent default behaviors for click events
            field.addEventListener('click', function(e) {
                e.stopPropagation();
            });
            
            // Save current position whenever a field gets focus
            field.addEventListener('focusin', function(e) {
                // Prevent any default behaviors that might cause scrolling
                e.preventDefault();
                e.stopPropagation();
                
                // Store scroll position on the field
                field.setAttribute('data-scroll-pos', lastScrollPosition);
                
                // Immediately restore scroll position in case browser moved
                if (Math.abs(window.scrollY - lastScrollPosition) > 5) {
                    window.scrollTo({
                        top: lastScrollPosition,
                        behavior: 'auto' // Instant scroll
                    });
                }
            });
            
            // When done with the field, make sure we're still in the right place
            field.addEventListener('focusout', function() {
                // Get the stored scroll position
                const storedPos = parseInt(field.getAttribute('data-scroll-pos'));
                
                // If we have a stored position and the page has scrolled, fix it
                if (!isNaN(storedPos) && Math.abs(window.scrollY - storedPos) > 10) {
                    window.scrollTo({
                        top: storedPos,
                        behavior: 'auto' // Instant scroll
                    });
                }
            });
        });
        
        // Special fix for iOS Safari
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            // Fix iOS zoom on input
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            if (viewportMeta) {
                // Keep user-scalable off only for iOS to prevent zoom on input focus
                viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
            }
            
            document.querySelectorAll('input, select, textarea').forEach(input => {
                // Ensure font size is at least 16px to prevent iOS zoom
                input.style.fontSize = '16px';
            });
        }
    }
})();
