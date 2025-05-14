// Advanced animation effects
document.addEventListener('DOMContentLoaded', function() {
    // Implement smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Don't prevent default behavior if it's form elements or inside a form
            const isFormElement = this.closest('form') !== null || 
                                  this.closest('input') !== null || 
                                  this.closest('textarea') !== null ||
                                  this.closest('select') !== null ||
                                  this.tagName.toLowerCase() === 'input' || 
                                  this.tagName.toLowerCase() === 'textarea' ||
                                  this.tagName.toLowerCase() === 'select' ||
                                  this.tagName.toLowerCase() === 'button';
            
            // Don't handle smooth scroll for form elements or if parent is a form element
            if (isFormElement && this.getAttribute('type') !== 'submit') {
                return; // Allow form fields to work normally
            }
            
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Add a smooth scroll with a slight delay for visual effect
                setTimeout(() => {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Account for fixed header
                        behavior: 'smooth'
                    });
                }, 100);
            }
        });
    });
    
    // 3D tilt effect for cards and images
    const tiltElements = document.querySelectorAll('.project-card, .about-image, .skill-card');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', tiltEffect);
        element.addEventListener('mouseleave', resetTilt);
    });
    
    function tiltEffect(e) {
        const card = this;
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;
        const centerX = card.offsetLeft + cardWidth/2;
        const centerY = card.offsetTop + cardHeight/2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        const rotateX = (-1) * 25 * mouseY / (cardHeight/2);
        const rotateY = 25 * mouseX / (cardWidth/2);
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
    
    function resetTilt() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    }
    
    // Magnetic effect for buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', magneticEffect);
        button.addEventListener('mouseleave', resetMagnetic);
    });
    
    function magneticEffect(e) {
        const btn = this;
        const btnRect = btn.getBoundingClientRect();
        const btnWidth = btn.offsetWidth;
        const btnHeight = btn.offsetHeight;
        const centerX = btnRect.left + btnWidth/2;
        const centerY = btnRect.top + btnHeight/2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
        
        if (distance < 100) {
            const moveX = mouseX * 0.3;
            const moveY = mouseY * 0.3;
            btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    }
    
    function resetMagnetic() {
        this.style.transform = 'translate(0, 0)';
    }
    
    // Water ripple effect
    const rippleElements = document.querySelectorAll('.ripple');
    
    rippleElements.forEach(element => {
        element.addEventListener('click', createRipple);
    });
    
    function createRipple(e) {
        const element = this;
        
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;
        
        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${e.clientX - element.getBoundingClientRect().left - radius}px`;
        ripple.style.top = `${e.clientY - element.getBoundingClientRect().top - radius}px`;
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Add text glitch effect
    const glitchTexts = document.querySelectorAll('.glitch');
    
    glitchTexts.forEach(text => {
        const textContent = text.textContent;
        text.setAttribute('data-text', textContent);
    });
    
    // Add text gradient effect to headings
    const headings = document.querySelectorAll('h1, h2');
    headings.forEach(heading => {
        if (!heading.classList.contains('text-gradient') && Math.random() > 0.5) {
            heading.classList.add('text-gradient');
        }
    });
    
    // Add shiny effect to primary buttons
    const primaryButtons = document.querySelectorAll('.primary-btn');
    primaryButtons.forEach(button => {
        button.classList.add('shiny');
    });
    
    // Add hover underline effect to navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.add('hover-underline');
    });
    
    // Add 3D effect to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.classList.add('card-3d');
    });
    
    // Add neon glow effect to highlight elements
    const highlightElements = document.querySelectorAll('.highlight');
    highlightElements.forEach(element => {
        element.classList.add('neon-glow');
    });
});
