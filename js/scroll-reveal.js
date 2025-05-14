// Scroll Reveal Animation
document.addEventListener('DOMContentLoaded', function() {
    // Reveal animations for elements with 'reveal' class
    const revealElements = document.querySelectorAll('.reveal');
    
    function checkReveal() {
        const triggerBottom = window.innerHeight * 0.8;
        
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if(elementTop < triggerBottom) {
                element.classList.add('active');
            } else {
                // Uncomment the next line if you want elements to hide again when scrolled away
                // element.classList.remove('active');
            }
        });
    }
    
    // Check elements on load
    checkReveal();
    
    // Check elements on scroll
    window.addEventListener('scroll', checkReveal);
    
    // Page transition animation - optional
    function setupPageTransitions() {
        const links = document.querySelectorAll('a[href^="#"]');
        const transitionElement = document.createElement('div');
        transitionElement.classList.add('page-transition');
        document.body.appendChild(transitionElement);
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                // Allow normal scroll behavior
                // But add a nice transition animation
                const href = this.getAttribute('href');
                if(href.startsWith('#') && href.length > 1) {
                    const targetElement = document.querySelector(href);
                    if(targetElement) {
                        transitionElement.classList.add('active');
                        
                        setTimeout(() => {
                            transitionElement.classList.remove('active');
                        }, 1500);
                    }
                }
            });
        });
    }
    
    // Uncomment to enable page transitions
    // setupPageTransitions();
    
    // Custom cursor - optional
    function setupCustomCursor() {
        const cursor = document.createElement('div');
        const follower = document.createElement('div');
        
        cursor.classList.add('custom-cursor');
        follower.classList.add('custom-cursor-follower');
        
        document.body.appendChild(cursor);
        document.body.appendChild(follower);
        
        let posX = 0, posY = 0;
        let mouseX = 0, mouseY = 0;
        
        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });
        
        function loop() {
            posX += (mouseX - posX) * 0.1;
            posY += (mouseY - posY) * 0.1;
            
            follower.style.left = posX + 'px';
            follower.style.top = posY + 'px';
            
            requestAnimationFrame(loop);
        }
        
        loop();
        
        const links = document.querySelectorAll('a, button, .btn');
        
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
                follower.classList.add('active');
            });
            
            link.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
                follower.classList.remove('active');
            });
        });
    }
    
    // Uncomment to enable custom cursor
    // setupCustomCursor();
    
    // Progress bar animation when in viewport
    const skillItems = document.querySelectorAll('.skill-item .progress');
    
    function animateSkillBars() {
        skillItems.forEach(item => {
            const itemPosition = item.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if(itemPosition < screenPosition) {
                // Add animation class
                item.style.animation = 'skillBarFill 1.5s ease-out forwards';
            }
        });
    }
    
    // Check on initial load
    animateSkillBars();
    
    // Check on scroll
    window.addEventListener('scroll', animateSkillBars);
    
    // Add hover effects to elements
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('animate-float');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('animate-float');
        });
    });
});
