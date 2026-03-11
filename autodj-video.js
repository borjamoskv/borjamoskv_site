/**
 * ═══════════════════════════════════════════════════════════════════
 * AUTO-DJ A/V ENGINE (INVISIBLE)
 * Dual-deck YouTube Crossfader + Mutual Exclusion + BPM Sync
 * ═══════════════════════════════════════════════════════════════════
 */

class AutoDJAesthetic {
  constructor() {
    this.deckA = null;
    this.deckB = null;
    this.activeDeck = 'a';
    this.isCrossfading = false;
    this.globalMuted = false;
    this.mixCount = 0;
    this.trackStartTime = Date.now();
    this.elapsedTimer = null;
    this.isBackgroundPausedByEmbed = false;
    
    // Harmony & Timing
    this.fadeDurationMs = 3000; 
    this.masterBPM = 125; // Default master tempo

    // Automated DJ Sequence Configuration (40s Transitions)
    this.autoMixTimer = null;
    this.mixSequence = ['b9ktVQN48OU', 'x8E9HInpzE4']; // LES BUKO, GLITCH IN THE MIRROR
    this.mixIntervalMs = 40000; // 40 seconds per track

    // Simulated BPM database for known tracks (fallback to 120-130 if unknown)
    this.bpmCache = {};

    // 🎤 Spotify-style DJ Voice & Mood System
    this.currentMood = localStorage.getItem('moskv_dj_mood') || 'all';
    this.playedTracks = JSON.parse(localStorage.getItem('moskv_dj_history') || '[]');
    this.voiceEnabled = 'speechSynthesis' in window;

    // 💾 Persistent User Memory (TikTok-style)
    this.userProfile = JSON.parse(localStorage.getItem('moskv_user') || '{}');
    this.userProfile.visits = (this.userProfile.visits || 0) + 1;
    this.userProfile.firstSeen = this.userProfile.firstSeen || new Date().toISOString();
    this.userProfile.lastSeen = new Date().toISOString();
    this.userProfile.totalListenSec = this.userProfile.totalListenSec || 0;
    localStorage.setItem('moskv_user', JSON.stringify(this.userProfile));

    // 📦 TikTok Prefetch Queue (next 2 tracks pre-selected)
    this.prefetchQueue = [];

    // Inject YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Global callback required by YT API
    window.onYouTubeIframeAPIReady = () => this.initPlayers();
    
    // Start listening to clicks
    this.bindClickEvents();
    this.bindEmbedListeners();
  }

  // Harmonic approximation: Assigns a persistent random BPM to unknown tracks
  getTrackBPM(videoId) {
    if (this.bpmCache[videoId]) return this.bpmCache[videoId];
    // Assign a synthetic BPM between 110 and 135 to simulate DJ environments
    const bpm = 110 + Math.floor(Math.random() * 25);
    this.bpmCache[videoId] = bpm;
    return bpm;
  }

  initPlayers() {
    if (!window.DATA || !window.DATA.videoThumbnails) return;
    
    const startVidA = window.DATA.videoThumbnails[Math.floor(Math.random() * window.DATA.videoThumbnails.length)];
    const startVidB = window.DATA.videoThumbnails[Math.floor(Math.random() * window.DATA.videoThumbnails.length)];

    this.masterBPM = this.getTrackBPM(startVidA);

    const commonParams = {
      autoplay: 1, controls: 0, disablekb: 1, fs: 0, 
      iv_load_policy: 3, loop: 1, modestbranding: 1, playsinline: 1, rel: 0
    };

    this.deckA = new YT.Player('bg-video-a', {
      videoId: startVidA,
      playerVars: { ...commonParams, playlist: startVidA },
      events: { 'onReady': (e) => this.onPlayerReady(e, 'a') }
    });

    this.deckB = new YT.Player('bg-video-b', {
      videoId: startVidB,
      playerVars: { ...commonParams, playlist: startVidB },
      events: { 'onReady': (e) => this.onPlayerReady(e, 'b') }
    });
  }

  onPlayerReady(event, deckId) {
    if (this.globalMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
    }
    
    if (deckId === 'a') {
      event.target.setVolume(100);
      event.target.setPlaybackRate(1.0); // Native speed initially
      document.getElementById('bg-video-a').style.opacity = 1;
      event.target.playVideo();
    } else {
      event.target.setVolume(0);
      document.getElementById('bg-video-b').style.opacity = 0;
      event.target.pauseVideo();
    }

    const soundToggle = document.getElementById('heroSoundToggle');
    if (soundToggle && !soundToggle.dataset.autodjBound) {
      soundToggle.dataset.autodjBound = 'true';
      const newToggle = soundToggle.cloneNode(true);
      soundToggle.parentNode.replaceChild(newToggle, soundToggle);
      
      newToggle.addEventListener('click', (e) => {
         e.stopPropagation();
         this.toggleGlobalMute();
      });
    }
  }

  toggleGlobalMute() {
    this.globalMuted = !this.globalMuted;
    const activePlayer = this.activeDeck === 'a' ? this.deckA : this.deckB;
    
    if (this.globalMuted) {
      if(this.deckA && typeof this.deckA.mute === 'function') this.deckA.mute();
      if(this.deckB && typeof this.deckB.mute === 'function') this.deckB.mute();
    } else {
      if(activePlayer && typeof activePlayer.unMute === 'function') activePlayer.unMute();
    }
    
    const iconUnmute = document.querySelector('.icon-unmute');
    const iconMute = document.querySelector('.icon-mute');
    if (this.globalMuted) {
      if (iconUnmute) iconUnmute.style.display = 'block';
      if (iconMute) iconMute.style.display = 'none';
    } else {
      if (iconUnmute) iconUnmute.style.display = 'none';
      if (iconMute) iconMute.style.display = 'block';
    }
  }

  bindClickEvents() {
    this.audioUnlocked = false;

    // First global interaction to unlock audio policies
    const unlockAudio = () => {
      if (this.audioUnlocked) return;
      this.audioUnlocked = true;
      const activePlayer = this.activeDeck === 'a' ? this.deckA : this.deckB;
      if (activePlayer && typeof activePlayer.unMute === 'function') {
        if (!this.globalMuted) {
            activePlayer.unMute();
            activePlayer.setVolume(100);
        }
      }
      // Start the automated DJ setlist loop once audio is unblocked
      console.log("[CORTEX AutoDJ] Starting Automated Mix Sequence (40s intervals)");
      this.initAgentUI();
      this.scheduleNextMix();
    };

    ['click', 'touchstart', 'keydown'].forEach(evt => 
      document.addEventListener(evt, unlockAudio, { once: true, capture: true })
    );

    document.addEventListener('click', (e) => {
      const isInteractive = e.target.closest('a, button, input, iframe, .filter-btn, .spatial-audio-btn, #chiquito-overlay');
      if (isInteractive) return;
      if (this.isBackgroundPausedByEmbed) return;
      
      // If audio wasn't unlocked until this exact click, don't crossfade yet!
      // We check if it JUST got unlocked. Actually, since unlockAudio is in 'capture' 
      // and this is bubble, it's already true. Let's use a flag to skip the first click crossfade.
      if (!this.firstCrossfadeReady) {
         this.firstCrossfadeReady = true;
         return; // Skip crossfade on first click so user hears the initial track.
      }

      this.triggerCrossfade();
    });
  }

  initAgentUI() {
    this.agentUI = document.createElement('div');
    this.agentUI.className = 'moskv-dj-hud idle';
    this.agentUI.innerHTML = `
        <div class="dj-header">
            <div><span class="dj-live-dot"></span> MOSKV-1 AUTODJ</div>
            <div class="dj-header-right">
                <span id="dj-mix-count" class="dj-mix-count">MIX #0</span>
                <span id="dj-bpm-master">130 BPM</span>
            </div>
        </div>
        <div class="dj-decks">
            <div class="dj-deck active" id="dj-deck-a-ui">
                <span>DK-A ▶</span>
                <span id="dj-track-a">LOADING...</span>
            </div>
            <div class="dj-deck" id="dj-deck-b-ui">
                <span>DK-B ⏸</span>
                <span id="dj-track-b">STANDBY</span>
            </div>
        </div>
        <div class="dj-waveform" id="dj-waveform">
            ${Array.from({length: 32}, () => `<div class="wv-bar"></div>`).join('')}
        </div>
        <div class="dj-progress-row">
            <span id="dj-elapsed">00:00</span>
            <div class="dj-progress-bar"><div class="dj-progress-fill" id="dj-progress-fill"></div></div>
            <span id="dj-next-in">--:--</span>
        </div>
        <div class="dj-eq">
            <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
        </div>
        <div class="dj-mood-row" id="dj-mood-row">
            <button class="dj-mood-btn ${this.currentMood === 'all' ? 'active' : ''}" data-mood="all">ALL</button>
            <button class="dj-mood-btn ${this.currentMood === 'ambient' ? 'active' : ''}" data-mood="ambient">AMBIENT</button>
            <button class="dj-mood-btn ${this.currentMood === 'techno' ? 'active' : ''}" data-mood="techno">TECHNO</button>
            <button class="dj-mood-btn ${this.currentMood === 'experimental' ? 'active' : ''}" data-mood="experimental">EXP</button>
            <button class="dj-mood-btn ${this.currentMood === 'electronic' ? 'active' : ''}" data-mood="electronic">ELEC</button>
        </div>
        <div class="dj-prefetch" id="dj-prefetch">
            <span class="dj-prefetch-label">NEXT UP ▸</span>
            <span id="dj-prefetch-1">---</span>
            <span id="dj-prefetch-2">---</span>
        </div>
        <div class="dj-status" id="dj-status-text">INITIALIZING CORE...</div>
        <div class="dj-sensors" id="dj-sensors">
            <div class="dj-sensor-item"><span class="sensor-icon">🔋</span> <span class="dj-sensor-value" id="sensor-battery">--</span></div>
            <div class="dj-sensor-item"><span class="sensor-icon">🌐</span> <span class="dj-sensor-value" id="sensor-location">--</span></div>
            <div class="dj-sensor-item"><span class="sensor-icon">📡</span> <span class="dj-sensor-value" id="sensor-network">--</span></div>
            <div class="dj-sensor-item"><span class="sensor-icon">🧠</span> <span class="dj-sensor-value" id="sensor-memory">--</span></div>
            <div class="dj-sensor-item"><span class="sensor-icon">🕓</span> <span class="dj-sensor-value" id="sensor-time-mood">--</span></div>
        </div>
        <div class="dj-visits" id="dj-visits">VISIT #${this.userProfile.visits}</div>
    `;
    document.body.appendChild(this.agentUI);

    this.glitchOverlay = document.createElement('div');
    this.glitchOverlay.className = 'dj-glitch-overlay';
    document.body.appendChild(this.glitchOverlay);

    // Animate waveform bars randomly
    this.waveformBars = document.querySelectorAll('.wv-bar');
    this._animateWaveform();

    // 🚀 SCI-FI SENSORS INITIALIZATION
    this._initSensors();

    // Elapsed timer
    this.trackStartTime = Date.now();
    this.elapsedTimer = setInterval(() => this._updateElapsed(), 1000);

    setTimeout(() => {
        const titleA = window.DATA?.works?.find(w => w.id === this.currentVideoId)?.title || "UNKNOWN";
        document.getElementById('dj-track-a').innerText = titleA.substring(0,18);
        document.getElementById('dj-status-text').innerText = 'LIVE';
        document.getElementById('dj-bpm-master').innerText = `${this.masterBPM} BPM`;
        // Prefetch first queue
        this._prefetchNext();
        // Welcome back message for returning users
        if (this.userProfile.visits > 1) {
            this._djSpeak(`Welcome back. Visit number ${this.userProfile.visits}. Let's go.`);
        }
    }, 2500);

    // Mood button click handlers
    this.agentUI.querySelectorAll('.dj-mood-btn').forEach(btn => {
        btn.style.pointerEvents = 'auto';
        btn.addEventListener('click', (e) => {
            this.currentMood = e.target.dataset.mood;
            localStorage.setItem('moskv_dj_mood', this.currentMood);
            this.agentUI.querySelectorAll('.dj-mood-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById('dj-status-text').innerText = `MOOD: ${this.currentMood.toUpperCase()}`;
            this._prefetchNext();
            this._djSpeak(`Mood set to ${this.currentMood}. Filtering tracks.`);
        });
    });

    // Persist listen time every 10s
    setInterval(() => {
        this.userProfile.totalListenSec += 10;
        localStorage.setItem('moskv_user', JSON.stringify(this.userProfile));
    }, 10000);
  }

  // 🚀 CIENCIA FICCIÓN: Hardware & Environment Sensors
  _initSensors() {
    // 🔋 BATTERY API
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const update = () => {
                const pct = Math.round(battery.level * 100);
                const el = document.getElementById('sensor-battery');
                if (el) el.innerText = `${pct}%${battery.charging ? '⚡' : ''}`;
                // Low battery DJ commentary
                if (pct < 15 && !this._lowBatteryWarned) {
                    this._lowBatteryWarned = true;
                    this._djSpeak('Warning. Device battery critical. Switching to power save ambient mode.');
                    // Auto-switch to ambient for lower CPU usage
                    if (this.currentMood !== 'ambient') {
                        this.currentMood = 'ambient';
                        this.agentUI?.querySelectorAll('.dj-mood-btn').forEach(b => {
                            b.classList.toggle('active', b.dataset.mood === 'ambient');
                        });
                    }
                }
            };
            update();
            battery.addEventListener('levelchange', update);
            battery.addEventListener('chargingchange', update);
        });
    }

    // 🌐 GEOLOCATION (reverse geocode via free API)
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            const el = document.getElementById('sensor-location');
            // Reverse geocode
            fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`)
                .then(r => r.json())
                .then(data => {
                    const city = data?.address?.city || data?.address?.town || data?.address?.village || '??';
                    const country = data?.address?.country_code?.toUpperCase() || '';
                    if (el) el.innerText = `${city}, ${country}`;
                    this.userProfile.lastCity = city;
                    localStorage.setItem('moskv_user', JSON.stringify(this.userProfile));
                    this._djSpeak(`Broadcasting from ${city}. Let's go.`);
                })
                .catch(() => {
                    if (el) el.innerText = `${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°`;
                });
        }, () => {
            const el = document.getElementById('sensor-location');
            if (el) el.innerText = 'DENIED';
        });
    }

    // 📡 NETWORK INFORMATION API
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        const updateNet = () => {
            const el = document.getElementById('sensor-network');
            if (el) el.innerText = `${conn.effectiveType || '??'} ${conn.downlink ? conn.downlink + 'Mb' : ''}`;
        };
        updateNet();
        conn.addEventListener('change', updateNet);
    }

    // 🧠 DEVICE MEMORY API
    if (navigator.deviceMemory) {
        const el = document.getElementById('sensor-memory');
        if (el) el.innerText = `${navigator.deviceMemory}GB RAM`;
    }

    // 🕓 TIME-AWARE AUTO-MOOD
    const hour = new Date().getHours();
    let timeMood = 'electronic';
    let timeLabel = '';
    if (hour >= 0 && hour < 6) {
        timeMood = 'techno'; timeLabel = 'NIGHT OWL';
    } else if (hour >= 6 && hour < 10) {
        timeMood = 'ambient'; timeLabel = 'SUNRISE';
    } else if (hour >= 10 && hour < 14) {
        timeMood = 'electronic'; timeLabel = 'MIDDAY';
    } else if (hour >= 14 && hour < 18) {
        timeMood = 'experimental'; timeLabel = 'AFTERNOON';
    } else if (hour >= 18 && hour < 22) {
        timeMood = 'electronic'; timeLabel = 'GOLDEN HOUR';
    } else {
        timeMood = 'techno'; timeLabel = 'LATE NIGHT';
    }
    const tmEl = document.getElementById('sensor-time-mood');
    if (tmEl) tmEl.innerText = timeLabel;

    // Auto-set mood based on time if user hasn't manually chosen
    if (!localStorage.getItem('moskv_dj_mood')) {
        this.currentMood = timeMood;
        this.agentUI?.querySelectorAll('.dj-mood-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mood === timeMood);
        });
    }

    // 📱 DEVICE ORIENTATION (Waveform tilt effect on mobile)
    if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', (e) => {
            if (e.gamma !== null && this.waveformBars) {
                const tilt = Math.abs(e.gamma) / 90; // 0-1 normalized
                this.waveformBars.forEach((bar, i) => {
                    const offset = (i / this.waveformBars.length) * tilt * 60;
                    bar.style.transform = `translateY(${offset}px)`;
                });
            }
        });
    }
  }

  // 📦 TIKTOK PREFETCH: Pre-select next 2 tracks
  _prefetchNext() {
    const pool = this._getTracksForMood();
    this.prefetchQueue = [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(2, shuffled.length); i++) {
        this.prefetchQueue.push(shuffled[i]);
    }
    // Update UI
    for (let i = 0; i < 2; i++) {
        const el = document.getElementById(`dj-prefetch-${i+1}`);
        if (el && this.prefetchQueue[i]) {
            const title = window.DATA?.works?.find(w => w.id === this.prefetchQueue[i])?.title || this.prefetchQueue[i];
            el.innerText = title.substring(0, 12);
        } else if (el) {
            el.innerText = '---';
        }
    }
    // Pre-cue first prefetch on standby deck
    const standbyDeck = this.activeDeck === 'a' ? this.deckB : this.deckA;
    if (standbyDeck && this.prefetchQueue[0] && typeof standbyDeck.cueVideoById === 'function') {
        standbyDeck.cueVideoById(this.prefetchQueue[0]);
        console.log(`[MOSKV DJ] Prefetched: ${this.prefetchQueue[0]}`);
    }
  }

  _animateWaveform() {
    if (!this.waveformBars || this.waveformBars.length === 0) return;
    const animate = () => {
        this.waveformBars.forEach(bar => {
            const h = 5 + Math.random() * 95;
            bar.style.height = `${h}%`;
        });
        this._waveRaf = requestAnimationFrame(() => {
            setTimeout(animate, 80 + Math.random() * 60);
        });
    };
    animate();
  }

  _updateElapsed() {
    const elapsed = Math.floor((Date.now() - this.trackStartTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    const el = document.getElementById('dj-elapsed');
    if (el) el.innerText = `${mins}:${secs}`;

    // Progress bar (based on 40s mix interval)
    const progress = Math.min(100, (elapsed / (this.mixIntervalMs / 1000)) * 100);
    const fill = document.getElementById('dj-progress-fill');
    if (fill) fill.style.width = `${progress}%`;

    // Next In countdown
    const remaining = Math.max(0, Math.floor(this.mixIntervalMs / 1000) - elapsed);
    const rMins = String(Math.floor(remaining / 60)).padStart(2, '0');
    const rSecs = String(remaining % 60).padStart(2, '0');
    const nextEl = document.getElementById('dj-next-in');
    if (nextEl) nextEl.innerText = `${rMins}:${rSecs}`;
  }

  // 🎤 SYNTHETIC VOICE DJ (Spotify-style)
  _djSpeak(text) {
    if (!this.voiceEnabled) return;
    try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.95;
        utter.pitch = 0.8;
        utter.volume = 0.7;
        // Prefer English voice for DJ feel
        const voices = window.speechSynthesis.getVoices();
        const djVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Daniel')) 
                      || voices.find(v => v.lang.startsWith('en'))
                      || voices[0];
        if (djVoice) utter.voice = djVoice;
        window.speechSynthesis.speak(utter);
    } catch(e) {
        console.warn('[MOSKV DJ] Speech synthesis failed:', e);
    }
  }

  // 🎵 MOOD FILTER — Get tracks matching current mood
  _getTracksForMood() {
    if (!window.DATA?.works) return window.DATA?.videoThumbnails || [];
    
    let pool = window.DATA.works;
    if (this.currentMood !== 'all') {
        pool = pool.filter(w => w.categories && w.categories.includes(this.currentMood));
    }
    // Filter out recently played (avoid repeats)
    const ids = pool.map(w => w.id).filter(id => !this.playedTracks.includes(id));
    
    // If all played, reset history
    if (ids.length === 0) {
        this.playedTracks = [];
        localStorage.setItem('moskv_dj_history', '[]');
        return pool.map(w => w.id);
    }
    return ids;
  }

  // 📊 Record played track
  _recordTrack(trackId) {
    if (!this.playedTracks.includes(trackId)) {
        this.playedTracks.push(trackId);
        // Keep last 20 max
        if (this.playedTracks.length > 20) this.playedTracks.shift();
        localStorage.setItem('moskv_dj_history', JSON.stringify(this.playedTracks));
    }
  }

  scheduleNextMix() {
    if (this.autoMixTimer) clearTimeout(this.autoMixTimer);
    
    this.autoMixTimer = setTimeout(() => {
        if (this.isBackgroundPausedByEmbed) {
            // Check again shortly if paused by embed
            this.scheduleNextMix();
            return;
        }
        
        console.log("[CORTEX AutoDJ] Automated Sequence Interval Reached.");
        let nextTrack = null;
        if (this.mixSequence.length > 0) {
            nextTrack = this.mixSequence.shift();
        }
        this.triggerCrossfade(nextTrack);
    }, this.mixIntervalMs);
  }

  triggerCrossfade(forcedNextTrack = null) {
    if (this.isCrossfading || !this.deckA || !this.deckB) return;
    if (typeof this.deckA.getPlayerState !== 'function' || typeof this.deckB.getPlayerState !== 'function') return;

    if (this.autoMixTimer) clearTimeout(this.autoMixTimer);
    this.isCrossfading = true;

    const fromDeckId = this.activeDeck;
    const toDeckId = this.activeDeck === 'a' ? 'b' : 'a';
    
    const fromPlayer = fromDeckId === 'a' ? this.deckA : this.deckB;
    const toPlayer = toDeckId === 'a' ? this.deckA : this.deckB;

    const fromEl = document.getElementById(`bg-video-${fromDeckId}`);
    const toEl = document.getElementById(`bg-video-${toDeckId}`);

    const availableTracks = window.DATA.videoThumbnails;
    const moodPool = this._getTracksForMood();
    // Use prefetch queue if available (TikTok-style)
    let nextTrack;
    if (forcedNextTrack) {
        nextTrack = forcedNextTrack;
    } else if (this.prefetchQueue.length > 0) {
        nextTrack = this.prefetchQueue.shift();
    } else {
        nextTrack = moodPool[Math.floor(Math.random() * moodPool.length)] || availableTracks[Math.floor(Math.random() * availableTracks.length)];
    }
    this._recordTrack(nextTrack);
    // Immediately refill prefetch queue for NEXT transition
    this._prefetchNext();
    
    const nextBPM = this.getTrackBPM(nextTrack);
    console.log(`[CORTEX Auto-DJ] Syncing BPM: Master(${this.masterBPM}) <- Target(${nextBPM})`);
    
    // Calculate pitch/time-stretch ratio to match master tempo
    // YouTube API limits playback rates to certain floating points, but accepts generic numbers.
    // E.g., if Master is 130 and Next is 120, rate needs to be 130/120 = 1.083x
    const syncRate = Math.max(0.5, Math.min(2.0, this.masterBPM / nextBPM));

    // Increment mix counter & reset timer
    this.mixCount++;
    this.trackStartTime = Date.now();

    if (this.agentUI) {
        this.agentUI.classList.remove('idle');
        this.agentUI.classList.add('syncing');
        document.getElementById('dj-status-text').innerText = `BEATMATCHING → ${nextBPM} BPM`;
        document.getElementById('dj-mix-count').innerText = `MIX #${this.mixCount}`;
        
        const trackTitle = window.DATA?.works?.find(w => w.id === nextTrack)?.title || "INCOMING";
        document.getElementById(`dj-deck-${toDeckId}-ui`).querySelector('span:last-child').innerText = trackTitle.substring(0, 18);
        document.getElementById(`dj-deck-${toDeckId}-ui`).querySelector('span:first-child').innerText = `DK-${toDeckId.toUpperCase()} ▶`;
        document.getElementById(`dj-deck-${toDeckId}-ui`).classList.add('active');
        document.getElementById(`dj-deck-${fromDeckId}-ui`).querySelector('span:first-child').innerText = `DK-${fromDeckId.toUpperCase()} ⏸`;
        document.getElementById(`dj-deck-${fromDeckId}-ui`).classList.remove('active');
        
        // GSAP Wow: Glitch + Screen Shake + Hue Rotate
        if (typeof gsap !== 'undefined') {
             gsap.to(this.glitchOverlay, { opacity: 0.8, duration: 0.1, yoyo: true, repeat: 5 });
             gsap.to(document.body, { filter: 'hue-rotate(90deg)', duration: 0.15, yoyo: true, repeat: 2 });
             // Screen shake
             gsap.to('.video-container', { x: 5, duration: 0.05, yoyo: true, repeat: 8, ease: 'none',
                 onComplete: () => gsap.set('.video-container', { x: 0 })
             });
        }
        
        // 🎤 DJ Voice Announcement
        const moodLabel = this.currentMood === 'all' ? '' : ` ${this.currentMood} vibes.`;
        this._djSpeak(`Incoming. ${trackTitle}. ${nextBPM} B P M.${moodLabel} Syncing now.`);
    }

    toPlayer.mute();
    toPlayer.loadVideoById({videoId: nextTrack, startSeconds: 0});
    // Apply Harmonic Pitch & Rhythm Sync
    setTimeout(() => {
        if(typeof toPlayer.setPlaybackRate === 'function') {
           toPlayer.setPlaybackRate(syncRate);
        }
    }, 500);

    toPlayer.setVolume(0);
    toPlayer.playVideo();

    if (typeof gsap !== 'undefined') {
      setTimeout(() => {
        // Visual fade
        gsap.to(fromEl, { opacity: 0, duration: this.fadeDurationMs / 1000, ease: "power2.inOut" });
        gsap.to(toEl, { opacity: 1, duration: this.fadeDurationMs / 1000, ease: "power2.inOut" });
        
        // Audio fade
        if (!this.globalMuted) {
          toPlayer.unMute();
          const volProxy = { from: 100, to: 0 };
          gsap.to(volProxy, {
            from: 0,
            to: 100,
            duration: this.fadeDurationMs / 1000,
            ease: "none",
            onUpdate: () => {
              fromPlayer.setVolume(volProxy.from);
              toPlayer.setVolume(volProxy.to);
            },
            onComplete: () => {
              fromPlayer.pauseVideo();
              this.activeDeck = toDeckId;
              this.isCrossfading = false;
              if (this.agentUI) {
                  this.agentUI.classList.remove('syncing');
                  document.getElementById('dj-status-text').innerText = 'MIXING COMPLETE';
                  setTimeout(() => {
                      this.agentUI.classList.add('idle');
                      document.getElementById('dj-status-text').innerText = 'READY / IDLE';
                  }, 3000);
              }
              this.scheduleNextMix();
            }
          });
        } else {
          setTimeout(() => {
            fromPlayer.pauseVideo();
            this.activeDeck = toDeckId;
            this.isCrossfading = false;
            if (this.agentUI) {
                this.agentUI.classList.remove('syncing');
                document.getElementById('dj-status-text').innerText = 'MIXING COMPLETE';
                setTimeout(() => {
                    this.agentUI.classList.add('idle');
                    document.getElementById('dj-status-text').innerText = 'READY / IDLE';
                }, 3000);
            }
            this.scheduleNextMix();
          }, this.fadeDurationMs);
        }
      }, 1000); // Allow buffering and rate-setting
    }
  }

  bindEmbedListeners() {
    window.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.activeElement instanceof HTMLIFrameElement) {
          const iframe = document.activeElement;
          
          if (!iframe.id.includes('bg-video')) {
            console.log("[CORTEX] External Embed engaged. Pausing background A/V.");
            this.pauseBackgroundMusic();
          }
        }
      }, 100);
    });
    
    window.addEventListener('focus', () => {
       console.log("[CORTEX] Focus returned home. Checking resumption.");
       this.resumeBackgroundMusic();
    });
    
    const labs = document.querySelectorAll('.lab-card-content, .player-wrapper');
    labs.forEach(el => {
      el.addEventListener('click', () => {
        this.pauseBackgroundMusic();
      });
    });
  }

  pauseBackgroundMusic() {
    if (this.isBackgroundPausedByEmbed) return;
    this.isBackgroundPausedByEmbed = true;
    
    const activePlayer = this.activeDeck === 'a' ? this.deckA : this.deckB;
    if (activePlayer && typeof activePlayer.pauseVideo === 'function') {
      activePlayer.pauseVideo();
    }
  }

  resumeBackgroundMusic() {
    if (!this.isBackgroundPausedByEmbed) return;
    this.isBackgroundPausedByEmbed = false;
    
    if (!this.globalMuted) {
      const activePlayer = this.activeDeck === 'a' ? this.deckA : this.deckB;
      if (activePlayer && typeof activePlayer.playVideo === 'function') {
        activePlayer.playVideo();
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.autoDJAesthetic = new AutoDJAesthetic();
});
