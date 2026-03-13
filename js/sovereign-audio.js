/**
 * SOVEREIGN AUDIO — Dub Techno Drone Engine
 * Scroll-reactive, ducking-aware ambient audio for borjamoskv.com
 * Extracted from inline <script> for CSP compatibility.
 */

(function() {
  'use strict';

  let audioInitialized = false;

  document.body.addEventListener('click', function() {
    if (audioInitialized) return;
    audioInitialized = true;

    const initBtn = document.getElementById('sovereign-audio-init');
    if (initBtn) {
      initBtn.style.opacity = '0';
      setTimeout(() => initBtn.style.display = 'none', 300);
    }

    const ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();

    // ═══ MASTER CHAIN ═══
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -12;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.05;
    compressor.release.value = 0.25;

    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // ═══ 1. DEEP DUB TECHNO SUB-BASS (Porter Ricks Style) ═══
    const subOsc = ctx.createOscillator();
    const subOsc2 = ctx.createOscillator();
    const subFilter = ctx.createBiquadFilter();
    const subGain = ctx.createGain();

    subOsc.type = 'sine';
    subOsc2.type = 'triangle';
    subOsc.frequency.value = 41.2;
    subOsc2.frequency.value = 41.2;

    subFilter.type = 'lowpass';
    subFilter.frequency.value = 80;
    subFilter.Q.value = 2;

    const subLfo = ctx.createOscillator();
    const subLfoGain = ctx.createGain();
    subLfo.type = 'sine';
    subLfo.frequency.value = 0.03;
    subLfoGain.gain.value = 20;
    subLfo.connect(subLfoGain);
    subLfoGain.connect(subFilter.frequency);
    subLfo.start();

    subOsc.connect(subFilter);
    subOsc2.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start();
    subOsc2.start();

    // ═══ 2. RHYTHMIC NOISE / DUB CHORDS DELAY NETWORK ═══
    const noiseBufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const delayNode = ctx.createDelay(5);
    delayNode.delayTime.value = 0.75;
    const feedbackGain = ctx.createGain();
    feedbackGain.gain.value = 0.65;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'bandpass';
    delayFilter.frequency.value = 800;
    delayFilter.Q.value = 1.5;

    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayFilter);
    delayFilter.connect(delayNode);
    delayNode.connect(masterGain);

    function triggerNoiseChord() {
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;
      const arpFilter = ctx.createBiquadFilter();
      arpFilter.type = 'bandpass';
      arpFilter.frequency.value = 1200 + (Math.random() * 1000 - 500);
      arpFilter.Q.value = 8;
      const envGain = ctx.createGain();
      envGain.gain.setValueAtTime(0, ctx.currentTime);
      envGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      envGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      noiseSrc.connect(arpFilter);
      arpFilter.connect(envGain);
      envGain.connect(masterGain);
      envGain.connect(delayNode);
      noiseSrc.start(ctx.currentTime);
      noiseSrc.stop(ctx.currentTime + 0.5);
    }

    setInterval(() => {
      if (Math.random() > 0.4) {
        triggerNoiseChord();
        if (Math.random() > 0.7) {
          setTimeout(triggerNoiseChord, 375);
        }
      }
    }, 3000);

    // ═══ 3. SCROLL-REACTIVE MODULATION ═══
    let targetVolume = 0.35;
    const BASE_VOL = 0.15;
    const MAX_VOL = 0.6;
    const BASE_FILTER = 80;
    const MAX_FILTER = 200;

    function onScrollModulate() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      targetVolume = BASE_VOL + (scrollPct * (MAX_VOL - BASE_VOL));

      const filterTarget = BASE_FILTER + (scrollPct * (MAX_FILTER - BASE_FILTER));
      subFilter.frequency.setTargetAtTime(filterTarget, ctx.currentTime, 0.3);

      const fbTarget = 0.55 + (scrollPct * 0.25);
      feedbackGain.gain.setTargetAtTime(fbTarget, ctx.currentTime, 0.5);
    }
    window.addEventListener('scroll', onScrollModulate, { passive: true });
    onScrollModulate();

    // ═══ 4. AUDIO COORDINATION — Duck when others are active ═══
    let isDucked = false;

    function coordinationLoop() {
      const autoDJ = globalThis.autoDJAesthetic;
      const autoDJPlaying = autoDJ && !autoDJ.globalMuted && autoDJ.audioUnlocked;
      const spatialActive = typeof SpatialAudio !== 'undefined' && SpatialAudio.isActive;
      const shouldDuck = autoDJPlaying || spatialActive;

      if (shouldDuck && !isDucked) {
        isDucked = true;
        masterGain.gain.setTargetAtTime(targetVolume * 0.15, ctx.currentTime, 0.8);
      } else if (!shouldDuck && isDucked) {
        isDucked = false;
        masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 1.2);
      } else if (!shouldDuck && !isDucked) {
        masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.5);
      }
    }

    setInterval(coordinationLoop, 500);

    // Fade in gently on init
    masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime + 0.1, 2);

    // ═══ EXPOSE GLOBAL HANDLE ═══
    globalThis.dubDrone = {
      ctx,
      masterGain,
      subFilter,
      feedbackGain,
      mute: () => masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.3),
      unmute: () => masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 1),
      get isDucked() { return isDucked; },
    };
  }, { once: true });
})();
