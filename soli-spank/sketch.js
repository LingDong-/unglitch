/* global describe p5 setup draw P2D WEBGL ARROW CROSS HAND MOVE TEXT WAIT HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS DEG_TO_RAD RAD_TO_DEG CORNER CORNERS RADIUS RIGHT LEFT CENTER TOP BOTTOM BASELINE POINTS LINES LINE_STRIP LINE_LOOP TRIANGLES TRIANGLE_FAN TRIANGLE_STRIP QUADS QUAD_STRIP TESS CLOSE OPEN CHORD PIE PROJECT SQUARE ROUND BEVEL MITER RGB HSB HSL AUTO ALT BACKSPACE CONTROL DELETE DOWN_ARROW ENTER ESCAPE LEFT_ARROW OPTION RETURN RIGHT_ARROW SHIFT TAB UP_ARROW BLEND REMOVE ADD DARKEST LIGHTEST DIFFERENCE SUBTRACT EXCLUSION MULTIPLY SCREEN REPLACE OVERLAY HARD_LIGHT SOFT_LIGHT DODGE BURN THRESHOLD GRAY OPAQUE INVERT POSTERIZE DILATE ERODE BLUR NORMAL ITALIC BOLD BOLDITALIC LINEAR QUADRATIC BEZIER CURVE STROKE FILL TEXTURE IMMEDIATE IMAGE NEAREST REPEAT CLAMP MIRROR LANDSCAPE PORTRAIT GRID AXES frameCount deltaTime focused cursor frameRate getFrameRate setFrameRate noCursor displayWidth displayHeight windowWidth windowHeight width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams pushStyle popStyle popMatrix pushMatrix registerPromisePreload camera perspective ortho frustum createCamera setCamera setAttributes createCanvas resizeCanvas noCanvas createGraphics blendMode noLoop loop push pop redraw applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase createStringDict createNumberDict storeItem getItem clearStorage removeItem select selectAll removeElements createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ pRotateDirectionX pRotateDirectionY pRotateDirectionZ turnAxis setMoveThreshold setShakeThreshold isKeyPressed keyIsPressed key keyCode keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveGif saveFrames loadImage image tint noTint imageMode pixels blend copy filter get loadPixels set updatePixels loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo createWriter save saveJSON saveJSONObject saveJSONArray saveStrings saveTable writeFile downloadFile abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont append arrayCopy concat reverse shorten shuffle sort splice subset float int str boolean byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim day hour minute millis month second year plane box sphere cylinder cone ellipsoid torus orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadModel model loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess remove canvas drawingContext*/
/* global describe loadSound */

//This detects if the prototype is opened in Soli Sandbox, and sends an alert to the user that soli functionality will not work in other apps/browswe
// if(!navigator.userAgent.includes("Soli Sandbox")){ alert("This prototype needs to be opened in Soli Sandbox in order to receive Soli Events. Soli functionality will not work.");} else {console.log("Soli Sandbox Detected");}

var handShape = [[648,412],[625,405],[600,409],[527,498],[525,121],[513,102],[486,92],[457,104],[447,127],[449,370],[434,371],[433,44],[422,25],[395,14],[367,23],[355,43],[356,376],[343,377],[343,93],[330,72],[305,61],[279,69],[264,89],[265,397],[256,398],[255,163],[242,143],[219,135],[194,142],[177,162],[176,635],[186,680],[206,720],[238,752],[275,773],[316,783],[363,783],[405,779],[447,766],[487,744],[510,719],[524,692],[548,653],[569,615],[657,457],[659,436]];

var R = 280; // face radius

var SWIPE = 0;

var timer;

var rot = 0;
var extent = 0;


var hands = [];

var redness = 0.0;

var sfx1,sfx2,sfx3;



function setup(){ //When the page loads
  createCanvas(window.innerWidth,window.innerHeight);

  sfx1 = loadSound('/soli-spank/glitch-assets/slap1.mp3');
  sfx2 = loadSound('/soli-spank/glitch-assets/slap2.mp3');
  sfx3 = loadSound('/soli-spank/glitch-assets/slap3.mp3');
}

function drawCircularMask(cx,cy,rx,ry){

	beginShape();
	vertex(-100,-100);
	vertex(width+100,-100);
	vertex(width+100,height+100);
	vertex(-100,height+100);
	vertex(-100,-100);

  beginContour();
  for (var i = 0; i <= 64; i++){
      var a = Math.PI*2.0*i/(64.0);
      var x = cx-Math.cos(a)*rx;
      var y = cy+Math.sin(a)*ry;
      vertex(x,y);
  }
  endContour();
  endShape();
}


function draw(){
  
  translate(width/2,height/2);
  rotate(rot*0.3*extent);
  translate(rot*50*extent,0);
  background(30,45,60);
  strokeWeight(5);
  
  fill(Math.min(245+redness,255),130-redness,130-redness);
  stroke(120,60,60);
  
  ellipse(0,0,R+Math.abs(rot)*R*0.1,R);
  
  noFill();
  beginShape();
  for (var i = 0; i < 100; i++){
    var t = i/100;
    var y = t*R-R/2;
    var x = Math.sqrt(1-(t*2-1)*(t*2-1))*R/2*0.8*rot;
    vertex(x,y);
  }
  endShape();
  
  
  if (!SWIPE){
    rot = lerp(rot,0,0.2);
  }else{
    rot = lerp(rot,SWIPE,0.5);
  }

  
  
  for (var k = hands.length-1; k >= 0; k--){
    push();
    noStroke();
    translate(-hands[k].dir*R*0.55+rot*R*0.4+hands[k].x,hands[k].y+R*0.1);
    scale(Math.abs(rot)*0.5+0.5,1);
    rotate(hands[k].ang);
    fill(255,0,0,hands[k].timer*0.1);
    beginShape();
    for (var i = 0; i < handShape.length; i++){
      vertex(
        hands[k].dir*0.75*R*(handShape[i][0]/800-0.5), 
        0.75*R*(handShape[i][1]/800-0.5)
      );
    }
    endShape();
    if (hands[k].timer > 390){
      noFill();
      stroke(255,255,255,(hands[k].timer-390)*5);
      strokeWeight(0.01*R*(hands[k].timer-390));
      circle(0,0,((400-hands[k].timer)+20)*R*0.032);
    }
    pop();
    hands[k].timer--;
    if (hands[k].timer < 0){
      hands.splice(k,1);
    }
  }

  push();
  fill(30,45,60);
  noStroke();
  translate(-width/2,-height/2);
  drawCircularMask(width/2,height/2,R/2+1+Math.abs(rot)*R*0.05,R/2+1);
  pop();
  
  redness = Math.min(redness,80);
  if (redness > 0){
    redness -= 0.8;
  }
  
  fill(0);

}


function windowResized() { //this detects when the window is resized, such as entering fullscreen mode, or changing orientation of the device.
  resizeCanvas(windowWidth, windowHeight); //resizes the canvas to the new dimensions 
}
   

function slap(dir){
  extent = Math.random()+0.2;
  SWIPE = dir;
  hands.push({
    dir,
    x:(Math.random()-0.5)*R*0.2,
    y:(Math.random()-0.5)*R*0.2,
    ang:-dir*(Math.random()*1.2+0.3),
    timer:400,
  });
  
  
  if (timer != null){
    clearTimeout(timer);
  }
  timer = setTimeout(function(){SWIPE=0},800);
  // window.navigator.vibrate(2000);
  redness += 25;
  ;[sfx1,sfx2,sfx3][Math.floor(Math.random()*3)].play();
}

function keyPressed(){
  if (keyCode == LEFT_ARROW){
    slap(-1);
  }else if (keyCode == RIGHT_ARROW){
    slap(1);
  }
}
function mousePressed(){
  if (mouseX > width/2){
    slap(-1);
  }else{
    slap(1);
  }
}

window.onSoliEvent = function(event) { // this function will run any time a gesture is detected'
  // console.log(JSON.stringify(event.data))
  if(event.type == 'tap') {}
  if(event.type == 'swipe') {
    if(event.data.direction == '1') {
      console.log("right swipe detected");
      slap(1);

    } else if (event.data.direction == '5') {
      console.log("left swipe detected");
      slap(-1);
    }
  }
  if(event.type == 'presence') {}
  if (event.type == 'reach') {
    // console.log(JSON.stringify(event.data))
  }
  
};