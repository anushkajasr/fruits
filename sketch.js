let clouds = [];
let confettiParticles = [];
let cloudsMoving = true;
let emojiList = ["🍎", "🍌", "🍓", "🍇", "🍉", "🍊", "🍍", "🥝", "🍒", "🍐", "🥭"];

let mangoTakeoverTime = 10000;
let mangoOnly = false;
let startTime;

let halluSound;
let soundPlayed = false;

let pacman = { x: 400, y: 250, size: 40, speed: 4, alive: false, dir: "right" };
let score = 0;
let gameOver = false;

function preload() {
  halluSound = loadSound("Sound Effects/halluhallu.mp3");
}

function setup() {
  let cnv = createCanvas(800, 500);
  cnv.elt.setAttribute('tabindex', '0');
  cnv.elt.focus();
  cnv.mousePressed(() => cnv.elt.focus());
  textSize(40);
  textAlign(CENTER, CENTER);
  startTime = millis();
}

function draw() {
  background(150, 200, 215);

  if (!soundPlayed && millis() - startTime > 3000 && halluSound.isLoaded()) {
    halluSound.play();
    soundPlayed = true;
  }

  if (!mangoOnly && millis() - startTime > mangoTakeoverTime) {
    mangoOnly = true;
    emojiList = ["🥭"];
    pacman.alive = true;
    for (let c of clouds) {
      c.type = "emoji";
      c.emoji = "🥭";
      c.driftFactor = 1;
      delete c.size; delete c.color; delete c.puffs;
    }
  }

  // Show "Hallu Hallu" when mango takeover starts
// Inside draw()
if (mangoOnly && !gameOver) {
  fill(255, 170, 0); // 🍊 mango color
  textSize(25);
  text("Hallu Hallu, Eat all the mangoes!", width / 2, 30);
  textSize(40);
}


  if (mangoOnly && pacman.alive && clouds.every(c => c.emoji !== "🥭")) {
    pacman.size *= 4;
    pacman.alive = false;
    gameOver = true;
  }

  if (pacman.alive) {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { pacman.x -= pacman.speed; pacman.dir = "left"; }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { pacman.x += pacman.speed; pacman.dir = "right"; }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { pacman.y -= pacman.speed; pacman.dir = "up"; }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { pacman.y += pacman.speed; pacman.dir = "down"; }
    pacman.x = constrain(pacman.x, 0, width);
    pacman.y = constrain(pacman.y, 0, height);
  }

  if (pacman.alive) {
    for (let i = clouds.length - 1; i >= 0; i--) {
      let c = clouds[i];
      if (c.type === "emoji" && c.emoji === "🥭" &&
          dist(pacman.x, pacman.y, c.x, c.y) < pacman.size / 2) {
        spawnConfetti(c.x, c.y);
        clouds.splice(i, 1);
        score++;
      }
    }
  }

  for (let c of clouds) {
    if (cloudsMoving) {
      c.x += c.speed;
      if (c.driftFactor < 1.5) c.driftFactor += 0.002;
    }
    if (c.type === "emoji") {
      text(c.emoji, c.x, c.y);
    } else {
      drawCloud(c.x, c.y, c.size, c.color, c.puffs, c.driftFactor);
    }
    if (c.x > width + 100) c.x = -100;
  }

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    let p = confettiParticles[i];
    fill(p.col);
    noStroke();
    ellipse(p.x, p.y, p.size);
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 4;
    p.col.setAlpha(p.alpha);
    if (p.alpha <= 0) confettiParticles.splice(i, 1);
  }

  if (pacman.alive || gameOver) {
    drawPacman(pacman.x, pacman.y, pacman.size, pacman.dir);
  }

  fill(0);
  textSize(18);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 20, 20);

  if (!mangoOnly) {
    fill(255, 200, 0);
    noStroke();
    rect(0, 0, map(millis() - startTime, 0, mangoTakeoverTime, 0, width), 8);
  } else if (gameOver) {
    fill(255, 130, 0); // mango color
    textSize(36);
    textAlign(CENTER, CENTER);
    text("Game Over!! Press a key to play again", width / 2, height / 2);
  }
}

function keyPressed() {
  if (gameOver) {
    clouds = [];
    confettiParticles = [];
    cloudsMoving = true;
    mangoOnly = false;
    score = 0;
    pacman = { x: 400, y: 250, size: 40, speed: 4, alive: false, dir: "right" };
    gameOver = false;
    startTime = millis();
  }
}

function drawPacman(x, y, size, dir) {
  fill(255, 255, 0);
  noStroke();
  let a = PI / 6, start, end;
  if (dir === "right") { start = a; end = TWO_PI - a; }
  else if (dir === "left") { start = PI + a; end = PI - a; }
  else if (dir === "up") { start = -HALF_PI + a; end = -HALF_PI - a + TWO_PI; }
  else if (dir === "down") { start = HALF_PI + a; end = HALF_PI - a; }
  else { start = a; end = TWO_PI - a; }
  arc(x, y, size, size, start, end, PIE);

  fill(0);
  let offset = size * 0.2;
  let ex = x, ey = y;
  if (dir === "right") { ex -= offset; ey -= offset; }
  if (dir === "left") { ex += offset; ey -= offset; }
  if (dir === "up") { ex -= offset; ey += offset; }
  if (dir === "down") { ex -= offset; ey -= offset; }
  ellipse(ex, ey, size * 0.14);
}

function generatePuffs(x, y, size) {
  let puffs = [];
  let count = int(random(2, 5));
  for (let i = 0; i < count; i++) {
    let angle = random(TWO_PI);
    let distOff = random(size * 0.8, size * 1.0);
    let puffSize = size * random(0.9, 3.3);
    puffs.push({ dx: cos(angle) * distOff, dy: sin(angle) * distOff * 1.5, dsize: puffSize });
  }
  return puffs;
}

function drawCloud(x, y, size, col, puffs, drift = 1) {
  fill(red(col), green(col), blue(col), 190);
  noStroke();
  circle(x, y, size);
  for (let p of puffs) {
    circle(x + p.dx * drift, y + p.dy * drift, p.dsize);
  }
}

function spawnConfetti(x, y) {
  for (let i = 0; i < 20; i++) {
    confettiParticles.push({
      x, y,
      vx: random(-3, 6),
      vy: random(-3, 6),
      alpha: 255,
      col: color(random(200, 255), random(100, 255), random(200, 255)),
      size: random(4, 8)
    });
  }
}

function touchStarted() {
  if (random() < 0.5) {
    let sz = random(35, 60);
    let col = color(random(250, 255), random(230, 255), random(250, 255));
    clouds.push({
      x: mouseX, y: mouseY,
      size: sz,
      speed: random(0.1, 1),
      color: col,
      puffs: generatePuffs(mouseX, mouseY, sz),
      driftFactor: 0.9,
      type: "cloud"
    });
  } else {
    clouds.push({
      x: mouseX, y: mouseY,
      speed: random(0.1, 1),
      emoji: random(emojiList),
      driftFactor: 1,
      type: "emoji"
    });
  }
  return false;
}
