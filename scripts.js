document.addEventListener('DOMContentLoaded', () => {
    // --- THEME TOGGLE ---
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    // --- MOBILE MENU TOGGLE ---
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
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
        const colors = ['#00b4b4', '#d94a8f', '#ffb800', '#ffd93d'];
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
            card.dataset.index = index;
            
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

            // Title bar
            const titleBar = document.createElement('div');
            titleBar.className = 'track-title-bar';
            const trackTitle = document.createElement('div');
            trackTitle.className = 'track-title';
            trackTitle.textContent = title;
            titleBar.appendChild(trackTitle);

            card.appendChild(artContainer);
            card.appendChild(titleBar);

            // Open modal on click
            card.addEventListener('click', () => openModal(index));
            tracksGrid.appendChild(card);
        });
    }

    // --- MODAL LOGIC ---
    const modal = document.getElementById('trackModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalArt = document.getElementById('modalArt');
    const modalTitle = document.getElementById('modalTitle');
    const modalArtist = document.getElementById('modalArtist');
    const modalPlayBtn = document.getElementById('modalPlayBtn');
    const modalPauseBtn = document.getElementById('modalPauseBtn');
    const modalProgressBar = document.getElementById('modalProgressBar');
    const modalLyricsContainer = document.getElementById('modalLyricsContainer');
    const modalLyricsText = document.getElementById('modalLyricsText');

    const audioPlayer = document.getElementById('audioPlayer');
    let currentPlayingIndex = -1;

    function openModal(index) {
        const file = window.PLAYLIST[index];
        const title = file.replace('.mp3', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const imgFile = file.replace('.mp3', '.jpg');
        const lyrics = window.LYRICS ? window.LYRICS[file] : null;

        // Populate Modal
        modalTitle.textContent = title;
        modalArtist.textContent = window.ARTIST_NAME;
        
        modalArt.innerHTML = `<img src="images/${imgFile}" alt="${title}" onerror="this.style.display='none'; this.parentElement.style.backgroundColor='${getCMYKColor()}'; this.parentElement.innerHTML='<div style=\'display:flex;height:100%;align-items:center;justify-content:center;font-size:4rem;font-weight:900;color:var(--text-primary);\'>${getInitials(title)}</div>'">`;

        if (lyrics) {
            modalLyricsText.textContent = lyrics;
            modalLyricsContainer.style.display = 'block';
        } else {
            modalLyricsContainer.style.display = 'none';
        }

        // Reset player buttons
        modalPlayBtn.disabled = false;
        modalPauseBtn.disabled = true;

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- AUDIO PLAYER LOGIC ---
    function playTrack(index) {
        const file = window.PLAYLIST[index];
        currentPlayingIndex = index;
        audioPlayer.src = `audio/${file}`;
        audioPlayer.play();
        
        modalPlayBtn.disabled = true;
        modalPauseBtn.disabled = false;
    }

    modalPlayBtn.addEventListener('click', () => {
        if (currentPlayingIndex === -1) {
            // Find index from modal title (fallback) or just play first track
            playTrack(0); 
        } else {
            audioPlayer.play();
            modalPlayBtn.disabled = true;
            modalPauseBtn.disabled = false;
        }
    });

    modalPauseBtn.addEventListener('click', () => {
        audioPlayer.pause();
        modalPlayBtn.disabled = false;
        modalPauseBtn.disabled = true;
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration && modal.classList.contains('active')) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            modalProgressBar.style.width = progress + '%';
        }
    });

    audioPlayer.addEventListener('ended', () => {
        modalPlayBtn.disabled = false;
        modalPauseBtn.disabled = true;
        modalProgressBar.style.width = '0%';
    });

    // Initialize
    loadTracks();
});