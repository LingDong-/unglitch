function compile_trigs(trigs,mr){
  let ts = [];
  for (let i = 0; i < trigs.length; i++){
    
    let a = m_tfrm(mr,trigs[i][0]);
    let b = m_tfrm(mr,trigs[i][1]);
    let c = m_tfrm(mr,trigs[i][2]);
    
    let s = trigs[i][3];
    
    let u = v_sub(...b,...a);
    let v = v_sub(...b,...c);
    let n = v_cross(...u,...v);
    if (n[0]+n[1]+n[2]){
      n = v_norm(...n);
    }
    if (n[2] < -0.01){
      continue;
    }
    let m = [
      (a[0]+b[0]+c[0])/3,
      (a[1]+b[1]+c[1])/3,
      (a[2]+b[2]+c[2])/3,
    ];
    
    ts.push({a,b,c,m,n,s});
  }
  ts.sort((a,b)=>(b.m[2]-a.m[2]));
  return ts;
}



let cnv = document.createElement("canvas");
cnv.width = 512;
cnv.height = 512;
let ctx = cnv.getContext('2d');
document.body.appendChild(cnv);
ctx.lineJoin="round";
ctx.lineCap="round";

// function projection(p){
//   p = [p[0],p[1],p[2]+600]
//   let q = m_proj(300,p);
//   return [q[0]+cnv.width/2,q[1]+cnv.height/2]
// }

function projection(p){
  p = [p[0],p[1],p[2]+600]
  let q = [p[0]*0.1,p[1]*0.1];
  return [q[0]+cnv.width/2,q[1]+cnv.height/2]
}

// let p = petal();
// ctx.beginPath();
// for (let i = 0; i < p.length; i++){
//   ctx[i?'lineTo':'moveTo'](...p[i])
// }
// ctx.stroke();

// let trigs = petal();
// let trigs = flower();
// let trigs = stem();
let trigs = branch();


let frame = 0;
function loop(){
  requestAnimationFrame(loop);
  // ctx.fillStyle="wheat"
  // ctx.fillStyle="pink"
  // ctx.fillStyle="antiquewhite"
  ctx.fillRect(0,0,cnv.width,cnv.height);
  
  ctx.save();
  // ctx.translate(200,200);
  // ctx.scale(4,4);
  // ctx.globalCompositeOperation = "lighter"
  // ctx.lineWidth=0.25;
  
  // let mr = m_rotx(0.02*frame+PI/2);
  // let mr = m_rotx(PI/2+PI/3);
  // let mr = m_rotx(0);
  
  // let mr = m_mult(m_roty(0.02*frame),m_rotx(PI/2+PI/3));
  
  // let mr = m_mult(m_roty(0.02*frame),m_rotz(-PI/2));
  
  let mr = m_mult(m_trsl(0,2000,0),m_mult(m_roty(0.02*frame),m_rotz(-PI/2)));
  
  let ts = compile_trigs(trigs,mr)
  
  
  
  for (let i = 0; i < ts.length; i++){
    
    let {a,b,c,m,n,s} = ts[i];
    
    a = projection(a);
    b = projection(b);
    c = projection(c);
    

    ctx.beginPath();
    
    let g = Math.abs(v_dot(...v_norm(1,2,3),...n));
    let rr = ~~((g*(s[3]-s[0])+s[0])*255);
    let gg = ~~((g*(s[4]-s[1])+s[1])*255);
    let bb = ~~((g*(s[5]-s[2])+s[2])*255);
    ctx.fillStyle = ctx.strokeStyle = `rgb(${rr},${gg},${bb})`

    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.lineTo(...c);
    ctx.lineTo(...a);
  
    ctx.stroke();
    ctx.fill();
  }
  
  ctx.restore();
  frame++;
}
loop();
