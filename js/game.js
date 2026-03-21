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
    // Draw background color (optional, since canvas is black via css, we can just write text)
    ctx.fillStyle = "white"; // Changed text to white so it's visible
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Select a difficulty to start", canvas.width / 2, canvas.height / 2);
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

fullscreenBtn.addEventListener("click", () => {
    canvasWrapper.classList.toggle("fullscreen-mode");
    document.body.classList.toggle("game-fullscreen-active");
    
    // Change icon based on state
    if (canvasWrapper.classList.contains("fullscreen-mode")) {
        fullscreenBtn.innerHTML = "?"; // Close icon
    } else {
        fullscreenBtn.innerHTML = "?"; // Fullscreen icon
    }
});

// Allow escaping fullscreen with ESC key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && canvasWrapper.classList.contains("fullscreen-mode")) {
        canvasWrapper.classList.remove("fullscreen-mode");
        document.body.classList.remove("game-fullscreen-active");
        fullscreenBtn.innerHTML = "?";
    }
});

