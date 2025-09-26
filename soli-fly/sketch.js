// soli-fly demo
//
// fly (the insect) simulator that responds to Pixel 4 phones' soli 'swipe' gestures
// https://atap.google.com/soli/sandbox/
//
// Lingdong Huang 2020

/* global describe p5 setup draw P2D WEBGL ARROW CROSS HAND MOVE TEXT WAIT HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS DEG_TO_RAD RAD_TO_DEG CORNER CORNERS RADIUS RIGHT LEFT CENTER TOP BOTTOM BASELINE POINTS LINES LINE_STRIP LINE_LOOP TRIANGLES TRIANGLE_FAN TRIANGLE_STRIP QUADS QUAD_STRIP TESS CLOSE OPEN CHORD PIE PROJECT SQUARE ROUND BEVEL MITER RGB HSB HSL AUTO ALT BACKSPACE CONTROL DELETE DOWN_ARROW ENTER ESCAPE LEFT_ARROW OPTION RETURN RIGHT_ARROW SHIFT TAB UP_ARROW BLEND REMOVE ADD DARKEST LIGHTEST DIFFERENCE SUBTRACT EXCLUSION MULTIPLY SCREEN REPLACE OVERLAY HARD_LIGHT SOFT_LIGHT DODGE BURN THRESHOLD GRAY OPAQUE INVERT POSTERIZE DILATE ERODE BLUR NORMAL ITALIC BOLD BOLDITALIC LINEAR QUADRATIC BEZIER CURVE STROKE FILL TEXTURE IMMEDIATE IMAGE NEAREST REPEAT CLAMP MIRROR LANDSCAPE PORTRAIT GRID AXES frameCount deltaTime focused cursor frameRate getFrameRate setFrameRate noCursor displayWidth displayHeight windowWidth windowHeight width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams pushStyle popStyle popMatrix pushMatrix registerPromisePreload camera perspective ortho frustum createCamera setCamera setAttributes createCanvas resizeCanvas noCanvas createGraphics blendMode noLoop loop push pop redraw applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase createStringDict createNumberDict storeItem getItem clearStorage removeItem select selectAll removeElements createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ pRotateDirectionX pRotateDirectionY pRotateDirectionZ turnAxis setMoveThreshold setShakeThreshold isKeyPressed keyIsPressed key keyCode keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveGif saveFrames loadImage image tint noTint imageMode pixels blend copy filter get loadPixels set updatePixels loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo createWriter save saveJSON saveJSONObject saveJSONArray saveStrings saveTable writeFile downloadFile abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont append arrayCopy concat reverse shorten shuffle sort splice subset float int str boolean byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim day hour minute millis month second year plane box sphere cylinder cone ellipsoid torus orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadModel model loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess remove canvas drawingContext*/
/* global describe loadSound */

//This detects if the prototype is opened in Soli Sandbox, and sends an alert to the user that soli functionality will not work in other apps/browsers
// if(!navigator.userAgent.includes("Soli Sandbox")){ alert("This prototype needs to be opened in Soli Sandbox in order to receive Soli Events. Soli functionality will not work.");} else {console.log("Soli Sandbox Detected");}

var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

var EDGE = 20; // virtual padding for fly AI so it doesn't walk offscreen 

// small canvases for drawing the fly (to speed up shadow computation)
var canvFly;
var canvShadow;

// oscillators for sound effects
var osc1, osc2, oscing;

function setup(){
  createCanvas(window.innerWidth,window.innerHeight);
  canvFly    = createGraphics(64,64);
  canvShadow = createGraphics(64,64);

}

// audio: buzzing sound effects
function audioStart(){
  if (!oscing){
    // if (!osc1){
      osc1 = new p5.Oscillator();
      osc1.setType('sawtooth');
      osc2 = new p5.Oscillator();
      osc2.setType('sawtooth');
    // }
    osc1.amp(0);
    osc2.amp(0);
    osc1.freq(190);
    osc2.freq(190);
    osc1.start();
    osc2.start();
    
  }
  oscing = true;
}

function audioSet(amp,freq,duty,pan){
  // use 2 out-of-phase sawtooth oscillators to simulate square wave a custom duty cycle
  osc1.freq(freq);
  osc2.freq(freq);
  osc1.amp(amp);
  osc2.amp(-amp);
  osc1.pan(pan);
  osc2.pan(pan);
  osc2.phase(1-constrain(duty,0,1));
}

function audioStop(){
  if (oscing){
    oscing = false;
    osc1.stop();
    osc2.stop();
  }
}


// the 'fly' object holding position and rotation of the fly's body parts and the fly itself
function newFly(){
  return {
    state:0,
    pos:[0,0],
    z:0,
    ang:0,
    legs: [
      {pos: [2,-2],  ang:[0,0,0], ang0: [0.9, 1.0, -0.5], len: [8,6,6]},
      {pos: [2, 2],  ang:[0,0,0], ang0: [0.9, 1.0, -0.5], len: [8,6,6]},
      {pos: [0,-2],  ang:[0,0,0], ang0: [0.2, 0.5, -0.6], len: [7,4,4]},
      {pos: [0, 2],  ang:[0,0,0], ang0: [0.2, 0.5, -0.6], len: [7,4,4]},
      {pos: [-2,-2], ang:[0,0,0], ang0: [-0.8, -1, 0.5],  len: [9,7,5]},
      {pos: [-2, 2], ang:[0,0,0], ang0: [-0.8, -1, 0.5],  len: [9,7,5]}
    ],
    wings:[
      {pos: [2,-2], ang: 0.2 },
      {pos: [2, 2], ang: 0.2 },
    ]
  }
}


// render the fly to canvas with primitive shapes (ellipses and lines)
function drawFly(fly){
  let c = canvFly;
  
  function drawWing(){
    c.stroke(0,200);
    c.fill(255,50);
    c.ellipse(10,0,25,10);
    c.stroke(0,120);
    c.line(0,0,20,2);
    c.line(0,0,20,-2)
  }
  
  c.push();
  c.translate(canvFly.width/2,canvFly.height/2);
  c.rotate(fly.ang);
  
  c.stroke(0,0,0);
  for (var i = 0; i < fly.legs.length; i++){
    var a = fly.legs[i];
    c.push();
    c.translate(...a.pos);
    if (i % 2 == 0){
      c.rotate(-PI/2);
    }else{
      c.rotate(PI/2);
    }
    for (var j = 0; j < a.ang.length; j++){
      var ang = a.ang0[j]+a.ang[j];
      c.rotate((i%2)?-ang:ang);
      c.line(0,0,a.len[j],0);
      c.translate(a.len[j],0);
    }
    c.pop();
  }
  
  c.noStroke();
  
  c.fill(10);
  c.ellipse(10,0,8,7);
  c.ellipse(10,0,5,10);
  
  c.ellipse(4,0,7,13);
  c.ellipse(-1,0,10,12);
  c.ellipse(-6,0,20,11);
  
  c.fill(160,30,30);
  c.ellipse(9,-5,6,4);
  c.ellipse(9, 5,6,4);
  
  for (var i = 0; i < fly.wings.length; i++){
    var a = fly.wings[i];
    c.push();
    c.translate(...a.pos);
    if (i == 0){
      c.rotate(a.ang-PI);
      c.scale(1,-1);
    }else{
      c.rotate(-a.ang+PI);
      
    }
    drawWing();
    c.pop();
  }
  c.pop();
}

// lerp 0-360 with wrapping
function lerpHue(h0,h1,t){
  //https://okb.glitch.me/Okb.js
  var methods = [
    [Math.abs(h1-h0),     map(t,0,1,h0,h1)],
    [Math.abs(h1+360-h0), map(t,0,1,h0,h1+360)],
    [Math.abs(h1-360-h0), map(t,0,1,h0,h1-360)]
  ]
  methods.sort((x,y)=>(x[0]-y[0]))
  return (methods[0][1]+720)%360
}

// lerp 0-2PI with wrapping
function lerpAng(a0,a1,t){
  return lerpHue(a0*180/PI,a1*180/PI,t)*PI/180;
}

// fly animation: walk around
function walkFly(fly){
  fly.z = 0;
  audioStop();
  
  if (fly.offEdgeCorrectionMode){
    var correct = Math.atan2(-fly.pos[1],-fly.pos[0]);
    correct = (correct + PI*2) % (PI*2);
    
    fly.ang = lerpAng(fly.ang,correct,0.2);
    fly.offEdgeCorrectionMode--;
    
    for (var i = 0; i < fly.legs.length; i++){
      var a = fly.legs[i].ang;
      a[0]=Math.random()*2-1;
    }
    
    if (!fly.offEdgeCorrectionMode){
      fly.pos[0] += cos(fly.ang)*10;
      fly.pos[1] += sin(fly.ang)*10;
    }
    
    return;
  }
  if (Math.random() < 0.3){

    for (var i = 0; i < fly.legs.length; i++){
      var a = fly.legs[i].ang;
      a[0]=Math.random()*1-0.5;
    }
    fly.pos[0] += cos(fly.ang)*5;
    fly.pos[1] += sin(fly.ang)*5;
    fly.ang = (fly.ang + PI*2 + Math.random()-0.5)%(PI*2);
    
    if (fly.pos[0] < -width/2+EDGE || fly.pos[0] > width/2-EDGE || fly.pos[1] < -height/2+EDGE || fly.pos[1] > height/2-EDGE){
      fly.offEdgeCorrectionMode = 5;
    }
  }
  for (var i = 0; i < fly.wings.length; i++){
    var a = fly.wings[i];
    a.ang = 0.2+Math.random()*0.1-0.05;
  }
  
}

// fly animation: rest (and rub hands)
function restFly(fly){
  fly.z = 0;
  audioStop();
  
  if (Math.random() < 0.5){
    if (sin(frameCount*0.005)>-0.7){
      for (var i = 0; i < 2; i++){
        fly.legs[i].ang[0] = Math.random()*0.2+0.2;
        fly.legs[i].ang[1] = Math.random()*0.2;
        fly.legs[i].ang[2] = Math.random()*0.2;
      }
    }else{
      if (Math.random() < 0.1){
        for (var i = 0; i < 2; i++){
          fly.legs[i].ang[0] = Math.random()*0.1-0.05;
          fly.legs[i].ang[1] = 0;
          fly.legs[i].ang[2] = 0;
        }
      }
    }
  }else{
    if (Math.random() < 0.1){
      for (var i = 2; i < fly.legs.length; i++){
        var a = fly.legs[i].ang;
        a[0]=Math.random()*0.1-0.05;
      }
    }
    if (Math.random() < 0.5){
      for (var i = 0; i < fly.wings.length; i++){
        var a = fly.wings[i];
        a.ang = 0.2+Math.random()*0.05;
      }
    }
  }
}

var smoothNoise = 0;

// fly animation: flying around before landing again
function flyFly(fly){
  if (!fly.takeOffPos){
    fly.takeOffPos = [fly.pos[0],fly.pos[1]];
    fly.flightTime = 80+Math.floor(Math.random()*400);
    smoothNoise = 0;
  }
  

  var r = 0.7+Math.random()*0.8;
  for (var i = 0; i < fly.wings.length; i++){
    var a = fly.wings[i];
    a.ang = r+Math.random()*0.5;
  }
  
  if (fly.flightTime > 0){
    fly.ang = (fly.ang + PI*2 + 0.5*(noise(frameCount*0.1)-0.5) )%(PI*2);
  }else{
    var correct = Math.atan2(fly.takeOffPos[1]-fly.pos[1],fly.takeOffPos[0]-fly.pos[0]);
    correct = (correct + PI*2) % (PI*2);
    fly.ang = lerpAng(fly.ang,correct,0.1);
  }
  let d = dist(...fly.pos,...fly.takeOffPos);
  
  if ((fly.flightTime > 0 || d > 128) && !(fly.flightTime < -400)  ){
    fly.pos[0] += cos(fly.ang)*27;
    fly.pos[1] += sin(fly.ang)*27;
    
  }else{
    fly.pos[0] = lerp(fly.pos[0],fly.takeOffPos[0],0.2);
    fly.pos[1] = lerp(fly.pos[1],fly.takeOffPos[1],0.2);
  }
  
  d = dist(...fly.pos,...fly.takeOffPos);
  fly.z = d*0.1;
  fly.flightTime --;
  
// // sin based sound effect
//   audioSet(
//     0.2*(Math.min(d*0.0004,0.4)* (0.6+0.8*cos(frameCount*0.04)) ),
//     Math.min(d*0.2,175) + (10*cos(frameCount*0.04+13)),
//     constrain( 0.04+sin(frameCount*0.04+11.7)*0.04  ,0,1),
//     constrain(  (width>height?fly.pos[0]:fly.pos[1])  *0.1,-1,1),
//   );
  
  // perlin noise based sound effect
  smoothNoise = lerp(smoothNoise,noise(frameCount*0.1),0.2)
  audioSet(
    0.6*(Math.min(d*0.0004,0.4)* max(smoothNoise-0.25,0) ),
    Math.min(d*0.2,175) + (10*cos(frameCount*0.04+13)),
    constrain( 0.03+sin(frameCount*0.04+11.7)*0.03+noise(frameCount*0.4+11.7)*0.03  ,0,1),
    constrain(  (width>height?fly.pos[0]:fly.pos[1])  *0.1,-1,1),
  );
  
  if (d < 16 && fly.flightTime < 0){
    fly.takeOffPos = null;
    fly.state = 1;
    fly.z = 0;
    fly.flightTime = null;
  }
  
}

// choose and switch fly animations
function animateFly(fly){
  if (fly.state == 0){
    
    walkFly(fly);
    if (Math.random() < 0.01){
      fly.state = Math.floor(Math.random()*2);
    }
  }else if (fly.state == 1){

    restFly(fly);
    if (Math.random() < 0.0055){
      fly.state = Math.floor(Math.random()*2);
    }
  }else{
    
    flyFly(fly);
  }

}

var fly = newFly();
function draw(){
  
  clear();
  canvFly.clear();
  
  translate(width/2,height/2);
  
  // scale(0.2); // zoom factor
  
  drawFly(fly);
  animateFly(fly);

  let alpha = 200-fly.z*15;
  
  push();
  // fly's (0,0) is at center of canvas
  translate(fly.pos[0]-canvFly.width/2,fly.pos[1]-canvFly.height/2);
  
  if (alpha > 0){
    // render shadow
    canvShadow.clear();
    
    canvShadow.image(canvFly,0,0);
    canvShadow.filter(THRESHOLD);
    
    let rad = min(4,2+fly.z*0.5);
    
    
    if (isSafari){
      // slooowww blur with p5
      canvShadow.filter(BLUR,rad);
    }else{
      // fast blur with html canvas
      canvShadow.drawingContext.filter = `blur(${rad+1}px)`;
    }
        
    tint(255,200-fly.z*20);
    image(canvShadow,2,2);
  }
  tint(255);
  image(canvFly,0,-fly.z*5);
  pop();
  
}


function windowResized() { //this detects when the window is resized, such as entering fullscreen mode, or changing orientation of the device.
  resizeCanvas(windowWidth, windowHeight); //resizes the canvas to the new dimensions 
}
   
function swipe(ang){
  if (fly.state != 2){
    if (ang !== null){
      fly.ang = lerpAng(-PI/2,ang,Math.random());
    }
    fly.state = 2;
  }
  audioStart();
}

function mousePressed(){
  swipe(null);
}


window.onSoliEvent = function(event) { // this function will run any time a gesture is detected'
  if (event.type == 'swipe'){
    swipe(-(parseInt(event.data.direction)-1)*Math.PI/4);
  }
};


// stats.js for showing FPS
// (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
