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
    ctx.fillStyle = "black";
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
restartBtn.addEventListener('click', resetGame);

function resetGame() {
    clearInterval(game);
    restartBtn.style.display = 'none';
    gameControls.style.display = 'block';
    showInitialMessage();
}

document.addEventListener("keydown", direction);

function direction(event) {
    let key = event.keyCode;
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
        ctx.fillStyle = "black";
        ctx.font = "45px Changa one";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "left"; // Reset alignment
        restartBtn.style.display = 'block'; // Show restart button
        return; // Stop the draw function
    }

    snake.unshift(newHead);

    ctx.fillStyle = "black";
    ctx.font = "25px Arial";
    ctx.fillText("Score: " + score, 10, 25);
}

// Show the initial message when the page loads
showInitialMessage();

