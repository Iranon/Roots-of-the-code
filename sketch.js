var boy;  //the variable where the protagonist sprite will be saved into.
var loc;  //the variable that will contain the location image.
var sheet;  //the variable that will contain the sheet sprite.
var click, p; //variables to manages click events ('p' is where mouseX is stored when mouse is clicked).
var thoughtCount = 0; //variable to count seconds to manage thought screen.
var thoughtClick = true;  //variable to stop thought screen when player clicks after few seconds.
var readPaper = false;  //this variable becomes true when the character reads the message on the paper.
var gotMessage = false; //this variable allows to draw exit screen only after the message has been read.
var runProgram = false; //this variable becomes true when the character interacts with the computer.
var getOut = false, out = false; //this variables manage the exit screen.

//Computer Vision Variables (computer program)
var cap;  //video capture variable
var cScale = 8;  //capture scale
var graph;  //buffer variable to apply posterize filter
var mic;  //variable that will contain micrphone capture
var vol;  //volume variable
var disp; //variable for displacement based on the volume

function preload() {
  loc = loadImage('imgs/location.png');
  sheet = loadImage('imgs/paperSheet.png');
}

function setup() {
  createCanvas(900, 342);

  boy = createSprite(24, 220);
  boy.addAnimation('stop', 'imgs/Idle-1.png', 'imgs/Idle-20.png');  //idle animation
  boy.addAnimation('move', 'imgs/1.png', 'imgs/4.png'); //walk cycle

} //End of setup()

function draw() {
  //console.log(mouseX, mouseY);

  cursor(CROSS);

  rectMode(CORNER);
  image(loc, 0, 0, width, height);  //background layer

  //Manage cursor icon
  cursorIcon();

  if (thoughtCount > 2) {
  moveCharacter();  //move the character to click point
}

  rectMode(CENTER);
  image(sheet, 352, 208, 14, 12);  //paper sheet layer
  drawSprites();  //character layer
  //Interacting with the paper sheet
  if (readPaper && !click) {
    interactPaper();
  }

  //Interacting with the computer
  if(runProgram && !click) {
    captureDisplace();
  }

  //if statement to count 10 seconds
  if (frameCount % 60 == 0 && thoughtCount < 10) {
    thoughtCount ++;  //counting
  }
  //if statement to call thought function
  if (thoughtCount > 1 && thoughtCount < 7 && thoughtClick) {
    thought();
  }

//if statement to draw exit screen
  if(getOut && !click) {
    fill(4);
    rectMode(CORNER);
    rect(0,0,width,height)
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(250);
    text('To be continued...', width/2, height/2);
    out = true;
  }
  //Make exit screen permanent
  if(out){
    fill(4);
    rectMode(CORNER);
    rect(0,0,width,height)
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(250);
    text('To be continued...', width/2, height/2);
  }

} //End of draw()

function cursorIcon() {
  let dPaper = dist(mouseX, mouseY, 354, 212); //paper sheet position
  let dComputer = dist(mouseX, mouseY, 620, 195); //computer position
  if (dPaper < 7) {
    cursor('pointer');
  }
  else if (dComputer < 32){
    cursor('pointer');
  }
  else if (mouseX < 12 && gotMessage){
    cursor('pointer');
  }
  else {cursor(CROSS);}
}

function mouseClicked() {
  if (mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0){ //Clicking inside the canvas
    click = true;
    p = mouseX;
  }
  //Manage paper sheet clicking
  let dPaper = dist(mouseX, mouseY, 354, 212); //paper sheet position
  if (dPaper < 7) {
    readPaper = true;
  }
  else {readPaper = false;} //this line makes the message box disappear if you click out of paper sheet borders

  //Manage computer clicking
  let dComputer = dist(mouseX, mouseY, 620, 195); //computer position
  if (dComputer < 32){
    cvSetup();  //setting Computer Vision configuration
    runProgram = true;
  }
  else {runProgram = false; resizeCanvas(900, 342);}  //this line stops the computer program if you click out of computer borders

//Manage exit clicking
  if(gotMessage && p < 12){
    getOut = true;
  }
}

//Function that makes character thoughts visible on screen
function thought() {
  let thoughtScreen = true;
  if (thoughtScreen) {
    rectMode(CORNER);
    fill(0, 150);
    rect(0, 0, width, height);
    textAlign(CENTER, CENTER);
    textSize(18);
    fill(230);
    text('John seems to be absent, but he should have left me a message', width/2, height/2); //thoughtScreen text
    if (thoughtCount > 3 && click) {
      thoughtClick = false;
    }
  }
}

//Function that manages character movements
function moveCharacter() {
  //Stop the character when the click point is reached
    if (click && boy.position.x == p || boy.position.x == p+1 || boy.position.x == p+2) {
      click = false;
      boy.velocity.x = 0;
      boy.changeAnimation('stop');
    }

  //Move to the right
    if (click && boy.position.x < p) {
      boy.changeAnimation('move');
      boy.mirrorX(-1);
      boy.velocity.x = +3;
    }

  //Move to the left
    if (click && boy.position.x > p) {
      boy.changeAnimation('move');
      boy.mirrorX(1);
      boy.velocity.x = -3;
    }
}

//Function that draws message box relative to the paper sheet
function interactPaper() {
  rectMode(CORNER);
  fill(230, 230);
  rect(0, height*0.6, width, height);
  textAlign(CENTER, CENTER);
  textSize(18);
  textLeading(28);
  fill(16);
  text('Come to Ratz. I\'m waiting there.\n- John -', width/2, height*0.8);
  gotMessage = true;
}

function cvSetup(){
  //ComputerVision setup
  cap = createCapture(VIDEO);
  cap.size(width/cScale, height/cScale);  //creating a scaled video capture
  cap.hide();
  graph = createGraphics(640, 480);
  mic = new p5.AudioIn();
  mic.start();
}

//Computer program function
function captureDisplace() {
  resizeCanvas(640, 480);
  vol = mic.getLevel(); //getting the volume
  disp = map(vol, 0, 1, 0, 2);
  cap.loadPixels();
  //Scanning the video capture
  for (var y = 0; y < cap.height; y++){
    for (var x = 0; x < cap.width; x++){
      var off = (x + (y * cap.width)) * 4;  //moving through the pixel array
      var r = cap.pixels[off+0] + 8;
      var g = cap.pixels[off+1] + 16;
      var b = cap.pixels[off+2] * 2;
      var alph = cap.pixels[off+3];
      graph.fill(r, g, b, alph);  //fill rectangles with pixel color
      rectMode(CENTER);
      graph.rect(x*cScale + random(disp) * 6, y*cScale + random(disp) * 4, cScale, cScale); //drawing rectangles into the graph buffer
    }
  }
  image(graph, 0, 0, 640, 480);
  filter(POSTERIZE, 6);
}
