// Mobile enhancements and optimizations
document.addEventListener('DOMContentLoaded', function() {
    // Improve touch scrolling
    const touchScrollElements = document.querySelectorAll('.messages-container, .chat-body');
    
    touchScrollElements.forEach(element => {
        if (element) {
            element.style.webkitOverflowScrolling = 'touch';
        }
    });
    
    // Improve scroll performance on mobile
    const debounce = (func, delay) => {
        let inDebounce;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(inDebounce);
            inDebounce = setTimeout(() => func.apply(context, args), delay);
        };
    };
    
    // Throttle scroll events to improve performance
    const throttle = (func, limit) => {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    };
    
    // Handle touch events better for buttons and links
    const interactiveElements = document.querySelectorAll('.btn, .nav-links a, .social-icons a, .project-links a, .filter-btn');
    
    interactiveElements.forEach(element => {
        // Add touch feedback
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, {passive: true});
        
        element.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        }, {passive: true});
        
        // Prevent ghost clicks
        let lastTap = 0;
        element.addEventListener('touchend', function(e) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                e.preventDefault();
            }
            lastTap = currentTime;
        }, {passive: false});
    });
    
    // Handle orientation change for responsive layouts
    window.addEventListener('orientationchange', function() {
        // Allow the orientation to complete before adjusting
        setTimeout(() => {
            adjustUIForOrientation();
        }, 300);
    });
    
    function adjustUIForOrientation() {
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        
        // Adjust elements for mobile landscape
        if (isLandscape && isMobile) {
            // Fix chat window height in landscape
            const chatWindow = document.querySelector('.chat-window');
            if (chatWindow) {
                chatWindow.style.height = '100vh';
            }
            
            // Adjust hero content for landscape view
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.padding = '0 5%';
            }
            
            // Adjust project cards for landscape
            const projectCards = document.querySelectorAll('.project-card');
            projectCards.forEach(card => {
                card.style.maxWidth = '300px';
            });
        } else {
            // Reset modifications
            const chatWindow = document.querySelector('.chat-window');
            if (chatWindow) {
                chatWindow.style.height = '';
            }
            
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.padding = '';
            }
            
            const projectCards = document.querySelectorAll('.project-card');
            projectCards.forEach(card => {
                card.style.maxWidth = '';
            });
        }
    }
    
    // Check initial orientation
    adjustUIForOrientation();
    
    // Optimize scroll performance
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                // Lazy load images on mobile
                lazyLoadImages();
                // Adjust chatbot position on scroll
                adjustChatBubblePosition();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Better mobile input handling
    const inputFields = document.querySelectorAll('input, textarea');
    
    inputFields.forEach(field => {
        // Add focus/blur handling for keyboard
        field.addEventListener('focus', () => {
            // Don't use scroll adjustment here as it causes issues
            // Just let the form-focus-fix.js handle this instead
        });
        
        // Fix for iOS zooming on input focus
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            field.style.fontSize = '16px';
        }
    });
      // Lazy loading images to improve performance
    function lazyLoadImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if (lazyImages.length === 0) return; // No images to lazy load
        
        if ('IntersectionObserver' in window) {
            let imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        let image = entry.target;
                        const dataSrc = image.dataset.src;
                        
                        if (dataSrc) {
                            // Create a temporary image to preload
                            const tempImg = new Image();
                            
                            // When preload succeeds, update the visible image
                            tempImg.onload = function() {
                                image.src = dataSrc;
                                image.classList.add('img-loaded');
                                image.removeAttribute('data-src');
                                imageObserver.unobserve(image);
                            };
                            
                            // Handle preload errors
                            tempImg.onerror = function() {
                                // Try loading directly as a fallback
                                image.src = dataSrc;
                                image.classList.add('img-load-error');
                                image.removeAttribute('data-src');
                                imageObserver.unobserve(image);
                            };
                            
                            // Start preloading
                            tempImg.src = dataSrc;
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px' // Start loading 50px before image enters viewport
            });
            
            lazyImages.forEach(image => {
                // Only observe images that still need loading
                if (image.dataset.src) {
                    imageObserver.observe(image);
                }
            });
        } else {
            // Fallback for browsers without Intersection Observer
            lazyImages.forEach(image => {
                if (image.dataset.src) {
                    image.src = image.dataset.src;
                    image.removeAttribute('data-src');
                }
            });
        }
    }
      // Detect slow connections and optimize accordingly
    if (navigator.connection) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
            // For extremely slow connections, reduce animations
            document.body.classList.add('reduce-motion');
            
            // Simplify particle effects
            const canvas = document.querySelector('.particle-background');
            if (canvas) {
                canvas.style.opacity = '0.3';
            }
            
            // Force load important images immediately instead of lazy loading
            document.querySelectorAll('.hero-image img, .about-image img').forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }
    }
    
    // Adjust chatbot bubble position when scrolling near bottom
    function adjustChatBubblePosition() {
        const chatBubble = document.querySelector('.chat-bubble');
        const footer = document.querySelector('footer');
        
        if (chatBubble && footer) {
            const footerRect = footer.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (footerRect.top < windowHeight) {
                const overlap = windowHeight - footerRect.top;
                chatBubble.style.bottom = (30 + overlap) + 'px';
            } else {
                chatBubble.style.bottom = '30px';
            }
        }
    }
    
    // Add swipe support for testimonial slides on mobile
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    
    if (testimonialsSlider) {
        let startX;
        let endX;
        
        testimonialsSlider.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
        }, {passive: true});
        
        testimonialsSlider.addEventListener('touchend', e => {
            endX = e.changedTouches[0].clientX;
            
            if (startX - endX > 50) {
                // Swipe left - next slide
                const nextBtn = document.querySelector('.next-slide');
                if (nextBtn) nextBtn.click();
            } else if (endX - startX > 50) {
                // Swipe right - previous slide
                const prevBtn = document.querySelector('.prev-slide');
                if (prevBtn) prevBtn.click();
            }
        }, {passive: true});
    }
    
    // Initialize lazy loading when page loads
    lazyLoadImages();
});
