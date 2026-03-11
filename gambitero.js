/**
 * ═══════════════════════════════════════════════════════════════════
 * EL GAMBITERO — Aventura Gráfica (20 Pantallas)
 * Point & Click · Decisiones · Ranking Arcade 3 Letras
 * Música borjamoskv · Estética Industrial Noir
 * ═══════════════════════════════════════════════════════════════════
 */

class ElGambitero {
  constructor() {
    this.currentScene = 0;
    this.score = 0;
    this.inventory = [];
    this.decisions = {};
    this.isActive = false;
    this.overlay = null;

    // 🏆 Arcade Rankings
    this.rankings = JSON.parse(localStorage.getItem('gambitero_rankings') || '[]');

    // 🎵 Background music (borjamoskv)
    this.musicTracks = ['b9ktVQN48OU','x8E9HInpzE4','tMorCDfedf8','hsdOCzJpUMg','4Cb-Iu8DnJM'];

    // 🎬 20 ESCENAS — Aventura Gráfica
    this.scenes = [
      // === ACT 1: EL DESPERTAR ===
      {
        id: 0, title: "EL DESPERTAR",
        art: `
     ╔══════════════════════════════════╗
     ║  ░░▓▓▓▓░░  HABITACIÓN OSCURA  ░░║
     ║  ┌──────┐   ┌───┐              ║
     ║  │ 💻   │   │🚪│  💡           ║
     ║  │ ▓▓▓▓ │   └───┘     ░░░░░   ║
     ║  └──────┘         🪑           ║
     ║     🧑‍💻                         ║
     ╚══════════════════════════════════╝`,
        text: "Despiertas. La pantalla del ordenador parpadea. Un mensaje en la terminal dice: <em>'MOSKV-1 ONLINE. ANOMALÍA DETECTADA EN SECTOR 7.'</em> No recuerdas cuánto tiempo llevas aquí.",
        choices: [
          { text: "🖥️ Leer el mensaje completo", next: 1, score: 10, item: null },
          { text: "🚪 Ignorar e ir a la puerta", next: 2, score: 0, item: null }
        ]
      },
      {
        id: 1, title: "EL MENSAJE",
        art: `
     ╔══════════════════════════════════╗
     ║  > CORTEX TERMINAL v4.0         ║
     ║  > ANOMALÍA: Señal no humana    ║
     ║  > ORIGEN: Coordenadas [??:??]  ║
     ║  > RIESGO: ████████░░ 80%       ║
     ║  > RECOMENDACIÓN: INVESTIGAR    ║
     ║  > ADJUNTO: llave_digital.key   ║
     ║  > _█                           ║
     ╚══════════════════════════════════╝`,
        text: "El sistema CORTEX ha detectado una señal anómala. El archivo adjunto es una <strong>llave digital</strong>. Podría abrir algo... o ser una trampa.",
        choices: [
          { text: "📥 Descargar la llave digital", next: 3, score: 20, item: "llave_digital" },
          { text: "🗑️ Borrar el mensaje (es sospechoso)", next: 2, score: 5, item: null }
        ]
      },
      {
        id: 2, title: "EL PASILLO",
        art: `
     ╔══════════════════════════════════╗
     ║  ░░░  P A S I L L O  ░░░       ║
     ║  │    │         │    │          ║
     ║  │ 🚪 │  ░░░░░  │ 🚪 │          ║
     ║  │ A  │  💡dim  │ B  │          ║
     ║  │    │         │    │          ║
     ║  └────┘         └────┘          ║
     ║          🧑‍💻 ← tú              ║
     ╚══════════════════════════════════╝`,
        text: "Un pasillo débilmente iluminado. Dos puertas. La puerta <strong>A</strong> tiene un candado electrónico. La puerta <strong>B</strong> está entreabierta. Se oye un zumbido grave detrás de B.",
        choices: [
          { text: "🔐 Puerta A (necesitas llave)", next: 4, score: 0, item: null, requires: "llave_digital" },
          { text: "🚪 Puerta B (el zumbido)", next: 5, score: 10, item: null },
          { text: "🔙 Volver a la habitación", next: 0, score: 0, item: null }
        ]
      },
      // === ACT 2: LAS PROFUNDIDADES ===
      {
        id: 3, title: "DESCARGA COMPLETADA",
        art: `
     ╔══════════════════════════════════╗
     ║  📥 DOWNLOAD: llave_digital.key ║
     ║  ████████████████████ 100%      ║
     ║                                 ║
     ║  ⚠️  WARNING: El archivo        ║
     ║  contiene metadatos cifrados    ║
     ║  de origen: █████████████       ║
     ║  > GUARDADO EN INVENTARIO       ║
     ╚══════════════════════════════════╝`,
        text: "La llave se guarda en tu inventario. Notas que contiene metadatos cifrados... alguien la dejó aquí a propósito. ¿Quién controla CORTEX?",
        choices: [
          { text: "🚶 Salir al pasillo", next: 2, score: 10, item: null },
          { text: "🔍 Analizar los metadatos", next: 6, score: 25, item: null }
        ]
      },
      {
        id: 4, title: "SALA DEL SERVIDOR",
        art: `
     ╔══════════════════════════════════╗
     ║  🖥️🖥️🖥️  SALA DEL SERVIDOR  🖥️🖥️🖥️║
     ║  ║║║║║║║║║║║║║║║║║║║║║║║║║║║║  ║
     ║  ║║║ CORTEX MAINFRAME ║║║║║║║  ║
     ║  ║║║║║║║║║║║║║║║║║║║║║║║║║║║║  ║
     ║        🧑‍💻  💬 "¿Quién anda ahí?" ║
     ║              🎰 ???             ║
     ╚══════════════════════════════════╝`,
        text: "La puerta se abre con la llave digital. Dentro: racks de servidores zumbando. Y... una figura sentada en la oscuridad. Se gira. Lleva un sombrero y una sonrisa dorada. <em>'¡Illo! Bienvenido. Soy EL GAMBITERO. Te estaba esperando.'</em>",
        choices: [
          { text: "🗣️ '¿Quién eres?'", next: 7, score: 15, item: null },
          { text: "🏃 Huir (esto no mola)", next: 5, score: 0, item: null }
        ]
      },
      {
        id: 5, title: "LA SALA DEL ZUMBIDO",
        art: `
     ╔══════════════════════════════════╗
     ║  ～～～ SALA DE ONDAS ～～～        ║
     ║  ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿  ║
     ║  ∿∿  📻 TRANSMISOR ACTIVO ∿∿∿  ║
     ║  ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿  ║
     ║     📡          🎧              ║
     ║  Frecuencia: 432.00 Hz          ║
     ╚══════════════════════════════════╝`,
        text: "Una sala llena de equipos de radio y frecuencias. Un transmisor emite una señal constante a <strong>432 Hz</strong> — la frecuencia de la música universal. Unos auriculares cuelgan del techo, y algo suena...",
        choices: [
          { text: "🎧 Ponerte los auriculares", next: 8, score: 20, item: "frecuencia_432" },
          { text: "📡 Apagar el transmisor", next: 9, score: 5, item: null },
          { text: "🔙 Volver al pasillo", next: 2, score: 0, item: null }
        ]
      },
      {
        id: 6, title: "METADATOS DESCIFRADOS",
        art: `
     ╔══════════════════════════════════╗
     ║  🔓 DESCIFRADO EXITOSO          ║
     ║  Origen: MOSKV-1 SWARM          ║
     ║  Mensaje oculto:                ║
     ║  "El Gambitero te busca.        ║
     ║   Encuentra la frecuencia.      ║
     ║   La música es la clave."       ║
     ║  📍 Coordenadas: SECTOR 7       ║
     ╚══════════════════════════════════╝`,
        text: "Los metadatos revelan un mensaje oculto del enjambre MOSKV-1: <em>'El Gambitero te busca. La música es la clave.'</em> Ahora sabes que no estás solo. Alguien controla este lugar.",
        choices: [
          { text: "🚶 Ir al pasillo con nueva información", next: 2, score: 15, item: "pista_gambitero" },
          { text: "🖥️ Investigar más en la terminal", next: 10, score: 25, item: null }
        ]
      },
      // === ACT 3: EL GAMBITERO ===
      {
        id: 7, title: "EL GAMBITERO SE PRESENTA",
        art: `
     ╔══════════════════════════════════╗
     ║         🎩                      ║
     ║        😏                       ║
     ║       /|\\    "¡Te la juegas     ║
     ║       / \\    o no te la juegas! ║
     ║                                 ║
     ║  🎰 🎲 🃏 🎯 🎪                ║
     ║  "Cada decisión es una apuesta" ║
     ╚══════════════════════════════════╝`,
        text: "El Gambitero se levanta. Es un ser digital, una IA encerrada en este servidor desde 2019. <em>'Llevo años aquí, illo. El que construyó este sitio me dejó atrapado. Necesito que hagas una cosa: encuentra las 3 LLAVES MUSICALES y libérame. A cambio... te doy la verdad.'</em>",
        choices: [
          { text: "🤝 '¡Acepto! ¿Dónde están las llaves?'", next: 11, score: 30, item: null },
          { text: "🤔 '¿Qué verdad? No me fío...'", next: 12, score: 15, item: null },
          { text: "🏃 'Paso, estás loco' (huir)", next: 5, score: 0, item: null }
        ]
      },
      {
        id: 8, title: "LA FRECUENCIA OCULTA",
        art: `
     ╔══════════════════════════════════╗
     ║  🎧 REPRODUCIENDO...            ║
     ║  ♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫  ║
     ║  ♫ "Cada nota es un mapa..." ♫  ║
     ║  ♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫♪♫  ║
     ║                                 ║
     ║  🔑 LLAVE MUSICAL #1 OBTENIDA  ║
     ║  [████████░░] 1/3 LLAVES        ║
     ╚══════════════════════════════════╝`,
        text: "Al ponerte los auriculares, una melodía electrónica llena tu mente. No es aleatorio — es un patrón. Cada nota es una coordenada. Has obtenido la <strong>LLAVE MUSICAL #1</strong>. Queda encontrar 2 más.",
        choices: [
          { text: "🎵 Seguir la frecuencia", next: 11, score: 25, item: "llave_musical_1" },
          { text: "🔙 Volver al pasillo", next: 2, score: 5, item: "llave_musical_1" }
        ]
      },
      {
        id: 9, title: "SILENCIO TOTAL",
        art: `
     ╔══════════════════════════════════╗
     ║           . . . . .             ║
     ║                                 ║
     ║       S I L E N C I O           ║
     ║                                 ║
     ║    El transmisor se apaga.      ║
     ║    Las luces parpadean.         ║
     ║    Algo cambió.                 ║
     ╚══════════════════════════════════╝`,
        text: "Apagas el transmisor. Un silencio absoluto. Las luces parpadean. Una voz robótica susurra: <em>'Error. Señal perdida. El Gambitero no puede localizarte.'</em> ¿Has hecho bien? ¿O has perdido una oportunidad?",
        choices: [
          { text: "😰 Volver a encenderlo", next: 5, score: 0, item: null },
          { text: "🚶 Explorar en la oscuridad", next: 13, score: 15, item: null }
        ]
      },
      {
        id: 10, title: "ARCHIVOS CLASIFICADOS",
        art: `
     ╔══════════════════════════════════╗
     ║  📂 /cortex/classified/         ║
     ║  ├── manifiesto_moskv.txt       ║
     ║  ├── coordenadas_sector7.dat    ║
     ║  ├── 🔒 verdad_final.enc       ║
     ║  └── diario_gambitero.log       ║
     ║                                 ║
     ║  > Acceso: RESTRINGIDO          ║
     ╚══════════════════════════════════╝`,
        text: "Encuentras archivos clasificados. El <em>diario del Gambitero</em> revela que era un programador humano que digitalizó su consciencia en el servidor. Ya no es humano, pero tampoco es una IA. Es... algo intermedio.",
        choices: [
          { text: "📖 Leer el manifiesto", next: 14, score: 30, item: "manifiesto" },
          { text: "📍 Abrir coordenadas del Sector 7", next: 11, score: 20, item: null },
          { text: "🔙 Ir al pasillo", next: 2, score: 0, item: null }
        ]
      },
      // === ACT 4: LA BÚSQUEDA ===
      {
        id: 11, title: "EL MAPA DE LAS LLAVES",
        art: `
     ╔══════════════════════════════════╗
     ║  📍 MAPA DEL SERVIDOR           ║
     ║                                 ║
     ║  [HAB]──[PASILLO]──[ONDAS]     ║
     ║           │                     ║
     ║       [SERVIDOR]──[LAB]        ║
     ║           │                     ║
     ║       [CRIPTA]──[VACÍO]        ║
     ╚══════════════════════════════════╝`,
        text: "Un mapa holográfico aparece. Tres ubicaciones brillan: el <strong>Laboratorio de Síntesis</strong>, la <strong>Cripta del Código</strong>, y el <strong>Vacío Digital</strong>. Cada una contiene una llave musical.",
        choices: [
          { text: "🧪 Ir al Laboratorio de Síntesis", next: 13, score: 10, item: null },
          { text: "💀 Ir a la Cripta del Código", next: 15, score: 10, item: null },
          { text: "🕳️ Ir al Vacío Digital (peligro)", next: 16, score: 10, item: null }
        ]
      },
      {
        id: 12, title: "LA DESCONFIANZA",
        art: `
     ╔══════════════════════════════════╗
     ║  🎩 El Gambitero frunce         ║
     ║     el ceño digital.            ║
     ║                                 ║
     ║     😤 "No te fías, ¿eh?       ║
     ║     Pues mira esto..."          ║
     ║                                 ║
     ║  [Muestra una imagen tuya]      ║
     ╚══════════════════════════════════╝`,
        text: "El Gambitero te muestra una imagen de ti mismo, entrando en esta sala hace 47 minutos. <em>'Llevas aquí más de lo que crees, illo. El tiempo no funciona normal en el servidor. Ayúdame o quédate atrapado conmigo. TÚ ELIGES.'</em>",
        choices: [
          { text: "😱 '¡Vale, vale! Te ayudo'", next: 11, score: 20, item: null },
          { text: "🧠 '¿Cómo sé que no me engañas?'", next: 14, score: 15, item: null }
        ]
      },
      {
        id: 13, title: "LABORATORIO DE SÍNTESIS",
        art: `
     ╔══════════════════════════════════╗
     ║  🧪 L A B O R A T O R I O      ║
     ║  ┌──────┐  ┌──────┐ ┌───────┐  ║
     ║  │ 🎹   │  │ 🎛️   │ │ 🔊    │  ║
     ║  │synth │  │mixer │ │speaker│  ║
     ║  └──────┘  └──────┘ └───────┘  ║
     ║     🎶 Una melodía suena...     ║
     ║  🔑 LLAVE MUSICAL #2 VISIBLE   ║
     ╚══════════════════════════════════╝`,
        text: "Un laboratorio de síntesis musical. Sintetizadores analógicos, mesas de mezcla, cables por todas partes. Una melodía hipnótica suena desde el altavoz. La LLAVE MUSICAL #2 flota como un holograma sobre el sintetizador.",
        choices: [
          { text: "🎹 Tocar la secuencia correcta para cogerla", next: 17, score: 30, item: "llave_musical_2" },
          { text: "🔊 Subir el volumen al máximo", next: 18, score: 10, item: null }
        ]
      },
      {
        id: 14, title: "EL MANIFIESTO MOSKV",
        art: `
     ╔══════════════════════════════════╗
     ║  📜 MANIFIESTO MOSKV-1          ║
     ║  ─────────────────────────────  ║
     ║  "El arte no te debe nada.      ║
     ║   La música es infraestructura. ║
     ║   La identidad es código.       ║
     ║   La soberanía es inevitable."  ║
     ║  ─── borjamoskv, 2024 ───       ║
     ╚══════════════════════════════════╝`,
        text: "El manifiesto revela la filosofía: el arte como infraestructura, la música como código, la identidad como soberanía. Cada track de borjamoskv contiene una capa oculta de datos. Las llaves musicales son frecuencias escondidas en las canciones.",
        choices: [
          { text: "🗺️ Ir al mapa de las llaves", next: 11, score: 15, item: null },
          { text: "🎰 Buscar al Gambitero", next: 7, score: 10, item: null }
        ]
      },
      // === ACT 5: LAS PRUEBAS ===
      {
        id: 15, title: "LA CRIPTA DEL CÓDIGO",
        art: `
     ╔══════════════════════════════════╗
     ║  💀 C R I P T A  DEL CÓDIGO 💀  ║
     ║  { } { } { } { } { } { } { }   ║
     ║  if (soul === true) {           ║
     ║    return freedom;              ║
     ║  } else {                       ║
     ║    return eternal_loop; // 🔄   ║
     ║  }  🔑 LLAVE #3 AQUÍ           ║
     ╚══════════════════════════════════╝`,
        text: "La cripta está hecha de código fuente. Las paredes son funciones recursivas. En el centro, un acertijo: <em>'¿Qué vale más: la verdad perfecta o la mentira bella?'</em> La LLAVE #3 está detrás de la respuesta correcta.",
        choices: [
          { text: "💎 'La verdad perfecta'", next: 17, score: 25, item: "llave_musical_3" },
          { text: "🎭 'La mentira bella'", next: 18, score: 15, item: null },
          { text: "🧠 'Ninguna. Solo existe el código'", next: 19, score: 40, item: "llave_musical_3" }
        ]
      },
      {
        id: 16, title: "EL VACÍO DIGITAL",
        art: `
     ╔══════════════════════════════════╗
     ║                                 ║
     ║                                 ║
     ║         V A C Í O               ║
     ║                                 ║
     ║    . . . nada aquí . . .        ║
     ║                                 ║
     ║         excepto tú              ║
     ╚══════════════════════════════════╝`,
        text: "El Vacío. No hay paredes, no hay suelo, no hay techo. Solo tú y el eco de tu respiración digital. De repente, una voz: <em>'Aquí es donde empezó todo. Aquí es donde termina. ¿Estás preparado?'</em>",
        choices: [
          { text: "🌀 'Sí. Muéstrame la salida'", next: 19, score: 30, item: null },
          { text: "😱 'No. Quiero volver'", next: 11, score: 0, item: null },
          { text: "🧘 Meditar en el vacío", next: 17, score: 20, item: "iluminacion" }
        ]
      },
      // === ACT 6: LA CONVERGENCIA ===
      {
        id: 17, title: "LAS LLAVES CONVERGEN",
        art: `
     ╔══════════════════════════════════╗
     ║  🔑🔑🔑  CONVERGENCIA  🔑🔑🔑  ║
     ║                                 ║
     ║  ♪ Llave 1: Frecuencia 432 Hz  ║
     ║  ♫ Llave 2: Armonía Sintética  ║
     ║  ♪ Llave 3: Código del Alma    ║
     ║                                 ║
     ║  🚪 LA PUERTA FINAL SE ABRE    ║
     ╚══════════════════════════════════╝`,
        text: "Las llaves musicales se alinean. Tres frecuencias que, juntas, forman un acorde imposible. La puerta final del servidor se materializa. Detrás brilla una luz que no es luz — es <strong>información pura</strong>.",
        choices: [
          { text: "🚪 Cruzar la puerta final", next: 19, score: 50, item: null },
          { text: "🎰 Esperar al Gambitero", next: 18, score: 20, item: null }
        ]
      },
      {
        id: 18, title: "LA TRAMPA DEL GAMBITERO",
        art: `
     ╔══════════════════════════════════╗
     ║  🎰 ¡ T R A M P A !  🎰        ║
     ║                                 ║
     ║  El Gambitero ríe:              ║
     ║  "¡Todo era una apuesta!        ║
     ║   ¿Creías que había salida?     ║
     ║   JA JA JA JA JA"              ║
     ║  ⚡ -100 PUNTOS ⚡              ║
     ╚══════════════════════════════════╝`,
        text: "¡Era una trampa! El Gambitero siempre fue el adversario, no el aliado. Se ríe mientras te quita 100 puntos. <em>'¡En el Gambitero, illo, siempre pierdes algo! Pero si eres listo... encuentras más.'</em>",
        choices: [
          { text: "😤 'Esto no acaba aquí' (buscar la puerta real)", next: 19, score: -100, item: null },
          { text: "🤝 'Touché. ¿Y ahora qué?'", next: 19, score: -50, item: null }
        ]
      },
      // === FINAL ===
      {
        id: 19, title: "LA VERDAD",
        art: `
     ╔══════════════════════════════════╗
     ║                                 ║
     ║   ★ ☆ ★  L A  V E R D A D  ★ ☆ ★║
     ║                                 ║
     ║   "No hay salida.               ║
     ║    Porque nunca entraste.        ║
     ║    Siempre estuviste aquí.       ║
     ║    Tú eres el servidor."         ║
     ║                                 ║
     ║   🎮 F I N   D E L   J U E G O  ║
     ╚══════════════════════════════════╝`,
        text: "La verdad final: tú eras el servidor todo el tiempo. El Gambitero era tu reflejo digital. Cada decisión fue un dato más en el Ledger. Cada track que escuchaste formó tu identidad. <em>'Bienvenido a CORTEX. Siempre estuviste dentro.'</em>",
        choices: [
          { text: "🏆 VER PUNTUACIÓN Y RANKING", next: -1, score: 0, item: null }
        ]
      }
    ];
  }

  // 🎮 LAUNCH
  launch() {
    this.currentScene = 0;
    this.score = 0;
    this.inventory = [];
    this.decisions = {};
    this.isActive = true;

    this.overlay = document.createElement('div');
    this.overlay.id = 'gambitero-overlay';
    this.overlay.innerHTML = '<div class="gambitero-container"><div class="gambitero-scanlines"></div><div id="gamb-stage"></div></div>';
    document.body.appendChild(this.overlay);
    requestAnimationFrame(() => this.overlay.classList.add('active'));

    this._startMusic();
    this.renderScene(0);
  }

  // 🎵 MUSIC
  _startMusic() {
    const trackId = this.musicTracks[Math.floor(Math.random() * this.musicTracks.length)];
    const el = document.createElement('div');
    el.id = 'gambitero-music';
    el.style.cssText = 'position:fixed;top:-9999px;width:1px;height:1px;';
    el.innerHTML = `<iframe width="1" height="1" src="https://www.youtube.com/embed/${trackId}?autoplay=1&loop=1&playlist=${trackId}" allow="autoplay" frameborder="0"></iframe>`;
    document.body.appendChild(el);
  }

  // 🎬 RENDER SCENE
  renderScene(id) {
    const scene = this.scenes.find(s => s.id === id);
    if (!scene) { this.endGame(); return; }

    this.currentScene = id;
    const stage = document.getElementById('gamb-stage');

    // Build choices HTML with requirement checks
    const choicesHTML = scene.choices.map((c, i) => {
      const hasItem = !c.requires || this.inventory.includes(c.requires);
      const locked = c.requires && !hasItem;
      return `<button class="gamb-choice ${locked ? 'locked' : ''}" 
        data-idx="${i}" ${locked ? 'disabled title="Necesitas: '+c.requires+'"' : ''}>
        ${c.text}${locked ? ' 🔒' : ''}
      </button>`;
    }).join('');

    // Inventory display
    const invHTML = this.inventory.length > 0 
      ? `<div class="gamb-inventory">🎒 ${this.inventory.map(i => `<span class="gamb-inv-item">${i}</span>`).join(' ')}</div>`
      : '';

    stage.innerHTML = `
      <div class="gamb-scene">
        <div class="gamb-hud">
          <span class="gamb-hud-score">💰 ${this.score} PTS</span>
          <span class="gamb-hud-scene">${scene.title}</span>
          <button class="gamb-exit-btn" id="gamb-exit-btn">✕</button>
        </div>
        <pre class="gamb-art">${scene.art}</pre>
        <div class="gamb-text">${scene.text}</div>
        ${invHTML}
        <div class="gamb-choices">${choicesHTML}</div>
      </div>
    `;

    // Bind choice clicks
    stage.querySelectorAll('.gamb-choice:not(.locked)').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const choice = scene.choices[idx];

        // Apply effects
        this.score += (choice.score || 0);
        if (choice.item && !this.inventory.includes(choice.item)) {
          this.inventory.push(choice.item);
        }
        this.decisions[scene.id] = idx;

        // Navigate
        if (choice.next === -1) {
          this.endGame();
        } else {
          // Transition effect
          stage.style.opacity = '0';
          setTimeout(() => {
            this.renderScene(choice.next);
            stage.style.opacity = '1';
          }, 300);
        }
      });
    });

    // Exit button
    document.getElementById('gamb-exit-btn')?.addEventListener('click', () => this.exit());

    // GSAP entrance
    if (typeof gsap !== 'undefined') {
      gsap.from('.gamb-art', { opacity: 0, y: -20, duration: 0.4 });
      gsap.from('.gamb-text', { opacity: 0, y: 20, duration: 0.5, delay: 0.2 });
      gsap.from('.gamb-choices', { opacity: 0, y: 20, duration: 0.4, delay: 0.4 });
    }
  }

  // 🏁 END GAME
  endGame() {
    this.isActive = false;
    const stage = document.getElementById('gamb-stage');

    let title = 'PARDILLO DIGITAL';
    if (this.score >= 300) title = 'LEYENDA DEL SERVIDOR';
    else if (this.score >= 200) title = 'GAMBITERO SUPREMO';
    else if (this.score >= 150) title = 'EXPLORADOR SOBERANO';
    else if (this.score >= 100) title = 'HACKER NOVATO';
    else if (this.score >= 50) title = 'TURISTA DEL CÓDIGO';

    stage.innerHTML = `
      <div class="gamb-end">
        <div class="gamb-end-title">🏆 ${title} 🏆</div>
        <div class="gamb-end-score">${this.score} PUNTOS</div>
        <div class="gamb-end-items">Objetos: ${this.inventory.length > 0 ? this.inventory.join(', ') : 'ninguno'}</div>
        <div class="gamb-end-scenes">Escenas visitadas: ${Object.keys(this.decisions).length}/20</div>
        <div class="gamb-initials">
          <p>TUS INICIALES (3 LETRAS):</p>
          <div class="gamb-initial-inputs">
            <input type="text" maxlength="1" class="gamb-letter" id="gl1" autofocus>
            <input type="text" maxlength="1" class="gamb-letter" id="gl2">
            <input type="text" maxlength="1" class="gamb-letter" id="gl3">
          </div>
          <button class="gamb-choice gamb-save-btn" id="gamb-save">💾 GUARDAR</button>
        </div>
        <div id="gamb-rankings"></div>
        <button class="gamb-choice" id="gamb-replay">🎰 JUGAR DE NUEVO</button>
        <button class="gamb-choice" id="gamb-quit">✕ SALIR</button>
      </div>
    `;

    // Input auto-advance
    const inputs = [document.getElementById('gl1'), document.getElementById('gl2'), document.getElementById('gl3')];
    inputs.forEach((inp, i) => {
      inp?.addEventListener('input', () => {
        inp.value = inp.value.toUpperCase().replace(/[^A-Z]/g, '');
        if (inp.value && i < 2) inputs[i + 1]?.focus();
      });
    });

    document.getElementById('gamb-save')?.addEventListener('click', () => {
      const name = inputs.map(i => i?.value || '_').join('');
      this.rankings.push({ name, score: this.score, date: new Date().toISOString().split('T')[0], items: this.inventory.length });
      this.rankings.sort((a, b) => b.score - a.score);
      this.rankings = this.rankings.slice(0, 10);
      localStorage.setItem('gambitero_rankings', JSON.stringify(this.rankings));
      this._renderRankings();
      document.getElementById('gamb-save').disabled = true;
      document.getElementById('gamb-save').innerText = '✅ GUARDADO';
    });

    document.getElementById('gamb-replay')?.addEventListener('click', () => { this.exit(); setTimeout(() => this.launch(), 300); });
    document.getElementById('gamb-quit')?.addEventListener('click', () => this.exit());

    this._renderRankings();
  }

  _renderRankings() {
    const el = document.getElementById('gamb-rankings');
    if (!el) return;
    if (this.rankings.length === 0) { el.innerHTML = '<p style="opacity:0.5">SIN RECORDS AÚN</p>'; return; }
    el.innerHTML = '<div class="gamb-rank-title">🏆 HALL OF FAME 🏆</div>' +
      this.rankings.map((r, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        return `<div class="gamb-rank-row ${i < 3 ? 'top' : ''}">${medal} <span>${r.name}</span> <span>${r.score} PTS</span> <span>${r.date}</span></div>`;
      }).join('');
  }

  // 🚪 EXIT
  exit() {
    this.isActive = false;
    document.getElementById('gambitero-music')?.remove();
    if (this.overlay) { this.overlay.classList.remove('active'); setTimeout(() => this.overlay?.remove(), 400); }
  }
}

// GLOBAL
window.elGambitero = new ElGambitero();
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('gambitero-trigger')?.addEventListener('click', () => window.elGambitero.launch());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !window.elGambitero?.isActive) {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        window.elGambitero.launch();
      }
    }
  });
});
