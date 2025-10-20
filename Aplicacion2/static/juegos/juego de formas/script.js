// Juego de Formas Drag & Drop (versión con pantallas múltiples, posiciones aleatorias y condición de pérdida)
const FIGURES=[
  {id:1,name:'Círculo',key:'circulo',svg:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="var(--fill)" stroke="var(--stroke)" stroke-width="6"/></svg>`},
  {id:2,name:'Cuadrado',key:'cuadrado',svg:`<svg viewBox="0 0 100 100"><rect x="12" y="12" width="76" height="76" rx="10" fill="var(--fill)" stroke="var(--stroke)" stroke-width="6"/></svg>`},
  {id:3,name:'Triángulo',key:'triangulo',svg:`<svg viewBox="0 0 100 100"><polygon points="50,8 92,92 8,92" fill="var(--fill)" stroke="var(--stroke)" stroke-width="6" stroke-linejoin="round"/></svg>`},
  {id:4,name:'Estrella',key:'estrella',svg:`<svg viewBox="0 0 100 100"><polygon points="50,6 61,36 93,36 67,55 77,87 50,68 23,87 33,55 7,36 39,36" fill="var(--fill)" stroke="var(--stroke)" stroke-width="6" stroke-linejoin="round"/></svg>`},
  {id:5,name:'Paraguas',key:'paraguas',svg:`<svg viewBox="0 0 100 100"><path d="M50 8c-21 0-38 17-38 38h76C88 25 71 8 50 8Z" fill="var(--fill)" stroke="var(--stroke)" stroke-width="6" stroke-linejoin="round"/><path d="M50 46v34a8 8 0 0 0 16 0" fill="none" stroke="var(--stroke)" stroke-width="6" stroke-linecap="round"/></svg>`},
  {id:6,name:'Pentágono',key:'pentagono',svg:`<svg viewBox="0 0 100 100"><polygon points="50,6 93,38 76,92 24,92 7,38" fill="var(--fill)" stroke="var(--stroke)" stroke-width="6" stroke-linejoin="round"/></svg>`},
  {id:7,name:'Hexágono',key:'hexagono',svg:`<svg viewBox="0 0 100 100"><polygon points="30,8 70,8 92,50 70,92 30,92 8,50" fill="var(--fill)" stroke="var(--stroke)" stroke-width="6" stroke-linejoin="round"/></svg>`},
  {id:8,name:'Semicírculo',key:'semicirculo',svg:`<svg viewBox="0 0 100 100"><path d="M10 90A40 40 0 0 1 90 90V50A40 40 0 0 0 10 50Z" fill="var(--fill)" stroke="var(--stroke)" stroke-width="6" stroke-linejoin="round"/></svg>`},
  {id:9,name:'Casa',key:'casa',svg:`<svg viewBox="0 0 100 100"><polygon points="50,8 90,40 90,92 58,92 58,64 42,64 42,92 10,92 10,40" fill="var(--fill)" stroke="var(--stroke)" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></svg>`},
  {id:10,name:'Sol',key:'sol',svg:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="20" fill="var(--fill)" stroke="var(--stroke)" stroke-width="6"/><g stroke="var(--stroke)" stroke-width="6" stroke-linecap="round"><line x1="50" y1="6" x2="50" y2="22"/><line x1="50" y1="78" x2="50" y2="94"/><line x1="6" y1="50" x2="22" y2="50"/><line x1="78" y1="50" x2="94" y2="50"/><line x1="18" y1="18" x2="30" y2="30"/><line x1="70" y1="70" x2="82" y2="82"/><line x1="70" y1="30" x2="82" y2="18"/><line x1="18" y1="82" x2="30" y2="70"/></g></svg>`}
];

let selectedCount=null; let solved=0; let total=0;

// ---- Sonidos (Web Audio simple generativo) ----
let audioCtx=null;
function ensureAudio(){ if(!audioCtx) { audioCtx = new (window.AudioContext||window.webkitAudioContext)(); } }
function playSound(type){
  try {
    ensureAudio();
    const ctx=audioCtx;
    const o=ctx.createOscillator();
    const g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    let freqSeq=[];
    switch(type){
      case 'correct': freqSeq=[440,660,880]; break;
      case 'win': freqSeq=[523,659,784,988]; break;
      case 'lose': freqSeq=[220,196,174]; break;
      default: freqSeq=[440];
    }
    const now=ctx.currentTime;
    freqSeq.forEach((f,i)=>{
      const t= now + i*0.08;
      o.frequency.setValueAtTime(f,t);
    });
    g.gain.setValueAtTime(0.001, now);
    g.gain.exponentialRampToValueAtTime(0.4, now+0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08*freqSeq.length + 0.25);
    o.start(now);
    o.stop(now + 0.08*freqSeq.length + 0.3);
  } catch(e){ /* silencioso */ }
}

// Overlays y elementos
const welcomeOverlay=document.getElementById('welcomeOverlay');
const selectionOverlay=document.getElementById('selectionOverlay');
const winOverlay=document.getElementById('winOverlay');
const loseOverlay=document.getElementById('loseOverlay');
const goSelectionBtn=document.getElementById('goSelectionBtn');
const countOptions=document.getElementById('countOptions');
const startGameBtn=document.getElementById('startGameBtn');
const playAgainBtn=document.getElementById('playAgainBtn');
const changeCountBtn=document.getElementById('changeCountBtn');
const retryBtn=document.getElementById('retryBtn');
const backMenuBtn=document.getElementById('backMenuBtn');
const palette=document.getElementById('palette');
const board=document.getElementById('board');
const progressText=document.getElementById('progressText');
const game=document.getElementById('game');
const title=document.querySelector('.title');

// Genera posiciones no solapadas usando intentos aleatorios y fallback a rejilla si falla
function generateNonOverlappingPositions(count, areaW, areaH, w, h, margin){
  const positions=[]; const maxAttempts=5000;
  let attempts=0;
  function overlaps(x,y){
    return positions.some(p=> !(x+w+margin < p.x || p.x+w+margin < x || y+h+margin < p.y || p.y+h+margin < y));
  }
  while(positions.length<count && attempts<maxAttempts){
    attempts++;
    const x=Math.random()*(areaW - w - margin);
    const y=Math.random()*(areaH - h - margin);
    if(x<0||y<0) continue;
    if(!overlaps(x,y)) positions.push({x,y});
  }
  if(positions.length===count) return positions;
  // Fallback a rejilla
  positions.length=0;
  const cols=Math.ceil(Math.sqrt(count));
  const rows=Math.ceil(count/cols);
  const cellW=areaW/cols; const cellH=areaH/rows;
  for(let i=0;i<count;i++){
    const col=i%cols; const row=Math.floor(i/cols);
    const x=col*cellW + (cellW-w)/2;
    const y=row*cellH + (cellH-h)/2;
    positions.push({x:Math.max(0,Math.min(x,areaW-w)), y:Math.max(0,Math.min(y,areaH-h))});
  }
  return positions;
}

goSelectionBtn.addEventListener('click',()=>{welcomeOverlay.classList.remove('visible');selectionOverlay.classList.add('visible');});

// Crear botones cantidad si no existen
if(!countOptions.children.length){
  for(let i=1;i<=10;i++){
    const btn=document.createElement('button');
    btn.textContent=i; btn.dataset.count=i; btn.className='btn-chroma mini';
    btn.addEventListener('click',()=>{
      countOptions.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected'); selectedCount=i; startGameBtn.disabled=false;
    });
    countOptions.appendChild(btn);
  }
}

startGameBtn.addEventListener('click',()=>{if(!selectedCount)return; selectionOverlay.classList.remove('visible'); initGame(selectedCount);});
playAgainBtn.addEventListener('click',()=>{winOverlay.classList.remove('visible'); initGame(total);});
changeCountBtn.addEventListener('click',()=>{winOverlay.classList.remove('visible'); goToWelcome();});
retryBtn.addEventListener('click',()=>{loseOverlay.classList.remove('visible'); initGame(total);});
backMenuBtn.addEventListener('click',()=>{loseOverlay.classList.remove('visible'); goToWelcome();});

function backToMenu(){
  game.classList.add('hidden'); palette.innerHTML=''; board.innerHTML=''; progressText.textContent='';
  selectedCount=null; startGameBtn.disabled=true;
  countOptions.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
  selectionOverlay.classList.add('visible');
}

function goToWelcome(){
  // Ocultar todos los overlays
  [welcomeOverlay, selectionOverlay, winOverlay, loseOverlay].forEach(o=>o.classList.remove('visible'));
  // Reset de estado de juego
  game.classList.add('hidden'); palette.innerHTML=''; board.innerHTML=''; progressText.textContent='';
  selectedCount=null; startGameBtn.disabled=true;
  if(countOptions) countOptions.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
  // Mostrar overlay inicial
  welcomeOverlay.classList.add('visible');
}

title.addEventListener('click', goToWelcome);

function initGame(count){
  game.classList.remove('hidden'); palette.innerHTML=''; board.innerHTML=''; solved=0; total=count; progressText.textContent=`0 / ${total}`;
  const chosen=FIGURES.slice(0,count);
  const paletteRect={w:palette.clientWidth,h:palette.clientHeight};
  const boardRect={w:board.clientWidth,h:board.clientHeight};
  const SIZE=120; const MARGIN=8;
  // Generar posiciones no solapadas para targets
  const targetPositions = generateNonOverlappingPositions(chosen.length, boardRect.w, boardRect.h, SIZE, SIZE, MARGIN);
  chosen.forEach((fig,idx)=>{
    const target=document.createElement('div'); target.className='target'; target.dataset.key=fig.key; target.innerHTML=fig.svg;
    const svg=target.querySelector('svg'); svg.style.setProperty('--fill','none'); svg.style.setProperty('--stroke','rgba(255,255,255,0.35)');
    const pos=targetPositions[idx];
    target.style.left=pos.x+'px'; target.style.top=pos.y+'px';
    board.appendChild(target);
  });
  // Posiciones no solapadas para figuras (paleta)
  const shapePositions = generateNonOverlappingPositions(chosen.length, paletteRect.w, paletteRect.h, SIZE, SIZE, MARGIN);
  const shuffled=[...chosen].sort(()=>Math.random()-0.5);
  shuffled.forEach((fig,idx)=>{
    const shape=document.createElement('div'); shape.className='shape'; shape.dataset.key=fig.key; shape.setAttribute('aria-label',fig.name); shape.setAttribute('role','button'); shape.innerHTML=fig.svg;
    const svg=shape.querySelector('svg'); svg.style.setProperty('--fill','#2d72d9'); svg.style.setProperty('--stroke','#ffffff');
    const pos=shapePositions[idx];
    shape.style.left=pos.x+'px'; shape.style.top=pos.y+'px';
    palette.appendChild(shape); enableDrag(shape);
  });
}

// Drag personalizado
let current=null; let offsetX=0; let offsetY=0;
function enableDrag(el){el.addEventListener('pointerdown',startDrag);} 
function startDrag(e){ if(this.classList.contains('solved')) return; current=this; current.classList.add('dragging');
  const rect=current.getBoundingClientRect(); current.dataset.prevLeft=current.style.left; current.dataset.prevTop=current.style.top;
  offsetX=e.clientX-rect.left; offsetY=e.clientY-rect.top; current.style.position='fixed'; current.style.left=rect.left+'px'; current.style.top=rect.top+'px'; current.style.zIndex=50;
  window.addEventListener('pointermove',onMove); window.addEventListener('pointerup',endDrag); }
function onMove(e){
  if(!current) return;
  current.style.left=(e.clientX-offsetX)+'px';
  current.style.top=(e.clientY-offsetY)+'px';
  document.querySelectorAll('.target').forEach(t=>t.classList.remove('highlight'));
  const target=findTargetUnderPointer(e.clientX,e.clientY);
  if(target && target.dataset.key===current.dataset.key && !target.classList.contains('solved')) target.classList.add('highlight');
}
function endDrag(e){
  if(!current) return;
  window.removeEventListener('pointermove',onMove);
  window.removeEventListener('pointerup',endDrag);
  const boardRect=board.getBoundingClientRect();
  const insideBoard=e.clientX>=boardRect.left && e.clientX<=boardRect.right && e.clientY>=boardRect.top && e.clientY<=boardRect.bottom;
  const target=findTargetUnderPointer(e.clientX,e.clientY);
  document.querySelectorAll('.target').forEach(t=>t.classList.remove('highlight'));
  if(target && target.dataset.key===current.dataset.key && !target.classList.contains('solved')){
    snapToTarget(current,target);
  } else if(insideBoard && !target){
    // Solo perder si está dentro del tablero y NO hay target alguno
    loseOverlay.classList.add('visible');
    playSound('lose');
    current.style.position='absolute';
  } else {
    // Regresar a origen
    current.style.position='absolute';
    current.style.left=current.dataset.prevLeft;
    current.style.top=current.dataset.prevTop;
  }
  current.classList.remove('dragging');
  current=null;
}
function findTargetUnderPointer(x,y){
  if(!current) return null;
  // Ocultamos temporalmente la figura arrastrada para no interceptar elementFromPoint
  const prevVis=current.style.visibility;
  current.style.visibility='hidden';
  const el=document.elementFromPoint(x,y);
  current.style.visibility=prevVis;
  if(!el) return null;
  return el.closest('.target');
}
function snapToTarget(shape,target){
  target.classList.add('solved');
  shape.classList.add('solved');
  // Limpiar la silueta (quitar SVG previo para no duplicar bordes)
  const prevSvg = target.querySelector('svg');
  if(prevSvg) prevSvg.remove();
  // Insertar figura centrada
  shape.style.position='absolute';
  shape.style.left='0';
  shape.style.top='0';
  shape.style.zIndex='';
  target.appendChild(shape);
  shape.style.cursor='default';
  const check=document.createElement('div');
  check.className='check';
  check.textContent='✓';
  target.appendChild(check);
  solved++; playSound('correct');
  progressText.textContent=`${solved} / ${total}`;
  if(solved===total){
    setTimeout(()=>{ winOverlay.classList.add('visible'); playSound('win'); },400);
  }
}

// Notas: se puede ampliar con sonidos, temporizador y soporte teclado.
