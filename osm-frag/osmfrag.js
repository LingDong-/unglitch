let cos = Math.cos;
let sin = Math.sin;
let pow = Math.pow;
let PI = Math.PI;

// let jsr = 0x5EED;

let jsr = new Date().getTime();
// jsr = 1739364299326;

console.log('seed',jsr);

// let jsr = 0x5EE;

function rand(){
  jsr^=(jsr<<17);
  jsr^=(jsr>>13);
  jsr^=(jsr<<5);
  return (jsr>>>0)/4294967295;
}

var PERLIN_YWRAPB = 4; var PERLIN_YWRAP = 1<<PERLIN_YWRAPB;
var PERLIN_ZWRAPB = 8; var PERLIN_ZWRAP = 1<<PERLIN_ZWRAPB;
var PERLIN_SIZE = 4095;
var perlin_octaves = 4;var perlin_amp_falloff = 0.5;
var scaled_cosine = function(i) {return 0.5*(1.0-Math.cos(i*PI));};
var perlin;
let noise = function(x,y,z) {
  y = y || 0; z = z || 0;
  if (perlin == null) {
    perlin = new Array(PERLIN_SIZE + 1);
    for (var i = 0; i < PERLIN_SIZE + 1; i++) {
      perlin[i] = rand();
    }
  }
  if (x<0) { x=-x; } if (y<0) { y=-y; } if (z<0) { z=-z; }
  var xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z);
  var xf = x - xi; var yf = y - yi; var zf = z - zi;
  var rxf, ryf;
  var r=0; var ampl=0.5;
  var n1,n2,n3;
  for (var o=0; o<perlin_octaves; o++) {
    var of=xi+(yi<<PERLIN_YWRAPB)+(zi<<PERLIN_ZWRAPB);
    rxf = scaled_cosine(xf); ryf = scaled_cosine(yf);
    n1  = perlin[of&PERLIN_SIZE];
    n1 += rxf*(perlin[(of+1)&PERLIN_SIZE]-n1);
    n2  = perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
    n2 += rxf*(perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n2);
    n1 += ryf*(n2-n1);
    of += PERLIN_ZWRAP;
    n2  = perlin[of&PERLIN_SIZE];
    n2 += rxf*(perlin[(of+1)&PERLIN_SIZE]-n2);
    n3  = perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
    n3 += rxf*(perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n3);
    n2 += ryf*(n3-n2);
    n1 += scaled_cosine(zf)*(n2-n1);
    r += n1*ampl;
    ampl *= perlin_amp_falloff;
    xi<<=1; xf*=2; yi<<=1; yf*=2; zi<<=1; zf*=2;
    if (xf>=1.0) { xi++; xf--; }
    if (yf>=1.0) { yi++; yf--; }
    if (zf>=1.0) { zi++; zf--; }
  }
  return r;
};



function dist2(x0,y0,z0,x1,y1,z1){
  let dx = x0-x1;
  let dy = y0-y1;
  let dz = z0-z1;
  return dx*dx+dy*dy+dz*dz;
}

function dist(x0,y0,z0,x1,y1,z1){
  return Math.sqrt(dist2(x0,y0,z0,x1,y1,z1));
}
function lerp(a,b,t){
  return a*(1-t)+b*t;
}
function lerp3d(a,b,t){
  return [
    a[0]*(1-t)+b[0]*t,
    a[1]*(1-t)+b[1]*t,
    a[2]*(1-t)+b[2]*t,
  ]
}

function v_add(x0,y0,z0,x1,y1,z1){
  return [x0+x1,y0+y1,z0+z1]
}
function v_sub(x0,y0,z0,x1,y1,z1){
  return [x0-x1,y0-y1,z0-z1]
}

function v_scale(x0,y0,z0,s){
  return [x0*s,y0*s,z0*s];
}

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
function m_ident(){
  return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}
function m_rotx(a){
  return [1,0,0,0, 0,cos(a),-sin(a),0, 0,sin(a),cos(a),0, 0,0,0,1];
}
function m_roty(a){
  return [cos(a),0,sin(a),0, 0,1,0,0, -sin(a),0,cos(a),0, 0,0,0,1];
}
function m_rotz(a){
  return [cos(a),-sin(a),0,0, sin(a),cos(a),0,0, 0,0,1,0, 0,0,0,1];
}
function m_trsl(x,y,z){
  return [1,0,0,x, 0,1,0,y, 0,0,1,z, 0,0,0,1];
}
function m_scal(x,y,z){
  return [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1];
}
function m_mult(A,B){
  return [(A)[0]*(B)[0]+(A)[1]*(B)[4]+(A)[2]*(B)[8]+(A)[3]*(B)[12],(A)[0]*(B)[1]+(A)[1]*(B)[5]+(A)[2]*(B)[9]+(A)[3]*(B)[13],(A)[0]*(B)[2]+(A)[1]*(B)[6]+(A)[2]*(B)[10]+(A)[3]*(B)[14],(A)[0]*(B)[3]+(A)[1]*(B)[7]+(A)[2]*(B)[11]+(A)[3]*(B)[15],(A)[4]*(B)[0]+(A)[5]*(B)[4]+(A)[6]*(B)[8]+(A)[7]*(B)[12],(A)[4]*(B)[1]+(A)[5]*(B)[5]+(A)[6]*(B)[9]+(A)[7]*(B)[13],(A)[4]*(B)[2]+(A)[5]*(B)[6]+(A)[6]*(B)[10]+(A)[7]*(B)[14],(A)[4]*(B)[3]+(A)[5]*(B)[7]+(A)[6]*(B)[11]+(A)[7]*(B)[15],(A)[8]*(B)[0]+(A)[9]*(B)[4]+(A)[10]*(B)[8]+(A)[11]*(B)[12],(A)[8]*(B)[1]+(A)[9]*(B)[5]+(A)[10]*(B)[9]+(A)[11]*(B)[13],(A)[8]*(B)[2]+(A)[9]*(B)[6]+(A)[10]*(B)[10]+(A)[11]*(B)[14],(A)[8]*(B)[3]+(A)[9]*(B)[7]+(A)[10]*(B)[11]+(A)[11]*(B)[15],(A)[12]*(B)[0]+(A)[13]*(B)[4]+(A)[14]*(B)[8]+(A)[15]*(B)[12],(A)[12]*(B)[1]+(A)[13]*(B)[5]+(A)[14]*(B)[9]+(A)[15]*(B)[13],(A)[12]*(B)[2]+(A)[13]*(B)[6]+(A)[14]*(B)[10]+(A)[15]*(B)[14],(A)[12]*(B)[3]+(A)[13]*(B)[7]+(A)[14]*(B)[11]+(A)[15]*(B)[15]];
}
function m_tfrm(A,v){
  return [((A)[0]*(v)[0]+(A)[1]*(v)[1]+(A)[2]*(v)[2]+(A)[3])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15]),((A)[4]*(v)[0]+(A)[5]*(v)[1]+(A)[6]*(v)[2]+(A)[7])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15]),((A)[8]*(v)[0]+(A)[9]*(v)[1]+(A)[10]*(v)[2]+(A)[11])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15])];
}
function m_rot_axis(ux,uy,uz,th){
  let costh = cos(th);
  let sinth = sin(th);
  return [
    costh+ux*ux*costh, ux*uy*(1-costh)-uz*sinth, ux*uz*(1-costh)+uy*sinth, 0,
    uy*ux*(1-costh)+uz*sinth, costh+uy*uy*(1-costh), uy*uz*(1-costh)-ux*sinth, 0,
    uz*ux*(1-costh)-uy*sinth, uz*uy*(1-costh)+ux*sinth, costh+uz*uz*(1-costh), 0,
    0,0,0,1
  ];
}
function m_proj(f,v) {
  return [(f)*(v)[0]/(v)[2],(f)*(v)[1]/(v)[2]];
}

function rot_euler(x,y,z,rx,ry,rz){
  let M = m_mult(m_rotz(rz),m_mult(m_roty(ry),m_rotx(rx)));
  return m_tfrm(M,[x,y,z]);
}

function trfm_faces(A,ff){
  for (let i = 0; i < ff.length; i++){
    for (let j = 0; j < 3; j++){
      ff[i][j] = m_tfrm(A,ff[i][j]);
    }
  }
  return ff;
}
	
function bean(x){
  return pow(0.25-pow(x-0.5,2),0.5)*(2.6+2.4*pow(x,1.5))*0.54
}

function sigmoid (x,a){ 
  a = 1-a;
  let y = 0;
  if (x<=0.5){
    y = (Math.pow(2.0*x, 1.0/a))/2.0;
  } else {
    y = 1.0 - (Math.pow(2.0*(1.0-x), 1.0/a))/2.0;
  }
  return y;
}

function ogee(x,a){
  let y = 0;
  if (x<=0.5){
    y = (pow(2.0*x, 1.0-a))/2.0;
  } 
  else {
    y = 1.0 - (pow(2.0*(1.0-x), 1.0-a))/2.0;
  }
  return y;
}

function saddle(x,a){
  let t;
  if (x < a){
    t = x/a;
    // return sin(x/a * PI/2);  
    return Math.sqrt(1-(t-1)*(t-1));
  }else if (x > 1-a){
    // return sin(  (1-(x-(1-a))/a)   * PI/2)
    t = (x-(1-a))/a;
    return Math.sqrt(1-t*t);
  }else{
    // return cos( (x-a)/(1-a*2) * PI*2 )/2+0.5;
    return cos( (x-a)/(1-a*2) * PI*2 )*0.4+0.6;
    // return 1;
  }
}

function petal(){
  let l = [];
  let r = [];
  let s = [];
  let n = 24;
  let m = 8;
  let w0 = rand()*10+20;
  let w1 = w0+rand()*2;
  let w2 = w0+rand()*2;
  let crl = 20+rand()*20;
  let crc = 2+rand()*4;
  for (let i = 0; i < n; i++){
    let t = i/(n-1);
    // let x = sigmoid(t,0.4);
    let x = Math.sqrt(t);
    // l.push([x*100,29*bean(x)+1,0]);
    l.push([x*100,w1*bean(x*x)+0.01,0]);
    // l.push([t*100,30*saddle(t,0.2),0]);
    s.push([x*100,0,0]);
    // s.push([ogee(t,0.3)*100,0,0])
  }
  
  for (let i = 0; i < l.length; i++){
    r.push([l[i][0],-l[i][1]*(w2/w1),0]);
  }
  let mesh = [];
  let mesi = [];
  
  for (let i = 0; i < n; i++){
    let v = i/(n-1);
    // let c = bean(v);
    let c = sin(v*PI);
    for (let j = 0; j < m; j++){
      let t = j/(m-1);
      let x,y,z=0,z0=0,z1=0,u;
      if (t < 0.5){
        u = 1-(t*2);
        x = l[i][0]*(u)+s[i][0]*(1-u);
        y = l[i][1]*(u)+s[i][1]*(1-u);
        
      }else{
        u = (t-0.5)*2;
        x = s[i][0]*(1-u)+r[i][0]*u;
        y = s[i][1]*(1-u)+r[i][1]*u;
      }
      z += Math.max(u,1-c)*10;
      z += (1-Math.pow(v,crc))*crl-crl;
      z0 = z;
      z1 = z;
      let sd = saddle(t,0.2);
      sd *= Math.sqrt(1-(v*2-1)*(v*2-1))*0.5+0.5;
      z0 -= sd*10;
      z1 += sd*10;
      mesh.push([x,y,z0]);
      mesi.push([x,y,z1]);
    }
  }
  
  // let col = [0.9,0.85,0.7,1,1,1];
  
  let col = [0.7,0.55,0.2, 1.0,1.0,0.6];
  
  let trigs = [];
  for (let i = 0; i < n-1; i++){
    for (let j = 0; j < m-1; j++){
      let a = mesh[i*m+j];
      let b = mesh[i*m+j+1];
      let c = mesh[(i+1)*m+j];
      let d = mesh[(i+1)*m+j+1];
      trigs.push([a,c,b,col],[b,c,d,col]);
    }
  }
  for (let i = 0; i < n-1; i++){
    for (let j = 0; j < m-1; j++){
      let a = mesi[i*m+j];
      let b = mesi[i*m+j+1];
      let c = mesi[(i+1)*m+j];
      let d = mesi[(i+1)*m+j+1];
      trigs.push([a,b,c,col],[b,d,c,col]);
    }
  }
  return trigs;
}




function stamen(){
  let l = [];
  let r = [];
  let s = [];
  let n = 10;
  let m = 5;
  let w0 = rand()*5+7;
  let w1 = w0+rand()*2;
  let w2 = w0+rand()*2;
  let crl = 3+rand()*3;
  let crc = 2+rand()*4;
  for (let i = 0; i < n; i++){
    let t = i/(n-1);
    let x = sigmoid(t,0.4);
    // l.push([x*100,29*bean(x)+1,0]);
    l.push([t*30,w1*bean(1-t)+0.01,0]);
    // l.push([t*100,30*saddle(t,0.2),0]);
    s.push([t*30,0,0]);
    // s.push([ogee(t,0.3)*100,0,0])
  }
  
  for (let i = 0; i < l.length; i++){
    r.push([l[i][0],-l[i][1]*(w2/w1),0]);
  }
  let mesh = [];
  let mesi = [];
  
  for (let i = 0; i < n; i++){
    let v = i/(n-1);
    // let c = bean(v);
    let c = sin(v*PI);
    for (let j = 0; j < m; j++){
      let t = j/(m-1);
      let x,y,z=0,z0=0,z1=0,u;
      if (t < 0.5){
        u = 1-(t*2);
        x = l[i][0]*(u)+s[i][0]*(1-u);
        y = l[i][1]*(u)+s[i][1]*(1-u);
        
      }else{
        u = (t-0.5)*2;
        x = s[i][0]*(1-u)+r[i][0]*u;
        y = s[i][1]*(1-u)+r[i][1]*u;
      }
      z += Math.max(u,1-c)*2;
      z += (1-Math.pow(v,crc))*crl-crl;
      z0 = z;
      z1 = z;
      let sd = saddle(t,0.2);
      sd *= Math.sqrt(1-(v*2-1)*(v*2-1));
      z0 -= sd*4;
      z1 += sd*4;
      mesh.push([x,y,z0]);
      mesi.push([x,y,z1]);
    }
  }
  
  
  
  let trigs = [];
  for (let i = 0; i < n-1; i++){
    for (let j = 0; j < m-1; j++){
      let a = mesh[i*m+j];
      let b = mesh[i*m+j+1];
      let c = mesh[(i+1)*m+j];
      let d = mesh[(i+1)*m+j+1];
      let t = j/(m-1);
      let c0 = lerp3d([0.85,0.85,0.7  ],   [0.5,0.15,0.0], Math.abs(t-0.5)*2 );
      let c1 = lerp3d([0.9,0.9,0.5],       [0.7,0.6,0.2], Math.abs(t-0.5)*2 );

      let col = [...c0,...c1];
      trigs.push([a,c,b,col],[b,c,d,col]);
    }
  }
  let k = 0;
  for (let i = 0; i < n-1; i++){
    for (let j = 0; j < m-1; j++){
      let a = mesi[i*m+j];
      let b = mesi[i*m+j+1];
      let c = mesi[(i+1)*m+j];
      let d = mesi[(i+1)*m+j+1];

      trigs.push([a,b,c,trigs[k][3]],[b,d,c,trigs[k+1][3]]);
      k+=2;
    }
  }
  return trigs;
}

function flower(){
  // let o = -PI/4+rand()*0.4-0.2;
  let op = (rand()-0.5)*2;
  let o = -PI/2*(0.7 + op*0.3);
  let r = rand()*PI*2;
  let p0 = trfm_faces(m_mult(m_rotz(o+0    +rand()*0.3-0.15),m_roty(o+rand()*0.2-0.1)),petal());
  let p1 = trfm_faces(m_mult(m_rotz(o+PI/2 +rand()*0.3-0.15),m_roty(o+rand()*0.2-0.1)),petal());
  let p2 = trfm_faces(m_mult(m_rotz(o+PI   +rand()*0.3-0.15),m_roty(o+rand()*0.2-0.1)),petal());
  let p3 = trfm_faces(m_mult(m_rotz(o+-PI/2+rand()*0.3-0.15),m_roty(o+rand()*0.2-0.1)),petal());
  
  let s0 = trfm_faces(m_mult(m_rotz(r),   m_mult(m_trsl(0,0,25),m_mult(m_roty(-PI/3+o*0.1),m_trsl(10,0,0)))),stamen());
  let s1 = trfm_faces(m_mult(m_rotz(r+PI),m_mult(m_trsl(0,0,25),m_mult(m_roty(-PI/3+o*0.1),m_trsl(10,0,0)))),stamen());

  
  let ret = p0.concat(p1).concat(p2).concat(p3).concat(s0).concat(s1);
  
  let sh = rand()*0.2+0.9;
  for (let i = 0; i < ret.length; i++){
    ret[i][3] = ret[i][3].map(x=>Math.min(1,x*sh))
  }  
  
  return ret;
  
}

function stem(){
  let vine = [[0,0,0]];
  let sd = rand();
  let x = 0;
  let y = 0;
  
  let dev = (rand()-0.5)*2;
  
  let a = dev*0.6;
  let xt = 0;
  let yt = 0;
  let len = ~~(10+(1-Math.abs(dev))*40);
  
  for (let i = 0; i < len; i++){

    a += (noise(sd,i*0.05)*0.2-0.1+0.04*dev)*(i/len*2);
    
    x += cos(a)*10;
    y += sin(a)*10;
    vine.push([x,y,0]);
    if (i == len-6){
      xt = x;
      yt = y;
    }
  }
  
  let wr=10;
  
  let nr = 5;
  let rings = [];
  for (let i = 0; i < vine.length; i++){
    let t = (i/(vine.length-1));
    let ww = wr*(1-t*0.6);//wr* (Math.pow(Math.sin(t*PI),1)*0.3+0.7);
    // let ww = wr;
    let ring = [];
    let a = vine[i];

    let d;
    if (i < vine.length-1){
      let b = vine[i+1];
      d = [
        b[0]-a[0],
        b[1]-a[1],
        b[2]-a[2],
      ];
    }else{
      let b = vine[i-1];
      d = [
        a[0]-b[0],
        a[1]-b[1],
        a[2]-b[2],
      ]
    }
    // let n = v_norm(...a);
    let n = [0,0,1];
    // d = v_scale(...v_norm(...d),0.1);
    d = v_norm(...d);
    let rat = 1.0;
    for (let k = 0; k < 2; k++){
      for (let j = 0; j < nr; j++){
        let x = -((j/nr)*2-1)/rat;
        let y = Math.sqrt((1-rat*rat*x*x));
        let th = Math.atan2(y,x)+PI*k;
        let M = m_rot_axis(...d,th);
        let v = m_tfrm(M,n);
        let w = ww * Math.sqrt(x*x+y*y);
        v = v_scale(...v,w);
        ring.push(v_add(...a,...v));
      }
    }
    
    rings.push(ring);
  }
  let ff = [];
  let pr = 5;
  {
    let a = vine[0];
    let b = vine[1];
    let d = v_scale(...v_norm(...v_sub(...a,...b)),pr);
    let c = v_add(...a,...d);
    let r0 = rings[0];
    for (let j = 0; j < r0.length; j++){
      let k = (j+1)%r0.length;
      ff.push([c,r0[k],r0[j]]);
    }
  }

  for (let i = 0; i < rings.length-1; i++){
    let r0 = rings[i];
    let r1 = rings[i+1];
    for (let j = 0; j < r0.length; j++){
      let k = (j+1)%r0.length;
      ff.push([r0[j],r0[k],r1[k]]);
      ff.push([r0[j],r1[k],r1[j]]);
    }
  }

  {
    let a = vine[vine.length-1];
    let b = vine[vine.length-2];
    let d = v_scale(...v_norm(...v_sub(...a,...b)),pr);
    let c = v_add(...a,...d);
    let r0 = rings[rings.length-1];
    for (let j = 0; j < r0.length; j++){
      let k = (j+1)%r0.length;
      ff.push([c,r0[j],r0[k]]);
    }
  }
  
  for (let i = 0; i < ff.length; i++){
    ff[i][3] = [0.4,0.5,0, 0.8,0.9,0.6];
  }
  
  // let ts = flower();
  let s = rand()*0.4+0.8;
  let ts = trfm_faces(m_mult(m_trsl(xt,yt,0),   m_mult(m_rotz(a),m_mult(m_roty(PI/2),m_scal(s,s,s)))),flower());
  
  

  return ff.concat(ts);
}

function cluster(){
  let ff = [];
  let n = ~~(12+rand()*24);
  for (let i = 0; i < n; i++){
    
    ff = ff.concat(trfm_faces(m_rotx(rand()*PI*2),stem()));
  }
  return ff;
}


function leaf(){
  let l = [];
  let r = [];
  let s = [];
  let n = 60;
  let m = 30;
  let fol = rand()*120+20;
  let w0 = rand()*60+120+fol*0.1;
  let w1 = w0+rand()*2;
  let w2 = w0+rand()*2;
  let crl = 50+rand()*200;
  let crc = 2+rand()*2;
  let len = rand()*200+500;
  let sd = rand();
  
  for (let i = 0; i < n; i++){
    let t = i/(n-1);
    // let x = sigmoid(t,0.4);
    // let x = Math.sqrt(t);
    // l.push([x*100,29*bean(x)+1,0]);
    let tt = Math.pow(t,1.2);
    let tx = Math.pow(t,1.0);
    
    let ip = t*40*0.3
    l.push([tx*len,w1*sin(tt*PI)*(noise(sd,ip)*0.3+0.7)+0.01,0]);
    r.push([tx*len,-w1*sin(tt*PI)*(noise(sd+2,ip)*0.3+0.7)+0.01,0]);
    // l.push([t*100,30*saddle(t,0.2),0]);
    s.push([t*len,0,0]);
    // s.push([ogee(t,0.3)*100,0,0])
  }
  
  // for (let i = 0; i < l.length; i++){
  //   r.push([l[i][0],-l[i][1]*(w2/w1),0]);
  // }
  let mesh = [];
  let mesi = [];
  
  for (let i = 0; i < n; i++){
    let v = i/(n-1);
    // let c = bean(v);
    let c = sin(v*PI);
    for (let j = 0; j < m; j++){
      let t = j/(m-1);
      let x,y,z=0,z0=0,z1=0,u;
      if (t < 0.5){
        u = 1-(t*2);
        x = l[i][0]*(u)+s[i][0]*(1-u);
        y = l[i][1]*(u)+s[i][1]*(1-u);
        
      }else{
        u = (t-0.5)*2;
        x = s[i][0]*(1-u)+r[i][0]*u;
        y = s[i][1]*(1-u)+r[i][1]*u;
      }
      // z += Math.max(u,1-c)*fol;
      
      z += u*c*fol;
      z += (1-Math.pow(v,crc))*crl-crl;
      z0 = z;
      z1 = z;
      let sd = sin(t*PI)*sin(v*PI)*2;
      sd *= Math.sqrt(1-(v*2-1)*(v*2-1));
      z0 -= sd*8;
      z1 += sd*8;
      mesh.push([x,y,z0]);
      mesi.push([x,y,z1]);
    }
  }
  
  // let col = [0.0,0.3,0.0,0.5,0.6,0.4];
  let col = [0.3,0.4,0.3,0.6,0.7,0.5];
  
  let trigs = [];
  for (let i = 0; i < n-1; i++){
    for (let j = 0; j < m-1; j++){
      let a = mesh[i*m+j];
      let b = mesh[i*m+j+1];
      let c = mesh[(i+1)*m+j];
      let d = mesh[(i+1)*m+j+1];
      
      let t = i/(n-1);
      let s = j/(m-1);
      
      let dc = -noise(t*6,s*6,sd)*0.2 + saddle(s,0.3)*0.05;
      let col = [0.3+dc,0.4+dc,0.3+dc,0.6+dc,0.7+dc,0.5+dc];
      trigs.push([a,c,b,col],[b,c,d,col]);
    }
  }
  for (let i = 0; i < n-1; i++){
    for (let j = 0; j < m-1; j++){
      let a = mesi[i*m+j];
      let b = mesi[i*m+j+1];
      let c = mesi[(i+1)*m+j];
      let d = mesi[(i+1)*m+j+1];
      
      let t = i/(n-1);
      let s = j/(m-1);
      
      let dc = -noise(t*6,s*6,sd)*0.2 + saddle(s,0.3)*0.05;
      let col = [0.3+dc,0.4+dc,0.3+dc,0.6+dc,0.7+dc,0.5+dc];
      trigs.push([a,b,c,col],[b,d,c,col]);
    }
  }
  return trigs;
}

function branch(basewid=60){

  let vine = [[0,0,0]];
  let sd = rand();
  let x = 0;
  let y = 0;
  
  let a = 0;
  let xt = 0;
  let yt = 0;
  let len = ~~(basewid*2);
  let jj = [0];
  let jji = 0;
  
  let sub = [];
  let did = 0;
  
  for (let i = 0; i < len; i++){
    a += (noise(sd,i*0.08)*0.03-0.015);
    x += cos(a)*24;
    y += sin(a)*24;
    vine.push([x,y,0]);
    
    if (jji == 0){
      if (rand()<0.2){
        jji += 1;
      }
    }else if (jji < 0){
      jji += 1;
    }else{
      jji += 1;
      if (jji > 5){
        jji = -5;
      }
    }
    jj.push(Math.max(jji,0));
 
    if (jj[i] == 2 || i == len-2){
      if (i < len-10 && i > 10 && basewid > 15 && rand() < 0.8){
        let t = (i/(len-1));
        let cw = basewid*(1-t*0.7);
        let bb = branch(cw*(rand()*0.2+0.6) );
        let ra = (PI/2)*0.3*((rand()<0.5)?1:-1) + rand()-0.5;
        let bt = trfm_faces(m_mult(m_trsl(x,y,0),   m_mult(m_rotz(a),m_mult(m_rotx(rand()*PI*2),m_roty(ra)))),bb);
        sub = sub.concat(bt);
      }else if (rand() < 0.4 && basewid < 59){
        did = 1;
        let bb = cluster();
        let ra = (PI/2)*0.4*((rand()<0.5)?1:-1) + rand()-0.5;
        let bt = trfm_faces(m_scal(0.7,0.7,0.7),bb);
        bt = trfm_faces(m_mult(m_trsl(x,y,0),   m_mult(m_rotz(a),m_mult(m_rotx(rand()*PI*2),m_roty(ra)))),bb);
        sub = sub.concat(bt);

      }else if (rand() < 0.8 && (i < len-4) && basewid < 59){
        let n = ~~(2+rand()*2);
        for (let j = 0; j < n; j++){
          let bb = leaf();
          // let ra = (PI/2)*0.5*((rand()<0.5)?1:-1) + rand()*0.2-0.1;
          let ra = (PI/2)*0.5+ rand()*0.4-0.2;
          let rb = rand()*PI*2/3 + (PI*2/3*j)
          let bt = trfm_faces(m_mult(m_trsl(x,y,0), m_mult(m_rotz(a),m_mult(m_rotx(rb),m_roty(ra)))),bb);
          sub = sub.concat(bt);
        }
      }
    }
  }
  
  let wr=basewid;
  

  let nr = 8;
  let rings = [];
  for (let i = 0; i < vine.length; i++){
    let t = (i/(vine.length-1));
    // let ww = wr*(1-t*0.6);//wr* (Math.pow(Math.sin(t*PI),1)*0.3+0.7);
    // let ww = wr;
    // let ww = (!(i%10))?(wr*2):wr;
    let ww = wr*(1-t*0.7) + (1*jj[i])
    

    let ring = [];
    let a = vine[i];

    let d;
    if (i < vine.length-1){
      let b = vine[i+1];
      d = [
        b[0]-a[0],
        b[1]-a[1],
        b[2]-a[2],
      ];
    }else{
      let b = vine[i-1];
      d = [
        a[0]-b[0],
        a[1]-b[1],
        a[2]-b[2],
      ]
    }
    
    // let n = v_norm(...a);
    let n = [0,0,1];
    // d = v_scale(...v_norm(...d),0.1);
    d = v_norm(...d);
    
    let rat = 1.0;
    for (let k = 0; k < 2; k++){
      for (let j = 0; j < nr; j++){
        let x = -((j/nr)*2-1)/rat;
        let y = Math.sqrt((1-rat*rat*x*x));
        let th = Math.atan2(y,x)+PI*k;
        let M = m_rot_axis(...d,th);
        let v = m_tfrm(M,n);
        let w = ww * Math.sqrt(x*x+y*y);
        v = v_scale(...v,w);
        v = v_add(...v,0,0,rand()*3+noise(i*0.1)*2);
        // console.log(x,y,th,M,v,w,ww,jj[i])
        ring.push(v_add(...a,...v));
      }
    }
    
    rings.push(ring);
  }
  // console.log(rings);
  let ff = [];
  let pr = 10;
  {
    let a = vine[0];
    let b = vine[1];
    let d = v_scale(...v_norm(...v_sub(...a,...b)),pr);
    let c = v_add(...a,...d);
    let r0 = rings[0];
    for (let j = 0; j < r0.length; j++){
      let k = (j+1)%r0.length;
      ff.push([c,r0[k],r0[j]]);
    }
  }

  for (let i = 0; i < rings.length-1; i++){
    let r0 = rings[i];
    let r1 = rings[i+1];
    for (let j = 0; j < r0.length; j++){
      let k = (j+1)%r0.length;
      ff.push([r0[j],r0[k],r1[k]]);
      ff.push([r0[j],r1[k],r1[j]]);
    }
  }

  {
    let a = vine[vine.length-1];
    let b = vine[vine.length-2];
    let d = v_scale(...v_norm(...v_sub(...a,...b)),pr);
    let c = v_add(...a,...d);
    let r0 = rings[rings.length-1];
    for (let j = 0; j < r0.length; j++){
      let k = (j+1)%r0.length;
      ff.push([c,r0[j],r0[k]]);
      
    }
  }
  
  for (let i = 0; i < ff.length; i++){
    ff[i][3] = [0.2,0.1,0, 0.7,0.6,0.5];
  }
  let ret = ff.concat(sub);
  // progress(ret);
  return ret;
}




