// Game constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20; // Size of each square in the grid

// Game state variables
let snake;
let food;
let score;
let d;
let game;
let speed;

// Buttons
const easyBtn = document.getElementById('easyBtn');
const mediumBtn = document.getElementById('mediumBtn');
const hardBtn = document.getElementById('hardBtn');
const restartBtn = document.getElementById('restartBtn');
const gameControls = document.getElementById('game-controls');

// Initial message on canvas
function showInitialMessage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw background color
    ctx.fillStyle = "white"; // Changed text to white so it's visible
    
    // Title
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Select a difficulty to start", canvas.width / 2, canvas.height / 2 - 20);
    
    // Sub-instruction
    ctx.font = "16px Arial";
    ctx.fillStyle = "#lightgreen";
    ctx.fillText("Use Arrow Keys or Swipe to control the snake! ", canvas.width / 2, canvas.height / 2 + 15);
    
    ctx.textAlign = "left"; // Reset alignment
}

// Initialize and start the game
function startGame(selectedSpeed) {
    speed = selectedSpeed;
    // Hide difficulty buttons
    gameControls.style.display = 'none';

    // Reset game state
    snake = [];
    snake[0] = { x: 9 * box, y: 10 * box };

    food = {
        x: Math.floor(Math.random() * (canvas.width / box - 1)) * box,
        y: Math.floor(Math.random() * (canvas.height / box - 1)) * box
    };

    score = 0;
    d = undefined; // Reset direction

    // Start the game loop
    if (game) clearInterval(game); // Clear any existing game loop
    game = setInterval(draw, speed);
}

// Event listeners for difficulty buttons
easyBtn.addEventListener('click', () => startGame(200));
mediumBtn.addEventListener('click', () => startGame(150));
hardBtn.addEventListener('click', () => startGame(100));

// Event listener for restart button
const overlayRestartBtn = document.getElementById('overlayRestartBtn');
restartBtn.addEventListener('click', resetGame);
overlayRestartBtn.addEventListener('click', resetGame);

function resetGame() {
    clearInterval(game);
    document.getElementById('gameOverOverlay').style.display = 'none';
    restartBtn.style.display = 'none';
    gameControls.style.display = 'block';
    showInitialMessage();
}

document.addEventListener("keydown", direction);

function direction(event) {
    let key = event.keyCode;
    
    // Prevent default scrolling behavior for arrow keys
    if ([37, 38, 39, 40].includes(key)) {
        event.preventDefault();
    }

    if (key == 37 && d != "RIGHT") {
        d = "LEFT";
    } else if (key == 38 && d != "DOWN") {
        d = "UP";
    } else if (key == 39 && d != "LEFT") {
        d = "RIGHT";
    } else if (key == 40 && d != "UP") {
        d = "DOWN";
    }
}

// Check collision function
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

// Draw everything to the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "green" : "lightgreen";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);

        ctx.strokeStyle = "#f4f4f4";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // old head position
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // which direction
    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    // if the snake eats the food
    if (snakeX == food.x && snakeY == food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * (canvas.width / box - 1)) * box,
            y: Math.floor(Math.random() * (canvas.height / box - 1)) * box
        }
        // we don't remove the tail
    } else {
        // remove the tail
        if(snake.length) {
           snake.pop();
        }
    }

    // new Head
    let newHead = {
        x: snakeX,
        y: snakeY
    }

    // game over
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        
        // Show Overlay
        document.getElementById('finalScore').innerText = score;
        document.getElementById('gameOverOverlay').style.display = 'flex';
        
        return; // Stop the draw function
    }

    snake.unshift(newHead);

    // Draw Score
    ctx.fillStyle = "white"; // Changed from black to white to show on black canvas
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);
}

// Show the initial message when the page loads
showInitialMessage();



// Fullscreen Pop-up Logic
const fullscreenBtn = document.getElementById("fullscreenBtn");
const canvasWrapper = document.getElementById("canvasWrapper");
const originalCanvasWidth = canvas.width;
const originalCanvasHeight = canvas.height;

function applyFullscreenCanvasSize() {
    const isMobileView = window.matchMedia("(max-width: 768px)").matches;

    if (isMobileView) {
        // Portrait game area for phones/tablets similar to mobile snake layouts
        canvas.width = 320;
        canvas.height = 480;
    } else {
        // Keep classic landscape canvas on larger screens
        canvas.width = originalCanvasWidth;
        canvas.height = originalCanvasHeight;
    }
}

function resetCanvasSize() {
    canvas.width = originalCanvasWidth;
    canvas.height = originalCanvasHeight;
}

function redrawAfterCanvasResize() {
    const gameStarted = gameControls.style.display === 'none';
    if (gameStarted && snake && snake.length > 0) {
        draw();
    } else {
        showInitialMessage();
    }
}

function enterFullscreenMode() {
    canvasWrapper.classList.add("fullscreen-mode");
    document.body.classList.add("game-fullscreen-active");
    applyFullscreenCanvasSize();
    fullscreenBtn.innerHTML = "✖";
    redrawAfterCanvasResize();
}

function exitFullscreenMode() {
    canvasWrapper.classList.remove("fullscreen-mode");
    document.body.classList.remove("game-fullscreen-active");
    resetCanvasSize();
    fullscreenBtn.innerHTML = "⛶";
    redrawAfterCanvasResize();
}

fullscreenBtn.addEventListener("click", () => {
    if (canvasWrapper.classList.contains("fullscreen-mode")) {
        exitFullscreenMode();
    } else {
        enterFullscreenMode();
    }
});

// Allow escaping fullscreen with ESC key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && canvasWrapper.classList.contains("fullscreen-mode")) {
        exitFullscreenMode();
    }
});

window.addEventListener("resize", () => {
    if (canvasWrapper.classList.contains("fullscreen-mode")) {
        applyFullscreenCanvasSize();
        redrawAfterCanvasResize();
    }
});

// --- Mobile / Touch Controls ---
const dBtnUP = document.getElementById("dBtnUP");
const dBtnDOWN = document.getElementById("dBtnDOWN");
const dBtnLEFT = document.getElementById("dBtnLEFT");
const dBtnRIGHT = document.getElementById("dBtnRIGHT");

function preventDefaultTap(e) {
    e.preventDefault(); // Prevent double tap zoom / scrolling
}

if (dBtnUP) dBtnUP.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "DOWN") d = "UP"; });
if (dBtnDOWN) dBtnDOWN.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "UP") d = "DOWN"; });
if (dBtnLEFT) dBtnLEFT.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "RIGHT") d = "LEFT"; });
if (dBtnRIGHT) dBtnRIGHT.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "LEFT") d = "RIGHT"; });

// Swipe Detection on Canvas
let touchStartX = 0;
let touchStartY = 0;
let touchThreshold = 30; // Minimum distance to register a swipe
let swipeHandled = false; // Prevent multiple swipe triggers in one continuous slide

canvas.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    swipeHandled = false; // Reset for new touch
    e.preventDefault(); 
}, { passive: false });

canvas.addEventListener('touchmove', function(e) {
    e.preventDefault(); // Prevent scrolling while swiping
    
    if (!game || swipeHandled) return; // Only check if game is running and we haven't already handled this swipe

    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;
    
    let diffX = currentX - touchStartX;
    let diffY = currentY - touchStartY;

    // Check if movement is significant enough
    if (Math.abs(diffX) > touchThreshold || Math.abs(diffY) > touchThreshold) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > 0 && d != "LEFT") d = "RIGHT";
            else if (diffX < 0 && d != "RIGHT") d = "LEFT";
        } else {
            // Vertical swipe
            if (diffY > 0 && d != "UP") d = "DOWN";
            else if (diffY < 0 && d != "DOWN") d = "UP";
        }
        
        // Once registered, lock out further changes until finger is lifted
        swipeHandled = true; 
    }
}, { passive: false });

canvas.addEventListener('touchend', function(e) {
    // We already handle it in touchmove for snappier response, just cleanly end it
    e.preventDefault();
}, { passive: false });


