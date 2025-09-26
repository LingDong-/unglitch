/*global describe globalThis*/

var SPL_DIST = 4;
var SEP_DIST = 10;
var COH_DIST = 1;
var SEP_COEF = 8;
var COH_COEF = 1;
var WAL_COEF = 100;
var GRD_COEF = 0;
var WAL_POWR = 2;
var SEP_POWR = 2;
var RESAMP = 5;
var JIGGLE = 0.1;
var BBOX_X = 0;
var BBOX_Y = 0;
var BBOX_W = 200;
var BBOX_H = 200;
var SCALE_X = 1;
var SCALE_Y = 1;
var GRD_SIZE = 10;
var MAX_FORCE = 4;

// console.log(globalThis);

function resamp_all(nodes,md){
  for (let k in nodes){
    let {xy,ns} = nodes[k];
    for (let i = 0; i < ns.length; i++){
      
      let [x,y] = nodes[ns[i]].xy;
      let d = Math.hypot(x-xy[0], y-xy[1]);
      let n = ~~(d/md);
      if (n > 0){
        split_edge(nodes,k,ns[i],~~(d/md));
        resamp_all(nodes,md);
      }
    }
  }

}

function short_id(){
  var id = "";
  for (var i = 0; i < 7; i++){
    id+=String.fromCharCode(~~(Math.random()*26)+0x61);
  }
  return id;
}

function split_edge(nodes,id0,id1,n){

  let i0 = nodes[id0].ns.indexOf(id1);
  let i1 = nodes[id1].ns.indexOf(id0);

  if (i0 == -1 || i1 == -1) return;
  
  nodes[id0].ns.splice(i0,1);
  nodes[id1].ns.splice(i1,1);

  let ids = new Array(n).fill(0).map(x=>('#'+short_id()));

  let a = id0;
  for (let i = 0; i < n; i++){
    let t = (i+1)/(n+1);

    nodes[ids[i]] = {xy:[
      nodes[id0].xy[0]*(1-t)+nodes[id1].xy[0]*t,
      nodes[id0].xy[1]*(1-t)+nodes[id1].xy[1]*t,
    ],ns:[a,(i<n-1)?ids[i+1]:id1]}

    nodes[a].ns.push(ids[i]);
    a = ids[i];
  }
  nodes[id1].ns.push(ids.at(-1));

  for (let k in nodes){
    nodes[k].ns = Array.from(new Set(nodes[k].ns));
  }

}

function space_hash(nodes,gs=1){
  let bins = {};
  for (let k in nodes){
    let xi = Math.floor(nodes[k].xy[0]/gs);
    let yi = Math.floor(nodes[k].xy[1]/gs);
    let id = xi+','+yi;
    if (!bins[id]){
      bins[id] = [];
    }
    bins[id].push(k);
  }
  function query(x,y,r){
    let x0 = Math.floor((x-r)/gs);
    let x1 = Math.floor((x+r)/gs);
    let y0 = Math.floor((y-r)/gs);
    let y1 = Math.floor((y+r)/gs);
    let out = [];
    // if (y1-y0 > 1 || x1 - x0 > 1){
    //   console.log(x,y,r,y1-y0,x1-x0);
    // }
    for (let yi = y0; yi <= y1; yi++){
      for (let xi = x0; xi <= x1; xi++){
        let id = xi+','+yi;
        if (!bins[id]) continue;
        for (let i = 0; i < bins[id].length; i++){
          let [u,v] = nodes[bins[id][i]].xy;
          let d = Math.hypot(x-u,y-v);
          if (d < r){
            out.push(bins[id][i]);
          }
        }
      }
    }
    return out;
  }
  return query;
}




function simulate_step(nodes){
  let pairs = [];
  for (let k in nodes){
    let {xy,ns} = nodes[k];
    for (let i = 0; i < ns.length; i++){   
      let [x,y] = nodes[ns[i]].xy;
      let d = Math.hypot(x-xy[0], y-xy[1]);
      if (d > SPL_DIST){
        pairs.push([k,ns[i]]);
      }
    }
  }
  for (let i = 0; i < pairs.length; i++){
    split_edge(nodes,...pairs[i],1);
  }
  let sq = space_hash(nodes,7);

  //cohesion
  for (let k in nodes){
    if (!nodes[k].f) nodes[k].f = [0,0];

    let {xy,ns,f} = nodes[k];
    let [x0,y0] = xy;

    for (let i = 0; i < ns.length; i++){      
      let [x1,y1] = nodes[ns[i]].xy;
      let d= Math.hypot(x0-x1,y0-y1);
      if (d > COH_DIST){
        f[0] += (x1-x0) * COH_COEF;
        f[1] += (y1-y0) * COH_COEF;
      }
    }
  }

  //separation
  for (let k in nodes){
    let {xy,f} = nodes[k];
    let [x0,y0] = xy;
    let ns = sq(x0,y0,SEP_DIST);
    for (let i = 0; i < ns.length; i++){     
      if (ns[i]==k){
        continue;
      } 
      let [x1,y1] = nodes[ns[i]].xy;
      let d= Math.hypot(x0-x1,y0-y1);
      
      f[0] -= (x1-x0)/Math.pow(d,SEP_POWR) * SEP_COEF;
      f[1] -= (y1-y0)/Math.pow(d,SEP_POWR) * SEP_COEF;
    }
  }

  //bbox repel
  for (let k in nodes){
    let {xy,f} = nodes[k];
    let [x0,y0] = xy;

    f[0] += WAL_COEF/Math.pow(Math.abs(x0-BBOX_X),WAL_POWR) //* Math.sign(x0-BBOX_X);
    f[1] += WAL_COEF/Math.pow(Math.abs(y0-BBOX_Y),WAL_POWR) //* Math.sign(y0-BBOX_Y);
    f[0] -= WAL_COEF/Math.pow(Math.abs(x0-(BBOX_X+BBOX_W)),WAL_POWR) //* Math.sign(x0-(BBOX_X+BBOX_W));
    f[1] -= WAL_COEF/Math.pow(Math.abs(y0-(BBOX_Y+BBOX_H)),WAL_POWR) //* Math.sign(y0-(BBOX_Y+BBOX_H));
  }
  
  
  for (let k in nodes){
    let {xy,f,ns} = nodes[k];
    let [x0,y0] = xy;
    let xt = Math.round(x0/GRD_SIZE)*GRD_SIZE;
    let yt = Math.round(y0/GRD_SIZE)*GRD_SIZE;
    
    if (ns.length == 2){
      let [x1,y1] = nodes[ns[0]].xy;
      let [x2,y2] = nodes[ns[1]].xy;
      if (Math.abs(x1-x2)>Math.abs(y1-y2)){
        f[1] += (yt-y0)*GRD_COEF;
      }else{
        f[0] += (xt-x0)*GRD_COEF;
      }
    }else{
      f[0] += (xt-x0)*GRD_COEF;
      f[1] += (yt-y0)*GRD_COEF;
    }




  }

  for (let k in nodes){
    let {xy,f} = nodes[k];
    f[0] = Math.min(Math.abs(f[0]),MAX_FORCE)*Math.sign(f[0]);
    f[1] = Math.min(Math.abs(f[1]),MAX_FORCE)*Math.sign(f[1]);
    
    xy[0] += f[0]*0.1;
    xy[1] += f[1]*0.1;
    f[0] *= 0.1;
    f[1] *= 0.1;
  }

}


function init(nodes){
  for (let k in nodes){
    nodes[k].xy[0] *= SCALE_X;
    nodes[k].xy[1] *= SCALE_Y;
  }
  resamp_all(nodes,RESAMP);
  for (let k in nodes){
    nodes[k].xy[0] += Math.random()*JIGGLE;
    nodes[k].xy[1] += Math.random()*JIGGLE;
  }
  postMessage(nodes);
}

function step(nodes){
  simulate_step(nodes);
  postMessage(nodes);
}

onmessage = (e) => {
  let [cmd,dat] = e.data;
  if (cmd == 'init'){
    init(dat)
  }else if (cmd == 'step'){
    step(dat);
  }else if (cmd == 'set'){
    globalThis[dat[0]]=dat[1];
  }
};


