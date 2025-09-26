/* global describe fld_start fld_get fld_get_ext THREE */

if (!window.chrome){alert("This demo may or may not work in your current browser. Google Chrome is recommanded.")}
if (!window.location.href.toString().includes("https://")){alert(`You may need "https://" to access webcam.`)}

var WIDTH = 640;
var HEIGHT = 480;
var TEX_SIZE = 512;

var mouseX;
var mouseY;
var pmouseX;
var pmouseY;
var mouseIsDown;

var colors = ["black","white","red","orange","yellow","green","cyan","blue","purple","magenta",""]
var sizes = [5,10,25];
var currentColor = colors[0];
var currentSize = sizes[1];

var TRIANGLES = [
  [ 0, 1,36],[ 0,17,36],[ 1, 2,41],[ 1,36,41],[ 2, 3,31],[ 2,31,41],[ 3, 4,48],[ 3,31,48],[ 4, 5,48],[ 5, 6,48],
  [ 6, 7,59],[ 6,48,59],[ 7, 8,58],[ 7,58,59],[ 8, 9,56],[ 8,56,57],[ 8,57,58],[ 9,10,55],[ 9,55,56],[10,11,54],
  [10,54,55],[11,12,54],[12,13,54],[13,14,35],[13,35,54],[14,15,46],[14,35,46],[15,16,45],[15,45,46],[16,26,45],
  [17,18,36],[18,19,37],[18,36,37],[19,20,38],[19,37,38],[20,21,39],[20,38,39],[21,27,39],[22,23,42],[22,27,42],
  [23,24,43],[23,42,43],[24,25,44],[24,43,44],[25,26,45],[25,44,45],[27,28,39],[27,28,42],[28,29,39],[28,29,42],
  [29,30,31],[29,30,35],[29,31,40],[29,35,47],[29,40,39],[29,42,47],[30,31,32],[30,32,33],[30,33,34],[30,34,35],
  [31,32,50],[31,40,41],[31,48,49],[31,49,50],[32,33,51],[32,50,51],[33,34,51],[34,35,52],[34,51,52],[35,46,47],
  [35,52,53],[35,53,54],[36,37,41],[37,38,40],[37,40,41],[38,39,40],[42,43,47],[43,44,47],[44,45,46],[44,46,47],
  [48,49,60],[48,59,60],[49,50,61],[49,60,61],[50,51,62],[50,61,62],[51,52,62],[52,53,63],[52,62,63],[53,54,64],
  [53,63,64],[54,55,64],[55,56,65],[55,64,65],[56,57,66],[56,65,66],[57,58,66],[58,59,67],[58,66,67],[59,60,67],
  [60,61,67],[61,62,66],[61,66,67],[62,63,66],[63,64,65],[63,65,66]];
var TRIANGLES_EXT = TRIANGLES.concat([
    [68, 69, 17], [68, 0, 17], [69, 70, 18], [69, 17, 18], [70, 71, 19], [70, 18, 19], [71, 72, 20], [71, 19, 20],
    [72, 73, 21], [72, 20, 21], [73, 74, 27], [73, 21, 27], [74, 75, 22], [74, 27, 22], [75, 76, 23], [75, 22, 23],
    [76, 77, 24], [76, 23, 24], [77, 78, 25], [77, 24, 25], [78, 79, 26], [78, 25, 26], [79, 80, 16], [79, 26, 16], ]);

var STANDARD512 = [
[0,216],[0,279],[0,344],[0,405],[0,512],[73,512],[128,512],[195,512],[256,512],[317,512],
[384,512],[439,512],[512,512],[512,405],[512,344],[512,279],[512,216],[48,167],[82,139],[132,128],
[185,131],[230,146],[282,146],[327,131],[380,128],[430,139],[464,167],[256,182],[256,216],[256,249],
[256,282],[197,317],[222,322],[256,327],[290,322],[315,317],[109,198],[134,190],[163,189],[190,195],
[163,212],[135,210],[322,195],[349,189],[378,190],[403,198],[377,210],[349,212],[153,407],[198,379],
[228,364],[256,370],[284,364],[314,379],[359,407],[315,443],[287,458],[256,459],[225,458],[197,443],
[172,408],[230,386],[256,385],[282,386],[340,408],[285,421],[256,423],[227,421],[0,0],[42,0],
[85,0],[128,0],[170,0],[213,0],[256,0],[298,0],[341,0],[384,0],[426,0],[469,0],
[512,0],
]


var N_POINTS = 68;
var N_POINTS_EXT = 81;


var panel = document.createElement("div")
panel.setAttribute("id","panel");
document.body.appendChild(panel)


var dbg_canvas = document.createElement("canvas");
dbg_canvas.width = WIDTH;
dbg_canvas.height = HEIGHT;
dbg_canvas.style.position = "absolute";
dbg_canvas.style.top = "0px";
dbg_canvas.style.left = "0px";
document.body.appendChild(dbg_canvas);
var dbg_context = dbg_canvas.getContext("2d")


var tex_canvas = document.createElement("canvas");
tex_canvas.setAttribute("id","tex_canvas");
tex_canvas.width = TEX_SIZE;
tex_canvas.height= TEX_SIZE;
// document.body.appendChild(tex_canvas);
var tex_context = tex_canvas.getContext("2d");


var std_canvas = document.createElement("canvas");
std_canvas.setAttribute("id","std_canvas");
std_canvas.width = TEX_SIZE;
std_canvas.height= TEX_SIZE;
std_canvas.style.position = "absolute";
std_canvas.style.top = "40px";
std_canvas.style.left = "0px";
panel.appendChild(std_canvas);
var std_context = std_canvas.getContext("2d");

var over_canvas = document.createElement("canvas");
over_canvas.setAttribute("id","over_canvas");
over_canvas.width = TEX_SIZE;
over_canvas.height= TEX_SIZE;
var over_context = over_canvas.getContext("2d");


std_canvas.addEventListener('mousemove', function(event) {
  var rect = std_canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
}, false);

std_canvas.onmousedown = function(e){
    mouseIsDown = true;
}
std_canvas.onmouseup = function(e){
    mouseIsDown = false;
}


var col_sel = document.createElement("div")
col_sel.classList.add("col-sel");
col_sel.style.position = "absolute";
panel.appendChild(col_sel)

function move_col_sel(div){
  col_sel.style.left = div.style.left;
  col_sel.style.top = div.style.top;
}

for (var i = 0; i < colors.length; i++){
  var div = document.createElement("div");
  div.classList.add("col-btn")
  if (colors[i].length){
    div.style.backgroundColor = colors[i];
  }else{
    div.style.backgroundColor = "white";
    div.innerHTML = "<b>X</b>";
  }
  div.style.position = "absolute";
  div.style.left = 15+i*30+"px";
  div.style.top = "10px";
  div.style.zIndex = "100";
  
  if (currentColor == colors[i]){
    move_col_sel(div);
  }
  function f(){
    var j = i;
    var _div = div;
    _div.onclick = function(){currentColor = colors[j];move_col_sel(_div)}
  }
  f();
  panel.appendChild(div)
}

for (var i = 0; i < sizes.length; i++){
  var div = document.createElement("div");
  div.classList.add("size-btn")
  div.style.position = "absolute";
  div.style.left = 405+i*30+"px";
  div.style.top = "10px";
  div.style.zIndex = "100";
  
  var si = Math.min(20,sizes[i])
  
  var sdiv = document.createElement("div");
  sdiv.classList.add("size-btn-ind");
  sdiv.style.width = si+"px";
  sdiv.style.height= si+"px";
  sdiv.style.top = (20-si)/2+"px";
  sdiv.style.left = (20-si)/2+"px";
  sdiv.style.backgroundColor="white";
  div.appendChild(sdiv);
  
  if (currentSize == sizes[i]){
    sdiv.style.backgroundColor="grey";
  }
  
  function f(){
    var j = i;
    var _div = div;
    var _sdiv = sdiv;
    _div.onclick = function(){
      var _all = document.getElementsByClassName("size-btn-ind");
      for (var k = 0; k < _all.length; k++){
        _all[k].style.backgroundColor="white";
      }
      currentSize = sizes[j];
      _sdiv.style.backgroundColor="grey";
    }
  }
  f();
  panel.appendChild(div)
}



fld_start();

var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, 2000 );
var camera = new THREE.OrthographicCamera( -WIDTH/2, WIDTH/2, HEIGHT/2, -HEIGHT/2, 0.1, 1000 );
camera.position.x = WIDTH/2;
camera.position.y = HEIGHT/2;
camera.position.z = 100;


var std_scene = new THREE.Scene();
var std_camera = new THREE.OrthographicCamera( -TEX_SIZE/2, TEX_SIZE/2, TEX_SIZE/2, -TEX_SIZE/2, 0.1, 1000 );
std_camera.position.x = TEX_SIZE/2;
std_camera.position.y = TEX_SIZE/2;
std_camera.position.z = 100;


var renderer = new THREE.WebGLRenderer( { alpha: true } );
renderer.setClearColor( 0x000000, 0 );
renderer.setSize( WIDTH, HEIGHT );
document.body.appendChild( renderer.domElement );

renderer.domElement.style.position = "absolute" 
renderer.domElement.style.left = "0px";
renderer.domElement.style.top = "0px";
renderer.domElement.style.opacity = "0.5";



var std_renderer = new THREE.WebGLRenderer();
std_renderer.setSize( TEX_SIZE, TEX_SIZE );
// document.body.appendChild( std_renderer.domElement );


function new_std_mesh(){
  var geometry = new THREE.Geometry();
  for (var i = 0; i < STANDARD512.length; i++){
    geometry.vertices.push(new THREE.Vector3( STANDARD512[i][0],  512-STANDARD512[i][1], 0 ));
  }
  
  for (var i = 0; i < TRIANGLES_EXT.length; i++){
    geometry.faces.push( new THREE.Face3( TRIANGLES_EXT[i][0], TRIANGLES_EXT[i][1], TRIANGLES_EXT[i][2] ) );
    geometry.faceVertexUvs[0].push([
      new THREE.Vector2(0,0),
      new THREE.Vector2(0,0),
      new THREE.Vector2(0,0),
    ]);
  }
  // geometry = new THREE.BoxGeometry( 200, 200, 200 );
  var texture = new THREE.Texture( tex_canvas )
  // var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  var material = new THREE.MeshBasicMaterial( {map:texture} );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.material.side = THREE.DoubleSide
  return mesh;  
}



function new_face_mesh(){
  var geometry = new THREE.Geometry();
  for (var i = 0; i < N_POINTS_EXT; i++){
    geometry.vertices.push(new THREE.Vector3( 0,  0, 0 ));
  }
  
  
  for (var i = 0; i < TRIANGLES_EXT.length; i++){
    geometry.faces.push( new THREE.Face3( TRIANGLES_EXT[i][0], TRIANGLES_EXT[i][1], TRIANGLES_EXT[i][2] ) );
    geometry.faceVertexUvs[0].push([
      new THREE.Vector2(STANDARD512[TRIANGLES_EXT[i][0]][0]/TEX_SIZE,1-STANDARD512[TRIANGLES_EXT[i][0]][1]/TEX_SIZE),
      new THREE.Vector2(STANDARD512[TRIANGLES_EXT[i][1]][0]/TEX_SIZE,1-STANDARD512[TRIANGLES_EXT[i][1]][1]/TEX_SIZE),
      new THREE.Vector2(STANDARD512[TRIANGLES_EXT[i][2]][0]/TEX_SIZE,1-STANDARD512[TRIANGLES_EXT[i][2]][1]/TEX_SIZE),
    ]);
  }
  
  // geometry = new THREE.BoxGeometry( 200, 200, 200 );
  
  var texture = new THREE.Texture( over_canvas )
  console.log(texture);
  // var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  var material = new THREE.MeshBasicMaterial( {map:texture} );
  var mesh = new THREE.Mesh( geometry, material );
  console.log(geometry.faceVertexUvs)
  mesh.material.side = THREE.DoubleSide
  return mesh;
}

var face_mesh = new_face_mesh();
scene.add( face_mesh );


var std_mesh = new_std_mesh();
std_scene.add( std_mesh );


function main(){
  dbg_context.fillStyle = "black";
  var vid = document.getElementsByClassName("handsfree-webcam")[0];
  if (vid){
    dbg_context.drawImage(vid, 0,0, WIDTH, HEIGHT);
    tex_context.drawImage(dbg_canvas, 0,0, TEX_SIZE, TEX_SIZE);
  }
  
  // context.fillRect(0,0,WIDTH,HEIGHT)
  
  var lmks = fld_get_ext();
  
  
  if (!lmks.length){
    return;
  }

//   dbg_context.fillStyle = "cyan";
//   for (var i = 0; i < lmks.length; i++){
//     dbg_context.fillRect(lmks[i].x-2, lmks[i].y-2, 4, 4)
//     dbg_context.fillText(i,lmks[i].x-5, lmks[i].y-5)
//   }
//   dbg_context.strokeStyle = "cyan"
//   for (var i = 0; i < TRIANGLES_EXT.length; i++){
//     dbg_context.beginPath();
//     dbg_context.moveTo(lmks[TRIANGLES_EXT[i][0]].x,lmks[TRIANGLES_EXT[i][0]].y);
//     dbg_context.lineTo(lmks[TRIANGLES_EXT[i][1]].x,lmks[TRIANGLES_EXT[i][1]].y);
//     dbg_context.lineTo(lmks[TRIANGLES_EXT[i][2]].x,lmks[TRIANGLES_EXT[i][2]].y);
    
//     dbg_context.stroke();
//   }
  
  
  for (var i = 0; i < lmks.length; i++){
    face_mesh.geometry.vertices[i].x = lmks[i].x;
    face_mesh.geometry.vertices[i].y = HEIGHT-lmks[i].y;  
  }
  
  for (var i = 0; i < std_mesh.geometry.faces.length; i++){
    var m = {a:0,b:1,c:2};
    for (var k in m){
      std_mesh.geometry.faceVertexUvs[0][i][m[k]].x = lmks[std_mesh.geometry.faces[i][k]].x/WIDTH 
      std_mesh.geometry.faceVertexUvs[0][i][m[k]].y = (HEIGHT-lmks[std_mesh.geometry.faces[i][k]].y)/HEIGHT
      
    }
  }
  
  face_mesh.material.map.needsUpdate = true;
  // face_mesh.geometry.uvsNeedUpdate = true;
  face_mesh.geometry.verticesNeedUpdate = true;
  
  std_mesh.material.map.needsUpdate = true;
  std_mesh.geometry.uvsNeedUpdate = true;
  // std_mesh.geometry.verticesNeedUpdate = true;
  renderer.render( scene, camera );
  
  std_renderer.render( std_scene, std_camera );
  
  std_context.drawImage(std_renderer.domElement,0,0,TEX_SIZE,TEX_SIZE);
  
  if (mouseIsDown){
    if (currentColor.length){
      over_context.beginPath();
      over_context.moveTo(pmouseX,pmouseY);
      over_context.lineTo(mouseX,mouseY);
      // over_context.arc(mouseX, mouseY, currentSize, 0, 2 * Math.PI, false);
      over_context.strokeStyle = currentColor;
      over_context.lineWidth = currentSize*2;
      over_context.lineCap = "round";
      over_context.stroke();
    }else{
      over_context.clearRect(mouseX-currentSize,mouseY-currentSize,currentSize*2,currentSize*2);
    }
  }
    
  std_context.save();
  std_context.globalAlpha = 0.5;
  std_context.drawImage(over_canvas,0,0,TEX_SIZE,TEX_SIZE)
  
  std_context.restore();
  
  
  std_context.strokeStyle="black";
  std_context.beginPath();
  std_context.arc(mouseX, mouseY, currentSize, 0, 2 * Math.PI, false);
  std_context.stroke();
  
  pmouseX = mouseX;
  pmouseY = mouseY;

}

setInterval(main, 10)