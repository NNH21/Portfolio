/**
 * Music Player for Portfolio
 * Plays random background music when the music icon is clicked
 */

document.addEventListener('DOMContentLoaded', function() {
    // Music player state
    let isPlaying = false;
    let currentAudio = null;
    let musicIcon = null;
    let volume = 0.7; // Default volume (70%)
    let lastTrackIndex = -1; // To avoid playing the same track twice in a row
    
    // List of music tracks (will be populated dynamically)
    const musicTracks = [];
    
    // Function to initialize the music player
    function initMusicPlayer() {
        // Get the music icon element
        musicIcon = document.getElementById('music-toggle');
        
        if (musicIcon) {
            // Add click event listener to the music icon
            musicIcon.addEventListener('click', toggleMusic);
            
            // Set initial icon state
            updateMusicIcon(false);
            
            // Load available music tracks
            loadAvailableTracks();
            
            // Add keyboard shortcut (M key) to toggle music
            document.addEventListener('keydown', function(e) {
                // Check if 'M' key is pressed and not inside an input or textarea
                if (e.key.toLowerCase() === 'm' && 
                    !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                    toggleMusic();
                }
            });
            
            // Remember music state in local storage
            tryToRestoreMusicState();
        }
    }
    
    // Function to try to restore music state from local storage
    function tryToRestoreMusicState() {
        try {
            const shouldPlayMusic = localStorage.getItem('portfolioMusicEnabled') === 'true';
            if (shouldPlayMusic) {
                // Delay starting music to ensure good user experience
                setTimeout(() => {
                    playRandomTrack();
                }, 3000); // 3 second delay
            }
        } catch (e) {
            console.warn('Could not restore music state from local storage', e);
        }
    }
    
    // Function to load available music tracks from the sounds directory
    function loadAvailableTracks() {
        // Predefined list of tracks (extend this list with actual files)
        const tracks = [
            'sounds/NangCoMangEmVe.mp3',
            'sounds/EmCoNhoAnhKhong.mp3',
            'sounds/3107-4.mp3',
            'sounds/AnhSaiRoi.mp3',
            'sounds/id072019.mp3',
            ''

        ];
        
        // Filter tracks that actually exist and add them to musicTracks
        tracks.forEach(track => {
            // Add track to the list (in a real scenario, we'd check if file exists)
            musicTracks.push(track);
        });
        
        console.log('Loaded music tracks:', musicTracks);
    }
    
    // Function to toggle music play/pause
    function toggleMusic() {
        if (isPlaying) {
            pauseMusic();
        } else {
            playRandomTrack();
        }
        
        // Save the preference to local storage
        try {
            localStorage.setItem('portfolioMusicEnabled', isPlaying ? 'true' : 'false');
        } catch (e) {
            console.warn('Could not save music preference to local storage', e);
        }
    }
    
    // Function to play a random music track
    function playRandomTrack() {
        // Stop current audio if playing
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        
        // If no tracks available, return
        if (musicTracks.length === 0) {
            console.warn('No music tracks available to play');
            return;
        }
        
        // Select a random track (avoid playing the same track twice in a row)
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * musicTracks.length);
        } while (randomIndex === lastTrackIndex && musicTracks.length > 1);
        
        lastTrackIndex = randomIndex;
        const trackPath = musicTracks[randomIndex];
        
        // Create new audio element
        currentAudio = new Audio(trackPath);
        
        // Set volume
        currentAudio.volume = volume;
        
        // Add ended event listener to play another random track when current one ends
        currentAudio.addEventListener('ended', playRandomTrack);
        
        // Add error handler in case the file doesn't exist or can't be played
        currentAudio.addEventListener('error', function(e) {
            console.error('Error playing track:', trackPath, e);
            // Remove the track from the list
            musicTracks.splice(randomIndex, 1);
            // Try another track if available
            if (musicTracks.length > 0) {
                playRandomTrack();
            } else {
                isPlaying = false;
                updateMusicIcon(false);
            }
        });
        
        // Play the audio
        const playPromise = currentAudio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    isPlaying = true;
                    updateMusicIcon(true);
                    
                    // Show notification if allowed
                    showMusicNotification(trackPath);
                })
                .catch(error => {
                    console.error('Failed to play audio:', error);
                    
                    // Most browsers require user interaction before playing audio
                    // We'll just update the UI to show it's not playing
                    isPlaying = false;
                    updateMusicIcon(false);
                });
        }
    }
    
    // Function to pause music
    function pauseMusic() {
        if (currentAudio) {
            currentAudio.pause();
            isPlaying = false;
            updateMusicIcon(false);
        }
    }
    
    // Function to update the music icon based on playing state
    function updateMusicIcon(playing) {
        if (!musicIcon) return;
        
        if (playing) {
            // Change to playing state
            musicIcon.innerHTML = '<i class="fas fa-music"></i><div class="volume-indicators"><span></span><span></span><span></span></div>';
            musicIcon.classList.add('playing');
            musicIcon.setAttribute('title', 'Pause Music (Press M)');
        } else {
            // Change to paused state
            musicIcon.innerHTML = '<i class="fas fa-music"></i>';
            musicIcon.classList.remove('playing');
            musicIcon.setAttribute('title', 'Play Music (Press M)');
        }
    }
    
    // Function to show a notification when music starts playing
    function showMusicNotification(trackPath) {
        try {
            // Extract track name from path
            const trackName = trackPath.split('/').pop().replace('.mp3', '');
            
            // Format track name for display
            const formattedTrackName = trackName
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
                .split('_')
                .join(' ');
            
            // Check if notifications container exists
            let notificationsContainer = document.querySelector('.notifications-container');
            
            // If not, create it
            if (!notificationsContainer) {
                notificationsContainer = document.createElement('div');
                notificationsContainer.classList.add('notifications-container');
                document.body.appendChild(notificationsContainer);
            }
            
            // Create notification
            const notification = document.createElement('div');
            notification.classList.add('notification', 'music-notification');
            notification.innerHTML = `
                <i class="fas fa-music"></i>
                <div class="notification-content">
                    <div class="notification-title">Now Playing</div>
                    <div class="notification-message">${formattedTrackName}</div>
                </div>
                <button class="notification-close"><i class="fas fa-times"></i></button>
            `;
            
            // Add to container
            notificationsContainer.appendChild(notification);
            
            // Add close button functionality
            notification.querySelector('.notification-close').addEventListener('click', function() {
                notification.classList.add('notification-hiding');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.classList.add('notification-hiding');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 5000);
            
            // Animate in
            setTimeout(() => {
                notification.classList.add('notification-show');
            }, 10);
            
        } catch (e) {
            console.warn('Could not show music notification', e);
        }
    }
    
    // Initialize the music player
    initMusicPlayer();
}); 