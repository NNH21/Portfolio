// Preloader
document.addEventListener('DOMContentLoaded', function() {
    // Hide preloader when page is loaded
    window.addEventListener('load', function() {
        const preloader = document.querySelector('.preloader');
        
        if (preloader) {
            // Add fade-out class
            preloader.classList.add('fade-out');
            
            // Remove preloader from DOM after animation
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    });
});
