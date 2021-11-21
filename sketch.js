class Particle {
  constructor(x, y, vX = 0, vY = 0) {
    this.x = x;
    this.y = y;
    this.velocityX = vX;
    this.velocityY = vY;
    this.pBest = Number.MAX_VALUE;
    this.pBestX = x;
    this.pBestY = y;
  }

  getXPos() { return this.x; }
  getYPos() { return this.y; }
  getVelocityX() { return this.velocityX; }
  getVelocityY() { return this.velocityY; }
  getPBest() { return this.pBest; }

  setXPos(newXPos) { this.x = newXPos; }
  setYPos(newYPos) { this.y = newYPos; }
  setVelocityX(newVelocityX) { this.velocityX = newVelocityX; }
  setVelocityY(newVelocityY) { this.velocityY = newVelocityY; }
  setPBest(newPBest) { this.pBest = newPBest; }

  toString() {
    return `X Pos: ${this.x} Y Pos: ${this.y} X Velocity: ${this.velocityX} Y Velocity: ${this.velocityY} Personal Best: ${this.pBest}`;
  }

  reset(outwards) {
    this.velocityX = outwards * (-1 + (2 * Math.random()));
    this.velocityY = outwards * (-1 + (2 * Math.random()));
    this.pBest = Number.MAX_VALUE;
    this.pBestX = this.x;
    this.pBestY = this.y;
    this.update();
  }

  update() {

    /*
    Personal and Global best updates
    */
    let error = getError(this.x, this.y);
    if (error < this.pBest) {
      this.pBest = error;
      this.pBestX = this.x;
      this.pBestY = this.y;
    }

    if (error < gBest) {
      gBest = error;
      gBestX = this.x;
      gBestY = this.y;
    }

    /*
    Position Updates
    */
    this.setXPos(this.getXPos() + this.getVelocityX());
    this.setYPos(this.getYPos() + this.getVelocityY());

    /*
    Velocity Updates
    */
    let r1 = Math.random();
    let r2 = Math.random();
    this.velocityX = w * this.velocityX + c1 * r1 * (this.pBestX - this.x) + c2 * r2 * (gBestX - this.x);
    this.velocityY = w * this.velocityY + c1 * r1 * (this.pBestY - this.y) + c2 * r2 * (gBestY - this.y);

    /*
    Overflow Correction
    */
    if (this.getXPos() >= CANVAS_X - 1) {
      this.setXPos(CANVAS_X - 1);
      this.velocityX *= -1; // bounce it off the wall
    }
    if (this.getYPos() >= CANVAS_Y - 1) {
      this.setYPos(CANVAS_Y - 1);
      this.velocityY *= -1;
    }
    if (this.getXPos() <= 0) {
      this.setXPos(0);
      this.velocityX *= -1;
    }
    if (this.getYPos() <= 0) {
      this.setYPos(0);
      this.velocityY *= -1;
    }
  }
}

function getError(x, y) { // same as distance but different functions for the sake of integrity
  return Math.sqrt(Math.pow(TARGET_POS_X - x, 2) + Math.pow(TARGET_POS_Y - y, 2));
}

let NUM_PARTICLES = 100;
let CANVAS_X;
let CANVAS_Y;
let TARGET_POS_Y;
let TARGET_POS_X;
let particles = [];
let gBest = Number.MAX_VALUE;
let gBestX = 0;
let gBestY = 0;
let lastX;
let lastY;


/* Aesthetics */
let magnitudeCoeff = 0.04; // experimentally determined
let r1 = 255;
let g1 = 15;
let b1 = 123;
let r2 = 255;
let g2 = 193;
let b2 = 68;

/* Hyperparameters */
let w = 0.9;
let c1 = 0.1; // if this is too high, there's excess wandering
let c2 = 0.1; // if this is too high, particles converge prematurely
let splat = 0.1; // range of inital velocity upon target change
let PARAM_SUM = w + c1 + c2;

let m = false;

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

let maxVal = 0;

function renderArrow(element) {
  let v0 = createVector(element.getXPos(), element.getYPos());
  let v1 = createVector(element.getVelocityX(), element.getVelocityY());
  let magnitude = distance(0, 0, element.getVelocityX(), element.getVelocityY());
  let maxMagnitude = magnitudeCoeff * distance(0, 0, CANVAS_X, CANVAS_Y);
  let rNew = map(magnitude, 0, maxMagnitude, r1, r2);
  let gNew = map(magnitude, 0, maxMagnitude, g1, g2);
  let bNew = map(magnitude, 0, maxMagnitude, b1, b2);

  drawArrow(v0, v1, color(rNew, gNew, bNew));
}

function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(2.5);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 2;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}

function mouseClicked() {
  if (mouseX >= 0 && mouseX <= CANVAS_X && mouseY >= 0 && mouseY <= CANVAS_Y && clickAllowed()) {
    lastX = TARGET_POS_X;
    lastY = TARGET_POS_Y;
    TARGET_POS_X = mouseX;
    TARGET_POS_Y = mouseY;
    gBest = Number.MAX_VALUE;
    particles.forEach(element => {
      element.reset(splat * distance(TARGET_POS_X, TARGET_POS_Y, lastX, lastY));
    });
  }
}

function clickAllowed() {
  if (mouseX > 300 || mouseY > 180 || mouseX < 10 || mouseY < 10) {
    return true;
  } else {
    return false;
  }
}


// viewed flag
let viewed = true;
// if(sessionStorage.getItem("status") == "pooped") {
//   viewed = true;
// }
// sessionStorage.setItem("status","pooped")

let firstSlide;

function preload() {
  firstSlide = loadImage("assets/FirstPSO.png");
}
let DOM_X_OFFSET = 30;
let DOM_Y_OFFSET = 32;

function setup() {
  CANVAS_X = windowWidth;
  CANVAS_Y = windowHeight - 52;
  TARGET_POS_X = CANVAS_X / 2;
  TARGET_POS_Y = CANVAS_Y / 2;
  lastX = CANVAS_X / 2;
  lastY = CANVAS_Y / 2;
  createCanvas(CANVAS_X, CANVAS_Y);

  inertiaInput = createInput(0.9, "number");
  inertiaInput.position(DOM_X_OFFSET + 40, DOM_Y_OFFSET + 70);
  inertiaInput.size(50);

  personalInput = createInput(0.1, "number");
  personalInput.position(DOM_X_OFFSET + 165, DOM_Y_OFFSET + 100);
  personalInput.size(50);

  globalInput = createInput(0.1, "number");
  globalInput.position(DOM_X_OFFSET + 150, DOM_Y_OFFSET + 130);
  globalInput.size(50);

  numParticleInput = createInput(100, "number");
  numParticleInput.position(DOM_X_OFFSET + 130, DOM_Y_OFFSET + 160);
  numParticleInput.size(50);

  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new Particle(parseInt(CANVAS_X * (-1 + (2 * Math.random()))), parseInt(CANVAS_Y * (-1 + (2 * Math.random()))), 5 * (-1 + (2 * Math.random())), 5 * (-1 + (2 * Math.random()))));
  }
}

function showPopup() {
  fill("#F6F6F6");
  let popupWidth = 590;
  let popupHeight = 590;

  stroke(0,0,0);
  strokeWeight(1);
  rect(CANVAS_X / 2 - popupWidth / 2, CANVAS_Y / 2 - popupHeight / 2, popupWidth, popupHeight, 5)

  // let explanation = `Particle Swarm Optimization (PSO) is an optimization algorithm inspired by the way animals like birds or fish find food in an environment. There exist many different agents, all looking to minimize their error (in this case, distance from the red dot). The particles share knowledge of the best state found by the whole swarm as well as the best state its found and its momentum. Inertia: The momentum of a particle Personal Best Coefficient: How individualistic particles are Global Best Coefficient: How group-minded particles are Splat: How much particle spread on being assigned a new target`;

  fill(0,0,0);
  noStroke();
  textFont("sans-serif", 27);
  text("Particle Swarm Optimization", CANVAS_X / 2 - popupWidth / 2 + 25, CANVAS_Y / 2 - popupHeight / 2 + 10, popupWidth);
  textFont("sans-serif", 15);
  // text(explanation, CANVAS_X / 2 - popupWidth / 2 + 5, CANVAS_Y / 2 - popupHeight / 2 + 40, 390)
}

function showFirstPage() {
  return;
}


function draw() {
  background("#D9CAB3") // (197, 199, 196); //
  /* Hyperparameters START */

  fill("#F6F6F6")//()//(255,255,255); // TODO: Make this not shitty "#F6F6F6"
  rect(10, 10, 300, 165, 5);
  fill(0, 0, 0);
  textSize(20);
  text("Hyperparameters", 20, 40);
  textSize(15);
  text("Inertia: ", 20, 70);
  text("Personal Best Coefficient: ", 20, 100);
  text("Global Best Coefficient: ", 20, 130);
  text("Number of Particles: ", 20, 160);

  w = parseFloat(inertiaInput.value());
  c1 = parseFloat(personalInput.value());
  c2 = parseFloat(globalInput.value());

  let updatedSum = w + c1 + c2;
  let correctionFactor = PARAM_SUM / updatedSum;
  w *= correctionFactor;
  c1 *= correctionFactor;
  c2 *= correctionFactor;

  if (numParticleInput != NUM_PARTICLES && numParticleInput.value() >= 0) {
    if (numParticleInput.value() > NUM_PARTICLES) {
      for (let i = NUM_PARTICLES; i < numParticleInput.value(); i++) {
        particles.push(new Particle(parseInt(CANVAS_X * (-1 + (2 * Math.random()))), parseInt(CANVAS_Y * (-1 + (2 * Math.random()))), 5 * (-1 + (2 * Math.random())), 5 * (-1 + (2 * Math.random()))));
      }
    } else {
      particles = particles.slice(0, NUM_PARTICLES);
    }
    NUM_PARTICLES = numParticleInput.value();
  }

  console.log(numParticleInput.value(), NUM_PARTICLES)
  /* Hyperparameters END */

  frameRate(30);
  fill(255, 0, 0);
  noStroke();
  ellipse(TARGET_POS_X, TARGET_POS_Y, 20, 20);
  fill(0);
  particles.forEach(element => {
    renderArrow(element);
    element.update();
  });

  if (!viewed) {
    showPopup();
  }

  // firstSlide.resize(400, 400);
  // image(firstSlide, CANVAS_X / 2 - 200, CANVAS_Y / 2 - 200);
}
