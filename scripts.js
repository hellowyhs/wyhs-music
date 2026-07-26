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

    // --- CONNECT SUPPORT LINK FROM PLAYLIST.JS ---
    if (window.SUPPORT_URL && window.SUPPORT_URL !== "") {
        supportLink.href = window.SUPPORT_URL;
    } else {
        supportLink.style.display = 'none';
    }

    // Helper to get initials for fallback images
    function getInitials(title) {
        const words = title.split(' ');
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return title.substring(0, 2).toUpperCase();
    }

    // Helper to assign random CMYK colors to fallback art
    function getCMYKColor() {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ffffff'];
        return colors[Math.floor(Math.random() * colors.length)];
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
            fallback.style.backgroundColor = getCMYKColor();

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
        npArtist.textContent = window.ARTIST_NAME || 'wyhs';
        nowPlaying.classList.add('active');
        playPauseBtn.textContent = '⏸';
        mainPlayBtn.textContent = '⏸ NOW PLAYING';
    }

    // Toggle Play/Pause
    function togglePlayPause() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            isPlaying = true;
            playPauseBtn.textContent = '⏸';
            mainPlayBtn.textContent = '⏸ NOW PLAYING';
        } else {
            audioPlayer.pause();
            isPlaying = false;
            playPauseBtn.textContent = '▶';
            mainPlayBtn.textContent = '▶ PLAY LATEST';
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
});