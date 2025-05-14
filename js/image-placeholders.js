/**
 * Create placeholder images for the project in case they don't exist
 */
document.addEventListener('DOMContentLoaded', function() {
    // Create missing placeholder directories if needed
    ensurePlaceholders();

    /**
     * Create placeholder images for various sections if they don't exist
     */
    function ensurePlaceholders() {
        // Create SVG placeholder and insert it into the DOM for use
        const placeholderSVG = document.createElement('div');
        placeholderSVG.style.display = 'none';
        placeholderSVG.innerHTML = `
            <svg id="placeholder-image" xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
                <rect width="100%" height="100%" fill="#f0f0f0"/>
                <path d="M300,100 L300,300 M200,200 L400,200" stroke="#cccccc" stroke-width="20" stroke-linecap="round"/>
                <text x="300" y="350" font-family="Arial" font-size="30" text-anchor="middle" fill="#999999">Image</text>
            </svg>
            <svg id="placeholder-error" xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
                <rect width="100%" height="100%" fill="#f8f8f8"/>
                <circle cx="300" cy="180" r="70" fill="none" stroke="#cccccc" stroke-width="15"/>
                <text x="300" y="195" font-family="Arial" font-size="80" text-anchor="middle" fill="#cccccc">!</text>
                <text x="300" y="300" font-family="Arial" font-size="25" text-anchor="middle" fill="#999999">Image not found</text>
            </svg>
        `;
        document.body.appendChild(placeholderSVG);

        // Fallback for actual image files
        // This won't create actual files on server but provides client-side fallbacks
        const placeholders = {
            project: 'data:image/svg+xml,' + encodeURIComponent(document.getElementById('placeholder-image').outerHTML),
            error: 'data:image/svg+xml,' + encodeURIComponent(document.getElementById('placeholder-error').outerHTML),
        };

        // If the placeholders div exists but the user can't access actual files,
        // we can at least ensure the client-side fallbacks work
        window.imagePlaceholders = placeholders;
    }

    /**
     * Create a Data URL for a placeholder image
     * Can be used directly in HTML or CSS
     */
    function getPlaceholderDataURL(width, height, text) {
        const canvas = document.createElement('canvas');
        canvas.width = width || 600;
        canvas.height = height || 400;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Center crosshair
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height/3);
        ctx.lineTo(canvas.width/2, canvas.height*2/3);
        ctx.moveTo(canvas.width/3, canvas.height/2);
        ctx.lineTo(canvas.width*2/3, canvas.height/2);
        ctx.stroke();
        
        // Text
        if (text) {
            ctx.fillStyle = '#999999';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(text, canvas.width/2, canvas.height*3/4);
        }
        
        return canvas.toDataURL('image/png');
    }

    // Make the function available globally for other scripts
    window.getPlaceholderImage = getPlaceholderDataURL;
});
