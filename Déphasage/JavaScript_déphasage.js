const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const menuOverlay = document.getElementById('menu-overlay');
const menuTitle = document.getElementById('menu-title');
const menuSubtitle = document.getElementById('menu-subtitle');
const pseudoInput = document.getElementById('pseudo-input');
const scoreboardList = document.getElementById('scoreboard-list');

const soundButton = document.getElementById('sound-button');
const soundIcon = soundButton.querySelector('i');
let isMuted = false;

const COULEUR_BLEUE = '#00eeff';
const COULEUR_VIOLET = '#5d00b4';
const COULEURS = [COULEUR_BLEUE, COULEUR_VIOLET];

const player = {
    x: 150,
    y: canvas.height / 2 - 20,
    width: 40,
    height: 40,
    color: COULEUR_BLEUE,
    trail: []
};

let obstacles = [];
let particles = [];
let score = 0;
let highScore = localStorage.getItem('dephasage_highscore') || 0;
let gameSpeed = 5;
let isGameOver = false;
let isGameStarted = false;
let leaderboard = [];
let currentPlayer = "";
let frameCount = 0;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let backgroundHum = null;

function playSound(frequency, duration, type = 'sine', volume = 0.3, slide = 0) {
    if (!audioContext || isMuted) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    if (slide !== 0) {
        osc.frequency.linearRampToValueAtTime(slide, audioContext.currentTime + duration / 1000);
    }
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration / 1000);
}

function playShiftSound() {
    playSound(200, 150, 'sawtooth', 0.2, 500);
}
function playScoreSound() {
    playSound(800, 100, 'triangle', 0.3);
}

function playGameOverSound() {
    if (backgroundHum) {
        backgroundHum.stop();
        backgroundHum = null;
    }
    playSound(400, 800, 'sawtooth', 0.4, 50);
}

function startBackgroundHum() {
    if (backgroundHum || !audioContext || isMuted) return;
    backgroundHum = audioContext.createOscillator();
    const gain = audioContext.createGain();
    backgroundHum.connect(gain);
    gain.connect(audioContext.destination);
    backgroundHum.type = 'sawtooth';
    backgroundHum.frequency.setValueAtTime(40, audioContext.currentTime);
    gain.gain.setValueAtTime(0.05, audioContext.currentTime);
    backgroundHum.start();
}

function toggleSound() {
    isMuted = !isMuted;
    if (isMuted) {
        soundIcon.classList.remove('fa-volume-up');
        soundIcon.classList.add('fa-volume-mute');
        soundButton.classList.add('muted');
        if (backgroundHum) {
            backgroundHum.stop();
            backgroundHum = null;
        }
    } else {
        soundIcon.classList.remove('fa-volume-mute');
        soundIcon.classList.add('fa-volume-up');
        soundButton.classList.remove('muted');
        if (isGameStarted && !isGameOver) {
            startBackgroundHum();
        }
    }
}

function loadLeaderboard() {
    leaderboard = JSON.parse(localStorage.getItem('dephasage_leaderboard')) || [];
    renderLeaderboard();
}

function saveLeaderboard() {
    localStorage.setItem('dephasage_leaderboard', JSON.stringify(leaderboard));
}

function addScoreToLeaderboard(pseudo, newScore) {
    if (newScore === 0) return;
    let existingEntryIndex = -1;
    for (let i = 0; i < leaderboard.length; i++) {
        if (leaderboard[i].pseudo === pseudo) {
            existingEntryIndex = i;
            break;
        }
    }
    if (existingEntryIndex !== -1) {
        if (newScore > leaderboard[existingEntryIndex].score) {
            leaderboard[existingEntryIndex].score = newScore;
        }
    } else {
        leaderboard.push({ pseudo: pseudo, score: newScore });
    }
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    saveLeaderboard();
    renderLeaderboard();
}

function renderLeaderboard() {
    scoreboardList.innerHTML = '';
    if (leaderboard.length === 0) {
        scoreboardList.innerHTML = '<li style="justify-content: center; opacity: 0.5;">Aucun score...</li>';
        return;
    }
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="pseudo">${entry.pseudo}</span> <span class="score">${entry.score}</span>`;
        scoreboardList.appendChild(li);
    });
}

function drawPlayer() {
    player.trail.forEach((p, index) => {
        const alpha = (index / player.trail.length);
        ctx.fillStyle = `rgba(${player.color === COULEUR_BLEUE ? '0, 234, 255' : '83, 0, 180'}, ${alpha * 0.5})`;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
    player.trail.push({ x: player.x, y: player.y, width: player.width, height: player.height });
    if (player.trail.length > 10) {
        player.trail.shift();
    }
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width, player.y + player.height / 2);
    ctx.lineTo(player.x, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.shadowColor = obstacle.color;
        ctx.shadowBlur = 15;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(obstacle.x + obstacle.width * 0.4, obstacle.y, obstacle.width * 0.2, obstacle.height);
    });
    ctx.shadowBlur = 0;
}

function drawParticles() {
    particles.forEach((p, index) => {
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
}
function drawScore() {
    scoreEl.innerText = score;
    highscoreEl.innerText = highScore;
}

function spawnParticles(x, y, color) {
    const rgb = color === COULEUR_BLEUE ? '0, 234, 255' : '93, 0, 180';
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x + player.width / 2,
            y: y + player.height / 2,
            size: Math.random() * 4 + 1,
            color: rgb,
            alpha: 1,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

function spawnObstacle() {
    const obstacleHeight = player.height;
    const obstacleY = player.y;
    obstacles.push({
        x: canvas.width,
        y: obstacleY,
        width: 30,
        height: obstacleHeight,
        color: COULEURS[Math.floor(Math.random() * COULEURS.length)],
        scored: false
    });
}

function updateGame() {
    if (isGameOver) return;
    if (gameSpeed < 20) {
         gameSpeed += 0.005; 
    }

    frameCount++;
    
    const spawnInterval = Math.max(25, 70 - Math.floor(score / 5));
    if (frameCount % spawnInterval === 0) {
        spawnObstacle();
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;
        if (
            obs.x < player.x + player.width &&
            obs.x + obs.width > player.x
        ) {
            if (obs.color !== player.color) {
                if (!isGameOver) {
                    playGameOverSound();
                    isGameOver = true;
                    document.body.classList.add('shake-animation');
                    addScoreToLeaderboard(currentPlayer, score);
                    showMenu(true);
                }
            }
        }
        if (obs.x + obs.width < player.x && !obs.scored) {
            score++;
            playScoreSound();
            spawnParticles(player.x, player.y, player.color);
            obs.scored = true;
        }
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        }
    }
    
    updateParticles();
}

function gameLoop() {
    ctx.fillStyle = 'rgba(2, 0, 26, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (isGameStarted) {
        drawPlayer();
        drawObstacles();
        drawParticles();
        updateGame();
        drawScore();
    }
    requestAnimationFrame(gameLoop);
}

function showMenu(isGameOverScreen) {
    if (isGameOverScreen) {
        menuTitle.innerText = 'GAME OVER';
        pseudoInput.style.display = 'none';
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('dephasage_highscore', highScore);
        }
        menuSubtitle.innerText = `SCORE: ${score}. Cliquez pour recommencer.`;
    } else {
        menuTitle.innerText = 'DÉPHASAGE';
        pseudoInput.style.display = 'block';
        pseudoInput.focus();
        menuSubtitle.innerText = 'Cliquez ou [Espace] pour démarrer';
    }
    menuOverlay.classList.remove('hidden');
}

function resetGame() {
    obstacles = [];
    particles = [];
    player.trail = [];
    score = 0;
    gameSpeed = 5;
    isGameOver = false;
    frameCount = 0;
    player.color = COULEUR_BLEUE;
    document.body.classList.remove('shake-animation');
    drawScore();
}

function startGame() {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const pseudo = pseudoInput.value.trim();
    if (pseudo === "") {
        pseudoInput.classList.add('invalid');
        setTimeout(() => pseudoInput.classList.remove('invalid'), 300);
        return;
    }
    currentPlayer = pseudo.toUpperCase();
    startBackgroundHum();
    isGameStarted = true;
    isGameOver = false;
    resetGame();
    menuOverlay.classList.add('hidden');
}

function changePhase() {
    if (isGameOver || !isGameStarted) return;
    player.color = (player.color === COULEUR_BLEUE) ? COULEUR_VIOLET : COULEUR_BLEUE;
    canvas.style.borderColor = player.color;
    canvas.style.boxShadow = `0 0 25px ${player.color}, inset 0 0 15px ${player.color}33`;
    playShiftSound();
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (document.activeElement === pseudoInput) {
            startGame();
            return;
        }
        if (!isGameStarted || isGameOver) {
            startGame();
        } else {
            changePhase();
        }
    }
    if (e.code === 'Escape' && document.activeElement === pseudoInput) {
        pseudoInput.blur();
    }
});

pseudoInput.addEventListener('click', (e) => {
    e.stopPropagation();
});

menuOverlay.addEventListener('click', () => {
    if (!isGameStarted || isGameOver) {
        startGame();
    }
});

canvas.addEventListener('click', () => {
    if (isGameStarted) {
        changePhase();
    }
});

soundButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSound();
});

drawScore();
loadLeaderboard();
gameLoop();
