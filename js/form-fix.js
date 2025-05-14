// Form fix script to prevent scrolling to top when clicking on form fields
document.addEventListener('DOMContentLoaded', function() {
    // Fix for form field focus issues
    const formFields = document.querySelectorAll('.form-group input, .form-group textarea');
    
    if (formFields.length > 0) {
        console.log('Form fields fix applied');
        
        // Prevent default behavior for form fields to avoid unwanted scrolling
        formFields.forEach(field => {
            // Add special class for styling
            field.classList.add('focus-fix');
            
            // Add click handler that prevents propagation 
            field.addEventListener('click', function(e) {
                // Stop the event from bubbling up to parent elements
                e.stopPropagation();
            });
            
            // Add focus handler
            field.addEventListener('focus', function(e) {
                // Stop the event from bubbling up to parent elements
                e.stopPropagation();
                
                // Add active class to parent form-group
                this.closest('.form-group').classList.add('active');
            });
            
            // Add blur handler
            field.addEventListener('blur', function() {
                // Remove active class when field loses focus
                this.closest('.form-group').classList.remove('active');
            });
        });
    }
    
    // Prevent any anchor links inside forms from causing page scrolls
    const formAnchors = document.querySelectorAll('form a[href^="#"]');
    formAnchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Always stop propagation and prevent default for anchors inside forms
            e.stopPropagation();
            e.preventDefault();
        });
    });
    
    // Add special handling for the contact form submit button
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.addEventListener('click', function(e) {
                // Don't let the click event propagate to anchor handlers
                e.stopPropagation();
            });
        }
    }
});
