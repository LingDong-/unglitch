/* global describe p5 setup draw P2D WEBGL ARROW CROSS HAND MOVE TEXT WAIT HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS DEG_TO_RAD RAD_TO_DEG CORNER CORNERS RADIUS RIGHT LEFT CENTER TOP BOTTOM BASELINE POINTS LINES LINE_STRIP LINE_LOOP TRIANGLES TRIANGLE_FAN TRIANGLE_STRIP QUADS QUAD_STRIP TESS CLOSE OPEN CHORD PIE PROJECT SQUARE ROUND BEVEL MITER RGB HSB HSL AUTO ALT BACKSPACE CONTROL DELETE DOWN_ARROW ENTER ESCAPE LEFT_ARROW OPTION RETURN RIGHT_ARROW SHIFT TAB UP_ARROW BLEND REMOVE ADD DARKEST LIGHTEST DIFFERENCE SUBTRACT EXCLUSION MULTIPLY SCREEN REPLACE OVERLAY HARD_LIGHT SOFT_LIGHT DODGE BURN THRESHOLD GRAY OPAQUE INVERT POSTERIZE DILATE ERODE BLUR NORMAL ITALIC BOLD BOLDITALIC LINEAR QUADRATIC BEZIER CURVE STROKE FILL TEXTURE IMMEDIATE IMAGE NEAREST REPEAT CLAMP MIRROR LANDSCAPE PORTRAIT GRID AXES frameCount deltaTime focused cursor frameRate getFrameRate setFrameRate noCursor displayWidth displayHeight windowWidth windowHeight width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams pushStyle popStyle popMatrix pushMatrix registerPromisePreload camera perspective ortho frustum createCamera setCamera setAttributes createCanvas resizeCanvas noCanvas createGraphics blendMode noLoop loop push pop redraw applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase createStringDict createNumberDict storeItem getItem clearStorage removeItem select selectAll removeElements createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ pRotateDirectionX pRotateDirectionY pRotateDirectionZ turnAxis setMoveThreshold setShakeThreshold isKeyPressed keyIsPressed key keyCode keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveGif saveFrames loadImage image tint noTint imageMode pixels blend copy filter get loadPixels set updatePixels loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo createWriter save saveJSON saveJSONObject saveJSONArray saveStrings saveTable writeFile downloadFile abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont append arrayCopy concat reverse shorten shuffle sort splice subset float int str boolean byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim day hour minute millis month second year plane box sphere cylinder cone ellipsoid torus orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadModel model loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess remove canvas drawingContext*/
/* global describe loadSound */

//This detects if the prototype is opened in Soli Sandbox, and sends an alert to the user that soli functionality will not work in other apps/browswe
// if(!navigator.userAgent.includes("Soli Sandbox")){ alert("This prototype needs to be opened in Soli Sandbox in order to receive Soli Events. Soli functionality will not work.");} else {console.log("Soli Sandbox Detected");}

var handShape = [[648,412],[625,405],[600,409],[527,498],[525,121],[513,102],[486,92],[457,104],[447,127],[449,370],[434,371],[433,44],[422,25],[395,14],[367,23],[355,43],[356,376],[343,377],[343,93],[330,72],[305,61],[279,69],[264,89],[265,397],[256,398],[255,163],[242,143],[219,135],[194,142],[177,162],[176,635],[186,680],[206,720],[238,752],[275,773],[316,783],[363,783],[405,779],[447,766],[487,744],[510,719],[524,692],[548,653],[569,615],[657,457],[659,436]];

var sfx1,sfx2,sfx3;

var jello = {pts:[],springs:[]};

var nonSoliSwipeDelay = 60
var lastNonSoliSwipe = -nonSoliSwipeDelay;
var noInteraction = 0;
var noInteractionRestore = 60/*FPS*/ * 20 /*sec*/;

var nx = 6;
var ny = 6;
var nz = 6;
var sp = 50;

var ww = (nx-1)*sp;
var hh = (ny-1)*sp;
var dd = (nz-1)*sp;

var hands = [];
var rings = []
var rouge = 0;

for (var i = 0; i < ny; i++){
  for (var j = 0; j < nx; j++){
    for (var k = 0; k < nz; k++){
      jello.pts.push({pos:[j*sp-ww/2,i*sp-hh/2,k*sp-dd/2],v:[0,0,0]});
    }
  }
}
for (var i = 0; i < jello.pts.length; i++){
  for (var j = i+1; j < jello.pts.length; j++){
    let a = jello.pts[i];
    let b = jello.pts[j];
    let D = Math.hypot(b.pos[1]-a.pos[1],b.pos[0]-a.pos[0],b.pos[2]-a.pos[2]);
    if (D < sp*2){
      jello.springs.push({a:i,b:j,len:D})
    }
  }
}

var edges = [[],[],[],[],[],[],[],[],[],[],[],[]];
for (var i = 0; i < ny; i++){
  edges[ 0].push(i*nx*nz);
  edges[ 1].push(i*nx*nz+(nx-1)*nz);
  edges[ 2].push(i*nx*nz+nz-1);
  edges[ 3].push(i*nx*nz+(nx-1)*nz+nz-1);
}
for (var i = 0; i < nx; i++){
  edges[ 4].push(i*nz);    
  edges[ 5].push((ny-1)*nx*nz+i*nz);    
  edges[ 6].push(i*nz+nz-1);    
  edges[ 7].push((ny-1)*nx*nz+i*nz+nz-1);
}
for (var i = 0; i < nz; i++){
  edges[ 8].push(i);    
  edges[ 9].push((nx-1)*nz+i);    
  edges[10].push((ny-1)*nx*nz+i);    
  edges[11].push((ny-1)*nx*nz+(nx-1)*nz+i);  
}

var faceL = []
var faceR = []
var faceT = []
for (var i = 0; i < ny; i++){
  for (var j = 0; j < nx; j++){
    faceL.push(i*nx*nz+j*nz);
  }
}
for (var i = 0; i < ny; i++){
  for (var j = 0; j < nz; j++){
    faceR.push(i*nx*nz+(nx-1)*nz+j);
  }
}
for (var i = 0; i < nx; i++){
  for (var j = 0; j < nz; j++){
    faceT.push(i*nz+j);
  }
}


var corners = Array.from(new Set(edges.map(x=>x[0]).concat(edges.map(x=>x[x.length-1]))));

function step(){

  for (var i = 0; i < jello.springs.length; i++){
    let spr = jello.springs[i];
    let a = jello.pts[spr.a];
    let b = jello.pts[spr.b];

    let D = [b.pos[0]-a.pos[0],b.pos[1]-a.pos[1],b.pos[2]-a.pos[2]]
    var l = Math.hypot(b.pos[1]-a.pos[1],b.pos[0]-a.pos[0],b.pos[2]-a.pos[2]);
    let n = [D[0]*spr.len/l,D[1]*spr.len/l,D[2]*spr.len/l];
    let x = [D[0]-n[0],D[1]-n[1],D[2]-n[2]]

    // x[0] = Math.sign(x[0])*Math.min(Math.abs(x[0]),5);
    // x[1] = Math.sign(x[1])*Math.min(Math.abs(x[1]),5);
    // x[2] = Math.sign(x[2])*Math.min(Math.abs(x[2]),5);
    a.v[0] += 2*x[0]
    a.v[1] += 2*x[1]
    a.v[2] += 2*x[2]
    b.v[0] -= 2*x[0]
    b.v[1] -= 2*x[1]
    b.v[2] -= 2*x[2]
    
  }

  for (var i = 0; i < jello.pts.length -nx*nz; i++){

    jello.pts[i].pos[0]+=jello.pts[i].v[0]*0.03;
    jello.pts[i].pos[1]+=jello.pts[i].v[1]*0.03;
    jello.pts[i].pos[2]+=jello.pts[i].v[2]*0.03;
    
    // jello.pts[i].pos[1] = Math.min(jello.pts[i].pos[1],hh/2)

    jello.pts[i].v[1]+= 1;

    jello.pts[i].v[0]*=0.99;
    jello.pts[i].v[1]*=0.99;
    jello.pts[i].v[2]*=0.99;
  }
  
}

function restore(){
  for (var i = 0; i < ny; i++){
    for (var j = 0; j < nx; j++){
      for (var k = 0; k < nz; k++){
        let ii = i*nx*nz+j*nz+k;
        jello.pts[ii].pos[0] = j*sp-ww/2;
        jello.pts[ii].pos[1] = i*sp-hh/2;
        jello.pts[ii].pos[2] = k*sp-dd/2;
        
        jello.pts[ii].v[0] = 0;
        jello.pts[ii].v[1] = 0;
        jello.pts[ii].v[2] = 0;
        
      }
    }
  }
}


function smoothen(P, args){
  //https://okb.glitch.me/Okb.js
  function rationalQuadraticBezier(p0, p1, p2, w, t){
    if (w == undefined) {w = 2};
    var u = (Math.pow (1 - t, 2) + 2 * t * (1 - t) * w + t * t);
    return [
      (Math.pow(1-t,2)*p0[0]+2*t*(1-t)*p1[0]*w+t*t*p2[0])/u,
      (Math.pow(1-t,2)*p0[1]+2*t*(1-t)*p1[1]*w+t*t*p2[1])/u,
      (Math.pow(1-t,2)*p0[2]+2*t*(1-t)*p1[2]*w+t*t*p2[2])/u,
    ]
  }
  function midpoint(a,b){
    return [a[0]/2+b[0]/2,a[1]/2+b[1]/2,a[2]/2+b[2]/2];
  }
  
  args = (args != undefined) ? args : {}
  var w = (args.weight != undefined)  ?  args.weight : 1;
  var n = (args.detail != undefined) ?   args.detail : 20;
  if (P.length == 2){
    P = [P[0],midpoint(P[0],P[1]),P[1]];
  }
  var plist = [];
  for (var j = 0; j < P.length-2; j++){
    var p0; var p1; var p2;
    if (j == 0){p0 = P[j];}else{p0 = midpoint(P[j],P[j+1]);}
    p1 = P[j+1];
    if (j == P.length-3){p2 = P[j+2];}else{p2 = midpoint(P[j+1],P[j+2]);}
    var pl = n;
    for (var i = 0; i < pl+(j==P.length-3); i+= 1){
      var t = i/pl;
      plist.push(rationalQuadraticBezier(p0,p1,p2,w,t));
    }
  }
  return plist;
}

function vertex3d(x,y,z,rx,ry,rz,dx,dy,dz,f){
  let rotx = a=> [1,0,0,0, 0,cos(a),-sin(a),0, 0,sin(a),cos(a),0, 0,0,0,1]
  let roty = a=> [cos(a),0,sin(a),0, 0,1,0,0, -sin(a),0,cos(a),0, 0,0,0,1]
  let rotz = a=> [cos(a),-sin(a),0,0, sin(a),cos(a),0,0, 0,0,1,0, 0,0,0,1]
  let mult = (A,B)=> [(A)[0]*(B)[0]+(A)[1]*(B)[4]+(A)[2]*(B)[8]+(A)[3]*(B)[12],(A)[0]*(B)[1]+(A)[1]*(B)[5]+(A)[2]*(B)[9]+(A)[3]*(B)[13],(A)[0]*(B)[2]+(A)[1]*(B)[6]+(A)[2]*(B)[10]+(A)[3]*(B)[14],(A)[0]*(B)[3]+(A)[1]*(B)[7]+(A)[2]*(B)[11]+(A)[3]*(B)[15],(A)[4]*(B)[0]+(A)[5]*(B)[4]+(A)[6]*(B)[8]+(A)[7]*(B)[12],(A)[4]*(B)[1]+(A)[5]*(B)[5]+(A)[6]*(B)[9]+(A)[7]*(B)[13],(A)[4]*(B)[2]+(A)[5]*(B)[6]+(A)[6]*(B)[10]+(A)[7]*(B)[14],(A)[4]*(B)[3]+(A)[5]*(B)[7]+(A)[6]*(B)[11]+(A)[7]*(B)[15],(A)[8]*(B)[0]+(A)[9]*(B)[4]+(A)[10]*(B)[8]+(A)[11]*(B)[12],(A)[8]*(B)[1]+(A)[9]*(B)[5]+(A)[10]*(B)[9]+(A)[11]*(B)[13],(A)[8]*(B)[2]+(A)[9]*(B)[6]+(A)[10]*(B)[10]+(A)[11]*(B)[14],(A)[8]*(B)[3]+(A)[9]*(B)[7]+(A)[10]*(B)[11]+(A)[11]*(B)[15],(A)[12]*(B)[0]+(A)[13]*(B)[4]+(A)[14]*(B)[8]+(A)[15]*(B)[12],(A)[12]*(B)[1]+(A)[13]*(B)[5]+(A)[14]*(B)[9]+(A)[15]*(B)[13],(A)[12]*(B)[2]+(A)[13]*(B)[6]+(A)[14]*(B)[10]+(A)[15]*(B)[14],(A)[12]*(B)[3]+(A)[13]*(B)[7]+(A)[14]*(B)[11]+(A)[15]*(B)[15]]
  let trfm = (A,v)=> [((A)[0]*(v)[0]+(A)[1]*(v)[1]+(A)[2]*(v)[2]+(A)[3])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15]),((A)[4]*(v)[0]+(A)[5]*(v)[1]+(A)[6]*(v)[2]+(A)[7])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15]),((A)[8]*(v)[0]+(A)[9]*(v)[1]+(A)[10]*(v)[2]+(A)[11])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15])]
  let proj = (f,v)=> [(f)*(v)[0]/(v)[2],(f)*(v)[1]/(v)[2]];
  
  let T = mult([1,0,0,dx, 0,1,0,dy, 0,0,1,dz, 0,0,0,1],mult(rotz(rz),mult(rotx(rx),roty(ry))));

  return proj(f,trfm(T,[x,y,z]));
}

function rotatedPoly(poly,cx,cy,th){
  var p = [];
  let sinth = Math.sin(th);
  let costh = Math.cos(th);
  for (var i = 0; i < poly.length; i++){
    let gx = poly[i][0]-cx;
    let gy = poly[i][1]-cy;
    let fx = cx + (gx * costh - gy * sinth);
    let fy = cy + (gx * sinth + gy * costh);
    p.push([fx,fy])
  }
  return p;
}

function addHand(dir,cx,cy,ang){

  let poly = rotatedPoly(handShape,400,400,ang).map(x=>[
    Math.min(Math.max(x[0]+cx*800*(dir<0?1:-1),0),799),
    Math.min(Math.max(x[1]+cy*800             ,0),799)
  ]);
  let nn = dir<0?nx:nz;
  let nm = dir==0?nx:ny;
  
  var hand = {pts:[],red:80}
  for (var i = 0; i < poly.length; i++){
    var x = (dir<0?(poly[i][0]/800):(1-poly[i][0]/800))*(nn-1);
    var y = (poly[i][1]/800)*(nm-1);
    
    x = Math.min(Math.max(x,0),nn-1);
    y = Math.min(Math.max(y,0),nm-1);
    
    
    var ix = Math.floor(x);
    var iy = Math.floor(y);
    var fx = x-ix;
    var fy = y-iy;
    
    
    var h = {grid:[
      [faceL,faceT,faceR][dir+1][iy*nn+ix],
      [faceL,faceT,faceR][dir+1][iy*nn+ix+1],
      [faceL,faceT,faceR][dir+1][(iy+1)*nn+ix],
      [faceL,faceT,faceR][dir+1][(iy+1)*nn+ix+1],
    ],fx,fy,ix,iy};
    let ok = true;
    for (var j = 0; j < 4; j++){
      if (h.grid[j] === undefined){
        ok = false;
        break;
      }
    }
    if (ok){
      hand.pts.push(h);
    }
    
  }
  hands.push(hand)
}

var cam = [Math.PI/6,Math.PI/4,0, 0,0,1000, 750];

function setup(){ //When the page loads
  createCanvas(window.innerWidth,window.innerHeight);

  sfx1 = loadSound('/soli-jello/glitch-assets/slap1.mp3');
  sfx2 = loadSound('/soli-jello/glitch-assets/slap2.mp3');
  sfx3 = loadSound('/soli-jello/glitch-assets/slap3.mp3');
}

function draw(){
  step();
  background(60,30,45);
  translate(width/2,height/2);
  strokeWeight(1);
  stroke(180,100,100);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  
  var curvs = [];
  
  
  for (var i = 0; i < edges.length; i++){
    
    let c = []
    for (var j = 0; j < edges[i].length; j++){
      c.push(jello.pts[edges[i][j]].pos);
    }
    c = smoothen(c,{detail:10});
    for (var j = 0; j < c.length; j++){
      c[j] = vertex3d(...c[j],...cam);
    }
    curvs.push(c);
  }
  
//   noFill();
//   for (var i = 0; i < curvs.length; i++){
    
//     beginShape();
//     for (var j = 0; j < curvs[i].length; j++){
//       vertex(...curvs[i][j]);
      
//     }
//     endShape();
    
//     // fill(0);text(i,(curvs[i][0][0]+curvs[i][curvs[i].length-1][0])/2,(curvs[i][0][1]+curvs[i][curvs[i].length-1][1])/2);noFill();
//   }
  
  let faces = [
    curvs[0].concat(curvs[5]).concat(curvs[1].slice().reverse()).concat(curvs[4].slice().reverse()),
    curvs[1].concat(curvs[11]).concat(curvs[3].slice().reverse()).concat(curvs[9].slice().reverse()),
    curvs[4].concat(curvs[9]).concat(curvs[6].slice().reverse()).concat(curvs[8].slice().reverse())
  ]
  
  
  noStroke();
  for (var i = 0; i < faces.length; i++){
    let col = [[240,125,125],[250,150,150],[255,175,175]][i];
    col[0] = Math.min(col[0]+rouge,255);
    col[1] = Math.max(col[1]-rouge,0);
    col[2] = Math.max(col[2]-rouge,0);
    fill(...col);
    beginShape();
    for (var j = 0; j < faces[i].length; j++){
      vertex(...faces[i][j]);
    }
    endShape();
  }
  
//   fill(0);
//   for (var i = 0; i < faceT.length; i++){
//     rect(...vertex3d(...jello.pts[faceT[i]].pos,...cam),10,10);
//   }
    
  // fill(0);
  // beginShape();
  // for (var j = 0; j < handShape.length; j++){
  //   vertex(...vertex3d(handShape[j][0]/800*ww-ww/2,handShape[j][1]/800*hh-hh/2,-dd/2,...cam));
  // }
  // endShape();
  
  
  for (var i = hands.length-1; i >= 0; i--){
    fill(200,0,0,hands[i].red);
    beginShape();
    
    for (var j = 0; j < hands[i].pts.length; j++){
      let p00 = jello.pts[hands[i].pts[j].grid[0]].pos;
      let p01 = jello.pts[hands[i].pts[j].grid[1]].pos;
      let p10 = jello.pts[hands[i].pts[j].grid[2]].pos;
      let p11 = jello.pts[hands[i].pts[j].grid[3]].pos;
      
      let [s,t] = [hands[i].pts[j].fx,hands[i].pts[j].fy]

      let q0 = [
        p00[0]*(1-s) + p01[0]*s,
        p00[1]*(1-s) + p01[1]*s,
        p00[2]*(1-s) + p01[2]*s,
      ]
      let q1 = [
        p10[0]*(1-s) + p11[0]*s,
        p10[1]*(1-s) + p11[1]*s,
        p10[2]*(1-s) + p11[2]*s,
      ]
      let q = [
        q0[0]*(1-t) + q1[0]*t,
        q0[1]*(1-t) + q1[1]*t,
        q0[2]*(1-t) + q1[2]*t,
      ]

      vertex(...vertex3d(...q,...cam))
    }
    endShape();
    hands[i].red = hands[i].red-0.2;
    if (hands[i].red <= 0){
      hands.splice(i,1)
    }
    
  }
  noFill();
  for (var i = rings.length-1; i >= 0; i--){
    let r = rings[i]
    stroke(255,255,255,80-r.t*8);
    strokeWeight(20-r.t*2);
    let w = r.t*15+80;
    let h = w*0.6;
    if (r.dir){
      [w,h]=[h,w]
      h*0.9
    }
    ellipse(...vertex3d(...r.pt.pos,...cam),w,h);
    r.t++;
    if (r.t > 10){
      rings.splice(i,1);
    }
  }
  
  rouge = Math.max(rouge-0.2,0);
  
  noInteraction++;
  if (noInteraction > noInteractionRestore){
    console.log("restoring due to inactivity...")
    restore();
    noInteraction = 0;
  }
}


function windowResized() { //this detects when the window is resized, such as entering fullscreen mode, or changing orientation of the device.
  resizeCanvas(windowWidth, windowHeight); //resizes the canvas to the new dimensions 
}
   

function slap(dir){
  let ang = 0;
  let f = [0,0,0];
  if (dir == -1){
    ang = -Math.random()*Math.PI/2;
    f[2]=180;
  }else if (dir == 1){
    ang = -Math.random()*Math.PI/2;
    f[0]=-180;
  }else{
    ang = -Math.PI/4+  Math.random()*Math.PI/4-Math.PI/8;
    f[1]=140;
  }
  
  let cx = Math.random()*0.5-0.25;
  let cy = Math.random()*0.5-0.25;
  
  let nn = dir<0?nx:nz;
  let nm = dir==0?nx:ny;
  
  let ix = Math.floor((cx+0.5)*(nn-1));
  let iy = Math.floor((cy+0.5)*(nm-1));
  
  
  let a = jello.pts[[faceL,faceT,faceR][dir+1][iy*nn+ix]];
  
  for (var j = 0; j < jello.pts.length; j++){
    let b = jello.pts[j];
    var D = Math.hypot(b.pos[1]-a.pos[1],b.pos[0]-a.pos[0],b.pos[2]-a.pos[2]);

    if (D < sp * 3){
      f[0]+=Math.random()*40-20;
      f[1]+=Math.random()*40-20;
      f[2]+=Math.random()*40-20;
      jello.pts[j].v[0]+=f[0];
      jello.pts[j].v[1]+=f[1];
      jello.pts[j].v[2]+=f[2];
    }
  }
  
  addHand(dir,cx,cy,ang)
  rings.push({pt:a,dir,t:0});
  rouge += 10;
  noInteraction = 0;
  
  
  ;[sfx1,sfx2,sfx3][Math.floor(Math.random()*2)].play();

}

function keyPressed(){
  if (frameCount-lastNonSoliSwipe<nonSoliSwipeDelay){
    return;
  }
  if (keyCode == LEFT_ARROW){
    slap(1);
  }else if (keyCode == RIGHT_ARROW){
    slap(-1);
  }else if (keyCode == DOWN_ARROW){
    slap(0);
  }
  lastNonSoliSwipe = frameCount;
}
function mousePressed(){
  if (frameCount-lastNonSoliSwipe<nonSoliSwipeDelay){
    return;
  }
  if (mouseY < height/3){
    slap(0);
  }else if (mouseX > width/2){
    slap(1);
  }else{
    slap(-1);
  }
  lastNonSoliSwipe = frameCount;
}

window.onSoliEvent = function(event) { // this function will run any time a gesture is detected'
  // console.log(JSON.stringify(event.data))
  if(event.type == 'tap') {
    // console.log("tap detected");
    // slap(0);
  }
  if(event.type == 'swipe') {
    if(event.data.direction == '1') {
      console.log("right swipe detected");
      slap(-1);

    } else if (event.data.direction == '5') {
      console.log("left swipe detected");
      slap(1);
    } else if (event.data.direction == '7'){
      console.log("down swipe detected");
      slap(0);
    }
  }
  if(event.type == 'presence') {}
  if (event.type == 'reach') {

  }
  
};