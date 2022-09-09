class Particle {
  constructor(x, y, vX = 0, vY = 0) {
    this.x = x;
    this.y = y;
    this.velocityX = vX;
    this.velocityY = vY;
    this.pBest = Number.MAX_VALUE;
    this.pBestX = x;
    this.pBestY = y;
    this.startPoints = [];
    this.endPoints = [];
    this.errors = [];
    this.converged = false;
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
    this.startPoints = [];
    this.endPoints = [];
    this.errors = [];
    this.converged = false;
    this.velocityX = outwards * randRange(-1 * slopeInitialVelocity, slopeInitialVelocity); // M
    this.velocityY = outwards * randRange(-4 * interceptInitialVelocity, interceptInitialVelocity); // B
    this.pBest = Number.MAX_VALUE;
    this.pBestX = this.x;
    this.pBestY = this.y;
  }

  update() {
    if (distance(0, 0, this.getVelocityX(), this.getVelocityY()) <= 0.1) {
      this.converged = true;
    }
    /* 
    Trails
    */
    if (!this.converged && this.startPoints.length <= MAX_TRAIL_LENGTH) {
      let mPointS = mapPoint(this.x, this.y);
      this.startPoints.push([mPointS[0], mPointS[1]]);
    }
    /*
    Personal and Global best updates
    */
    let error = getError(this.x, this.y);
    if (!this.converged && this.errors.length <= MAX_TRAIL_LENGTH) {
      let r1_new = 255;
      let g1 = 15;
      let b1 = 123;
      let r2_new = 255;
      let g2 = 193;
      let b2 = 68;

      let a = map(error, 0, maxMagnitude, r1_new, r2_new);
      let b = map(error, 0, maxMagnitude, g1, g2);
      let c = map(error, 0, maxMagnitude, b1, b2);
      this.errors.push(color(a, b, c));
    }
    if (error < this.pBest) {
      this.pBest = error;
      this.pBestX = this.x;
      this.pBestY = this.y;
    }

    if (error < gBest) {
      gBest = error;
      gBestM = this.x;
      gBestB = this.y;
    }

    /*
    Position Updates
    */
    this.setXPos(this.getXPos() + this.getVelocityX());
    this.setYPos(this.getYPos() + this.getVelocityY());
    if (!this.converged && this.endPoints.length <= MAX_TRAIL_LENGTH) {
      let mPointE = mapPoint(this.x, this.y);
      this.endPoints.push([mPointE[0], mPointE[1]]);
    }
    /*
    Velocity Updates
    */
    let r1 = Math.random();
    let r2 = Math.random();
    this.velocityX = w * this.velocityX + c1 * r1 * (this.pBestX - this.x) + c2 * r2 * (gBestM - this.x);
    this.velocityY = w * this.velocityY + c1 * r1 * (this.pBestY - this.y) + c2 * r2 * (gBestB - this.y);

    /*
    Overflow Correction
    */
    if (this.getXPos() > 4) {
      this.setXPos(4);
      this.velocityX *= -1; // bounce it off the wall
    }
    if (this.getYPos() >= CANVAS_Y - 20) {
      this.setYPos(CANVAS_Y - 20);
      this.velocityY *= -1;
    }
    if (this.getXPos() < -4) {
      this.setXPos(-4);
      this.velocityX *= -1;
    }
    if (this.getYPos() < 0) {
      this.setYPos(0);
      this.velocityY *= -1;
    }
  }
}

/* TRAILS */
let maxMagnitude = 0;
let MAX_TRAIL_LENGTH = 100;
let TRAIL_GRANULARITY = 1;
let NUM_PARTICLES = 50;
let particles = [];

let gBest = Number.MAX_VALUE;
let gBestM = 0;
let gBestB = 0;

let startSimul = false;

let points = [];
let adjustedPoints = [];
let originX = 0;
let originY = 0;

/* Hyperparameters */
let w = 0.9; // 0.9
let c1 = 0.1; // 0.1 if this is too high, there's excess wandering
let c2 = 0.02; // 0.1 if this is too high, particles converge prematurely
let n = 50;
let PARAM_SUM = w + c1 + c2;

let interceptInitialVelocity = 10; // 5
let slopeInitialVelocity = 0.3; // 0.1

let expanded = false;
let showError = true;
let showDeviations = true;

// Things for Aesthetics
/* Aesthetics */
let magnitudeCoeff = 0.01; // experimentally determined
let r1 = 255;
let g1 = 15;
let b1 = 123;
let r2 = 255;
let g2 = 193;
let b2 = 68;

function addParticles() {
  for (let i = 0; i < NUM_PARTICLES; i++) {
    // m init from -4 to 4 
    // b init from 0 to CANVAS_Y - 20
    particles.push(new Particle(randRange(-4, 4), randRange(0, CANVAS_Y - 20), randRange(-1 * slopeInitialVelocity, slopeInitialVelocity), randRange(-1 * interceptInitialVelocity, interceptInitialVelocity)));
  }
}

let dropDownLocationX;
let dropDownLocationY;

let DOM_X_OFFSET = 0;
let DOM_Y_OFFSET = 0;

function setup() {
  CANVAS_X = windowWidth;
  CANVAS_Y = windowHeight - 52;

  DOM_X_OFFSET = CANVAS_X - 290;
  DOM_Y_OFFSET = 32;

  dropDownLocationX = CANVAS_X - 50;
  dropDownLocationY = 170;

  addParticles();

  showInputs();

  createCanvas(CANVAS_X, CANVAS_Y);
  button = createButton('Calculate Best Fit Line');
  button.position(20, 60);
  button.mouseClicked(recompute);

  clearButton = createButton('Clear Points');
  clearButton.position(20, 90);
  clearButton.mouseClicked(clearPoints);
}

function showInputs() {
  inertiaInput = createInput(w.toString(), "number");
  inertiaInput.position(CANVAS_X - 290 + 40, DOM_Y_OFFSET + 70);
  inertiaInput.size(50);

  personalInput = createInput(c1.toString(), "number");
  personalInput.position(CANVAS_X - 290 + 165, DOM_Y_OFFSET + 100);
  personalInput.size(50);

  globalInput = createInput(c2.toString(), "number");
  globalInput.position(CANVAS_X - 290 + 150, DOM_Y_OFFSET + 130);
  globalInput.size(50);

  numParticleInput = createInput(n.toString(), "number");
  numParticleInput.position(CANVAS_X - 290 + 145, DOM_Y_OFFSET + 160);
  numParticleInput.size(50);
}

function clearPoints() {
  canAdd = false;
  gBestM = 0;
  gBestB = 0;
  points = [];
  adjustedPoints = [];
  particles = [];
  addParticles();
  startSimul = false;
}

function recompute() {
  if (points.length >= 0) {
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
  if ((mouseX >= CANVAS_X - 310 && mouseX <= CANVAS_X - 10 && mouseY <= 50 && mouseY >= 10) || mouseX >= dropDownLocationX && mouseX <= dropDownLocationX + 20 && mouseY <= dropDownLocationY + 5 && mouseY >= dropDownLocationY + -7) {
    expanded = !expanded;
  }
  if (canAdd) {
    gBest = Number.MAX_VALUE;
    let adjustedCoordinates = toCoordinates([mouseX, mouseY]);
    if (mouseX <= CANVAS_X / 2 - 10 && mouseY >= 0 && adjustedCoordinates[0] >= 0 && adjustedCoordinates[1] >= 0) {
      adjustedPoints.push(adjustedCoordinates);
      points.push([mouseX, mouseY]);
      particles.forEach(particle => {
        particle.reset(pointLineError(mouseX, mouseY, gBestM, gBestB) / CANVAS_Y); // CANVAS_Y is the theoretical max error
      });
    }
  } else {
    canAdd = true;
  }
}

function pointLineError(x, y, m, b) {
  let adjustedCoords = toCoordinates([x, y]);
  let predicted = m * x + b
  return Math.abs(predicted - adjustedCoords[1]);
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

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function renderArrow(element, xPos, yPos) {
  let tailCoeff = 1.5;
  let v0 = createVector(xPos, yPos);
  let mappedXVelocity = map(element.getVelocityX(), -1 * slopeInitialVelocity, slopeInitialVelocity, -1 * interceptInitialVelocity, interceptInitialVelocity);
  let v1 = createVector(tailCoeff * mappedXVelocity, -tailCoeff * element.getVelocityY()); // -1* because inverting points to make slopes line up
  let magnitude = distance(0, 0, mappedXVelocity, element.getVelocityY());
  let rNew = map(magnitude, 0, maxMagnitude, r1, r2);
  let gNew = map(magnitude, 0, maxMagnitude, g1, g2);
  let bNew = map(magnitude, 0, maxMagnitude, b1, b2);

  drawArrow(v0, v1, color(rNew, gNew, bNew));
}

function drawArrow(base, vec, myColor) {
  let arrowSize = 6;
  push();
  stroke(myColor);
  strokeWeight(2.5);
  fill(myColor);
  translate(base.x, base.y);
  
  line(0, 0, vec.x, vec.y);
  arrowSize = 2;
  
  rotate(vec.heading());
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize * 2, 0);
  pop();
}

function adjustErrorEndpoint(x, m, b) {
  let predictedY = m * x + b;
  let LINE_ADJUST_POSITIVE = 0.006;
  let LINE_ADJUST_NEGATIVE = -0.002;
  if (m > 0) {
    return predictedY + LINE_ADJUST_POSITIVE * x;
  } else if (m < 0) {
    return predictedY + LINE_ADJUST_NEGATIVE * x;
  } else {
    return b;
  }
}

function mapPoint(m, b) {
  // randRange(-4, 4), randRange(0, CANVAS_Y - 20)
  return [map(m, -4, 4, CANVAS_X / 2, CANVAS_X), CANVAS_Y - b];
}

let FANCY_POINTS = true;
function draw() {
  frameRate(60);

  background("#D9CAB3") //(197, 199, 196); // canvas background
  fill("#F6F6F6")//(255, 255, 255); // graph background
  rect(0, 0, CANVAS_X / 2, CANVAS_Y);
  strokeWeight(1);

  /* Canvas Updates */
  CANVAS_X = windowWidth;
  CANVAS_Y = windowHeight - 52;
  DOM_X_OFFSET = CANVAS_X - 290;
  dropDownLocationX = CANVAS_X - 50;
  /* End Canvas Updates */

  // Particle Updates
  fill("#212121");
  if (startSimul && points.length != 0) {
    particles.forEach(particle => {
      drawLine(particle.x, particle.y);
      particle.update();
      if (particle.startPoints.length != particle.endPoints.length) {
        console.log("WOOOOO WOOOOO");
      }
    });
  }

  // Current Best line
  if (showError) {
    stroke(47, 146, 222);
    strokeWeight(3);
    if (gBestM != 0 && gBestB != 0) {
      drawLine(gBestM, gBestB);
      for (let i = 0; i < points.length; i++) {
        let pointOnLineX = adjustedPoints[i][0];
        let pointOnLineY = adjustErrorEndpoint(pointOnLineX, gBestM, gBestB) // gBestM * adjustedPoints[i][0] + gBestB;
        let adjustedPoint = toDisplayCoordinates([pointOnLineX, pointOnLineY]);
        strokeWeight(1);
        fill(0, 255, 0);
        if (Math.abs(adjustedPoint[1] - points[i][1]) > 5) {
          if (points[i][1] < adjustedPoint[1]) {
            line(adjustedPoint[0], adjustedPoint[1], points[i][0], points[i][1] + 5);
          } else {
            line(adjustedPoint[0], adjustedPoint[1], points[i][0], points[i][1] - 5);
          }
        }

      }
    }
    stroke(0, 0, 0);
    strokeWeight(0.5);
  }

  // Graph
  pointColor = color(109, 152, 134, 150);
  fill(pointColor); //("#6D9886");
  strokeWeight(1);
  points.forEach(point => {
    ellipse(point[0], point[1], 10, 10);
  });
  maxMagnitude = distance(0, 0, CANVAS_X / 2, CANVAS_Y);

  /* Trails */
  if (showError) {
    strokeWeight(1);
    particles.forEach((particle) => {
      for (let i = 0; i < particle.startPoints.length; i++) {
        stroke(particle.errors[i]);
        if (particle.startPoints[i][0] > CANVAS_X / 2 && particle.endPoints[i][0] > CANVAS_X / 2) {
          line(particle.startPoints[i][0], particle.startPoints[i][1], particle.endPoints[i][0], particle.endPoints[i][1]);
        }
      }
    });
    stroke(0);
  }

  // Particle Visualization
  particles.forEach((particle) => {
    let mappedPoint = mapPoint(particle.x, particle.y);
    if (FANCY_POINTS) {
      renderArrow(particle, mappedPoint[0], mappedPoint[1]);
    } else {
      fill(255, 0, 0, 200);
      ellipse(mappedPoint[0], mappedPoint[1], 10, 10);
    }
  });

  // Hyperparameters

  w = parseFloat(inertiaInput.value()); // 0.4
  c1 = parseFloat(personalInput.value()); // 0.5
  c2 = parseFloat(globalInput.value()); // 0.4
  n = numParticleInput.value();

  let updatedSum = w + c1 + c2;
  let correctionFactor = PARAM_SUM / updatedSum;
  w *= correctionFactor;
  c1 *= correctionFactor;
  c2 *= correctionFactor;

  if (w < 0 || w > 1) {
    w = constrain(w, 0, 1);
    inertiaInput.value(`${w}`);
  }
  if (c1 < 0 || c1 > 1) {
    c1 = constrain(c1, 0, 1);
    personalInput.value(`${c1}`);
  }
  if (c2 < 0 || c2 > 1) {
    c2 = constrain(c2, 0, 1);
    globalInput.value(`${c2}`);
  }
  if (n < 0 || numParticleInput.value() == "") {
    n = 1;
    numParticleInput.value(`${n}`);
  }

  if (numParticleInput.value() != NUM_PARTICLES && numParticleInput.value() >= 1) {
    if (numParticleInput.value() > NUM_PARTICLES) {
      for (let i = NUM_PARTICLES; i < numParticleInput.value(); i++) {
        particles.push(new Particle(randRange(-4, 4), randRange(0, CANVAS_Y - 20), randRange(-1 * slopeInitialVelocity, slopeInitialVelocity), randRange(-1 * interceptInitialVelocity, interceptInitialVelocity)));
      }
    } else {
      particles = particles.slice(0, numParticleInput.value());
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
    numParticleInput.show();
    fill(246, 246, 246, 200); //(255, 255, 255); // TODO: Make this not shitty
    rect(CANVAS_X - 310, 10, 300, 180, 5);
    fill(0, 0, 0);
    textSize(20);
    text("Hyperparameters", CANVAS_X - 300, 40);
    textSize(15);
    text("Inertia: ", CANVAS_X - 300, 70);
    text("Personal Best Coefficient: ", CANVAS_X - 300, 100);
    text("Global Best Coefficient: ", CANVAS_X - 300, 130);
    text("Number of Estimators: ", CANVAS_X - 300, 160);
    strokeWeight(5);
    dropDownLocationY = 170;
    line(dropDownLocationX, dropDownLocationY + 5, dropDownLocationX + 10, dropDownLocationY - 5);
    line(dropDownLocationX + 10, dropDownLocationY - 5, dropDownLocationX + 20, dropDownLocationY + 5);
  } else {
    fill(246, 246, 246, 200);
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
    numParticleInput.hide();
  }
}
