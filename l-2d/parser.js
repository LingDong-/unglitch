/* global include FONT SYMBOLS SYM_W PIX_W cnv_view*/
try{let _ = SYM_W}catch(e){SYM_W = 5;}

let visits = [];

function follow_wire(paper,x,y,dir){
  visits.push([x,y]);
  // console.log(x,y,dir);
  let k = `${x},${y}`;
  let dirs = {
    'n':[0,-1],
    's':[0,1],
    'e':[1,0],
    'w':[-1,0],
  }
  let flip = {
    'n':'s',
    's':'n',
    'w':'e',
    'e':'w',
  }
  if (typeof paper[k] == 'object'){
    return [x,y];
  }
  if (!paper[k]){
    throw `disconnected wire at ${x} ${y}`;
    
  }else if (paper[k] == 'wire_nswe'){
    let [dx,dy] = dirs[dir];
    return follow_wire(paper,x+dx,y+dy,dir);
    
  }else if (paper[k].startsWith('wire')){

    let d0 = paper[k][5];
    let d1 = paper[k][6];
    
    if (flip[dir] == d0){
      let [dx,dy] = dirs[d1];
      return follow_wire(paper,x+dx,y+dy,d1);
    }else if (flip[dir] == d1){
      let [dx,dy] = dirs[d0];
      return follow_wire(paper,x+dx,y+dy,d0);
    }else{
      throw `disconnected wire at ${x} ${y}`;
    }
    
  }else if (paper[k].startsWith('joint')){
    
    let d0 = paper[k][6];
    let d1 = paper[k][7];
    let d2 = paper[k][8];
    
    if (flip[dir] == d0){
      // console.log(dir,paper[k])
      throw `ambiguous fork at ${x} ${y}`;
    }else if (flip[dir] == d1 || flip[dir] == d2){
      let [dx,dy] = dirs[d0];
      return follow_wire(paper,x+dx,y+dy,d0);
    }else{
      throw `disconnected wire at ${x} ${y}`;
    }
  }else{
    return [x,y];
  }
}


let lib = {
  'op_plus' : (x)=>(y)=>(x+y),
  'op_mul' : (x)=>(y)=>(x*y),
  'op_minus' : (x)=>(y)=>(x-y),
  'op_div' : (x)=>(y)=>(x/y),
  'op_mod' : (x)=>(y)=>(x%y),
  'op_pow' : (x)=>(y)=>(x**y),
  'op_if' :  (x)=>(y)=>(z)=>(x?y():z()),
  'op_eq' : (x)=>(y)=>((x==y)?1:0),
  'op_neq' : (x)=>(y)=>((x!=y)?1:0),
  'op_lt' : (x)=>(y)=>((x<y)?1:0),
  'op_gt' : (x)=>(y)=>((x>y)?1:0),
  'op_leq' : (x)=>(y)=>((x<=y)?1:0),
  'op_geq' : (x)=>(y)=>((x>=y)?1:0),
  'op_sin' : (x)=>Math.sin(x),
  'op_cos' : (x)=>Math.cos(x),
  'op_atan2' : (y)=>(x)=>Math.atan2(y,x),
  'op_and' : (x)=>(y)=>(x && y),
  'op_or' : (x)=>(y)=>(x || y),
  'op_not' : (x)=>(!x),
  'op_w' : (x)=>(x[0].length),
  'op_h' : (x)=>(x.length),
  'op_floor':(x)=>(Math.floor(x)),
  'pix_read' : (im)=>(x)=>(y)=>{try{return im[y][x]}catch(e){return 0}},
  'pix_write': (im)=>(x)=>(y)=>(v)=>{let o=JSON.parse(JSON.stringify(im));try{o[y][x]=v;}catch(e){}return o;},
  // 'pix_crop': (im)=>(x)=>(y)=>(w)=>(h)=>(im.slice(y,y+h).map(r=>r.slice(x,x+w))),
  'pix_crop': (im)=>(x)=>(y)=>(w)=>(h)=>{
    let m = new Array(h).fill(0).map(x=>new Array(w).fill(0));
    for (let i = y; i < y + h; i++){
      for (let j = x; j < x + w; j++){
        try{m[i-y][j-x] = im[i][j]||0;}catch(e){};
      }
    }
    return m;
  },
  'op_rand': (x)=>(Math.random()*x),
  'op_time': (x)=>(new Date().getTime()-x),
}

function parse_frame(paper,x,y){
  // let sym_w = 0;
  // for (let k in paper){
  //   if (typeof paper[k] == 'object'){
  //     sym_w = ~~Math.sqrt(paper[k].length);
  //     break;
  //   }
  // }
  let sym_w = SYM_W;
  
  let bw = 0;
  let bh = 0;
  while(paper[`${x+1+bw},${y}`] == 'wire_we'){
    bw ++;
  }
  while(paper[`${x},${y+1+bh}`] == 'wire_ns'){
    bh ++;
  }
  let w = bw*sym_w;
  let h = bh*sym_w; 
  
  let data = new Array(h).fill(0).map(x=>new Array(w).fill(0));
  for (let i = 0; i < bh; i++){
    for (let j = 0; j < bw; j++){
      for (let n = 0; n < sym_w; n++){
        for (let m = 0; m < sym_w; m++){
          // console.log(i*sym_w+n,j*sym_w+m)
          let p = paper[`${x+1+j},${y+1+i}`];
          if (p && typeof p != 'object'){
            p = SYMBOLS[p].join('').split('').map(x=>(x=='.'?0:1));
          }
          data[i*sym_w+n][j*sym_w+m] = (p && typeof p == 'object') ? p[n*sym_w+m] : 0;
        }
      }
    }
  }
  return data;
}

// let dbgcnv = document.createElement('canvas');
// dbgcnv.width = PIX_W*SYM_W*128;
// dbgcnv.height = PIX_W*SYM_W*128;
// document.body.appendChild(dbgcnv);
// dbgcnv.style = `position:absolute;left:0px;top:0px;cursor:none;pointer-events:none`;
// let dbgctx = dbgcnv.getContext('2d');
// cnv_view.appendChild(dbgcnv);
// document.body.appendChild(cnv_view);

// var call= function(f,x){
//   try{
//     return f(x);
//   }catch(e){
//     console.log(f,x);
//   }
// }

function parse(paper, entry_pt){
  let is_arg = {};
  let in_lib = {};
  


  function parse_at(x,y,funs){
    visits.push([x,y]);
    let k = `${x},${y}`;
    // console.log(x,y,paper[k]);
    
    // dbgctx.fillStyle="rgba(255,0,0,0.01)";
    // dbgctx.fillRect(x*SYM_W*PIX_W,y*SYM_W*PIX_W,SYM_W*PIX_W,SYM_W*PIX_W);
    
    if (typeof paper[k] == 'string'){
      if (paper[k].startsWith('end_')){
        if (is_arg[k]){
          return `v${x}_${y}`
        }else{
          if (paper[k][4] == 's'){
            return parse_at(...follow_wire(paper,x,y+1,'s'),funs);
          }else{
            return parse_at(...follow_wire(paper,x+1,y,'e'),funs);
          }
        }
      }else if (paper[k] == 'func_call'){
        let arg = follow_wire(paper,x,y-1,'n');
        let fun = follow_wire(paper,x,y+1,'s');
        return "(" + parse_at(...fun,funs) + ")(" + parse_at(...arg,funs) + ")";
        
        // return "call(" + parse_at(...fun,funs) + "," + parse_at(...arg,funs) + ")";
        
      }else if (paper[k].startsWith('num_') || (paper[k] == 'op_minus' && typeof paper[`${x+1},${y}`] == 'string' && paper[`${x+1},${y}`].startsWith('num'))  ){
        let n = paper[k].startsWith('num_') ? paper[k][4] : '-';
        let i = 1;
        while (paper[`${x+i},${y}`] && paper[`${x+i},${y}`].startsWith('num_')){
          let d = paper[`${x+i},${y}`][4];
          n += (d=='d')?'.':d;
          i++;
        }
        return n;
      }else if (paper[k] == 'func_def'){
        is_arg[`${x+1},${y}`] = true;

        if (funs.includes(`${x},${y}`)){
          return `f${x}_${y}`;
        }else{
          funs = funs.concat([`${x},${y}`]);
          return `(f${x}_${y}=(v${x+1}_${y})=>(${parse_at(x+2,y,funs)}))`;
        }

      }else if (lib[paper[k]]){
        in_lib[paper[k]] = true;
        return paper[k];
      }else if (paper[k] == 'frame_tl'){
        
        return JSON.stringify(parse_frame(paper,x,y));
      }else if (paper[k] == 'slider_l'){
        let i = 0;
        do{
          i++;
        }while(paper[`${x+i},${y}`] != 'slider_ind')
        return parse_at(x+i,y-1,funs);
      }else if (paper[k].startsWith(`slider_l:`)){
        
        return "("+paper[k].split(':')[1]+")";
      
      }else{
        throw `unrecognized symbol at ${x} ${y} : ${paper[k]}`
      }
    }else{
      for (let l in paper){
        if (paper[l] != 'label'){
          continue;
        }
        let [u,v] = l.split(',').map(Number);
        if (paper[`${u+1},${v}`].join('') != paper[k].join('')){
          continue;
        }
        return parse_at(...follow_wire(paper,u-1,v,'w'),funs);
      }
      
    }
  }

  if (!entry_pt){
    for (let k in paper){
      let [x,y] = k.split(',').map(Number);
      if (paper[k] == 'entry'){
        entry_pt = [x,y];
      }
    }
  }
  let o = parse_at(entry_pt[0]+1,entry_pt[1],[]);
  let libstr = ``;
  for (let l in in_lib){
    libstr += `${l} = ${lib[l].toString()};\n`
  }
  return libstr+'\n'+o;
}

function run_all(paper,k0){
  visits = [];
  
  let ans = {};
  for (let k in paper){
    if (k0 && k != k0) continue;
    let [x,y] = k.split(',').map(Number);
    if (paper[k] == 'entry'){
      let js = parse(paper,[x,y]);
      let ret = eval(js);
      
      let ax,ay;
      if (paper[`${x+2},${y}`] == 'end_s'){
        [ax,ay] = follow_wire(paper,x+2,y+1,'s');
      }else if (paper[`${x+2},${y}`] == 'end_e'){
        [ax,ay] = follow_wire(paper,x+3,y,'e');
      }
      
      let data = parse_frame(paper,ax,ay);
      
      if (typeof ret == 'number'){
        let s = ret.toString();
        for (let n = 0; n < s.length; n++){
          
          let q = s[n].toLowerCase();
          if (!FONT[q]){
            continue;
          }
          for (let i = 0; i < FONT[q].length; i++){
            for (let j = 0; j < FONT[q][i].length; j++){
              let v = (FONT[q][i][j] == '.')?0:1;
              let key = `${ax+1+n},${ay+1}`;
              let idx = i * SYM_W + j;
              if (!ans[key]) ans[key] = new Array(SYM_W*SYM_W).fill(0);
              ans[key][idx] = v;
            }
          }
        }
      }else if (typeof ret == 'object'){
        for (let i = 0; i < ret.length; i++){
          for (let j = 0; j < ret[i].length; j++){
            let key = `${ax+1+(~~(j/SYM_W))},${ay+1+(~~(i/SYM_W))}`;
            let idx = (i%SYM_W) * SYM_W + (j%SYM_W);
            if (!ans[key]) ans[key] = new Array(SYM_W*SYM_W).fill(0);
            ans[key][idx] = ret[i][j]?1:0;
          }
        }
      }
    }
  }
  return ans;
}