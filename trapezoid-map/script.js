/*global describe TrapezoidMap TMapAnimator FindContours earcut */

let USE_ROBOT = false;

let frame = 0;

function pt_in_pl (x,y,x0,y0,x1,y1) {
  var dx = x1-x0;
  var dy = y1-y0;
  var e  = (x-x0)*dy-(y-y0)*dx;
  return e;
}

function pt_in_tri (x,y,x0,y0,x1,y1,x2,y2){
  return pt_in_pl(x,y,x0,y0,x1,y1)<=0 && pt_in_pl(x,y,x1,y1,x2,y2)<=0 && pt_in_pl(x,y,x2,y2,x0,y0)<=0;
}

function poly_area(poly){
  var n = poly.length;
  var a = 0.0;
  for(var p=n-1,q=0; q<n; p=q++) {
    a += poly[p][0] * poly[q][1] - poly[q][0] * poly[p][1];
  }
  return a * 0.5;
}

function pt_in_convex_poly(x,y,p){
  for (let i = 1; i < p.length-1; i++){
    let a = p[0];
    let b = p[i];
    let c = p[i+1];
    if (poly_area([a,b,c])>0.1 && pt_in_tri(x,y,...a,...b,...c)){
      return true;
    }
  }
  return false;
}


function cwise(p1x, p1y, p2x, p2y, p3x, p3y) {
  return (p2x - p1x) * (p3y - p1y) - (p2y - p1y) * (p3x - p1x);
}

function convex_hull(plist) {
  function lowest_y(plist) {
    let mi = 0;
    let mv = Infinity;
    for (let i = 0; i < plist.length; i++) {
      if (plist[i][1] < mv) {
        mv = plist[i][1];
        mi = i;
      }
    }
    return mi;
  }
  function highest_y(plist) {
    let mi = 0;
    let mv = -Infinity;
    for (let i = 0; i < plist.length; i++) {
      if (plist[i][1] > mv) {
        mv = plist[i][1];
        mi = i;
      }
    }
    return mi;
  }
  
  let N = plist.length;
  let points = plist.slice();
  let p = points.splice(lowest_y(plist), 1)[0];
  let keyfunc = (q) => Math.atan2(q[1] - p[1], q[0] - p[0]);
  points.sort((a, b) => keyfunc(a) - keyfunc(b));
  points.unshift(p);
  let stack = [];
  stack.push(points[0]);
  stack.push(points[1]);
  for (let i = 2; i < points.length; i++) {
    while (stack.length >= 2 && cwise(stack[stack.length - 2][0], stack[stack.length - 2][1], stack[stack.length - 1][0], stack[stack.length - 1][1], points[i][0], points[i][1]) <= 0) {
      stack.pop();
    }
    stack.push(points[i]);
  }
  return stack;
}


// let cnv4 = document.createElement("canvas");
let cnv4 = document.getElementById("cnv4");
cnv4.width = 720;
cnv4.height = 480;
let ctx4 = cnv4.getContext('2d');
// document.body.appendChild(cnv4);


// let cnv = document.createElement("canvas");
let cnv = document.getElementById("cnv");
cnv.width = 720;
cnv.height = 720;
let ctx = cnv.getContext('2d');
// document.body.appendChild(cnv);


let cnv3 = document.createElement("canvas");
cnv3.width = cnv.width;
cnv3.height = cnv.height;
let ctx3 = cnv3.getContext('2d');
// document.body.appendChild(cnv3);


let cnv2 = document.getElementById("cnv2");
// let cnv2 = document.createElement("canvas");
cnv2.width = 128;
cnv2.height = 128;
let ctx2 = cnv2.getContext('2d');
// document.body.appendChild(cnv2);
let mouseX2;
let mouseY2;

let mousemode = 0;


let mouseIsDown = false;

let obstacles = [
  [[100,100],[150,50],[250,150]],
  [[200,250],[300,200],[290,250],[500,400],[350,450]],
  [[50,300],[175,400],[400,250],[225,450],[125,450]],
  // [[400,500],[600,400],[800,800],[700,900]],
]
obstacles = [[[212,153],[262,103],[362,203]],[[302,538],[370,422],[360,472],[570,622],[420,672]],[[40,336],[165,436],[390,286],[215,486],[115,486]]]
obstacles = [[[474,379],[559,281],[659,381]],[[187,573],[117,555],[311,416],[403,538],[269,634]],[[251,158],[299,219],[392,143],[595,192],[167,307]]]
let robot_pts = [[0,-20],[20,20],[-20,20]];
let robot = null;
let c_obstacles = [];
let vertices = [];
let trapezoids = [];
let animframes = [];
let hulls = [];

let end_pts = [[30,30],[390,300]];
end_pts = [[240,96],[542,446]];

function draw_obstacle(shape){
  ctx.fillStyle="rgb(0,0,0,0.4)"
  ctx.beginPath();
  for (let i = 0; i < shape.length; i++){
    // console.log(shape[i])
    ctx[i?'lineTo':'moveTo'](...shape[i]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle="rgb(0,0,0,0.3)"
  for (let i = 0; i < shape.length; i++){
    draw_circle(...shape[i],8);
  }
}
function draw_halfedge(x0,y0,x1,y1,_ctx){
  if (!_ctx) _ctx = ctx;
  let u0 = x0 * 0.75 + x1 * 0.25;
  let u1 = x1 * 0.75 + x0 * 0.25;
  let v0 = y0 * 0.75 + y1 * 0.25;
  let v1 = y1 * 0.75 + y0 * 0.25;
  
  let ang = Math.atan2(y1-y0,x1-x0);
  ang += Math.PI/2;
  
  _ctx.beginPath();
  _ctx.moveTo(u0+Math.cos(ang)*8,v0+Math.sin(ang)*8);
  _ctx.lineTo(u1+Math.cos(ang)*8,v1+Math.sin(ang)*8);
  _ctx.lineTo(u1+Math.cos(ang)*8+Math.cos(ang+Math.PI/3)*8,v1+Math.sin(ang)*8+Math.sin(ang+Math.PI/3)*8);
  _ctx.stroke();
}


function draw_tight_halfedge(x0,y0,x1,y1,d,_ctx){
  if (!_ctx) _ctx = ctx;
  let t = d*2/Math.hypot(x0-x1,y0-y1);
  let u0 = x0 * (1-t) + x1 * t;
  let u1 = x1 * (1-t) + x0 * t;
  let v0 = y0 * (1-t) + y1 * t;
  let v1 = y1 * (1-t) + y0 * t;
  
  let ang = Math.atan2(y1-y0,x1-x0);
  ang += Math.PI/2;
  
  _ctx.beginPath();
  _ctx.moveTo(u0+Math.cos(ang)*d,v0+Math.sin(ang)*d);
  _ctx.lineTo(u1+Math.cos(ang)*d,v1+Math.sin(ang)*d);
  _ctx.lineTo(u1+Math.cos(ang)*d+Math.cos(ang+Math.PI/3)*d,v1+Math.sin(ang)*d+Math.sin(ang+Math.PI/3)*d);
  _ctx.stroke();
}



function draw_circle(x,y,r,_ctx){
  if (!_ctx){
    _ctx = ctx;
  }else{
    // alert("!")
  }
  _ctx.beginPath();
  _ctx.ellipse(x,y,r,r,0,0,Math.PI*2);
  _ctx.fill();
}

function color_from_id(id){
  let r = id;
  let g = id;
  let b = id;
  for (let i = 0; i < 17; i++){
    r^=(r<<17);
    r^=(r>>13);
    r^=(r<<5);
  }
  r = ((r>>>0)/4294967295);
  for (let i = 0; i < 13; i++){
    g^=(g<<17);
    g^=(g>>13);
    g^=(g<<5);
  }
  g = ((g>>>0)/4294967295)
  for (let i = 0; i < 5; i++){
    b^=(b<<17);
    b^=(b>>13);
    b^=(b<<5);
  }
  b = ((b>>>0)/4294967295)
  return [r,g,b]
}

let mouseX = -1;
let mouseY = -1;
let pth;

function draw_trapezoids(faces){
  ctx.lineWidth=1;
  for (let i = 0; i < faces.length; i++){
    let [r,g,b] = color_from_id(i);
    r = r*0.5+0.2;
    g = g*0.5+0.2;
    b = b*0.5+0.2;
    ctx.strokeStyle="rgb(255,0,0,0.7)";
    ctx.fillStyle=`rgba(${~~(r*255)},${~~(g*255)},${~~(b*255)},0.2)`;
    ctx.beginPath();
    for (let j = 0; j < faces[i].vertices.length; j++){
      ctx[j?'lineTo':'moveTo'](...faces[i].vertices[j].xy)
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.strokeStyle="rgb(255,0,0,0.7)";
    if (document.getElementById("chk_halfedge").checked){
      for (let j = 0; j < faces[i].vertices.length; j++){
        draw_halfedge(...faces[i].vertices[j].xy,...faces[i].vertices[j].next.xy);
      }
    }
  }
  ctx.lineWidth=2;
  ctx.strokeStyle="rgb(0,0,255,0.5)";
  ctx.beginPath();
  for (let i = 0; i < faces.length; i++){
    for (let j = 0; j < faces[i].neighbors.length; j++){
      let v = faces[i].neighbors[j].edge;
      ctx.moveTo(...faces[i].centroid);
      ctx.lineTo((v.xy[0]+v.next.xy[0])/2,(v.xy[1]+v.next.xy[1])/2);
      ctx.lineTo(...faces[i].centroid);
      
    }
  }
  ctx.stroke();
  
}


function trace(ctx,epsilon=1){
  let cnv = ctx.canvas;
  let dat = ctx.getImageData(0,0,cnv.width,cnv.height).data;
  let im = [];
  for (let i = 0; i < dat.length; i+=4){
    im.push(dat[i]>128?1:0);
  }
  let contours = FindContours.findContours(im,cnv.width,cnv.height);
  for (let i = 0; i < contours.length; i++){

    let ih = contours[i].isHole;
    // console.log(ih);
    contours[i] = FindContours.approxPolyDP(contours[i].points,epsilon)
    contours[i] = contours[i].map(x=>[x[0],x[1]])
    // if (ih){
    contours[i].reverse();
    // }
    contours[i].pop();
  }
  contours = contours.filter(x=>x.length>=3);
  return contours;
}


function trace_grouped(ctx,epsilon=1){
  let cnv = ctx.canvas;
  let dat = ctx.getImageData(0,0,cnv.width,cnv.height).data;
  let im = [];
  for (let i = 0; i < dat.length; i+=4){
    im.push(dat[i]>128?1:0);
  }
  let contours = FindContours.findContours(im,cnv.width,cnv.height);
  let groups = {};
  for (let i = 0; i < contours.length; i++){
    let p = FindContours.approxPolyDP(contours[i].points,epsilon).map(x=>[x[0],x[1]]);
    p.reverse();
    p.pop();
    if (p.length < 3){
      continue;
    }
    if (contours[i].isHole){ 
      if (groups[contours[i].parent]){
        p.reverse();
        groups[contours[i].parent].push(p);
      }
    }else{
      groups[i+2] = [p];
    }
  }
  return groups;
}

function triangulate(p){
  function clone(ff){
    return JSON.parse(JSON.stringify(ff));
  }
  p = clone(p);
  let poly = p[0];
  let holes = p.slice(1);
  let idx = [];
  let q = poly;
  while (holes.length){
    idx.push(q.length);
    q.push(...holes.pop());
  }
  let trigs = earcut(q.flat(),idx.length?idx:null);

  let faces = [];
  for (let i = 0; i < trigs.length; i+=3){
    let a = trigs[i];
    let b = trigs[i+1];
    let c = trigs[i+2];
    faces.push([q[a],q[b],q[c]]);
  }
  return faces;
}


function recalc(){
  
  if (USE_ROBOT && robot_pts.length >= 3){
    robot = FindContours.approxPolyDP(convex_hull(robot_pts),4);
  }else{
    robot = null;
  }

  hulls = [];
  for (let i = 0; i < obstacles.length; i++){
    hulls.push(convex_hull(obstacles[i]));
    
  }
  
  c_obstacles = [];
  
  for (let i = 0; i < obstacles.length; i++){
    c_obstacles.push(obstacles[i]);
  }

  let outlines;


  
  if (robot){
    
    ctx3.fillStyle="black";
    ctx3.fillRect(0,0,cnv3.width,cnv3.height);
    ctx3.fillStyle="white";
    ctx3.beginPath();
    for (let i = 0; i < c_obstacles.length; i++){
      for (let j = 0; j < c_obstacles[i].length; j++){
        ctx3[j?'lineTo':'moveTo'](...c_obstacles[i][j]);
      }
    }
    ctx3.fill();
    let groups = trace_grouped(ctx3,10);
    // console.log(groups);
    
    let trigs = [];
    for (let k in groups){
      trigs.push(...triangulate(groups[k]));
    }
    for (let i = 0; i < trigs.length; i++){
      // console.log(trigs[i])
      trigs[i] = TrapezoidMap.minkowski_sum(trigs[i],robot);
    }
    
    ctx3.fillStyle="black";
    ctx3.fillRect(0,0,cnv3.width,cnv3.height);
    ctx3.fillStyle="white";
    ctx3.beginPath();
    for (let i = 0; i < trigs.length; i++){
      
      for (let j = 0; j < trigs[i].length; j++){
        ctx3[j?'lineTo':'moveTo'](...trigs[i][j]);
      }
      
    }
    ctx3.fill();
    outlines = trace(ctx3,10);
    
  }else{
    
    ctx3.fillStyle="black";
    ctx3.fillRect(0,0,cnv3.width,cnv3.height);
    ctx3.fillStyle="white";
    ctx3.beginPath();
    for (let i = 0; i < c_obstacles.length; i++){
      
      for (let j = 0; j < c_obstacles[i].length; j++){
        ctx3[j?'lineTo':'moveTo'](...c_obstacles[i][j]);
      }
      
    }
    ctx3.fill();
    outlines = trace(ctx3,10);
    
    
    
  }
  
  
  let jitter = Number(document.getElementById("sld_jitter").value)/100;
  jitter = 0.001 + jitter * 10;
  vertices = TrapezoidMap.make_halfedge_list(cnv.width,cnv.height,outlines,jitter);

  try{
    trapezoids = TrapezoidMap.make_cuts(vertices);
    
    let f0;
    let f1;
    for (let i = 0; i < trapezoids.length; i++){
      if (pt_in_convex_poly(...end_pts[0],trapezoids[i].vertices.map(x=>x.xy))){
        f0 = trapezoids[i];
      }
      if (pt_in_convex_poly(...end_pts[1],trapezoids[i].vertices.map(x=>x.xy))){
        f1 = trapezoids[i];
      }
    }
    if (f0 && f1){
      let method = [TrapezoidMap.bfs, TrapezoidMap.dfs][document.getElementById("sel_search").selectedIndex];
      // console.log(method)
      pth = TrapezoidMap.bfs(f0,f1,{});
      if (pth && pth.length){
        pth.pop();
        // pth.shift();
        pth.push(end_pts[1]);
        pth.unshift(end_pts[0]);
      }
    }
  }catch(e){
    console.log(e)
  }

}
recalc();

function recalc_animation(){
  frame = 0;
  let t = Number(document.getElementById("sld_animspd").value)/100;
  let n = ~~(28-t*24);
  console.log(n);
  animframes = TMapAnimator.run(TrapezoidMap.animations,n);
}

recalc_animation();

function loop(){
  requestAnimationFrame(loop);
  
  ctx.fillStyle="rgb(250,250,250)";
  ctx.fillRect(0,0,cnv.width,cnv.height)
  ctx.strokeStyle="black";
  ctx.lineWidth=0.5;
  ctx.lineCap="round";
  ctx.lineJoin="round";
  
  ctx.lineWidth=2;
  ctx.fillStyle="black";
  ctx.save();
  for (let i = 0; i < obstacles.length; i++){
    draw_obstacle(obstacles[i]);
  }
  ctx.restore();
  

  ctx.save();
  draw_obstacle(curr_shape);
  ctx.restore();
  
  if (mousemode == 0){
    proc_mouse();
  }else if (mousemode == 1){
    proc_mouse1();
  }
  
  
  if (trapezoids){
    draw_trapezoids(trapezoids);
  }
  
  if (pth){
    ctx.save();
    ctx.lineWidth=5;
    ctx.strokeStyle="rgba(0,0,200,0.8)";
    ctx.beginPath();
    for (let i = 0; i < pth.length; i++){
      ctx[i?'lineTo':'moveTo'](...pth[i]);
    }
    ctx.stroke();
    ctx.restore();
  }
  
  ctx.fillStyle="red";
  ctx.strokeStyle="black";
  ctx.lineWidth=1;
  draw_circle(...end_pts[0],10);
  ctx.stroke();
  ctx.fillStyle="green";
  draw_circle(...end_pts[1],10);
  ctx.stroke();
  
  ctx2.fillStyle="black";
  ctx2.fillRect(0,0,cnv2.width,cnv2.height);
  
  if (mouseIsDown && 0 <= mouseX2 && mouseX2 <= cnv2.width && 0 <= mouseY2 && mouseY2 <= cnv2.height){
    robot_pts.push([mouseX2-cnv2.width/2,mouseY2-cnv2.height/2]);
  }
  ctx2.fillStyle="rgb(128,128,128,0.5)";
  for (let i = 0; i < robot_pts.length; i++){
    // console.log(robot_pts[i][0]+cnv2.width/2,robot_pts[i][1]+cnv2.height/2)
    draw_circle(robot_pts[i][0]+cnv2.width/2,robot_pts[i][1]+cnv2.height/2,4,ctx2);
  }
  ctx2.strokeStyle="white";
  ctx2.lineWidth=1;
  ctx2.beginPath();
  ctx2.moveTo(cnv2.width/2,0);
  ctx2.lineTo(cnv2.width/2,cnv2.height);
  ctx2.moveTo(0,cnv2.height/2);
  ctx2.lineTo(cnv2.width,cnv2.height/2);
  ctx2.stroke();
  
  if (robot){
    ctx2.strokeStyle="yellow";
    ctx2.lineWidth=2;
    ctx2.beginPath();
    for (let i = 0; i < robot.length; i++){
      ctx2[i?'lineTo':'moveTo'](robot[i][0]+cnv2.width/2,robot[i][1]+cnv2.height/2);
    }
    ctx2.closePath();
    ctx2.stroke();
  }
  
}

let grabbed = null;

function proc_mouse(){
  cnv.style.cursor="default";
  
  if (grabbed){
    cnv.style.cursor="move";
    if (grabbed.type == 'o_vert'){
      obstacles[grabbed.idx[0]][grabbed.idx[1]][0] = mouseX;
      obstacles[grabbed.idx[0]][grabbed.idx[1]][1] = mouseY;
    }else if (grabbed.type == 'o'){
      let dx = mouseX-grabbed.xy[0];
      let dy = mouseY-grabbed.xy[1];
      grabbed.xy[0] = mouseX;
      grabbed.xy[1] = mouseY;
      let o = obstacles[grabbed.idx];
      for (let i = 0; i < o.length; i++){
        o[i][0] += dx;
        o[i][1] += dy;
      }
    }else if (grabbed.type == 'end_pt'){
      end_pts[grabbed.idx][0] = mouseX;
      end_pts[grabbed.idx][1] = mouseY;
    }
  }
  
  for (let i = 0; i < end_pts.length; i++){
    if (Math.hypot(mouseX-end_pts[i][0],mouseY-end_pts[i][1])<16){
      cnv.style.cursor="move";
      if (mouseIsDown){
        grabbed = {
          type:'end_pt',idx:i,
        }
        return;
      }
    }
  }
  
  
  ctx.fillStyle="black";
  for (let i = 0; i < obstacles.length; i++){
    for (let j = 0; j < obstacles[i].length; j++){
      if (Math.hypot(mouseX-obstacles[i][j][0],mouseY-obstacles[i][j][1])<8){
        draw_circle(...obstacles[i][j],8);
        cnv.style.cursor="move";
        if (mouseIsDown){
          grabbed = {type:'o_vert',idx:[i,j]};
        }
        return;
      }
    }
  }

  
  for (let i = 0; i < trapezoids.length; i++){
    let f = trapezoids[i];
    if (pt_in_convex_poly(mouseX,mouseY,f.vertices.map(x=>x.xy))){
      let [r,g,b] = color_from_id(i);
      r = r*0.5;
      g = g*0.5;
      b = b*0.5;
      ctx.fillStyle=`rgba(${~~(r*255)},${~~(g*255)},${~~(b*255)},0.2)`;
      ctx.beginPath();
      for (let j = 0; j < f.vertices.length; j++){
        ctx[j?'lineTo':'moveTo'](...f.vertices[j].xy)
      }
      ctx.fill();
      
      ctx.lineWidth=2;
      ctx.strokeStyle="black";
      ctx.beginPath();
      for (let j = 0; j < f.neighbors.length; j++){
        let v = f.neighbors[j].edge;
        
        ctx.moveTo(...v.xy);
        ctx.lineTo(...v.next.xy);
        
      }
      ctx.stroke();
      return;
    }
  }
  
  for (let i = 0; i < hulls.length; i++){
    
    if (pt_in_convex_poly(mouseX,mouseY,hulls[i])){
      cnv.style.cursor="move";
      if (mouseIsDown){
        grabbed = {type:'o',idx:i,xy:[mouseX,mouseY]}
        
      }
      break;
    }
    
  }
  
}


let curr_shape = [];

function proc_mouse1(){
  if (curr_shape.length>2 && Math.hypot(mouseX-curr_shape[0][0],mouseY-curr_shape[0][1])<10){
    ctx.save();
    ctx.fillStyle="black";
    draw_circle(...curr_shape[0],5);
    ctx.fillText("close",curr_shape[0][0]+5,curr_shape[0][1]-5);
    ctx.restore();
  }
}

function update_tip(){
  if (mousemode == 0){
    document.getElementById("tip_interact").style.display="block";
    document.getElementById("tip_draw").style.display="none";
  }else if (mousemode == 1){
    document.getElementById("tip_interact").style.display="none";
    document.getElementById("tip_draw").style.display="block";
  }
}

document.addEventListener('mousemove',function(e){
  let rect = cnv.getBoundingClientRect();
  let rect2 = cnv2.getBoundingClientRect();
  
  mouseX = e.clientX-rect.left;
  mouseY = e.clientY-rect.top;
  
  mouseX2 = e.clientX-rect2.left;
  mouseY2 = e.clientY-rect2.top;
  
  if (mousemode == 0){
    recalc();
  }

})
document.addEventListener('mousedown',function(){
  mouseIsDown = true;
  
  if (mousemode == 1){
    if (curr_shape.length>1 && Math.hypot(mouseX-curr_shape[0][0],mouseY-curr_shape[0][1])<10){
      // if (curr_shape.length <= 2){
      //   alert("New shape has fewer than 3 vertices - discarded!");
      // }else{
      if (poly_area(curr_shape)<0){
        curr_shape.reverse();
      }
        obstacles.push(curr_shape);
      // }
      curr_shape = [];
      recalc();
      document.getElementById("sel_mmode").selectedIndex=0;
      mousemode = 0;
      update_tip();
    }else{
      curr_shape.push([mouseX,mouseY]);
    }
    
  }
})
document.addEventListener('mouseup',function(){
  mouseIsDown = false;
  grabbed = null;
});


loop();


// let chk_robot = document.createElement("input");
let chk_robot = document.getElementById("chk_robot");
chk_robot.type = 'checkbox';
// document.body.appendChild(chk_robot);
chk_robot.onclick = function(){
  USE_ROBOT = chk_robot.checked;
  recalc();
}


function css_color(r,g,b,a){
  return `rgba(${~~(r*255)},${~~(g*255)},${~~(b*255)},${(~~(a*100))/100})`
}

function make_seg_color(k){
  let [r,g,b] = color_from_id(~~k);
  r = r*0.5+0.5;
  g = g*0.8+0.2;
  b = b*0.5+0.5;
  return css_color(r,g,b,1);
}


function animloop(){
  requestAnimationFrame(animloop);
  // setTimeout(animloop,100);
  
  ctx4.save();
  ctx4.fillStyle = "black";
  ctx4.fillRect(0,0,cnv4.width,cnv4.height);
  ctx4.restore();
  
  
  ctx4.save();
  
  ctx4.translate(60,60);
  ctx4.scale(0.5,0.5);
  
  ctx4.lineCap="round";
  ctx4.lineJoin="round";
  

 
  let elms = animframes[frame];
  
  ctx4.save();
  ctx4.strokeStyle="silver";
  for (let k in elms.bg_segs){
    ctx4.beginPath();
    ctx4.moveTo(...elms.bg_segs[k].data.slice(0,2));
    ctx4.lineTo(...elms.bg_segs[k].data.slice(2));
    ctx4.stroke();
  }
  ctx4.restore();
  
  ctx4.save();
  ctx4.strokeStyle="white";
  ctx4.beginPath();
  ctx4.moveTo(...elms.special.scanline.data.slice(0,2));
  ctx4.lineTo(...elms.special.scanline.data.slice(2));
  ctx4.stroke();
  ctx4.restore();

  if (elms.special.ray){
    ctx4.save();
    ctx4.strokeStyle="white";
    ctx4.lineWidth=8;
    ctx4.beginPath();
    ctx4.moveTo(...elms.special.ray.data.slice(0,2));
    ctx4.lineTo(...elms.special.ray.data.slice(2));
    ctx4.stroke();
    ctx4.restore();
  }
  
  
  ctx4.save();
  for (let k in elms.did_segs){
    ctx4.strokeStyle=make_seg_color(k);
    ctx4.lineWidth=~~((0.1+elms.did_segs[k].style[0]*3)*100)/100;

    // ctx4.beginPath();
    // ctx4.moveTo(...elms.did_segs[k].data.slice(0,2));
    // ctx4.lineTo(...elms.did_segs[k].data.slice(2));
    // ctx4.stroke();
    
    draw_tight_halfedge(...elms.did_segs[k].data,5,ctx4);
  }
  ctx4.restore();
  
  
  ctx4.save();
  for (let k in elms.bst_segs){
    ctx4.strokeStyle=make_seg_color(k);
    ctx4.lineWidth=~~((0.1+elms.bst_segs[k].style[0]*12)*100)/100;

    // ctx4.beginPath();
    // ctx4.moveTo(...elms.bst_segs[k].data.slice(0,2));
    // ctx4.lineTo(...elms.bst_segs[k].data.slice(2));
    // ctx4.stroke();
    
    draw_tight_halfedge(...elms.bst_segs[k].data,5,ctx4);
  }
  ctx4.restore();
  
  
  
  ctx4.restore();
  
  
  ctx4.save();
  ctx4.translate(600,80);
  for (let k in elms.bst_nodes){
    
    let r=~~((0.1+elms.bst_nodes[k].style[0]*10)*100)/100;
    let w=~~((0.1+elms.bst_nodes[k].style[0]*4)*100)/100;
    
    let [x0,y0] = elms.bst_nodes[k].data.slice(0,2);
    let [x1,y1] = elms.bst_nodes[k].data.slice(2);
    
    x0 *= 20;
    x1 *= 20;
    y0 *= 34;
    y1 *= 34;
    
    ctx4.strokeStyle="silver";
    ctx4.beginPath();
    ctx4.moveTo(x0*0.6+x1*0.4,y0*0.6+y1*0.4);
    ctx4.lineTo(x1*0.6+x0*0.4,y1*0.6+y0*0.4);
    ctx4.stroke();
    
    ctx4.fillStyle=make_seg_color(k);
    draw_circle(x1,y1,r,ctx4);
  
  }
  ctx4.restore();
  
  frame = (frame + 1) % animframes.length;
}

animloop();


document.getElementById("sel_mmode").onchange = function(){
  mousemode = Number(document.getElementById("sel_mmode").selectedIndex);
  grabbed = null;
  curr_shape = [];
  update_tip();
};


document.getElementById("sel_search").onchange = function(){
  recalc();
};

document.getElementById("btn_xobs").onclick = function(){
  obstacles.splice(0,Infinity);
  recalc();
};

document.getElementById("btn_animate").onclick = function(){
  recalc_animation();
};


document.getElementById("btn_xrobot").onclick = function(){
  robot_pts = [];
};