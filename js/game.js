// Game constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20; // Size of each square in the grid
let score = 0;

// Snake initial position
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };

// Food initial position
let food = {
    x: Math.floor(Math.random() * 23 + 1) * box,
    y: Math.floor(Math.random() * 15 + 1) * box
};

// Snake direction
let d;

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
            x: Math.floor(Math.random() * 23 + 1) * box,
            y: Math.floor(Math.random() * 15 + 1) * box
        }
        // we don't remove the tail
    } else {
        // remove the tail
        snake.pop();
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
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
    }

    snake.unshift(newHead);

    ctx.fillStyle = "black";
    ctx.font = "25px Arial";
    ctx.fillText("Score: " + score, 10, 25);
}

// call draw function every 100 ms
let game = setInterval(draw, 100);
