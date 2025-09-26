var jello = {pts:[],springs:[]};

var [W,H] = [800,600];
var w = 6;
var h = 6;
var d = 6;

var s = 50;

for (var i = 0; i < h; i++){
  for (var j = 0; j < w; j++){
    for (var k = 0; k < d; k++){
      jello.pts.push({pos:[100+j*s,200+i*s,k*s],v:[0,0,0]});
    }
  }
}
for (var i = 0; i < jello.pts.length; i++){
  for (var j = i+1; j < jello.pts.length; j++){
    let a = jello.pts[i];
    let b = jello.pts[j];
    let D = Math.hypot(b.pos[1]-a.pos[1],b.pos[0]-a.pos[0],b.pos[2]-a.pos[2]);
    if (D < s*2){
      jello.springs.push({a:i,b:j,len:D})
    }
  }
}

var edges = [[],[],[],[],[],[],[],[],[],[],[],[]];
for (var i = 0; i < h; i++){
  edges[ 0].push(i*w*d);
  edges[ 1].push(i*w*d+(w-1)*d);
  edges[ 2].push(i*w*d+d-1);
  edges[ 3].push(i*w*d+(w-1)*d+d-1);
}
for (var i = 0; i < w; i++){
  edges[ 4].push(i*d);    
  edges[ 5].push((h-1)*w*d+i*d);    
  edges[ 6].push(i*d+d-1);    
  edges[ 7].push((h-1)*w*d+i*d+d-1);
}
for (var i = 0; i < d; i++){
  edges[ 8].push(i);    
  edges[ 9].push((w-1)*d+i);    
  edges[10].push((h-1)*w*d+i);    
  edges[11].push((h-1)*w*d+(w-1)*d+i);  
}


function makeButton(name,fun){
  let btn = document.createElement("button");
  btn.innerHTML = name;
  btn.onclick=fun;
  document.body.appendChild(btn);
}

var corners = Array.from(new Set(edges.map(x=>x[0]).concat(edges.map(x=>x[x.length-1]))));

for (let i = 0; i < corners.length; i++){
  makeButton("jiggle"+(i+1),function(){
    let a = jello.pts[corners[i]];

    for (var j = 0; j < jello.pts.length; j++){
      let b = jello.pts[j];
      var D = Math.hypot(b.pos[1]-a.pos[1],b.pos[0]-a.pos[0],b.pos[2]-a.pos[2]);
      
      if (D < s * 3){
        var f = [
          600*Math.random()-300,
          600*Math.random()-300,
          600*Math.random()-300,
        ]
        jello.pts[j].v[0]+=f[0];
        jello.pts[j].v[1]+=f[1];
        jello.pts[j].v[2]+=f[2];
      }
    }
  })
}
document.body.appendChild(document.createElement("br"))


var ctx = document.createElement("canvas").getContext('2d');
ctx.canvas.width = W;
ctx.canvas.height = H;
document.body.appendChild(ctx.canvas);

function step(){

  for (var i = 0; i < jello.springs.length; i++){
    let spr = jello.springs[i];
    let a = jello.pts[spr.a];
    let b = jello.pts[spr.b];

    let D = [b.pos[0]-a.pos[0],b.pos[1]-a.pos[1],b.pos[2]-a.pos[2]]
    var l = Math.hypot(b.pos[1]-a.pos[1],b.pos[0]-a.pos[0],b.pos[2]-a.pos[2]);
    let n = [D[0]*spr.len/l,D[1]*spr.len/l,D[2]*spr.len/l];
    let x = [D[0]-n[0],D[1]-n[1],D[2]-n[2]]

    a.v[0] += x[0]
    a.v[1] += x[1]
    a.v[2] += x[2]
    b.v[0] -= x[0]
    b.v[1] -= x[1]
    b.v[2] -= x[2]
    
  }

  for (var i = 0; i < jello.pts.length/* -w*d */; i++){

    jello.pts[i].pos[0]+=jello.pts[i].v[0]*0.05;
    jello.pts[i].pos[1]+=jello.pts[i].v[1]*0.05;
    jello.pts[i].pos[2]+=jello.pts[i].v[2]*0.05;
    
    jello.pts[i].pos[0] = Math.min(Math.max(jello.pts[i].pos[0],s),W-s)
    jello.pts[i].pos[1] = Math.min(Math.max(jello.pts[i].pos[1],s),H-s)

    jello.pts[i].v[1]+= 1;

    jello.pts[i].v[0]*=0.99;
    jello.pts[i].v[1]*=0.99;
    jello.pts[i].v[2]*=0.99;
  }
  
}



function proj(x,y,z){
  return [x+z/2,y-z/3];
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


function loop(){
  step();
  
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

//   ctx.strokeStyle="rgba(0,0,0,0.1)";
//   ctx.lineWidth="1";
//   for (var i = 0; i < jello.springs.length; i++){
//     ctx.beginPath();
//     ctx.moveTo(...proj(...jello.pts[jello.springs[i].a].pos))
//     ctx.lineTo(...proj(...jello.pts[jello.springs[i].b].pos));
//     ctx.stroke();
//   }
  
  ctx.strokeStyle="black";
  ctx.lineWidth="3";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  for (var i = 0; i < edges.length; i++){
    
    let c = []
    for (var j = 0; j < edges[i].length; j++){
      c.push(jello.pts[edges[i][j]].pos);
    }
    c = smoothen(c,{detail:10});
    ctx.beginPath();
    for (var j = 0; j < c.length; j++){
      ctx[j?"lineTo":"moveTo"](...proj(...c[j]));
    }
    ctx.stroke();
  }

  
  setTimeout(loop,10);
}

loop();

