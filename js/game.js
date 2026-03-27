// Game constants | ค่าคงที่หลักของเกม
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20; // Size of each square in the grid | ขนาดช่องตารางแต่ละช่อง

// Game state variables | ตัวแปรสถานะของเกม
let snake;
let food;
let score;
let d;
let game;
let speed;
let isPaused = false;

// Buttons | ปุ่มควบคุม
const easyBtn = document.getElementById('easyBtn');
const mediumBtn = document.getElementById('mediumBtn');
const hardBtn = document.getElementById('hardBtn');
const restartBtn = document.getElementById('restartBtn');
const gameControls = document.getElementById('game-controls');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const continueBtn = document.getElementById('continueBtn');
const endGameBtn = document.getElementById('endGameBtn');

// Initial message on canvas | ข้อความเริ่มต้นบนแคนวาส
function showInitialMessage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw text color | ตั้งค่าสีข้อความ
    ctx.fillStyle = "white"; // Use white text so it's visible | ใช้สีขาวเพื่อให้เห็นชัด
    
    // Title | หัวข้อหลัก
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Select a difficulty to start", canvas.width / 2, canvas.height / 2 - 20);
    
    // Sub-instruction | คำแนะนำย่อย
    ctx.font = "16px Arial";
    ctx.fillStyle = "lightgreen";
    ctx.fillText("Use Arrow Keys or Swipe to control the snake! ", canvas.width / 2, canvas.height / 2 + 15);
    
    ctx.textAlign = "left"; // Reset alignment | คืนค่าการจัดข้อความเป็นค่าเริ่มต้น
}

// Initialize and start the game | เริ่มต้นข้อมูลและเริ่มเกม
function startGame(selectedSpeed) {
    speed = selectedSpeed;
    isPaused = false;
    // Hide difficulty buttons | ซ่อนปุ่มเลือกระดับความยาก
    gameControls.style.display = 'none';
    pauseOverlay.classList.add('is-hidden');
    gameOverOverlay.classList.add('is-hidden');
    restartBtn.classList.add('is-hidden');

    // Reset game state | รีเซ็ตสถานะเกมใหม่ทั้งหมด
    snake = [];
    snake[0] = { x: 9 * box, y: 10 * box };

    food = {
        x: Math.floor(Math.random() * (canvas.width / box - 1)) * box,
        y: Math.floor(Math.random() * (canvas.height / box - 1)) * box
    };

    score = 0;
    d = undefined; // Reset direction | ล้างทิศทางเริ่มต้น

    // Start the game loop | เริ่มลูปการวาดเกม
    if (game) clearInterval(game); // Clear any existing game loop | เคลียร์ลูปเดิมก่อน
    game = setInterval(draw, speed);
}

// Event listeners for difficulty buttons | จับเหตุการณ์ปุ่มเลือกระดับความยาก
easyBtn.addEventListener('click', () => startGame(200));
mediumBtn.addEventListener('click', () => startGame(150));
hardBtn.addEventListener('click', () => startGame(100));

// Event listener for restart button | จับเหตุการณ์ปุ่มเริ่มเกมใหม่
const overlayRestartBtn = document.getElementById('overlayRestartBtn');
restartBtn.addEventListener('click', resetGame);
overlayRestartBtn.addEventListener('click', resetGame);
continueBtn.addEventListener('click', resumeGame);
endGameBtn.addEventListener('click', endCurrentGame);

function resetGame() {
    clearInterval(game);
    game = null;
    isPaused = false;
    gameOverOverlay.classList.add('is-hidden');
    pauseOverlay.classList.add('is-hidden');
    restartBtn.classList.add('is-hidden');
    gameControls.style.display = 'block';
    showInitialMessage();
}

function canPauseGame() {
    const isGameStarted = gameControls.style.display === 'none';
    const isGameOver = !gameOverOverlay.classList.contains('is-hidden');
    return isGameStarted && !isGameOver && !!game;
}

function pauseGame() {
    if (!canPauseGame()) return;
    clearInterval(game);
    game = null;
    isPaused = true;
    pauseOverlay.classList.remove('is-hidden');
}

function resumeGame() {
    if (!isPaused || !snake || snake.length === 0) return;
    isPaused = false;
    pauseOverlay.classList.add('is-hidden');
    game = setInterval(draw, speed);
}

function endCurrentGame() {
    // End game and show current score | จบเกมและแสดงคะแนนปัจจุบันทันที
    clearInterval(game);
    game = null;
    isPaused = false;

    pauseOverlay.classList.add('is-hidden');
    document.getElementById('finalScore').innerText = score;
    gameOverOverlay.classList.remove('is-hidden');
    restartBtn.classList.remove('is-hidden');
}

document.addEventListener("keydown", direction);

function direction(event) {
    const key = event.key;

    // ESC key controls pause/resume flow | ปุ่ม ESC ใช้พักเกมและเล่นต่อ
    if (key === "Escape") {
        event.preventDefault();

        if (isPaused) {
            resumeGame();
            return;
        }

        if (canPauseGame()) {
            pauseGame();
            return;
        }

        if (canvasWrapper.classList.contains("fullscreen-mode")) {
            exitFullscreenMode();
        }
        return;
    }
    
    // Prevent default scrolling behavior for arrow keys | ป้องกันการเลื่อนหน้าจอเมื่อกดลูกศร
    if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(key)) {
        event.preventDefault();
    }

    // Ignore direction changes while paused | ไม่รับคำสั่งเปลี่ยนทิศทางระหว่างพักเกม
    if (isPaused) {
        return;
    }

    if (key === "ArrowLeft" && d != "RIGHT") {
        d = "LEFT";
    } else if (key === "ArrowUp" && d != "DOWN") {
        d = "UP";
    } else if (key === "ArrowRight" && d != "LEFT") {
        d = "RIGHT";
    } else if (key === "ArrowDown" && d != "UP") {
        d = "DOWN";
    }
}

// Check collision function | ตรวจการชนกับตัวเอง
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

// Draw everything to the canvas | วาดทุกองค์ประกอบลงบนแคนวาส
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

    // Old head position | ตำแหน่งหัวงูเดิม
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Which direction | คำนวณทิศทางการเคลื่อนที่
    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    // If the snake eats the food | ถ้างูกินอาหารได้
    if (snakeX == food.x && snakeY == food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * (canvas.width / box - 1)) * box,
            y: Math.floor(Math.random() * (canvas.height / box - 1)) * box
        }
        // We don't remove the tail | ไม่ตัดหางเพื่อให้งูยาวขึ้น
    } else {
        // Remove the tail | ตัดหาง 1 ช่องเมื่อไม่ได้กินอาหาร
        if(snake.length) {
           snake.pop();
        }
    }

    // New head | สร้างตำแหน่งหัวงูใหม่
    let newHead = {
        x: snakeX,
        y: snakeY
    }

    // Game over | เงื่อนไขจบเกม
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        game = null;
        
        // Show overlay | แสดงหน้าจอ Game Over
        document.getElementById('finalScore').innerText = score;
        gameOverOverlay.classList.remove('is-hidden');
        restartBtn.classList.remove('is-hidden');
        
        return; // Stop the draw function | หยุดฟังก์ชันวาดเกมทันที
    }

    snake.unshift(newHead);

    // Draw score | วาดคะแนนบนจอ
    ctx.fillStyle = "white"; // Use white text for black canvas | ใช้สีขาวบนพื้นหลังดำ
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);
}

// Show the initial message when the page loads | แสดงข้อความเริ่มต้นทันทีเมื่อโหลดหน้า
showInitialMessage();



// Fullscreen pop-up logic | ตรรกะโหมดเต็มหน้าจอ
const fullscreenBtn = document.getElementById("fullscreenBtn");
const canvasWrapper = document.getElementById("canvasWrapper");
const originalCanvasWidth = canvas.width;
const originalCanvasHeight = canvas.height;

function applyFullscreenCanvasSize() {
    const isMobileView = window.matchMedia("(max-width: 768px)").matches;

    if (isMobileView) {
        // Portrait game area for phones/tablets | โหมดแนวตั้งสำหรับมือถือ/แท็บเล็ต
        canvas.width = 320;
        canvas.height = 480;
    } else {
        // Keep classic landscape canvas on larger screens | ใช้ขนาดแนวนอนเดิมบนจอใหญ่
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

window.addEventListener("resize", () => {
    if (canvasWrapper.classList.contains("fullscreen-mode")) {
        applyFullscreenCanvasSize();
        redrawAfterCanvasResize();
    }
});

// Mobile / touch controls | ปุ่มควบคุมสำหรับมือถือและทัช
const dBtnUP = document.getElementById("dBtnUP");
const dBtnDOWN = document.getElementById("dBtnDOWN");
const dBtnLEFT = document.getElementById("dBtnLEFT");
const dBtnRIGHT = document.getElementById("dBtnRIGHT");

function preventDefaultTap(e) {
    e.preventDefault(); // Prevent double tap zoom / scrolling | กันการซูมและเลื่อนโดยไม่ตั้งใจ
}

if (dBtnUP) dBtnUP.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "DOWN") d = "UP"; });
if (dBtnDOWN) dBtnDOWN.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "UP") d = "DOWN"; });
if (dBtnLEFT) dBtnLEFT.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "RIGHT") d = "LEFT"; });
if (dBtnRIGHT) dBtnRIGHT.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "LEFT") d = "RIGHT"; });

// Swipe detection on canvas | ตรวจจับการปัดบนแคนวาส
let touchStartX = 0;
let touchStartY = 0;
let touchThreshold = 30; // Minimum distance to register a swipe | ระยะขั้นต่ำของการปัด
let swipeHandled = false; // Prevent multiple swipe triggers in one continuous slide | กันการสั่งซ้ำใน 1 การปัด

canvas.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    swipeHandled = false; // Reset for new touch | เริ่มจับการปัดใหม่
    e.preventDefault(); 
}, { passive: false });

canvas.addEventListener('touchmove', function(e) {
    e.preventDefault(); // Prevent scrolling while swiping | กันการเลื่อนหน้าเวลาปัด
    
    if (!game || swipeHandled) return; // Only check when game is running and swipe not handled | ทำงานเฉพาะตอนเกมกำลังรันและยังไม่ถูกจัดการ

    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;
    
    let diffX = currentX - touchStartX;
    let diffY = currentY - touchStartY;

    // Check if movement is significant enough | ตรวจว่าระยะปัดมากพอหรือไม่
    if (Math.abs(diffX) > touchThreshold || Math.abs(diffY) > touchThreshold) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe | ปัดแนวนอน
            if (diffX > 0 && d != "LEFT") d = "RIGHT";
            else if (diffX < 0 && d != "RIGHT") d = "LEFT";
        } else {
            // Vertical swipe | ปัดแนวตั้ง
            if (diffY > 0 && d != "UP") d = "DOWN";
            else if (diffY < 0 && d != "DOWN") d = "UP";
        }
        
        // Once registered, lock out further changes until finger is lifted | ล็อกไม่ให้เปลี่ยนทิศซ้ำจนกว่าจะยกนิ้ว
        swipeHandled = true; 
    }
}, { passive: false });

canvas.addEventListener('touchend', function(e) {
    // Already handled in touchmove for snappy response, just finish cleanly | ทิศทางถูกกำหนดใน touchmove แล้ว จบการสัมผัสอย่างเรียบร้อย
    e.preventDefault();
}, { passive: false });


