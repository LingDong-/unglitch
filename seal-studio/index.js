/*global describe UpsampThresh FindContours SVG2PL read_png write_png write_png1 globalThis*/
document.body.style=`overflow:hidden;font-family:sans-serif; background:white;
background-image: url('data:image/svg+xml;charset=utf-8,${escape(`<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5" viewBox="0 0 10 10"><line x1="0" y1="10" x2="10" y2="0" stroke="black" stroke-width="1" /></svg>`)}');
background-size: 4px 4px;`



let div_title = document.createElement("div");
div_title.style="position:absolute; left:0px; top:0px; width:100%; height:30px;background:white;border:1px solid black";
document.body.appendChild(div_title);

let div_edit = document.createElement("div");
div_edit.style="position:absolute; left:10px; top:40px; width: calc(50% - 15px); height: calc(50% - 30px);  border: 1px solid black;background:white";
document.body.appendChild(div_edit);


let div_proc = document.createElement("div");
div_proc.style="position:absolute; left:calc(50% + 5px); top:40px; width: calc(50% - 15px); height: calc(50% - 30px); border: 1px solid black;background:white";
document.body.appendChild(div_proc);


let div_toolpath = document.createElement("div");
div_toolpath.style="position:absolute; left:10px; top:calc(50% + 20px); width: calc(50% - 15px); height: calc(50% - 30px);  border: 1px solid black;background: white";
document.body.appendChild(div_toolpath);


let div_transmit = document.createElement("div");
div_transmit.style="position:absolute; left:calc(50% + 5px); top:calc(50% + 20px); width: calc(50% - 15px); height: calc(50% - 30px); border: 1px solid black;background: white";
document.body.appendChild(div_transmit);


div_title.innerHTML = `
<div style="text-align:center;width:100%;margin-top:6px"><b>CNC SEAL STUDIO</b></div>
<div style="position:absolute;right:10px;top:6px"><input type="checkbox" onchange="document.documentElement.style.filter = this.checked?'invert(90%) sepia(20%) hue-rotate(0deg)':''" ></input>dark mode&nbsp;
<button onclick="alert('An online tool by Lingdong Huang for use with his CNC Chinese seal carver, 2024')">about</button></div>
`

div_edit.innerHTML = `
<div style="position:relative;height:100%">

<div style="position:absolute;left:2px;top:2px;background:white;width:calc(100% - 2px);z-index:1000">
<b>EDITOR</b> <select id="vrsel">
<option selected>raster</option>
<option>vector</option>

</select>
<button id="eul">upload (png/svg)</button><button id="eclr">clear</button><button id="edl">download</button><button id="eg">eg.</button>
</div>

<div id="div-edit-content" style="position:absolute;left:0px;top:24px;width:100%;bottom:0;overflow:hidden;">
</div>

</div>
`


div_proc.innerHTML = `
<div style="position:relative;height:100%">

<div style="position:absolute;left:2px;top:2px;background:white;width:calc(100% - 2px);z-index:1000">
<b>PROCESSOR</b>

size:<input id="dps" value='320,320' size="10"></input>


<button id="dpg">go</button>

</div>

<div id="div-proc-content" style="position:absolute;left:0px;top:24px;width:100%;bottom:0;overflow:hidden;">
</div>

</div>
`


div_toolpath.innerHTML = `
<div style="position:relative;height:100%">

<div style="position:absolute;left:2px;top:2px;background:white;width:calc(100% - 2px);z-index:1000">
<b>TOOLPATH</b>

size:<input id="tps" value='320,320' size="10"></input>

<input id="tpinv" type="checkbox"></input>invert
<input id="tpmir" type="checkbox" checked></input>mirror

<select id="tppvw">
<option>vis</option>
<option>preview</option>
<option>anim</option>
</select>

<button id="tpg">go</button>



</div>

<div id="div-tool-content" style="position:absolute;left:0px;top:24px;width:100%;bottom:0;overflow:hidden;">
</div>

</div>
`


div_transmit.innerHTML = `
<div style="position:relative;height:100%">

<div style="position:absolute;left:2px;top:2px;background:white;width:calc(100% - 2px);z-index:1000">
<b>TRANSMIT</b>

<select id="cntyp">
<option>bluetooth</option>
<option>serial</option>
</select>

</div>

<div id="div-transmit-content" style="position:absolute;left:0px;top:24px;width:100%;bottom:0;overflow:hidden;">
</div>

</div>
`

function get_bbox(points){
  let xmin = Infinity;
  let ymin = Infinity;
  let xmax = -Infinity;
  let ymax = -Infinity
  for (let i = 0;i < points.length; i++){
    let [x,y] = points[i];
    xmin = Math.min(xmin,x);
    ymin = Math.min(ymin,y);
    xmax = Math.max(xmax,x);
    ymax = Math.max(ymax,y);
  }
  return {x:xmin,y:ymin,w:xmax-xmin,h:ymax-ymin};
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
  if (0 <= t && t <= 1 && 0 <= s && s <= 1) {
    let ret = {t, s, side: null, other: null, xy: null};
    ret.xy = [p1x * t + p0x * (1 - t), p1y * t + p0y * (1 - t)];
    ret.side = pt_in_pl(p0x, p0y, p1x, p1y, q0x, q0y) < 0 ? 1 : -1;
    return ret;
  }
  return null;
}
function pt_in_pl(x, y, x0, y0, x1, y1) {
  let dx = x1 - x0;
  let dy = y1 - y0;
  let e = (x - x0) * dy - (y - y0) * dx;
  return e;
}

function dist_transform(b,m,n) {
  // Meijster distance
  // adapted from https://github.com/parmanoir/Meijster-distance
  function EDT_f(x, i, g_i) {
    return (x - i) * (x - i) + g_i * g_i;
  }
  function EDT_Sep(i, u, g_i, g_u) {
    return Math.floor((u * u - i * i + g_u * g_u - g_i * g_i) / (2 * (u - i)));
  }
  // First phase
  let infinity = m + n;
  let g = new Array(m * n).fill(0);
  for (let x = 0; x < m; x++) {
    if (b[x + 0 * m]){
      g[x + 0 * m] = 0;
    }else{
      g[x + 0 * m] = infinity;
    }
    // Scan 1
    for (let y = 1; y < n; y++) {
      if (b[x + y * m]){
        g[x + y * m] = 0;
      }else{
        g[x + y * m] = 1 + g[x + (y - 1) * m];
      }
    }
    // Scan 2
    for (let y = n - 2; y >= 0; y--) {
      if (g[x + (y + 1) * m] < g[x + y * m]){
        g[x + y * m] = 1 + g[x + (y + 1) * m];
      }
    }
  }

  // Second phase
  let dt = new Array(m * n).fill(0);
  let s = new Array(m).fill(0);
  let t = new Array(m).fill(0);
  let q = 0;
  let w;
  for (let y = 0; y < n; y++) {
    q = 0;
    s[0] = 0;
    t[0] = 0;

    // Scan 3
    for (let u = 1; u < m; u++) {
      while (q >= 0 && EDT_f(t[q], s[q], g[s[q] + y * m]) > EDT_f(t[q], u, g[u + y * m])){
        q--;
      }
      if (q < 0) {
        q = 0;
        s[0] = u;
      } else {
        w = 1 + EDT_Sep(s[q], u, g[s[q] + y * m], g[u + y * m]);
        if (w < m) {
          q++;
          s[q] = u;
          t[q] = w;
        }
      }
    }
    // Scan 4
    for (let u = m - 1; u >= 0; u--) {
      let d = EDT_f(u, s[q], g[s[q] + y * m]);

      d = Math.floor(Math.sqrt(d));
      dt[u + y * m] = d;
      if (u == t[q]) q--;
    }
  }
  return dt;
}

var VECEDIT = new function(){
  let that = this;
  
  let W = 3200;
  let H = 3200;
  let gw = 10;
  let polys = [];
  let bbox = {x:0,y:0,w:320,h:320};

  let mouseX;
  let mouseY;

  let bx = 0;
  let by = 0;

  let state = 0;
  let sel = [-1,-1];

  let rdiv = document.createElement("div");
                             

  function render(){
    let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
    
    for (let i = 0; i <= H; i+=gw){
      o += `<line x1="${0}" y1="${i}" x2="${W}" y2="${i}" stroke="gainsboro" />`
    }
    for (let i = 0; i <= W; i+=gw){
      o += `<line x1="${i}" y1="${0}" x2="${i}" y2="${H}" stroke="gainsboro" />`
    }
    o += `<rect x="${bbox.x}" y="${bbox.y}" width="${bbox.w}" height="${bbox.h}" stroke-width="1" stroke="black" fill="none" stroke-dasharray="4 4"/>`
    o += `<circle cx="${bx}" cy="${by}" r="3" stroke="gainsboro" fill="none"/>`
    for (let i = 0; i < polys.length; i++){
      o += `<path d="M `
      for (let j = 0; j < polys[i].length; j++){
        o += polys[i][j]+" ";
      }
      o += `" fill="none" stroke="black"/>`
    }
    if (state == 1){
      o += `<line x1="${polys.at(-1).at(-1)[0]}" y1="${polys.at(-1).at(-1)[1]}" x2="${bx}" y2="${by}" stroke="silver" />`
    }else if (state == 2){
      for (let i = 0; i < polys.length; i++){
        for (let j = 0; j < polys[i].length; j++){
          o += `<circle cx="${polys[i][j][0]}" cy="${polys[i][j][1]}" r="2" />`;
        }
      }
    }else if (state == 4){
      for (let i = 0; i < polys.length; i++){
        for (let j = 0; j < polys[i].length; j++){
          o += `<line x1="${polys[i][j][0]-5}" y1="${polys[i][j][1]-5}" x2="${polys[i][j][0]+5}" y2="${polys[i][j][1]+5}" stroke="black" />`;
          o += `<line x1="${polys[i][j][0]+5}" y1="${polys[i][j][1]-5}" x2="${polys[i][j][0]-5}" y2="${polys[i][j][1]+5}" stroke="black" />`;
        }
      }
    }
    o += `</svg>`
    return o;
  }


  rdiv.innerHTML = render();

  rdiv.addEventListener('mousemove',function(e){

    let box = rdiv.getBoundingClientRect();
    mouseX = e.clientX-box.left;
    mouseY = e.clientY-box.top;

    bx = Math.round(mouseX/gw)*gw;
    by = Math.round(mouseY/gw)*gw;

    if (state == 3){
      polys[sel[0]][sel[1]][0] = bx;
      polys[sel[0]][sel[1]][1] = by;


      for (let i = polys.length-1; i >= 0; i--){
        for (let j = 0; j < polys[i].length; j++){
          let [x,y] = polys[i][j];
          if (x > W){
            polys.splice(i,1);
            sel = [-1,-1];
            state = 2;
            break;
          }
        }
      }
    }

    rdiv.innerHTML = render();
  })

  rdiv.addEventListener('mousedown',function(e){  

    if (state == 0){
      polys.push([[bx,by]]);
      state ++;
    }else if (state == 1){
      if (polys.at(-1).at(-1)[0] == bx && polys.at(-1).at(-1)[1] == by){
        state --;
      }else{
        polys.at(-1).push([bx,by]);
      }
    }else if (state == 2){
      for (let i = 0; i < polys.length; i++){
        for (let j = 0; j < polys[i].length; j++){
          let [x,y] = polys[i][j];
          if (x==bx && y == by){
            state=3;
            sel = [i,j];
            break;
          }
        }
      }
    }else if (state == 4){
      for (let i = polys.length-1; i>=0; i--){
        for (let j = polys[i].length-1; j>=0; j--){
          let [x,y] = polys[i][j];
          if (x==bx && y == by){
            polys[i].splice(j,1);
            if (polys[i].length<=1){
              polys.splice(i,1);
            }
            break;
          }
        }
      }
    }
    rdiv.innerHTML = render();
  })


  rdiv.addEventListener('mouseup',function(e){  
    if (state == 3) state = 2;
  });


  document.addEventListener('keydown',function(e){
    if (e.key == 'Enter'){
      state = 0;
      rdiv.innerHTML = render();
    }
  })

  

  let div = document.createElement("div");
  div.style="position:relative;width:100%;height:100%;left:0px;top:0px";
  div.innerHTML = `
 <div id="rdiv-wrap" style="position:absolute;left:0px;top:0px;bottom:25px;overflow:scroll;width:100%"></div>


  <div style="position:absolute;left:0px;bottom:0px;background:white">
  mode:
  <select id="vms">
  <option>add</option>
  <option>edit</option>
  <option>delete</option>
  </select>
  grid:<input id="vgw" value='${gw}' size="2" ></input>
  
  bbox:<input id="vbe" value='${Object.values(bbox)}' size="16"></input><button id="vbc">fit</button><button id="vbs">↘</button>

  </div>
  `
  document.getElementById("eclr").addEventListener('click',function(){
    polys.splice(0,Infinity);
    rdiv.innerHTML = render();
  });
  
  div.querySelector('#rdiv-wrap').appendChild(rdiv);
  div.querySelector('#vms').onchange = function(){
    if (this.value=='add'){state=0} else if (this.value=='edit'){state=2} else if (this.value=='delete'){state=4}
    rdiv.innerHTML = render();
  }
  div.querySelector('#vbe').onchange = function(){
    let vs = this.value.split(',').map(x=>Number(x));
    bbox.x = vs[0]??0;
    bbox.y = vs[1]??0;
    bbox.w = vs[2]??0;
    bbox.h = vs[3]??0;
    rdiv.innerHTML = render();
  }
  div.querySelector('#vbc').onclick = function(){
    let bb = get_bbox(polys.flat());
    if (bb.x == Infinity || bb.y == Infinity){
      return;
    }
    bb.x -= gw;
    bb.y -= gw;
    bb.w += gw*2;
    bb.h += gw*2;
    Object.assign(bbox,bb);
    div.querySelector('#vbe').value=Object.values(bbox);
    rdiv.innerHTML = render();
  }
  div.querySelector('#vbs').onclick = function(){
    for (let i = 0; i < polys.length; i++){
      for (let j = 0; j < polys[i].length; j++){
        polys[i][j][0] += gw;
        polys[i][j][1] += gw;
      }
    }
    rdiv.innerHTML = render();
  }
  div.querySelector('#vgw').onchange = function(){
    gw = Number(this.value);
  }
  that.div = div;
  that.polys = polys;
  that.bbox = bbox;
  that.render = ()=>{rdiv.innerHTML = render();}
}


var RASEDIT = new function(){
  let that = this;
  let W = 32;
  let H = 32;
  let gw = 10;
  
  let mouseX;
  let mouseY;
  let mouseIsDown;

  let mat = new Array(W*H).fill(0);//.map(x=>~~(Math.random()*2));
  
  function render(){
    let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W*gw}" height="${H*gw}">`
    

    for (let i = 0; i < H; i++){
      for (let j = 0; j < W; j++){
        if (mat[i*W+j]){
          o += `<rect x="${j*gw}" y="${i*gw}" width="${gw}" height="${gw}" fill="dimgray"/>`;
        }
      }
    }
    for (let i = 0; i <= H; i++){
      o += `<line x1="${0}" y1="${i*gw}" x2="${W*gw}" y2="${i*gw}" stroke="black" stroke-width="0.5"/>`
    }
    for (let i = 0; i <= W; i++){
      o += `<line x1="${i*gw}" y1="${0}" x2="${i*gw}" y2="${H*gw}" stroke="black" stroke-width="0.5"/>`
    }
    o += `</svg>`;
    return o;
  }

  let rdiv = document.createElement('div');
  
  rdiv.innerHTML = render();

  let pc = 1;
  
  rdiv.addEventListener('mousemove',function(e){
    let box = rdiv.getBoundingClientRect();
    mouseX = e.clientX-box.left;
    mouseY = e.clientY-box.top;
    if (mouseIsDown){
      let j = ~~(mouseX/gw);
      let i = ~~(mouseY/gw);
      mat[i*W+j] = pc;
    }
    rdiv.innerHTML = render();
  })

  rdiv.addEventListener('mousedown',function(e){  
    mouseIsDown = true;
    let box = rdiv.getBoundingClientRect();
    mouseX = e.clientX-box.left;
    mouseY = e.clientY-box.top;

    let j = ~~(mouseX/gw);
    let i = ~~(mouseY/gw);
    mat[i*W+j] = (pc = 1-mat[i*W+j]);
    
    rdiv.innerHTML = render();
  })


  rdiv.addEventListener('mouseup',function(e){  
    mouseIsDown = false;
    rdiv.innerHTML = render();
  });

  

  let div = document.createElement("div");
  div.style="position:relative;width:100%;height:100%;left:0px;top:0px";
  div.innerHTML = `
  <div id="rsiv-wrap" style="position:absolute;left:0px;top:0px;bottom:25px;overflow:scroll;width:100%"></div>
  <div style="position:absolute;left:0px;bottom:0px;background:white">
  size:<input id="rsw" value='${W},${H}' size="6" ></input>
  <button id="rsf">fit</button>
  anchor:<select id="rsa">
  <option>UR</option>
  <option>UL</option>
  <option>LL</option>
  <option>LR</option>
  </select>
  </div>
  `
  document.getElementById("eclr").addEventListener('click',function(){
    for (let i = 0; i < mat.length; i++){
      mat[i] = 0;
    }
    rdiv.innerHTML = render();
  });
  div.querySelector('#rsiv-wrap').appendChild(rdiv);
  div.querySelector('#rsw').onchange = function(){
    let ow = W;
    let oh = H;
    
    ;[W,H] = this.value.split(',').map(x=>Number(x));
    
    let nm = new Array(W*H).fill(0);
    let rsa = div.querySelector('#rsa');
    
    for (let i = 0; i < oh; i++){
      for (let j = 0; j < ow; j++){
        let x,y;
        if (rsa.value == 'UL'){
          x = j;
          y = i;
        }else if (rsa.value == 'UR'){
          x = j + (W-ow);
          y = i;
        }else if (rsa.value == 'LL'){
          x = j;
          y = i + (H-oh);
        }else if (rsa.value == 'LR'){
          x = j + (W-ow);
          y = i + (H-oh);
        }
        if (x < W && y < H && x >= 0 && y >= 0){
          nm[y*W+x] = mat[i*ow+j];
        }
      }
    }
    mat.splice(0,Infinity);
    for (let i = 0; i < nm.length; i++){
      mat.push(nm[i])
    }
    
    rdiv.innerHTML = render();
  }
  div.querySelector('#rsf').onclick = function(){
    let mx = W;
    let my = H;
    let Mx = 0;
    let My = 0;
    for (let i = 0; i < H; i++){
      for (let j = 0; j < W; j++){
        if (mat[i*W+j]){
          mx = Math.min(j,mx);
          my = Math.min(i,my);
          Mx = Math.max(j+1,Mx);
          My = Math.max(i+1,My);
        }
      }
    }
    if (Mx-mx == 0 || My-my == 0){
      return;
    }
    mx--;my--;Mx++;My++;
    
    let nw = Mx-mx;
    let nh = My-my;
    let nm = new Array(nw*nh).fill(0);
    
    for (let i = 0; i < nh; i++){
      for (let j = 0; j < nw; j++){
        let x = j + mx;
        let y = i + my;
        nm[i*nw+j] = mat[y*W+x]??0;

      }
    }
    mat.splice(0,Infinity);
    for (let i = 0; i < nm.length; i++){
      mat.push(nm[i])
    }
    W = nw;
    H = nh;
    div.querySelector('#rsw').value=W+','+H;
    rdiv.innerHTML = render();
  }
  that.div = div;
  
  that.mat = mat;
  that.w = (x)=>{
    if (!x){
      return W;
    }else{
      W = x;
      div.querySelector('#rsw').value=W+','+H;
    }
  };
  that.h = (x)=>{
    if (!x){
      return H;
    }else{
      H = x;
      div.querySelector('#rsw').value=W+','+H;
    }
  };
  that.render = ()=>{rdiv.innerHTML = render();}
}


var PHYPROC = new function(){
  let that = this;
  let [W,H] = document.getElementById('dps').value.split(',').map(x=>Number(x));
  
  
  function make_graph(polys){
    let nodes = {};

    function add_edge(a,b){
      if (!nodes[a]){
        nodes[a] = {xy:a.split(',').map(x=>parseFloat(x)),ns:[]}
      }
      if (a==b){
        return;
      }
      nodes[a].ns.push(b);
    }

    for (let i = 0; i < polys.length; i++){
      for (let j = 0; j < polys[i].length; j++){
        let [x,y] = polys[i][j];
        let id = `${x},${y}`;

        if (j < polys[i].length-1){
          let [x1,y1] = polys[i][j+1];
          let isects = [];
          for (let i1 = 0; i1 < polys.length; i1++){
            for (let j1 = 0; j1 < polys[i1].length-1; j1++){
              let ret = seg_isect(x,y,x1,y1,...polys[i1][j1],...polys[i1][j1+1]);
              if (ret){
                isects.push(ret);
              }

            }
          }
          isects.sort((a,b)=>(a.t-b.t));
          let a = id;
          for (let i = 0; i < isects.length; i++){
            let b = `${isects[i].xy[0]},${isects[i].xy[1]}`;
            add_edge(a,b);
            add_edge(b,a);
            a = b;
          }
          add_edge(a,`${x1},${y1}`);
          add_edge(`${x1},${y1}`,a)

        }

      }
    }
    for (let k in nodes){
      nodes[k].ns = Array.from(new Set(nodes[k].ns));
    }
    return nodes;
  }
  function render(nodes){
    let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
    o += `<rect x="${0}" y="${0}" width="${W}" height="${H}" stroke-width="1" stroke="silver" fill="none" stroke-dasharray="1 1"/>`
    for (let k in nodes){
      let {ns,xy} = nodes[k];
      let [x0,y0] = xy;

      for (let i = 0; i < ns.length; i++){
        let [x1,y1] = nodes[ns[i]].xy;
        o += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="black" stroke-width="0.5"/>`
      }
    }

    o += `</svg>`
    return o;
  }

  
  let nodes;

  let params = {
    SPL_DIST : 4,
    SEP_DIST : 10,
    COH_DIST : 1,
    SEP_COEF : 8,
    COH_COEF : 1,
    WAL_COEF : 100,
    GRD_COEF : 0,
    WAL_POWR : 2,
    SEP_POWR : 2,
    RESAMP : 5,
    JIGGLE : 0.1,
    GRD_SIZE : 10,
    MAX_FORCE: 4,
    MAX_ITERS:-1,
  }
  let div = document.createElement("div");
  div.innerHTML = `
    <div id="ppo" style="position:absolute;overflow:scroll;width:100%;height:100%"></div>
    
    <div style="position:absolute;right:10px;text-align:right">
    ${Object.keys(params).map(x=>`<div style="text-align:right;font-size:11px">${x}:<input id="dp_${x}" style="font-size:11px" size="4" value="${params[x]}"></input></div>`).join('')}
    <button id="ppk" style="">kill</button>
    </div>
    
    
    
  
  `
  for (let k in params){
    div.querySelector('#dp_'+k).onchange = function(){
      params[k] = Number(div.querySelector('#dp_'+k).value);
    }
  }
  let worker = null;
  
  div.querySelector('#ppk').onclick = function(){
    if (worker){
      worker.terminate();
    }
  }
  
  that.go = function(polys,w0,h0){
    if (worker){
      worker.terminate();
    }
    worker = new Worker("phyworker.js");
    nodes = make_graph(polys);
    
    for (let k in params){
      worker.postMessage(['set',[k,Number(params[k])]]);
    }
    ;[W,H] = document.getElementById('dps').value.split(',').map(x=>Number(x));
    
    worker.postMessage(['set',['BBOX_X',0]]);
    worker.postMessage(['set',['BBOX_Y',0]]);
    worker.postMessage(['set',['BBOX_W',W]]);
    worker.postMessage(['set',['BBOX_H',H]]);
    worker.postMessage(['set',['SCALE_X',W/w0]]);
    worker.postMessage(['set',['SCALE_Y',H/h0]]);

    worker.postMessage(['init',nodes]);
    
    let iters = 0;
    worker.onmessage = e=>{
      nodes = e.data;
      div.querySelector('#ppo').innerHTML = render(nodes);
      
      if (iters < params.MAX_ITERS || params.MAX_ITERS==-1){
        worker.postMessage(['step',nodes]);
        iters++;
      }
      
    }

    
  }
  
  that.nodes = ()=>nodes;
  that.w = ()=>W;
  that.h = ()=>H;
  that.div = div;
  
}



var USTPROC = new function(){
  let that = this;
  let [W,H] = document.getElementById('dps').value.split(',').map(x=>Number(x));
  
  let params = {
    METHOD: 4,
    THRESH: 0.5,
  }
  
  let div = document.createElement("div");
  div.innerHTML = `
    <div id="upo" style="position:absolute;overflow:scroll;width:100%;height:100%"></div>
    
 
    </div>
    
    <div style="position:absolute;right:10px;text-align:right">
    ${Object.keys(params).map(x=>`<div style="text-align:right;font-size:11px">${x}:<input id="pp_${x}" style="font-size:11px" size="4" value="${params[x]}"></input></div>`).join('')}

    </div>
  
  
  `
  for (let k in params){
    div.querySelector('#pp_'+k).onchange = function(){
      params[k] = Number(div.querySelector('#pp_'+k).value);
    }
  }

  let G,Wp,Hp,sclx,scly,contours;
  that.div = div;
  that.go = function(mat,w0,h0){
    ;[W,H] = document.getElementById('dps').value.split(',').map(x=>Number(x));
    
    let w0p = 4;
    let h0p = 4;
    while (w0p < w0 || h0p < h0){
      w0p*=2;
      h0p*=2;
    }
    Wp = 4;
    Hp = 4;
    while (Wp < W || Hp < H){
      Wp*=2;
      Hp*=2;
    }


    sclx = (Wp/W)/(w0p/w0);
    scly = (Hp/H)/(h0p/h0);
    
    // console.log(',',sclx,scly,Wp/W,Hp/H,w0p/w0,h0p/h0);
    // sclx = 1;
    // scly = 1;
    
    let cn0 = document.createElement("canvas");
    cn0.width=w0p;
    cn0.height=h0p;

    let cn1 = document.createElement("canvas");
    cn1.width=Wp;
    cn1.height=Hp;
    
    // div.querySelector('#upo').appendChild(cn0);
    // div.querySelector('#upo').appendChild(cn1);
    
    let imd = cn0.getContext('2d').getImageData(0,0,w0,h0);
    for (let i = 0; i < h0; i++){
      for (let j = 0; j < w0; j++){
        imd.data[(i*w0+j)*4] = imd.data[(i*w0+j)*4+1] = imd.data[(i*w0+j)*4+2] = (mat[i*w0+j]?255:0);
        imd.data[(i*w0+j)*4+3] = 255;
      }
    }
    cn0.getContext('2d').putImageData(imd,0,0);

    let ut = new UpsampThresh(cn0,Wp,Hp);
    
    ut.process(params.METHOD,params.THRESH);
    ut.readout(cn1);
    
    let F = [];
    imd = cn1.getContext('2d').getImageData(0,0,Wp,Hp);
    for (let i = 0; i < Hp; i++){
      for (let j = 0; j < Wp; j++){
        F.push(imd.data[(i*Wp+j)*4]>127?1:0);
      }
    }
    G = F.map(x=>1-x);
    contours = FindContours.findContours(F,Wp,Hp);
    
    for (let i = 0; i < contours.length; i++){
      for (let j = 0; j < contours[i].points.length; j++){
        contours[i].points[j][0]/=sclx;
        contours[i].points[j][1]/=scly;
      }
    }
    
    function render(){
      let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
      o += `<path d=" `
      for (let i = 0; i < contours.length; i++){
        o += " M "
        let ps = FindContours.approxPolyDP(contours[i].points,0.5);
        for (let j = 0; j < ps.length; j++){
          o += (ps[j][0])+" "+(ps[j][1])+" ";
        }
        o += " z "
      }
      o += `" stroke="black" fill="silver"/>`
      o += `</svg>`
      return o;
    }    
    
    
    div.querySelector('#upo').innerHTML = render();
    
  }
  
  that.contours = ()=>contours;
  that.w = ()=>W;
  that.h = ()=>H;
  
}


function tp_render(W,H,contours,traces){
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
  o += `<path d=" `
  for (let i = 0; i < contours.length; i++){
    o += " M "
    let ps = FindContours.approxPolyDP(contours[i].points,0.5);
    for (let j = 0; j < ps.length; j++){
      o += (ps[j][0])+" "+(ps[j][1])+" ";
    }
    o += " z "
  }
  o += `" stroke="black" fill="silver" stroke-dasharray="1 1"/>`
  o += `<path d=" `
  for (let i = 0; i < traces.length; i++){
    o += " M "
    for (let j = 0; j < traces[i].length; j++){
      o += (traces[i][j][0])+" "+(traces[i][j][1])+" ";
    }
  }
  o += `" stroke="black" fill="none"/>`
  o += `</svg>`
  return o;
}


function tp_preview(W,H,traces,diam){
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
  o += `<rect x="${0}" y="${0}" width="${W}" height="${H}" fill="tomato"/>`

  o += `<path d=" `
  for (let i = 0; i < traces.length; i++){
    o += " M "
    for (let j = 0; j < traces[i].length; j++){
      o += (W-traces[i][j][0])+" "+(traces[i][j][1])+" ";
    }
  }
  o += `" stroke="white" fill="none" stroke-width="${diam}" stroke-linecap="round" stroke-linejoin="round"/>`
  o += `</svg>`
  return o;
}



function tp_preview_anim(W,H,polylines,diam){
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  o += `<rect x="0" y="0" width="${W}" height="${H}" fill="gray"/>`
  let lengths = [];
  let acc_lengths = [];
  let total_l = 0;
  let speed = 0.001;
  for (let i = 0; i < polylines.length; i++){
    let l = 0;
    for (let j = 1; j < polylines[i].length; j++){
      l += Math.hypot(
        polylines[i][j-1][0]-polylines[i][j][0],
        polylines[i][j-1][1]-polylines[i][j][1]
      );
    }
    lengths.push(l);
    acc_lengths.push(total_l);
    total_l+=l;
  }
  for (let i = 0; i < polylines.length; i++){
    let l = lengths[i];
    o += `
    <path 
      stroke="white" 
      stroke-width="${diam}" 
      fill="none" 
      stroke-dasharray="${l}"
      stroke-dashoffset="${l}"
      d="M`;
    for (let j = 0; j < polylines[i].length; j++){
      let [x,y] = polylines[i][j].slice(0,2);
      o += [x,y] + ' ';
    }
    let t = speed*l;
    o += `">
    <animate id="a${i}"
      attributeName="stroke-dashoffset" 
      fill="freeze"
      from="${l}" to="${0}" dur="${t}s" 
      begin="${(acc_lengths[i])*speed}s"/>
    />
    </path>`;
  }
  
  
  for (let i = 0; i < polylines.length; i++){
    let l = lengths[i];
    o += `
    <path 
      stroke="black" 
      stroke-width="1" 
      fill="none" 
      stroke-dasharray="${l}"
      stroke-dashoffset="${l}"
      d="M`;
    for (let j = 0; j < polylines[i].length; j++){
      let [x,y] = polylines[i][j].slice(0,2);
      o += [x,y] + ' ';
    }
    let t = speed*l;
    o += `">
    <animate id="c${i}"
      attributeName="stroke-dashoffset" 
      fill="freeze"
      from="${l}" to="${0}" dur="${t}s" 
      begin="${(acc_lengths[i])*speed}s"/>
    />
    </path>`;
  }
  o += `</svg>`;
  return o;
}


var VECTOOL = new function(){
  let that = this;
  let [W,H] = document.getElementById('tps').value.split(',').map(x=>Number(x));
  
  let params = {
    SINGLE_ITERS: 1,
    SINGLE_MAX_DEPTH: 16,
    INV_TOOL_DIAM : 8,
    INV_TOOL_DEG : 20,
    INV_THICK : 5,
    INV_MAX_ITERS: 10,
    INV_EPSILON: 1,
  }
  let div = document.createElement("div");
  div.innerHTML = `
    <div id="tpo" style="position:absolute;overflow:scroll;width:100%;height:100%"></div>
    
    <div style="position:absolute;right:10px;text-align:right">
    ${Object.keys(params).map(x=>`<div style="text-align:right;font-size:11px">${x}:<input id="tp_${x}" style="font-size:11px" size="4" value="${params[x]}"></input></div>`).join('')}
    </div>
  `;
  
  for (let k in params){
    div.querySelector('#tp_'+k).onchange = function(){
      params[k] = Number(div.querySelector('#tp_'+k).value);
    }
  }

  
  function nodes_to_polys(nodes){
    let visited = {};
    let polys = [];
    for (let k in nodes){
      if (visited[k]) continue;
      if (nodes[k].ns.length == 2){
        visited[k] = 1;
        let poly = [nodes[k].xy];
        let [a,b] = nodes[k].ns;
        let c = k;
        while (1){

          poly.unshift(nodes[a].xy);
          if (visited[a]) break;
          visited[a] = 1;
          if (nodes[a].ns.length != 2){
            break;
          }
          let q = Number(nodes[a].ns[0] == c);
          c = a;
          a = nodes[a].ns[q];
        }
        c = k;
        while (1){
          poly.push(nodes[b].xy);
          if (visited[b]) break;
          visited[b] = 1;
          if (nodes[b].ns.length != 2){
            break;
          }
          let q = Number(nodes[b].ns[0] == c);
          c = b;
          b = nodes[b].ns[q];
        }
        polys.push(poly);

      }
    }
    return polys;
  }
  
  let traces = [];
  
  that.go = function(nodes,w0,h0){
    let polys = JSON.parse(JSON.stringify(nodes_to_polys(nodes)));
    let tpinv = document.getElementById("tpinv").checked;
    let tpmir = document.getElementById("tpmir").checked;
    let tppvw = document.getElementById("tppvw").value;
    
    ;[W,H] = document.getElementById('tps').value.split(',').map(x=>Number(x));
    
    if (tpmir){
      for (let i = 0; i < polys.length; i++){
        for (let j = 0; j < polys[i].length; j++){
          polys[i][j][0] = (w0-polys[i][j][0])*W/w0;
          polys[i][j][1] = (polys[i][j][1])*H/h0;
        }
      }
    }
    if (tpinv){
      let cnv = document.createElement('canvas');
      cnv.width = W;
      cnv.height = H;
      let ctx = cnv.getContext('2d');
      ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="white";
      ctx.lineWidth = params.INV_THICK;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < polys.length; i++){
        ctx.beginPath();
        for (let j = 0; j < polys[i].length; j++){
          let [x,y] = polys[i][j];
          ctx[j?'lineTo':'moveTo'](x,y);
        }
        ctx.stroke();
      }
      div.querySelector('#tpo').appendChild(cnv);
      let F = [];
      
      let imd = cnv.getContext('2d').getImageData(0,0,W,H);
      for (let i = 0; i < H; i++){
        for (let j = 0; j < W; j++){
          F.push(imd.data[(i*W+j)*4]>127?0:1);
        }
      }
      
      let G = F.map(x=>(1-x));
      let contours = FindContours.findContours(F,W,H);
      traces.splice(0,Infinity)

      let DT = dist_transform(G,W,H);
      
      for (let i = 0; i < H; i++){
        for (let j = 0; j < W; j++){
          imd.data[(i*W+j)*4] = imd.data[(i*W+j)*4+1] = imd.data[(i*W+j)*4+2] = DT[i*W+j]*100
          imd.data[(i*W+j)*4+3] = 255;
        }
      }
      ctx.putImageData(imd,0,0);
      
      
      let d = params.INV_TOOL_DIAM/2;

      let z = (params.INV_TOOL_DIAM/2)/Math.tan(params.INV_TOOL_DEG/2*Math.PI/180);
      for (let k = 0; k < params.INV_MAX_ITERS; k++){
        let Q = DT.map(x=>(x>d?1:0));
        let cs = FindContours.findContours(Q,W,H);
        for (let i = 0; i < cs.length; i++){
          let ts = [];
          let ps = FindContours.approxPolyDP(cs[i].points,params.INV_EPSILON);
          for (let j = 0; j < ps.length; j++){
            let x = ps[j][0];
            let y = ps[j][1];
            ts.push([x,y,z]);
          }
          if (ts.length <= 1) continue;
          if (ts.length == 2 && ts[0][0] == ts[1][0] && ts[0][1] == ts[1][1]) continue;
          traces.push(ts);
        }
        d += params.INV_TOOL_DIAM/2;
      }
      if (tppvw == 'vis'){
        div.querySelector('#tpo').innerHTML = tp_render(W,H,contours,traces);
      }else if (tppvw == 'preview'){
        div.querySelector('#tpo').innerHTML = tp_preview(W,H,traces,params.INV_TOOL_DIAM)
      }else if (tppvw == 'anim'){
        div.querySelector('#tpo').innerHTML = tp_preview_anim(W,H,traces,params.INV_TOOL_DIAM)
      }
      
      
    }else{
      traces.splice(0,Infinity)
      let z = params.SINGLE_MAX_DEPTH/params.SINGLE_ITERS;
      for (let i = 0; i < params.SINGLE_ITERS; i++){
        for (let j = 0; j < polys.length; j++){
          traces.push(polys[j].map(([x,y])=>([x,y,z])))
        }
        z += params.SINGLE_MAX_DEPTH/params.SINGLE_ITERS;
      }
      let sw = (z*Math.tan(params.INV_TOOL_DEG/2*Math.PI/180))*2;

      function render(){
        let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
        o += `<path d=" `
        for (let i = 0; i < traces.length; i++){
          o += " M "
          for (let j = 0; j < traces[i].length; j++){
            o += (traces[i][j][0])+" "+(traces[i][j][1])+" ";
          }
        }
        o += `" stroke="silver" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
        o += `<path d=" `
        for (let i = 0; i < traces.length; i++){
          o += " M "
          for (let j = 0; j < traces[i].length; j++){
            o += (traces[i][j][0])+" "+(traces[i][j][1])+" ";
          }
        }
        o += `" stroke="black" fill="none"/>`
        o += `</svg>`
        return o;
      }

      if (tppvw == 'vis'){
        div.querySelector('#tpo').innerHTML = render();
      }else if (tppvw == 'preview'){
        div.querySelector('#tpo').innerHTML = tp_preview(W,H,traces,params.INV_TOOL_DIAM)
      }else if (tppvw == 'anim'){
        div.querySelector('#tpo').innerHTML = tp_preview_anim(W,H,traces,params.INV_TOOL_DIAM)
      }
      
      
      
      
    }
    
    
  }
  
  
  that.div = div;
  that.traces = traces;
  
}


var RASTOOL = new function(){
  let that = this;
  let [W,H] = document.getElementById('tps').value.split(',').map(x=>Number(x));
  
  let params = {
    TOOL_DIAM : 8,
    TOOL_DEG : 20,
    MAX_ITERS: 10,
    EPSILON: 1,
  }
  let div = document.createElement("div");
  div.innerHTML = `
    <div id="tpo" style="position:absolute;overflow:scroll;width:100%;height:100%"></div>
    
    <div style="position:absolute;right:10px;text-align:right">
    ${Object.keys(params).map(x=>`<div style="text-align:right;font-size:11px">${x}:<input id="tr_${x}" style="font-size:11px" size="4" value="${params[x]}"></input></div>`).join('')}
    </div>
  `;
  
  for (let k in params){
    div.querySelector('#tr_'+k).onchange = function(){
      params[k] = Number(div.querySelector('#tr_'+k).value);
    }
  }
  
  let traces = [];
  
  that.go = function(contours,W0,H0){
    contours = JSON.parse(JSON.stringify(contours));
    traces.splice(0,Infinity);
    
    ;[W,H] = document.getElementById('tps').value.split(',').map(x=>Number(x));
    
    let tpinv = document.getElementById("tpinv").checked;
    let tpmir = document.getElementById("tpmir").checked;
    let tppvw = document.getElementById("tppvw").value;
    
    
    let sclx = W/W0;
    let scly = H/H0
    
    for (let i = 0; i < contours.length; i++){
      for (let j = 0; j < contours[i].points.length; j++){
        contours[i].points[j][0]*=sclx;
        contours[i].points[j][1]*=scly;
        if (tpmir) contours[i].points[j][0] = W-contours[i].points[j][0];
      }
    }
    let cnv = document.createElement('canvas');
    cnv.width = W;
    cnv.height = H;
    let ctx = cnv.getContext('2d');
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle="white";
    
    ctx.beginPath();
    for (let i = 0; i < contours.length; i++){
      
      for (let j = 0; j < contours[i].points.length; j++){
        let [x,y] = contours[i].points[j];
        ctx[j?'lineTo':'moveTo'](x,y);
      }
      
    }
    
    ctx.fill();
    
    let F = [];

    let imd = cnv.getContext('2d').getImageData(0,0,W,H);
    for (let i = 0; i < H; i++){
      for (let j = 0; j < W; j++){
        F.push(imd.data[(i*W+j)*4]>127?0:1);
      }
    }
    
    if (!tpinv) F = F.map(x=>(1-x));

    contours = FindContours.findContours(F,W,H);
    
    let G = F.map(x=>(1-x));

    let DT = dist_transform(G,W,H);
    let d = params.TOOL_DIAM/2;
    let z = (params.TOOL_DIAM/2)/Math.tan(params.TOOL_DEG/2*Math.PI/180);
    for (let k = 0; k < params.MAX_ITERS; k++){
      
      let Q = DT.map(x=>(x>d));
      let cs = FindContours.findContours(Q,W,H);
      for (let i = 0; i < cs.length; i++){
        let ts = [];
        let ps = FindContours.approxPolyDP(cs[i].points,params.EPSILON);
        for (let j = 0; j < ps.length; j++){
          let x = ps[j][0];
          let y = ps[j][1];
          ts.push([x,y,z]);

        }
        if (ts.length <= 1) continue;
        if (ts.length == 2 && ts[0][0] == ts[1][0] && ts[0][1] == ts[1][1]) continue;
        traces.push(ts);

      }
      d += params.TOOL_DIAM/2;
    }

    if (tppvw == 'vis'){
      div.querySelector('#tpo').innerHTML = tp_render(W,H,contours,traces);
    }else if (tppvw == 'preview'){
      div.querySelector('#tpo').innerHTML = tp_preview(W,H,traces,params.TOOL_DIAM)
    }else if (tppvw == 'anim'){
      div.querySelector('#tpo').innerHTML = tp_preview_anim(W,H,traces,params.TOOL_DIAM)
    }
      
    
  }
  that.div = div;
  that.traces = traces;
  
  
}


function connector(params, connect, disconnect, send){
  return new function(){
    let that = this;
    
    let div = document.createElement("div");
    div.innerHTML = `
    <div style="position:absolute;width:100%;height:100%;overflow:scroll">
    <div style="position:absolute;left:2px;width:calc(100% - 150px);height:100%">
    ${Object.keys(params).map(x=>`<div style="height:20px;text-align:right;font-size:11px">${x}:<input id="tr_${x}" style="font-size:11px;width:calc(100% - 150px)" value="${params[x]}"></input></div>`).join('')}
    
    <textarea id="tb_ta" style="width:100%;height:calc(100% - ${Object.keys(params).length*20+100}px);min-height:50px"></textarea>
    <button id="tb_gen" style="width:100%">generate</button>
    clearing size:<input size="10" value="400,400" id="tb_cs"></input>stride:<input id="tb_cd" size="4" value="10"> <button id="tb_clr">generate</button><br>
    <div id="tb_stat"></div>
    
    </div>
    <div style="position:absolute;right:10px;top:0px;">
      <button id="tb_c" style="width:120px">connect</button><br>
      <button id="tb_dc" style="width:120px">disconnect</button><br>
      <button id="tb_xm" style="width:60px">X-</button><button id="tb_xp" style="width:60px">X+</button><br>
      <button id="tb_ym" style="width:60px">Y-</button><button id="tb_yp" style="width:60px">Y+</button><br>
      <button id="tb_zm" style="width:60px">Z-</button><button id="tb_zp" style="width:60px">Z+</button><br>
      <button id="tb_xmm" style="width:60px">X-10</button><button id="tb_xpp" style="width:60px">X+10</button><br>
      <button id="tb_ymm" style="width:60px">Y-10</button><button id="tb_ypp" style="width:60px">Y+10</button><br>
      <button id="tb_zmm" style="width:60px">Z-10</button><button id="tb_zpp" style="width:60px">Z+10</button><br>
      <button id="tb_s" style="width:120px">send</button><br>
      <button id="tb_x" style="width:120px">stop</button><br>
      <input id="tb_p" type="checkbox"></input>pause<br>
    </div>
    </div>
    `;
    
    async function wsend(i,n,s){
      div.querySelector("#tb_stat").innerHTML = `[${i}/${n}] sending '${s}' ...`;
      await send(s);
      div.querySelector("#tb_stat").innerHTML = `[${i}/${n}] sent.`;
    }
    
    div.querySelector("#tb_c").onclick = async function(){
      await connect(params);
    };
    div.querySelector("#tb_dc").onclick = async function(){
      await disconnect(params);
    };
    let abort = 0;
    div.querySelector("#tb_s").onclick = async function(){
      abort = 0;
      let lines = div.querySelector("#tb_ta").value.split('\n').map(x=>x.trim()).filter(x=>x.length);
      for (let i = 0; i < lines.length; i++){
        if (abort) break;
        while ( div.querySelector("#tb_p").checked){
          await new Promise(resolve => setTimeout(resolve, 100)); 
        }
        await wsend(i+1,lines.length,lines[i]);
      }
      div.querySelector("#tb_stat").innerHTML = `done.`;
    };
    div.querySelector("#tb_x").onclick = function(){
      abort = 1;
    };
    
    div.querySelector("#tb_gen").onclick = async function(){
      let traces;
      if (document.getElementById("vrsel").value == 'vector'){
        traces = VECTOOL.traces;
      }else{
        traces = RASTOOL.traces;
      }
      let o = [];
      let lx = 0;
      let ly = 0;
      let lz = 0;
      let flyz = 50;
      function goto(x,y,z){
        y = -y;
        let dx = x-lx;
        let dy = y-ly;
        let dz = z-lz;
        o.push(`l${~~dx},${~~dy},${~~dz}`);
        lx += ~~dx;
        ly += ~~dy;
        lz += ~~dz;
      }
      for (let i = 0; i < traces.length; i++){
        goto(traces[i][0][0],traces[i][0][1],flyz);
        for (let j = 0; j < traces[i].length; j++){
          goto(traces[i][j][0],traces[i][j][1],-traces[i][j][2]);
        }
        goto(traces[i].at(-1)[0],traces[i].at(-1)[1],flyz);
      }
      
      div.querySelector("#tb_ta").value = o.join('\n');
    };
    
    div.querySelector("#tb_clr").onclick = async function(){
      let [W,H] = div.querySelector("#tb_cs").value.split(',').map(x=>Number(x));
      let l = Number(div.querySelector("#tb_cd").value);
      let o = '';
      for (let i = 0; i < W; i+=l*2){
        o += `l${0},${-H},${0}\n`;
        o += `l${l},${0},${0}\n`;
        o += `l${0},${H},${0}\n`;
        o += `l${l},${0},${0}\n`;
      }
      div.querySelector("#tb_ta").value = o;
    }
    
    div.querySelector("#tb_xm" ).onclick = function(){wsend(1,1,"l-1,0,0")};
    div.querySelector("#tb_xp" ).onclick = function(){wsend(1,1,"l1,0,0")};
    div.querySelector("#tb_ym" ).onclick = function(){wsend(1,1,"l0,-1,0")};
    div.querySelector("#tb_yp" ).onclick = function(){wsend(1,1,"l0,1,0")};
    div.querySelector("#tb_zm" ).onclick = function(){wsend(1,1,"l0,0,-1")};
    div.querySelector("#tb_zp" ).onclick = function(){wsend(1,1,"l0,0,1")};
    div.querySelector("#tb_xmm").onclick = function(){wsend(1,1,"l-10,0,0")};
    div.querySelector("#tb_xpp").onclick = function(){wsend(1,1,"l10,0,0")};
    div.querySelector("#tb_ymm").onclick = function(){wsend(1,1,"l0,-10,0")};
    div.querySelector("#tb_ypp").onclick = function(){wsend(1,1,"l0,10,0")};
    div.querySelector("#tb_zmm").onclick = function(){wsend(1,1,"l0,0,-10")};
    div.querySelector("#tb_zpp").onclick = function(){wsend(1,1,"l0,0,10")};
    
    
    that.div = div;
  }
}





let vrsel = document.getElementById("vrsel");

document.getElementById("eg").onclick = function(){

  if (vrsel.value == 'vector'){
    VECEDIT.polys.push(...[[[80,20],[140,20]],[[100,10],[100,30],[120,30],[120,10]],[[90,30],[80,30]],[[130,30],[140,30]],[[80,40],[140,40],[140,60],[80,60],[80,40]],[[80,50],[140,50]],[[110,30],[110,60]],[[80,70],[100,70],[100,60]],[[120,60],[120,70],[140,70]],[[80,90],[110,80],[140,90]],[[100,90],[120,90]],[[80,100],[140,100],[140,110],[80,110],[80,120],[140,120]],[[110,100],[110,110]],[[70,20],[10,20]],[[10,20],[10,10]],[[70,10],[70,20]],[[40,10],[40,70]],[[10,30],[70,30],[70,50],[10,50],[10,30]],[[10,40],[70,40]],[[10,70],[10,60],[70,60],[70,70]],[[70,80],[10,80],[10,90]],[[10,100],[70,100],[70,110],[10,110],[10,120],[70,120]],[[40,100],[40,110]],[[20,80],[30,90],[40,90]],[[50,80],[60,90],[70,90]]])
    VECEDIT.render();
    document.getElementById("vbc").onclick();
    document.getElementById("dps").value="100,100";
    document.getElementById("dp_MAX_ITERS").value=5;
    document.getElementById("dp_MAX_ITERS").onchange();
  }else{
    [
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,1,0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,1,0,1,0,1,1,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,1,0,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,0,0,0,0,0,1,0,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
    ].map((x,i)=>RASEDIT.mat.splice(i,1,x));
    RASEDIT.w(21);
    RASEDIT.h(24);
    RASEDIT.render();
    document.getElementById("dps").value="320,320";
    
  }
  
}

vrsel.onchange = function(){
  if (document.getElementById("ppk")) document.getElementById("ppk").onclick();
  
  document.getElementById("div-edit-content").innerHTML = "";
  document.getElementById("div-proc-content").innerHTML = "";
  document.getElementById("div-tool-content").innerHTML = "";
  
  if (vrsel.value == 'vector'){
  
    document.getElementById("div-edit-content").appendChild(VECEDIT.div);
    document.getElementById("div-proc-content").appendChild(PHYPROC.div);
    document.getElementById("div-tool-content").appendChild(VECTOOL.div);
  }else{
    
    document.getElementById("div-edit-content").appendChild(RASEDIT.div);
    document.getElementById("div-proc-content").appendChild(USTPROC.div);
    document.getElementById("div-tool-content").appendChild(RASTOOL.div);
    
  }
  
}
vrsel.onchange();

let device, characteristic;
let BLETRAN = connector(
  {namePrefix:"SEALCARVER",serviceUUID:'8cdd5342-a0e2-4d47-9418-cfb439f08019',characteristicUUID:'8aff89a0-166a-4db5-801b-ac9476c63fc4'},
  async function (params){
    let {namePrefix,serviceUUID,characteristicUUID} = params;
    await navigator.bluetooth.requestDevice({
      filters:[{namePrefix}],
      optionalServices:[serviceUUID]
    }).then(_device=>{
      device = _device;
      console.log(device.name);
      return device.gatt.connect();
    }).then(server=>server.getPrimaryService(serviceUUID))
      .then(service=>service.getCharacteristic(characteristicUUID))
      .then(_characteristic=>{
      characteristic = _characteristic;
      // characteristic.startNotifications();
    }).catch(error=>{console.error(error);})
  },
  function (){
    if (device) device.gatt.disconnect();
    device = null;
    characteristic = null;
  },
  async function (s){
    if (device && characteristic){
      await characteristic.writeValue(new TextEncoder().encode(s));
      console.log('written, reading now...')
      
      function mkp(){
        return new Promise((resolve, reject) => {
          characteristic.readValue().then(value=>{
            let ret = new TextDecoder().decode(value);
            console.log(ret);
            if (ret == 'OK'){
              resolve(ret)
            }else{
              reject(ret);
            }
          });
        });
      }
      async function loop(){
        try{
          await mkp();
        }catch(e){
          console.log(e);
          await loop();
        }
      }
      await loop();
    }else{
      alert("not connected!");
    }
  }

);

let mon = {};

let SERTRAN = connector(
  {baud:115200},
  async function(params){
    if (navigator.serial){
      window.serial = navigator.serial;
    }
    if (!window.serial){
      console.log("your browser/protocol does not support WebSerial; try chrome/https.");
    }
    let port = await window.serial.requestPort({});
    try{
      await port.open({baudRate: params.baud});
      console.log('port opened: '+JSON.stringify(port.getInfo()));
    }catch(e){
      console.log('port failed to open: '+e.toString());
      return;
    }
    mon.port = port;
    mon.reader = port.readable.getReader();
    mon.writer = port.writable.getWriter();
    mon.buf = [];
    mon.close = async function(x){
      mon.reader.releaseLock();
      mon.writer.releaseLock();
      mon.port.close();
      mon.port = null;
      console.log('port closed.');
    }
    if (mon.port){
      mon.port.ondisconnect = function(){
        console.log('connection lost.')
        mon.port = null;
      }
    }
  },
  async function(params){
    mon.close();
  },
  async function(s){
    const encoder = new TextEncoder();
    const view = encoder.encode(s+'\n');
    await mon.writer.write(view);
    
    let o = "";
    async function loop(){
      let {value,done} = (await mon.reader.read());
      for (let i = 0; i < value.length; i++){
        o += String.fromCharCode(value[i]);
      }
      
      if (!o.includes('OK\n')){
        await loop();
      }
    }
    await loop();
    console.log(o);
  }
                       
                       
);




let worker = new Worker("phyworker.js");

document.getElementById("dpg").onclick = function(){
  if (vrsel.value == 'vector'){
    PHYPROC.go(VECEDIT.polys.map(p=>p.map(([x,y])=>([x-VECEDIT.bbox.x,y-VECEDIT.bbox.y]))),VECEDIT.bbox.w,VECEDIT.bbox.h);
  }else{
    USTPROC.go(RASEDIT.mat,RASEDIT.w(),RASEDIT.h());
  }
}

document.getElementById("tpg").onclick = function(){
  if (vrsel.value == 'vector'){
    VECTOOL.go(PHYPROC.nodes(),PHYPROC.w(),PHYPROC.h());
  }else{
    RASTOOL.go(USTPROC.contours(),USTPROC.w(),USTPROC.h());
  }
}


document.getElementById("cntyp").onchange = function(){
  document.getElementById("div-transmit-content").innerHTML = "";
  if (document.getElementById("cntyp").value == 'bluetooth'){
    document.getElementById("div-transmit-content").appendChild(BLETRAN.div);
  }else{
    document.getElementById("div-transmit-content").appendChild(SERTRAN.div);
  }
}

document.getElementById("cntyp").onchange();


let sisw;
let sish;

globalThis.s2p_moveto_handler = function(x,y){

  let sx = VECEDIT.bbox.w/sisw;
  let sy = VECEDIT.bbox.h/sish;
  let s = Math.min(sx,sy);
  let px = VECEDIT.bbox.x + (VECEDIT.bbox.w-sisw*sx)/2;
  let py = VECEDIT.bbox.y + (VECEDIT.bbox.h-sish*sy)/2;
  
  VECEDIT.polys.push([[px+x*sx,py+y*sy]])

}
globalThis.s2p_lineto_handler = function(x,y){
  let sx = VECEDIT.bbox.w/sisw;
  let sy = VECEDIT.bbox.h/sish;
  let s = Math.min(sx,sy);
  let px = VECEDIT.bbox.x + (VECEDIT.bbox.w-sisw*sx)/2;
  let py = VECEDIT.bbox.y + (VECEDIT.bbox.h-sish*sy)/2;
  
  VECEDIT.polys.at(-1).push([px+x*sx,py+y*sy])
  
}
globalThis.s2p_setdim_handler = function(x,y){
  sisw = x;
  sish = y;
}

document.getElementById("eul").addEventListener('click',function(){
  if (vrsel.value == 'vector'){
    let inp = document.createElement("input");
    inp.type = "file";
    inp.addEventListener('change', function(e){
      let reader = new FileReader();
      reader.onload = async function(){
        let txt = reader.result;
        let {_s2p_parse_from_str,_malloc,writeStringToMemory} = await SVG2PL()
        let buf = _malloc(txt.length+1);
        writeStringToMemory(txt,buf);
        _s2p_parse_from_str(buf,-1);
        VECEDIT.render();
        
      }
      reader.readAsText(e.target.files[0]);    
      document.body.removeChild(inp);
    }, false);
    document.body.appendChild(inp);
    inp.style.display="none"
    inp.click();
  }else{
    let inp = document.createElement("input");
    inp.type = "file";
    inp.addEventListener('change', function(e){
      let reader = new FileReader();
      reader.onload = async function(){
        let bytes = new Uint8Array(reader.result);
        let [data,w,h] = read_png(bytes);
        data.map((x,i)=>{if (i%4==0){RASEDIT.mat.splice(i/4,1,x>127?1:0)}});
        RASEDIT.w(w);
        RASEDIT.h(h);
        RASEDIT.render();
        
      }
      reader.readAsArrayBuffer(e.target.files[0]);    
      document.body.removeChild(inp);
    }, false);
    document.body.appendChild(inp);
    inp.style.display="none"
    inp.click();
  }
});




function download_plain(pth,text){
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', pth);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function download_bin(pth,data,mime){
  let name = pth;
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  var blob = new Blob([data], {type: mime});
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}


function draw_svg(polys,bbox){
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${bbox.w}" height="${bbox.h}">`
  for (let i = 0; i < polys.length; i++){
    o += `<path d="M `
    for (let j = 0; j < polys[i].length; j++){
      let [x,y] = polys[i][j];
      o += `${x-bbox.x} ${y-bbox.y} `
    }
    o += `" fill="none" stroke="black"/>`
  }
  o += `</svg>`
  return o;
  
}

document.getElementById("edl").addEventListener('click',function(){
  if (vrsel.value == 'vector'){
    let txt = draw_svg(VECEDIT.polys,VECEDIT.bbox);
    download_plain("SEAL "+new Date()+".svg",txt);
  }else{
    
    let w = RASEDIT.w();
    let h = RASEDIT.h();
    let data = RASEDIT.mat.slice(0,w*h).map(x=>x*255);
    let bytes = write_png(data,w,h,1);
    download_bin("SEAL "+new Date()+".png",new Uint8Array(bytes),"image/png");
  }
});
