// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {    // Navigation handling for mobile menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.querySelector('.nav-overlay');
    
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent document click from immediately closing it
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        navOverlay.classList.toggle('active');
        
        // Add class to body to prevent scrolling when menu is open
        document.body.classList.toggle('menu-open');
    });
    
    // Close mobile menu when a nav link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // Close menu when clicking overlay
    navOverlay.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
    });
    
    // Active link highlighting based on scroll position
    const sections = document.querySelectorAll('section[id]');
    
    function highlightActiveLink() {
        const scrollPosition = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if(scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelector('.nav-links a[href*=' + sectionId + ']').classList.add('active');
            } else {
                document.querySelector('.nav-links a[href*=' + sectionId + ']').classList.remove('active');
            }
        });
    }
    
    // Header style change on scroll
    const header = document.querySelector('header');
    const backToTop = document.querySelector('.back-to-top');
    
    function handleScroll() {
        if(window.scrollY > 100) {
            header.classList.add('scrolled');
            backToTop.classList.add('active');
        } else {
            header.classList.remove('scrolled');
            backToTop.classList.remove('active');
        }
        
        highlightActiveLink();
    }
    
    window.addEventListener('scroll', handleScroll);
    
    // Type writing effect
    const typeElement = document.querySelector('.typewrite');
    const words = JSON.parse(typeElement.getAttribute('data-words'));
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;
    
    function type() {
        const currentWord = words[wordIndex];
        
        if(isDeleting) {
            typeElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typeElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }
        
        if(!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 1000; // Pause at the end of the word
        } else if(isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }
        
        setTimeout(type, typeSpeed);
    }
    
    if(typeElement) {
        setTimeout(type, 1000);
    }
    
    // Skills tab switching
    const categories = document.querySelectorAll('.category');
    const skillsContainers = document.querySelectorAll('.skills-container');
    
    categories.forEach(category => {
        category.addEventListener('click', () => {
            // Remove active class from all categories and containers
            categories.forEach(c => c.classList.remove('active'));
            skillsContainers.forEach(container => container.classList.remove('active'));
            
            // Add active class to clicked category and corresponding container
            category.classList.add('active');
            const containerClass = category.getAttribute('data-category');
            document.querySelector(`.skills-container.${containerClass}`).classList.add('active');
        });
    });
    
    // Project filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filterValue = button.getAttribute('data-filter');
            
            // Filter projects
            projectCards.forEach(card => {
                if(filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Testimonial slider
    const sliderDots = document.querySelectorAll('.dot');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    const slides = document.querySelectorAll('.testimonial-slide');
    let currentSlide = 0;
    
    function showSlide(index) {
        // Hide all slides and remove active from all dots
        slides.forEach(slide => slide.style.display = 'none');
        sliderDots.forEach(dot => dot.classList.remove('active'));
        
        // Show current slide and add active to current dot
        slides[index].style.display = 'block';
        sliderDots[index].classList.add('active');
    }
    
    // Initialize testimonial slider
    if(slides.length > 0) {
        showSlide(currentSlide);
        
        // Next slide
        nextButton.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });
        
        // Previous slide
        prevButton.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });
        
        // Dot navigation
        sliderDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
        
        // Auto slide change
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);
    }
    
    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    
    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Here you would typically send the form data to a server
            console.log('Form submitted:', { name, email, subject, message });
            
            // Show success message (in a real application, you'd want to handle this better)
            alert('Thank you for your message! I will get back to you soon.');
            
            // Reset the form
            contactForm.reset();
        });
    }
    
    // Newsletter form handling
    const newsletterForm = document.getElementById('newsletterForm');
    
    if(newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get email from form
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            // Here you would typically send the form data to a server
            console.log('Newsletter subscription:', email);
            
            // Show success message
            alert('Thank you for subscribing to the newsletter!');
            
            // Reset the form
            newsletterForm.reset();
        });
    }
    
    // Initialize AOS (Animate On Scroll) - Uncomment if you add the AOS library
    // AOS.init({
    //     duration: 1000,
    //     once: true
    // });
});
