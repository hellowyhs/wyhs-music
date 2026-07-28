document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const html = document.documentElement;
    
    const currentTheme = localStorage.getItem('theme') || 'dark';
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

    const supportLink = document.getElementById('supportLink');
    if (window.SUPPORT_URL && window.SUPPORT_URL !== "") {
        supportLink.href = window.SUPPORT_URL;
    } else {
        supportLink.style.display = 'none';
    }

    const scrollTopBtn = document.getElementById('scrollTopBtn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function getInitials(title) {
        const words = title.split(' ');
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return title.substring(0, 2).toUpperCase();
    }

    function getAccentColor() {
        const colors = ['#ff6b4a', '#b83fe0', '#2dd4bf'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function loadTracks() {
        if (!window.PLAYLIST || !window.ARTIST_NAME) {
            console.error('Playlist not loaded');
            return;
        }

        const tracksGrid = document.getElementById('tracksGrid');
        if (!tracksGrid) return;
        
        tracksGrid.innerHTML = '';
        
        window.PLAYLIST.forEach((file, index) => {
            const title = file.replace('.mp3', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const imgFile = file.replace('.mp3', '.jpg');

            const card = document.createElement('div');
            card.className = 'track-card';
            card.dataset.index = index;
            
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
            fallback.style.backgroundColor = getAccentColor();

            artContainer.appendChild(img);
            artContainer.appendChild(fallback);

            const titleBar = document.createElement('div');
            titleBar.className = 'track-title-bar';

            const trackNum = document.createElement('span');
            trackNum.className = 'track-num';
            trackNum.textContent = String(index + 1).padStart(2, '0');

            const trackTitle = document.createElement('div');
            trackTitle.className = 'track-title';
            trackTitle.textContent = title;

            titleBar.appendChild(trackNum);
            titleBar.appendChild(trackTitle);

            card.appendChild(artContainer);
            card.appendChild(titleBar);

            card.addEventListener('click', () => openModal(index));
            tracksGrid.appendChild(card);
        });
    }

    const modal = document.getElementById('trackModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalArt = document.getElementById('modalArt');
    const modalTitle = document.getElementById('modalTitle');
    const modalArtist = document.getElementById('modalArtist');
    const modalPlayPauseBtn = document.getElementById('modalPlayPauseBtn');
    const modalProgressContainer = document.getElementById('modalProgressContainer');
    const modalProgressBar = document.getElementById('modalProgressBar');
    const modalProgressThumb = document.getElementById('modalProgressThumb');
    const modalCurrentTime = document.getElementById('modalCurrentTime');
    const modalDuration = document.getElementById('modalDuration');
    const modalLyricsContainer = document.getElementById('modalLyricsContainer');
    const modalLyricsText = document.getElementById('modalLyricsText');

    const audioPlayer = document.getElementById('audioPlayer');
    let currentPlayingIndex = -1; // track actually loaded into the <audio> element
    let selectedIndex = -1;       // track currently open in the modal

    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function setPlayIcon(isPlaying) {
        modalPlayPauseBtn.classList.toggle('is-playing', isPlaying);
        modalPlayPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    }

    function resetProgressDisplay() {
        modalProgressBar.style.width = '0%';
        modalProgressThumb.style.left = '0%';
        modalCurrentTime.textContent = '0:00';
        modalDuration.textContent = '0:00';
    }

    function openModal(index) {
        const file = window.PLAYLIST[index];
        const title = file.replace('.mp3', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const imgFile = file.replace('.mp3', '.jpg');
        const lyrics = window.LYRICS ? window.LYRICS[file] : null;

        selectedIndex = index;
        modalTitle.textContent = title;
        modalArtist.textContent = window.ARTIST_NAME;
        
        modalArt.innerHTML = `<img src="images/${imgFile}" alt="${title}" onerror="this.style.display='none'; this.parentElement.style.backgroundColor='${getAccentColor()}'; this.parentElement.innerHTML='<div style=\'display:flex;height:100%;align-items:center;justify-content:center;font-size:4rem;font-weight:700;color:#fff;font-family:Unbounded,sans-serif;\'>${getInitials(title)}</div>'">`;

        if (lyrics) {
            modalLyricsText.textContent = lyrics;
            modalLyricsContainer.style.display = 'block';
        } else {
            modalLyricsContainer.style.display = 'none';
        }

        if (currentPlayingIndex === index && !audioPlayer.paused) {
            setPlayIcon(true);
            modalDuration.textContent = formatTime(audioPlayer.duration);
        } else {
            setPlayIcon(false);
            resetProgressDisplay();
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        history.pushState({ trackModal: true }, '', '#track');
    }

    function closeModal() {
        if (history.state && history.state.trackModal) {
            history.back(); // triggers popstate below, which does the actual hiding
        } else {
            hideModal();
        }
    }

    function hideModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    window.addEventListener('popstate', () => {
        if (modal.classList.contains('active')) {
            hideModal();
        }
    });

    function playTrack(index) {
        const file = window.PLAYLIST[index];
        currentPlayingIndex = index;
        audioPlayer.src = `audio/${file}`;
        audioPlayer.play();
        setPlayIcon(true);
    }

    modalPlayPauseBtn.addEventListener('click', () => {
        if (currentPlayingIndex !== selectedIndex) {
            playTrack(selectedIndex);
        } else if (audioPlayer.paused) {
            audioPlayer.play();
            setPlayIcon(true);
        } else {
            audioPlayer.pause();
            setPlayIcon(false);
        }
    });

    modalProgressContainer.addEventListener('click', (e) => {
        if (!audioPlayer.duration || currentPlayingIndex !== selectedIndex) return;
        const rect = modalProgressContainer.getBoundingClientRect();
        const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        audioPlayer.currentTime = ratio * audioPlayer.duration;
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        if (modal.classList.contains('active')) {
            modalDuration.textContent = formatTime(audioPlayer.duration);
        }
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration && modal.classList.contains('active') && currentPlayingIndex === selectedIndex) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            modalProgressBar.style.width = progress + '%';
            modalProgressThumb.style.left = progress + '%';
            modalCurrentTime.textContent = formatTime(audioPlayer.currentTime);
        }
    });

    audioPlayer.addEventListener('ended', () => {
        setPlayIcon(false);
        if (modal.classList.contains('active') && currentPlayingIndex === selectedIndex) {
            resetProgressDisplay();
            modalDuration.textContent = formatTime(audioPlayer.duration);
        }
    });

    loadTracks();

    const heroPlayBlob = document.getElementById('heroPlayBlob');
    const newReleaseTitle = document.getElementById('newReleaseTitle');
    if (window.PLAYLIST && window.PLAYLIST.length > 0) {
        const latestFile = window.PLAYLIST[0];
        const latestTitle = latestFile.replace('.mp3', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        newReleaseTitle.textContent = latestTitle;
        heroPlayBlob.style.display = 'flex';
        heroPlayBlob.addEventListener('click', () => openModal(0));
    }
});
