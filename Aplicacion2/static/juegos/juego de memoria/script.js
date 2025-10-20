// ==== Juego de Memoria (versión pares sin vidas) ====
// Requisitos actuales: ingreso de nombre, rankings por dificultad (mejor tiempo),
// dificultades 2x2 / 4x4 / 6x6, tiempo libre (sin límite ni vidas), cartas con emojis, reverso con texto.

// Estado global
let jugadorActual = null; // { nombre }
let dificultadActual = null; // 'facil' | 'medio' | 'dificil'
// Sin sistema de vidas en esta versión
// let vidasRestantes = null;
let timerInterval = null;
let inicioTiempo = null;
let tableroBloqueado = false;
let primeraCarta = null;
let parejasEncontradas = 0;
let totalParejas = 0;
let rankingMemoria = { facil: [], medio: [], dificil: [] }; // cada item: { nombre, tiempoSeg }

// Configuración por dificultad
const configDificultad = {
    facil: { size: 2 },   // 4 cartas -> 2 parejas
    medio: { size: 4 },   // 16 cartas -> 8 parejas
    dificil: { size: 6 }  // 36 cartas -> 18 parejas
};

// Conjunto amplio y variado de emojis (caras, animales, comida, objetos, deportes, naturaleza, símbolos)
const EMOJIS = [
    // Caras
    '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😍','🥰','😘','😗','😙','😚','😋','😜','🤪','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤨','😐','😑','😶','😴','🤤','😪','😵','🤒','🤕','🤢','🤮','🤧','😷','🥴','😈','👿','�','�','🤖','🎃','�','🤡','�','�','🙉','🙊',
    // Animales
    '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦂','🐢','🐍','🦎','🐙','🦑','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🐇','🐁','🐀','🐿️','🦔',
    // Comida
    '🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🍞','🥖','🥨','🥯','🧀','🥚','🍳','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🧆','🌮','🌯','🥗','🥘','🍝','🍜','🍲','🍛','🍣','🍤','🍚','🍱','🥟','🦪','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🍼','🥤','☕','🍵','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾','🧊',
    // Objetos / Otros
    '⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥅','🥊','🥋','🎯','⛳','🪁','🎣','🤿','🎽','🛹','🛼','🛶','🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🚚','🚛','🚜','🛵','🏍️','🚲','🛴','✈️','🛩️','🚀','🛸','🚁','⛵','🚢','⚓','🧭','⏰','⏳','⌛','💎','🪙','💰','📱','💻','🖥️','🖱️','⌨️','💡','🔦','📷','🎥','📺','📻','🎙️','🎚️','🎛️','🧸','🎁','🎈','🎀','🧨','🎉','🎊','🎎','🏮','🎐','🪔','🔮','🧿','🪄','🧰','🧲','🛠️','⚙️','🧪','🧬','🔭','📡','💣','🪓','🔧','🔩','⚖️','🧱',
    // Símbolos / Naturaleza extra
    '🌍','🌎','🌏','🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌙','⭐','🌟','✨','⚡','🔥','🌪️','🌈','☁️','⛅','🌤️','🌥️','🌦️','🌧️','⛈️','🌩️','❄️','☃️','⛄','🌊','💧','💦','🌱','🌿','☘️','🍀','🎄','🌸','🌹','🌺','🌻','🌼','🌷','💐'
];

// ====== Inicialización ======
window.addEventListener('DOMContentLoaded', () => {
    cargarRankings();
    renderizarRankings();
    inicializarEfectosMouse();
});

function inicializarEfectosMouse(){
    const trail = document.getElementById('mouseTrail');
    document.addEventListener('mousemove', e => {
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
    });
}

// ====== Navegación ======
function validarNombre(){
    const nombre = document.getElementById('nombreJugador').value.trim();
    document.getElementById('btnContinuar').disabled = nombre.length === 0;
}

function continuarDificultades(){
    const nombre = document.getElementById('nombreJugador').value.trim();
    if(!nombre) return;
    jugadorActual = { nombre };
    document.getElementById('pantalla-inicio').classList.add('hidden');
    document.getElementById('pantalla-dificultad').classList.remove('hidden');
}

function volverInicio(){
    detenerTimer();
    dificultadActual = null;
    jugadorActual = jugadorActual ? jugadorActual : null; // mantiene nombre si se quiere
    document.getElementById('pantalla-juego').classList.add('hidden');
    document.getElementById('pantalla-dificultad').classList.add('hidden');
    document.getElementById('pantalla-inicio').classList.remove('hidden');
    cerrarModalFin();
    reiniciarTableroVisual();
    renderizarRankings();
}

function volverDificultades(){
    detenerTimer();
    document.getElementById('pantalla-juego').classList.add('hidden');
    document.getElementById('pantalla-dificultad').classList.remove('hidden');
    cerrarModalFin();
    reiniciarTableroVisual();
}

// ====== Juego ======
// Variables de grupos eliminadas; se usa lógica clásica de pares
function seleccionarDificultad(dif){
    dificultadActual = dif;
    document.getElementById('pantalla-dificultad').classList.add('hidden');
    document.getElementById('pantalla-juego').classList.remove('hidden');
    iniciarPartida();
}

function iniciarPartida(){
    const cfg = configDificultad[dificultadActual];
    parejasEncontradas = 0;
    primeraCarta = null;
    tableroBloqueado = true; // bloqueado durante vista previa
    const size = cfg.size;
    totalParejas = (size * size) / 2;
    document.getElementById('titulo-dificultad').textContent = `Dificultad: ${dificultadActual.toUpperCase()} (${size}x${size})`;
    generarTablero(size);
    previsualizarCartasInicio();
}

function reiniciarPartida(){
    detenerTimer();
    iniciarPartida();
    cerrarModalFin();
}

function reiniciarTableroVisual(){
    document.getElementById('tablero').innerHTML='';
}

function generarTablero(size){
    const tablero = document.getElementById('tablero');
    tablero.innerHTML = '';
    tablero.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    const numCartas = size * size;
    const parejas = numCartas / 2;
    const pool = [...EMOJIS];
    mezclar(pool);
    const seleccion = pool.slice(0, parejas);
    const cartasArray = [...seleccion, ...seleccion];
    mezclar(cartasArray);
    cartasArray.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.valor = emoji;
        // Dorso sin texto (vacío) para apariencia de carta genérica
        card.innerHTML = `\n            <div class=\"card-inner\">\n                <div class=\"card-face back\"></div>\n                <div class=\"card-face front\">${emoji}</div>\n            </div>`;
        card.addEventListener('click', () => manejarClickCarta(card));
        tablero.appendChild(card);
    });
}

// Muestra todas las cartas volteadas inicialmente por 2 segundos
function previsualizarCartasInicio(){
    const todas = document.querySelectorAll('#tablero .card');
    todas.forEach(c => c.classList.add('flipped'));
    actualizarEstado('Memoriza las cartas...');
    setTimeout(()=>{
        todas.forEach(c => { if(!c.classList.contains('matched')) c.classList.remove('flipped'); });
        tableroBloqueado = false;
        reiniciarTimer();
        actualizarEstado(`Parejas encontradas: 0 / ${totalParejas}`);
    }, 2000);
}

function mezclar(arr){
    for(let i = arr.length -1; i>0; i--){
        const j = Math.floor(Math.random()* (i+1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function manejarClickCarta(carta){
    if(tableroBloqueado) return;
    if(carta.classList.contains('flipped') || carta.classList.contains('matched')) return;
    carta.classList.add('flipped');
    if(!primeraCarta){
        primeraCarta = carta;
        return;
    }
    const segunda = carta;
    if(primeraCarta.dataset.valor === segunda.dataset.valor){
        primeraCarta.classList.add('matched');
        segunda.classList.add('matched');
        parejasEncontradas++;
        actualizarEstado(`Parejas encontradas: ${parejasEncontradas} / ${totalParejas}`);
        primeraCarta = null;
        if(parejasEncontradas === totalParejas){ ganar(); }
    } else {
        tableroBloqueado = true;
        primeraCarta.classList.add('wrong');
        segunda.classList.add('wrong');
        setTimeout(()=>{
            primeraCarta.classList.remove('flipped','wrong');
            segunda.classList.remove('flipped','wrong');
            primeraCarta = null;
            tableroBloqueado = false;
        }, 700);
    }
}

// ====== Timer ======
function reiniciarTimer(){
    detenerTimer();
    inicioTiempo = Date.now();
    timerInterval = setInterval(actualizarTimer, 200);
    actualizarTimer();
}

function detenerTimer(){
    if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
}

function actualizarTimer(){
    if(!inicioTiempo) return;
    const ms = Date.now() - inicioTiempo;
    const totalSeg = Math.floor(ms / 1000);
    const min = Math.floor(totalSeg / 60).toString().padStart(2,'0');
    const seg = (totalSeg % 60).toString().padStart(2,'0');
    document.getElementById('tiempo').textContent = `${min}:${seg}`;
}

function obtenerTiempoSegundos(){
    if(!inicioTiempo) return 0;
    return Math.floor((Date.now() - inicioTiempo)/1000);
}

// ====== Vidas y estado ======
// Sistema de vidas eliminado

function actualizarEstado(msg, tipo=''){
    const estado = document.getElementById('estado-juego');
    estado.textContent = msg;
    estado.className = 'game-status ' + tipo;
}

// ====== Fin de partida ======
function ganar(){
    detenerTimer();
    const tiempoSeg = obtenerTiempoSegundos();
    agregarAlRanking(dificultadActual, jugadorActual.nombre, tiempoSeg);
    renderizarRankings();
    mostrarModalFin('¡Ganaste! 🎉', `Tiempo: ${formatearTiempo(tiempoSeg)}. Completaste ${totalParejas} parejas.`);
}

// Función perder eliminada (ya no hay condición de derrota por vidas)

function mostrarModalFin(titulo, detalle){
    document.getElementById('fin-titulo').textContent = titulo;
    document.getElementById('fin-detalle').textContent = detalle;
    document.getElementById('modal-fin').classList.remove('hidden');
}

function cerrarModalFin(){
    document.getElementById('modal-fin').classList.add('hidden');
}

// ====== Rankings ======
function agregarAlRanking(dif, nombre, tiempoSeg){
    const lista = rankingMemoria[dif];
    // Si el jugador ya está y mejora su tiempo, actualizar
    const existente = lista.find(r => r.nombre.toLowerCase() === nombre.toLowerCase());
    if(existente){
        if(tiempoSeg < existente.tiempoSeg){ existente.tiempoSeg = tiempoSeg; }
    } else {
        lista.push({ nombre, tiempoSeg });
    }
    // Ordenar ascendente por tiempo y limitar top 10
    lista.sort((a,b)=> a.tiempoSeg - b.tiempoSeg);
    rankingMemoria[dif] = lista.slice(0,10);
    guardarRankings();
}

function renderizarRankings(){
    renderRankingLista('rankingFacil', rankingMemoria.facil);
    renderRankingLista('rankingMedio', rankingMemoria.medio);
    renderRankingLista('rankingDificil', rankingMemoria.dificil);
}

function renderRankingLista(id, datos){
    const ul = document.getElementById(id);
    if(!ul) return;
    ul.innerHTML = '';
    datos.forEach((item, idx) => {
        const li = document.createElement('li');
        if(idx===0) li.classList.add('primer');
        const nombreSpan = document.createElement('span');
        nombreSpan.className = 'nombre';
        nombreSpan.textContent = item.nombre;
        const tiempoSpan = document.createElement('span');
        tiempoSpan.className = 'tiempo';
        tiempoSpan.textContent = formatearTiempo(item.tiempoSeg);
        li.appendChild(nombreSpan);
        li.appendChild(tiempoSpan);
        ul.appendChild(li);
    });
}

function formatearTiempo(seg){
    const m = Math.floor(seg/60).toString().padStart(2,'0');
    const s = (seg%60).toString().padStart(2,'0');
    return `${m}:${s}`;
}

function guardarRankings(){
    try { localStorage.setItem('rankingMemoria', JSON.stringify(rankingMemoria)); } catch(e){}
}
function cargarRankings(){
    try { const data = localStorage.getItem('rankingMemoria'); if(data) rankingMemoria = JSON.parse(data); } catch(e){}
}

function intentarResetRankings(){
    const clave = prompt('Ingrese la clave para restablecer los rankings:');
    if(clave === null) return;
    if(clave === '1595'){
        if(confirm('¿Seguro que deseas borrar todos los rankings?')){
            rankingMemoria = { facil: [], medio: [], dificil: [] };
            guardarRankings();
            renderizarRankings();
            alert('Rankings restablecidos.');
        }
    } else {
        alert('Clave incorrecta.');
    }
}

// ===== Utilidades =====
// (Se podrían añadir más utilidades si se amplía el juego)

// Exponer funciones necesarias al scope global
window.validarNombre = validarNombre;
window.continuarDificultades = continuarDificultades;
window.volverInicio = volverInicio;
window.volverDificultades = volverDificultades;
window.seleccionarDificultad = seleccionarDificultad;
window.reiniciarPartida = reiniciarPartida;
window.intentarResetRankings = intentarResetRankings;
