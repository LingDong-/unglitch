/* global describe sirds THREE */
var shape = [512, 512, 4];
var DPI = 100;

document.body.innerHTML+="<h2><center>Interactive Autostereogram</center></h2>"

var scene = new THREE.Scene();
var mat = new THREE.MeshDepthMaterial();
mat.side = THREE.DoubleSide;
scene.overrideMaterial = mat;

var camera = new THREE.PerspectiveCamera(75, shape[1] / shape[0], 0.9, 5);
camera.updateProjectionMatrix();

camera.position.z = 2;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xff000000);
renderer.setSize(shape[1], shape[0]);
var object;
var rerender = true;



function load_obj(url, position, scale, roty = 0) {
  var loader = new THREE.OBJLoader();
  loader.load(
    // resource URL
    url,
    // called when resource is loaded
    function(obj) {
      if (object) {
        scene.remove(object);
      }
      object = obj;
      object.scale.x = scale;
      object.scale.y = scale;
      object.scale.z = scale;
      object.rotation.y = roty;
      object.position.x = position[0];
      object.position.y = position[1];
      object.position.z = position[2];
      console.log(object);
      scene.add(object);
      rerender = true;
      controls.reset();
    },
    // called when loading is in progresses
    function(xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function(error) {
      console.log("An error happened");
    }
  );
}

function load_geom(geom) {
  if (object) {
    scene.remove(object);
  }
  object = new THREE.Mesh(geom, new THREE.MeshDepthMaterial());
  scene.add(object);
  rerender = true;
  controls.reset();
}

var loaders = {
  torus: () => load_geom(new THREE.TorusGeometry(0.7, 0.2, 128, 16)),
  knot: () => load_geom(new THREE.TorusKnotGeometry(0.6, 0.2, 128, 16)),
  teapot: () =>
    load_obj(
      "/autostereogram/glitch-assets/teapot.obj",
      [0, -0.5, 0],
      0.32
    ),
  bunny: () =>
    load_obj(
      "/autostereogram/glitch-assets/bunny.obj",
      [0.2, -1.2, 0],
      11
    ),
  dragon: () =>
    load_obj(
      "/autostereogram/glitch-assets/dragon.obj",
      [0, -0.7, 0],
      0.15
    ),
  lucy: () =>
    load_obj(
      "/autostereogram/glitch-assets/lucy.obj",
      [0, -1, 0],
      0.014,
      Math.PI
    )
};

var btndiv = document.createElement("div");
document.body.appendChild(btndiv);
btndiv.style.textAlign="center";
btndiv.style.padding="10px";
var buttons = {};
for (var k in loaders) {
  var btn = document.createElement("span");
  btndiv.appendChild(btn);
  btn.innerHTML = k;
  (function(){
    var _k = k
    var _btn = btn;
    _btn.onclick = function(){
      loaders[_k]();
      for (var b in buttons){
        buttons[b].style.fontWeight="normal";
      }
      _btn.style.fontWeight="bold";
    }
  })();
  btn.style.margin="10px";
  btn.classList.add("clickable-text");
  buttons[k]=btn;
}

var canv0 = document.createElement("canvas");
canv0.width = shape[1];
canv0.height = shape[0];
// document.body.appendChild(canv0);
// document.body.appendChild(renderer.domElement);

var canv1 = document.createElement("canvas");
canv1.width = shape[1];
canv1.height = shape[0];
document.body.appendChild(canv1);

var ctx = canv0.getContext("2d");

// var imageData = {data:new Uint8Array(canv0.width * canv0.height * 4)};
// var gl = canv0.getContext("webgl")
// gl.readPixels(0,0,canv0.width,canv0.height,gl.RGBA, gl.UNSIGNED_BYTE, imageData.data);

var R = new Array(shape[0] * shape[1])
  .fill(0)
  .map((_, i) => Math.random() * 255);
var controls = new THREE.OrbitControls(camera, canv1);

var oldcampos;

buttons.knot.click();

function loop() {
  renderer.render(scene, camera);

  controls.update();

  var newcampos = JSON.stringify(camera.position);

  if (oldcampos != newcampos) {
    rerender = true;
  }
  if (rerender) {
    rerender = false;
    oldcampos = newcampos;

    ctx.drawImage(renderer.domElement, 0, 0);
    // object.scale.x
    var imageData = ctx.getImageData(0, 0, canv0.width, canv0.height);

    var rand = function(x, y) {
      // r = Math.round(Math.random())*255;
      // return [r,r,r,255];
      var r0 = Math.random() * 255;
      // return [r, r, r, 255];
      var r1 = R[y * shape[1] + x];
      var r2 = imageData.data[y * shape[1] * shape[2] + x * shape[2]];
      var r = r0;
      if (r2 == 0) {
        if (Math.random() < 0.6) {
          r = r1;
        }
      } else {
        // r = r2;
      }
      // return [r,r,r,255]
      return [r * 0.9, r1 * 0.5, r0 * 0.5, 255];
    };

    var pixels = sirds(DPI, { shape, data: imageData.data }, rand);
    var imageData2 = canv1
      .getContext("2d")
      .getImageData(0, 0, canv0.width, canv0.height);
    imageData2.data.set(pixels.data, 0);
    var ctx1 = canv1.getContext("2d");
    ctx1.putImageData(imageData2, 0, 0);

    ctx1.fillStyle = "lightgrey";
    // ctx1.fillText("Drag to rotate, scroll to zoom",shape[1]/2-65,shape[0]-8);

    ctx1.beginPath();
    ctx1.arc(pixels.conv_dots[0], shape[0] - 30, 3, 0, 2 * Math.PI);
    ctx1.arc(pixels.conv_dots[1], shape[0] - 30, 3, 0, 2 * Math.PI);
    ctx1.fill();
    // rand = function(x, y) {
    //   var i = y*shape[0]*shape[2]+x*shape[2];
    //   return pixels.data.slice(i,i+4);
    // };
  }
  // if (!object){
  requestAnimationFrame(loop);
  // }
}

loop();

// canv0.style.width="512px"
// canv0.style.height="512px"
canv1.style.width = "512px";
// canv1.style.height="512px"
canv1.style.display = "block";
canv1.style.margin = "auto";

var ins = document.createElement("div");
ins.innerHTML = "Drag to rotate, scroll to zoom";
ins.style.textAlign = "center";
ins.style.fontSize = "12px";
ins.style.paddingTop = "10px";
document.body.appendChild(ins);
