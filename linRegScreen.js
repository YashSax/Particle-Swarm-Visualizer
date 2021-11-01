/** TODO:
 * Make error deviation drawing not shitty
 * 
 */

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
    this.velocityX = outwards * randRange(-1 * slopeInitialVelocity, slopeInitialVelocity); // M
    this.velocityY = outwards * randRange(-4 * interceptInitialVelocity, interceptInitialVelocity); // B
    this.pBest = Number.MAX_VALUE;
    this.pBestX = this.x;
    this.pBestY = this.y;
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
    if (this.getXPos() > 4) {
      this.setXPos(4);
      this.velocityX *= -1; // bounce it off the wall
    }
    if (this.getYPos() >= CANVAS_Y - 20 + 1000000) {
      this.setYPos(CANVAS_Y - 20);
      this.velocityY *= -1;
    }
    if (this.getXPos() < -4) {
      this.setXPos(-4);
      this.velocityX *= -1;
    }
    if (this.getYPos() < 0 - 1000000) {
      this.setYPos(0);
      this.velocityY *= -1;
    }
  }
}


let NUM_PARTICLES = 50;
let particles = [];
let gBest = Number.MAX_VALUE;
let gBestX = 0;
let gBestY = 0;

let startSimul = false;

let points = [];
let adjustedPoints = [];
let originX = 0;
let originY = 0;

/* Hyperparameters */
let w = 0.9; // 0.9
let c1 = 0.1; // 0.1 if this is too high, there's excess wandering
let c2 = 0.05; // 0.1 if this is too high, particles converge prematurely

let interceptInitialVelocity = 10; // 5
let slopeInitialVelocity = 0.3; // 0.1

let expanded = true;
let showError = false;
let showDeviations;

function addParticles() {
  for (let i = 0; i < NUM_PARTICLES; i++) {
    // m init from -4 to 4 
    // b init from 0 to CANVAS_Y - 20
    particles.push(new Particle(randRange(-4, 4), randRange(0, CANVAS_Y - 20), randRange(-1 * slopeInitialVelocity, slopeInitialVelocity), randRange(-1 * interceptInitialVelocity, interceptInitialVelocity)));
  }
}

let dropDownLocationX;
let dropDownLocationY;

function setup() {
  CANVAS_X = windowWidth;
  CANVAS_Y = windowHeight - 52;

  let DOM_X_OFFSET = CANVAS_X - 290;
  let DOM_Y_OFFSET = 32;

  dropDownLocationX = CANVAS_X - 50;
  dropDownLocationY = 170;

  addParticles();

  inertiaInput = createInput(w, "number");
  inertiaInput.position(DOM_X_OFFSET + 40, DOM_Y_OFFSET + 70);
  inertiaInput.size(50);

  personalInput = createInput(c1, "number");
  personalInput.position(DOM_X_OFFSET + 165, DOM_Y_OFFSET + 100);
  personalInput.size(50);

  globalInput = createInput(c2, "number");
  globalInput.position(DOM_X_OFFSET + 150, DOM_Y_OFFSET + 130);
  globalInput.size(50);

  numParticleInput = createInput(50, "number");
  numParticleInput.position(DOM_X_OFFSET + 145, DOM_Y_OFFSET + 160);
  numParticleInput.size(50);
  
  showDeviations = createCheckbox('', false);
  showDeviations.position(DOM_X_OFFSET - 13, DOM_Y_OFFSET + 185)
  showDeviations.changed(checkEvent);

  createCanvas(CANVAS_X, CANVAS_Y);
  button = createButton('Calculate Best Fit Line');
  button.position(20, 60);
  button.mouseClicked(recompute);

  clearButton = createButton('Clear Points');
  clearButton.position(20, 90);
  clearButton.mouseClicked(clearPoints);

}

function checkEvent() {
  showError = !showError;
}

function clearPoints() {
  canAdd = false;
  gBestX = 0;
  gBestY = 0;
  points = [];
  adjustedPoints = [];
  particles = [];
  addParticles();
  startSimul = false;
}

function recompute() {
  if (points.length > 0) {
    canAdd = false;
    gBest = Number.MAX_VALUE;
    startSimul = true;
    particles.forEach(particle => {
      particle.reset(1);
    });
  }
}

function randRange(l, u) {
  return l + Math.abs(Math.random()) * (u - l);
}

let canAdd = true;
function mouseClicked() {
  if (mouseX >= dropDownLocationX && mouseX <= dropDownLocationX + 20 && mouseY <= dropDownLocationY + 5 && mouseY >= dropDownLocationY + -7) {
    expanded = !expanded;
  }
  if (canAdd) {
    gBest = Number.MAX_VALUE;
    let adjustedCoordinates = toCoordinates([mouseX, mouseY]);
    if (mouseX <= CANVAS_X / 2 - 10 && adjustedCoordinates[0] >= 0 && adjustedCoordinates[1] >= 0) {
      adjustedPoints.push(adjustedCoordinates);
      points.push([mouseX, mouseY]);
    }
  } else {
    canAdd = true;
  }
}

function getError(m, b) {
  // mean squared error
  let error = 0;
  adjustedPoints.forEach(point => {
    let prediction = m * point[0] + b;
    error += Math.pow(point[1] - prediction, 2);
  });
  return Math.sqrt(error);
}

function drawLine(m, b) {
  line(10, CANVAS_Y - 10 - b, CANVAS_X / 2 - 10, CANVAS_Y - 10 - (b + m * (CANVAS_X / 2 - 10)));
}

function toCoordinates(point) {
  return [point[0] - 10, (CANVAS_Y - 10) - point[1]]; // y reversed because counts from top down
}

function toDisplayCoordinates(point) {
  return [point[0] + 10, (CANVAS_Y - 10) - point[1]];
}

function renderArrow(element) {
  let v0 = createVector(element.getXPos(), element.getYPos());
  let v1 = createVector(element.getVelocityX(), element.getVelocityY());
  let magnitude = distance(0, 0, element.getVelocityX(), element.getVelocityY());
  let maxMagnitude = magnitudeCoeff * distance(0, 0, CANVAS_X, CANVAS_Y);
  let rNew = map(magnitude, 0, maxMagnitude, r1, r2);
  let gNew = map(magnitude, 0, maxMagnitude, g1, g2);
  let bNew = map(magnitude, 0, maxMagnitude, b1, b2);

  drawArrow(v0, v1, color(rNew, gNew, bNew));
  noStroke();
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

function adjustErrorEndpoint(x, m, b) {
  let predictedY = m*x + b;
  LINE_ADJUST = 0.01;
  if(m > 0) {
    return predictedY + LINE_ADJUST * x;
  } else if (m < 0) {
    return predictedY - LINE_ADJUST * x;
  } else {
    return b;
  }
  
}

function drawError(m, b) {
  for (let i = 0; i < point.length; i++) {
    let pointOnLineY = m * adjustedPoints[i][0] + b;
    let pointOnLineX = adjustedPoints[i][0];
    ellipse(pointOnLineX, pointOnLineY, 10, 10);
    // fill(0,0,255);
    // strokeWeight(1);
    // line(pointOnLineX, pointOnLineY, points[i][0], points[i][1]);
  }
}

function draw() {
  frameRate(60);
  background("#D9CAB3") //(197, 199, 196); // canvas background
  fill("#F6F6F6")//(255, 255, 255); // graph background
  rect(0, 0, CANVAS_X / 2, CANVAS_Y);
  strokeWeight(1);

  // Particle Updates
  fill("#212121");
  if (startSimul && points.length != 0) {
    particles.forEach(particle => {
      drawLine(particle.x, particle.y);
      particle.update();
    });
  }
  
  // Current Best line
  if (showError) {
    stroke(0, 255, 0);
    strokeWeight(3);
    if (gBestX != 0 && gBestY != 0) {
      drawLine(gBestX, gBestY);
      for (let i = 0; i < points.length; i++) {
        let pointOnLineX = adjustedPoints[i][0];
        let pointOnLineY = adjustErrorEndpoint(pointOnLineX, gBestX, gBestY) // gBestX * adjustedPoints[i][0] + gBestY;
        let adjustedPoint = toDisplayCoordinates([pointOnLineX, pointOnLineY]);
        strokeWeight(1);
        fill(0, 255, 0);
        line(adjustedPoint[0], adjustedPoint[1], points[i][0], points[i][1]);
      }
    }
    stroke(0, 0, 0);
    strokeWeight(0.5);
  }

  // Graph
  fill("#6D9886");
  strokeWeight(1);
  points.forEach(point => {
    ellipse(point[0], point[1], 10, 10);
  });

  // Particle Visualization


  // Hyperparameters
  w = inertiaInput.value();
  c1 = personalInput.value();
  c2 = globalInput.value();
  if (numParticleInput != NUM_PARTICLES && numParticleInput.value() >= 0) {
    if(numParticleInput.value() > NUM_PARTICLES) {
      for (let i = NUM_PARTICLES; i < numParticleInput.value(); i++) {
        particles.push(new Particle(randRange(-4, 4), randRange(0, CANVAS_Y - 20), randRange(-1 * slopeInitialVelocity, slopeInitialVelocity), randRange(-1 * interceptInitialVelocity, interceptInitialVelocity)));
      }
    } else {
      particles = particles.slice(0, NUM_PARTICLES);
    }
    NUM_PARTICLES = numParticleInput.value();
  }
  // Dropdown arrow
  showDropdownMenu();

  // Axes
  strokeWeight(0.8);
  line(10, 10, 10, CANVAS_Y - 10); // y axis
  line(10, CANVAS_Y - 10, CANVAS_X / 2 - 10, CANVAS_Y - 10); // x-axis
}

function showDropdownMenu() {
  strokeWeight(0);
  if (expanded) {
    inertiaInput.show();
    personalInput.show();
    globalInput.show();
    showDeviations.show();
    numParticleInput.show();
    fill("#F6F6F6") //(255, 255, 255); // TODO: Make this not shitty
    rect(CANVAS_X - 310, 10, 300, 180, 5);
    fill(0, 0, 0);
    textSize(20);
    text("Hyperparameters", CANVAS_X - 300, 40);
    textSize(15);
    text("Inertia: ", CANVAS_X - 300, 70);
    text("Personal Best Coefficient: ", CANVAS_X - 300, 100);
    text("Global Best Coefficient: ", CANVAS_X - 300, 130);
    text("Number of Estimators: ", CANVAS_X - 300, 160);
    text("Show Error: ", CANVAS_X - 280, 183);
    strokeWeight(5);
    dropDownLocationY = 170;
    line(dropDownLocationX, dropDownLocationY + 5, dropDownLocationX + 10, dropDownLocationY - 5);
    line(dropDownLocationX + 10, dropDownLocationY - 5, dropDownLocationX + 20, dropDownLocationY + 5);
  } else {
    fill(255, 255, 255);
    rect(CANVAS_X - 310, 10, 300, 50, 5);
    fill(0, 0, 0);
    textSize(20);
    text("Hyperparameters", CANVAS_X - 300, 40);
    strokeWeight(5);
    dropDownLocationY = 35;
    line(dropDownLocationX, dropDownLocationY - 5, dropDownLocationX + 10, dropDownLocationY + 5);
    line(dropDownLocationX + 10, dropDownLocationY + 5, dropDownLocationX + 20, dropDownLocationY - 5);
    inertiaInput.hide();
    personalInput.hide();
    globalInput.hide();
    showDeviations.hide();
    numParticleInput.hide();
  }
}