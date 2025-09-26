/*global describe dat FindContours triangulateMTX earcut THREE*/
let {cos,sin,PI} = Math;

function seg_isect(p0x, p0y, p1x, p1y, q0x, q0y, q1x, q1y, is_ray = false) {
  let d0x = p1x - p0x;
  let d0y = p1y - p0y;
  let d1x = q1x - q0x;
  let d1y = q1y - q0y;
  let vc = d0x * d1y - d0y * d1x;
  if (vc == 0) {
    return null;
  }
  let vcn = vc * vc;
  let q0x_p0x = q0x - p0x;
  let q0y_p0y = q0y - p0y;
  let vc_vcn = vc / vcn;
  let t = (q0x_p0x * d1y - q0y_p0y * d1x) * vc_vcn;
  let s = (q0x_p0x * d0y - q0y_p0y * d0x) * vc_vcn;
  if (0 <= t && (is_ray || t < 1) && 0 <= s && s < 1) {
    return t;
  }
  return null;
}


function rot_pt_2d(x,y,th){
  return [
    x*cos(th)-y*sin(th),
    x*sin(th)+y*cos(th),
  ]
}
function rot_path_2d(p,th){
  return p.map(x=>rot_pt_2d(...x,th))
}

function involute(r){
  let n = 100;
  let p = [];
  for (let i = 0; i < n; i++){
    let t = i/n;
    let a = t*PI/2;
    let x = r*cos(a)+a*r*sin(a);
    let y = r*sin(a)-a*r*cos(a);
    p.push([x,y])
  }
  return p;
}

function circle(r){
  let n = 200;
  let p = [];
  for (let i = 0; i < n; i++){
    let t = i/(n-1);
    let a = t * PI*2;
    let x = r*cos(a);
    let y = r*sin(a);
    p.push([x,y]);
  }
  return p;
}

function semicircle(r,a0){
  let n = 100;
  let p = [];
  for (let i = 0; i < n; i++){
    let t = i/(n-1);
    let a = a0+t * PI;
    let x = r*cos(a);
    let y = r*sin(a);
    p.push([x,y]);
  }
  return p;
}
function isect_paths(p,q){
  for (let i = 0; i < p.length-1; i++){
    for (let j = 0; j < q.length-1; j++){
      let a = p[i];
      let b = p[i+1];
      let c = q[j];
      let d = q[j+1];
      let t = seg_isect(...a,...b,...c,...d);
      if (t!=null){
        return [
          a[0]*(1-t)+b[0]*t,
          a[1]*(1-t)+b[1]*t,
        ]
      }
    }
  }
}
function trim_path(p,q){
  for (let i = 0; i < p.length-1; i++){
    for (let j = 0; j < q.length-1; j++){
      let a = p[i];
      let b = p[i+1];
      let c = q[j];
      let d = q[j+1];
      let t = seg_isect(...a,...b,...c,...d);
      if (t!=null){
        return p.slice(0,i+1).concat([[
          a[0]*(1-t)+b[0]*t,
          a[1]*(1-t)+b[1]*t,
        ]]);
      }
    }
  }
  return p;
}



let cnv = document.createElement("canvas");
cnv.width=1024;
cnv.height=512;
let ctx = cnv.getContext('2d');
document.body.appendChild(cnv);

function draw(x){
  if (x.length == 2 && typeof x[0] == 'number'){
    ctx.fillRect(x[0]-2,x[1]-2,4,4);
  }else{
    ctx.beginPath();
    for (let i = 0; i < x.length; i++){
      ctx[i?'lineTo':'moveTo'](...x[i]);
    }
    ctx.stroke();
  }
}

function gear(r,n){
  let pa = 0.11*PI;
  let mod = r*2/n;
  let add = mod;
  let ded = mod*1.157;
  
  
  let r0 = cos(pa) * r;
  let r1 = r + add;
  let r2 = r - ded;
  
  
  let bas = circle(r0);
  let inv = involute(r0);
  let ref = circle(r);
  
  let inn = circle(r2);
  let out = circle(r1);
  
  
  let ang = PI/n;
  
  let p = isect_paths(inv,ref);
  
  let a0 = Math.atan2(p[1],p[0]);
  a0*=2
  let a1 = ang+a0;
  
  let in1 = inv.map(x=>[x[0],-x[1]]);

  in1 = rot_path_2d(in1,a1);
  
  let in0 = trim_path(inv,out);
  
  
  // draw(bas)
  // draw(inv);
  // draw(in1);
//   draw(in1);
  // draw(ref);
  // draw(out);
//   draw(p)
  
  
  let tip = trim_path(rot_path_2d(out,PI/2).reverse(),inv);
  tip = trim_path(tip.reverse(),in1);
  // draw(tip);
  // console.log(tip)
  
  in1 = trim_path(in1,out);
  
  let ac = ang-a0;
  let rc = Math.tan(ac/2)*r0
  // console.log(rc);
  // console.log(r0-r2)
  let cc = semicircle(rc,PI/2)
  cc = cc.map(x=>[x[0]+r2,x[1]]);
  
  cc = rot_path_2d(cc,ang*1.5+a0/2);
  // draw(cc);
  
  // console.log(p,ang,a0,a1)
  
  // let ao = blr?(ang/2):0;
  
  // console.log(ang/2+a0/2)
  // console.log(ang/2-a0/2)
  
  // draw([[0,0],rot_pt_2d(r2,0,ang/2+a0/2)])
  
  inn = rot_path_2d(inn,PI/2)//.reverse();
  
  in0 = trim_path(in0.reverse(),inn).reverse();
  in1 = trim_path(in1.reverse(),inn);
  
  let pl = [];
  
  for (let i = 0; i < n; i++){
    let ia = rot_path_2d(in0,ang*2*i);
    let ib = rot_path_2d(in1,ang*2*i);
    let ic = rot_path_2d(cc, ang*2*i);
    let it = rot_path_2d(tip,ang*2*i);
    // draw(ia);
    // draw(it);
    // draw(ib);
    // draw(ic);
    
    pl.push(...ia,...it,...ib,...ic.reverse());
  }
  let pitch = PI*r1*2/n;
  // console.log(pitch);
  // return pitch;
  
  return rot_path_2d(pl,ang/2-a0/2-PI/n);
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, 2, 0.1, 2000 );
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 400;
camera.lookAt(0,0,0);
const renderer = new THREE.WebGLRenderer({});
renderer.setSize( 512,256 );
document.body.appendChild( renderer.domElement );
const material = new THREE.MeshNormalMaterial();

const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.update();



var n = 10;
var r = 100;

var ratio=2;

const gui = new dat.GUI();
gui.add(window, 'n',5,100).onChange(make_gears);
gui.add(window, 'ratio',0.5,4).onChange(make_gears);


let g0;
let g1;
let a0;
let a1;

let trigs0;
let trigs1;

let mesh0;
let mesh1;

function make_gears(){
  n = ~~n;
  let n0 = Math.round(n*ratio);
  ratio = n0/n;
  g0 = gear(r*ratio,n0);
  g1 = gear(r,n);
  
  console.log(g0.length,g1.length);
  g0 = FindContours.approxPolyDP(g0,0.05);
  g1 = FindContours.approxPolyDP(g1,0.05);
  console.log(g0.length,g1.length);
  
  // trigs0 = triangulateMTX.triangulate(g0);
  // trigs1 = triangulateMTX.triangulate(g1);

  trigs0 = earcut(g0.flat());
  trigs1 = earcut(g1.flat());
  a0 = 0;
  a1 = PI+(PI)/n;
  if (mesh0){
    scene.remove(mesh0); 
  }
  if (mesh1){
    scene.remove(mesh1); 
  }
  
  mesh0 = make_mesh(g0,trigs0)
  mesh1 = make_mesh(g1,trigs1)
}
make_gears();

function draw_trigs(vs,trigs){
  ctx.beginPath();
  for (let i = 0; i < trigs.length; i+=3){
    let a = trigs[i];
    let b = trigs[i+1];
    let c = trigs[i+2];
    ctx.moveTo(...vs[a]);
    ctx.lineTo(...vs[b]);
    ctx.lineTo(...vs[c]);
  }
  ctx.stroke();
}







function make_mesh(vs,trigs){
  let faces = [];
  let d = 30;
  for (let i = 0; i < trigs.length; i+=3){
    let a = trigs[i];
    let b = trigs[i+1];
    let c = trigs[i+2];
    faces.push(...vs[a],d,...vs[b],d,...vs[c],d);
  }
  for (let i = 0; i < trigs.length; i+=3){
    let a = trigs[i];
    let b = trigs[i+1];
    let c = trigs[i+2];
    faces.push(...vs[c],-d,...vs[b],-d,...vs[a],-d);
  }
  for (let i = 0; i < vs.length; i++){
    let j = (i+1)%vs.length;
    let a = [...vs[i],d]
    let b = [...vs[j],d]
    let c = [...vs[i],-d]
    let e = [...vs[j],-d]
    faces.push(...a,...e,...b,...a,...c,...e);
  }
  // console.log(faces);
  
  let vertices = new Float32Array(faces);
  // console.log(faces);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  geometry.setAttribute( 'normal',   new THREE.BufferAttribute( new Float32Array(vertices.length).fill(0), 3 ) );
  // geometry.computeFaceNormals();
  geometry.computeVertexNormals();
  geometry.attributes.normal.needsUpdate = true;
  // 
  let mesh = new THREE.Mesh( geometry, material );
  mesh.matrixAutoUpdate  = true;
  // mesh.frustumCulled = false;
  // mesh.geometry.computeFaceNormals();
  // console.log(mesh);
  
  scene.add(mesh);
  return mesh
}


let t = 0;
function loop(){
  requestAnimationFrame(loop);
  ctx.fillStyle="white";
  ctx.fillRect(0,0,1024,512);
  
  ctx.save();
  ctx.translate(256,256);
  ctx.rotate(a0-t);
  // ctx.lineWidth=2;
  draw(g0);
  // ctx.lineWidth=1;
  // draw_trigs(g0,trigs0)
  ctx.restore();


  ctx.save();
  ctx.translate(256+r+r*ratio,256);
  ctx.rotate(a1+t*ratio);
  // ctx.lineWidth=2;
  draw(g1);
  // ctx.lineWidth=1;
  // draw_trigs(g1,trigs1);
  ctx.restore();

  
  mesh0.position.x = -r*ratio;
  mesh1.position.x = r;
  
  mesh0.rotation.z = a0-t;
  mesh1.rotation.z = a1+t*ratio;
  
  
  controls.update();
  renderer.render( scene, camera );
  
  t+=0.01;
}
loop();




