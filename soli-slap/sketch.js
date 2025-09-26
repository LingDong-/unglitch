/* global describe p5 setup draw P2D WEBGL ARROW CROSS HAND MOVE TEXT WAIT HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS DEG_TO_RAD RAD_TO_DEG CORNER CORNERS RADIUS RIGHT LEFT CENTER TOP BOTTOM BASELINE POINTS LINES LINE_STRIP LINE_LOOP TRIANGLES TRIANGLE_FAN TRIANGLE_STRIP QUADS QUAD_STRIP TESS CLOSE OPEN CHORD PIE PROJECT SQUARE ROUND BEVEL MITER RGB HSB HSL AUTO ALT BACKSPACE CONTROL DELETE DOWN_ARROW ENTER ESCAPE LEFT_ARROW OPTION RETURN RIGHT_ARROW SHIFT TAB UP_ARROW BLEND REMOVE ADD DARKEST LIGHTEST DIFFERENCE SUBTRACT EXCLUSION MULTIPLY SCREEN REPLACE OVERLAY HARD_LIGHT SOFT_LIGHT DODGE BURN THRESHOLD GRAY OPAQUE INVERT POSTERIZE DILATE ERODE BLUR NORMAL ITALIC BOLD BOLDITALIC LINEAR QUADRATIC BEZIER CURVE STROKE FILL TEXTURE IMMEDIATE IMAGE NEAREST REPEAT CLAMP MIRROR LANDSCAPE PORTRAIT GRID AXES frameCount deltaTime focused cursor frameRate getFrameRate setFrameRate noCursor displayWidth displayHeight windowWidth windowHeight width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams pushStyle popStyle popMatrix pushMatrix registerPromisePreload camera perspective ortho frustum createCamera setCamera setAttributes createCanvas resizeCanvas noCanvas createGraphics blendMode noLoop loop push pop redraw applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase createStringDict createNumberDict storeItem getItem clearStorage removeItem select selectAll removeElements createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ pRotateDirectionX pRotateDirectionY pRotateDirectionZ turnAxis setMoveThreshold setShakeThreshold isKeyPressed keyIsPressed key keyCode keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveGif saveFrames loadImage image tint noTint imageMode pixels blend copy filter get loadPixels set updatePixels loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo createWriter save saveJSON saveJSONObject saveJSONArray saveStrings saveTable writeFile downloadFile abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont append arrayCopy concat reverse shorten shuffle sort splice subset float int str boolean byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim day hour minute millis month second year plane box sphere cylinder cone ellipsoid torus orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadModel model loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess remove canvas drawingContext*/
/* global describe loadSound */

//This detects if the prototype is opened in Soli Sandbox, and sends an alert to the user that soli functionality will not work in other apps/browswe
// if(!navigator.userAgent.includes("Soli Sandbox")){ alert("This prototype needs to be opened in Soli Sandbox in order to receive Soli Events. Soli functionality will not work.");} else {console.log("Soli Sandbox Detected");}

var handShape = [[648,412],[625,405],[600,409],[527,498],[525,121],[513,102],[486,92],[457,104],[447,127],[449,370],[434,371],[433,44],[422,25],[395,14],[367,23],[355,43],[356,376],[343,377],[343,93],[330,72],[305,61],[279,69],[264,89],[265,397],[256,398],[255,163],[242,143],[219,135],[194,142],[177,162],[176,635],[186,680],[206,720],[238,752],[275,773],[316,783],[363,783],[405,779],[447,766],[487,744],[510,719],[524,692],[548,653],[569,615],[657,457],[659,436]];
var toothShape = [[241,36],[313,41],[388,68],[483,39],[558,38],[626,102],[647,213],[599,418],[576,615],[535,749],[502,768],[471,727],[438,519],[403,476],[377,479],[351,522],[313,735],[282,766],[247,729],[210,607],[196,430],[138,202],[165,92]];

var R = 280; // face radius
var MN = 20; // mouth contour # of vertices

var SWIPE = 0;

var timer;

var rot = 0;
var extent = 0;

var eyes = [[0,0,0,0],[0,0,0,0]]
var mouth = new Array(MN*2).fill([0,0]);
var hands = [];
var particles = [];
var teeth = [];

var sfx1,sfx2,sfx3;

function exprNormal(t){
  eyes[0][0] = lerp(eyes[0][0],-R/6 ,t);
  eyes[0][1] = lerp(eyes[0][1],-R/16,t);
  eyes[0][2] = lerp(eyes[0][2],R/12 ,t);
  eyes[0][3] = lerp(eyes[0][3],R/12 ,t);

  eyes[1][0] = lerp(eyes[1][0], R/6 ,t);
  eyes[1][1] = lerp(eyes[1][1],-R/16,t);
  eyes[1][2] = lerp(eyes[1][2],R/12 ,t);
  eyes[1][3] = lerp(eyes[1][3],R/12 ,t);
  
  
  for (var i = 0; i < mouth.length; i++){
    var ang,x,y;
    if (i < MN){
      ang = i/MN*Math.PI;
      x = R*0.3*Math.cos(ang);
      y = R*0.25*Math.sin(ang)+R*0.1;
    }else{
      ang = (i-MN)/MN*Math.PI;
      x =-R*0.3*Math.cos(ang);
      y = R*0.25*Math.sin(ang)+R*0.1;
    }
    mouth[i] = [lerp(mouth[i][0],x,t),lerp(mouth[i][1],y,t)];
  }
  
  rot = lerp(rot,0,t);
}

function exprSlapped(dir,t){
  if (dir > 0){
    eyes[0][0] = lerp(eyes[0][0],R*0.1,t);
    eyes[0][1] = lerp(eyes[0][1],-R*0.16,t);
    eyes[0][2] = lerp(eyes[0][2],R*0.1,t);
    eyes[0][3] = lerp(eyes[0][3],R*0.02,t);

    eyes[1][0] = lerp(eyes[1][0], R*0.3,t);
    eyes[1][1] = lerp(eyes[1][1],-R*0.08,t);
    eyes[1][2] = lerp(eyes[1][2],R*0.1,t);
    eyes[1][3] = lerp(eyes[1][3],R*0.1,t);
  }else{
    eyes[0][0] = lerp(eyes[0][0],-R*0.3,t);
    eyes[0][1] = lerp(eyes[0][1],-R*0.08,t);
    eyes[0][2] = lerp(eyes[0][2],R*0.1,t);
    eyes[0][3] = lerp(eyes[0][3],R*0.1,t);

    eyes[1][0] = lerp(eyes[1][0],-R*0.1,t);
    eyes[1][1] = lerp(eyes[1][1],-R*0.16,t);
    eyes[1][2] = lerp(eyes[1][2],R*0.1,t);
    eyes[1][3] = lerp(eyes[1][3],R*0.02,t);
  }
  
  for (var i = 0; i < mouth.length; i++){
    var ang,x,y;
    if (i < MN){
      ang = i/MN*Math.PI;
      var l = Math.sin(ang);
      x = dir*R*0.2+R*0.05*Math.cos(ang)+l*R*0.1*dir;
      y =-R*0.16*Math.sin(ang)+R*0.2;
    }else{
      ang = (i-MN)/MN*Math.PI;
      var l = Math.sin(ang);
      x = dir*R*0.2-R*0.05*Math.cos(ang)+l*R*0.1*dir;
      y = R*0.16*Math.sin(ang)+R*0.2;
    }
    mouth[i] = [lerp(mouth[i][0],x,t),lerp(mouth[i][1],y,t)];
  }
  
  rot = lerp(rot,dir,t);
}


function setup(){ //When the page loads
  createCanvas(window.innerWidth,window.innerHeight);
  exprNormal(1);
  sfx1 = loadSound('/soli-slap/glitch-assets/slap1.mp3');
  sfx2 = loadSound('/soli-slap/glitch-assets/slap2.mp3');
  sfx3 = loadSound('/soli-slap/glitch-assets/slap3.mp3');
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
  background(255);
  strokeWeight(2);
  
  noFill();
  
  circle(0,0,R);
  
  ellipse(...eyes[0]);
  ellipse(...eyes[1])
  
  if (SWIPE){
    exprSlapped(SWIPE,0.5);
  }else{
    exprNormal(0.1);
  }
  
  beginShape();
  for (var i = 0; i < mouth.length; i++){
    vertex(...mouth[i]);
  }
  endShape(CLOSE);
  
  
  drawingContext.save();
  drawingContext.setLineDash([2,4]);
  for (var k = hands.length-1; k >= 0; k--){
    drawingContext.save();
    drawingContext.translate(-hands[k].dir*R*0.55+rot*R*0.4+hands[k].x,hands[k].y+R*0.1);
    drawingContext.scale(Math.abs(rot)*0.5+0.5,1);
    drawingContext.rotate(hands[k].ang);

    drawingContext.beginPath();
    for (var i = 0; i < handShape.length; i++){
      drawingContext[i?"lineTo":"moveTo"](
        hands[k].dir*0.75*R*(handShape[i][0]/800-0.5), 
        0.75*R*(handShape[i][1]/800-0.5)
      );
    }
    drawingContext.closePath();
    drawingContext.restore();
    drawingContext.strokeStyle = `rgba(0,0,0,${hands[k].timer/500})`
    drawingContext.stroke();
    hands[k].timer--;
    if (hands[k] < 0){
      hands.splice(k,1);
    }
  }
  drawingContext.setLineDash([]);
  drawingContext.restore();
  
  push();
  fill(255);
  noStroke();
  translate(-width/2,-height/2);
  drawCircularMask(width/2,height/2,R/2+2,R/2+2);
  pop();
  
  
  fill(0);
  for (var i = particles.length-1; i >= 0; i--){
    var p = particles[i];

    push();
    translate(p.x,p.y);
    rotate(p.ang);
    rect(-p.s/2,-p.s/2,p.s,p.s);
    pop();
    if (p.s < 1){
      particles.splice(i,1);
      continue;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.s *= 0.9;
    p.ang += 0.5;
  }
  
  fill(255);
  for (var i = teeth.length-1; i >= 0; i--){
    var p = teeth[i];

    push();
    translate(p.x,p.y);
    rotate(p.ang);
    
    beginShape();
    for (var j = 0; j < toothShape.length; j++){
      vertex(0.1*R*((toothShape[j][0]/800)-0.5),0.1*R*((toothShape[j][1]/800)-0.5));
    }
    endShape(CLOSE);
    pop();
    if (Math.abs(p.x)>width || Math.abs(p.y)>height){
      teeth.splice(i,1);
      continue;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.ang += 0.3;
  }
}


function windowResized() { //this detects when the window is resized, such as entering fullscreen mode, or changing orientation of the device.
  resizeCanvas(windowWidth, windowHeight); //resizes the canvas to the new dimensions 
}
   

function slap(dir){
  extent = Math.random();
  SWIPE = dir;
  hands.push({
    dir,
    x:(Math.random()-0.5)*R*0.2,
    y:(Math.random()-0.5)*R*0.2,
    ang:-dir*(Math.random()*1.2+0.3),
    timer:500,
  });
  
  var nb = 5+Math.floor(Math.random()*10);
  for (var i = 0; i < nb; i++){
    particles.push({
      x:dir*R*0.2,
      y:R*0.2,
      s:R*(Math.random()*0.1+0.05),
      vx:(dir*10*(Math.random()*1.1+0.4))*R*0.005,
      vy:(Math.random()-0.4)*R*0.025,
      ang:Math.random()*Math.PI*2,
    })
  }
  var nt = 1+Math.floor(Math.random()*2);
  for (var i = 0; i < nt; i++){
    teeth.push({
        x:dir*R*0.2,
        y:R*0.2,
        vx:(dir*10*(Math.random()*1.1+0.4))*R*0.003,
        vy:(Math.random()-0.4)*R*0.025,
        ang:Math.random()*Math.PI*2,
    })
  }
  
  if (timer != null){
    clearTimeout(timer);
  }
  timer = setTimeout(function(){SWIPE=0},800);
  // window.navigator.vibrate(2000);
  
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
  if (mouseX < width/2){
    slap(-1);
  }else{
    slap(1);
  }
}

window.onSoliEvent = function(event) { // this function will run any time a gesture is detected'
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
  if (event.type == 'reach') {}
  
};