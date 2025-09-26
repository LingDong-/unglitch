let body = (document.getElementById('main')||document.body);

function test_static(polygon){

  let mul = 1;
  let canv = document.createElement("canvas");
  let ctx = canv.getContext('2d');
  canv.width = 512*mul;
  canv.height = 512*mul;
  body.appendChild(canv);
  window.ctx = ctx;
  ctx.scale(mul,mul);
  ctx.clearRect(0,0,canv.width,canv.height);

  if (!polygon){
    polygon = [];
    for (let i = 0; i < 100; i++){
      polygon.push([Math.random()*500+6,Math.random()*500+6]);
    }
  }

  let P = unmess.unmess(polygon);
  console.log(P);
  ctx.fillStyle="black";
  ctx.strokeStyle="black";
  ctx.lineWidth=1/mul
  ctx.beginPath();
  ctx.font = `${Math.max(1,~~(12/mul))}px Ariel`
  for (let i = 0; i < polygon.length; i++){
    ctx[i?'lineTo':'moveTo'](...polygon[i]);
    ctx.fillText(i,...polygon[i]);
  }
  ctx.fillStyle="rgba(0,0,0,0.2)";
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  for (let i = 0; i < P.length; i++){
    ctx.strokeStyle=i?['blue','green','orange'][i%3]:"red";
    ctx.beginPath();
    ctx.lineWidth=(i?3:6)/mul
    for (let j = 0; j < P[i].length; j++){
      let [x,y] = P[i][j];
      if(!j){
        ctx.fillRect(x,y,2,2);
      }
      ctx[j?'lineTo':'moveTo'](x,y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  return canv;
}

function make_tube(polyline,w){
  let l0 = [];
  let l1 = [];
  for (let i = 0; i < polyline.length-1; i++){
    let a = polyline[i];
    let b = polyline[i+1];
    let dx = b[0]-a[0];
    let dy = b[1]-a[1];
    let l = Math.sqrt(dx*dx+dy*dy);
    let nx = dx/l*w;
    let ny = dy/l*w;
    let xx = -ny;
    let yy = nx;
    l0.push([a[0]+xx,a[1]+yy]);
    l1.push([a[0]-xx,a[1]-yy]);
    l0.push([b[0]+xx,b[1]+yy]);
    l1.push([b[0]-xx,b[1]-yy]);
    
  }
  l0.reverse();
  let ret = l1.concat(l0);
  return ret;
}




      
function make_tube_v2(polyline,widths,join='round',cap="round",join_resolution=2,miter_limit=10){
  function cwise(p1x, p1y, p2x, p2y, p3x, p3y){
    return (p2x - p1x)*(p3y - p1y) - (p2y - p1y)*(p3x - p1x);
  }
  function interp_angles(a0,a1,step){
    a0 = (a0 + Math.PI*2)%(Math.PI*2);
    a1 = (a1 + Math.PI*2)%(Math.PI*2);
    function make_interval(a0,a1){
      let o = [];
      if (a0 < a1){
        for (let a = a0+step; a < a1; a+= step){
          o.push(a);
        }
      }else{
        for (let a = a0-step; a > a1; a-= step){
          o.push(a);
        }
      }
      return o;
    }
    var methods = [
      [Math.abs(a1-a0),           ()=>make_interval(a0,a1)],
      [Math.abs(a1+Math.PI*2-a0), ()=>make_interval(a0,a1+Math.PI*2)],
      [Math.abs(a1-Math.PI*2-a0), ()=>make_interval(a0,a1-Math.PI*2)]
     ]
    methods.sort((x,y)=>(x[0]-y[0]))
    return methods[0][1]();
  }
  function bisect_angles(a0,a1){
    a0 = (a0 + Math.PI*2)%(Math.PI*2);
    a1 = (a1 + Math.PI*2)%(Math.PI*2);
    function bisect(a0,a1){
      return [(a0+a1)/2,Math.abs((a1-a0)/2)];
    }
    var methods = [
      [Math.abs(a1-a0),           ()=>bisect(a0,a1)],
      [Math.abs(a1+Math.PI*2-a0), ()=>bisect(a0,a1+Math.PI*2)],
      [Math.abs(a1-Math.PI*2-a0), ()=>bisect(a0,a1-Math.PI*2)]
     ]
    methods.sort((x,y)=>(x[0]-y[0]))
    return methods[0][1]();
  }
  
  function seg_isect(p0x, p0y, p1x, p1y, q0x, q0y, q1x, q1y) {
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
    return [p1x * t + p0x * (1 - t), p1y * t + p0y * (1 - t)];
  }
  
  let l0 = [];
  let l1 = [];
  for (let i = 0; i < polyline.length-1; i++){
    let a = polyline[i];
    let b = polyline[i+1];

    let dx = b[0]-a[0];
    let dy = b[1]-a[1];
    let l = Math.sqrt(dx*dx+dy*dy);
    let w0 = widths[i];
    let w1 = widths[i+1];
    let nx0 = dx/l*w0;
    let ny0 = dy/l*w0;
    let xx0 = -ny0;
    let yy0 = nx0;
    let nx1 = dx/l*w1;
    let ny1 = dy/l*w1;
    let xx1 = -ny1;
    let yy1 = nx1;

    l0.push([a[0]+xx0,a[1]+yy0]);
    l1.push([a[0]-xx0,a[1]-yy0]);
    l0.push([b[0]+xx1,b[1]+yy1]);
    l1.push([b[0]-xx1,b[1]-yy1]);

  }
  if (join != 'bevel'){
    let j0 = [[]];
    let j1 = [[]];
    for (let i = 1; i < polyline.length-1; i++){
      let a = polyline[i-1];
      let b = polyline[i];
      let c = polyline[i+1];
      
      if (join == 'round'){
        let step = Math.asin((join_resolution/2)/widths[i])*2;
        if (isNaN(step)){
          j1.push([]);
          j0.push([]);
          continue;
        }
        if (cwise(...a,...b,...c)>0){
          let a0 = Math.atan2(b[1]-a[1],b[0]-a[0])-Math.PI/2;
          let a1 = Math.atan2(c[1]-b[1],c[0]-b[0])-Math.PI/2;
          let jj = [];
          let aa = interp_angles(a0,a1,step);
          aa.forEach(a=>{
            let dx = Math.cos(a)*widths[i];
            let dy = Math.sin(a)*widths[i];
            jj.push([b[0]+dx,b[1]+dy]);
          })
          j1.push(jj);
          j0.push([]);

        }else{
          let a0 = Math.atan2(b[1]-a[1],b[0]-a[0])+Math.PI/2;
          let a1 = Math.atan2(c[1]-b[1],c[0]-b[0])+Math.PI/2;
          // console.log(a0,a1);
          let jj = [];
          let aa = interp_angles(a0,a1,step);
          aa.forEach(a=>{
            let dx = Math.cos(a)*widths[i];
            let dy = Math.sin(a)*widths[i];
            jj.push([b[0]+dx,b[1]+dy]);
          })
          j0.push(jj);
          j1.push([]);
        }
      }else{//miter
        if (cwise(...a,...b,...c)>0){
          let a0 = Math.atan2(b[1]-a[1],b[0]-a[0])-Math.PI/2;
          let a1 = Math.atan2(c[1]-b[1],c[0]-b[0])-Math.PI/2;

          let [aa,ab] = bisect_angles(a0,a1);
          let w = widths[i]/Math.cos(ab);
          w = Math.min(widths[i]*miter_limit,w);
          let jj = [[b[0]+w*Math.cos(aa),b[1]+w*Math.sin(aa)]]
          j1.push(jj);
          j0.push([]);

        }else{
          let a0 = Math.atan2(b[1]-a[1],b[0]-a[0])+Math.PI/2;
          let a1 = Math.atan2(c[1]-b[1],c[0]-b[0])+Math.PI/2;
  
          let [aa,ab] = bisect_angles(a0,a1);
          let w = widths[i]/Math.cos(ab);
          w = Math.min(widths[i]*miter_limit,w);
          let jj = [[b[0]+w*Math.cos(aa),b[1]+w*Math.sin(aa)]]
          
          
          j0.push(jj);
          j1.push([]);
        }
      }
    }
    let ll0 = [];
    let ll1 = [];
    for (let i = 0; i < l0.length/2; i++){
      ll0.push(...j0[i]);
      ll1.push(...j1[i]);
      
      ll0.push(l0[i*2]);
      ll0.push(l0[i*2+1]);
      ll1.push(l1[i*2]);
      ll1.push(l1[i*2+1]);

    }
    l0 = ll0;
    l1 = ll1;
  }
  if (cap == 'round'){{
    let jj = [];
    let a = polyline[0];
    let b = polyline[1];
    let a0 = Math.atan2(b[1]-a[1],b[0]-a[0]);
    let a1 = a0 - Math.PI/2*3;
    let a2 = a0 - Math.PI/2;
    let step = Math.asin((join_resolution/2)/widths[0])*2;
    if (!isNaN(step)){
      for (let aa = a1+step; aa <= a2-step; aa+=step){
        let x = a[0] + widths[0]*Math.cos(aa);
        let y = a[1] + widths[0]*Math.sin(aa);
        jj.push([x,y]);
      }
    }
    l1 = jj.concat(l1);
  }{
    let jj = [];
    let a = polyline[polyline.length-2];
    let b = polyline[polyline.length-1];
    let a0 = Math.atan2(b[1]-a[1],b[0]-a[0]);
    let a1 = a0 - Math.PI/2;
    let a2 = a0 + Math.PI/2;
    let step = Math.asin((join_resolution/2)/widths[0])*2;
    if (!isNaN(step)){
      for (let aa = a1+step; aa < a2; aa+=step){
        // console.log(aa);
        let x = b[0] + widths[widths.length-1]*Math.cos(aa);
        let y = b[1] + widths[widths.length-1]*Math.sin(aa);
        jj.push([x,y]);
      }
    }
    l1.push(...jj);
  }}
  
  // console.log(l0,l1)
  l0.reverse();
  let ret = l1.concat(l0);
  return ret;
}



function not_too_close(polyline){
  let out = [];
  for (let i = 0; i < polyline.length; i++){
    let a = polyline[i-1];
    let b = polyline[i];
    if (!a){
      out.push(b);
      continue;
    }
    let dx = b[0]-a[0];
    let dy = b[1]-a[1];
    let d = Math.sqrt(dx*dx+dy*dy);
    if (d > 0.1){
      out.push(b);
    }
  }
  return out;
}


function test_tube(){

  body.appendChild((function(){
    let gui = document.createElement("div");
    gui.innerHTML = `
    <button id="cbtn">Clear</button>
    <input type="checkbox" id="rtcb">
    <label for="rtcb">compute realtime</label>
    <input type="range" min="1" max="100" value="30" class="slider" id="wsl">
    <label for="wsl">weight</label>

    <input type="checkbox" id="olcb">
    <label for="olcb">direct mode</label>
    <br/>
    <select id="hsel">
      <option value="0">no holes</option>
      <option value="1" selected>aggressive</option>
      <option value="2">nonzero</option>
      <option value="3">even-odd</option>
    </select>
    <label for="hsel">hole policy</label>

    <button id="rbtn">Re-compute</button>

    <input type="checkbox" id="vcb">
    <label for="vcb">visualize fill</label>
    `;
    body.appendChild(gui);
    return gui;
  })());
  let rtcb = document.getElementById('rtcb');
  let wsl = document.getElementById('wsl');
  let cbtn = document.getElementById('cbtn');
  let olcb = document.getElementById('olcb');
  let hsel = document.getElementById("hsel");
  let rbtn = document.getElementById("rbtn");
  let vcb = document.getElementById("vcb");

  let canv = document.createElement("canvas");
  let ctx = canv.getContext('2d');
  canv.width = 512;
  canv.height = 512;
  canv.style.border="1px solid black";
  body.appendChild(canv);
  let mouse_is_down = false;

  function get_mouse_xy(e){
    let rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top; 
    return [x,y]
  }
  let polyline  = [];
  let polygons =  [POLYGONS[0]];
  let processed = [unmess.unmess(POLYGONS[0])];

  cbtn.onclick = function(){
    polyline = [];
    polygons = [];
    processed = [];
  }
  rbtn.onclick = function(){
    for (let i = 0; i < polygons.length; i++){
      processed[i] = window._polygon = unmess.unmess(polygons[i],{hole_policy:hsel.value});
    }
  }

  canv.addEventListener('mousedown',function(e){
    let [x,y] = get_mouse_xy(e);
    polyline= [[x,y]];
    polygons.push([]);
    processed.push([]);
    mouse_is_down = true;
  })
  canv.addEventListener('mousemove',function(e){
    if (mouse_is_down){
      let [x,y] = get_mouse_xy(e);
      if (polyline.length){
        let [lx,ly] = polyline[polyline.length-1];
        if (Math.pow(lx-x,2)+Math.pow(ly-y,2) < 100){
          return;
        }
      }
      polyline.push([x,y]);
      if (olcb.checked){
        polygons[polygons.length-1] = polyline.slice();
      }else{
        // polygons[polygons.length-1] = make_tube_v2(polyline,new Array(polyline.length).fill(wsl.value));
        polygons[polygons.length-1] = make_tube(polyline,wsl.value);
      }

    }
  })
  document.body.addEventListener('mouseup',function(e){
    if (mouse_is_down){
      if (olcb.checked){
        polygons[polygons.length-1] = window._polygon = polyline.slice();
      }else{
        polygons[polygons.length-1] = window._polygon = make_tube(polyline,wsl.value);
        // polygons[polygons.length-1] = make_tube_v2(polyline,new Array(polyline.length).fill(wsl.value));
      }
      processed[processed.length-1] = unmess.unmess(polygons[polygons.length-1],{hole_policy:hsel.value});
    }
    // console.log(polygons);
    mouse_is_down = false;
    polyline = [];
  })
  
  
  function loop(){
    requestAnimationFrame(loop);
    ctx.clearRect(0,0,canv.width,canv.height);
    if (rtcb.checked && processed.length){
      processed[processed.length-1] = unmess.unmess(polygons[polygons.length-1],{hole_policy:hsel.value});
    }
    polygons.forEach((polygon)=>{
      ctx.lineCap =  "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle="gray";
      ctx.lineWidth=1
      ctx.beginPath();
      for (let i = 0; i < polygon.length; i++){
        ctx[i?'lineTo':'moveTo'](...polygon[i]);
        // ctx.fillText(i,...polygon[i]);
      }
      ctx.fillStyle="rgba(0,0,0,0.2)";
      ctx.closePath();
      ctx.stroke();
    })

    if (vcb.checked){
      // ctx.globalAlpha = 0.5;
      processed.forEach(P=>{
        for (let i = 0; i < P.length; i++){
          ctx.strokeStyle=i?'white':"red";
          ctx.fillStyle=i?[
            'magenta','orangered','yellow','lime','cyan','blue','rebeccapurple',
            'darkred','brown','goldenrod','green','darkcyan','darkblue','purple'
          ][i%14]:"black";
          ctx.lineWidth=i?2:4;
          ctx.beginPath();
          for (let j = 0; j < P[i].length; j++){
            let [x,y] = P[i][j];
            ctx[j?'lineTo':'moveTo'](x,y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
        }
      })

    }else{
      polygons.forEach((polygon)=>{

        ctx.lineCap =  "round"
        ctx.lineJoin = "round"
        ctx.strokeStyle="gray";
        ctx.lineWidth=1
        ctx.beginPath();
        for (let i = 0; i < polygon.length; i++){
          ctx[i?'lineTo':'moveTo'](...polygon[i]);
          // ctx.fillText(i,...polygon[i]);
        }
        ctx.fillStyle="rgba(0,0,0,0.2)";
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        // ctx.fill(hsel.value==3?"evenodd":"nonzero");
      
      })
      
      processed.forEach(P=>{
        for (let i = 0; i < P.length; i++){
          // `rgba(${~~(Math.random()*255)},${~~(Math.random()*255)},0)`
          ctx.strokeStyle=i?['blue','green','orange'][i%3]:"red";
          ctx.lineWidth=i?2:4;
          ctx.beginPath();
          for (let j = 0; j < P[i].length; j++){
            let [x,y] = P[i][j];
            ctx[j?'lineTo':'moveTo'](x,y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      
      })
    }  

  }

  loop();
}

test_tube();
// test_static();
// for (let i = 0; i < POLYGONS.length; i++){
//   let canv = test_static(POLYGONS[i]);
//   // break;
// }