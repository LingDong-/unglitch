/*global describe read_png */

var TRC_R = 3;
var CLR_W = 8;

let bShowDt = false;

let mouse_mode = 0;

let jsr = 0x5EED;
// jsr = ~~(Math.random()*4294967295)


function rand(){
  jsr^=(jsr<<17);
  jsr^=(jsr>>>13);
  jsr^=(jsr<<5);
  jsr>>>=0;
  return jsr/4294967295;
}


function load_png(path){
  let xhr = new XMLHttpRequest();
  // xhr.responseType = 'arraybuffer';
  xhr.overrideMimeType('text/plain; charset=x-user-defined');
  xhr.open("GET", path, false);
  
  xhr.send();
  let res = xhr.response;
  // console.log(res);
  let bytes = Uint8Array.from(res, c => c.charCodeAt(0));
  
  let [data,w,h] = read_png(bytes);
  
  let D = [];
  for (let i = 0; i < data.length; i+= 4){
    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];
    let c = (r << 16) | (g << 8) | b;
    D.push(c);
  }
  
  return [D,w,h];
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

let W = 128;
let H = 128;
let B = new Array(W*H).fill(0);
let RAD = 3;

let Bhist = [B.slice()];

let cnv = document.createElement("canvas");
cnv.width = W;
cnv.height = H;
let ctx = cnv.getContext('2d',{ willReadFrequently: true });
ctx.fillRect(0,0,W,H)
document.body.appendChild(cnv);

display(B);


let dtdiv = document.createElement("div");
document.body.appendChild(dtdiv);


function display(im){
  // for (let i = 0; i < H; i++){
  //   for (let j = 0; j < W; j++){
  //     ctx.fillStyle='#'+im[i*W+j].toString(16).padStart(6,'0')
  //     ctx.fillRect(j*SCL,i*SCL,SCL,SCL);
  //   }
  // }

  let imd = ctx.getImageData(0,0,W,H);
  for (let i = 0; i < im.length; i ++){
    imd.data[i*4  ] = (im[i]>>16)&0xff;
    imd.data[i*4+1] = (im[i]>>8)&0xff;
    imd.data[i*4+2] = im[i]&0xff;
    imd.data[i*4+3] = 255;
  }
  ctx.putImageData(imd,0,0);
}

function get_color_set(B){
  return Array.from(new Set(B)).filter(x=>x);
}

let mouseX;
let mouseY;
let mouseIsDown = false;

let curr_color = 0xff3f3f;







let openset = new Set();
let came_from;
let gscore;
let fscore;

let astar_old_size = 0;

function astar(im, x0, y0){
  
  let neighbors = [0,0,0,0];
  let n_neighbors = 0;

  function heur_dist(a){
    if (im.data[a] == -2){
      return 0;
    }else if (im.data[a] == -1){
      return 1;
    }else{
      return im.data[a];
    }
  }
  function reconstruct_path(w, current){
    let path = [];
    path.push([current%w, ~~(current/w)]);
    while ( came_from[current] != -1){
      current = came_from[current];
      path.push([current%w, ~~(current/w)]);
    }
    return path;
  }

  function get_neighbors(im, n){
    let c = n % im.w;
    let r = ~~(n / im.w);
    n_neighbors = 0;
    if (c > 0 && im.data[n-1]<255) neighbors[n_neighbors++] = n-1;
    if (c < im.w-1 && im.data[n+1]<255) neighbors[n_neighbors++] = n+1;
    if (r > 0 && im.data[n-im.w]<255) neighbors[n_neighbors++] = n-im.w;
    if (r < im.h-1 && im.data[n+im.w]<255) neighbors[n_neighbors++] = n+im.w;
  }
  
  let w = im.w;
  let h = im.h;
  let w_h = w*h; 
  
  if (astar_old_size < w_h){
    came_from = new Int32Array(w_h);
    gscore = new Float32Array(w_h);
    fscore = new Float32Array(w_h);
    astar_old_size = w_h;
  }

  let start = y0*w+x0;

  openset.clear();
  
  came_from[start] = -1;
  openset.add(start);
  
  for (let i = 0; i < w_h; i++) gscore[i] = Infinity;
  for (let i = 0; i < w_h; i++) fscore[i] = Infinity;
  for (let i = 0; i < w_h; i++) came_from[i] = -1;

  gscore[start] = 0;
  fscore[start] = heur_dist(start);
  
  
  while (openset.size){
    // console.log(n_openset,im.data.length);
    
    let amin = -1;
    let fmin = Infinity;
    for (let q of openset){
      let f = fscore[q];
      if ( f < fmin){
        fmin = f;
        amin = q;
      }
    }

    let current = amin;
    
    if (im.data[current] == -2){
      return reconstruct_path(w,current);
    }

    openset.delete(amin);
    
    get_neighbors(im,current);

    for (let i = 0; i < n_neighbors; i++){
      let neighbor = neighbors[i];
      let penalty = Math.max(im.data[neighbor],0);
      
      let tentative_gscore = gscore[current] + 1 + penalty;
      if (tentative_gscore < gscore[neighbor]){
        came_from[neighbor] = current;
        gscore[neighbor] = tentative_gscore;
        fscore[neighbor] = gscore[neighbor] + heur_dist(neighbor);
        openset.add(neighbor);
      }
    }
  }
  return null;
}



function bucketfill(im0,x0,y0,val){
  let val0 = im0[y0*W+x0];
  if (val0 == val){
    return;
  }
  let Q = [];
  Q.push([x0,y0]);
  while (Q.length){
    let [x,y] = Q.pop();
    if (x > 0 && im0[y*W+(x-1)]==val0){
      im0[y*W+(x-1)] = val;
      Q.push([x-1,y]);
    }
    if (x < W-1 && im0[y*W+(x+1)] == val0){
      im0[y*W+(x+1)] = val;
      Q.push([x+1,y]);
    }
    if (y > 0 && im0[(y-1)*W+x] == val0){
      im0[(y-1)*W+x] = val;
      Q.push([x,y-1]);
    }
    if (y < H-1 && im0[(y+1)*W+x]== val0){
      im0[(y+1)*W+x] = val;
      Q.push([x,y+1]);
    }
  }
}

function floodblob(im0,x0,y0,val){
  let Q = [];
  let im1 = new Array(im0.length).fill(0);
  Q.push([x0,y0]);
  im1[y0*W+x0] = -1;
  while (Q.length){
    let [x,y] = Q.pop();
    if (x > 0 && im0[y*W+(x-1)]==val && im1[y*W+(x-1)] == 0){
      im1[y*W+(x-1)] = -1;
      Q.push([x-1,y]);
    }
    if (x < W-1 && im0[y*W+(x+1)] == val && im1[y*W+(x+1)] ==0){
      im1[y*W+(x+1)] = -1;
      Q.push([x+1,y]);
    }
    if (y > 0 && im0[(y-1)*W+x] == val && im1[(y-1)*W+x]==0){
      im1[(y-1)*W+x] = -1;
      Q.push([x,y-1]);
    }
    if (y < H-1 && im0[(y+1)*W+x]== val && im1[(y+1)*W+x]==0){
      im1[(y+1)*W+x] = -1;
      Q.push([x,y+1]);
    }
  }
  let needwork = false;
  for (let i = 0; i < H; i++){
    for (let j = 0; j < W; j++){
      if (im1[i*W+j] == 0){
        if (im0[i*W+j] == val){
          im1[i*W+j] = -2;
          needwork = true;
        // }else if (im0[i*W+j] != 0 && !is_nc(im0[i*W+j])){
        }else if (im0[i*W+j] != 0){
          im1[i*W+j] = 255;
        }
      }
    }
  }
  if (!needwork) return null;
  let dt0 = dist_transform(im1.map(x=>x==255),W,H);

  for (let i = 0; i < W*H; i++){
    if (dt0[i] < CLR_W+TRC_R && im1[i] >= 0){
      im1[i] = 255;
    }
    // if (im0[i] && is_nc(im0[i])){
    //   im1[i] = 255;
    // }
  }
  
  // let dt1 = dist_transform(B0.map(x=>x&&(x!=val)),W,H);
  
  let dt = dist_transform(im1.map(x=>x==-2),W,H);
  for (let i = 0; i < W*H; i++){
    if (im1[i] == 0){
      im1[i] = Math.min(dt[i]*0.5,254);
    }
  }
  
  let rc0 = rand();
  
  if (rc0 < 0.33){
    for (let i = 0; i < W*H; i++){
      if (im1[i] >= 0 && im1[i] < 255){
              // im1[i] = im1[i]*(255-dt0[i])/255;
        im1[i] = im1[i]+Math.max(1,250-dt0[i]*5)*0.5;
        im1[i] = Math.min(im1[i],200);
      }
    }
  }else if (rc0 < 0.67){
    let dt00 = dist_transform(Bhist[0].map(x=>x&&(x!=val)&&!is_nc(x)),W,H);
    for (let i = 0; i < W*H; i++){
      if (im1[i] >= 0 && im1[i] < 255){
              // im1[i] = im1[i]*(255-dt0[i])/255;
        im1[i] = im1[i]+Math.max(1,250-dt00[i]*10)*0.3;
        im1[i] = Math.min(im1[i],200);
      }
    }
  }
  
  let rc = rand();
  let amt = 100+rand()*100;

  for (let i = 0; i < H; i++){
    for (let j = 0; j < W; j++){
      if (im1[i*W+j] > 0 && im1[i*W+j] < 255){

        if (rc < 0.2){
          im1[i*W+j] = im1[i*W+j] + (j/W-0.5)*amt;
        }else if (rc < 0.4){
          im1[i*W+j] = im1[i*W+j] + ((W-j)/W-0.5)*amt;
        }else if (rc < 0.6){
          im1[i*W+j] = im1[i*W+j] + (i/H-0.5)*amt;
        }else if (rc < 0.8){
          im1[i*W+j] = im1[i*W+j] + ((H-i)/H-0.5)*amt;
        }

        im1[i*W+j] = Math.max(1,Math.min(im1[i*W+j],254));
      }
    }
  }


  if (bShowDt){
    let cnv = document.createElement("canvas");
    cnv.width = W;
    cnv.height = H;
    let ctx = cnv.getContext('2d');
    let imd = ctx.getImageData(0,0,W,H);
    for (let i = 0; i < im1.length; i ++){
      if (im1[i] == -1){
        imd.data[i*4  ] = 255;
        imd.data[i*4+1] = 0;
        imd.data[i*4+2] = 0;
      }else if (im1[i] == -2){
        imd.data[i*4  ] = 0;
        imd.data[i*4+1] = 255;
        imd.data[i*4+2] = 0;
      }else{
        imd.data[i*4  ] = im1[i];
        imd.data[i*4+1] = im1[i];
        imd.data[i*4+2] = im1[i];
      }
      imd.data[i*4+3] = 255;
    }
    ctx.putImageData(imd,0,0);
    dtdiv.appendChild(cnv);
  }
  
  return im1;
}

let stamp;

function update_trc_r(){
  let TRC_W = TRC_R*2+1;
  stamp = new Array(TRC_W*TRC_W).fill(0);
  for (let i = 0; i < TRC_W; i++){
    for (let j = 0; j < TRC_W; j++){
      let d = Math.hypot(i-TRC_R, j-TRC_R);
      if (d < TRC_R+0.5){
        stamp[i*TRC_W+j] = 1;
      }
    }
  }
}


function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


function is_nc(val){
  if (val == 0) return false;
  let r = (val >> 16)&0xff;
  let g = (val >> 8)&0xff;
  let b = (val)&0xff;
  return r == g && g == b;
}

function do_iter(B,xhint,yhint){
  let CS = [];
  let seen = new Array(B.length).fill(0);
  let i = yhint*W+xhint;
  for (let r = 0; r < 10000; r++){
    if (r){
      i = ~~(rand()*B.length);
    }
    // i = 130*W+198;
    if (seen[i]) continue;
    let val = B[i];
    if (val && !is_nc(val)){
      
      let x = i%W;
      let y = ~~(i/W);
      let C = floodblob(B,x,y,val);

      if (C){
        for (let j = 0; j < C.length; j++){
          if (C[j] == -1){
            seen[j] = 1;
          }
        }
        CS.push([C,x,y]);
        break;
      }
    }
  }
  if (!CS.length){
    console.log("all good!")
    return -1;
  }
  shuffle(CS);
  let [C,x,y] = CS[0];
  let val = B[y*W+x];
  let css = '#'+val.toString(16).padStart(6,'0');
  console.log(`%c solving for ${css} at ${x},${y}`,'background: '+css+'; color: white');
  
  let path = astar({data:C,w:W,h:H},x,y);
  if (!path){
    console.log("no solution!");
    return -2;
  }
  let B0 = Bhist[Bhist.length-1];
  let TRC_W = TRC_R*2+1;
  for (let j = 0; j < path.length; j++){
    let [x,y] = path[j];
    if (B0[y*W+x] == val){
      continue;
    }
    for (let ki = 0; ki < TRC_W; ki++){
      for (let kj = 0; kj < TRC_W; kj ++){
        if (stamp[ki*TRC_W+kj]){
          B[(y+ki-TRC_R)*W+(x+kj-TRC_R)] = val;
        }
      }
    }
  }
  Bhist.push(B.slice());
  display(B); 
  return 0;
}


// function solve(){
//   let Bx = B.slice();
//   let ret;
//   do{
//     ret = do_iter(Bx);
//   }while (ret == 0);
  
//   if (ret == -2){
//     solve();
//   }
//   for (let i = 0; i < B.length; i++) B[i] = Bx[i];
  
// }


var failure_reaction = function(){
  let sel = document.getElementById("sel-fail");
  if (sel.value == 'retry'){
    return true;
  }else if (sel.value == 'stop'){
    throw "failed, stopping as specified.";
  }else if (sel.value == 'ask'){
    return confirm("failed. try again?");
  }
  throw "up";
}

function solve(){
  dtdiv.innerHTML='';
  
  console.log("seed: 0x"+jsr.toString(16),"time: "+new Date());
  Bhist = Bhist.slice(0,1);
  let Bx = B.slice();
  function iter(){
    // console.log("...")
    let ret = do_iter(Bx);
    if (!ret){
      return setTimeout(iter,1);
    }
    
    if (ret == -2){
      if (failure_reaction()){
        return setTimeout(solve,1);
      }
    }
    for (let i = 0; i < B.length; i++) B[i] = Bx[i];
  }
  iter();
}







cnv.addEventListener('mousedown',function(event){
  let box = cnv.getBoundingClientRect();
  mouseX = event.clientX-box.left;
  mouseY = event.clientY-box.top;
  mouseIsDown = true;
  if (mouse_mode == 0){
    do_iter(B,mouseX,mouseY)
  }else if (mouse_mode == 1){
    mouse_draw();
  }else if (mouse_mode == 2){
    curr_color = B[(~~mouseY)*W+(~~mouseX)];
      
    update_curr_color();
  }else if (mouse_mode == 3){
    
    bucketfill(B,(~~mouseX),(~~mouseY),curr_color);
    display(B);
    Bhist.push(B.slice());
  }
})
cnv.addEventListener('mousemove',function(event){
  let box = cnv.getBoundingClientRect();
  mouseX = event.clientX-box.left;
  mouseY = event.clientY-box.top;
  if (mouse_mode == 1){
    if (mouseIsDown){
      mouse_draw();
    }
  }
})
cnv.addEventListener('mouseup',function(event){
  mouseIsDown = false;
  if (mouse_mode == 1){
    display(B);
    Bhist.push(B.slice());
  }
})
function mouse_draw(){
  let x = ~~(mouseX);
  let y = ~~(mouseY);
  for (let i = Math.max(y-RAD,0); i < Math.min(y+RAD+1,H-1); i++){
    for (let j = Math.max(x-RAD,0); j < Math.min(x+RAD+1,W-1); j++){
      B[i*W+j] = curr_color;
    }
  }
  ctx.fillStyle = '#'+curr_color.toString(16).padStart(6,'0')
  ctx.fillRect(x-RAD,y-RAD,(RAD*2+1),(RAD*2+1));
}


let examples = {
  'hello.D11C.echo':{seed:0xc288bec7/*0xc0e13f7a*/,conf:{TRC_R:3,CLR_W:8},url:'/autoroute/glitch-assets/hello.D11C.echo.traces_exterior.png'},
  'hello.ftdi.45':{seed:0x88b213fd/*0xaa69c87d*/,conf:{TRC_R:3,CLR_W:8},url:'/autoroute/glitch-assets/hello.ftdi.45.traces_exterior.png'},
  'hello.ISP.44':{seed:0xd9f6d431/*0xa38dd442*/,conf:{TRC_R:3,CLR_W:8},url:'/autoroute/glitch-assets/hello.ISP.44.traces_exterior.png'},
  'hello.ILI9341.SW.D21E':{seed:0xed12d2c6,conf:{TRC_R:3,CLR_W:8},url:'/autoroute/glitch-assets/hello.ILI9341.SW.D21E.traces_exterior.png'},
}

function load_example(k){
  console.log(k);
  curr_example = k;
  [B,W,H] = load_png(examples[k].url);
  cnv.width = W;
  cnv.height = H;
  Bhist = [B.slice()];
  jsr = examples[k].seed;
  for (let q in examples[k].conf){
    window[q] = examples[k].conf[q];
  }
  update_trc_r();
  display(B);
  make_gui();
}

let curr_example = 'hello.D11C.echo';

load_example(curr_example);

function update_curr_color(){
  let sp = document.getElementById('span-curr-color');
  let s = '#'+curr_color.toString(16).padStart(6,'0');
  sp.innerHTML = s;
  sp.style.background=s;
}

function upload_user_png(){
  var fileToLoad = document.getElementById("file_upl").files[0];
  var fileReader = new FileReader();
  fileReader.onload = function(fileLoadedEvent){
    let ab = fileLoadedEvent.target.result;
    
    let bytes = new Uint8Array(ab);
    console.log(bytes);
    let [data,w,h] = read_png(bytes);
    let D = [];
    for (let i = 0; i < data.length; i+= 4){
      let r = data[i];
      let g = data[i+1];
      let b = data[i+2];
      let c = (r << 16) | (g << 8) | b;
      D.push(c);
    }
    B = D;
    W = w;
    H = h;
    cnv.width = W;
    cnv.height = H;
    display(B);
    Bhist = [B.slice()];
  };
  fileReader.readAsArrayBuffer(fileToLoad);
}

let img_msg = `\
blobs of the same color will be connected (e.g. red->red, blue->blue), except:
black (#000) is the empty space.
white and grays are NC (avoided by other tracks, but not connected to any).
make sure there is no anti-aliasing!
png only!
`;


function make_gui(){
  let div= document.getElementById('gui');
  if (!div) div = document.createElement('div');
  div.id = 'gui';
  div.style="font-family:monospace; position:absolute;width:320px;height:720px;top:0px;right:0px;border:1px dotted black;background:whitesmoke;padding:10px;white-space:pre"
  let htm = `load example: <select id="sel-eg" onchange="load_example(this.value)">
  `;
  for (let k in examples){
    htm += `<option value="${k}" ${curr_example==k?'selected':''}>${k}</option>`;    
  } 
  htm += `</select><button onclick="load_example(document.getElementById('sel-eg').value)">⟳</button>
or upload png: 
<input type="file" id="file_upl" onchange="upload_user_png()"></input>\
<button onclick="alert(img_msg)">?</button>
seed: <input id="inp-seed" value="${jsr}"></input>\
<button onclick="jsr=Number(document.getElementById('inp-seed').value)">set</button>\
<button onclick="jsr=(~~(Math.random()*4294967295))>>>0;document.getElementById('inp-seed').value=jsr">gen</button>
track radius (px, " width-1/2): <input type="number" value="${TRC_R}" min="1" max="99" oninput="TRC_R=Number(this.value)"/>
clearance    (px):              <input type="number" value="${CLR_W}" min="1" max="99" oninput="CLR_W=Number(this.value)"/>
upon failure: <select id="sel-fail">
  <option>retry</option>
  <option>stop</option>
  <option>ask</option>
</select>
<input type="checkbox" ${bShowDt?'checked':''} onchange="bShowDt=this.checked"/>dbg: show dist transforms
<button onclick="solve()" style="font-size:32px">solve</button>&lt;--click me
<button onclick="if (Bhist.length>1){Bhist.pop();B=Bhist[Bhist.length-1].slice();display(B)}">undo</button>\
<button onclick="B.fill(0);Bhist=[B.slice()];display(B)">clear</button>
mouse function: <select onchange="mouse_mode=this.selectedIndex">
  <option>route</option>
  <option>paint</option>
  <option>colorpicker</option>
  <option>bucketfill</option>
</select>
current color: <span id="span-curr-color"></span>
quick colors:
<div style="white-space:normal">
`
  for (let i = 0; i < 64; i++){
    
    let r = (((i >> 4)&3) << 6) + 63;
    let g = (((i >> 2)&3) << 6) + 63;
    let b = ((i & 3) << 6     ) + 63;
    let c = (r << 16) | (g << 8) | b;
    let s = '#'+c.toString(16).padStart(6,'0');
    htm += `<button onclick="curr_color=${c};update_curr_color()" style="background:${s};font-family:monospace;margin:0px;">${s}</button>`
  }
  htm += `<button onclick="curr_color=0;update_curr_color()" style="background:black;font-family:monospace;margin:0px;color:white">#000000</button>`
htm += `
</div>
open console to see progress details.

<a href="https://glitch.com/edit/#!/autoroute">source code</a>
  `
  div.innerHTML = htm;
  document.body.appendChild(div);
  update_curr_color();
}


make_gui();
