// ค่าคงที่ของเกม
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20; // ขนาดของแต่ละช่องในตาราง

// ตัวแปรสถานะของเกม
let snake;
let food;
let score;
let d;
let game;
let speed;

// ปุ่มควบคุม
const easyBtn = document.getElementById('easyBtn');
const mediumBtn = document.getElementById('mediumBtn');
const hardBtn = document.getElementById('hardBtn');
const restartBtn = document.getElementById('restartBtn');
const gameControls = document.getElementById('game-controls');
const gameOverOverlay = document.getElementById('gameOverOverlay');

// ข้อความเริ่มต้นบน canvas
function showInitialMessage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // กำหนดสีข้อความ
    ctx.fillStyle = "white"; // ใช้สีขาวเพื่อให้อ่านได้ชัดเจน
    
    // หัวข้อหลัก
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Select a difficulty to start", canvas.width / 2, canvas.height / 2 - 20);
    
    // ข้อความแนะนำย่อย
    ctx.font = "16px Arial";
    ctx.fillStyle = "lightgreen";
    ctx.fillText("Use Arrow Keys or Swipe to control the snake! ", canvas.width / 2, canvas.height / 2 + 15);
    
    ctx.textAlign = "left"; // รีเซ็ตการจัดแนวกลับเป็นค่าเริ่มต้น
}

// เริ่มต้นและสตาร์ตเกม
function startGame(selectedSpeed) {
    speed = selectedSpeed;
    // ซ่อนปุ่มเลือกระดับความยาก
    gameControls.style.display = 'none';

    // รีเซ็ตสถานะเกม
    snake = [];
    snake[0] = { x: 9 * box, y: 10 * box };

    food = {
        x: Math.floor(Math.random() * (canvas.width / box - 1)) * box,
        y: Math.floor(Math.random() * (canvas.height / box - 1)) * box
    };

    score = 0;
    d = undefined; // รีเซ็ตทิศทาง

    // เริ่มลูปเกม
    if (game) clearInterval(game); // ล้างลูปเกมเดิม (ถ้ามี)
    game = setInterval(draw, speed);
}

// ตัวดักอีเวนต์สำหรับปุ่มเลือกระดับความยาก
easyBtn.addEventListener('click', () => startGame(200));
mediumBtn.addEventListener('click', () => startGame(150));
hardBtn.addEventListener('click', () => startGame(100));

// ตัวดักอีเวนต์สำหรับปุ่มรีสตาร์ต
const overlayRestartBtn = document.getElementById('overlayRestartBtn');
restartBtn.addEventListener('click', resetGame);
overlayRestartBtn.addEventListener('click', resetGame);

function resetGame() {
    clearInterval(game);
    gameOverOverlay.classList.add('is-hidden');
    restartBtn.classList.add('is-hidden');
    gameControls.style.display = 'block';
    showInitialMessage();
}

document.addEventListener("keydown", direction);

function direction(event) {
    const key = event.key;
    
    // ป้องกันการเลื่อนหน้าจอเมื่อกดปุ่มลูกศร
    if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(key)) {
        event.preventDefault();
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

// ฟังก์ชันตรวจการชน
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

// วาดทุกอย่างลงบน canvas
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

    // ตำแหน่งหัวงูก่อนขยับ
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // คำนวณตำแหน่งใหม่ตามทิศทาง
    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    // ถ้างูกินอาหารได้
    if (snakeX == food.x && snakeY == food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * (canvas.width / box - 1)) * box,
            y: Math.floor(Math.random() * (canvas.height / box - 1)) * box
        }
        // ไม่ต้องลบหางเพื่อให้งูยาวขึ้น
    } else {
        // ลบหาง 1 ช่องเพื่อให้ความยาวคงเดิม
        if(snake.length) {
           snake.pop();
        }
    }

    // สร้างหัวงูตำแหน่งใหม่
    let newHead = {
        x: snakeX,
        y: snakeY
    }

    // เงื่อนไขเกมจบ
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        
        // แสดงเลเยอร์เกมจบ
        document.getElementById('finalScore').innerText = score;
        gameOverOverlay.classList.remove('is-hidden');
        restartBtn.classList.remove('is-hidden');
        
        return; // หยุดฟังก์ชันวาดทันที
    }

    snake.unshift(newHead);

    // วาดคะแนน
    ctx.fillStyle = "white"; // ใช้สีขาวเพื่อให้เห็นบนพื้นหลังสีดำ
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);
}

// แสดงข้อความเริ่มต้นเมื่อโหลดหน้า
showInitialMessage();



// ตรรกะการเปิด/ปิดโหมดเต็มจอ
const fullscreenBtn = document.getElementById("fullscreenBtn");
const canvasWrapper = document.getElementById("canvasWrapper");
const originalCanvasWidth = canvas.width;
const originalCanvasHeight = canvas.height;

function applyFullscreenCanvasSize() {
    const isMobileView = window.matchMedia("(max-width: 768px)").matches;

    if (isMobileView) {
        // ตั้งพื้นที่เกมแนวตั้งสำหรับมือถือ/แท็บเล็ต
        canvas.width = 320;
        canvas.height = 480;
    } else {
        // ใช้ขนาดแนวนอนเดิมบนหน้าจอใหญ่
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

// อนุญาตให้ออกจากโหมดเต็มจอด้วยปุ่ม ESC
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

// --- การควบคุมบนมือถือ / สัมผัส ---
const dBtnUP = document.getElementById("dBtnUP");
const dBtnDOWN = document.getElementById("dBtnDOWN");
const dBtnLEFT = document.getElementById("dBtnLEFT");
const dBtnRIGHT = document.getElementById("dBtnRIGHT");

function preventDefaultTap(e) {
    e.preventDefault(); // ป้องกันการซูมจากการแตะซ้ำและการเลื่อนหน้าจอ
}

if (dBtnUP) dBtnUP.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "DOWN") d = "UP"; });
if (dBtnDOWN) dBtnDOWN.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "UP") d = "DOWN"; });
if (dBtnLEFT) dBtnLEFT.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "RIGHT") d = "LEFT"; });
if (dBtnRIGHT) dBtnRIGHT.addEventListener('pointerdown', (e) => { preventDefaultTap(e); if (d != "LEFT") d = "RIGHT"; });

// ตรวจจับการปัดบน canvas
let touchStartX = 0;
let touchStartY = 0;
let touchThreshold = 30; // ระยะขั้นต่ำที่นับว่าเป็นการปัด
let swipeHandled = false; // ป้องกันการปัดซ้ำหลายครั้งในการแตะต่อเนื่อง

canvas.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    swipeHandled = false; // รีเซ็ตทุกครั้งเมื่อเริ่มสัมผัสใหม่
    e.preventDefault(); 
}, { passive: false });

canvas.addEventListener('touchmove', function(e) {
    e.preventDefault(); // ป้องกันการเลื่อนหน้าจอระหว่างปัด
    
    if (!game || swipeHandled) return; // ตรวจเฉพาะตอนเกมกำลังรันและยังไม่เคยรับการปัดครั้งนี้

    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;
    
    let diffX = currentX - touchStartX;
    let diffY = currentY - touchStartY;

    // ตรวจว่าระยะการเคลื่อนที่มากพอที่จะนับเป็นการปัดหรือไม่
    if (Math.abs(diffX) > touchThreshold || Math.abs(diffY) > touchThreshold) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // ปัดแนวนอน
            if (diffX > 0 && d != "LEFT") d = "RIGHT";
            else if (diffX < 0 && d != "RIGHT") d = "LEFT";
        } else {
            // ปัดแนวตั้ง
            if (diffY > 0 && d != "UP") d = "DOWN";
            else if (diffY < 0 && d != "DOWN") d = "UP";
        }
        
        // เมื่อตรวจจับแล้ว ให้ล็อกไม่รับซ้ำจนกว่าจะยกนิ้ว
        swipeHandled = true; 
    }
}, { passive: false });

canvas.addEventListener('touchend', function(e) {
    // การควบคุมหลักจัดการใน touchmove แล้ว ตรงนี้ปิดจบการสัมผัสให้เรียบร้อย
    e.preventDefault();
}, { passive: false });


