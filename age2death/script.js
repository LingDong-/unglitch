/* global describe fld_start fld_get fld_get_ext THREE age_texture age_mesh age_post WIDTH HEIGHT TEX_SIZE TRIANGLES TRIANGLES_EXT OUTLINE_EXT STANDARD512 DEBUG AGE_SPEED*/

if (!window.chrome){alert("This demo may or may not work in your current browser. Google Chrome is recommanded.")}
if (!window.location.href.toString().includes("https://")){alert(`You may need "https://" to access webcam.`)}

if (age_mesh == undefined || WIDTH == undefined || fld_start == undefined){
  alert("Glitch.com didn't serve the site properly, reload needed.")
  location.reload();
}


var age = 0;

var frameCount = 0;
var oox = (HEIGHT-WIDTH)/2
var ooy = 0;
var oow = WIDTH;
var ooh = HEIGHT;

var images = {
  skull:{url:"/age2death/glitch-assets/skull00.png"},
  wrinkle:{url:"/age2death/glitch-assets/wrinkle00.png"},
  hair:{url:"/age2death/glitch-assets/hair00.png"},
  lip:{url:"/age2death/glitch-assets/lip00.png"},
  blotch:{url:"/age2death/glitch-assets/blotch00.png"},
  corpse:{url:"/age2death/glitch-assets/corpse00.png"},
  corpseskin:{url:"/age2death/glitch-assets/corpse01.png"},
  wrinklelight:{url:"/age2death/glitch-assets/wrinkle01.png"},
  tooth:{url:"/age2death/glitch-assets/tooth00.png"},
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL//.replace(/^data:image\/(png|jpg);base64,/, "");
}
try{
  for (var k in images){
    var imageObj = new Image();
    imageObj.src = images[k].url;
    imageObj.crossOrigin = "anonymous";

    function f(){
      var im = imageObj;
      var l = k;
      imageObj.onload = function() {
        im.src = getBase64Image(im);
        im.onload = function(){
          images[l].data = im
        }
      }
    }
    try{
      imageObj.crossOrigin = "anonymous";
      f();
    }catch(e){
      try{
        imageObj.crossOrigin = "anonymous";
        f()
      }catch(ee){
        try{
          imageObj.crossOrigin = "anonymous";
          f()
        }catch(eee){
          try{
            imageObj.crossOrigin = "anonymous";
            f()
          }catch(eeee){
            alert("reload required!")
            location.reload();
          }
        }
      }
    }
  }
}catch(eeeee){
  alert("reload required!")
  location.reload();
}

function imageAllLoaded(){
  for (var k in images){
    if (images[k].data == undefined){
      return false;
    }
  }
  return true;
}

function waitForImages(callback){
  if (imageAllLoaded()){
    callback()
  }else{
    console.log("waiting for images...");
    setTimeout(function(){waitForImages(callback)}, 100);
  }
}


var N_POINTS = 68;
var N_POINTS_EXT = 81;

var dst_canvas = document.createElement("canvas");
dst_canvas.setAttribute("id","dst_canvas");
dst_canvas.width = WIDTH;
dst_canvas.height = HEIGHT;
if (DEBUG){document.body.appendChild(dst_canvas);}
var dst_context = dst_canvas.getContext("2d")


var view_canvas = document.createElement("canvas");
view_canvas.setAttribute("id","view_canvas");
view_canvas.width = HEIGHT;
view_canvas.height = HEIGHT;
view_canvas.style.borderRadius = HEIGHT/2+"px"
view_canvas.style.position = "absolute";
view_canvas.style.left = window.innerWidth/2-HEIGHT/2+"px"
view_canvas.style.top = window.innerHeight*0.45-HEIGHT/2+"px"
view_canvas.style.transform = "scale(-1,1)";
document.body.appendChild(view_canvas);
var view_context = view_canvas.getContext("2d")


var fg_canvas = document.createElement("canvas");
fg_canvas.setAttribute("id","fg_canvas");
fg_canvas.width = WIDTH;
fg_canvas.height = HEIGHT;
// document.body.appendChild(fg_canvas);
var fg_context = fg_canvas.getContext("2d")


var dbg_canvas = document.createElement("canvas");
dbg_canvas.width = WIDTH;
dbg_canvas.height = HEIGHT;
// dbg_canvas.style.position = "absolute";
// dbg_canvas.style.top = "0px";
// dbg_canvas.style.left = "0px";
if (DEBUG){document.body.appendChild(dbg_canvas)};
var dbg_context = dbg_canvas.getContext("2d")


var mask_canvas = document.createElement("canvas");
mask_canvas.setAttribute("id","mask_canvas");
mask_canvas.width = WIDTH;
mask_canvas.height = HEIGHT;
// document.body.appendChild(mask_canvas);
var mask_context = mask_canvas.getContext("2d")


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
// std_canvas.style.position = "absolute";
// std_canvas.style.top = "0px";
// std_canvas.style.left = "640px";
if (DEBUG){document.body.appendChild(std_canvas);}
var std_context = std_canvas.getContext("2d");

var over_canvas = document.createElement("canvas");
over_canvas.setAttribute("id","over_canvas");
over_canvas.width = TEX_SIZE;
over_canvas.height= TEX_SIZE;
var over_context = over_canvas.getContext("2d");


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


var renderer = new THREE.WebGLRenderer({ alpha: true } );
renderer.setClearColor( 0x000000, 0 );
renderer.setSize( WIDTH, HEIGHT );
// document.body.appendChild( renderer.domElement );

// renderer.domElement.style.position = "absolute" 
// renderer.domElement.style.left = "0px";
// renderer.domElement.style.top = "480px";
// renderer.domElement.style.opacity = "0.5";



var std_renderer = new THREE.WebGLRenderer();
std_renderer.setSize( TEX_SIZE, TEX_SIZE );
// document.body.appendChild( std_renderer.domElement );


function new_std_mesh(){
  var geometry = new THREE.Geometry();
  for (var i = 0; i < STANDARD512.length; i++){
    geometry.vertices.push(new THREE.Vector3( STANDARD512[i][0]*(TEX_SIZE/512),  (512-STANDARD512[i][1])*(TEX_SIZE/512), 0 ));
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
      new THREE.Vector2(STANDARD512[TRIANGLES_EXT[i][0]][0]/512,1-STANDARD512[TRIANGLES_EXT[i][0]][1]/512),
      new THREE.Vector2(STANDARD512[TRIANGLES_EXT[i][1]][0]/512,1-STANDARD512[TRIANGLES_EXT[i][1]][1]/512),
      new THREE.Vector2(STANDARD512[TRIANGLES_EXT[i][2]][0]/512,1-STANDARD512[TRIANGLES_EXT[i][2]][1]/512),
    ]);
  }
  
  // geometry = new THREE.BoxGeometry( 200, 200, 200 );
  
  var texture = new THREE.Texture( std_canvas )
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

function lerp2d(a,b,t){
  return {x:a.x*(1-t)+b.x*t, y:a.y*(1-t)+b.y*t}
}
function dist2d(a,b){
  return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2));
}

function main(){
  
  // age = Math.sin(frameCount*0.01)*0.5+0.5
  age = Math.min(frameCount*AGE_SPEED,1);
  
  if (age >= 1){
    return;
  }
  
  var vid = document.getElementsByClassName("handsfree-webcam")[0];
  
  if (DEBUG){
    dbg_context.fillStyle = "black";
    
    if (vid){
      dbg_context.drawImage(vid, 0,0, WIDTH, HEIGHT);
    }
  }
  
  if (vid){
    tex_context.drawImage(vid, 0,0, TEX_SIZE, TEX_SIZE);
  }
  
  // context.fillRect(0,0,WIDTH,HEIGHT)
  
  var lmks = fld_get_ext();
  
  
  if (!lmks.length){
    return;
  }

  
  if (DEBUG){
    dbg_context.fillStyle = "cyan";
    for (var i = 0; i < lmks.length; i++){
      dbg_context.fillRect(lmks[i].x-2, lmks[i].y-2, 4, 4)
      dbg_context.fillText(i,lmks[i].x-5, lmks[i].y-5)
    }
    dbg_context.strokeStyle = "cyan"
    for (var i = 0; i < TRIANGLES_EXT.length; i++){
      dbg_context.beginPath();
      dbg_context.moveTo(lmks[TRIANGLES_EXT[i][0]].x,lmks[TRIANGLES_EXT[i][0]].y);
      dbg_context.lineTo(lmks[TRIANGLES_EXT[i][1]].x,lmks[TRIANGLES_EXT[i][1]].y);
      dbg_context.lineTo(lmks[TRIANGLES_EXT[i][2]].x,lmks[TRIANGLES_EXT[i][2]].y);

      dbg_context.stroke();
    }
  }
  

  
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
  

  age_mesh(age,face_mesh)
  
  face_mesh.material.map.needsUpdate = true;
  // face_mesh.geometry.uvsNeedUpdate = true;
  face_mesh.geometry.verticesNeedUpdate = true;
  
  
  
  // mask_context.fillStyle="white";
  mask_context.clearRect(0,0,WIDTH,HEIGHT)
  mask_context.fillStyle = "black";
  mask_context.beginPath();
  
  function transf(p){
    return lerp2d(p,face_mesh.geometry.vertices[30],10/dist2d(p,lmks[30]));
  }

  for (var i = 0; i < OUTLINE_EXT.length; i++){
    var p = transf(face_mesh.geometry.vertices[OUTLINE_EXT[i]])
    if (i){
      mask_context.lineTo(p.x,HEIGHT-Math.min(Math.max(p.y,0),HEIGHT))
    }else{
      mask_context.moveTo(p.x,HEIGHT-Math.min(Math.max(p.y,0),HEIGHT))
    }
  }
  mask_context.fill();
  mask_context.filter = 'blur(5px)';
  
  
  
  std_mesh.material.map.needsUpdate = true;
  std_mesh.geometry.uvsNeedUpdate = true;
  // std_mesh.geometry.verticesNeedUpdate = true;
  renderer.render( scene, camera );
  
  std_renderer.render( std_scene, std_camera );
  
  std_context.drawImage(std_renderer.domElement,0,0,TEX_SIZE,TEX_SIZE);
  
  // over_context.clearRect(0,0,TEX_SIZE,TEX_SIZE);
  // over_context.drawImage(images.skull.data,0,0,TEX_SIZE,TEX_SIZE)
    
  // std_context.save();
  age_texture(age,std_canvas,images)
  // std_context.restore();
  
  
  fg_context.clearRect(0, 0, WIDTH,HEIGHT);
  fg_context.globalCompositeOperation = 'source-over';
  fg_context.drawImage(mask_canvas,0,0,WIDTH,HEIGHT);
  fg_context.globalCompositeOperation = 'source-in';
  fg_context.drawImage(renderer.domElement, 0,0, WIDTH,HEIGHT);

    
  dst_context.drawImage(vid,0,0,WIDTH,HEIGHT);
  dst_context.drawImage(fg_canvas,0,0,WIDTH,HEIGHT);
  
  age_post(age,dst_canvas,mask_canvas,images,face_mesh);
  
  
  var left = lmks[0].x;
  var right = lmks[16].x;
  var top = lmks[74].y;
  var bottom = lmks[8].y;
  var pad = HEIGHT/4;

  
  var sc = (HEIGHT-pad*2)/(right-left);
  // console.log(sc)
  
  var padtop = (HEIGHT - sc * (bottom-top))/2;
  var cox = (-left)*sc+pad
  var coy = (-top)*sc+padtop
  var cow = WIDTH*sc
  var coh = HEIGHT*sc
  
  
  var t = 0.2
  oox = oox * (1-t) + cox * t
  ooy = ooy * (1-t) + coy * t
  oow = oow * (1-t) + cow * t
  ooh = ooh * (1-t) + coh * t
  
  
  oox = Math.min(Math.max(oox,HEIGHT-oow),0)
  ooy = Math.min(Math.max(ooy,HEIGHT-ooh),0);
  
  
  
  view_context.fillStyle = "black";
  view_context.fillRect(0,0,HEIGHT,HEIGHT)
  view_context.drawImage(dst_canvas,oox,ooy,oow,ooh);
  
  frameCount ++;

}
waitForImages(function(){setInterval(main, 10)});