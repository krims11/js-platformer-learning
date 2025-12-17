
 const particles = [];
// === ЗВУКИ ===
const sJump = new Audio("sounds/jump.wav");
const sLand = new Audio("sounds/land.wav");
const sCoin = new Audio("sounds/coin.wav");
const sHit = new Audio("sounds/hit.wav");
function playSound(sound, volume = 1) {
    const s = sound.cloneNode();
    s.volume = volume;
    s.play();
}

const enemies = [];

// громкость (если хочешь тише — ставь 0.2)
sJump.volume = 0.5;
sLand.volume = 0.5;
sCoin.volume = 0.5;
sHit.volume = 0.5;
const abyssCreatures = [];
let abyssWave = 0;

// ===== КОНСТАНТЫ =====
const TILE_SIZE = 32;
const SIDE_DARK = 0.75;
const BOTTOM_DARK = 0.55;


const shadow = {
    scale: 1,
    alpha: 0.5
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Правильный размер canvas
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Управление
const keys = {};
document.addEventListener("keydown", e => {
    if (!keys[e.key]) {  
        keys[e.key] = true;
        if (e.key === " ") player.attack();
    }
});
document.addEventListener("keyup", e => {
    keys[e.key] = false;
});


// Параметры игрока
const player = {
    x: 150,
    y: 100,
    w: 80,
    h: 90,
    direction: 1,

    vx: 0,
    vy: 0,
    isAttacking: false,
    attackFrame: 0,
    attackCooldown: 0,
    attackRange: 90,   // дальность удара в пикселях
    attackDuration: 14, // сколько кадров длится атака
    attackHitbox: { x: 0, y: 0, w: 90, h: 40 },

    speed: 0.4,
    maxSpeed: 6,
    acceleration: 0.6,
    deceleration: 0.5,
    airControl: 0.6,
    jumpForce: 10,
    gravity: 0.4,
    hp: 3,
maxHp: 3,

invincible: false,
invTimer: 0,
invDuration: 60, // кадров (≈ 1 секунда)

knockbackX: 6,
knockbackY: 6,


    onGround: false,
    canDoubleJump: true,
    coyoteTime: 0,
    jumpBuffer: 0,

    wallSliding: false,
    wallDirection: 0,
    wallJumpForceX: 8,
    wallJumpForceY: 10,
    scaleX:  1,
    scaleY:  1,
    scaleVelocityX:  0,
    scaleVelocityY:  0,
    wasOnGround: false,
    frame: 0,
frameSpeed: 0.25,
frameCount: 8,   // ВСЕ КАДРЫ
cols: 4,
rows: 2,
sprite: new Image()
};
player.attack = function() {
    if (this.attackCooldown > 0) return;

    this.isAttacking = true;
    this.attackFrame = this.attackDuration;
    this.attackCooldown = 20;

    // включаем slash-анимацию
    slash.playing = true;
    slash.frame = 0;

    slash.flip = this.direction;
    slash.x = this.x + this.w/2 + this.direction * 65;
    slash.y = this.y + this.h / 2;
};
player.takeDamage = function(fromX) {
    if (this.invincible) return;

    this.hp--;
    this.invincible = true;
    this.invTimer = this.invDuration;

    // отталкивание
    const dir = this.x + this.w/2 < fromX ? -1 : 1;
    this.vx = dir * this.knockbackX;
    this.vy = -this.knockbackY;

    playSound(sHit, 0.6);


    // визуальный squash
    this.scaleX = 1.3;
    this.scaleY = 0.7;

    if (this.hp <= 0) {
        console.log("PLAYER DEAD");
        // позже: рестарт / смерть
    }
};


player.sprite.src = "sprites/frosya_run.png";



const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    followSpeed: 0.1 // плавность следования
};


// Платформы


const platforms = [
    // ——— СТАРТ ———
    { x: 0,    y: 500, w: 600, h: 30 },

    // ——— СПУСК ВПРАВО ———
    { x: 650,  y: 550, w: 200, h: 25 },
    { x: 900,  y: 600, w: 250, h: 25 },

    // ——— ПОДЪЁМ ———
    { x: 1200, y: 520, w: 200, h: 25 },
    { x: 1450, y: 450, w: 250, h: 25 },
    { x: 1750, y: 380, w: 200, h: 25 },

    // ——— ВЫСОКИЕ ПЛАТФОРМЫ ———
    { x: 2000, y: 500, w: 120, h: 25 },
    { x: 2200, y: 430, w: 120, h: 25 },
    { x: 2400, y: 360, w: 120, h: 25 },

    // ——— ЯМА ———
    { x: 2600, y: 600, w: 200, h: 30 },
    { x: 3000, y: 600, w: 200, h: 30 },

    // ——— ПОДЪЁМ К ФИНАЛУ ———
    { x: 3300, y: 520, w: 250, h: 25 },
    { x: 3600, y: 450, w: 250, h: 25 },
    { x: 3900, y: 380, w: 250, h: 25 },

    // ——— ФИНАЛЬНАЯ АРЕНА ———
    { x: 4200, y: 500, w: 600, h: 40 }
];
const lavaZones = [
    { x: 2600, y: 630, w: 400, h: 100 } // под ямой
];

const level = {
    left: -200,
    right: 12000
};
function spawnEnemy(x, y) {
    enemies.push({
        x,
        y,
        w: 60,
        h: 60,

        vx: 1,
        speed: 1,
        direction: 1,

        hp: 3,
        alive: true,

        damage: 1,
        hitCooldown: 0
    });
}
spawnEnemy(600, 440);
spawnEnemy(1200, 360);


function spawnAbyssEyes() {
    abyssCreatures.push({
        x: player.x + (Math.random() * 300 - 150), // около игрока по уровню
        y: 700 + Math.random() * 150,              // глубже тьмы (ниже платформ)
        alpha: Math.random() * 0.5 + 0.3,
        life: 50 + Math.random() * 40
    });
}
// Загружаем один большой sprite sheet
const slashSheet = new Image();
slashSheet.src = "slash/slash_0.png";

const slash = {
    frame: 0,
    playing: false,
    x: 0,
    y: 0,
    flip: 1,
    frameSpeed: 0.7,

    cols: 4, // 4 кадра в строке
    rows: 4  // 4 строки
};

function updateEnemies() {
    for (let e of enemies) {
        if (!e.alive) continue;

        // движение
        e.x += e.speed * e.direction;

        // простой разворот каждые 120 кадров
        if (!e.turnTimer) e.turnTimer = 120;
        e.turnTimer--;

        if (e.turnTimer <= 0) {
            e.direction *= -1;
            e.turnTimer = 120;
        }

        // cooldown удара
        if (e.hitCooldown > 0) e.hitCooldown--;

        // 💥 урон игроку
        if (
            e.hitCooldown === 0 &&
            player.x < e.x + e.w &&
            player.x + player.w > e.x &&
            player.y < e.y + e.h &&
            player.y + player.h > e.y
        ) {
            player.takeDamage(e.x + e.w / 2);
            e.hitCooldown = 60;
        }
    }
}

function checkEnemyHits() {
    if (!player.isAttacking) return;

    for (let e of enemies) {
        if (!e.alive) continue;

        if (
            player.attackHitbox.x < e.x + e.w &&
            player.attackHitbox.x + player.attackHitbox.w > e.x &&
            player.attackHitbox.y < e.y + e.h &&
            player.attackHitbox.y + player.attackHitbox.h > e.y
        ) {
            e.hp--;

            // отбрасывание врага
            const dir = e.x < player.x ? -1 : 1;
            e.x += dir * 20;

            e.hitCooldown = 30;

            if (e.hp <= 0) {
                e.alive = false;
                score += 100;
            }
        }
    }
}


// Обновление игрока
function updatePlayer() {
// --- ОБРАБОТКА УДАРА ---
if (player.attackCooldown > 0) player.attackCooldown--;

if (player.isAttacking) {
    player.attackFrame--;

    if (player.attackFrame <= 0) {
        player.isAttacking = false;
    }
}


    // Горизонтальное управление
    const control = player.onGround ? player.acceleration : player.airControl;

if (keys["ArrowRight"]) {
    player.vx += control;
    player.direction = 1;   // ← смотрит вправо
}
else if (keys["ArrowLeft"]) {
    player.vx -= control;
    player.direction = -1;  // ← смотрит влево
}

else {
    // Скольжение при отпускании кнопки
    if (player.onGround) {
        if (player.vx > 0) player.vx -= player.deceleration;
        if (player.vx < 0) player.vx += player.deceleration;

        // Остановка если скорость очень маленькая
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
    }
}


    // Ограничение скорости
    player.vx = Math.max(Math.min(player.vx, player.maxSpeed), -player.maxSpeed);

    // === JUMP BUFFER ===
    if (keys["ArrowUp"]) player.jumpBuffer = 10;
    else player.jumpBuffer = Math.max(0, player.jumpBuffer - 1);

    // === COYOTE TIME ===
    if (player.onGround) {
        player.coyoteTime = 10;
        player.canDoubleJump = true;
    } else {
        player.coyoteTime = Math.max(0, player.coyoteTime - 1);
    }
    // === INVINCIBILITY ===
if (player.invincible) {
    player.invTimer--;
    if (player.invTimer <= 0) {
        player.invincible = false;
    }
}
// ТЕСТ УРОНА
if (keys["h"]) {
    player.takeDamage(player.x - 100);
}
for (let l of lavaZones) {
    if (
        player.x < l.x + l.w &&
        player.x + player.w > l.x &&
        player.y < l.y + l.h &&
        player.y + player.h > l.y
    ) {
        player.takeDamage(player.x);
    }
}






    // === WALL JUMP ===
if (player.wallSliding && player.jumpBuffer > 0) {
    player.vx = -player.wallDirection * player.wallJumpForceX;
    player.vy = -player.wallJumpForceY;
    
    player.wallSliding = false;
    player.jumpBuffer = 0;
    return; // важно! чтобы не пошёл обычный прыжок
}

// === ПРЫЖОК (земля / двойной / coyote) ===
if (player.jumpBuffer > 0) {

    if (player.coyoteTime > 0) {
        player.vy = -player.jumpForce;
        playSound(sJump, 0.5);
        player.scaleY = 1.2;
player.scaleX = 0.8;

        player.onGround = false;
        player.jumpBuffer = 0;
    }

    else if (player.canDoubleJump) {
        player.vy = -player.jumpForce * 0.9;
        player.canDoubleJump = false;
        player.jumpBuffer = 0;
    }
}


    // Гравитация
    player.vy += player.gravity;
// === АНИМАЦИЯ ===
if (Math.abs(player.vx) > 0.5 && player.onGround) {
    player.anim = "run";
} else {
    player.anim = "idle";
}

if (player.anim === "run") {
    player.frame += player.frameSpeed;
    if (player.frame >= 8) player.frame = 0; // бег только 0–7
} else {
    player.frame = 0; // кадр idle (0)
}

    // Движение
    player.x += player.vx;
    player.y += player.vy;
    // --- ОБНОВЛЕНИЕ HITBOX УДАРА ---
if (player.isAttacking) {
    if (player.direction === 1) {
    // смотрит вправо
    player.attackHitbox.x = player.x + player.w;
} else {
    // смотрит влево
    player.attackHitbox.x = player.x - player.attackHitbox.w;
}


    player.attackHitbox.y =
        player.y + player.h / 2 - player.attackHitbox.h / 2;
}

// Пыль при беге
if (player.onGround && Math.abs(player.vx) > 1) {
    if (Math.random() < 0.3) {
        spawnDust(player.x + player.w / 2, player.y + player.h);
    }
}

    // === КОЛЛИЗИЯ С ПЛАТФОРМАМИ ===
    player.onGround = false;

    for (let p of platforms) {
        if (player.x < p.x + p.w &&
            player.x + player.w > p.x &&
            player.y + player.h > p.y &&
            player.y + player.h < p.y + p.h + player.vy + 5) {

            player.y = p.y - player.h;
            player.vy = 0;
            player.onGround = true;
        }
    }
if (player.onGround && !player.wasOnGround) {
    player.scaleX = 1.3;
    player.scaleY = 0.7;
}

// Пыль при приземлении
if (player.onGround && !player.wasOnGround) {
    for (let i = 0; i < 10; i++) {
        spawnDust(player.x + player.w / 2, player.y + player.h);
    }
}


    if (player.wallSliding) {
        player.vy = Math.min(player.vy, 2);
    }

    // Земля
    if (player.y + player.h > canvas.height) {
        player.y = canvas.height - player.h;
        player.vy = 0;
        player.onGround = true;
    }
    if (player.onGround && !player.wasOnGround) {
    playSound(sLand, 0.4);
}

    player.wasOnGround = player.onGround;
    // Плавное возвращение формы
player.scaleX += (1 - player.scaleX) * 0.2;
player.scaleY += (1 - player.scaleY) * 0.2;
// --- CAMERA FOLLOW ---
camera.x += ((player.x + player.w/2) - camera.x - camera.width/2) * camera.followSpeed;
camera.y += ((player.y + player.h/2) - camera.y - camera.height/2) * 0.05;

// Ограничение границ уровня
if (player.x < level.left) player.x = level.left;
if (player.x + player.w > level.right) player.x = level.right - player.w;


}
// === PARALLAX BACKGROUND ===
// От дальнего к ближнему
const parallaxLayers = [
    { src: "layer07_Sky.png",     speed: 0.05 }, // небо
    { src: "layer05_Clouds.png",  speed: 0.10 }, // облака
    { src: "layer04_Hills_2.png", speed: 0.18 }, // дальние холмы
    { src: "layer03_Hills_1.png", speed: 0.25 }, // ближние холмы
    { src: "layer06_Rocks.png",   speed: 0.35 }, // скалы
    { src: "layer02_Trees.png",   speed: 0.45 }, // деревья
    { src: "layer01_Ground.png",  speed: 0.55 }  // земля
];

// Загружаем слои
parallaxLayers.forEach(layer => {
    layer.image = new Image();
    layer.image.src = layer.src;
});
function updateSlash() {
    if (!slash.playing) return;

    slash.frame += slash.frameSpeed;

    // 16 кадров (4×4)
    if (slash.frame >= slash.cols * slash.rows) {
        slash.playing = false;
        slash.frame = 0;
    }
}

function drawLava() {
    ctx.fillStyle = "#ff3b00";
    for (let l of lavaZones) {
        ctx.fillRect(
            l.x - camera.x,
            l.y - camera.y,
            l.w,
            l.h
        );
    }
}



// Рисование игрока
function drawPlayer() {
    ctx.save();

    const frameWidth  = player.sprite.width / player.cols;
    const frameHeight = player.sprite.height / player.rows;

    const currentFrame = Math.floor(player.frame);
    const fx = currentFrame % player.cols;
    const fy = 0;

    // позиция центра игрока
    const drawX = player.x - camera.x + player.w / 2;
    const drawY = player.y - camera.y + player.h / 2;

    ctx.translate(drawX, drawY);

    // разворот спрайта
    ctx.scale(player.direction, 1);

    // squash/stretch
    ctx.scale(player.scaleX, player.scaleY);
    if (player.invincible && Math.floor(player.invTimer / 5) % 2 === 0) {
    ctx.globalAlpha = 0.4;
}


    ctx.drawImage(
        player.sprite,
        fx * frameWidth,
        fy * frameHeight,
        frameWidth,
        frameHeight,
        -player.w / 2,
        -player.h / 2,
        player.w,
        player.h
    );
    ctx.globalAlpha = 1;


    ctx.restore();
}
function drawSlash() {
    if (!slash.playing) return;

    const frame = Math.floor(slash.frame);
    const fx = frame % slash.cols;           // колонка
    const fy = Math.floor(frame / slash.cols); // строка

    const frameWidth  = slashSheet.width / slash.cols;
    const frameHeight = slashSheet.height / slash.rows;

    ctx.save();
    ctx.translate(slash.x - camera.x, slash.y - camera.y);
    ctx.scale(slash.flip, 1);

    ctx.drawImage(
        slashSheet,
        fx * frameWidth,
        fy * frameHeight,
        frameWidth,
        frameHeight,
        -64,
        -64,
        128,
        128
    );

    ctx.restore();
}

function drawParallax() {
    parallaxLayers.forEach(layer => {
        if (!layer.image.complete) return;

        const width = canvas.width;
        const height = canvas.height;

        const offsetX = -camera.x * layer.speed;

        ctx.drawImage(layer.image, offsetX, 0, width, height);
        ctx.drawImage(layer.image, offsetX + width, 0, width, height);
    });
}
function drawEnemies() {
    for (let e of enemies) {
        if (!e.alive) continue;

        ctx.fillStyle = "darkred";
        ctx.fillRect(
            e.x - camera.x,
            e.y - camera.y,
            e.w,
            e.h
        );

        // HP врага
        ctx.fillStyle = "lime";
        ctx.fillRect(
            e.x - camera.x,
            e.y - 8 - camera.y,
            (e.hp / 3) * e.w,
            5
        );
    }
}

const tileGround = new Image();
tileGround.src = "tiles/ground.png"; // путь проверь!



function drawPlatforms() {
    if (!tileGround.complete || tileGround.naturalWidth === 0) return;

    ctx.save();

    for (let p of platforms) {
        const tilesX = Math.ceil(p.w / TILE_SIZE);
        const tilesY = Math.ceil(p.h / TILE_SIZE);

        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {

                let alpha = 1;

                // затемняем ТОЛЬКО если есть глубина
                if (tilesY > 1) {

                    // боковые края
                    if (x === 0 || x === tilesX - 1) {
                        alpha = SIDE_DARK;
                    }

                    // нижний ряд
                    if (y === tilesY - 1) {
                        alpha = BOTTOM_DARK;
                    }
                }

                ctx.globalAlpha = alpha;

                ctx.drawImage(
                    tileGround,
                    p.x + x * TILE_SIZE - camera.x,
                    p.y + y * TILE_SIZE - camera.y,
                    TILE_SIZE,
                    TILE_SIZE
                );
            }
        }
    }

    ctx.restore();
}






let playerHP = 3;
let coins = 0;
let score = 0;
function updateUI() {
    document.getElementById("hearts").textContent = "❤".repeat(player.hp);
    document.getElementById("coins").textContent = "Монеты: " + coins;
    document.getElementById("score").textContent = "Очки: " + score;
}

platforms.push({
    x: -2000,
    y: 650,
    w: 16000,
    h: 32
});


// Главный цикл
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // === ОБНОВЛЕНИЕ ===
    updatePlayer();
    updateUI();
    updateSlash();
    updateAbyssEyes();
    updateParticles();
    updateEnemies();
    checkEnemyHits();


    // === ФОН ===
drawParallax();

// === ТЬМА (ПОЗАДИ) ===
drawAbyss();

// === УРОВЕНЬ ===
drawPlatforms();
drawLava();


    // === ТЬМА (ДОЛЖНА БЫТЬ ПОЗАДИ ПЕРСОНАЖА) ===
    drawEnemies();


    // === ИГРОК + УДАР ===
    drawPlayer();
    drawSlash();  // ← ОБЯЗАТЕЛЬНО сразу после игрока!

    // === ЭФФЕКТЫ ===
    drawShadow();
    drawParticles();

    

    requestAnimationFrame(loop);
}


loop();
function drawShadow() {
    const shadowX = player.x + player.w / 2;
    const shadowY = player.y + player.h + 5;

    // Чем выше игрок — тем меньше тень
    let heightFactor = Math.min(1, Math.max(0.2, 1 - (player.vy + player.h) / 200));

    shadow.scale = heightFactor;

    ctx.save();
    ctx.globalAlpha = shadow.alpha;

    ctx.beginPath();
    ctx.ellipse(
    shadowX - camera.x,
    shadowY - camera.y,
    30 * shadow.scale,
    10 * shadow.scale,
    0, 0, Math.PI * 2
);


    ctx.fillStyle = "black";
    ctx.fill();
    ctx.restore();
}
function spawnDust(x, y) {
    particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 1,
        vy: Math.random() * -1,
        alpha: 1,
        size: 5 + Math.random() * 3
    });
}function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;

        if (p.alpha <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    ctx.fillStyle = "#ffffff";
    for (let p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x - camera.x, p.y - camera.y, p.size, p.size);

    }
    ctx.globalAlpha = 1;
}
function updateAbyssEyes() {
    for (let i = abyssCreatures.length - 1; i >= 0; i--) {
        let a = abyssCreatures[i];
        a.life--;

        if (a.life <= 0) abyssCreatures.splice(i, 1);
    }

    // шанс появления глаз
    if (Math.random() < 0.02) spawnAbyssEyes();
}
function drawTentacle(x) {
    const baseY = 650 + 40 + Math.sin(abyssWave + x * 0.01) * 20;

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 14; // толще
    ctx.lineCap = "round";

    const tipHeight = 60 + Math.sin(abyssWave * 2 + x * 0.02) * 30;

    ctx.beginPath();

    // нижняя точка (в тьме)
    ctx.moveTo(x - camera.x, baseY - camera.y);

    // верхняя точка — наконечник щупальца
    ctx.quadraticCurveTo(
        x - camera.x + Math.sin(abyssWave * 3 + x * 0.05) * 40,  // изгиб в сторону
        baseY - tipHeight - camera.y,                            // изгиб вверх
        x - camera.x,
        baseY - tipHeight - camera.y
    );

    ctx.stroke();
}


function drawAbyss() {
    const groundY = 650;
    const abyssOffset = 40;

    // волна
    const wave = Math.sin(abyssWave) * 10; // амплитуда 10px

    const abyssY = groundY + abyssOffset + wave;
    const abyssHeight = 300;

    ctx.fillStyle = "#000";
    ctx.fillRect(
        level.left - camera.x,
        abyssY - camera.y,
        level.right - level.left,
        abyssHeight
    );
for (let x = level.left; x < level.right; x += 300) {
    drawTentacle(x);
}

    // ГЛАЗА
    for (let a of abyssCreatures) {
        ctx.globalAlpha = a.alpha;

        ctx.fillStyle = "red";

        ctx.beginPath();
        ctx.ellipse(
            a.x - camera.x,
            a.y - camera.y + wave,
            10, 6, 0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(
            a.x - camera.x + 25,
            a.y - camera.y + wave,
            10, 6, 0, 0, Math.PI * 2
        );
        ctx.fill();
    }
// туман сверху тьмы
let gradient = ctx.createLinearGradient(0, abyssY - camera.y, 0, abyssY - camera.y - 80);
gradient.addColorStop(0, "rgba(0,0,0,1)");
gradient.addColorStop(1, "rgba(0,0,0,0)");

ctx.fillStyle = gradient;
ctx.fillRect(
    level.left - camera.x,
    abyssY - camera.y - 80,
    level.right - level.left,
    80
);

    ctx.globalAlpha = 1;
}
function drawAttackHitbox() {
    if (!player.isAttacking) return;

    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "red";

    ctx.fillRect(
        player.attackHitbox.x - camera.x,
        player.attackHitbox.y - camera.y,
        player.attackHitbox.w,
        player.attackHitbox.h
    );

    ctx.restore();
    
}




