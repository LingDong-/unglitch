let {sqrt,abs,min,max,cos,sin} = Math;
let SDF_TMAX = 100;

function sdf_ellipsoid(
  px, py, pz,
  rx, ry, rz
){
  let x,y,z;
  x = px/rx;
  y = py/ry;
  z = pz/rz;
  let k0 = sqrt(x*x+y*y+z*z);
  x = px/(rx*rx);
  y = py/(ry*ry);
  z = pz/(rz*rz);
  let k1 = sqrt(x*x+y*y+z*z);
  return k0*(k0-1.0)/k1;
}

function sdf_torus(
  px, py, pz,
  tx, ty
){
  let qx = sqrt(px*px+py*py)-tx;
  return sqrt(qx*qx+pz*pz)-ty;
}

function sdf_cylinder( px, py, pz, h, r )
{
  let dx = abs(sqrt(px*px+pz*pz))-r;
  let dy = abs(py)-h;
  let o =min(max(dx,dy),0.0);
  dx = max(dx,0);
  dy = max(dy,0);
  return o + sqrt(dx*dx+dy*dy);
}


function sdf_cone(  px,  py,  pz,  cx,  cy,  h )
{
  let q = sqrt(px*px+pz*pz);
  return max(cx * q + cy * py, -h-py);
}

function sdf_cone_inv(  px,  py,  pz,  cx,  cy,  h )
{
  let q = sqrt(px*px+pz*pz);
  return max(cx * q - cy * py, -h+py);
}

function sdf_op_union(  d1,  d2 ){
	return min(d1,d2);
}
function sdf_op_subtract(  d1,  d2 ){
  if (d1 > -d2){
    return d1;
  }else{
    return -d2;
  }
}
function sdf_op_intersect( d1,  d2){
  return max(d1,d2);
}

function sdf_op_smooth_union(  d1,  d2,  k ) {
  let h = 0.5 + 0.5*(d2-d1)/k;
  if (h > 1) h = 1;
  if (h < 0) h = 0;
  return d2 * (1-h) + d1 * h - k*h*(1.0-h);
}

window.sdf_map = function(qx,qy,qz){
  let px = qx;
  let py = qy*0.8660254037844387-qz*-0.49999999999999994;
  let pz = qy*-0.49999999999999994+qz*0.8660254037844387;
  let rx = (px-0.65)*0.707-(py-0.32)*0.707;
  let ry = (px-0.65)*0.707+(py-0.32)*0.707;
  return sdf_op_union(
    sdf_op_smooth_union(
      sdf_op_smooth_union(
        sdf_torus(px+0.45,py+0.04,pz,0.18,0.05),
        sdf_op_smooth_union(
          sdf_ellipsoid(px,py+0.1,pz,0.45,0.25,0.45),
          sdf_cylinder(px,py,pz,0.25,0.3),
          0.2
        ),
        0.1
      ),
      sdf_op_intersect(-py-0.2,
        sdf_op_subtract(sdf_cone(rx,ry,pz,24.0/25,7.0/25,0.8),-py+0.25),
      ),
      0.1
    ),
    sdf_op_smooth_union(
      sdf_ellipsoid(px,py-0.25,pz,0.26,0.1,0.26),
      sdf_cone_inv(px,py-0.36,pz,0.707,0.707,0.06),
      0.07
    )
  );
}

function sdf_cast_ray(
   rox,  roy,  roz, 
   rdx,  rdy,  rdz
){
  let ow;
  let t = 0.0;

  for( let i=0; i<100; i++ ){
    
    let hw = sdf_map(
      rox + rdx * t, 
      roy + rdy * t,
      roz + rdz * t
    );
    ow = t;
    if (t>=SDF_TMAX) break;
    if( hw*10000<t){
      break;
    }
    t += hw;
  }
  return ow;
}


function sdf_cast_ray_step(
   rox,  roy,  roz, 
   rdx,  rdy,  rdz,
    t
){
  let ow;
  let hw = sdf_map(
    rox + rdx * t, 
    roy + rdy * t,
    roz + rdz * t
  );
  ow = t;
  if (t>=SDF_TMAX) return [1,ow];
  if( hw*10000<t){
    return [1,ow];
  }
  t += hw;
  
  return [0,t];
}


function normalize(
   px,   py,   pz,
){
  let l = sqrt(px*px+py*py+pz*pz);
  let ox= px/l;
  let oy= py/l;
  let oz= pz/l;
  return [ox,oy,oz];
}

function sdf_calc_normal(
   px,   py,   pz
){
   let ex = 0.00028865;
   let w0 = sdf_map(px + ex, py - ex, pz - ex);
   let w1 = sdf_map(px - ex, py - ex, pz + ex);
   let w2 = sdf_map(px - ex, py + ex, pz - ex);
   let w3 = sdf_map(px + ex, py + ex, pz + ex);
   return normalize(
    w3 + w0 - w1 - w2, 
    w3 - w0 - w1 + w2,
    w3 - w0 + w1 - w2,
  );
}

function sdf_render(
  rox,roy,roz,
  rdx,rdy,rdz
){
  let tw = sdf_cast_ray(rox,roy,roz,rdx,rdy,rdz);
  if (tw > SDF_TMAX){
    return 2;
  }
  let px = rox + tw * rdx;
  let py = roy + tw * rdy;
  let pz = roz + tw * rdz;
  let [nx,ny,nz] = sdf_calc_normal(px,py,pz);
  let lx = -0.5144957554275266*127.5;
  let ly = 0.8574929257125443*127.5;
  return (nx*lx+ny*ly)+127.5;
}

let cnv = document.createElement('canvas');
cnv.width =  512;
cnv.height = 512;
document.body.appendChild(cnv);
let ctx = cnv.getContext('2d');


let t = performance.now();
let W = 64;
let H = 64;
let CW = (cnv.width/W);
let CH = (cnv.height/H);
let rox = 0;
let roy = 0;
let roz = 0.8;


let BW = 64;
let BH = 64;
let DW = (cnv.width/BW);
let DH = (cnv.height/BH);



let cn2 = document.createElement('canvas');
cn2.width =  512;
cn2.height = 512;
document.body.appendChild(cn2);
let ct2 = cn2.getContext('2d');


function m_roty(a){
  return [cos(a),0,sin(a),0, 0,1,0,0, -sin(a),0,cos(a),0, 0,0,0,1];
}
function m_rot_axis(ux,uy,uz,th){
  let costh = Math.cos(th);
  let sinth = Math.sin(th);
  return [
    costh+ux*ux*costh, ux*uy*(1-costh)-uz*sinth, ux*uz*(1-costh)+uy*sinth, 0,
    uy*ux*(1-costh)+uz*sinth, costh+uy*uy*(1-costh), uy*uz*(1-costh)-ux*sinth, 0,
    uz*ux*(1-costh)-uy*sinth, uz*uy*(1-costh)+ux*sinth, costh+uz*uz*(1-costh), 0,
    0,0,0,1
  ];
}

function m_trsl(x,y,z){
  return [1,0,0,x, 0,1,0,y, 0,0,1,z, 0,0,0,1];
}

function m_mult(A,B){
  return [(A)[0]*(B)[0]+(A)[1]*(B)[4]+(A)[2]*(B)[8]+(A)[3]*(B)[12],(A)[0]*(B)[1]+(A)[1]*(B)[5]+(A)[2]*(B)[9]+(A)[3]*(B)[13],(A)[0]*(B)[2]+(A)[1]*(B)[6]+(A)[2]*(B)[10]+(A)[3]*(B)[14],(A)[0]*(B)[3]+(A)[1]*(B)[7]+(A)[2]*(B)[11]+(A)[3]*(B)[15],(A)[4]*(B)[0]+(A)[5]*(B)[4]+(A)[6]*(B)[8]+(A)[7]*(B)[12],(A)[4]*(B)[1]+(A)[5]*(B)[5]+(A)[6]*(B)[9]+(A)[7]*(B)[13],(A)[4]*(B)[2]+(A)[5]*(B)[6]+(A)[6]*(B)[10]+(A)[7]*(B)[14],(A)[4]*(B)[3]+(A)[5]*(B)[7]+(A)[6]*(B)[11]+(A)[7]*(B)[15],(A)[8]*(B)[0]+(A)[9]*(B)[4]+(A)[10]*(B)[8]+(A)[11]*(B)[12],(A)[8]*(B)[1]+(A)[9]*(B)[5]+(A)[10]*(B)[9]+(A)[11]*(B)[13],(A)[8]*(B)[2]+(A)[9]*(B)[6]+(A)[10]*(B)[10]+(A)[11]*(B)[14],(A)[8]*(B)[3]+(A)[9]*(B)[7]+(A)[10]*(B)[11]+(A)[11]*(B)[15],(A)[12]*(B)[0]+(A)[13]*(B)[4]+(A)[14]*(B)[8]+(A)[15]*(B)[12],(A)[12]*(B)[1]+(A)[13]*(B)[5]+(A)[14]*(B)[9]+(A)[15]*(B)[13],(A)[12]*(B)[2]+(A)[13]*(B)[6]+(A)[14]*(B)[10]+(A)[15]*(B)[14],(A)[12]*(B)[3]+(A)[13]*(B)[7]+(A)[14]*(B)[11]+(A)[15]*(B)[15]];
}

function m_tfrm(A,v){
  return [((A)[0]*(v)[0]+(A)[1]*(v)[1]+(A)[2]*(v)[2]+(A)[3])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15]),((A)[4]*(v)[0]+(A)[5]*(v)[1]+(A)[6]*(v)[2]+(A)[7])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15]),((A)[8]*(v)[0]+(A)[9]*(v)[1]+(A)[10]*(v)[2]+(A)[11])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15])];
}


function mapval(value,istart,istop,ostart,ostop){
    return ostart + (ostop - ostart) * ((value - istart)*1.0 / (istop - istart))
}

// 
function drawslice(col){
  // let th = (col/W*2-1)*Math.PI/2;
  let px = (-W + 2 * col)/H;
  let th = Math.atan2(px,1);
  let costh = Math.cos(th);
  let sinth = Math.sin(th);
  
  let m0 = m_trsl(0,0,-roz);
  // let m1 = m_rot_axis(0,1,0,-th);
  let m1 = m_roty(-th);
  let m2 = m_trsl(0,0,roz);
  let ma = m_mult(m2,m_mult(m1,m0));
  
  
  for (let i = 0; i < H; i++){
    for (let j = 0; j <= col; j++){
      let px = (-W + 2 * j)/H;
      let py = ( W - 2 * i)/H;
      let [rdx,rdy,rdz] = normalize(
            px,
            py,
            -1,
          );
      let col = sdf_render(rox,roy,roz,rdx,rdy,rdz);
      ctx.fillStyle=`rgb(${col},${col},${col})`
      ctx.fillRect(j*CW,i*CH,W*CW,CH);
    }
  }
  ctx.fillStyle="red";
  ctx.fillRect(col*CW,0,1,H*CH);

  for (let i = 0; i < BH; i++){
    for (let j = 0; j < BW; j++){
      
      let [x,y,z] = [0,1-i/BH*2,j/BW*2-1];
      
      ;[x,y,z] = m_tfrm(ma,[x,y,z]);

      let v = Math.abs(sdf_map(x,y,z));

      let r = Math.cos(v*80)/v*3+127;
      let g = v*250;

      ct2.fillStyle=`rgb(${r},${0},${g})`
      ct2.fillRect(j*DW,i*DH,DW,DH);
    }
  }
  
  for (let i = 0; i <= H; i++){
    let px = (-W + 2 * col)/H;
    let py = ( W - 2 * i)/H;
    let [rdx,rdy,rdz] = normalize(
      px,py,-1
    );

    let t=0,r=0;
    for (let j = 0; j < 100; j++){
      let t1;
      ;[r,t1] = sdf_cast_ray_step(rox,roy,roz,rdx,rdy,rdz,t);

      // console.log(t);
      ct2.strokeStyle=(j%2)?"yellow":"black";
      ct2.beginPath();
      // ct2.moveTo((1+roz)*W*CW/2,(1+roy)*H*CH/2);
      
      ct2.lineTo((1+roz*costh)*W*CW/2 + rdz*t*CH*W/2, (1+roy)*H*CH/2 - rdy*t*CH*H/2);
      ct2.lineTo((1+roz*costh)*W*CW/2 + rdz*t1*CH*W/2, (1+roy)*H*CH/2 - rdy*t1*CH*H/2);
      ct2.stroke();
      ct2.fillStyle="white";
      ct2.fillRect((1+roz*costh)*W*CW/2 + rdz*t1*CH*W/2-1.5, (1+roy)*H*CH/2 - rdy*t1*CH*H/2-1.5,3,3);
      if (r) break;
      t = t1;
    }

  }
  
}

// let frame = 0;
// function animate(){
//   // requestAnimationFrame(animate)
//   setTimeout(animate,100);
//   drawslice(frame);
//   frame = (frame+1)%W;
// }
// animate();
// console.log(1000/(performance.now()-t));

cnv.style = "position:absolute;left:0px;top:0px"
cn2.style = "position:absolute;left:512px;top:0px"

function add_slider(x,y,label,min,max,v,nfun,fun){
  let div = document.createElement("div");
  div.style = `position:absolute;left:${x}px;top:${y}px;color:royalblue;user-select:none`;
  div.innerHTML = `<span style="display:inline-block;width:90px">${label}</span>`;
  let slider = document.createElement("input");
  slider.type="range";
  slider.min = min;
  slider.max = max;
  slider.value = v;
  slider.style.transform="translate(0px,3px)"
  // slider.value = ~~(W/2);
  // slider.value = 30;
  // slider.style.width=cnv.width+"px"
  let sp = document.createElement("span");
  sp.innerHTML = nfun(slider.value);
  div.appendChild(slider);
  div.appendChild(sp);
  document.body.appendChild(div);
  
  slider.oninput = function(){
    let q = nfun(slider.value);
    sp.innerHTML = q;
    // console.log(slider.value)
    fun(q);
  }
  return slider;
}

drawslice(~~(W/2));

let sl0 = add_slider(8,512-512,"resolution:",3,8,6,(x)=>(1<<x),function(w){
  W = w;
  H = w;
  CW = (cnv.width/W);
  CH = (cnv.height/H);
  drawslice(~~(sl1.value/512*W));
});

let sl1 = add_slider(8,532-512,"scanline:",0,512,256,(v)=>(~~(v/512*W)),function(v){
  drawslice(v);
});

document.body.appendChild(document.createElement("br"));


let ta = document.createElement('textarea');
ta.spellcheck = false;
ta.style="width:1024px;height:256px;position:absolute;left:0px;top:512px;"
ta.style.width="1024px";
ta.style.height="256px";
ta.innerHTML = window.sdf_map.toString();
document.body.appendChild(ta);

let runbtn = document.createElement("button");
runbtn.innerHTML = "run";
runbtn.style="position:absolute;left:900px;top:512px;width:124px;height:24px"
document.body.appendChild(runbtn);
runbtn.onclick = function(){
  eval("window.sdf_map="+ta.value);
  drawslice(~~(sl1.value/512*W));
}

let prgms = {
  teapot:window.sdf_map.toString(),
  metaball:`\
function(qx,qy,qz){
  return sdf_op_smooth_union(
    sdf_ellipsoid(qx-0.2,qy-0.1,qz,0.4,0.4,0.4),
    sdf_ellipsoid(qx+0.3,qy+0.2,qz,0.3,0.3,0.3),
    0.2);
}`,
  donut:`\
function(qx,qy,qz){
  return sdf_torus(qx,qy,qz,0.4,0.2);
}
`
  
}

let sel = document.createElement("select");
for (let k in prgms){
  let opt = document.createElement("option");
  opt.innerHTML = k;
  sel.appendChild(opt);
  opt.value = k;
}
sel.onchange = function(k){
  // console.log(k);
  ta.value = prgms[sel.value];
  runbtn.click();
}
sel.style="position:absolute;left:786px;top:512px;width:124px;height:24px"
document.body.appendChild(sel);