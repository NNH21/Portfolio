/*
 * HƯỚNG DẪN CÀI ĐẶT EMAILJS:
 * 1. Đăng ký tài khoản miễn phí tại https://www.emailjs.com/
 * 2. Tạo một Email Service (kết nối với hòm thư Gmail, Outlook, v.v của bạn)
 * 3. Tạo một Email Template mới (đặt tên là "contact_form" hoặc tùy chọn)
 * 4. Trong template, sử dụng các biến sau:
 *    {{from_name}} - Tên người gửi
 *    {{from_email}} - Email người gửi
 *    {{subject}} - Tiêu đề
 *    {{message}} - Nội dung tin nhắn
 * 5. Lấy Public Key, Service ID và Template ID từ tài khoản EmailJS
 * 6. Thay thế các giá trị dưới đây với thông tin của bạn
 */

// Contact form handling with EmailJS
document.addEventListener('DOMContentLoaded', function() {
    // Thông tin EmailJS - Thay thế bằng thông tin của bạn
    const EMAILJS_PUBLIC_KEY = 'J1Pn2P5GjIHy8v7g0'; // Thay bằng Public Key của bạn
    const EMAILJS_SERVICE_ID = 'service_8j8os8r';      // Thay bằng Service ID của bạn
    const EMAILJS_TEMPLATE_ID = 'template_4wyqgye';    // Thay bằng Template ID của bạn
    const RECIPIENT_EMAIL = 'hoangdev21@gmail.com'; // Email nhận tin nhắn
    
    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);
    
    // Function to ensure element is visible by scrolling to it
    function scrollToElement(element) {
        if (!element) return;
        
        // Get element position
        const rect = element.getBoundingClientRect();
        const isInViewport = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        // If not in viewport, scroll to it
        if (!isInViewport) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Extra attempt to ensure scrolling works
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }
    
    // Get the form element
    const contactForm = document.getElementById('contactForm');
    
    // Add submit event listener
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            // Prevent the default form submission
            event.preventDefault();
            
            // Get the form status element
            const formStatus = document.getElementById('form-status');
            
            // Show sending status
            formStatus.textContent = 'Sending...';
            formStatus.className = 'form-status sending';
            
            // Scroll to status
            scrollToElement(formStatus);
            
            // Sử dụng emailjs.sendForm thay vì emailjs.send
            emailjs.sendForm(
                EMAILJS_SERVICE_ID, 
                EMAILJS_TEMPLATE_ID, 
                this,  // Tham chiếu trực tiếp đến form
                EMAILJS_PUBLIC_KEY
            )
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                
                // Show success message
                formStatus.textContent = 'Message sent successfully!';
                formStatus.className = 'form-status success';
                
                // Scroll to success message
                scrollToElement(formStatus);
                
                // Reset the form
                contactForm.reset();
                
                // Clear success message after 5 seconds
                setTimeout(function() {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                }, 5000);
            }, function(error) {
                console.log('FAILED...', error);
                
                // Show error message
                formStatus.textContent = 'Failed to send message. Please try again.';
                formStatus.className = 'form-status error';
                
                // Scroll to error message
                scrollToElement(formStatus);
            });
        });
    }
    
    // Handle newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            // Prevent the default form submission
            event.preventDefault();
            
            // Get the email input
            const emailInput = this.querySelector('input[type="email"]');
            
            // Create a temporary element to show the status
            let statusMsg = document.createElement('div');
            statusMsg.className = 'newsletter-status';
            this.appendChild(statusMsg);
            
            // Scroll to status message
            scrollToElement(statusMsg);
            
            // Tạo dữ liệu template cho newsletter
            const templateParams = {
                subscriber_email: emailInput.value,
                to_name: 'Website Owner',  // Tên người nhận thư
                to_email: RECIPIENT_EMAIL,
                subscription_date: new Date().toLocaleDateString()
            };
            
            // Send the email to the newsletter list
            emailjs.send(
                EMAILJS_SERVICE_ID, 
                'newsletter_template', 
                templateParams, 
                EMAILJS_PUBLIC_KEY
            )
            .then(function() {
                // Show success message
                statusMsg.textContent = 'Subscribed successfully!';
                statusMsg.className = 'newsletter-status success';
                
                // Scroll to success message
                scrollToElement(statusMsg);
                
                // Reset the form
                newsletterForm.reset();
                
                // Remove status message after 5 seconds
                setTimeout(function() {
                    if (statusMsg.parentNode) {
                        statusMsg.parentNode.removeChild(statusMsg);
                    }
                }, 5000);
            }, function(error) {
                // Show error message
                statusMsg.textContent = 'Failed to subscribe. Please try again.';
                statusMsg.className = 'newsletter-status error';
                
                // Scroll to error message
                scrollToElement(statusMsg);
                
                console.error('Newsletter subscription failed:', error);
            });
        });
    }
});