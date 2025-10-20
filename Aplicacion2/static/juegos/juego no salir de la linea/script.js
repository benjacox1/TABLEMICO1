// Variables globales del juego
let dificultadSeleccionada = '';
let figuraSeleccionada = '';
let canvas, ctx;
let juegoActivo = false;
let mousePresionado = false;
let caminoCompleto = false;
let puntoInicio = null;
let puntoFin = null;
let caminoFigura = [];
// Posición actual sobre el camino (índice del último punto válido alcanzado)
let posicionActual = 0;
// Sistema de puntuación y ranking
let jugadorActual = null; // { nombre, puntaje }
let ranking = []; // array de { nombre, puntaje }

// Cargar ranking al inicio
document.addEventListener('DOMContentLoaded', () => {
    cargarRanking();
    renderRanking();
});

// Configuración de dificultades (grosor de línea permitido)
// Márgenes de error más pequeños (radio máximo desde la línea)
const configuracionDificultad = {
    'facil': { grosor: 25, nombre: 'FÁCIL' },    // antes exagerado
    'medio': { grosor: 18, nombre: 'MEDIO' },
    'dificil': { grosor: 12, nombre: 'DIFÍCIL' }
};

// Configuración de efectos de mouse
let mouseTrail;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarEfectosMouse();
});

// Efectos de mouse
function inicializarEfectosMouse() {
    mouseTrail = document.getElementById('mouseTrail');
    
    document.addEventListener('mousemove', function(e) {
        mouseTrail.style.left = e.clientX + 'px';
        mouseTrail.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mouseenter', function() {
        mouseTrail.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', function() {
        mouseTrail.style.opacity = '0';
    });
}

// Navegación entre menús
function mostrarDificultades() {
    document.getElementById('menu-inicio').classList.add('hidden');
    document.getElementById('menu-dificultades').classList.remove('hidden');
}

function volverInicio() {
    cerrarCelebracion();
    document.getElementById('menu-dificultades').classList.add('hidden');
    document.getElementById('menu-figuras').classList.add('hidden');
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('menu-inicio').classList.remove('hidden');
    detenerJuego();
    mostrarPuntajeActual();
}

function volverDificultades() {
    document.getElementById('menu-figuras').classList.add('hidden');
    document.getElementById('menu-dificultades').classList.remove('hidden');
}

function volverFiguras() {
    cerrarCelebracion();
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('menu-figuras').classList.remove('hidden');
    detenerJuego();
}

// Selección de dificultad
function seleccionarDificultad(dificultad) {
    dificultadSeleccionada = dificultad;
    document.getElementById('menu-dificultades').classList.add('hidden');
    document.getElementById('menu-figuras').classList.remove('hidden');
}

// Selección de figura
function seleccionarFigura(figura) {
    figuraSeleccionada = figura;
    document.getElementById('menu-figuras').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');
    inicializarJuego();
}

// Inicialización del juego
function inicializarJuego() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    document.getElementById('difficulty-display').textContent = configuracionDificultad[dificultadSeleccionada].nombre;
    document.getElementById('shape-display').textContent = figuraSeleccionada.toUpperCase();
    generarFigura();
    configurarEventosCanvas();
    juegoActivo = true;
    mousePresionado = false;
    caminoCompleto = false;
    posicionActual = 0;
    actualizarEstadoJuego('Haz clic en el punto verde para comenzar');
}

// Configura (solo una vez) los eventos del canvas
let eventosCanvasConfigurados = false;
function configurarEventosCanvas() {
    if (eventosCanvasConfigurados) return;
    canvas.addEventListener('mousedown', iniciarDibujo);
    canvas.addEventListener('mousemove', dibujar);
    canvas.addEventListener('mouseup', terminarDibujo);
    canvas.addEventListener('mouseleave', terminarDibujo);
    eventosCanvasConfigurados = true;
}

// Regenerar figuras estableciendo punto de inicio y fin y dibujando corredor y puntos
function generarFigura() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    caminoFigura = [];
    switch(figuraSeleccionada) {
        case 'circulo':
            generarCirculo(centerX, centerY, 150);
            break;
        case 'cuadrado':
            generarCuadrado(centerX, centerY, 200);
            break;
        case 'triangulo':
            generarTriangulo(centerX, centerY, 180);
            break;
    }
    dibujarCorredor();
    dibujarPuntos();
    dibujarFlechaDireccion();
}

// Redefinir generación para asegurar puntoInicio / puntoFin
function generarCirculo(centerX, centerY, radio) {
    caminoFigura = [];
    const numPuntos = 200;
    for (let i = 0; i <= numPuntos; i++) {
        const ang = (i / numPuntos) * 2 * Math.PI;
        caminoFigura.push({ x: centerX + Math.cos(ang) * radio, y: centerY + Math.sin(ang) * radio });
    }
    puntoInicio = caminoFigura[0];
    puntoFin = caminoFigura[caminoFigura.length - 1];
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radio, 0, 2 * Math.PI);
    ctx.stroke();
}
function generarCuadrado(centerX, centerY, lado) {
    caminoFigura = [];
    const m = lado / 2;
    const pasos = 60;
    for (let i=0;i<=pasos;i++) caminoFigura.push({x:centerX - m + (i/pasos)*lado, y:centerY - m});
    for (let i=1;i<=pasos;i++) caminoFigura.push({x:centerX + m, y:centerY - m + (i/pasos)*lado});
    for (let i=1;i<=pasos;i++) caminoFigura.push({x:centerX + m - (i/pasos)*lado, y:centerY + m});
    for (let i=1;i<pasos;i++) caminoFigura.push({x:centerX - m, y:centerY + m - (i/pasos)*lado});
    puntoInicio = caminoFigura[0];
    puntoFin = caminoFigura[caminoFigura.length - 1];
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - m, centerY - m, lado, lado);
}
function generarTriangulo(centerX, centerY, lado) {
    caminoFigura = [];
    const h = (lado * Math.sqrt(3))/2;
    const A = {x:centerX, y:centerY - (h*2/3)};
    const B = {x:centerX - lado/2, y:centerY + (h/3)};
    const C = {x:centerX + lado/2, y:centerY + (h/3)};
    const pasos = 70;
    for (let i=0;i<=pasos;i++){ const t=i/pasos; caminoFigura.push({x: A.x + (B.x-A.x)*t, y: A.y+(B.y-A.y)*t}); }
    for (let i=1;i<=pasos;i++){ const t=i/pasos; caminoFigura.push({x: B.x + (C.x-B.x)*t, y: B.y+(C.y-B.y)*t}); }
    for (let i=1;i<pasos;i++){ const t=i/pasos; caminoFigura.push({x: C.x + (A.x-C.x)*t, y: C.y+(A.y-C.y)*t}); }
    puntoInicio = caminoFigura[0];
    puntoFin = caminoFigura[caminoFigura.length - 1];
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.lineTo(C.x,C.y); ctx.closePath(); ctx.stroke();
}

function dibujarPuntos() {
    // Inicio verde
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(puntoInicio.x, puntoInicio.y, 8, 0, 2*Math.PI);
    ctx.fill();
    // Fin rojo
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(puntoFin.x, puntoFin.y, 8, 0, 2*Math.PI);
    ctx.fill();
}

function dibujarCorredor() {
    const grosor = configuracionDificultad[dificultadSeleccionada].grosor;
    ctx.save();
    ctx.strokeStyle = 'rgba(33,150,243,0.18)';
    ctx.lineWidth = grosor * 2; // diámetro de tolerancia
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i=0;i<caminoFigura.length;i++) {
        const p = caminoFigura[i];
        if (i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
    }
    ctx.stroke();
    ctx.restore();
}

// Eventos
function iniciarDibujo(e) {
    if (!juegoActivo) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const distInicio = Math.hypot(x - puntoInicio.x, y - puntoInicio.y);
    if (distInicio <= 15) {
        mousePresionado = true;
        posicionActual = 0;
        actualizarEstadoJuego('Sigue la línea sin salirte del corredor');
    ocultarFlecha();
    }
}

function dibujar(e) {
    if (!mousePresionado || !juegoActivo) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (verificarCamino(x, y)) {
        dibujarProgreso();
        if (posicionActual >= caminoFigura.length - 5) {
            completarJuego();
        }
    } else {
        fallarJuego();
    }
}

function terminarDibujo() { mousePresionado = false; }

function verificarCamino(mx, my) {
    const grosor = configuracionDificultad[dificultadSeleccionada].grosor;
    let puntoMasCercano = -1;
    let distanciaMin = Infinity;
    // Buscar en una ventana limitada para rendimiento
    for (let i = posicionActual; i < Math.min(posicionActual + 25, caminoFigura.length); i++) {
        const p = caminoFigura[i];
        const d = Math.hypot(mx - p.x, my - p.y);
        if (d < distanciaMin) { distanciaMin = d; puntoMasCercano = i; }
    }
    if (distanciaMin <= grosor && puntoMasCercano > posicionActual) {
        posicionActual = puntoMasCercano;
        return true;
    }
    return distanciaMin <= grosor; // permite permanecer dentro sin retroceder
}

function dibujarProgreso() {
    // Redibujar base ligera (corredor + puntos) antes de trazo para evitar saturación visual
    ctx.clearRect(0,0,canvas.width,canvas.height);
    dibujarCorredor();
    dibujarPuntos();
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i=0;i<=posicionActual;i++) {
        const p = caminoFigura[i];
        if (i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
    }
    ctx.stroke();
}

function completarJuego() {
    juegoActivo = false;
    mousePresionado = false;
    caminoCompleto = true;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    dibujarCorredor();
    dibujarPuntos();
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i=0;i<caminoFigura.length;i++) {
        const p = caminoFigura[i];
        if (i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
    }
    ctx.stroke();
    actualizarEstadoJuego('¡Felicidades! ¡Has completado el camino!', 'success');
    lanzarCelebracion();
    ajustarPuntaje('win');
}

function fallarJuego() {
    juegoActivo = false;
    mousePresionado = false;
    actualizarEstadoJuego('¡Te saliste del camino! Pulsa Reiniciar para intentar de nuevo', 'error');
    ajustarPuntaje('lose');
}

function reiniciarJuego() {
    cerrarCelebracion();
    inicializarJuego();
}

// ======= Nombre & Ranking ========
function validarNombre() {
    const nombreInput = document.getElementById('playerName');
    const btn = document.getElementById('btnComenzar');
    btn.disabled = nombreInput.value.trim().length === 0;
}

function empezarConNombre() {
    const nombre = document.getElementById('playerName').value.trim();
    if (!nombre) return;
    // Buscar si ya existe en ranking
    let existente = ranking.find(r => r.nombre.toLowerCase() === nombre.toLowerCase());
    if (!existente) {
        existente = { nombre, puntaje: 0 };
        ranking.push(existente);
        guardarRanking();
    }
    jugadorActual = existente;
    mostrarPuntajeActual();
    mostrarDificultades();
}

function mostrarPuntajeActual() {
    const cont = document.getElementById('puntaje-actual');
    const span = document.getElementById('scoreValue');
    if (jugadorActual) {
        span.textContent = jugadorActual.puntaje;
        cont.classList.remove('hidden');
    } else {
        cont.classList.add('hidden');
    }
    renderRanking();
}

function ajustarPuntaje(resultado) {
    if (!jugadorActual) return;
    let delta = 0;
    switch (dificultadSeleccionada) {
        case 'facil': delta = 10; break;
        case 'medio': delta = 20; break;
        case 'dificil': delta = 30; break;
    }
    if (resultado === 'win') jugadorActual.puntaje += delta; else if (resultado === 'lose') jugadorActual.puntaje -= delta;
    guardarRanking();
    mostrarPuntajeActual();
}

function guardarRanking() {
    try { localStorage.setItem('rankingLinea', JSON.stringify(ranking)); } catch(e) {}
}

function cargarRanking() {
    try {
        const data = localStorage.getItem('rankingLinea');
        if (data) ranking = JSON.parse(data);
    } catch(e) { ranking = []; }
}

function renderRanking() {
    const ul = document.getElementById('rankingLista');
    if (!ul) return;
    // Ordenar por puntaje descendente
    const ordenado = [...ranking].sort((a,b)=> b.puntaje - a.puntaje);
    ul.innerHTML = '';
    ordenado.forEach((item, idx) => {
        const li = document.createElement('li');
        if (idx === 0) li.classList.add('primer');
        const nombreSpan = document.createElement('span');
        nombreSpan.className = 'nombre';
        nombreSpan.textContent = item.nombre;
        const puntajeSpan = document.createElement('span');
        puntajeSpan.className = 'puntaje';
        puntajeSpan.textContent = item.puntaje;
        li.appendChild(nombreSpan);
        li.appendChild(puntajeSpan);
        ul.appendChild(li);
    });
}

// Actualización de estado
function actualizarEstadoJuego(mensaje, tipo = '') {
    const statusElement = document.getElementById('game-status');
    statusElement.textContent = mensaje;
    statusElement.className = 'game-status ' + tipo;
}

function lanzarCelebracion() {
    const overlay = document.getElementById('celebracion');
    const confetiContainer = document.getElementById('confetiContainer');
    confetiContainer.innerHTML = '';
    overlay.classList.remove('hidden');

    generarConfeti(200); // un poco más confeti al ser auto
    setTimeout(() => { cerrarCelebracion(); }, 3000);
}

function cerrarCelebracion() {
    const overlay = document.getElementById('celebracion');
    overlay.classList.add('hidden');
}

function generarConfeti(cantidad) {
    const colores = ['#ff4757','#ffa502','#1e90ff','#2ed573','#eccc68','#ff6b81','#3742fa','#a29bfe','#fd79a8'];
    const confetiContainer = document.getElementById('confetiContainer');
    const viewportWidth = window.innerWidth;

    for (let i = 0; i < cantidad; i++) {
        const pieza = document.createElement('div');
        pieza.classList.add('confeti');
        const color = colores[Math.floor(Math.random() * colores.length)];
        const delay = (Math.random() * 0.7).toFixed(2);
        const duracion = (4 + Math.random() * 3).toFixed(2);
        const left = Math.random() * viewportWidth;
        const rotateY = Math.random() * 360;
        const rotateX = Math.random() * 360;
        const scale = 0.6 + Math.random() * 0.8;

        pieza.style.background = color;
        pieza.style.left = left + 'px';
        pieza.style.animationDuration = duracion + 's';
        pieza.style.animationDelay = delay + 's';
        pieza.style.transform = `translateY(-60px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
        pieza.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';

        // Variantes de forma
        if (Math.random() > 0.7) {
            pieza.style.width = '6px';
            pieza.style.height = '26px';
        } else if (Math.random() > 0.4) {
            pieza.style.width = '14px';
            pieza.style.height = '14px';
        }
        confetiContainer.appendChild(pieza);
    }
}

// Flecha de dirección desde el inicio al sentido de avance
let flechaVisible = false;
function dibujarFlechaDireccion() {
    if (!caminoFigura.length) return;
    const idxDir = Math.min(20, caminoFigura.length - 1);
    const start = caminoFigura[0];
    const target = caminoFigura[idxDir];
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    const ang = Math.atan2(dy, dx);
    const largo = 60;
    const x2 = start.x + Math.cos(ang) * largo;
    const y2 = start.y + Math.sin(ang) * largo;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const headLen = 18;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(ang - Math.PI/7)*headLen, y2 - Math.sin(ang - Math.PI/7)*headLen);
    ctx.lineTo(x2 - Math.cos(ang + Math.PI/7)*headLen, y2 - Math.sin(ang + Math.PI/7)*headLen);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    flechaVisible = true;
}

function ocultarFlecha() {
    if (!flechaVisible) return;
    flechaVisible = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    dibujarCorredor();
    dibujarPuntos();
}

// ===== Reset Ranking con clave =====
function intentarResetRanking() {
    const clave = prompt('Ingrese la clave para restablecer el ranking:');
    if (clave === null) return; // cancelado
    if (clave === '1595') {
        if (confirm('¿Seguro que deseas borrar todo el ranking? Esta acción no se puede deshacer.')) {
            ranking = [];
            if (jugadorActual) jugadorActual.puntaje = 0; // reinicia actual si se vuelve a crear
            guardarRanking();
            mostrarPuntajeActual();
            alert('Ranking restablecido.');
        }
    } else {
        alert('Clave incorrecta.');
    }
}