let TESTPRGMS = {
adder:`
inp a b c
nor d a b
nor e a d
nor f b d
nor g e f
nor h g c
nor i g h
nor j h c
nor k i j
nor l h d
out k l
`,
not:`
inp a
not b a
out b
`,
or:`
inp a b
or  c a b
out c
`,
and:`
inp a b
and c a b
out c
`,
xor:`
inp a b
not !a a
not !b b
and a&!b a !b
and b&!a b !a
or  a^b a&!b b&!a
out a^b
`,
flipflop:`
inp r s
nor q r p
nor p s q
out q p

`
}

let dirty = true;

function parse_txt(txt){
  return txt.split("\n").filter(x=>x.length && x[0] != '#').map(x=>x.split(" ").map(y=>y.trim()).filter(x=>x.length)).filter(x=>x.length);
}

function generate_tree(prgm){
  let nodes = {};
  for (let i = 0; i < prgm.length; i++){
    let words = prgm[i];
    if (words[0] == 'inp' || words[0] == 'out'){
      for (let j = 1; j < words.length; j++){
        nodes[words[j]] = {to:[]}
      }
    }else{
      nodes[words[1]] = {to:[]}
    }
  }
  // console.log(JSON.stringify(nodes));
  for (let i = 0; i < prgm.length; i++){
    let words = prgm[i];
    if (words[0] == 'inp'){
      for (let j = 1; j < words.length; j++){
        nodes[words[j]].type = "inp";
      }
    }else if (words[0] == 'nor'){
      if (nodes[words[1]].type){
        let nk = words[1]+'*'+'Y';
        nodes[nk] = {
          type:"nor",
          to:[words[1]],
        }
        for (let j = 2; j < words.length; j++){
          nodes[words[j]].to.push(nk);
        }
      }else{
        nodes[words[1]].type = "nor";
        for (let j = 2; j < words.length; j++){
          nodes[words[j]].to.push(words[1]);
        }
      }
    }else if (words[0] == 'not'){
      let k0 = words[1]+'*'+'!';
      let k1 = words[1];
      nodes[k0] = {
        type:"frk",
        to:[k1,k1],
      }
      nodes[k1].type = "nor";
      nodes[words[2]].to.push(k0);
      
    }else if (words[0] == 'or'){
      let k0 = words[1]+'*'+'|0';
      let k1 = words[1]+'*'+'|1';
      let k2 = words[1];
      nodes[k0] = {
        type:"nor",
        to:[k1],
      }
      nodes[k1] = {
        type:"frk",
        to:[k2,k2],
      }
      nodes[k2].type = "nor";
      
      nodes[words[2]].to.push(k0);
      nodes[words[3]].to.push(k0);
      
    }else if (words[0] == 'and'){
      let k0 = words[1]+'*'+'&0';
      let k1 = words[1]+'*'+'&1';
      let k2 = words[1]+'*'+'&2';
      let k3 = words[1]+'*'+'&3';
      let k4 = words[1];
      nodes[k0] = {
        type:"frk",
        to:[k2,k2],
      }
      nodes[k1] = {
        type:"frk",
        to:[k3,k3],
      }
      nodes[k2] = {
        type:"nor",
        to:[k4],
      }
      nodes[k3] = {
        type:"nor",
        to:[k4],
      }
      nodes[k4].type = "nor";
      nodes[words[2]].to.push(k0);
      nodes[words[3]].to.push(k1);

    }else if (words[0] == 'out'){
      for (let j = 1; j < words.length; j++){
        let nk = words[j]+'*o';
        nodes[nk] = {
          type:'out',
          to:[],
        }
        nodes[words[j]].to.push(nk);
      }
    }
  }
  let forks;
  do{
    forks = {};
    for (let k in nodes){
      let q = nodes[k];
      
      if (q.type == 'frk'){
        if (q.to.length > 2){
          let nk = k+"*";
          forks[nk] = {
            type:"frk",
            to:q.to.slice(1),
          }
          q.to = [q.to[0],nk];
        }
      }else if (q.to.length > 1){
        let nk = k+"*";
        forks[nk] = {
          type:"frk",
          to:q.to,
        }
        q.to = [nk];
      }
    }
    Object.assign(nodes,forks);
    
  }while (Object.keys(forks).length);

  for (let k in nodes){
    nodes[k].from = [];
  }

  for (let k in nodes){
    let q = nodes[k];
    for (let i = 0; i < q.to.length; i++){
      nodes[q.to[i]].from.push(k);
    }
  }
  
  // function calc_lvl(k){
  //   return nodes[k].lvl ?? (nodes[k].lvl = Math.max(-1,...nodes[k].from.map(calc_lvl))+1);
  // }
  
  // function calc_lvl(k){
  //   return nodes[k].lvl ?? (nodes[k].lvl = Math.min(1,...nodes[k].to.map(calc_lvl))-1);
  // }
  
  function calc_lvl(k){
    
    function _calc_lvl(k,hist){
      if (hist.includes(k)){
        return 0;
      }
      return nodes[k].lvl ?? (nodes[k].lvl = Math.min(1,...nodes[k].to.map(c=>_calc_lvl(c,hist.concat(k))))-1);
    }
    return _calc_lvl(k,[]);
    
  }

  let nlvl = 0;
  for (let k in nodes){
    nlvl = Math.min(nlvl,calc_lvl(k));
  }
  
  for (let k in nodes){
    nodes[k].lvl-=nlvl;
  }
  for (let k in nodes){
    if (nodes[k].type == 'inp'){
      nodes[k].lvl = 0;
    }
    // if (nodes[k].type == 'out'){
    //   nodes[k].lvl = Math.max(nodes[k].lvl,-nlvl);
    // }
  }

  return nodes;
}
function prep_render(oldnodes, newnodes){
  let comnodes = {};
  
  let nlvl = Math.max(-1,...Object.values(newnodes).map(x=>x.lvl))+1;
  
  for (let l = 0; l < nlvl; l++){
    
    let ns = Object.keys(newnodes).filter(k=>newnodes[k].lvl == l);
    let os = Object.keys(oldnodes).filter(k=>oldnodes[k].lvl == l);
    
    
    for (let i = 0; i < ns.length; i++){
      comnodes[ns[i]] = {};
      
      let r = comnodes[ns[i]];
      let q = oldnodes[ns[i]];
      let p = newnodes[ns[i]];
      
      if (os.includes(ns[i]) && q.lvl == p.lvl){
        
        Object.assign(r,q,p);
      }else{
        Object.assign(r,p);
        r.rdr = {};
        r.rdr.x = (i)*64+32+p.lvl*8;
        r.rdr.y = p.lvl * 32+32;
        r.rdr.from_hands = [];
        r.rdr.to_hands = [];
      }
      r.rdr.from_hands = [];
      r.rdr.to_hands = [];
      for (let j = 0; j < p.from.length; j++){
        r.rdr.from_hands.push([0,0]);
      }
      for (let j = 0; j < p.to.length; j++){
        r.rdr.to_hands.push([0,0]);
      }
    }
  }
  console.log(comnodes);
  for (let k in comnodes){
    recomp_hands(comnodes,k);
  }
  return comnodes;
}

function get_wh(nodes){
  let w = 0;
  let h = 0;
  for (let k in nodes){
    w = Math.max(nodes[k].rdr.x,w);
    h = Math.max(nodes[k].rdr.y,h);
  }
  w += 32;
  h += 32;
  return [w,h];
}

function cubic_bezier(x0,y0,x1,y1,x2,y2,x3,y3,t){
  let s = 1-t;
  let s2 = s*s;
  let s3 = s*s2;
  let t2 = t*t;
  let t3 = t2*t;
  return [
    s3*x0+3*s2*t*x1+3*s*t2*x2+t3*x3,
    s3*y0+3*s2*t*y1+3*s*t2*y2+t3*y3,
  ]
}

function make_btn(name,fun){
  let btn = document.createElement("button");
  btn.innerHTML = name;
  btn.onclick = fun;
  document.body.appendChild(btn);
}

function make_select(lbl,names,funcs){
  let div = document.createElement("span");
  div.innerHTML = " " + lbl + ": ";
  let sel = document.createElement("select");
  for (let i = 0; i < names.length; i++){
    let opt = document.createElement("option");
    opt.innerHTML = names[i];
    sel.appendChild(opt);
  }
  sel.onchange = function(){
    funcs[sel.selectedIndex]();
  }
  div.appendChild(sel);
  document.body.appendChild(div);
}


make_select("example",Object.keys(TESTPRGMS),Object.values(TESTPRGMS).map(x=>function(){ ta.value=x;regenerate()  }))
make_btn("viewmode",function(){viewmode=(viewmode+1)%4;dirty=true});



function render(nodes){
  let [w,h] = get_wh(nodes);
  
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`;
  o += `<rect x="0" y="0" width="${w}" height="${h}" fill="white"/>`;
  
  
  // o += `<path d="M 10 10 C 10 35, 30 35, 30 60" stroke="black" fill="transparent"/>`
  for (let k in nodes){
    let q = nodes[k];
    let x = q.rdr.x;
    let y = q.rdr.y;
    for (let i = 0; i < q.to.length; i++){
      let p = nodes[q.to[i]];
      let x1 = p.rdr.x;
      let y1 = p.rdr.y;
      let [hx,hy] = q.rdr.to_hands[i];
      let gx,gy;
      if (p.from[0] == p.from[1]){
        ;[gx,gy] = p.rdr.from_hands[i];
      }else{
        ;[gx,gy] = p.rdr.from_hands[p.from.indexOf(k)];
      }
      if (viewmode == 2){
        o += `<path d="M ${x} ${y} ${x+hx} ${y+hy} M ${x1+gx} ${y1+gy}, ${x1} ${y1}" stroke="black" opacity="0.2" fill="none"/>`

        o += `<circle cx="${x+hx}" cy="${y+hy}" r="2"   fill="black" opacity="0.2"/>`;
        o += `<circle cx="${x1+gx}" cy="${y1+gy}" r="2" fill="black" opacity="0.2"/>`;
      }
            
      o += `<path d="M ${x} ${y} C ${x+hx} ${y+hy}, ${x1+gx} ${y1+gy}, ${x1} ${y1}" stroke="black" fill="none"/>`;

      // o += `<path d="M `;
      // for (let j = 0; j < 100; j++){
      //   let t = j/100;
      //   o += cubic_bezier(x,y,x+hx,y+hy,x1+gx,y1+gy,x1,y1,t)+" ";
      // }
      // o += `" stroke="black" fill="none"/>`
      // break;
    }
    // break;
  }
  if (viewmode > 0){
    for (let k in nodes){
      let q = nodes[k];
      let x = q.rdr.x;
      let y = q.rdr.y;
      o += `<circle cx="${x}" cy="${y}" r="4" fill="white" stroke="black"/>`;
      // o += `<text x="${x}" y="${y}" fill="black" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="12px">${k}</text>`;
      o += `<text x="${x+10}" y="${y}" fill="black" dominant-baseline="middle" font-family="sans-serif" font-size="12px">${k}</text>`;
    }
  }
  return o;
}

let nodes = {};
nodes = {"a":{"type":"inp","to":["a*"],"from":[],"lvl":0,"rdr":{"x":57,"y":32,"from_hands":[],"to_hands":[[0,24]]}},"b":{"type":"inp","to":["b*"],"from":[],"lvl":0,"rdr":{"x":109,"y":32,"from_hands":[],"to_hands":[[0,24]]}},"c":{"type":"inp","to":["c*"],"from":[],"lvl":0,"rdr":{"x":160,"y":32,"from_hands":[],"to_hands":[[0,24]]}},"d":{"type":"nor","to":["d*"],"from":["a*","b*"],"lvl":2,"rdr":{"x":80,"y":151,"from_hands":[[0,-24],[0,-24]],"to_hands":[[0,24]]}},"e":{"type":"nor","to":["g"],"from":["a*","d*"],"lvl":4,"rdr":{"x":58,"y":265,"from_hands":[[-32,-49],[0,-24]],"to_hands":[[0,48]]}},"f":{"type":"nor","to":["g"],"from":["b*","d**"],"lvl":5,"rdr":{"x":121,"y":287,"from_hands":[[0,-96],[0,-24]],"to_hands":[[0,24]]}},"g":{"type":"nor","to":["g*"],"from":["e","f"],"lvl":6,"rdr":{"x":82,"y":365,"from_hands":[[0,-48],[0,-24]],"to_hands":[[0,24]]}},"h":{"type":"nor","to":["h*"],"from":["c*","g*"],"lvl":8,"rdr":{"x":108,"y":504,"from_hands":[[1,-54],[0,-24]],"to_hands":[[0,24]]}},"i":{"type":"nor","to":["k"],"from":["g*","h*"],"lvl":10,"rdr":{"x":57,"y":614,"from_hands":[[0,-72],[0,-24]],"to_hands":[[0,48]]}},"j":{"type":"nor","to":["k"],"from":["c*","h**"],"lvl":11,"rdr":{"x":134,"y":727,"from_hands":[[19,-115],[0,-24]],"to_hands":[[0,24]]}},"k":{"type":"nor","to":["k*o"],"from":["i","j"],"lvl":12,"rdr":{"x":108,"y":772,"from_hands":[[0,-48],[0,-24]],"to_hands":[[0,24]]}},"l":{"type":"nor","to":["l*o"],"from":["d**","h**"],"lvl":11,"rdr":{"x":184,"y":736,"from_hands":[[12,-280],[0,-24]],"to_hands":[[0,24]]}},"k*o":{"type":"out","to":[],"from":["k"],"lvl":13,"rdr":{"x":99,"y":848,"from_hands":[[0,-24]],"to_hands":[]}},"l*o":{"type":"out","to":[],"from":["l"],"lvl":12,"rdr":{"x":192,"y":800,"from_hands":[[0,-24]],"to_hands":[]}},"a*":{"type":"frk","to":["d","e"],"from":["a"],"lvl":1,"rdr":{"x":55,"y":87,"from_hands":[[0,-24]],"to_hands":[[8,23],[-30,73]]}},"b*":{"type":"frk","to":["d","f"],"from":["b"],"lvl":1,"rdr":{"x":107,"y":87,"from_hands":[[0,-24]],"to_hands":[[0,24],[28,59]]}},"c*":{"type":"frk","to":["h","j"],"from":["c"],"lvl":1,"rdr":{"x":128,"y":424,"from_hands":[[0,-24]],"to_hands":[[-1,44],[38,197]]}},"d*":{"type":"frk","to":["e","d**"],"from":["d"],"lvl":3,"rdr":{"x":81,"y":181,"from_hands":[[0,-24]],"to_hands":[[0,24],[0,24]]}},"g*":{"type":"frk","to":["h","i"],"from":["g"],"lvl":7,"rdr":{"x":81,"y":413,"from_hands":[[0,-24]],"to_hands":[[0,24],[0,72]]}},"h*":{"type":"frk","to":["i","h**"],"from":["h"],"lvl":9,"rdr":{"x":98,"y":557,"from_hands":[[0,-24]],"to_hands":[[0,24],[0,24]]}},"d**":{"type":"frk","to":["f","l"],"from":["d*"],"lvl":4,"rdr":{"x":93,"y":233,"from_hands":[[0,-24]],"to_hands":[[0,24],[1,90]]}},"h**":{"type":"frk","to":["j","l"],"from":["h*"],"lvl":10,"rdr":{"x":108,"y":620,"from_hands":[[0,-24]],"to_hands":[[0,24],[0,24]]}}}
nodes = {"a":{"type":"inp","to":["a*"],"from":[],"lvl":0,"rdr":{"x":32,"y":32,"from_hands":[],"to_hands":[[2.6666666666666665,24]]}},"b":{"type":"inp","to":["b*"],"from":[],"lvl":0,"rdr":{"x":96,"y":32,"from_hands":[],"to_hands":[[2.6666666666666665,24]]}},"c":{"type":"inp","to":["c*"],"from":[],"lvl":0,"rdr":{"x":160,"y":32,"from_hands":[],"to_hands":[[6.666666666666667,162.75]]}},"d":{"type":"nor","to":["d*"],"from":["a*","b*"],"lvl":2,"rdr":{"x":73,"y":93,"from_hands":[[-11,-21.75],[10.333333333333334,-21.75]],"to_hands":[[4,24]]}},"e":{"type":"nor","to":["g"],"from":["a*","d*"],"lvl":5,"rdr":{"x":55,"y":170,"from_hands":[[-5,-79.5],[10,-33.75]],"to_hands":[[8.333333333333334,40.5]]}},"f":{"type":"nor","to":["g"],"from":["b*","d**"],"lvl":5,"rdr":{"x":149,"y":191,"from_hands":[[-15,-95.25],[-12.333333333333334,-24.75]],"to_hands":[[-23,24.75]]}},"g":{"type":"nor","to":["g*"],"from":["e","f"],"lvl":6,"rdr":{"x":80,"y":224,"from_hands":[[-8.333333333333334,-40.5],[23,-24.75]],"to_hands":[[-10.333333333333334,26.25]]}},"h":{"type":"nor","to":["h*"],"from":["c*","g*"],"lvl":8,"rdr":{"x":96,"y":288,"from_hands":[[28,-29.25],[-15.666666666666666,-21.75]],"to_hands":[[2.6666666666666665,24]]}},"i":{"type":"nor","to":["k"],"from":["g*","h*"],"lvl":11,"rdr":{"x":85,"y":357,"from_hands":[[-12,-73.5],[6.333333333333333,-27.75]],"to_hands":[[8.333333333333334,42]]}},"j":{"type":"nor","to":["k"],"from":["c*","h**"],"lvl":11,"rdr":{"x":118,"y":377,"from_hands":[[20.666666666666668,-96],[8.666666666666666,-24]],"to_hands":[[-2.6666666666666665,27]]}},"k":{"type":"nor","to":["k*o"],"from":["i","j"],"lvl":12,"rdr":{"x":110,"y":413,"from_hands":[[-8.333333333333334,-42],[2.6666666666666665,-27]],"to_hands":[[8.666666666666666,26.25]]}},"l":{"type":"nor","to":["l*o"],"from":["d**","h**"],"lvl":12,"rdr":{"x":192,"y":416,"from_hands":[[-26.666666666666668,-193.5],[-16,-53.25]],"to_hands":[[2.6666666666666665,24]]}},"k*o":{"type":"out","to":[],"from":["k"],"lvl":13,"rdr":{"x":136,"y":448,"from_hands":[[-8.666666666666666,-26.25]],"to_hands":[]}},"l*o":{"type":"out","to":[],"from":["l"],"lvl":13,"rdr":{"x":200,"y":448,"from_hands":[[-2.6666666666666665,-24]],"to_hands":[]}},"a*":{"type":"frk","to":["d","e"],"from":["a"],"lvl":1,"rdr":{"x":40,"y":64,"from_hands":[[-2.6666666666666665,-24]],"to_hands":[[11,21.75],[5,79.5]]}},"b*":{"type":"frk","to":["d","f"],"from":["b"],"lvl":1,"rdr":{"x":104,"y":64,"from_hands":[[-2.6666666666666665,-24]],"to_hands":[[-10.333333333333334,21.75],[15,95.25]]}},"c*":{"type":"frk","to":["h","j"],"from":["c"],"lvl":7,"rdr":{"x":180,"y":249,"from_hands":[[-6.666666666666667,-162.75]],"to_hands":[[-28,29.25],[-20.666666666666668,96]]}},"d*":{"type":"frk","to":["e","d**"],"from":["d"],"lvl":3,"rdr":{"x":85,"y":125,"from_hands":[[-4,-24]],"to_hands":[[-10,33.75],[9,24.75]]}},"g*":{"type":"frk","to":["h","i"],"from":["g"],"lvl":7,"rdr":{"x":49,"y":259,"from_hands":[[10.333333333333334,-26.25]],"to_hands":[[15.666666666666666,21.75],[12,73.5]]}},"h*":{"type":"frk","to":["i","h**"],"from":["h"],"lvl":9,"rdr":{"x":104,"y":320,"from_hands":[[-2.6666666666666665,-24]],"to_hands":[[-6.333333333333333,27.75],[13.333333333333334,18.75]]}},"d**":{"type":"frk","to":["f","l"],"from":["d*"],"lvl":4,"rdr":{"x":112,"y":158,"from_hands":[[-9,-24.75]],"to_hands":[[12.333333333333334,24.75],[26.666666666666668,193.5]]}},"h**":{"type":"frk","to":["j","l"],"from":["h*"],"lvl":10,"rdr":{"x":144,"y":345,"from_hands":[[-13.333333333333334,-18.75]],"to_hands":[[-8.666666666666666,24],[16,53.25]]}}}

let ta = document.getElementById("inp");
let pg = document.getElementById("out");

let cnv = document.createElement("canvas");
let ctx = cnv.getContext('2d');
cnv.style="margin-top:31px;margin-left:-1px;border:1px solid black";

function regenerate(){
  let newnodes = generate_tree(parse_txt(ta.value));
  nodes = prep_render(nodes,newnodes);
  dirty = true;
  console.log(nodes);
}

regenerate();

ta.onchange = ta.onkeyup = function(){
  regenerate();
}

function atan2xy(xy){
  return Math.atan2(xy[1],xy[0]);
}

function _recomp_hands(nodes,k){
  let q = nodes[k];
  for (let j = 0; j < q.from.length; j++){
    let dx = nodes[q.from[j]].rdr.x-q.rdr.x;
    let dy = Math.abs(nodes[q.from[j]].rdr.y-q.rdr.y);
    dy = Math.max(dy,32);
    q.rdr.from_hands[j] = [dx/3,-dy*3/5];
  }
  for (let j = 0; j < q.to.length; j++){
    // console.log(q.to[j],nodes[q.to[j]]);
    let dx = nodes[q.to[j]].rdr.x-q.rdr.x;
    let dy = Math.abs(nodes[q.to[j]].rdr.y-q.rdr.y);
    dy = Math.max(dy,32);
    q.rdr.to_hands[j] = [dx/3,dy*3/5];
  }
  
  
  if (q.from.length == 2){
    if (atan2xy(q.rdr.from_hands[0]) < atan2xy(q.rdr.from_hands[1])){
      q.rdr.from_hands[0][0]-=Math.abs(q.rdr.from_hands[0][1])/3;
      q.rdr.from_hands[1][0]+=Math.abs(q.rdr.from_hands[1][1])/3;
    }else{
      q.rdr.from_hands[0][0]+=Math.abs(q.rdr.from_hands[0][1])/3;
      q.rdr.from_hands[1][0]-=Math.abs(q.rdr.from_hands[1][1])/3;
    }
  }
  
  if (q.to.length == 2){
    if (atan2xy(q.rdr.to_hands[0]) > atan2xy(q.rdr.to_hands[1])){
      q.rdr.to_hands[0][0]-=Math.abs(q.rdr.to_hands[0][1])/4;
      q.rdr.to_hands[1][0]+=Math.abs(q.rdr.to_hands[1][1])/4;
    }else{
      q.rdr.to_hands[0][0]+=Math.abs(q.rdr.to_hands[0][1])/4;
      q.rdr.to_hands[1][0]-=Math.abs(q.rdr.to_hands[1][1])/4;
    }
  }
  
  if (q.from.length==2 && q.from[0] == q.from[1]){
    q.rdr.from_hands[0][0]*=2;
    q.rdr.from_hands[0][1]/=2;
    q.rdr.from_hands[1][0]*=2;
    q.rdr.from_hands[1][1]/=2;
  }
  if (q.to.length==2 && q.to[0] == q.to[1]){
    q.rdr.to_hands[0][0]*=2;
    q.rdr.to_hands[0][1]/=2;
    q.rdr.to_hands[1][0]*=2;
    q.rdr.to_hands[1][1]/=2;
  }
}
function recomp_hands(nodes,k){
  let q = nodes[k];
  _recomp_hands(nodes,k);
  for (let j = 0; j < q.from.length; j++){
    _recomp_hands(nodes,q.from[j]);
  }
  for (let j = 0; j < q.to.length; j++){
    _recomp_hands(nodes,q.to[j]);
  }
}





function plot_line(im,w,h, x0, y0, x1, y1, val){
  let dx = Math.abs(x1 - x0);
  let sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  let sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;

  while (1){
    im[y0*w+x0] = val;
    
    if (x0 == x1 && y0 == y1) break;
    let e2 = 2 * error;
    if (e2 >= dy){
      if (x0 == x1) break;
      error += dy;
      x0 += sx;
    }
    if (e2 <= dx){
      if (y0 == y1) break;
      error += dx;
      y0 += sy;
    }
  }
}

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


function floodfill_q(im, w, h, x0, y0, black, white){
  function rget(x,y){
    if (x < 0 || x >= w || y < 0 || y >= h){
      return white;
    }
    return im[y*w+x];
  }
  function rset(x,y,val){
    return im[y*w+x]=val;
  }
  let Q = [[x0,y0]];
  rset(x0,y0,white);
  

  while (Q.length > 0){

    let n = Q.shift();
    let [x,y] = n;

    if (rget(x-1,y)==black){
      Q.push([x-1,y]);
      rset(x-1,y,white);
    }
    if (rget(x+1,y)==black){
      Q.push([x+1,y]);
      rset(x+1,y,white);
    }
    if (rget(x,y-1)==black){
      Q.push([x,y-1]);
      rset(x,y-1,white);
    }
    if (rget(x,y+1)==black){
      Q.push([x,y+1]);
      rset(x,y+1,white);
    }
  }
}

function rasterize(nodes){
  let bb = get_bbox(Object.values(nodes).map(x=>[x.rdr.x,x.rdr.y]));
  let {w,h} = bb;
  w += 64;

  let im = new Array(w*h).fill(255);
  for (let k in nodes){
    // console.log(k);
    
    let q = nodes[k];
    let x0 = q.rdr.x;
    let y0 = q.rdr.y-bb.y;
    for (let i = 0; i < q.to.length; i++){
      let p = nodes[q.to[i]];
      let x1 = p.rdr.x;
      let y1 = p.rdr.y-bb.y;

      let [hx,hy] = q.rdr.to_hands[i];
      let gx,gy;
      if (p.from[0] == p.from[1]){
        ;[gx,gy] = p.rdr.from_hands[i];
      }else{
        ;[gx,gy] = p.rdr.from_hands[p.from.indexOf(k)];
      }
      let n = 20;
      let xp = x0;
      let yp = y0;
      for (let j = 0; j < n; j++){
        let t = j/(n-1);
        let [x,y] = cubic_bezier(x0,y0,x0+hx,y0+hy,x1+gx,y1+gy,x1,y1,t);
        
        x = ~~x;
        y = ~~y;
        // im[(~~y)*w+(~~x)] = 0;
        plot_line(im,w,h,x,y,xp,yp,0);
        xp = x;
        yp = y;
      }
    }
  }
  let idx = 1;
  for (let i = 0; i < h; i++){
    for (let j = 0; j < w; j++){
      if (im[i*w+j] == 255){
        floodfill_q(im,w,h,j,i,255,idx++);
      }
    }
  }
  
  return [im,w,h];
}

function draw_rasterize(ctx,nodes){
  let [im,w,h] = rasterize(nodes);
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  let imdata = ctx.getImageData(0,0,w,h);
  // let o = "";
  for (let i = 0; i < h; i++){
    for (let j = 0; j < w; j++){
      // o += im[i*w+j]?'#':"."
      let col = im[i*w+j];
      col^=(col<<17);
      col^=(col>>13);
      col^=(col<<5);
      col^=(col<<17);
      col^=(col>>13);
      col^=(col<<5);
      col = col % 0xffffff;
      let r = (col >> 16) & 0xff;
      let g = (col >> 8) & 0xff;
      let b = (col ) & 0xff;
      
      if (r || g || b){
        r = r/3+170;
        g = g/3+170;
        b = b/3+170;
      }
      
      imdata.data[(i*w+j)*4] = r;
      imdata.data[(i*w+j)*4+1] = g;
      imdata.data[(i*w+j)*4+2] = b;
      imdata.data[(i*w+j)*4+3] = 255;
    }
    // o += '\n';
  }
  // console.log(o);
  ctx.putImageData(imdata,0,0);
}

let mouseX;
let mouseY;
let drag;
let viewmode = 1;


pg.addEventListener('mousemove',function(e){
  let r = pg.getBoundingClientRect();
  mouseX = ((e.clientX-r.left));
  mouseY = ((e.clientY-r.top));
  if (drag){
    // console.log(drag)
    if (drag[0] == 'n'){
      nodes[drag[1]].rdr.x = mouseX;
      nodes[drag[1]].rdr.y = mouseY;
      
      recomp_hands(nodes, drag[1]);
      
      dirty = true;
    }else if (drag[0] == 'hi'){
      nodes[drag[1]].rdr.from_hands[drag[2]][0] = mouseX-nodes[drag[1]].rdr.x;
      nodes[drag[1]].rdr.from_hands[drag[2]][1] = mouseY-nodes[drag[1]].rdr.y;
      dirty = true;
    }else if (drag[0] == 'ho'){
      nodes[drag[1]].rdr.to_hands[drag[2]][0] = mouseX-nodes[drag[1]].rdr.x;
      nodes[drag[1]].rdr.to_hands[drag[2]][1] = mouseY-nodes[drag[1]].rdr.y;
      dirty = true;
    }
  }
})
pg.addEventListener('mousedown',function(e){
  let r = pg.getBoundingClientRect();
  mouseX = ((e.clientX-r.left));
  mouseY = ((e.clientY-r.top));
  for (let k in nodes){
    let q = nodes[k];
    let x = q.rdr.x;
    let y = q.rdr.y;
    if (Math.hypot(x-mouseX,y-mouseY)<16){
      drag = ['n',k];
    }
    if (viewmode == 2){
      for (let i = 0; i < q.rdr.from_hands.length; i++){
        let [hx,hy] = q.rdr.from_hands[i];
        if (Math.hypot(x+hx-mouseX,y+hy-mouseY)<8){
          drag = ['hi',k,i];
        }
      }
      for (let i = 0; i < q.rdr.to_hands.length; i++){
        let [hx,hy] = q.rdr.to_hands[i];
        if (Math.hypot(x+hx-mouseX,y+hy-mouseY)<8){
          drag = ['ho',k,i];
        }
      }
    }
  }
})
pg.addEventListener('mouseup',function(){
  drag = null;
});


function loop(){
  requestAnimationFrame(loop);
  
  if (viewmode == 3){
    
    draw_rasterize(ctx,nodes);
    
    if (!pg.contains(ctx.canvas)){
      pg.innerHTML = "";
      pg.appendChild(cnv);
    }
  }else{
    if (dirty){
      pg.innerHTML=render(nodes);
      dirty = false;
    }
  }
}

loop();