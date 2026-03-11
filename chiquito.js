document.addEventListener('DOMContentLoaded', () => {
    // Inject the HTML for the easter egg
    const overlay = document.createElement('div');
    overlay.id = 'chiquito-overlay';
    overlay.innerHTML = `
        <div class="chiquito-content">
            <img src="borjarl.jpg" alt="Borjarl" class="borjarl-img">
            <div class="chiquito-text">"ESTO NO ES UNA WEB" ES UN SENTIMIENTO::: NO PUEDOOO PARaaaar</div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.innerHTML = `
        #chiquito-overlay {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85);
            z-index: 999999;
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            pointer-events: none;
        }
        .chiquito-content {
            text-align: center;
            transform: scale(0.1);
            opacity: 0;
            transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
        }
        #chiquito-overlay.active {
            display: flex;
            pointer-events: all;
        }
        #chiquito-overlay.active .chiquito-content {
            transform: scale(1) rotate(5deg);
            opacity: 1;
            animation: borjarlGlitch 0.2s infinite alternate;
        }
        .borjarl-img {
            max-width: 80vw;
            max-height: 50vh;
            margin-bottom: 20px;
            filter: contrast(150%) hue-rotate(90deg) saturate(300%);
            mix-blend-mode: screen;
            border-radius: 20px;
        }
        .chiquito-text {
            font-family: 'Courier New', Courier, monospace;
            font-size: 2.5rem;
            color: #ccff00;
            text-shadow: 0 0 10px #ccff00, 2px 2px 0px #ff003c;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 2px;
            padding: 0 20px;
        }
        @keyframes borjarlGlitch {
            0% { transform: scale(1.05) translate(4px, -4px) skewX(2deg); filter: hue-rotate(0deg); }
            100% { transform: scale(0.95) translate(-4px, 4px) skewX(-2deg); filter: hue-rotate(45deg); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    function triggerChiquito() {
        if(overlay.classList.contains('active')) return;
        
        // Visual
        overlay.classList.add('active');
        
        // Audio synthesis (Chiquito voice)
        const utterance = new SpeechSynthesisUtterance("Jarllll!! No puedo, no puedoooooo");
        utterance.lang = "es-ES";
        utterance.pitch = 1.5; // High pitch, glitchy
        utterance.rate = 1.3;
        window.speechSynthesis.speak(utterance);

        // Hide after some time
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 3500);
    }

    // Trigger randomly roughly every 45-60 secs, but ONLY sometimes
    setInterval(() => {
        // 15% chance to appear every check
        if(Math.random() > 0.85) {
            triggerChiquito();
        }
    }, 40000);
    
    // Expose for debugging or manual trigger
    window.triggerChiquito = triggerChiquito;
});
