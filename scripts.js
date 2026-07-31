// Track list + artist name are loaded from playlist.js (loaded below).
  // Edit playlist.js to add or remove songs — this file never needs to change.
  const tracks = (window.PLAYLIST || []).map(filename => {
    const nameOnly = filename.replace(/\.[^/.]+$/, ''); // strip extension
    const title = nameOnly.replace(/[-_]+/g, ' ').replace(/(^|\s)\S/g, c => c.toUpperCase());
    return { title, artist: window.ARTIST_NAME || 'Unknown Artist', src: 'audio/' + filename };
  });

  const els = {
    eyebrow: document.getElementById('eyebrow'),
    platter: document.getElementById('platter'),
    title: document.getElementById('trackTitle'),
    artist: document.getElementById('trackArtist'),
    seek: document.getElementById('seek'),
    curTime: document.getElementById('curTime'),
    durTime: document.getElementById('durTime'),
    playBtn: document.getElementById('playBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    playerLikeBtn: document.getElementById('playerLikeBtn'),
    playlist: document.getElementById('playlist'),
    emptyNote: document.getElementById('emptyNote'),
    likedFilterBtn: document.getElementById('likedFilterBtn'),
    searchBox: document.getElementById('searchBox'),
    shareBtn: document.getElementById('shareBtn'),
    shareLabel: document.getElementById('shareLabel'),
    lyricsBtn: document.getElementById('lyricsBtn'),
    listView: document.getElementById('listView'),
    lyricsView: document.getElementById('lyricsView'),
    playlistHeading: document.getElementById('playlistHeading'),
    lyricsSongTitle: document.getElementById('lyricsSongTitle'),
    lyricsSongArtist: document.getElementById('lyricsSongArtist'),
    lyricsBody: document.getElementById('lyricsBody'),
    volumeBtn: document.getElementById('volumeBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    volIconOn: document.getElementById('volIconOn'),
    volIconOff: document.getElementById('volIconOff'),
  };

  let sound = null;
  let currentIndex = -1;
  let isPlaying = false;
  let shuffleOn = false;
  let repeatOn = false;
  let filterLikedOnly = false;
  let lastVolume = 0.8;
  let searchQuery = '';
  let seekInterval = null;
  let isSeeking = false;
  const trackDurations = {};

  function loadLiked() {
    try {
      const raw = localStorage.getItem('wyhs-liked-tracks');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (e) { return new Set(); }
  }

  function saveLiked() {
    try { localStorage.setItem('wyhs-liked-tracks', JSON.stringify([...likedSet])); }
    catch (e) { /* storage unavailable, likes just won't persist */ }
  }

  let likedSet = loadLiked();

  function getActiveIndices() {
    const all = tracks.map((_, i) => i);
    return all.filter(i => {
      const matchesLiked = !filterLikedOnly || likedSet.has(tracks[i].src);
      const matchesSearch = !searchQuery || tracks[i].title.toLowerCase().includes(searchQuery);
      return matchesLiked && matchesSearch;
    });
  }

  function toggleLike(index) {
    const src = tracks[index].src;
    if (likedSet.has(src)) likedSet.delete(src); else likedSet.add(src);
    saveLiked();
    renderPlaylist();
    syncPlayerLikeBtn();
  }

  function syncPlayerLikeBtn() {
    if (currentIndex === -1) return;
    const liked = likedSet.has(tracks[currentIndex].src);
    els.playerLikeBtn.classList.toggle('active', liked);
    els.playerLikeBtn.setAttribute('aria-pressed', liked);
    els.playerLikeBtn.setAttribute('aria-label', liked ? 'Unlike this song' : 'Like this song');
  }

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function renderPlaylist() {
    if (tracks.length === 0) {
      els.emptyNote.innerHTML = 'No tracks yet. Add your song filenames to <code>playlist.js</code>, then reload.';
      els.emptyNote.style.display = 'block';
      els.playlist.style.display = 'none';
      return;
    }

    const active = getActiveIndices();

    if (active.length === 0) {
      if (searchQuery && filterLikedOnly) {
        els.emptyNote.textContent = `No liked songs match "${els.searchBox.value}".`;
      } else if (searchQuery) {
        els.emptyNote.textContent = `No songs match "${els.searchBox.value}".`;
      } else {
        els.emptyNote.textContent = 'No liked songs yet — tap the heart on songs you like.';
      }
      els.emptyNote.style.display = 'block';
      els.playlist.style.display = 'none';
      return;
    }

    els.emptyNote.style.display = 'none';
    els.playlist.style.display = '';

    const visible = active;

    els.playlist.innerHTML = '';
    visible.forEach(i => {
      const t = tracks[i];
      const liked = likedSet.has(t.src);
      const durText = trackDurations[i] ? fmtTime(trackDurations[i]) : '--:--';
      const li = document.createElement('li');
      const row = document.createElement('div');
      row.className = 'track' + (i === currentIndex ? ' active' : '');
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.innerHTML = `
        <span class="num">${(i + 1).toString().padStart(2, '0')}</span>
        <span class="meta">
          <span class="t-title">${t.title}</span>
        </span>
        <span class="t-dur" data-dur="${i}">${durText}</span>
        <button class="heart-btn${liked ? ' liked' : ''}" data-idx="${i}"
          aria-label="${liked ? 'Unlike' : 'Like'} ${t.title}" aria-pressed="${liked}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21s-6.7-4.35-9.3-8.2C1 10.1 1.6 6.6 4.6 5.1c2.4-1.2 5 .1 6.4 2.2 1.4-2.1 4-3.4 6.4-2.2 3 1.5 3.6 5 1.9 7.7C18.7 16.65 12 21 12 21z"/>
          </svg>
        </button>
      `;
      function pickTrack() {
        if (searchQuery) {
          searchQuery = '';
          els.searchBox.value = '';
          renderPlaylist();
        }
        loadTrack(i, true);
      }
      row.addEventListener('click', pickTrack);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickTrack(); }
      });
      row.querySelector('.heart-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLike(i);
      });
      li.appendChild(row);
      els.playlist.appendChild(li);
    });
  }

  function updateActiveRow() {
    document.querySelectorAll('.track').forEach((el) => {
      const idx = Number(el.querySelector('.heart-btn').dataset.idx);
      const isActive = idx === currentIndex;
      el.classList.toggle('active', isActive);
      if (isActive) {
        scrollRowIntoPlaylist(el);
      }
    });
  }

  function scrollRowIntoPlaylist(rowEl) {
    const container = els.playlist;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();
    const delta = rowRect.top - containerRect.top;
    // Scrolls only this container's own scrollTop — never the outer
    // page — so the player never jumps out of view on mobile.
    container.scrollTo({ top: container.scrollTop + delta, behavior: 'smooth' });
  }

  function loadTrack(index, autoplay) {
    if (tracks.length === 0) return;
    if (sound) { sound.unload(); }
    currentIndex = ((index % tracks.length) + tracks.length) % tracks.length;
    const t = tracks[currentIndex];

    sound = new Howl({
      src: [t.src],
      html5: true,
      onload: () => {
        const dur = sound.duration();
        trackDurations[currentIndex] = dur;
        els.durTime.textContent = fmtTime(dur);
        els.seek.max = dur;
        const durEl = document.querySelector(`.t-dur[data-dur="${currentIndex}"]`);
        if (durEl) durEl.textContent = fmtTime(dur);
      },
      onplay: () => { setPlayingState(true); startSeekLoop(); },
      onpause: () => setPlayingState(false),
      onend: () => {
        if (repeatOn) {
          playCurrent();
        } else {
          goNext();
        }
      },
    });

    els.title.textContent = t.title;
    els.artist.textContent = t.artist;
    els.shareBtn.classList.add('visible');
    els.lyricsBtn.classList.add('visible');
    syncPlayerLikeBtn();
    els.seek.value = 0;
    els.curTime.textContent = '0:00';
    updateActiveRow();
    if (lyricsViewOpen) refreshLyricsView();

    if (autoplay) playCurrent();
  }

  function playCurrent() {
    if (!sound) return;
    sound.play();
  }

  function setPlayingState(playing) {
    isPlaying = playing;
    els.platter.classList.toggle('playing', playing);
    els.playIcon.style.display = playing ? 'none' : 'block';
    els.pauseIcon.style.display = playing ? 'block' : 'none';
    els.playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    els.eyebrow.textContent = playing ? 'Now Spinning' : (currentIndex === -1 ? 'Ready to Spin' : 'Paused');
    if (!playing) stopSeekLoop();
  }

  function startSeekLoop() {
    stopSeekLoop();
    seekInterval = setInterval(() => {
      if (sound && sound.playing() && !isSeeking) {
        const cur = sound.seek() || 0;
        els.seek.value = cur;
        els.curTime.textContent = fmtTime(cur);
      }
    }, 250);
  }

  function stopSeekLoop() {
    if (seekInterval) clearInterval(seekInterval);
    seekInterval = null;
  }

  function goNext() {
    const active = getActiveIndices();
    if (active.length === 0) return;
    if (shuffleOn) { loadTrack(drawShuffle(active), true); return; }
    const pos = active.indexOf(currentIndex);
    const nextPos = pos === -1 ? 0 : (pos + 1) % active.length;
    loadTrack(active[nextPos], true);
  }

  function goPrev() {
    if (sound && sound.seek() > 3) {
      sound.seek(0);
      return;
    }
    const active = getActiveIndices();
    if (active.length === 0) return;
    if (shuffleOn) { loadTrack(drawShuffle(active), true); return; }
    const pos = active.indexOf(currentIndex);
    const prevPos = pos === -1 ? 0 : (pos - 1 + active.length) % active.length;
    loadTrack(active[prevPos], true);
  }

  let shuffleBag = [];

  function drawShuffle(active) {
    // Drop any tracks no longer in the active set (e.g. filter changed)
    shuffleBag = shuffleBag.filter(i => active.includes(i));

    if (shuffleBag.length === 0) {
      shuffleBag = [...active];
      // Fisher-Yates shuffle
      for (let i = shuffleBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffleBag[i], shuffleBag[j]] = [shuffleBag[j], shuffleBag[i]];
      }
      // Avoid the new bag starting with the song that just played
      if (shuffleBag.length > 1 && shuffleBag[0] === currentIndex) {
        [shuffleBag[0], shuffleBag[1]] = [shuffleBag[1], shuffleBag[0]];
      }
    }

    return shuffleBag.shift();
  }

  els.playBtn.addEventListener('click', () => {
    if (!sound) { loadTrack(0, true); return; }
    if (isPlaying) sound.pause(); else sound.play();
  });

  els.nextBtn.addEventListener('click', goNext);
  els.prevBtn.addEventListener('click', goPrev);

  els.shuffleBtn.addEventListener('click', () => {
    shuffleOn = !shuffleOn;
    els.shuffleBtn.classList.toggle('active', shuffleOn);
    els.shuffleBtn.setAttribute('aria-pressed', shuffleOn);
  });

  els.repeatBtn.addEventListener('click', () => {
    repeatOn = !repeatOn;
    els.repeatBtn.classList.toggle('active', repeatOn);
    els.repeatBtn.setAttribute('aria-pressed', repeatOn);
  });

  els.playerLikeBtn.addEventListener('click', () => {
    if (currentIndex === -1) return;
    toggleLike(currentIndex);
  });

  els.likedFilterBtn.addEventListener('click', () => {
    if (lyricsViewOpen) setLyricsView(false);
    filterLikedOnly = !filterLikedOnly;
    els.likedFilterBtn.classList.toggle('active', filterLikedOnly);
    els.likedFilterBtn.setAttribute('aria-pressed', filterLikedOnly);
    renderPlaylist();
    // Filtering only changes what's visible/navigable — it never
    // touches what's currently playing.
  });

  els.searchBox.addEventListener('input', () => {
    searchQuery = els.searchBox.value.trim().toLowerCase();
    renderPlaylist();
  });

  els.seek.addEventListener('input', () => {
    isSeeking = true;
    const val = parseFloat(els.seek.value);
    if (sound) sound.seek(val);
    els.curTime.textContent = fmtTime(val);
  });

  const stopSeeking = () => { isSeeking = false; };
  els.seek.addEventListener('change', stopSeeking);
  els.seek.addEventListener('mouseup', stopSeeking);
  els.seek.addEventListener('touchend', stopSeeking);

  function loadVolume() {
    try {
      const raw = localStorage.getItem('wyhs-volume');
      return raw !== null ? parseFloat(raw) : 0.8;
    } catch (e) { return 0.8; }
  }

  function saveVolume(v) {
    try { localStorage.setItem('wyhs-volume', v); } catch (e) { /* not persisted this session */ }
  }

  function setVolume(v) {
    Howler.volume(v);
    els.volumeSlider.value = v;
    els.volIconOn.style.display = v > 0 ? 'block' : 'none';
    els.volIconOff.style.display = v > 0 ? 'none' : 'block';
    els.volumeBtn.setAttribute('aria-label', v > 0 ? 'Mute' : 'Unmute');
    if (v > 0) lastVolume = v;
  }

  setVolume(loadVolume());

  els.volumeSlider.addEventListener('input', () => {
    const v = parseFloat(els.volumeSlider.value);
    setVolume(v);
    saveVolume(v);
  });

  els.volumeBtn.addEventListener('click', () => {
    const v = Howler.volume() > 0 ? 0 : (lastVolume || 0.8);
    setVolume(v);
    saveVolume(v);
  });

  let lyricsViewOpen = false;

  function refreshLyricsView() {
    if (currentIndex === -1) return;
    const t = tracks[currentIndex];
    const text = (window.LYRICS && window.LYRICS[t.src.replace(/^audio\//, '')]) || '';
    els.lyricsSongTitle.textContent = t.title;
    els.lyricsSongArtist.textContent = t.artist;
    if (text.trim()) {
      els.lyricsBody.textContent = text;
      els.lyricsBody.classList.remove('empty');
    } else {
      els.lyricsBody.textContent = 'Lyrics haven\'t been added for this song yet.';
      els.lyricsBody.classList.add('empty');
    }
  }

  function setLyricsView(open) {
    lyricsViewOpen = open;
    els.lyricsView.classList.toggle('view-hidden', !open);
    els.listView.classList.toggle('view-hidden', open);
    els.lyricsBtn.classList.toggle('active', open);
    els.lyricsBtn.setAttribute('aria-pressed', open);
    els.playlistHeading.textContent = open ? 'Lyrics' : 'Playlist';
    if (open) refreshLyricsView();
  }

  els.lyricsBtn.addEventListener('click', () => {
    if (currentIndex === -1) return;
    setLyricsView(!lyricsViewOpen);
  });

  function getShareUrl(index) {
    const filename = tracks[index].src.replace(/^audio\//, '');
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('song', filename);
    return url.toString();
  }

  function flashShareLabel(msg) {
    els.shareLabel.textContent = msg;
    setTimeout(() => { els.shareLabel.textContent = 'Share'; }, 1800);
  }

  els.shareBtn.addEventListener('click', async () => {
    if (currentIndex === -1) return;
    const url = getShareUrl(currentIndex);
    const t = tracks[currentIndex];
    const shareData = { title: t.title, text: `Listen to "${t.title}" — ${t.artist}`, url };

    if (navigator.share) {
      try { await navigator.share(shareData); }
      catch (e) { /* user cancelled — no action needed */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        flashShareLabel('Link copied!');
      } catch (e) {
        flashShareLabel('Copy failed');
      }
    }
    els.shareBtn.blur();
  });

  renderPlaylist();

  const supportLink = document.getElementById('supportLink');
  if (window.SUPPORT_URL && window.SUPPORT_URL.trim()) {
    supportLink.href = window.SUPPORT_URL.trim();
    document.getElementById('supportLinkText').textContent = `Support ${window.ARTIST_NAME || ''}`.trim();
    supportLink.classList.remove('view-hidden');
  }

  // If this page was opened via a shared link (?song=filename.mp3),
  // load that track so it's ready to play.
  const sharedSong = new URLSearchParams(window.location.search).get('song');
  if (sharedSong) {
    const sharedIndex = tracks.findIndex(t => t.src.replace(/^audio\//, '') === sharedSong);
    if (sharedIndex !== -1) loadTrack(sharedIndex, false);
  }
