/* global describe lo */

// console.log(lo.gauss([
//   [2,4],
//   [1,1]
// ],[
//   [30],
//   [10]
// ],{elementary:true,jordan:true}))


let knowledge = {
  chicken:  {head:1,leg:2,eye:2 },
  rabbit:   {head:1,leg:4,eye:2 },
  spider:   {head:1,leg:8,eye:8 },
  ant:      {head:1,leg:6,eye:2 },
  snake:    {head:1,leg:0,eye:2 },
  cerberus: {head:3,leg:4,eye:6 },
  cyclops:  {head:1,leg:2,eye:1 },
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function plural(name){
  var irregularPlural = {
    mouse:"mice",louse:"lice",ox:"oxen",axis:"axes",
    goose:"geese",tooth:"teeth",foot:"feet",child:"children",
    dice:"dice",die:"dice",potato:"potatoes",tomato:"tomatoes",
    deer:"deer",swine:"swine",sheep:"sheep",moose:"moose"
  }
  if (irregularPlural[name]){
    name = irregularPlural[name];
  }else{
    if (['x','s','z'].includes(name[name.length-1])
         || name.endsWith('sh') || name.endsWith('ch')
       ){
      name += "e";
    }
    if (name.endsWith('f')||name.endsWith('fe')){
      name = name.slice(0,name.length-1-name.endsWith('fe'))+"ve";
    }
    if (name[name.length-1]=="y" && !['a','e','i','o','u'].includes(name[name.length-2])){
      name = name.slice(0,name.length-1)+"ie";
    }
    name += "s";
    if (name.endsWith('mans')){
      name = name.slice(0,name.length-4)+"men";
    }
  }
  return name;
}

function check_underdetermine(anmls){
  function get_ratio(name){
    let attrs = Object.keys(knowledge[name]);
    let rs = [];
    for (let i = 0; i < attrs.length; i++){
      for (let j = i+1; j < attrs.length; j++){
        rs.push(knowledge[name][attrs[i]]/knowledge[name][attrs[j]]);
      }
    }
    return rs;
  }
  let ratios = anmls.map(get_ratio);
  for (let j = 0; j < ratios[0].length; j++){
    let r = ratios[0][j];
    let ok = false;
    for (let i = 1; i < ratios.length; i++){
      if (ratios[i][j] != r){
        ok = true;
        break;
      }
      r = ratios[i][j];
    }
    if (!ok){
      console.log("bad",j,r,anmls);
      return true;
    }
  }
  return false;
}

function generate_problem(rank,maxcnt){

  let attrs = Object.keys(Object.values(knowledge)[0]);
  let anmls;
  
  do{
    anmls = Object.keys(knowledge);

    if (rank > anmls.length) rank = anmls.length;
    shuffle(anmls);
    anmls = anmls.slice(0,rank);
    
  }while(check_underdetermine(anmls));
  
  attrs = attrs.slice(0,rank);
  
  let muls = [];
  let cnts = [];
  for (let i = 0; i < rank; i++){
    if (i < attrs.length){
      cnts.push(~~(Math.random()*maxcnt+1));
    }else{
      let mul = ~~(Math.random()*3+1);
      let j = i%attrs.length;
      cnts.push(cnts[j]*mul);
      muls.push([anmls[i],anmls[j],mul]);
    }
  }
  let parts = {};
  for (let i = 0; i < attrs.length; i++){
    let s = 0;
    for (let j = 0; j < anmls.length; j++){
      s += cnts[j] * knowledge[anmls[j]][attrs[i]]
    }
    parts[attrs[i]] = s;
  }
  let a2c = Object.fromEntries(anmls.map((x,i)=>([x,cnts[i]])));
  return [a2c,parts,muls];
  
}

function times(n){
  if (n == 1){
    return "as many";
  }else if (n == 2){
    return "twice as many";
  }else if (n == 3){
    return "thrice as many";
  }else{
    return n+" times as many";
  }
}


function describe_problem(anmls,parts,muls){
  let o = "There is a cage containing ";
  let names = Object.keys(anmls);
  for (let i = 0; i < names.length; i++){
    if (i == names.length-1){
      o += " and ";
    }else if (i){
      o += ", "
    }
    o += plural(names[i]);
  }
  o += ". There are ";
  let attrs = Object.keys(parts);
  
  for (let i = 0; i < attrs.length; i++){
    if (i == attrs.length-1){
      o += " and ";
    }else if (i){
      o += ", "
    }
    o += parts[attrs[i]]+" "+plural(attrs[i]);
  }
  o += ". ";
  for (let i = 0; i < muls.length; i++){
    o += "There are "+times(muls[i][2])+" "+plural(muls[i][0])+" as there are "+plural(muls[i][1])+". "
  }
  o += "How many ";
  for (let i = 0; i < names.length; i++){
    if (i == names.length-1){
      o += " and ";
    }else if (i){
      o += ", "
    }
    o += plural(names[i]);
  }
  o += " are there?";
  
  return o;
}

function generate_augmat(anmls,parts,muls){
  let A = [];
  let B = [];
  let names = Object.keys(anmls);
  let attrs = Object.keys(parts);

  for (let i = 0; i < attrs.length; i++){
    let r = [];
    for (let k in anmls){
      r.push(knowledge[k][attrs[i]]);
    }
    A.push(r);
    B.push([parts[attrs[i]]]);
  }
  for (let i = 0; i < muls.length; i++){
    let r = new Array(names.length).fill(0);
    let i0 = names.indexOf(muls[i][0]);
    let i1 = names.indexOf(muls[i][1]);
    
    r[i1] = muls[i][2];
    r[i0] = -1;
    A.push(r);
    B.push([0])
    
  }
  return [A,B]
}

function nf(x){
  return Math.round(x*1000)/1000;
}

function print_augmat(A,B){
  let o = "";
  for (let i = 0; i < A.length; i++){
    o += (i==A.length-1)?"⎣":(i?"⎢":"⎡");
    for (let j = 0; j < A[i].length; j++){
      o += nf(A[i][j]).toString().padStart(8);
    }
    o += " ⎢ ";
    o += nf(B[i][0]).toString().padStart(8);
    o += (i==A.length-1)?"⎦":(i?"⎥ ":"⎤");
    o += "\n";
  }
  return o;
}


function describe_augmat(A,B,ids){
  let o = [];
  for (let i = 0; i < A.length; i++){
    let r = (i==A.length-1)?"⎩":(i?((i==~~(A.length/2))?"⎨":"⎪"):"⎧");
    r += ' '+describe_row(A[i],B[i]);;
    o.push(r);
  }
  if (ids){
    let l = Math.max(...o.map(x=>x.length));
    // console.log(l);
    for (let i = 0; i < o.length; i++){
      // console.log(i,o[i].length,l-o[i].length,o[i])
      o[i] += ` `.repeat(l-o[i].length) + `    (${ids[i]})`;
    }
  }
  if (o.length <= 2){
    o.splice(1,0,'⎨')
  }
  return o.join('\n');
}

function check_solution(A,B,x){
  for (let i = 0; i < A.length; i++){
    let s = 0;
    let sa = 0;
    for (let j = 0; j < A[i].length; j++){
      s += A[i][j] * x[j];
      sa += Math.abs(A[i][j]);
    }
    if (Math.abs(s-B[i][0]) > 0.1){
      return false;
    }
    if (Math.abs(sa) < 0.0001){
      return false;
    }
  }
  return true;
}


function print_elim_proc(A,B,emats){
  let o = "";
  for (let i = 0; i < emats.length; i++){
    A = lo.matmul(emats[i],A);
    B = lo.matmul(emats[i],B);
    o += print_augmat(A,B)+"\n";
    // for (let i = 0; i < A.length; i++){
    //   o += describe_row(A[i],B[i])+'\n';
    // }
  }
  return o;
}

function get_symbol(i){
  return String.fromCharCode(119.5+(Math.max(i,3)+Math.min(i,3)%3-2.5)*Math.sign(3-i));
}


function describe_row(a,b){
  let o = "";
  let is_first = true;
  for (let i = 0; i < a.length; i++){
    let symb = get_symbol(i);
    if (Math.abs(a[i])>0.0001){
      let n = nf(a[i]);
      if (is_first){
        if (n == 1){
          o += `${symb}`;
        }else if (n == -1){
          o += `-${symb}`;
        }else{
          o += `${n}${symb}`;
        }
      }else if (n == 1){
        o += ` + ${symb}`;
      }else if (n == -1){
        o += ` - ${symb}`;
      }else if (n > 0){
        o += ` + ${n}${symb}`;
      }else{
        o += ` - ${Math.abs(n)}${symb}`;
      }
      is_first = false;
    }
  }
  o += " = ";
  let n = nf(b[0]);
  o += n;
  return o;
}

function describe_elim_proc(A,B,emats){
  function classify(emat){
    let o = {op:'',i0:-666,i1:-666,v:-666};

    let is_swap = true;
    if (emat.slice().flat().some(x=>(x!=0 && x!=1))){
      is_swap = false;
    }
    if (is_swap){
      for (let i = 0; i < emat.length; i++){
        if (emat[i].filter(x=>(x==1)).length != 1){
          is_swap = false;
          break;
        }
        for (let j = 0; j < emat[i].length; j++){
          if (i != j){
            if (emat[i][j] == 1){
              if (o.op == 's'){
                o.i1 = i;
              }else{
                o.i0 = i;
              }
              o.op = 's';
            }
          }
        }
      }
      if (o.op == 's'){
        return o;
      }
    }
    
    for (let i = 0; i < emat.length; i++){
      for (let j = 0; j < emat[i].length; j++){
        if (i == j){
          if (emat[i][j] != 1 && emat[i][j] != 0){
            o.op = '*';
            o.i0 = i;
            o.v = emat[i][j];
          }
        }else{
          if (emat[i][j] != 0){
            o.op = '+*';
            o.i0 = i;
            o.i1 = j;
            o.v = emat[i][j];
          }
        }
      }
    }
    return o;
  }
  

  let out = ``;
  
  
  
  let ids = A.map((x,i)=>(i+1));
  
  out += describe_augmat(A,B,ids)+'\n\n';
  
  let curr_id = ids[ids.length-1]+1;
  for (let i = 0; i < emats.length; i++){
    // out += '----------------------------'+i+'\n';
    let o = classify(emats[i])
    
//     out += JSON.stringify(o)+'\n';
//     out += JSON.stringify(emats[i])+'\n';
    
    // out += print_augmat(A,B)+'\n';
    A = lo.matmul(emats[i],A);
    B = lo.matmul(emats[i],B);
    // out += print_augmat(A,B)+'\n';

    let rr = describe_row(A[o.i0],B[o.i0])+'   ';
    
    if (o.op == 's'){
      // console.log(o,JSON.stringify(ids));
      let tmp = ids[o.i0];
      ids[o.i0] = ids[o.i1];
      ids[o.i1] = tmp;
      // console.log(o,JSON.stringify(ids));
      
    }else if (o.op == '*'){
      
      if (Math.abs(o.v) >= 1){
        out += `Multiply equation (${ids[o.i0]}) by ${nf(o.v)} to get:\n\n`;
      
      }else{
        
        out += `Divide equation (${ids[o.i0]}) by ${nf(1/o.v)} to get:\n\n`;
      }
      
      ids[o.i0] = curr_id++;
      
      out += '      '+rr+(' '.repeat(Math.max(0,60-rr.length)))+`  (${ids[o.i0]})\n\n`;
    }else if (o.op == '+*'){
      
      // out += `Next, subsitute equation (${ids[o.i1]}) into (${ids[o.i0]}) to get:\n`;
      
      if (Math.abs(o.v) >= 1){
        out += `Multiply equation (${ids[o.i1]}) by ${nf(o.v)}, and add to (${ids[o.i0]}):\n\n`;
      }else{
        out += `Divide equation (${ids[o.i1]}) by ${nf(1/o.v)}, and add to (${ids[o.i0]}):\n\n`;
      }
      
      ids[o.i0] = curr_id++;
      
      out += '      '+rr+(' '.repeat(Math.max(0,60-rr.length)))+`  (${ids[o.i0]})\n\n`;
      
      
    }
    
    // out += describe_augmat(A,B,ids)+'\n\n';
  }
  
  out += `Threfore, \n\n`
  out += describe_augmat(A,B)+'\n';
  
   // out += print_augmat(A,B)+'\n\n';
  
  return out;
}



function generate_problem_check_det(rank,maxcnt){
  let q,m;
  
  do{
    q = generate_problem(rank,maxcnt);
    m = generate_augmat(...q);
  }while (lo.det(m[0]) == 0);
  
  return q;
}


function generate_suite(rank,maxcnt){
  let q,m,x,a,emats;
  
  do{
    q = generate_problem_check_det(rank,maxcnt);
    
    m = generate_augmat(...q);
    m[0].reverse();
    m[1].reverse();

    ;[a,x,emats] = lo.gauss(...m,{elementary:true,jordan:true});

    // console.log(q);
  }while(!check_solution(...m,x));
  
  console.log(q);
  
  let pdesc = describe_problem(...q);
  
  
  
  let sdesc ='Let ';
  
  let anmls = Object.keys(q[0]);
  for (let i = 0; i < anmls.length; i++){
    if (i && (i % 3 == 0)){
      sdesc += '\n'
    }
    if (i == anmls.length-1){
      sdesc += 'and '
    }
    sdesc += `the number of ${plural(anmls[i])} be ${get_symbol(i)}`;
    if (i == anmls.length-1){
      sdesc += '. '
    }else{
      sdesc += ', '
    }
  }
  sdesc += '\n\nSet up the following system of equations:\n\n';
    
  sdesc += describe_elim_proc(...m,emats);
  
  
  let adesc = 'There are ';
  for (let i = 0; i < anmls.length; i++){
    if (i == anmls.length-1){
      adesc += 'and '
    }
    adesc += `${q[0][anmls[i]]} ${plural(anmls[i])}`;
    if (i == anmls.length-1){
      adesc += '. '
    }else{
      adesc += ', '
    }
  }
  sdesc += '\n'+adesc+'\n';
  
  return {
    problem:pdesc,
    steps:sdesc,
    ans:adesc,
  }
  
}


function add_button(name,func){
  let btn = document.createElement("button");
  btn.innerHTML = name
  document.body.appendChild(btn);
  btn.onclick = function(){
    func();
  };
  return btn;
}


function add_input(name,func,defau){
  let div = document.createElement("span");
  let inp = document.createElement("input");
  inp.value = defau || "";
  if (defau){
    inp.style.width = (defau.length+4) + "ch";
  }
  let btn = document.createElement("button");
  btn.innerHTML = "set";
  document.body.appendChild(btn);
  btn.onclick = function(){
    func(inp.value);
  }
  div.innerHTML = " "+name+": ";
  div.appendChild(inp);
  div.appendChild(btn);
  document.body.appendChild(div);
  
}

function add_slider(name,min,max,defau,func){
  let div = document.createElement("span");
  let inp = document.createElement("input");
  inp.type = 'range';
  inp.value = defau;
  inp.min = min;
  inp.max = max;

  div.innerHTML = " "+name+": ";
  div.appendChild(inp);
  
  let lbl = document.createElement("span");
  lbl.innerHTML =defau;
  div.appendChild(lbl);
  
  inp.oninput = function(){
    lbl.innerHTML = inp.value;
  }
  document.body.appendChild(div);
  return function(){
    return Number(inp.value)
  }
}

function add_hsp(w){
  let div = document.createElement("span");
  div.innerHTML = '&nbsp;'.repeat(w);
  document.body.appendChild(div);
}

function add_vsp(w){
  let div = document.createElement("div");
  div.innerHTML = '<br>'.repeat(w);
  document.body.appendChild(div);
}


let slider = add_slider('# unknowns',2,7,3);
let qdiv = document.createElement("div");

add_hsp(5);

add_button('generate',function(){
  
  let Q = generate_suite(slider(),10);
  qdiv.innerHTML = `<div>${Q.problem}</div>&nbsp;<pre>${Q.steps}</pre>`
  
}).onclick();



add_vsp(2);


document.body.appendChild(qdiv);




// document.write("<pre>"+Q.ans+"</pre>");