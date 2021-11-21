// Work in Progress

function setup() {
    CANVAS_X = windowWidth;
    CANVAS_Y = windowHeight - 52;

    createCanvas(CANVAS_X, CANVAS_Y);
}

let pos = 0;



function mouseWheel(event) {
    pos += event.delta
    console.log(event.delta);
}

function draw() {
    background("#D9CAB3")
    ellipse(pos/50,90,90,90);
}
