var jello = {pts:[],springs:[]};

var [W,H] = [800,800];
var w = 10;
var h = 10;
var s = 50;

for (var i = 0; i < h; i++){
  for (var j = 0; j < w; j++){
    jello.pts.push({pos:[100+j*s,100+i*s],v:[0,0]});
    // if (j){
    //   jello.springs.push({a:i*w+j,b:i*w+j-1,len:s})
    // }
    // if (i){
    //   jello.springs.push({a:i*w+j,b:(i-1)*w+j,len:s})
    // }
    // if (i && j){
    //   jello.springs.push({a:i*w+j,b:(i-1)*w+j-1,len:s*Math.sqrt(2)})
    // }
    // if (i && j+1 < w){
    //   jello.springs.push({a:i*w+j,b:(i-1)*w+j+1,len:s*Math.sqrt(2)})
    // }
  }
}
for (var i = 0; i < jello.pts.length; i++){
  for (var j = i+1; j < jello.pts.length; j++){
    let a = jello.pts[i];
    let b = jello.pts[j];
    let d = Math.hypot(b.pos[1]-a.pos[1],b.pos[0]-a.pos[0]);
    if (d < s*3){
      jello.springs.push({a:i,b:j,len:d})
    }
  }
}


var ctx = document.createElement("canvas").getContext('2d');
ctx.canvas.width = W;
ctx.canvas.height = H;
document.body.appendChild(ctx.canvas);

function step(){

  for (var i = 0; i < jello.springs.length; i++){
    let spr = jello.springs[i];
    let a = jello.pts[spr.a];
    let b = jello.pts[spr.b];
    let d = Math.hypot(b.pos[1]-a.pos[1],b.pos[0]-a.pos[0]);
    let r = Math.atan2(b.pos[1]-a.pos[1],b.pos[0]-a.pos[0])
    let x = d-spr.len;

    a.v[0] += x * Math.cos(r);
    a.v[1] += x * Math.sin(r);
    b.v[0] -= x * Math.cos(r);
    b.v[1] -= x * Math.sin(r);
    
  }

  for (var i = 0; i < jello.pts.length-w; i++){


    jello.pts[i].pos[0]+=jello.pts[i].v[0]*0.05;
    jello.pts[i].pos[1]+=jello.pts[i].v[1]*0.05;
    
    jello.pts[i].pos[0] = Math.min(Math.max(jello.pts[i].pos[0],0),W)
    jello.pts[i].pos[1] = Math.min(Math.max(jello.pts[i].pos[1],0),H)

    jello.pts[i].v[1]+= 1;

    jello.pts[i].v[0]*=0.99;
    jello.pts[i].v[1]*=0.99;
  }
  
}



function loop(){
  step();
  
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  ctx.fillStyle="black";
  for (var i = 0; i < jello.pts.length; i++){
    ctx.fillRect(...jello.pts[i].pos,5,5);
  }
  for (var i = 0; i < jello.springs.length; i++){
    ctx.beginPath();
    ctx.moveTo(...jello.pts[jello.springs[i].a].pos)
    ctx.lineTo(...jello.pts[jello.springs[i].b].pos);
    ctx.stroke();
  }
  setTimeout(loop,10);
}

loop();