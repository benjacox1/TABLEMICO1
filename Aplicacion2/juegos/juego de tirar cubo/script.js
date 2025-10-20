// Preguntas para cada cara del cubo
const questions = {
    1: "¿Qué es lo que más te gusta jugar con tus amigos?",
    2: "¿Hay algo que te gustaría aprender hoy?",
    3: "¿Cuál es tu color favorito y por qué?",
    4: "¿Cuéntame sobre tu juguete o libro favorito?",
    5: "¿Cómo te sientes cuando vienes a la escuela?",
    6: "¿Hay algo que te haga sentir feliz o especial?"
};

// Rotaciones para mostrar cada cara hacia el frente (mirando al usuario)
// IMPORTANTE: Estas rotaciones deben hacer que la cara con el número correspondiente quede visible de frente
const rotations = {
    1: 'rotateX(0deg) rotateY(0deg)',           // Cara front (1) - ya visible
    2: 'rotateX(0deg) rotateY(180deg)',         // Cara back (2) - rotar para ver atrás  
    3: 'rotateX(0deg) rotateY(-90deg)',         // Cara right (3) - rotar izquierda para ver derecha
    4: 'rotateX(0deg) rotateY(90deg)',          // Cara left (4) - rotar derecha para ver izquierda
    5: 'rotateX(-90deg) rotateY(0deg)',         // Cara top (5) - rotar hacia abajo para ver arriba
    6: 'rotateX(90deg) rotateY(0deg)'           // Cara bottom (6) - rotar hacia arriba para ver abajo
};

let isRolling = false;
let mouseFollowEnabled = true;
let lastConfettiTime = 0;
const confettiThrottle = 100; // Crear confetis cada 100ms máximo
let lastResults = []; // Historial de últimos resultados
let rollCount = 0; // Contador de lanzamientos

// Colores para los confetis
const confettiColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', 
    '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9'
];

// Elementos del DOM
const cube = document.getElementById('cube');
const cubeArea = document.getElementById('cubeArea');
const message = document.getElementById('message');
const questionElement = document.getElementById('question');
const resultNumberElement = document.getElementById('resultNumber');
const playAgainBtn = document.getElementById('playAgain');

// Verificar que todos los elementos existan
console.log('Elementos del DOM:');
console.log('cube:', cube);
console.log('cubeArea:', cubeArea);
console.log('message:', message);
console.log('questionElement:', questionElement);
console.log('resultNumberElement:', resultNumberElement);
console.log('playAgainBtn:', playAgainBtn);

// Función para generar número aleatorio mejorado
function generateRandomNumber() {
    rollCount++;
    
    // Generar número base
    let result = Math.floor(Math.random() * 6) + 1;
    
    // Si el resultado es el mismo que los últimos 2, intentar uno diferente
    if (lastResults.length >= 2 && 
        lastResults[lastResults.length - 1] === result && 
        lastResults[lastResults.length - 2] === result) {
        
        // Generar un número diferente
        const availableNumbers = [1, 2, 3, 4, 5, 6].filter(num => num !== result);
        result = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    }
    
    // Mantener historial de últimos 5 resultados
    lastResults.push(result);
    if (lastResults.length > 5) {
        lastResults.shift();
    }
    
    console.log(`Lanzamiento #${rollCount}: Resultado ${result}, Historial: [${lastResults.join(', ')}]`);
    
    return result;
}

// Función para crear confetis del mouse
function createMouseConfetti(x, y) {
    const now = Date.now();
    if (now - lastConfettiTime < confettiThrottle) return;
    lastConfettiTime = now;
    
    // Crear 2-4 confetis por vez
    const confettiCount = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'mouse-confetti';
        
        // Posición aleatoria cerca del mouse
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        
        confetti.style.left = (x + offsetX) + 'px';
        confetti.style.top = (y + offsetY) + 'px';
        
        // Color aleatorio
        const randomColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        confetti.style.setProperty('--confetti-color', randomColor);
        
        // Drift horizontal aleatorio
        const driftX = (Math.random() - 0.5) * 60;
        confetti.style.setProperty('--drift-x', driftX + 'px');
        
        document.body.appendChild(confetti);
        
        // Remover confeti después de la animación
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 2000);
    }
}

// Función para crear partículas
function createParticles() {
    const cubeRect = cube.getBoundingClientRect();
    const containerRect = cubeArea.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const startX = (cubeRect.left - containerRect.left) + cubeRect.width / 2;
        const startY = (cubeRect.top - containerRect.top) + cubeRect.height / 2;
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        // Dar direcciones aleatorias a las partículas
        const angle = (i / 8) * Math.PI * 2;
        const velocity = 30 + Math.random() * 20;
        particle.style.setProperty('--dx', Math.cos(angle) * velocity + 'px');
        particle.style.setProperty('--dy', Math.sin(angle) * velocity + 'px');
        
        cubeArea.appendChild(particle);
        
        // Remover partícula después de la animación
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
}

// Función para tirar el cubo
function rollDice() {
    console.log('rollDice() llamada');
    if (isRolling) {
        console.log('Ya está rodando, saliendo...');
        return;
    }
    
    isRolling = true;
    mouseFollowEnabled = false;
    cubeArea.classList.add('disabled');
    cubeArea.classList.add('rolling');
    cube.classList.remove('following-mouse');
    
    // Limpiar resultado anterior
    delete cube.dataset.lastResult;
    
    // Crear partículas al momento de tirar
    createParticles();
    
    // Generar número aleatorio del 1 al 6 con sistema mejorado
    const result = generateRandomNumber();
    
    // Calcular rotaciones finales realistas para que termine en el número correcto
    const baseRotations = {
        1: { x: 0, y: 0 },           // Cara front (1)
        2: { x: 0, y: 180 },         // Cara back (2) 
        3: { x: 0, y: -90 },         // Cara right (3) - corregido
        4: { x: 0, y: 90 },          // Cara left (4) - corregido
        5: { x: -90, y: 0 },         // Cara top (5)
        6: { x: 90, y: 0 }           // Cara bottom (6)
    };
    
    // Crear rotaciones más realistas con variación aleatoria mejorada
    const minSpins = 3; // Mínimo 3 vueltas completas
    const maxSpins = 12; // Máximo 12 vueltas completas
    
    // Vueltas aleatorias independientes para X e Y
    const extraSpinsX = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    const extraSpinsY = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    
    // Agregar variación pequeña al ángulo final para naturalidad
    const angleVariationX = (Math.random() - 0.5) * 20; // ±10 grados
    const angleVariationY = (Math.random() - 0.5) * 20; // ±10 grados
    
    const finalX = baseRotations[result].x + (extraSpinsX * 360) + angleVariationX;
    const finalY = baseRotations[result].y + (extraSpinsY * 360) + angleVariationY;
    
    // Establecer las variables CSS para la animación
    cube.style.setProperty('--final-x', `${finalX}deg`);
    cube.style.setProperty('--final-y', `${finalY}deg`);
    
    // Agregar duración variable para mayor realismo
    const animationDuration = 2.5 + (Math.random() * 1.2); // 2.5 - 3.7 segundos
    cube.style.setProperty('--animation-duration', `${animationDuration}s`);
    
    console.log(`Rotaciones finales: X=${finalX.toFixed(1)}°, Y=${finalY.toFixed(1)}°, Duración=${animationDuration.toFixed(1)}s`);
    
    // Agregar clase de animación
    cube.classList.add('rolling');
    
    // Después de la animación principal, el cubo ya estará en la posición correcta
    setTimeout(() => {
        console.log('Animación terminada, procesando resultado...');
        
        // Primero limpiar todas las animaciones
        cube.classList.remove('rolling');
        cubeArea.classList.remove('rolling');
        
        // Limpiar las propiedades de animación CSS
        cube.style.removeProperty('--final-x');
        cube.style.removeProperty('--final-y');
        cube.style.removeProperty('--animation-duration');
        cube.style.animation = 'none';
        
        // FORZAR la posición final directamente SIN transición
        cube.style.transition = 'none';
        cube.style.transform = `translateZ(-50px) ${rotations[result]}`;
        
        console.log(`RESULTADO FINAL:`);
        console.log(`- Número generado: ${result}`);
        console.log(`- Rotación aplicada: ${rotations[result]}`);
        console.log(`- Transform final: translateZ(-50px) ${rotations[result]}`);
        
        // Restaurar transición después de establecer la posición
        setTimeout(() => {
            cube.style.transition = 'transform 0.5s ease';
        }, 50);
        
        // Guardar el resultado
        cube.dataset.lastResult = result;
        console.log(`Cubo fijado en cara ${result}`);
        
        // Reactivar controles
        mouseFollowEnabled = true;
        cubeArea.classList.remove('disabled');
        isRolling = false;
        
        // Esperar un momento antes de mostrar el mensaje para evitar conflictos
        setTimeout(() => {
            console.log('Mostrando pregunta...');
            showQuestion(result);
        }, 500);
        
    }, (animationDuration * 1000) + 100); // Añadir pequeño buffer
}

// Función para mostrar la pregunta
function showQuestion(faceNumber) {
    console.log(`showQuestion llamada con faceNumber: ${faceNumber}`);
    
    if (!questionElement || !message || !resultNumberElement) {
        console.error('Elementos no encontrados!');
        return;
    }
    
    // Asegurar que el mensaje esté oculto primero
    message.classList.remove('show');
    
    // Colores que coinciden con cada cara del cubo
    const faceColors = {
        1: 'linear-gradient(135deg, #ff4757, #ff3742)', // Rojo - cara front
        2: 'linear-gradient(135deg, #2ed573, #1dd1a1)', // Verde - cara back
        3: 'linear-gradient(135deg, #3742fa, #2f3542)', // Azul - cara right
        4: 'linear-gradient(135deg, #ff6348, #ff4757)', // Naranja - cara left
        5: 'linear-gradient(135deg, #ffa502, #ff6348)', // Amarillo - cara top
        6: 'linear-gradient(135deg, #ff9ff3, #f368e0)'  // Rosa - cara bottom
    };
    
    // Establecer el número que salió con su color correspondiente
    resultNumberElement.textContent = faceNumber;
    resultNumberElement.style.background = faceColors[faceNumber];
    console.log(`Número establecido: ${faceNumber} con color correspondiente`);
    
    // Establecer el texto de la pregunta
    questionElement.textContent = questions[faceNumber];
    console.log(`Pregunta establecida: ${questions[faceNumber]}`);
    
    // Pequeña pausa y luego mostrar el mensaje
    setTimeout(() => {
        message.classList.add('show');
        console.log('Mensaje mostrado con número y pregunta');
    }, 100);
}

// Función para el seguimiento del mouse
function handleMouseMove(event) {
    if (!mouseFollowEnabled || isRolling) return;
    
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    // Calcular ángulos basados en la posición del mouse relativa al centro de la ventana
    const rotateY = ((mouseX - windowCenterX) / window.innerWidth) * 60; // Máximo 60 grados
    const rotateX = ((windowCenterY - mouseY) / window.innerHeight) * 40; // Máximo 40 grados
    
    // Aplicar la rotación con transición suave manteniendo la cara actual
    cube.classList.add('following-mouse');
    
    // Si el cubo ya terminó un juego, mantener la cara ganadora visible
    if (cube.dataset.lastResult) {
        const baseRotation = rotations[cube.dataset.lastResult];
        const [, baseRotateX, baseRotateY] = baseRotation.match(/rotateX\((-?\d+)deg\) rotateY\((-?\d+)deg\)/).slice(1);
        cube.style.transform = `translateZ(-50px) rotateX(${parseInt(baseRotateX) + rotateX}deg) rotateY(${parseInt(baseRotateY) + rotateY}deg)`;
    } else {
        // Posición inicial con seguimiento del mouse
        cube.style.transform = `translateZ(-50px) rotateX(${rotateX - 20}deg) rotateY(${rotateY + 20}deg)`;
    }
}

// Función para resetear posición cuando el mouse sale del área
function handleMouseLeave() {
    if (!mouseFollowEnabled || isRolling) return;
    
    // Si el cubo ya terminó un juego, volver a la cara ganadora
    if (cube.dataset.lastResult) {
        cube.style.transform = `translateZ(-50px) ${rotations[cube.dataset.lastResult]}`;
    } else {
        // Posición inicial
        cube.style.transform = 'translateZ(-50px) rotateX(-20deg) rotateY(20deg)';
    }
}

// Función para resetear el juego
function resetGame() {
    console.log('resetGame llamado');
    
    // Detener cualquier animación en curso
    isRolling = false;
    mouseFollowEnabled = true;
    
    // Ocultar mensaje
    message.classList.remove('show');
    
    // Limpiar estados del cubo
    cubeArea.classList.remove('disabled', 'rolling');
    cube.classList.remove('following-mouse', 'rolling');
    
    // Limpiar cualquier animación pendiente
    cube.style.animation = '';
    cube.style.removeProperty('--final-x');
    cube.style.removeProperty('--final-y');
    cube.style.removeProperty('--animation-duration');
    
    // Limpiar resultado anterior para volver a la posición inicial
    delete cube.dataset.lastResult;
    
    // Resetear la posición del cubo a la inicial
    cube.style.transition = 'transform 0.5s ease';
    cube.style.transform = 'translateZ(-50px) rotateX(-25deg) rotateY(35deg)';
    
    console.log('Juego reseteado');
}

// Event listeners
cubeArea.addEventListener('click', () => {
    console.log('Click en cubeArea detectado');
    rollDice();
});

// Listener global para confetis en toda la pantalla
document.body.addEventListener('mousemove', (event) => {
    // Crear confetis en toda la pantalla
    createMouseConfetti(event.clientX, event.clientY);
    
    // Solo aplicar seguimiento del cubo si el mouse está en el área del cubo
    if (event.target.closest('.cube-area')) {
        handleMouseMove(event);
    }
});

document.body.addEventListener('mouseleave', handleMouseLeave);
playAgainBtn.addEventListener('click', resetGame);

// Posición inicial del cubo
cube.style.transform = 'translateZ(-50px) rotateX(-25deg) rotateY(35deg)';

// Prevenir que el scroll afecte el juego
document.body.style.overflow = 'hidden';

// TESTING: Función para probar showQuestion - REMOVER EN PRODUCCIÓN
window.testShowQuestion = function(num = 1) {
    console.log('Testing showQuestion con número:', num);
    showQuestion(num);
};

// TESTING: Función para probar cada cara del cubo
window.testCubeFace = function(faceNumber) {
    console.log(`Testing cara ${faceNumber}`);
    cube.style.transition = 'transform 1s ease';
    cube.style.transform = `translateZ(-50px) ${rotations[faceNumber]}`;
    console.log(`Rotación aplicada: ${rotations[faceNumber]}`);
    
    setTimeout(() => {
        showQuestion(faceNumber);
    }, 1200);
};

// TESTING: Función para probar todas las caras secuencialmente
window.testAllFaces = function() {
    let currentFace = 1;
    const testNext = () => {
        if (currentFace <= 6) {
            console.log(`Probando cara ${currentFace}`);
            testCubeFace(currentFace);
            currentFace++;
            setTimeout(testNext, 4000);
        }
    };
    testNext();
};