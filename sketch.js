let clouds = [];
let confettiParticles = [];
let cloudsMoving = true;
let emojiList = ["🍎", "🍌", "🍓", "🍇", "🍉", "🍊", "🍍", "🥝", "🍒", "🍐", "🥭"];

let mangoTakeoverTime = 10000; // 10 seconds
let mangoOnly = false;
let startTime;

function setup() {
  createCanvas(800, 500);
  textSize(40);
  textAlign(CENTER, CENTER);
  startTime = millis();
}

function draw() {
  background(150, 200, 215);

  // Mango takeover trigger
 if (!mangoOnly && millis() - startTime > mangoTakeoverTime) {
  mangoOnly = true;
  emojiList = ["🥭"];

  // Convert everything into mango emojis
  for (let c of clouds) {
    c.type = "emoji";
    c.emoji = "🥭";
    c.driftFactor = 1;
    delete c.size;
    delete c.color;
    delete c.puffs;
  }
}

  // Draw and update clouds or emojis
  for (let i = 0; i < clouds.length; i++) {
    let c = clouds[i];

    if (cloudsMoving) {
      c.x += c.speed;
      if (c.driftFactor < 1.5) {
        c.driftFactor += 0.002;
      }
    }

    if (c.type === "emoji") {
      text(c.emoji, c.x, c.y);
    } else {
      drawCloud(c.x, c.y, c.size, c.color, c.puffs, c.driftFactor);
    }

    if (c.x > width + 100) {
      c.x = -100;
    }
  }

  // Draw and update confetti
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    let p = confettiParticles[i];
    fill(p.col);
    noStroke();
    ellipse(p.x, p.y, p.size, p.size);

    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 4;
    p.col.setAlpha(p.alpha);

    if (p.alpha <= 0) {
      confettiParticles.splice(i, 1);
    }
  }

  // Draw timer bar
  if (!mangoOnly) {
    let elapsed = millis() - startTime;
    let barWidth = map(elapsed, 0, mangoTakeoverTime, 0, width);
    fill(255, 200, 0);
    noStroke();
    rect(0, 0, barWidth, 8);
  } else {
    fill(255, 150, 0);
    textSize(20);
    text("Mango Coup", width / 2, 20);
  }
}

function generatePuffs(x, y, size) {
  let puffList = [];
  let numPuffs = int(random(2, 5));
  for (let i = 0; i < numPuffs; i++) {
    let angle = random(TWO_PI);
    let offsetDist = random(size * 0.8, size * 1.0);
    let puffSize = size * random(0.9, 3.3);
    puffList.push({
      dx: cos(angle) * offsetDist,
      dy: sin(angle) * offsetDist * 1.5,
      dsize: puffSize
    });
  }
  return puffList;
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
      x: x,
      y: y,
      vx: random(-3, 6),
      vy: random(-3, 6),
      alpha: 255,
      col: color(random(200, 255), random(100, 255), random(200, 255)),
      size: random(4, 8)
    });
  }
}

function touchStarted() {
  if (clouds.length < 15) {
    if (random() < 0.5) {
      let size = random(35, 60);
      let col = color(random(250, 255), random(230, 255), random(250, 255));
      let newCloud = {
        x: mouseX,
        y: mouseY,
        size: size,
        speed: random(0.1, 1),
        color: col,
        puffs: generatePuffs(mouseX, mouseY, size),
        driftFactor: 0.9,
        type: "cloud"
      };
      clouds.push(newCloud);
    } else {
      let newEmoji = {
        x: mouseX,
        y: mouseY,
        speed: random(0.1, 1),
        emoji: random(emojiList),
        driftFactor: 1,
        type: "emoji"
      };
      clouds.push(newEmoji);
    }
  } else {
    for (let i = clouds.length - 1; i >= 0; i--) {
      let c = clouds[i];
      if (c.type !== "cloud") continue;

      let clicked = false;
      let d = dist(mouseX, mouseY, c.x, c.y);
      if (d < c.size / 2) {
        clicked = true;
      }

      for (let p of c.puffs) {
        let px = c.x + p.dx * c.driftFactor;
        let py = c.y + p.dy * c.driftFactor;
        let pd = dist(mouseX, mouseY, px, py);
        if (pd < p.dsize / 2) {
          clicked = true;
          break;
        }
      }

      if (clicked) {
        spawnConfetti(c.x, c.y);
        clouds.splice(i, 1);
        break;
      }
    }
  }

  return false;
}

function keyPressed() {
  cloudsMoving = !cloudsMoving;
}
