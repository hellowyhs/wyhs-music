document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const audioPlayer = document.getElementById('audioPlayer');
    const tracksGrid = document.getElementById('tracksGrid');
    const nowPlaying = document.getElementById('nowPlaying');
    const npTitle = document.getElementById('npTitle');
    const npArtist = document.getElementById('npArtist');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    const progressBar = document.getElementById('progressBar');
    const supportLink = document.getElementById('supportLink');

    let currentTrackIndex = 0;
    let isPlaying = false;

    // Set support link from playlist.js
    if (window.SUPPORT_URL && window.SUPPORT_URL !== "") {
        supportLink.href = window.SUPPORT_URL;
        supportLink.style.display = 'inline-block';
    } else {
        supportLink.style.display = 'none';
    }

    // Helper to get initials for fallback images
    function getInitials(title) {
        const words = title.split(' ');
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return title.substring(0, 2).toUpperCase();
    }

    // Load Tracks
    function loadTracks() {
        if (!window.PLAYLIST || !window.ARTIST_NAME) {
            console.error('Playlist not loaded');
            return;
        }

        tracksGrid.innerHTML = '';
        window.PLAYLIST.forEach((file, index) => {
            const title = file.replace('.mp3', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const imgFile = file.replace('.mp3', '.jpg');

            const card = document.createElement('div');
            card.className = 'track-card';
            
            // Create image container
            const artContainer = document.createElement('div');
            artContainer.className = 'track-art';
            
            // Create image element
            const img = document.createElement('img');
            img.src = `images/${imgFile}`;
            img.alt = title;
            img.onerror = function() {
                this.style.display = 'none';
                if (this.nextElementSibling) {
                    this.nextElementSibling.style.display = 'flex';
                }
            };

            // Create fallback element
            const fallback = document.createElement('div');
            fallback.className = 'art-fallback';
            fallback.style.display = 'none';
            fallback.textContent = getInitials(title);

            artContainer.appendChild(img);
            artContainer.appendChild(fallback);

            // Create info section
            const info = document.createElement('div');
            info.className = 'track-info';
            info.innerHTML = `<div class="track-title">${title}</div><div class="track-artist">${window.ARTIST_NAME}</div>`;

            card.appendChild(artContainer);
            card.appendChild(info);

            card.addEventListener('click', () => playTrack(index));
            tracksGrid.appendChild(card);
        });
    }

    // Play Track
    function playTrack(index) {
        if (!window.PLAYLIST[index]) return;
        
        currentTrackIndex = index;
        const file = window.PLAYLIST[index];
        const title = file.replace('.mp3', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        audioPlayer.src = `audio/${file}`;
        audioPlayer.play();
        isPlaying = true;

        npTitle.textContent = title;
        npArtist.textContent = window.ARTIST_NAME || 'WYHS';
        nowPlaying.classList.add('active');
        playPauseBtn.textContent = '';
        mainPlayBtn.textContent = ' Now Playing';
    }

    // Toggle Play/Pause
    function togglePlayPause() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            isPlaying = true;
            playPauseBtn.textContent = '⏸';
            mainPlayBtn.textContent = '⏸ Now Playing';
        } else {
            audioPlayer.pause();
            isPlaying = false;
            playPauseBtn.textContent = '▶';
            mainPlayBtn.textContent = '▶ Play Latest';
        }
    }

    // Next/Prev
    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % window.PLAYLIST.length;
        playTrack(currentTrackIndex);
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + window.PLAYLIST.length) % window.PLAYLIST.length;
        playTrack(currentTrackIndex);
    }

    // Update Progress
    function updateProgress() {
        if (audioPlayer.duration) {
            progressBar.style.width = (audioPlayer.currentTime / audioPlayer.duration) * 100 + '%';
        }
    }

    // Event Listeners
    mainPlayBtn.addEventListener('click', () => {
        if (window.PLAYLIST && window.PLAYLIST.length > 0) {
            if (isPlaying && currentTrackIndex === 0) togglePlayPause();
            else playTrack(0);
        }
    });

    playPauseBtn.addEventListener('click', togglePlayPause);
    document.getElementById('nextBtn').addEventListener('click', nextTrack);
    document.getElementById('prevBtn').addEventListener('click', prevTrack);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', nextTrack);

    // Initialize
    loadTracks();
});lay();
            isPlaying = true;
            vinylRecord.classList.add('playing');
            playPauseBtn.textContent = '⏸';
            mainPlayBtn.textContent = '⏸ Now Playing';
        } else {
            audioPlayer.pause();
            isPlaying = false;
            vinylRecord.classList.remove('playing');
            playPauseBtn.textContent = '▶';
            mainPlayBtn.textContent = '▶ Play Now';
        }
    }
    
    // Next track
    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % window.PLAYLIST.length;
        playTrack(currentTrackIndex);
    }
    
    // Previous track
    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + window.PLAYLIST.length) % window.PLAYLIST.length;
        playTrack(currentTrackIndex);
    }
    
    // Update progress bar
    function updateProgress() {
        if (audioPlayer.duration) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = progress + '%';
        }
    }
    
    // Update now playing info
    function updateNowPlaying() {
        // Visualizer will update automatically
    }
    
    // Event listeners
    mainPlayBtn.addEventListener('click', () => {
        if (window.PLAYLIST.length > 0) {
            if (isPlaying && currentTrackIndex === 0) {
                togglePlayPause();
            } else {
                playTrack(0);
            }
        }
    });
    
    playPauseBtn.addEventListener('click', togglePlayPause);
    document.getElementById('nextBtn').addEventListener('click', nextTrack);
    document.getElementById('prevBtn').addEventListener('click', prevTrack);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', nextTrack);
    
    // Initialize
    loadTracks();
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Particle effect on click
    document.addEventListener('click', (e) => {
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = e.clientX + 'px';
            particle.style.top = e.clientY + 'px';
            particle.style.setProperty('--tx', (Math.random() - 0.5) * 100 + 'px');
            particle.style.setProperty('--ty', (Math.random() - 0.5) * 100 + 'px');
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 3000);
        }
    });
});
