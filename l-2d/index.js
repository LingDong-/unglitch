/* global describe menu2html SAMPLES SYMBOLS FONT parse run_all visits Tone trace draw_svg*/

let paper = SAMPLES['tree'];
let ans_paper = {};

let PIX_W = 3;
let SYM_W = 5;
let WHITE = "wheat";
let BLACK = "darkslategray";
let RED = "tomato";
let TOOL_COL = 3;
let CURR_TOOL = "func_def";
let MENU_H =  20+PIX_W;//PIX_W*SYM_W+PIX_W*3;

let PAPER_W = 128;
let PAPER_H = 128;

let selection = new Set();

let anim = null;
    
let is_cont_eval = false;

let audioCtx, osc;

function copy_selection(){
  let np = {};
  if (selection.size){
    for (let k of selection){
      np[k] = paper[k];
    }
  }else{
    np = paper;
  }
  navigator.clipboard.writeText(JSON.stringify(np));
}

function get_bbox(np){
  let mx = Infinity;
  let my = Infinity;
  let Mx = -Infinity;
  let My = -Infinity;
  for (let k in np){
    let [x,y] = k.split(',').map(Number);
    mx = Math.min(x,mx);
    my = Math.min(y,my);
    Mx = Math.max(x,Mx);
    My = Math.max(y,My);
  }
  return {x:mx,y:my,w:Mx-mx,h:My-my};
}

function paste_selection(){
  navigator.clipboard.readText().then(txt=>{
    let np = JSON.parse(txt);
    let [ox,oy] = get_symbol_space(mouseX,mouseY);
    let bb = get_bbox(np);
    
    for (let k in np){
      let [x,y] = k.split(',').map(Number);
      x = x - bb.x + ox;
      y = y - bb.y + oy;
      paper[`${x},${y}`]=np[k];
    }
  })
}

let symbol_to_freq = {};
for (let i = 0; i < Object.keys(SYMBOLS).length; i++){
  symbol_to_freq[Object.keys(SYMBOLS)[i]] = Math.random()*600+100
}


let menudiv = document.createElement('div');
menudiv.style = "position:fixed;left:0px;top:0px;z-index:999;width:100%;height:20px;background:black;";

let zoomed = false;

let menu = {
  'λ-2d':{
    'about':()=>{},
  },
  'samples':Object.fromEntries(Object.entries(SAMPLES).map(x=>[x[0],()=>{}])),
  'file':{
    'import png':import_png,
    'import json':import_json,
    '---':null,
    'export png':export_png,
    'export svg':export_svg,
    'export json':export_json,
  },
  'edit':{
    'copy [C]':copy_selection,
    'paste [V]':paste_selection,
    'delete':()=>{
      if (selection.size){
        for (let k of selection){
          delete paper[k];
        }
      }else{
        if (confirm('nothing selected. nuke everything?')){
          paper = {};
        }
      }
    },
    'obfuscate':{
      'hieroglyphic':()=>{
        let keys = Object.keys(SYMBOLS).slice(5).filter(x=>x!="entry"&&!x.startsWith('num_'));
        obfuscate(keys);
      },
      'labyrinthian':()=>{
        let keys = Object.keys(SYMBOLS).filter(x=>x.startsWith('wire_'));
        obfuscate(keys);
      },
      // 'bamboo':()=>{
      //   let keys = Object.keys(SYMBOLS).filter(x=>(x == 'wire_ns' || x == 'wire_nswe'));
      //   obfuscate(keys);
      // },
    }
  },
  'view':{
    'compute trace':()=>{
      svgdiv.style.display = "block";
      let M = to_dot_matrix(true);
      svgdiv.innerHTML = draw_svg(trace(M),M[0].length*2,M.length*2,PIX_W/2,RED,1);
    },
    'clear trace':()=>{
      svgdiv.innerHTML = "";
      svgdiv.style.display = "none";
    }
  },
  'program':{
    'compile symbols':recog_all_symbols,
    'build [B]':()=>{console.log(parse(paper))},
    'run [R]':()=>{
      ans_paper = run_all(bake(paper));
    },
    'animated run':()=>{
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
      
      let gain = audioCtx.createGain();
      gain.gain.value = 0.1;
      gain.connect(audioCtx.destination);
      osc.connect(gain);

      anim = {
        i:0,
        ans:run_all(bake(paper)),
      }
      osc.start();
    },
    '---1':null,
    '[ ] cont. eval':()=>{
      is_cont_eval=!is_cont_eval;
      if (!is_cont_eval){
        worker.terminate();
        worker = null;
        is_working = false;
      }
    },
    '---2':null,
    'clear sliders':()=>{
      slidervals = {};
    },
    'clear output':()=>{
      ans_paper = {};
    },
  }

};
menudiv.innerHTML = menu2html(menu);
document.body.appendChild(menudiv);

for (let k in SAMPLES){
  document.getElementById('samples/'+k).addEventListener('click',function(){
    paper = SAMPLES[k];
  })
}

document.body.style.background=WHITE;

let tool_btns = {};
let cnt = 0;
for (let k in SYMBOLS){
  let cnv = document.createElement("canvas");
  cnv.width = SYM_W*PIX_W;
  cnv.height = SYM_W*PIX_W;
  let ctx = cnv.getContext('2d');
  ctx.fillStyle=WHITE;
  ctx.fillRect(0,0,cnv.width,cnv.height);
  ctx.fillStyle=BLACK;
  for (let i = 0; i < SYMBOLS[k].length; i++){
    for (let j = 0; j < SYMBOLS[k][i].length; j++){
      if (SYMBOLS[k][i][j] != '.'){
        ctx.fillRect(j*PIX_W,i*PIX_W,PIX_W,PIX_W)
      }
    }
  }
  let x = (cnt%TOOL_COL)*(cnv.width+PIX_W*2);
  let y = ~~(cnt/TOOL_COL)*(cnv.height+PIX_W*2);
  // console.log(x,y);
  cnv.style=`border:${PIX_W}px solid ${(k == CURR_TOOL)?BLACK:WHITE};position:absolute;left:${x}px;top:${y+MENU_H}px;cursor:pointer`;
  cnv.onmouseenter=function(){
    cnv.style.filter="invert(100%)";
    tipcnv.getContext('2d').clearRect(0,0,tipcnv.width,tipcnv.height);
    tipcnv.getContext('2d').fillStyle=BLACK;
    draw_font(tipcnv,k,0,0);
  }
  cnv.onmouseleave=function(){
    cnv.style.filter="";
    tipcnv.getContext('2d').clearRect(0,0,tipcnv.width,tipcnv.height);
    tipcnv.getContext('2d').fillStyle=BLACK;
    draw_font(tipcnv,CURR_TOOL,0,0);
  };
  cnv.onclick = function(){
    CURR_TOOL = k;
    for (let k in tool_btns){
      tool_btns[k].style.border = `${PIX_W}px solid ${(k == CURR_TOOL)?BLACK:WHITE}`
    }
  };
  document.body.appendChild(cnv);
  tool_btns[k] = cnv;
  cnt++;
  
}

let cnv_view = document.createElement("div");
cnv_view.style = `overflow:scroll;width:calc(100% - ${TOOL_COL*(SYM_W*PIX_W+PIX_W*2)+PIX_W*3}px);height:calc(100% - ${MENU_H+PIX_W*4+PIX_W*SYM_W}px);border:${PIX_W}px solid ${BLACK};position:absolute;top:${MENU_H}px;left:${TOOL_COL*(SYM_W*PIX_W+PIX_W*2)}px`;
let cnv = document.createElement("canvas");
cnv.width = PIX_W*SYM_W*PAPER_W;
cnv.height = PIX_W*SYM_W*PAPER_H;
cnv.style = `position:absolute;left:0px;top:0px;cursor:none;transform-origin:top left;`;
let ctx = cnv.getContext('2d');
cnv_view.appendChild(cnv);
document.body.appendChild(cnv_view);

let svgdiv = document.createElement('div');
svgdiv.style = "display:none;position:absolute;left:0px;top:0px;pointer-events:none";
cnv_view.appendChild(svgdiv);

let mouseX=0;
let mouseY=0;
let mouseIsDown=false;

function get_symbol_space(mx,my){
  let x = ~~(mx / (SYM_W*PIX_W));
  let y = ~~(my / (SYM_W*PIX_W));
  return [x,y];
}

function get_screen_space(j,i){
  return [j*SYM_W*PIX_W,i*SYM_W*PIX_W];
}

cnv.addEventListener("mousemove",function(e){
  let x = e.clientX;
  let y = e.clientY;
  let box = cnv.getBoundingClientRect();
  x = x - box.x;
  y = y - box.y;
    
  mouseX = x;
  mouseY = y;
})
cnv.addEventListener("mousedown",function(e){
  mouseIsDown = true;
})
cnv.addEventListener("mouseup",function(e){
  mouseIsDown = false;
})

document.addEventListener("keydown",function(e){
  // console.log(e);
  if (e.key == "ArrowLeft"){
    shift_selection(-1,0);
  }else if (e.key == "ArrowRight"){
    shift_selection(1,0);
  }else if (e.key == "ArrowUp"){
    shift_selection(0,-1);
  }else if (e.key == "ArrowDown"){
    shift_selection(0,1);
  }else if (e.key == 'b'){
    menu.program['build [B]']();
  }else if (e.key == 'r'){
    menu.program['run [R]']();
  }else if (e.key == 'c'){
    menu.edit['copy [C]']();
  }else if (e.key == 'v'){
    menu.edit['paste [V]']();
  }else if (e.key == '1'){
    let [x,y] = get_symbol_space(mouseX,mouseY); 
    paper[`${x},${y}`] = 'func_call';
    paper[`${x+1},${y}`] = 'wire_sw';
    paper[`${x+1},${y+1}`] = 'wire_ne';
    paper[`${x+2},${y+1}`] = 'wire_nw';
  }
  e.stopPropagation();
})
function shift_paper(dx,dy){
  let np = {};
  for (let k in paper){
    let [x,y] = k.split(',').map(Number);
    np[`${x+dx},${y+dy}`] = paper[k];
  }
  for (let k in paper){
    delete paper[k];
  }
  // console.log(np);
  for (let k in np){
    paper[k] = np[k];
  }
  // console.log(paper);
}

function shift_selection(dx,dy){
  if (!selection.size) return shift_paper(dx,dy);
  let np = {};
  let ns = new Set();
  for (let k of selection){
    let [x,y] = k.split(',').map(Number);
    let kk = `${x+dx},${y+dy}`;
    np[kk] = paper[k];
    ns.add(kk);
  }
  for (let k of selection){
    delete paper[k];
    selection.delete(k);
  }
  // console.log(np);
  for (let k in np){
    paper[k] = np[k];
    selection.add(k);
  }
  // console.log(paper);
}

function obfuscate(keys){
  let bb = get_bbox(paper);
  bb.x -= 2;
  bb.y -= 2;
  bb.w += 4;
  bb.h += 4;
  for (let i = bb.y; i < bb.y+bb.h; i++){
    for (let j = bb.x; j < bb.x+bb.w; j++){
    
      if (!paper[`${j},${i}`]){
        paper[`${j},${i}`] = keys[~~(Math.random()*keys.length)];
      }
    }
  }
}

function draw_bg(){
  ctx.save();
  ctx.fillStyle=WHITE;
  ctx.fillRect(0,0,cnv.width,cnv.height);
}
function draw_grid(){
  ctx.fillStyle=BLACK;
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < PAPER_H; i++){
    for (let j = 0; j < PAPER_W; j++){
      ctx.fillRect(...get_screen_space(j,i),PIX_W,PIX_W);
    }
  }
  ctx.restore();
}

function draw_font(cnv,text,x,y){
  let ctx = cnv.getContext('2d');
  // ctx.fillStyle=WHITE;
  // ctx.fillRect(x,y,PIX_W*SYM_W*text.length,PIX_W*SYM_W);
  // ctx.fillStyle=BLACK;
  for (let n = 0; n < text.length; n++){
    let k = text[n];
    // console.log(k,FONT[k]);
    for (let i = 0; i < FONT[k].length; i++){
      for (let j = 0; j < FONT[k][i].length; j++){
        if (FONT[k][i][j] != '.'){
          ctx.fillRect(x+j*PIX_W+n*(PIX_W*SYM_W),y+i*PIX_W,PIX_W,PIX_W);
        }
      }
    }
  }
}

function rasterize_text(text,x,y,fontstr){
  if (fontstr == 'default'){
    for (let n = 0; n < text.length; n++){
      let k = text[n].toLowerCase();
      if (!FONT[k]){
        continue;
      }
      for (let i = 0; i < FONT[k].length; i++){
        for (let j = 0; j < FONT[k][i].length; j++){
          let v = (FONT[k][i][j] == '.')?0:1;
          let key = `${x+n},${y}`;
          let idx = i * SYM_W + j;
          if (!paper[key]) paper[key] = new Array(SYM_W*SYM_W).fill(0);
          paper[key][idx] = v;
        }
      }
    }
    return;
  }
  let cnv = document.createElement('canvas');
  let ctx = cnv.getContext('2d');
  ctx.font = fontstr;
  let m = ctx.measureText(text);
  cnv.width = m.width;
  cnv.height = m.fontBoundingBoxAscent+m.actualBoundingBoxDescent;
  ctx.font = fontstr;
  ctx.fillText(text,-m.actualBoundingBoxLeft,m.fontBoundingBoxAscent);
  let data = ctx.getImageData(0,0,cnv.width,cnv.height).data;
  for (let i = 0; i < cnv.height; i++){
    for (let j = 0; j < cnv.width; j++){
      let v = data[(i*cnv.width+j)*4+3];
      let key = `${x+(~~(j/SYM_W))},${y+(~~(i/SYM_W))}`;
      let dx = j%SYM_W;
      let dy = i%SYM_W;
      let idx = dy*SYM_W+dx;
      if (!paper[key]) paper[key] = new Array(SYM_W*SYM_W).fill(0);
      paper[key][idx] = (v > 100) ? 1 : 0;
    }
  }
}

let coordcnv = document.createElement('canvas');
coordcnv.width = PIX_W*SYM_W*11;
coordcnv.height = PIX_W*SYM_W;
coordcnv.style=`position:fixed;right:${PIX_W}px;bottom:${PIX_W}px`;
document.body.appendChild(coordcnv);

let tipcnv = document.createElement('canvas');
tipcnv.width = PIX_W*SYM_W*11;
tipcnv.height = PIX_W*SYM_W;
tipcnv.style=`position:fixed;left:${PIX_W}px;bottom:${PIX_W}px`;
document.body.appendChild(tipcnv);

function draw_cursor(){
  ctx.save();
  ctx.globalAlpha = 0.4;
  if (CURR_TOOL == 'freehand'){
    ctx.fillStyle=BLACK;
    let x = ~~(mouseX/PIX_W);
    let y = ~~(mouseY/PIX_W);
    ctx.fillRect(x*PIX_W,y*PIX_W,PIX_W,PIX_W);
  }else if (CURR_TOOL == 'erase'){
    let [x,y] = get_symbol_space(mouseX,mouseY);
    ctx.save();
    ctx.fillStyle=WHITE;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x*SYM_W*PIX_W,y*SYM_W*PIX_W,SYM_W*PIX_W,SYM_W*PIX_W);
    ctx.restore();
    ctx.drawImage(tool_btns[CURR_TOOL],x*SYM_W*PIX_W,y*SYM_W*PIX_W);
  }else if (CURR_TOOL == 'select'){
    let [x,y] = get_symbol_space(mouseX,mouseY);
    ctx.save();
    ctx.fillStyle=BLACK;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x*SYM_W*PIX_W,y*SYM_W*PIX_W,SYM_W*PIX_W*3,SYM_W*PIX_W*3);
    ctx.restore();
  }else{
    let [x,y] = get_symbol_space(mouseX,mouseY);
    ctx.drawImage(tool_btns[CURR_TOOL],x*SYM_W*PIX_W,y*SYM_W*PIX_W);
  }
  ctx.restore();
}

function draw_selection(){
  for (let k of selection){
    let [x,y] = k.split(',').map(Number);
    ctx.save();
    ctx.fillStyle=BLACK;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(x*SYM_W*PIX_W,y*SYM_W*PIX_W,SYM_W*PIX_W,SYM_W*PIX_W);
    ctx.restore();
  }
}

function draw_graph(){
  for (let k in paper){
    let [x,y] = k.split(',').map(Number);
    if (typeof paper[k] == 'object'){
      ctx.fillStyle=BLACK;
      for (let i = 0; i < paper[k].length; i++){
        if (!paper[k][i]) continue;
        let dx = i % SYM_W;
        let dy = ~~(i/SYM_W);
        ctx.fillRect((x*SYM_W+dx)*PIX_W, (y*SYM_W+dy)*PIX_W, PIX_W,PIX_W);
      }
    }else if (tool_btns[paper[k]]){
      ctx.drawImage(tool_btns[paper[k]],x*SYM_W*PIX_W,y*SYM_W*PIX_W);
    }
    
  }
  
}


function to_dot_matrix(no_norm){
  let bb = get_bbox(paper);
  if (no_norm){
    bb.w += bb.x+1;
    bb.h += bb.y+1;
    bb.x = 0;
    bb.y = 0;
  }else{
    bb.x -= 2;
    bb.y -= 2;
    bb.w += 4;
    bb.h += 4;
  }
  let M = new Array(bb.h*SYM_W).fill(0).map(_=>new Array(bb.w*SYM_W).fill(0));
  
  for (let k in paper){
    let [x,y] = k.split(',').map(Number);
    if (typeof paper[k] == 'object'){
      for (let i = 0; i < paper[k].length; i++){
        if (!paper[k][i]) continue;
        let dx = i % SYM_W;
        let dy = ~~(i/SYM_W);
        M[(y-bb.y)*SYM_W+dy][(x-bb.x)*SYM_W+dx] = 1;
      }
    }else if (SYMBOLS[paper[k]]){
      let s = SYMBOLS[paper[k]];
      for (let i = 0; i < s.length; i++){
        for (let j = 0; j < s[i].length; j++){
          if (s[i][j] != '.'){
            M[(y-bb.y)*SYM_W+i][(x-bb.x)*SYM_W+j] = 1;
          }
        }
      }
    }else{
      console.log('?',k);
    }
    
  }
  return M;
}


function draw_export_img(){
  let bb = get_bbox(paper);
  bb.x -= 2;
  bb.y -= 2;
  bb.w += 4;
  bb.h += 4;
  let cnv = document.createElement('canvas');
  cnv.width = (bb.w) * SYM_W;
  cnv.height = (bb.h) * SYM_W;
  let ctx = cnv.getContext('2d');
  ctx.fillStyle="white";
  ctx.fillRect(0,0,cnv.width,cnv.height);
  ctx.fillStyle="black";
  
  for (let k in paper){
    let [x,y] = k.split(',').map(Number);
    if (typeof paper[k] == 'object'){
      for (let i = 0; i < paper[k].length; i++){
        if (!paper[k][i]) continue;
        let dx = i % SYM_W;
        let dy = ~~(i/SYM_W);
        ctx.fillRect(((x-bb.x)*SYM_W+dx), ((y-bb.y)*SYM_W+dy), 1,1);
      }
    }else if (SYMBOLS[paper[k]]){
      let s = SYMBOLS[paper[k]];
      for (let i = 0; i < s.length; i++){
        for (let j = 0; j < s[i].length; j++){
          if (s[i][j] != '.'){
            ctx.fillRect((x-bb.x)*SYM_W+j,(y-bb.y)*SYM_W+i,1,1)
          }
        }
      }
    }else{
      console.log('?',k);
    }
    
  }
  return cnv;
}


function time_str(){
  return new Date().toLocaleString('en-US', { hour12: false }).replace(/[\/:,]/g,'-').replace(/ /g,'');
}

function export_png(){
  let link = document.createElement('a');
  link.download = `l-2d_export_${time_str()}.png`;
  link.href = draw_export_img().toDataURL()
  link.click();
}

function export_svg(){
  let link = document.createElement('a');
  link.download = `l-2d_export_${time_str()}.svg`;
  let M = to_dot_matrix();
  link.href = "data:image/svg;charset=utf-8," + encodeURIComponent(draw_svg(trace(M),M[0].length*2,M.length*2));
  link.click();
}

function export_json(){
  let link = document.createElement('a');
  link.download = `l-2d_export_${time_str()}.json`;
  link.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(paper));
  link.click();
}

function import_json(){
  let fsel = document.createElement('input');
  fsel.type = 'file';
  fsel.addEventListener('change', (event) => {
    const fileList = event.target.files;
    let reader = new FileReader();
    reader.addEventListener('load', (event) => {
      const result = event.target.result;
      paper = JSON.parse(result);
    });
    reader.readAsText(fileList[0]);
  });
  
  fsel.click();
}

function recog_all_symbols(){
  for (let k in paper){
    if (typeof paper[k] == 'object'){
      let u = paper[k].map(x=>(x?'#':'.')).join('');
      for (let s in SYMBOLS){
        if (SYMBOLS[s].join('') == u){
          paper[k] = s;
          break;
        }
      }
    }
  }
}

function bake(){
  let np = JSON.parse(JSON.stringify(paper));
  for (let k in slidervals){
    let v = slidervals[k].val.toString();
    np[k] = 'slider_l:'+v;
  }
  return np;
}

function import_png(){
  let fsel = document.createElement('input');
  fsel.type = 'file';
  fsel.addEventListener('change', (event) => {
    const fileList = event.target.files;
    let reader = new FileReader();
    reader.addEventListener('load', (event) => {
      const result = event.target.result;
      var img = new Image();
      img.src = result;
      img.onload = function(){
        let c = document.createElement('canvas').getContext('2d');
        c.canvas.width = img.width;
        c.canvas.height = img.height;
        c.drawImage(img,0,0);
        let data = c.getImageData(0,0,img.width,img.height).data;
        let np = {};
        for (let i = 0; i < img.width*img.height; i++){
          let v = data[i*4]>128 ? 0: 1;
          if (v){
            let x = ~~((i % img.width)/SYM_W);
            let y = ~~((~~(i / img.width))/SYM_W);
            let k = `${x},${y}`;
            if (!np[k]) np[k] = new Array(SYM_W*SYM_W).fill(0);
            let dx = (i % img.width)%SYM_W;
            let dy = (~~(i/img.width))%SYM_W;
            np[k][dy*SYM_W+dx] = 1;
          }
        }
        paper = np;
        recog_all_symbols();
        // console.log(M);

      }
      
    });
    reader.readAsDataURL(fileList[0]);
  });
  
  fsel.click();
}

function draw_ans_paper(){
  ctx.save()
  for (let k in ans_paper){
    let [x,y] = k.split(',').map(Number);
    if (typeof ans_paper[k] == 'object'){
      // ctx.globalAlpha=0.6;
      ctx.fillStyle=RED;
      for (let i = 0; i < ans_paper[k].length; i++){
        if (!ans_paper[k][i]) continue;
        let dx = i % SYM_W;
        let dy = ~~(i/SYM_W);
        ctx.fillRect((x*SYM_W+dx)*PIX_W, (y*SYM_W+dy)*PIX_W, PIX_W,PIX_W);
      }
    }else{
      ctx.drawImage(tool_btns[ans_paper[k]],x*SYM_W*PIX_W,y*SYM_W*PIX_W);
    }
    
  }
  ctx.restore();
}

function draw_slidervals(){
  ctx.save();
  ctx.fillStyle=RED;
  for (let k in slidervals){
    let x = slidervals[k].pos;
    let y = Number(k.split(',')[1])
    let s = SYMBOLS['slider_ind'];
    for (let i = 0; i < s.length; i++){
      for (let j = 0; j < s[i].length; j++){
        if (s[i][j] != '.'){
          
          ctx.fillStyle=RED;
        }else{
          ctx.fillStyle=WHITE;
        }
        ctx.fillRect((x*SYM_W+j)*PIX_W,(y*SYM_W+i)*PIX_W,PIX_W,PIX_W);
      }
    }
    let v = ((~~(slidervals[k].val*100))/100).toString();
    // console.log(slidervals[k]);
    ctx.fillStyle=WHITE;
    ctx.fillRect((x*SYM_W)*PIX_W,((y+1)*SYM_W)*PIX_W,v.length*SYM_W*PIX_W,SYM_W*PIX_W);
    ctx.fillStyle=RED;
    
    draw_font(cnv,v,(x*SYM_W)*PIX_W,((y+1)*SYM_W)*PIX_W);
  }
  ctx.restore();
}

function draw_coord(){
  let [x,y] = get_symbol_space(mouseX,mouseY);
  coordcnv.getContext('2d').fillStyle=BLACK;
  coordcnv.getContext('2d').clearRect(0,0,coordcnv.width,coordcnv.height);
  draw_font(coordcnv,`x:${x.toString().padStart(3,'0')} y:${y.toString().padStart(3,'0')}`,0,0);
}



let mouseWasDown = false;
let pen_color = 0;
let particles = [];
let slidervals = {};

// const synth = new Tone.PolySynth(Tone.Synth).toDestination();

let anim_spd = 4;

function loop(){
  requestAnimationFrame(loop);

  draw_bg();
  draw_graph();
  draw_selection();
  draw_slidervals();
  draw_grid();
  draw_cursor();
  draw_coord();
  
  
  if (anim){
    ctx.save();
    ctx.fillStyle=RED;
    let n = 1000;
    let spd = anim_spd;
    for (let i = Math.max(0,anim.i-n); i < Math.min(anim.i+1,visits.length); i++){
      let [x,y] = visits[i];
      ctx.globalAlpha = Math.pow((i-(anim.i-n))/n,8)*0.99+0.01;
      ctx.fillRect(x*SYM_W*PIX_W, y*SYM_W*PIX_W, PIX_W*SYM_W,PIX_W*SYM_W);
    }
    ctx.restore();
    for (let i = 0; i < spd; i++){
      let [x,y] = visits[anim.i];
      let k = `${x},${y}`
      if (typeof paper[k] == 'string'){
        if (!paper[k].startsWith('wire_')){
          particles.push({x:(x+0.5)*SYM_W*PIX_W,y:(y+0.5)*SYM_W*PIX_W,t:0});
          // synth.triggerAttackRelease("C4", "8n", Tone.now())
        }
        osc.frequency.setValueAtTime(symbol_to_freq[paper[k]], audioCtx.currentTime);
      }
      anim.i++;
      if (anim.i >=visits.length){
        break;
      }
    }
    if (anim.i >= visits.length){
      ans_paper = anim.ans;
      anim = null;
      osc.stop();
    }
  }else{
    draw_ans_paper();
  }
  for (let i = particles.length-1; i>=0; i--){
    let {x,y,t} = particles[i];
    let r = SYM_W*PIX_W+t*10;
    
    ctx.save();
    ctx.fillStyle=RED;
    ctx.globalAlpha = Math.pow(t*0.1-1,2);
    ctx.fillRect(x-r/2,y-r/2,r,r);
    ctx.restore();
    
    particles[i].t ++;
    if (particles[i].t >= 10){
      particles.splice(i,1);
    }
  }
  
  
  if (mouseIsDown){
    let [x,y] = get_symbol_space(mouseX,mouseY);
    let key = `${x},${y}`;
    if (CURR_TOOL == 'freehand'){
      if (typeof paper[key] != 'object'){
        paper[key] = new Array(SYM_W*SYM_W).fill(0);
      }
      let [ox,oy] = get_screen_space(x,y);
      let dx = ~~((mouseX-ox)/PIX_W);
      let dy = ~~((mouseY-oy)/PIX_W);
      let idx = dy*SYM_W+dx;
      if (!mouseWasDown) pen_color = Number(!paper[key][idx]);
      paper[key][idx] = pen_color;
      
    }else if (CURR_TOOL == "erase"){
      let [x,y] = get_symbol_space(mouseX,mouseY);
      delete paper[key];
    }else if (CURR_TOOL == 'select'){
      let [x,y] = get_symbol_space(mouseX,mouseY);
      
      for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
          let kk = `${x+j},${y+i}`;
          if (paper[kk]){
            selection.add(kk);
          }
        }
      }
    }else if (CURR_TOOL == 'interact'){
      if (paper[key] == 'entry'){
        ans_paper = run_all(bake(paper),key);
      }else if (paper[key] == 'slider_ind' || paper[key] == 'slider_l' || paper[key] == 'slider_r' || paper[key] == 'wire_we'){
        let l = x;
        let r = x;
        let m = x;
        let kk;
        
        while ((kk = `${l},${y}`,1) && (paper[kk] == 'slider_r' || paper[kk] == 'wire_we' || ((paper[kk] == 'slider_ind')?(m=l,1):0)   )){
          l--;
        }
        while ((kk = `${r},${y}`,1) && (paper[kk] == 'slider_l' || paper[kk] == 'wire_we' || ((paper[kk] == 'slider_ind')?(m=r,1):0)   )){
          r++;
        }
 
        function parse_num(x,y){
          let n = paper[`${x},${y}`][4];
          n = (n=='i')?'-':n;
          let i = 1;
          while (paper[`${x+i},${y}`] && paper[`${x+i},${y}`].startsWith('num_')){
            let d = paper[`${x+i},${y}`][4];
            n += (d=='d')?'.':d;
            i++;
          }
          return Number(n);
        }
        if (paper[`${l},${y}`] == 'slider_l' && paper[`${r},${y}`] == 'slider_r'){
          let smin = parse_num(l,y-1);
          let smax = parse_num(r,y-1);
          let scur = parse_num(m,y-1);
          // console.log(smin,smax,scur);
          let pct = (mouseX - (l+1) * SYM_W * PIX_W) / ((r-l-1) * SYM_W * PIX_W);
          pct = Math.min(Math.max(pct,0),1);
          
          let val = smin+(smax-smin)*pct;
          
          slidervals[`${l},${y}`] = {
            pct,val,
            pos:Math.min(r-1,~~(l+1+pct*(r-l-1))),
            
          }
        }
      }
    }else if (CURR_TOOL == 'comment'){
      let [x,y] = get_symbol_space(mouseX,mouseY);
      

      let t = prompt("type text","hello world!");
      mouseWasDown = mouseIsDown = false;
      let f = prompt("size & font (e.g. 10px Arial)","default");
      mouseWasDown = mouseIsDown = false;
      if (t && f){
        rasterize_text(t,x,y,f);
      }
    }else{
      let [x,y] = get_symbol_space(mouseX,mouseY);
      paper[key] = CURR_TOOL;
    }
  }
  mouseWasDown = mouseIsDown;
  
  if (CURR_TOOL != 'select'){
    selection = new Set();
  }
  
  
}
loop();


let worker;
let is_working = false;

function cont_eval_loop(){
  requestAnimationFrame(cont_eval_loop);
  if (!worker){
    worker = new Worker('worker.js');
    worker.onmessage = function(e) {
      ans_paper = e.data;
      is_working=false;
    }
  }
  // console.log(is_cont_eval , is_working)
  if (is_cont_eval && !is_working){
    worker.postMessage(bake(paper));
    is_working=true;
  }
  
}
cont_eval_loop()