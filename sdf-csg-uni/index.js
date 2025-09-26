/*global describe twgl*/


var vs = `
attribute vec4 position;
void main() {
  gl_Position = position;
}`

var fs_sdf = `
precision mediump float;
uniform vec2 resolution;


uniform float data[800];
uniform int n_data;


float sdEllipsoid( in vec3 p, in vec3 r ) {
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0*(k0-1.0)/k1;
}
float sdBox( vec3 p, vec3 b ){
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float sdCone( in vec3 p, float r, float h ){
  vec2 q = vec2(r,-h);
    
  vec2 w = vec2( length(p.xz), p.y );
  vec2 a = w - q*clamp( dot(w,q)/dot(q,q), 0.0, 1.0 );
  vec2 b = w - q*vec2( clamp( w.x/q.x, 0.0, 1.0 ), 1.0 );
  float k = sign( q.y );
  float d = min(dot( a, a ),dot(b, b));
  float s = max( k*(w.x*q.y-w.y*q.x),k*(w.y-q.y)  );
  return sqrt(d)*sign(s);
}

float sdCappedCylinder( vec3 p, float r, float h ){
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

vec4 opUnion( vec4 d1, vec4 d2 ){
	return (d1.w<d2.w) ? d1 : d2;
}
vec4 opSubtract( vec4 d1, vec4 d2 ){
	return (d1.w>-d2.w) ? d1 : vec4(d2.xyz,-d2.w);
}
vec4 opIntersect( vec4 d1, vec4 d2 ){
	return (d1.w>d2.w) ? d1 : d2;
}


vec4 opSmoothUnion( vec4 d1, vec4 d2, float k ) {
  float h = clamp( 0.5 + 0.5*(d2.w-d1.w)/k, 0.0, 1.0 );
  return mix( d2, d1, h ) - vec4(0.,0.,0.,k*h*(1.0-h));
}

vec4 opSmoothSubtract( vec4 d1, vec4 d2, float k ) {
  float h = clamp( 0.5 - 0.5*(d2.w+d1.w)/k, 0.0, 1.0 );
  return vec4(mix(d1.xyz,d2.xyz,h), mix( d1.w, -d2.w, h )) + vec4(0.,0.,0.,k*h*(1.0-h));
}

vec4 opSmoothIntersect( vec4 d1, vec4 d2, float k ) {
  float h = clamp( 0.5 - 0.5*(d2.w-d1.w)/k, 0.0, 1.0 );
  return mix( d2, d1, h ) + vec4(0.,0.,0.,k*h*(1.0-h));
}


vec4 map( in vec3 p){
  vec4 res = vec4(0.0,0.0,0.0,p.y);
  for (int i = 0; i < 1024; i+=16){
    if (i >= n_data){
      break;
    }
    int op =   int(data[i]);
    int prim = int(data[i+1]);
    
    float kx   = data[i+2];
    float ky   = data[i+3];
    
    float qx   = data[i+4];
    float qy   = data[i+5];
    float qz   = data[i+6];
    float qw   = data[i+7];
    
    float dx   = data[i+8];
    float dy   = data[i+9];
    float dz   = data[i+10];
    
    float mt   = data[i+11];
    
    float ax   = data[i+12];
    float ay   = data[i+13];
    float az   = data[i+14];
    float aw   = data[i+15];
    
    vec3 ofs = vec3(dx,dy,dz);
    
    float ql = length(vec4(qx,qy,qz,qw));
    qx /= ql;
    qy /= ql;
    qz /= ql;
    qw /= ql;

    float qx2 = qx*qx;
    float qy2 = qy*qy;
    float qz2 = qz*qz;
    float qw2 = qw*qw;
    mat3 rot = mat3(
      1.-2.*qy2-2.*qz2, 2.*qx*qy - 2.*qz*qw,  2.*qx*qz + 2.*qy*qw,
      2.*qx*qy + 2.*qz*qw, 1. - 2.*qx2 - 2.*qz2, 2.*qy*qz - 2.*qx*qw,
      2.*qx*qz - 2.*qy*qw, 2.*qy*qz + 2.*qx*qw, 1. - 2.*qx2 - 2.*qy2
    );

    float d;
    vec3 pp = rot*(p-ofs);
    
    float cr = floor(mt / 65536.);
    vec3 col = vec3(
      cr,
      floor((mt - cr * 65536.)/255.),
      mod(mt,256.)
    )/255.;
  
    if (prim == 1){
      d = sdEllipsoid(pp, vec3(ax,ay,az));
    }else if (prim == 2){
      d = sdBox(pp, vec3(ax,ay,az));
    }else if (prim == 3){
      d = sdCone(pp, ax, ay);
    }else if (prim == 4){
      d = sdCappedCylinder(pp, ax, ay);
    }
    d*=ky;
    
    if (op == 0){
      res = vec4(col,d);
    }else if (op == 1){
      res = opUnion(res,vec4(col,d));
    }else if (op == 2){
      res = opSubtract(res,vec4(col,d));
    }else if (op == 3){
      res = opIntersect(res,vec4(col,d));
    }else if (op == 4){
      res = opSmoothUnion(res,vec4(col,d),kx);
    }else if (op == 5){
      res = opSmoothSubtract(res,vec4(col,d),kx);
    }else if (op == 6){
      res = opSmoothIntersect(res,vec4(col,d),kx);
    }
  }
  return res;
}
`;


const fs_march = fs_sdf + `

uniform vec3 eye;
uniform vec3 target;

vec4 castRay( in vec3 ro, in vec3 rd ){
  vec4 res = vec4(0.0);
  float t = 0.0;
  const float tmax = 100.0;
  for( int i=0; i<100; i++ ){
    if (t>=tmax) break;
    vec4 h = map( ro+rd*t);
    res = vec4(h.xyz,t);
    if( abs(h.w)<(0.0001*t) ){
      break;
    }
    t += h.w;
  }
  return (t<tmax) ? res : vec4(0.0);
}
vec3 calcNormal( in vec3 pos){
    vec2 e = vec2(1.0,-1.0)*0.5773*0.0005;
    return normalize( e.xyy*map( pos + e.xyy ).w + 
					  e.yyx*map( pos + e.yyx ).w + 
					  e.yxy*map( pos + e.yxy ).w + 
					  e.xxx*map( pos + e.xxx ).w );
}

vec3 render( in vec3 ro, in vec3 rd ){ 
  
  vec4 t = castRay(ro,rd);

  vec3 col = t.xyz;

  vec3  pos = ro + t.w*rd;
  vec3  nor;

  nor = calcNormal( pos);


  vec3  lig = normalize( vec3(-0.5, 1.9, 0.8) );
  float dif = (clamp( dot( nor, lig ), -1.0, 1.0 )+1.0) / 1.8;
  //dif = sqrt(dif);
  
  if (t.w <= 0.0){
    dif = 0.0;
    col = vec3(1.0,1.0,1.0);
  }
  
  col *= mix(vec3(0.1,0.15,0.2),vec3(1.0,0.95,0.8),dif);

	return col;
}


void main(){

  vec3 ro = vec3( eye );
  vec3 ta = vec3( target );

  vec3 cw = normalize(ta-ro);
  vec3 cu = normalize( cross(cw,vec3(0.0, 1.0,0.0)) );
  vec3 cv =          ( cross(cu,cw) );


  vec2 fc = gl_FragCoord.xy;

  vec2 p = (-vec2(resolution.x,resolution.y) + 2.0*fc)/resolution.y;

  vec3 rd = normalize( p.x*cu + p.y*cv + 2.0*cw );

  vec3 col = render( ro, rd);

  gl_FragColor = vec4( col, 1.0 );
}`



const fs_scan = fs_sdf + `

uniform vec2 xymin;
uniform vec2 xymax;
uniform float zpl;
uniform float eps;

float sigmoid (float x,float a){
  float y = 0.;
  if (x<=0.5){
    y = (pow(2.0*x, 1.0/a))/2.0;
  } else {
    y = 1.0 - (pow(2.0*(1.0-x), 1.0/a))/2.0;
  }
  return y;
}
  
void main(){

  vec2 xy = xymin + (gl_FragCoord.xy / resolution.xy) * (xymax-xymin);
  vec3 xyz = vec3(xy, zpl);
  
  float d = map(xyz).w;
  
  float g = (clamp(d,-eps,eps)+eps)/(eps*2.);
  
//  float gg = 1.-sigmoid(g,0.5);
  float gg = 1.-g;

  gl_FragColor = vec4( gg,gg,gg, 1.0 );
}`


const gl = document.createElement("canvas").getContext("webgl");
document.body.appendChild(gl.canvas);
gl.canvas.width = 640;
gl.canvas.height = 480;

const programInfo = twgl.createProgramInfo(gl, [vs,fs_march]);


const arrays = {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
};
const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);


twgl.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

function pass(programInfo,uni) {
  const uniforms = Object.assign({
    resolution: [gl.canvas.width, gl.canvas.height],
  },uni);

  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);

}

let data = [];

let eye = [0.0,0.0,1.0];
let zoom = 1;

let autorot = true;

let frame = 0;
function loop(){
  requestAnimationFrame(loop);
  
  if (autorot){
    eye = [Math.sin(frame*0.01), 0.0, Math.cos(frame*0.01)]
  }
  
  pass(programInfo,{
    data:data.concat(0),
    n_data:Math.max(1,data.length),
    eye:[zoom*eye[0],zoom*eye[1],zoom*eye[2]],
    target:[0.0, 0.0, 0.0],
  });
  
  frame ++;
}


loop();

function make_btn(name,fun){
  let btn = document.createElement("button");
  btn.innerHTML = name;
  btn.onclick = fun;
  document.body.appendChild(btn);
}

function add_shape_gui(d=[4,1,0.05,1,  0,0,0,1,  0,0,0,'0xffffff',  0.2,0.2,0.2,0], prevdiv){
  let div = document.createElement("div");
  div.id = "l"+Math.random();
  let s;
  div.innerHTML = `
  op=
  <select class="d0">
    <option value="${s=0}" ${d[0]==s++?'selected':''}>↤</option>
    <option value="${s  }" ${d[0]==s++?'selected':''}>∪</option>
    <option value="${s  }" ${d[0]==s++?'selected':''}>\\</option>
    <option value="${s  }" ${d[0]==s++?'selected':''}>∩</option>
    <option value="${s  }" ${d[0]==s++?'selected':''}>~∪</option>
    <option value="${s  }" ${d[0]==s++?'selected':''}>~\\</option>
    <option value="${s  }" ${d[0]==s++?'selected':''}>~∩</option>
  </select>,
  primitive=
  <select class="d1">
    <option value="${s=0}" ${d[1]==s++?'selected':''}>invalid</option>
    <option value="${s  }" ${d[1]==s++?'selected':''}>ellipsoid</option>
    <option value="${s  }" ${d[1]==s++?'selected':''}>box</option>
    <option value="${s  }" ${d[1]==s++?'selected':''}>cone</option>
    <option value="${s  }" ${d[1]==s++?'selected':''}>cylinder</option>
  </select>,
  smooth=<input class="d2" value="${d[2]}" size="5"/>,
  sdf*=<input class="d3" value="${d[3]}" size="5"/>,
  quat=[
    <input class="d4" value="${d[4]}" size="5"/>,
    <input class="d5" value="${d[5]}" size="5"/>,
    <input class="d6" value="${d[6]}" size="5"/>,
    <input class="d7" value="${d[7]}" size="5"/>
  ],
  pos=[
    <input class="d8" value="${d[8]}" size="5"/>,
    <input class="d9" value="${d[9]}" size="5"/>,
    <input class="d10" value="${d[10]}" size="5"/>
  ],
  <input class="d11" value="${d[11]}" size="8"/>,
  params=[
  <input class="d12" value="${d[12]}" size="5"/>,
  <input class="d13" value="${d[13]}" size="5"/>,
  <input class="d14" value="${d[14]}" size="5"/>,
  <input class="d15" value="${d[15]}" size="5"/>
  ]
  <button onclick="document.getElementById('${div.id}').remove()">x</button>
  <button onclick="add_shape_gui(undefined,document.getElementById('${div.id}'))">+</button>
  `;
  div.style = "border:1px solid black;padding:4px;margin:4px"
  if (prevdiv){
    prevdiv.parentNode.insertBefore(div, prevdiv.nextSibling);
  }else{
    div_list.appendChild(div);
  }
  
}

let div_list = document.createElement("div");
document.body.appendChild(div_list);

add_shape_gui([0,1,0,1,  0,0,0,1,  0,0,0,'0xff0000',   0.3,0.2,0.2,0]);
add_shape_gui([4,3,0.2,1,  0,0,0,1,  0,0.4,0,'0xffff00',   0.2,0.5,0,  0]);
add_shape_gui([5,4,0.05,1,  1,0,0,1,  0,0,0,'0x00ffff',   0.05,0.3,0,  0]);
add_shape_gui([4,2,0.1,1,  0,2,0,1,  0,-0.05,0,'0xff00ff',   0.1,0.3,0.1,  0]);


function update_data(){
  let n = document.body.getElementsByClassName("d0").length;
  let nd = new Array(n*16);
  for (let i = 0; i < 16; i++){
    let di = document.body.getElementsByClassName("d"+i);
    for (let j = 0; j < n; j++){
      nd[j*16+i] = Number(di[j].value);
    }
  }
  data.splice(0,Infinity,...nd);
}

setInterval(update_data,50);



let VOX_RES = 512;


const glo = document.createElement("canvas").getContext("webgl");
const ctxo = document.createElement("canvas").getContext('2d',{willReadFrequently: true});

// document.body.appendChild(glo.canvas);
// document.body.appendChild(ctxo.canvas);



function make_voxels(x0,y0,z0,x1,y1,z1,res=VOX_RES){
  glo.canvas.width =  res;
  glo.canvas.height = res;
  console.log(glo.canvas.width,glo.canvas.height);

  const programInfo1 = twgl.createProgramInfo(glo, [vs,fs_scan]);
  const bufferInfo1 = twgl.createBufferInfoFromArrays(glo, arrays);

  // twgl.resizeCanvasToDisplaySize(glo.canvas);
  glo.viewport(0, 0, glo.canvas.width, glo.canvas.height);

  ctxo.canvas.width =  res;
  ctxo.canvas.height = res;
  
  function passo(programInfo,uni) {
    const uniforms = Object.assign({
      resolution: [glo.canvas.width, glo.canvas.height],
    },uni);

    glo.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(glo, programInfo, bufferInfo1);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(glo, bufferInfo1);
  }
  
  let V = new Float32Array(res*res*res);
  let idx = 0;
  for (let i = 0; i < res; i++){
    passo(programInfo1,{
      data,
      n_data:data.length,
      xymin:[x0,y0],
      xymax:[x1,y1],
      zpl:z0 + (z1-z0)*i/res,
      eps:0.01,
    });
    ctxo.drawImage(glo.canvas,0,0);
    let imdata = ctxo.getImageData(0,0,res,res).data;
    for (let j = 0; j < imdata.length; j+=4){
      V[idx++] = imdata[j]/255.0;
    }
  }
  return V;
}


function voxels2faces(V,w,h,d){
  function getvox(x,y,z){
    if (x < 0 || x >= w) return 0;
    if (y < 0 || y >= h) return 0;
    if (z < 0 || z >= d) return 0;

    return V[z*(w*h)+y*(w)+x];
  }

  let faces = [];
  function addface(x,y,z,a,b,c,d){
    faces.push([
      [x+a[0],y+a[1],z+a[2]],
      [x+b[0],y+b[1],z+b[2]],
      [x+c[0],y+c[1],z+c[2]],
    ])
    faces.push([
      [x+a[0],y+a[1],z+a[2]],
      [x+c[0],y+c[1],z+c[2]],
      [x+d[0],y+d[1],z+d[2]],
    ])
  }
  for (let i = 0; i < d; i++){
    for (let j = 0; j < h; j++){
      for (let k = 0; k < w; k++){

        let a0 = getvox(k,j,i);
        let a1 = getvox(k-1,j,i);
        let a2 = getvox(k+1,j,i);
        let a3 = getvox(k,j-1,i);
        let a4 = getvox(k,j+1,i);
        let a5 = getvox(k,j,i-1);
        let a6 = getvox(k,j,i+1);
        if (!a0) continue;
        if (!a1) addface(k,j,i,[0,0,1],[0,1,1],[0,1,0],[0,0,0]);
        if (!a2) addface(k,j,i,[1,0,0],[1,1,0],[1,1,1],[1,0,1]);
        if (!a3) addface(k,j,i,[1,0,0],[1,0,1],[0,0,1],[0,0,0]);
        if (!a4) addface(k,j,i,[0,1,0],[0,1,1],[1,1,1],[1,1,0]);
        if (!a6) addface(k,j,i,[1,0,1],[1,1,1],[0,1,1],[0,0,1]);
        if (!a5) addface(k,j,i,[0,0,0],[0,1,0],[1,1,0],[1,0,0]);
      }
    }
  }
  return faces;
}


function to_stl_bin(faces){
  let nb = 84+faces.length*50;
  console.log(`writing stl (binary)... estimated ${~~(nb/1048576)} MB`);

  let o = new Uint8Array(nb);
  let a = new ArrayBuffer(4);
  let b = new Uint32Array(a);
  b[0] = faces.length;
  o.set(new Uint8Array(a),80);
  for (let i = 0; i < faces.length; i++){
    let d = [
      faces[i][0][0],faces[i][0][1],faces[i][0][2],
      faces[i][1][0],faces[i][1][1],faces[i][1][2],
      faces[i][2][0],faces[i][2][1],faces[i][2][2],
    ]
    let a = new ArrayBuffer(36);
    let b = new Float32Array(a);
    d.map((x,j)=>b[j]=x);
    o.set(new Uint8Array(a),84+i*50+12);
  }
  return o;
}

function download_stl(pth,faces){
  let name = `${pth}-${new Date().getTime()}.stl`;
  let data = to_stl_bin(faces);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  var blob = new Blob([data], {type: "model/stl"});
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
}

function download_npy(pth,V,w,h,d){
  let name = `${pth}-${new Date().getTime()}.npy`;
  let data = window.npy.tobuffer({data:V,shape:[d,h,w],fortran_order:false});
  
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  var blob = new Blob([data], {type: "application/octet-stream"});
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
}

let dldiv = document.createElement("form");
dldiv.innerHTML = `
download model:
xmin=<input value="-0.5" size="5"/>,
ymin=<input value="-0.5" size="5"/>,
zmin=<input value="-0.5" size="5"/>,
xmax=<input value= "0.5" size="5"/>,
ymax=<input value= "0.5" size="5"/>,
zmax=<input value= "0.5" size="5"/>,
res=<input value="${VOX_RES}" size="5"/>,
<button type="button" onclick="downloader(0)">↓ NPY (voxels) </button>
<button type="button" onclick="downloader(1)">↓ STL (aliased, fast) </button>
<button type="button" onclick="downloader(2)">↓ STL (marching cubes, slow) </button>
`
document.body.appendChild(dldiv);

function downloader(type){
  let res = Number(dldiv.elements[6].value);
  if (type == 0){
    download_npy("scu",make_voxels(
      Number(dldiv.elements[0].value),
      Number(dldiv.elements[1].value),
      Number(dldiv.elements[2].value),
      Number(dldiv.elements[3].value),
      Number(dldiv.elements[4].value),
      Number(dldiv.elements[5].value),
      res,
    ),res,res,res);
  }else if (type == 1){
    download_stl("scu",voxels2faces(make_voxels(
      Number(dldiv.elements[0].value),
      Number(dldiv.elements[1].value),
      Number(dldiv.elements[2].value),
      Number(dldiv.elements[3].value),
      Number(dldiv.elements[4].value),
      Number(dldiv.elements[5].value),
      res,
    ),res,res,res));
    
  }else if (type == 2){
    
    download_stl("scu",window.MarchVoxels(make_voxels(
      Number(dldiv.elements[0].value),
      Number(dldiv.elements[1].value),
      Number(dldiv.elements[2].value),
      Number(dldiv.elements[3].value),
      Number(dldiv.elements[4].value),
      Number(dldiv.elements[5].value),
      res,
    ),res,res,res));
  }
}

// download_stl("scu.stl",window.MarchVoxels(make_voxels(-1,-1,-1,1,1,1),VOX_RES,VOX_RES,VOX_RES));




let elt = gl.canvas;

let mouseX;
let mouseY;
let pmouseX;
let pmouseY;
let mouseIsDown;

elt.addEventListener("mousedown",function(event){
  autorot=false;
  let box = elt.getBoundingClientRect();
  mouseX = event.clientX-box.left;
  mouseY = event.clientY-box.top;
  mouseIsDown = true;
})

function v_mag(x,y,z){
  return Math.sqrt(x*x+y*y+z*z)
}
function v_norm(x,y,z){
  let l = v_mag(x,y,z);
  return [x/l,y/l,z/l];
}
function v_cross(a1,a2,a3,b1,b2,b3){
  return [(a2)*(b3)-(a3)*(b2),(a3)*(b1)-(a1)*(b3),(a1)*(b2)-(a2)*(b1)]
}
function v_dot(a1,a2,a3,b1,b2,b3){
  return ((a1)*(b1)+(a2)*(b2)+(a3)*(b3));
}
function v_ang(ux,uy,uz,vx,vy,vz){
  let d = v_dot(ux,uy,uz,vx,vy,vz);
  let mu = v_mag(ux,uy,uz);
  let mv = v_mag(vx,vy,vz);
  return Math.acos(d/(mu*mv));
}

function set_eye(x,y,z){
  // if (v_ang(x,y,z,0,1,0) < 0.1 || v_ang(x,y,z,0,-1,0) < 0.1){
  //   return;
  // }
  eye[0] = x;
  eye[1] = y;
  eye[2] = z;
}

elt.addEventListener("mousemove",function(event){

  let box = elt.getBoundingClientRect();
  mouseX = event.clientX-box.left;
  mouseY = event.clientY-box.top;
  if (mouseIsDown){
    let dx = mouseX-pmouseX;
    let dy = mouseY-pmouseY;
    {
      let x0 = eye[2];
      let y0 = eye[1];
      let th = dy*0.01*(eye[2]>0?1:-1);
      let x = x0*Math.cos(th)-y0*Math.sin(th);
      let y = x0*Math.sin(th)+y0*Math.cos(th);
      set_eye(eye[0],y,x);

    }{
      let x0 = eye[0];
      let y0 = eye[2];
      let th = dx*0.01;
      let x = x0*Math.cos(th)-y0*Math.sin(th);
      let y = x0*Math.sin(th)+y0*Math.cos(th);
      set_eye(x,eye[1],y);

    }

  }
  pmouseX = mouseX;
  pmouseY = mouseY;
})

elt.addEventListener("mouseup",function(){
  mouseIsDown = false;
})

elt.addEventListener("wheel",function(event){
  zoom = zoom+event.deltaY*0.01;
  zoom = Math.min(Math.max(zoom,0.5),10);
  event.preventDefault();
})
