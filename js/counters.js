// Animated counters for skill percentages
document.addEventListener('DOMContentLoaded', function() {
    const counters = document.querySelectorAll('.percentage');
    const speed = 200; // The lower the slower
    
    function animateCounters() {
        counters.forEach(counter => {
            const position = counter.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (position < screenPosition) {
                const target = parseInt(counter.textContent);
                let count = 0;
                const increment = target / speed;
                
                if(!counter.classList.contains('counted')) {
                    const timer = setInterval(() => {
                        count += increment;
                        counter.textContent = Math.ceil(count) + '%';
                        
                        if(count >= target) {
                            counter.textContent = target + '%';
                            clearInterval(timer);
                        }
                    }, 1);
                    
                    counter.classList.add('counted');
                }
            }
        });
    }
    
    // Check for counters on initial load
    animateCounters();
    
    // Check for counters on scroll
    window.addEventListener('scroll', animateCounters);
});
