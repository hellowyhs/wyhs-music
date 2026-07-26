document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const audioPlayer = document.getElementById('audioPlayer');
    const tracksGrid = document.getElementById('tracksGrid');
    const nowPlaying = document.getElementById('nowPlaying');
    const npTitle = document.getElementById('npTitle');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    const progressBar = document.getElementById('progressBar');

    let currentTrackIndex = 0;
    let isPlaying = false;

    // Helper to get initials for fallback images
    function getInitials(title) {
        const words = title.split(' ');
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return title.substring(0, 2).toUpperCase();
    }

    // Load Tracks
    function loadTracks() {
        tracksGrid.innerHTML = '';
        window.PLAYLIST.forEach((file, index) => {
            const title = file.replace('.mp3', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const imgFile = file.replace('.mp3', '.jpg'); // Assumes images are .jpg

            const card = document.createElement('div');
            card.className = 'track-card';
            
            // Create image and fallback
            const artContainer = document.createElement('div');
            artContainer.className = 'track-art';
            
            const img = document.createElement('img');
            img.src = `images/${imgFile}`;
            img.alt = title;
            img.onerror = function() {
                this.style.display = 'none';
                this.nextElementSibling.style.display = 'flex';
            };

            const fallback = document.createElement('div');
            fallback.className = 'art-fallback';
            fallback.style.display = 'none'; // Hidden by default
            fallback.textContent = getInitials(title);

            artContainer.appendChild(img);
            artContainer.appendChild(fallback);

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
        currentTrackIndex = index;
        const file = window.PLAYLIST[index];
        const title = file.replace('.mp3', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        audioPlayer.src = `audio/${file}`;
        audioPlayer.play();
        isPlaying = true;

        npTitle.textContent = title;
        nowPlaying.classList.add('active');
        playPauseBtn.textContent = '⏸';
        mainPlayBtn.textContent = '⏸ Now Playing';
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
        if (window.PLAYLIST.length > 0) {
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
});            } catch (e) {
                console.log('Visualizer init failed:', e);
            }
        }
    });
    
    function drawVisualizer() {
        if (!analyser) return;
        
        requestAnimationFrame(drawVisualizer);
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / dataArray.length) * 2.5;
        let x = 0;
        
        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.5;
            const hue = (i / dataArray.length) * 360;
            
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.8)`);
            gradient.addColorStop(1, `hsla(${hue + 60}, 70%, 40%, 0.4)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
}

// ============================================
// FLOATING MUSIC NOTES
// ============================================

function initFloatingNotes() {
    const container = document.getElementById('floatingNotes');
    if (!container) return;
    
    const notes = ['♪', '♫', '♬', '♩', '🎵', '🎶'];
    const colors = [
        'rgba(255, 100, 200, 0.3)',
        'rgba(100, 200, 255, 0.3)',
        'rgba(200, 100, 255, 0.3)'
    ];
    
    function createNote() {
        const note = document.createElement('div');
        note.className = 'music-note';
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        note.style.left = Math.random() * 100 + '%';
        note.style.animationDuration = (6 + Math.random() * 4) + 's';
        note.style.animationDelay = Math.random() * 2 + 's';
        note.style.color = colors[Math.floor(Math.random() * colors.length)];
        note.style.fontSize = (16 + Math.random() * 16) + 'px';
        
        container.appendChild(note);
        
        // Remove after animation
        setTimeout(() => {
            note.remove();
        }, 10000);
    }
    
    // Create notes periodically
    setInterval(createNote, 2000);
    
    // Create initial batch
    for (let i = 0; i < 5; i++) {
        setTimeout(createNote, i * 500);
    }
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all reveal elements
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// MAIN PLAYER LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations
    initAudioVisualizer();
    initFloatingNotes();
    initScrollReveal();
    
    // Main Player Setup
    let currentTrackIndex = 0;
    let isPlaying = false;
    const audioPlayer = document.getElementById('audioPlayer');
    const vinylRecord = document.getElementById('vinylRecord');
    const nowPlaying = document.getElementById('nowPlaying');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    const progressBar = document.getElementById('progressBar');
    
    // Load tracks from playlist
    function loadTracks() {
        const tracksGrid = document.getElementById('tracksGrid');
        tracksGrid.innerHTML = '';
        
        window.PLAYLIST.forEach((track, index) => {
            const title = track.replace('.mp3', '').replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            const card = document.createElement('div');
            card.className = 'track-card reveal';
            card.innerHTML = `
                <h3><span class="track-number">${index + 1}</span>${title}</h3>
                <p>${window.ARTIST_NAME}</p>
            `;
            card.addEventListener('click', () => playTrack(index));
            tracksGrid.appendChild(card);
        });
    }
    
    // Play track
    function playTrack(index) {
        currentTrackIndex = index;
        const track = window.PLAYLIST[index];
        const title = track.replace('.mp3', '').replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        audioPlayer.src = `audio/${track}`;
        audioPlayer.play();
        isPlaying = true;
        
        nowPlayingTitle.textContent = title;
        nowPlaying.classList.add('active');
        vinylRecord.classList.add('playing');
        playPauseBtn.textContent = '⏸';
        mainPlayBtn.textContent = '⏸ Now Playing';
        
        updateNowPlaying();
    }
    
    // Toggle play/pause
    function togglePlayPause() {
        if (audioPlayer.paused) {
            audioPlayer.play();
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
