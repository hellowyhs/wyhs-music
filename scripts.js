document.addEventListener('DOMContentLoaded', () => {
    // --- MOBILE MENU TOGGLE ---
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // --- SUPPORT LINK ---
    const supportLink = document.getElementById('supportLink');
    if (window.SUPPORT_URL && window.SUPPORT_URL !== "") {
        supportLink.href = window.SUPPORT_URL;
    } else {
        supportLink.style.display = 'none';
    }

    // --- HELPERS ---
    function getInitials(title) {
        const words = title.split(' ');
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return title.substring(0, 2).toUpperCase();
    }

    function getCMYKColor() {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ffffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // --- LOAD TRACKS ---
    function loadTracks() {
        if (!window.PLAYLIST || !window.ARTIST_NAME) {
            console.error('Playlist not loaded');
            return;
        }

        const tracksGrid = document.getElementById('tracksGrid');
        if (!tracksGrid) {
            console.error('tracksGrid element not found');
            return;
        }
        
        tracksGrid.innerHTML = '';
        
        window.PLAYLIST.forEach((file, index) => {
            const title = file.replace('.mp3', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const imgFile = file.replace('.mp3', '.jpg');
            const lyrics = window.LYRICS ? window.LYRICS[file] : null;

            const card = document.createElement('div');
            card.className = 'track-card';
            
            // Image container
            const artContainer = document.createElement('div');
            artContainer.className = 'track-art';
            
            const img = document.createElement('img');
            img.src = `images/${imgFile}`;
            img.alt = title;
            img.onerror = function() {
                this.style.display = 'none';
                if (this.nextElementSibling) {
                    this.nextElementSibling.style.display = 'flex';
                }
            };

            const fallback = document.createElement('div');
            fallback.className = 'art-fallback';
            fallback.style.display = 'none';
            fallback.textContent = getInitials(title);
            fallback.style.backgroundColor = getCMYKColor();

            artContainer.appendChild(img);
            artContainer.appendChild(fallback);

            // Info section
            const info = document.createElement('div');
            info.className = 'track-info';
            
            const trackTitle = document.createElement('div');
            trackTitle.className = 'track-title';
            trackTitle.textContent = title;
            
            const trackArtist = document.createElement('div');
            trackArtist.className = 'track-artist';
            trackArtist.textContent = window.ARTIST_NAME;
            
            info.appendChild(trackTitle);
            info.appendChild(trackArtist);

            // Player controls
            const playerControls = document.createElement('div');
            playerControls.className = 'player-controls';
            
            const playBtn = document.createElement('button');
            playBtn.className = 'control-btn play-btn';
            playBtn.textContent = '▶';
            playBtn.dataset.index = index;
            playBtn.dataset.file = file;
            
            const pauseBtn = document.createElement('button');
            pauseBtn.className = 'control-btn pause-btn';
            pauseBtn.textContent = '⏸';
            pauseBtn.disabled = true;
            
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.dataset.index = index;
            
            progressContainer.appendChild(progressBar);
            playerControls.appendChild(playBtn);
            playerControls.appendChild(pauseBtn);
            playerControls.appendChild(progressContainer);

            // Lyrics section (only if lyrics exist)
            let lyricsSection = null;
            if (lyrics) {
                lyricsSection = document.createElement('div');
                lyricsSection.className = 'lyrics-section';
                
                const lyricsTitle = document.createElement('h3');
                lyricsTitle.textContent = 'LYRICS';
                
                const lyricsContent = document.createElement('div');
                lyricsContent.className = 'lyrics-content';
                lyricsContent.textContent = lyrics;
                
                lyricsSection.appendChild(lyricsTitle);
                lyricsSection.appendChild(lyricsContent);
            }

            card.appendChild(artContainer);
            card.appendChild(info);
            card.appendChild(playerControls);
            if (lyricsSection) {
                card.appendChild(lyricsSection);
            }

            tracksGrid.appendChild(card);
        });

        // Add event listeners to play buttons
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const file = e.target.dataset.file;
                playTrack(index, file);
            });
        });

        // Add event listeners to pause buttons
        document.querySelectorAll('.pause-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                pauseAll();
            });
        });
    }

    // --- AUDIO PLAYER LOGIC ---
    const audioPlayer = document.getElementById('audioPlayer');
    let currentPlayingIndex = -1;

    function playTrack(index, file) {
        if (currentPlayingIndex === index && !audioPlayer.paused) {
            return;
        }

        currentPlayingIndex = index;
        audioPlayer.src = `audio/${file}`;
        audioPlayer.play();
        
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.disabled = false;
            btn.textContent = '▶';
        });
        document.querySelectorAll('.pause-btn').forEach(btn => {
            btn.disabled = false;
        });
        
        const activePlayBtn = document.querySelector(`.play-btn[data-index="${index}"]`);
        if (activePlayBtn) {
            activePlayBtn.textContent = '▶';
            activePlayBtn.disabled = true;
        }
        
        updateProgress(index);
    }

    function pauseAll() {
        audioPlayer.pause();
        currentPlayingIndex = -1;
        
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.disabled = false;
            btn.textContent = '▶';
        });
        document.querySelectorAll('.pause-btn').forEach(btn => {
            btn.disabled = true;
        });
        document.querySelectorAll('.progress-bar').forEach(bar => {
            bar.style.width = '0%';
        });
    }

    function updateProgress(index) {
        const progressBar = document.querySelector(`.progress-bar[data-index="${index}"]`);
        if (progressBar && audioPlayer.duration) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = progress + '%';
        }
    }

    audioPlayer.addEventListener('timeupdate', () => {
        if (currentPlayingIndex >= 0) {
            updateProgress(currentPlayingIndex);
        }
    });

    audioPlayer.addEventListener('ended', () => {
        pauseAll();
    });

    // Initialize
    loadTracks();
});