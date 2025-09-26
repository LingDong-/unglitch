/* global describe dat noise FindContours gen_rand_glyph encode_ttf encode_otf_colr */
let FONT = "sans"
let SW = 4;
const RESERVED = 999;

function read_file(path){
  try{
    let xhr = new XMLHttpRequest();
    xhr.open("GET", path,false);
    xhr.send();
    return xhr.responseText;
  }catch(e){
    return "";
  }
}

function line_isect(p0x, p0y, p1x, p1y, q0x, q0y, q1x, q1y) {
  let d0x = p1x - p0x;
  let d0y = p1y - p0y;
  let d1x = q1x - q0x;
  let d1y = q1y - q0y;
  let vc = d0x * d1y - d0y * d1x;
  if (vc == 0) {
    let eps = 0.0001;
    return line_isect(
      p0x+(Math.random()-0.5)*2*eps,
      p0y+(Math.random()-0.5)*2*eps,
      p1x+(Math.random()-0.5)*2*eps,
      p1y+(Math.random()-0.5)*2*eps,
      q0x+(Math.random()-0.5)*2*eps,
      q0y+(Math.random()-0.5)*2*eps,
      q1x+(Math.random()-0.5)*2*eps,
      q1y+(Math.random()-0.5)*2*eps,
    );
  }
  let vcn = vc * vc;
  let q0x_p0x = q0x - p0x;
  let q0y_p0y = q0y - p0y;
  let vc_vcn = vc / vcn;
  let t = (q0x_p0x * d1y - q0y_p0y * d1x) * vc_vcn;
  let s = (q0x_p0x * d0y - q0y_p0y * d0x) * vc_vcn;
  return [t,s];
}

function parse(txt){
  function maybe_num(str){
    let n = +str;
    if (isNaN(n)){
      return str;
    }else{
      return n;
    }
  }
  function split_math(str){
    // console.log(str);
    let s = "";
    let o = [];
    let lvl = 0;
    for (let i = 0; i < str.length; i++){
      if (str[i] == "{"){
        if (lvl == 0 && s.length){
          o.push(maybe_num(s));
          s = "";
        }
        lvl ++;
      }
      if (lvl == 0 && str[i] == " "){
        if (s.length){
          o.push(maybe_num(s));
          s = "";
        }
      }else{
        s += str[i];
      }

      if (str[i] == "}"){
        lvl --;
        if (lvl == 0){
          o.push(split_math(s.slice(1,-1)));
          s = "";
        }
      }
    }
    if (s.length){
      o.push(maybe_num(s));
    }
    return o;
  }

  let lines = txt.split("\n").map(x=>x.trim()).filter(x=>(x.length && (x[0] != "#")));
  let info = {};
  let table = {};
  for (let i = 0; i < lines.length; i++){
    let dodraw = 0;
    let sbc = lines[i].split(":");
    let [l,r] = [sbc[0],sbc.slice(1).join(':')];
    if (r.includes("!")){
      let n;
      [r,n] = r.split("!")
      dodraw = Number(n.trim());
    }
    let args = [];
    r = r.split("@");
    for (let j = 1; j < r.length; j++){
      // args.push(r[j].split(" ").map(x=>x.trim()).filter(x=>x.length).map(maybe_num))
      // console.log(r[j])
      let s = split_math(r[j]);
      // console.log(s);
      args.push(s);
    }
    r = r[0];
    l = l.split(" ").map(x=>x.trim()).filter(x=>x.length);
    r = r.split(" ").map(x=>x.trim()).filter(x=>x.length);
    for (let j = r.length-1; j >= 0; j--){
      if (r[j][0] == '!'){
        dodraw = Number(r[j].slice(1));
        r.splice(j,1);
      }
    }
    // r = r.map(maybe_num);
    r = split_math(r.join(" "));
    if (l[0] == "glyph"){
      info[l[0]] = r;
    }else{
      let [type,name] = l;
      let end = null;
      if (['>',')','1','T'].includes(type[type.length-1])){
        end = type[type.length-1];
        type = type.slice(0,-1);
      }
      table[name] = {
        type,
        args,
        compiled:false,
        draw:dodraw, data: r
      }
      if (end){
        table[name].args.push(['srf','R',end]);
      }
    }
    
  }
  return {
    info,table
  }
}

function unparse(master){
  function unparse_data(d){
    if ((typeof d == 'string')){
      return `${d}`;
    }else if (typeof d == 'number'){
      return `${(~~(d*100))/100}`
    }
    return `{${d.map(unparse_data).join(' ')}}`
  }
  let txt = `glyph        : ${master.info.glyph[0]}\n`;
  for (let k in master.table){
    let p = master.table[k];
    txt += `${(p.type).padEnd(5)} ${k.padEnd(6)} : ${(p.data.map(unparse_data).join(" ").padEnd(24)+p.args.map(x=>(" @"+x[0]+" "+x.slice(1).map(unparse_data).join(" "))).join(" ").padEnd(16))} ${p.draw?('!'+p.draw):''}\n`
  }
  return txt;
}


function compile(obj){
  let internals = {
    "_wgt":[SW],
  }

  function compile_math(expr, args){
    // console.log(expr,args);
    function compile_str(s){
      let n;
      if (s[0] == "_" && !isNaN(n = Number(s.slice(1))) ){
        return args[n];
      }
      
      if (internals[s]){
        return internals[s];
      }else if (obj.table[s]){
        compile_data(s);
        return obj.table[s].data;
      }else{
        return [s];
      }
    }
    
    if (typeof expr == 'number'){
      return [expr];
    }
    if (typeof expr == 'string'){
      return compile_str(expr);
    }
    function elementwise(fun){
      return function(vals){
        let n = Math.max(...vals.map(x=>x.length));
        let z = [];
        for (let i = 0; i < n; i++){
          for (let j = 0; j < vals.length; j++){
            let x = vals[j][i%vals[j].length];
            if (z[i] === undefined){
              z[i] = x;
            }else{
              z[i] = fun(z[i],x);
            }
          }
        }
        return z;
      }
    }
    function vectorwise(fun){
      return function(vals){
        let z = vals[0];
        for (let i = 1; i < vals.length; i++){
          z = fun(z,vals[i]);
        }
        return z;
      }
    }
    let ops = {
      '+': elementwise((x,y)=>(x+y)),
      '-': elementwise((x,y)=>(x-y)),
      '*': elementwise((x,y)=>(x*y)),
      '/': elementwise((x,y)=>(x/y)),
      'cos':(vals)=>(vals.map(x=>Math.cos(x*Math.PI/180))),
      'sin':(vals)=>(vals.map(x=>Math.sin(x*Math.PI/180))),
      'tan':(vals)=>(vals.map(x=>Math.tan(x*Math.PI/180))),
      'atan':(xys)=>(xys.map(xy=>{
        if (xy.length == 1){
          return Math.atan(xy[0])*180/Math.PI
        }else if (xy.length == 2){
          return Math.atan2(xy[1],xy[0])*180/Math.PI
        }else if (xy.length == 4){
          return Math.atan2(xy[3]-xy[1],xy[2]-xy[0])*180/Math.PI;
        }
      })),
      ',': vectorwise((x,y)=>x.concat(y)),
      '.': function(vals){
        let l = vals[0];
        let z = [];
        for (let i = 1; i < vals.length; i++){
          z.push(l[vals[i]])
        }
        return z;
      }
    }
    let op = ops[expr[0]];
    let opr = expr.slice(1).map(x=>compile_math(x,args));
    if (!op && obj.table[expr[0]]){
      return compile_math(obj.table[expr[0]].data[0],opr);
    }
    if (!op){
      op = compile_math(expr[0],args)[0];
      return compile_math(op,opr);
    }
    
    return op(opr);
  }
  function compile_data(key){
    if (obj.table[key].compiled){
      return;
    }
    if (obj.table[key].type == "fun"){
      return;
    }
    let d = obj.table[key].data;
    let dd = [];
    for (let i = 0; i < d.length; i++){
      
      dd.push(...compile_math(d[i]));
    }
    if (obj.table[key].type == "xpt"){
      let [t,s] = line_isect(...dd,true,true);
      // console.log(dd,t)
      dd = [
        dd[0] * (1-t) + dd[2] * t,
        dd[1] * (1-t) + dd[3] * t
      ]
    }else if (obj.table[key].type == "xln"){
      let ang = Math.atan2(dd[3]-dd[1],dd[2]-dd[0])+dd[6]*Math.PI/180;
      let l = Math.hypot(dd[3]-dd[1],dd[2]-dd[0]);
      let xx = dd[4] + Math.cos(ang)*l;
      let yy = dd[5] + Math.sin(ang)*l;
      dd = [dd[4],dd[5],xx,yy];
    }else if (obj.table[key].type == 'lln'){
      let dx = dd[1]-dd[3];
      let dy = dd[2]-dd[0];
      let l = Math.hypot(dx,dy);
      dx=dx/l*dd[4];
      dy=dy/l*dd[4];
      dd = [dd[0]+dx,dd[1]+dy,dd[2]+dx,dd[3]+dy]
    }
    obj.table[key].data = dd;
    obj.table[key].compiled = true;
  }
  
  function compile_args(key){
    for (let i = 0; i < obj.table[key].args.length; i++){
      let dd = [];
      for (let j = 0; j < obj.table[key].args[i].length; j++){
        let a = obj.table[key].args[i][j];
        dd.push(...compile_math(a));
      }
      obj.table[key].args[i] = dd;
    }
  }
  for (let key in obj.table){
    compile_data(key);
  }
  for (let key in obj.table){
    compile_args(key);
  }
  
  let axisidx = 0;
  for (let name in obj.table){
    let args = obj.table[name].args;
    for (let j = 0; j < args.length; j++){
      if (args[j][0] == 'srf'){
        obj.table[name]['_'+args[j][0]+args[j][1]] = args[j].slice(2);
      }else if (args[j][0] == 'axi'){
        obj.table[name]['_'+args[j][0]] = Number(args[j][1])/180*Math.PI;
      }else if (args[j][0] == 'wgt'){
        obj.table[name]['_'+args[j][0]] = args[j][1];
      }
    }
    if (obj.table[name].type == 'axis'){
      obj.table[name]._axisidx = axisidx++;
    }
  }

  // console.log(obj);

  return obj;
}

// function sigmoid(x,k){
//   k = (k != undefined) ? k : 10
//   return 1/(1+Math.exp(-k*(x-0.5)))
// }

function sigmoid (x,a){ 
  a = 1-a;
  
  let y = 0;
  if (x<=0.5){
    y = (Math.pow(2.0*x, 1.0/a))/2.0;
  } 
  else {
    y = 1.0 - (Math.pow(2.0*(1.0-x), 1.0/a))/2.0;
  }
  return y;
}

function isect_circ_line(cx,cy,r,x0,y0,x1,y1){
  //https://stackoverflow.com/a/1084899
  let dx = x1-x0;
  let dy = y1-y0;
  let fx = x0-cx;
  let fy = y0-cy;
  let a = dx*dx+dy*dy;
  let b = 2*(fx*dx+fy*dy);
  let c = (fx*fx+fy*fy)-r*r;
  let discriminant = b*b-4*a*c;
  if (discriminant<0){
    return null;
  }
  discriminant = Math.sqrt(discriminant);
  let t0 = (-b - discriminant)/(2*a);
  if (0 <= t0 && t0 <= 1){
    return t0;
  }
  let t = (-b + discriminant)/(2*a);
  if (t > 1 || t < 0){
    return null;
  }
  return t;
}

function resample(polyline,step){
  if (polyline.length < 2){
    return polyline.slice();
  }
  polyline = polyline.slice();
  let out = [polyline[0].slice()];
  let next = null;
  let i = 0;
  while(i < polyline.length-1){
    let a = polyline[i];
    let b = polyline[i+1];
    let dx = b[0]-a[0];
    let dy = b[1]-a[1];
    let d = Math.sqrt(dx*dx+dy*dy);
    if (d == 0){
      i++;
      continue;
    }
    let n = ~~(d/step);
    let rest = (n*step)/d;
    let rpx = a[0] * (1-rest) + b[0] * rest;
    let rpy = a[1] * (1-rest) + b[1] * rest;
    for (let j = 1; j <= n; j++){
      let t = j/n;
      let x = a[0]*(1-t) + rpx*t;
      let y = a[1]*(1-t) + rpy*t;
      let xy = [x,y];
      for (let k = 2; k < a.length; k++){
        xy.push(a[k]*(1-t) + (a[k] * (1-rest) + b[k] * rest)*t);
      }
      out.push(xy);
    }

    next = null;
    for (let j = i+2; j < polyline.length; j++){
      let b = polyline[j-1];
      let c = polyline[j];
      if (b[0] == c[0] && b[1] == c[1]){
        continue;
      }
      let t = isect_circ_line(rpx,rpy,step,b[0],b[1],c[0],c[1]);
      if (t == null){
        continue;
      }
 
      let q = [
        b[0]*(1-t)+c[0]*t,
        b[1]*(1-t)+c[1]*t,
      ];
      for (let k = 2; k < b.length; k++){
        q.push(b[k]*(1-t)+c[k]*t);
      }
      out.push(q);
      polyline[j-1] = q;
      next = j-1;
      break;
    }
    if (next == null){
      break;
    }
    i = next;

  }

  if (out.length > 1){
    let lx = out[out.length-1][0];
    let ly = out[out.length-1][1];
    let mx = polyline[polyline.length-1][0];
    let my = polyline[polyline.length-1][1];
    let d = Math.sqrt((mx-lx)**2+(my-ly)**2);
    if (d < step*0.5){
      out.pop(); 
    }
  }
  out.push(polyline[polyline.length-1].slice());
  return out;
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

function pt_in_pl (x,y,x0,y0,x1,y1) {
  var dx = x1-x0;
  var dy = y1-y0;
  var e  = (x-x0)*dy-(y-y0)*dx;
 
  return e <= 0;
}


function pt_in_poly(p,poly){
  let n = 0;
  let q = [p[0]+Math.PI, p[1]+Math.E];
  for (let i = 0; i < poly.length; i++){
    let [t,s] = line_isect(...p,...q,...poly[i],...poly[(i+1)%poly.length]);
    if (t >= 0 && 0 <= s && s <= 1){
      n++;
    }
  }
  return n % 2 == 1;
}


function pseudo_arc_tip(x0,y0,x1,y1,x2,y2,x3,y3,d){
  if ((!!pt_in_pl(x1,y1,x0,y0,x2,y2))){
    ;[x0,y0,x1,y1,x2,y2,x3,y3] = [x3,y3,x2,y2,x1,y1,x0,y0];
  }
  let xc = (x1 + x2)/2;
  let yc = (y1 + y2)/2;
  
  let ang = Math.atan2(y2-y1,x2-x1);
  
  let nx = Math.cos(ang-Math.PI/2);
  let ny = Math.sin(ang-Math.PI/2);
  
  let mx = Math.cos(ang);
  let my = Math.sin(ang);
  
  
  let [t0,s0] = line_isect(xc,yc,xc+nx,yc+ny,x0,y0,x1,y1);
  let [t1,s1] = line_isect(xc,yc,xc+nx,yc+ny,x3,y3,x2,y2);
  
  // let dd = Math.min(d,t0-0.01,t1-0.01);
  let dd = d;
  
  if (t0-0.01 > 0){
    dd = Math.min(dd,t0-0.01);
  }
  if (t1-0.01 > 0){
    dd = Math.min(dd,t1-0.01);
  }
  let xd = xc + nx*dd;
  let yd = yc + ny*dd;
  return [xd,yd];
}

//     7     8
//    1 . . . 2
//   /         \
//  0           3
//
function solve_pseudo_arc(x0,y0,x1,y1,x2,y2,x3,y3,d){
  let [xd,yd] = pseudo_arc_tip(x0,y0,x1,y1,x2,y2,x3,y3,d);
  
  let rev = false;
  if ((!!pt_in_pl(x1,y1,x0,y0,x2,y2))){
    ;[x0,y0,x1,y1,x2,y2,x3,y3] = [x3,y3,x2,y2,x1,y1,x0,y0];
    ;rev = true;
  }
  
  let xc = (x1 + x2)/2;
  let yc = (y1 + y2)/2;
  
  let ang = Math.atan2(y2-y1,x2-x1);

  let mx = Math.cos(ang);
  let my = Math.sin(ang);
  
  let [t2,s2] = line_isect(xd,yd,xd-mx,yd-my,x0,y0,x1,y1);
  let [t3,s3] = line_isect(xd,yd,xd+mx,yd+my,x3,y3,x2,y2);
  
  let x7 = xd - t2*mx;
  let y7 = yd - t2*my;
  
  let x8 = xd + t3*mx;
  let y8 = yd + t3*my;
  
  // return [[x1,y1],[x7,y7],[x8,y8],[x2,y2]];
  
  const C = 1.33333; // (4/3)*tan(pi/(2n))
  // const C = 0.5522847;
  
  let ps = [];
  for (let i = 0; i < 32; i++){
    let t = i/31;
    let xa = x1 * (1-C) + x7 * C;
    let ya = y1 * (1-C) + y7 * C;
    let xb = x2 * (1-C) + x8 * C;
    let yb = y2 * (1-C) + y8 * C;
    let [x,y] = cubic_bezier(x1,y1,x7,y7,x8,y8,x2,y2,t);
    ps.push([x,y])
  }
  if (rev){
    ps.reverse();
  }
  return ps;
}

function rot_poly(poly,th){
  let qoly = [];
  let costh = Math.cos(th);
  let sinth = Math.sin(th);
  for (let i = 0; i < poly.length; i++){
    let [x0,y0] = poly[i]
    let x = x0* costh-y0*sinth;
    let y = x0* sinth+y0*costh;
    qoly.push([x,y]);
  }
  return qoly;
}

const MODE_RDR = 0b000001
const MODE_DBG = 0b000010
const MODE_DAT = 0b000100
const MOPT_BLR = 0b001000
const MOPT_NSC = 0b010000
const MOPT_NTX = 0b100000

let canv_tmp = [];


function dummy(){
  let obj = new Proxy(()=>{}, {
    apply(target, thisArg, argumentsList) {
      return dummy();
    },
    get(target, name, receiver) {
      if (name != Symbol.toPrimitive){
        return dummy();
      }else{
        return ()=>0
      }
    },
    set(target, name, value, receiver) {
      return Reflect.set(target, name, value, receiver);
    },
    
  });
  return obj;
}
// let a = dummy();
// console.log(a);
// console.log(a(1));
// console.log(a.x);
// console.log(a.x(2));
// console.log(a+3);
// console.log(a.x.y().z.w());

function mapval(value,istart,istop,ostart,ostop){
    return ostart + (ostop - ostart) * ((value - istart)*1.0 / (istop - istart))
}
function lerp_hue(h0,h1,t){
  var methods = [
    [Math.abs(h1-h0),     mapval(t,0,1,h0,h1)],
    [Math.abs(h1+Math.PI*2-h0), mapval(t,0,1,h0,h1+Math.PI*2)],
    [Math.abs(h1-Math.PI*2-h0), mapval(t,0,1,h0,h1-Math.PI*2)]
    ]
  methods.sort((x,y)=>(x[0]-y[0]))
  return (methods[0][1]+Math.PI*4)%(Math.PI*2);
}
function hue_dist(h0,h1){
  return Math.min(
    Math.abs(h1-h0),
    Math.abs(h1+Math.PI*2-h0),
    Math.abs(h1-Math.PI*2-h0)
  );
}

function _sans_stroke(ctx,ps,ax,w,end,mode){

  // console.log("..........")
  function end_has(x){
    if (end == undefined){
      return false;
    }
    if (end[0] == undefined){
      return false;
    }
    let e = `${end[0]}`;
    for (let i = 0; i < e.length; i++){
      if (e[i] == x){
        return true;
      }
    }
    return false;
  }
  function func(t){
    return 1-sigmoid(t,0.5);
    // return 1-t
    // return 1;
    // return Math.sqrt(1-t**2)
  }
  function funcw(t,start,low){
    let y;
    if (t < start){
      y = func(0);
    }else{
      y = func((t-start)/(1-start));
    }
    return low + y * (1-low);
  }
  function w_at(i){
    if (end_has('>')){
      
      return w*funcw(i/(ps.length), 1-(end[1]??1), end[2]??0);
    }else{
      return w;
    }
  }
  
  ctx.save();
  if (mode & MODE_DBG){
    ctx.globalAlpha=0.3;
  }
  if (ps.length == 1){
    if (mode & MODE_RDR){
      // ctx.lineWidth=1;
    }
    ctx.fillRect(ps[0][0]-w,ps[0][1]-w,w*2,w*2);
    ctx.strokeRect(ps[0][0]-w,ps[0][1]-w,w*2,w*2);
    ctx.restore();
    return;
  }

  
  let monoidx = ps.length-2;

  function ydir(a,b){
    let d = a[1]-b[1];
    if (Math.abs(d) < 0.1){
      return 0;
    }
    d/=Math.abs(d);
    return d;
  }
  let ti0 = 0;
  if (end[0] == '>T'){
    ti0 += 2;
  }
  let ae = (end[ti0+1] ?? 0)*Math.PI/180;

  
  if (end_has('T') || end_has(']')){
    let qs = rot_poly(ps,-ae)

    let qs0 = rot_poly(ps.map((xy,i)=>[xy[0]-w_at(i)*Math.cos(ax),xy[1]-w_at(i)*Math.sin(ax)]),-ae);
    let qs1 = rot_poly(ps.map((xy,i)=>[xy[0]+w_at(i)*Math.cos(ax),xy[1]+w_at(i)*Math.sin(ax)]),-ae);

    let enddir = ydir(qs[qs.length-1],qs[qs.length-2])

    // console.log(enddir)
    while (monoidx > 0 && ydir(qs[monoidx],qs[monoidx-1]) == enddir

          && ydir(qs0[monoidx],qs0[monoidx-1]) == enddir
          && ydir(qs1[monoidx],qs1[monoidx-1]) == enddir
          ){
      monoidx --;
    }
    // console.log(monoidx,qs.length)
  }
  
  
  let la;
  
  function mem_a(a){
    if (la == undefined){
      return la = a;
    }

    if (hue_dist(a-Math.PI,la) < hue_dist(a,la)){
      // console.log("trigger!")
      return la = a-Math.PI;
    }
    return la = a;
  }
  
  for (let i = 0; i < ps.length-1; i++){
    // console.log(la);
    
    //   
    //     1--n
    //    /
    //   0
    //   |
    //   l

    ctx.beginPath();

    let [x0,y0] = ps[i];
    let [x1,y1] = ps[i+1];
    let a0,a1;
    
    if (i > 0){
      let [xl,yl] = ps[i-1]??[ps[i][0]*2-ps[i+1][0],ps[i][1]*2-ps[i+1][1]]
      a0 =lerp_hue( Math.atan2(yl-y0,xl-x0) ,  Math.atan2(y1-y0,x1-x0), 0.5);
    }else{
      a0 = Math.atan2(y1-y0,x1-x0)-Math.PI/2;
    }
    
    if (i < ps.length-2){
      let [xn,yn] = ps[i+2]??[ps[i+1][0]*2-ps[i][0],ps[i+1][1]*2-ps[i][1]];
      a1 =lerp_hue( Math.atan2(yn-y1,xn-x1) ,  Math.atan2(y0-y1,x0-x1), 0.5);
    }else{
      a1 =Math.atan2(y1-y0,x1-x0)-Math.PI/2;
    }
    
    a0 = mem_a(a0);
    a1 = mem_a(a1);
    
    // console.log(a0,a1);
    
    let w0 = w_at(i);
    let w1 = w_at(i+1);


    let p0 = [x0-Math.cos(a0)*w0,y0-Math.sin(a0)*w0];
    let p1 = [x0+Math.cos(a0)*w0,y0+Math.sin(a0)*w0];
    let p2 = [x1+Math.cos(a1)*w1,y1+Math.sin(a1)*w1];
    let p3 = [x1-Math.cos(a1)*w1,y1-Math.sin(a1)*w1];
    

    if ((end_has('T') || end_has(']')) && i >= monoidx){
      // console.log(",")
      let [endx,endy] = ps[ps.length-1]
      let [t0,s0] = line_isect(...p0,...p3,endx,endy,endx+Math.cos(ae),endy+Math.sin(ae));
      let [t1,s1] = line_isect(...p1,...p2,endx,endy,endx+Math.cos(ae),endy+Math.sin(ae));
      let q0 = [endx+Math.cos(ae)*s0,endy+Math.sin(ae)*s0]
      let q1 = [endx+Math.cos(ae)*s1,endy+Math.sin(ae)*s1]
      // ctx.moveTo(...p3);
      // ctx.lineTo(...p2);
      // ctx.lineTo(...q1);
      // ctx.lineTo(...q0);
      // ctx.closePath();
      // ctx.fill();
      // ctx.stroke();
      
      if (Math.abs(s1) < 10 && Math.abs(s0) < 10){

      

        // if (s1 < 0){
          if (t1 < 1 || i == ps.length-2){
            p2 = q1;
          }
          if (t1 < 0){
            p1 = q1;
          }
        // }
        // if (s0 > 0){
          if (t0 < 1 || i == ps.length-2){
            p3 = q0;
          }
          if (t0 < 0){
            p0 = q0;
          }
        // }

      }
    }

    ctx.moveTo(...p0);
    ctx.lineTo(...p1);
    ctx.lineTo(...p2);
    ctx.lineTo(...p3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  }
  ctx.restore();
}



function _thick_stroke(ctx,ps,ax,w,end,mode){
  

  function end_has(x){
    if (end == undefined){
      return false;
    }
    if (end[0] == undefined){
      return false;
    }
    let e = `${end[0]}`;
    for (let i = 0; i < e.length; i++){
      if (e[i] == x){
        return true;
      }
    }
    return false;
  }

  let ti0 = 0;
  if (end[0] == '>T'){
    ti0 += 2;
  }

  let ae = (end[ti0+1] ?? 0)*Math.PI/180;

  ctx.save();
  if (mode & MODE_DBG){
    ctx.globalAlpha=0.3;
  }
  if (ps.length == 1){
    if (mode & MODE_RDR){
      ctx.lineWidth=3;
    }
    ctx.beginPath();
    let ww = w / Math.cos(ax) * 1.15;
    ctx.ellipse(...ps[0],ww,ww,0,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (end_has('4')){
    let [x0,y0] = ps[0];
    let [x1,y1] = ps[ps.length-1];
    let [x2,y2] = [end[1],end[2]]

    let p0 = [x1+Math.cos(ax)*w,y1+Math.sin(ax)*w];
    let p1 = [x0+Math.cos(ax)*w,y0+Math.sin(ax)*w];
    let p2 = [x0-Math.cos(ax)*w,y0-Math.sin(ax)*w];
    let p3 = [x2-Math.cos(ax)*w,y2-Math.sin(ax)*w];

    let t0 = end[3]??0.5;
    let t1 = end[4]??t0;
    let p01 = [p0[0]*(1-t0)+p1[0]*t0,p0[1]*(1-t0)+p1[1]*t0]
    let p32 = [p3[0]*(1-t1)+p2[0]*t1,p3[1]*(1-t1)+p2[1]*t1]

    if (mode & MODE_RDR){
      ctx.lineWidth=3;
    }
    ctx.beginPath();
    ctx.moveTo(...p0);
    ctx.lineTo(...p1);
    ctx.lineTo(...p2);
    ctx.lineTo(...p3);
    ctx.bezierCurveTo(...p32,...p01,...p0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }


  let monoidx = ps.length-2;

  function ydir(a,b){
    let d = a[1]-b[1];
    if (Math.abs(d) < 0.0001){
      return 0;
    }
    d/=Math.abs(d);
    return d;
  }
  if (end_has('T') || end_has(']')){
    let qs = rot_poly(ps,-ae)

    let qs0 = rot_poly(ps.map((xy,i)=>[xy[0]-w_at(i)*Math.cos(ax),xy[1]-w_at(i)*Math.sin(ax)]),-ae);
    let qs1 = rot_poly(ps.map((xy,i)=>[xy[0]+w_at(i)*Math.cos(ax),xy[1]+w_at(i)*Math.sin(ax)]),-ae);

    let enddir = ydir(qs[qs.length-1],qs[qs.length-2])


    while (monoidx > 0 && ydir(qs[monoidx],qs[monoidx-1]) == enddir

          && ydir(qs0[monoidx],qs0[monoidx-1]) == enddir
          && ydir(qs1[monoidx],qs1[monoidx-1]) == enddir
          ){
      monoidx --;
    }
    // console.log(monoidx,qs.length)
  }


  // if (mode & MODE_RDR){
  //   ps = resample(ps,1);
  // }

  function func(t){
    return 1-sigmoid(t,0.5);
    // return 1-t
    // return 1;
    // return Math.sqrt(1-t**2)
  }
  function funcw(t,start,low){
    let y;
    if (t < start){
      y = func(0);
    }else{
      y = func((t-start)/(1-start));
    }
    return low + y * (1-low);
  }


  function w_at(i){
    if (end_has('>')){
      return w*funcw(i/Math.max(ps.length-1,1), 1-(end[1]??1), end[2]??0);
    }else{
      return w;
    }
  }

  for (let i = 0; i < ps.length-1; i++){
    if (mode & MODE_RDR){
      ctx.lineWidth=3;
    }
    ctx.beginPath();

    let w0 = w_at(i);
    let w1 = w_at(i+1);

    let [x0,y0] = ps[i];
    let [x1,y1] = ps[i+1];

    let p0 = [x0-Math.cos(ax)*w0,y0-Math.sin(ax)*w0];
    let p1 = [x0+Math.cos(ax)*w0,y0+Math.sin(ax)*w0];
    let p2 = [x1+Math.cos(ax)*w1,y1+Math.sin(ax)*w1];
    let p3 = [x1-Math.cos(ax)*w1,y1-Math.sin(ax)*w1];

    if ((end_has('T') || end_has(']')) && i >= monoidx){
      // console.log(",")
      let [endx,endy] = ps[ps.length-1]
      let [t0,s0] = line_isect(...p0,...p3,endx,endy,endx+Math.cos(ae),endy+Math.sin(ae));
      let [t1,s1] = line_isect(...p1,...p2,endx,endy,endx+Math.cos(ae),endy+Math.sin(ae));
      let q0 = [endx+Math.cos(ae)*s0,endy+Math.sin(ae)*s0]
      let q1 = [endx+Math.cos(ae)*s1,endy+Math.sin(ae)*s1]
      // ctx.moveTo(...p3);
      // ctx.lineTo(...p2);
      // ctx.lineTo(...q1);
      // ctx.lineTo(...q0);
      // ctx.closePath();
      // ctx.fill();
      // ctx.stroke();


        // if (s1 < 0){
          if (t1 < 1 || i == ps.length-2){
            p2 = q1;
          }
          if (t1 < 0){
            p1 = q1;
          }
        // }
        // if (s0 > 0){
          if (t0 < 1 || i == ps.length-2){
            p3 = q0;
          }
          if (t0 < 0){
            p0 = q0;
          }
        // }

    }

    ctx.moveTo(...p0);
    ctx.lineTo(...p1);
    ctx.lineTo(...p2);
    ctx.lineTo(...p3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  }
  if (end_has(')')){
    let [xa,ya] = ps[ps.length-1];
    let xb,yb;
    let _i = ps.length-2;
    do{
      ;[xb,yb] = ps[_i];
      _i--;
    }while (Math.abs(xb-xa)<0.1 && Math.abs(yb-ya)<0.1 && _i > 1);

    let [x0,y0] = [xb-Math.cos(ax)*w,yb-Math.sin(ax)*w];
    let [x1,y1] = [xa-Math.cos(ax)*w,ya-Math.sin(ax)*w];
    let [x2,y2] = [xa+Math.cos(ax)*w,ya+Math.sin(ax)*w];
    let [x3,y3] = [xb+Math.cos(ax)*w,yb+Math.sin(ax)*w];

    let qs = solve_pseudo_arc(x0,y0,x1,y1,x2,y2,x3,y3,w);
    ctx.beginPath();
    for (let i = 0; i < qs.length; i++){
      ctx[i?'lineTo':'moveTo'](...qs[i]);
    }
    ctx.fill();
    ctx.stroke();

  }
  if (end_has('1')){
    // let ccc = (mode & MODE_RDR) ? get_tmp_canv(RESERVED).getContext('2d') : ctx;
    let ccc = ctx;
    let [xa,ya] = ps[ps.length-1];
    let xb,yb;
    let _i = ps.length-2;
    do{
      ;[xb,yb] = ps[_i];
      _i--;
    }while (Math.abs(xb-xa)<0.1 && Math.abs(yb-ya)<0.1 && _i > 1);

    let dx = xa-xb;
    let dy = ya-yb;
    let ld = Math.hypot(dx,dy);
    dx/=ld;
    dy/=ld;


    let xc = xa + dx * 2;
    let yc = ya + dy * 2;

    let [x0,y0] = [xc-Math.cos(ax)*w*2.4,yc-Math.sin(ax)*w*2.4];
    let [x1,y1] = [xc+Math.cos(ax)*w,yc+Math.sin(ax)*w];
    let [xq,yq] = [x1+dx*0.5,y1+dy*0.5]

    let [x2,y2] = [xb+Math.cos(ax)*w,yb+Math.sin(ax)*w];

    let [xk,yk] = [x0-dx*1,y0-dy*1]
    let [t,s] = line_isect(xk,yk,xk+1,yk,x1,y1,x2,y2);

    let [x3,y3] = [xk+t,yk];

    let [x4,y4] = [xa-Math.cos(ax)*w,ya-Math.sin(ax)*w];
    let [x5,y5] = [xa+Math.cos(ax)*w,ya+Math.sin(ax)*w];

    ccc.beginPath();
    ccc.moveTo(x0,y0);
    ccc.lineTo(xc,yc);
    ccc.lineTo(xq,yq);
    ccc.lineTo(x3,y3);
    ccc.lineTo(xk,yk);
    ccc.closePath();
    ccc.fill();
    ccc.stroke();

    ccc.beginPath();
    ccc.moveTo(x3,y3);
    ccc.lineTo(x5,y5);
    ccc.lineTo(x4,y4);
    ccc.lineTo(xk,yk);
    ccc.closePath();
    ccc.fill();
    ccc.stroke();
  }
  if (end_has('T')){

    let ccc = ctx;
    let [xa,ya] = ps[ps.length-1];
    let xb,yb;
    let _i = ps.length-2;
    do{
      ;[xb,yb] = ps[_i];
      _i--;
    }while (Math.abs(xb-xa)<0.1 && Math.abs(yb-ya)<0.1 && _i > 1);

    let dx = xa-xb;
    let dy = ya-yb;
    let ld = Math.hypot(dx,dy);
    dx/=ld;
    dy/=ld;

    let wfl = end[ti0+2] ?? 2.6 //Math.sin(Math.atan2(dy,dx));
    let wfr = end[ti0+3] ?? wfl;

    let xc = xa + dx * 1.6;
    let yc = ya + dy * 1.6;

    let xd = xa + dx * 1.2;
    let yd = ya + dy * 1.2;

    let xe = xa - dx * 1;
    let ye = ya - dy * 1;

    let [x0,y0] = [xc-wfl*w*Math.cos(ae),yc-wfl*w*Math.sin(ae)];
    let [x1,y1] = [xc+wfr*w*Math.cos(ae),yc+wfr*w*Math.sin(ae)];
    let [x2,y2] = [xd-wfl*w*Math.cos(ae),yd-wfl*w*Math.sin(ae)];
    let [x3,y3] = [xd+wfr*w*Math.cos(ae),yd+wfr*w*Math.sin(ae)];

    let [x4,y4] = [xa-Math.cos(ax)*w,ya-Math.sin(ax)*w];
    let [x5,y5] = [xa+Math.cos(ax)*w,ya+Math.sin(ax)*w];

    ccc.beginPath();
    ccc.moveTo(x0,y0);
    ccc.lineTo(x1,y1);
    ccc.lineTo(x3,y3);
    ccc.lineTo(xe,ye);
    ccc.lineTo(x2,y2);
    ccc.closePath();
    ccc.fill();
    ccc.stroke();

    // ccc.beginPath();
    // ccc.moveTo(x2,y2);
    // ccc.lineTo(x3,y3);
    // ccc.lineTo(x5,y5);
    // ccc.lineTo(x4,y4);
    // ccc.closePath();
    // ccc.fill();
    // ccc.stroke();
  }

  ctx.restore();
}


function draw(canv,obj,w,mode=MODE_RDR){
  let ow = w;
  let canv_used = [];
  function get_tmp_canv(canv_idx){
    if (mode & MODE_DAT){
      if (!canv_tmp[canv_idx]){
        let a = {};
        a.getContext = function(){
          return {
            canvas:a
          }
        }
        canv_tmp[canv_idx] = a;        
      }
      return canv_tmp[canv_idx]
    }
    if (! (mode & MOPT_BLR)){
        canv_idx = 1;
    }
    let canv2,ctx2;
    if (!canv_tmp[canv_idx]){
      canv_tmp[canv_idx] = document.createElement("canvas");
      canv_tmp[canv_idx].width = canv.width;
      canv_tmp[canv_idx].height = canv.height;
    }
    canv2 = canv_tmp[canv_idx];
    ctx2 = canv2.getContext('2d');
    
    if (canv_used.includes(canv_idx)){
      
    }else{
      canv_used.push(canv_idx);
      ctx2.resetTransform();
      ctx2.save();
      ctx2.fillStyle="white";
      ctx2.fillRect(0,0,canv2.width,canv2.height);
      ctx2.restore();
      ctx2.translate(50,50);
      ctx2.scale(4,4);
      ctx2.lineCap="round";
      ctx2.lineJoin="round";
      ctx2.lineWidth=0.5;
      // document.body.appendChild(canv2);
    }
    
    return canv2;
  }  
  
  let ctx = canv.getContext('2d');
  
  ctx.save();
  ctx.lineCap="round";
  ctx.lineJoin="round";
  ctx.lineWidth=0.5;

  ctx.save();
  ctx.fillStyle="white";
  ctx.fillRect(0,0,canv.width,canv.height);
  ctx.restore();

  

  
  if (mode & MODE_DBG){
    ctx.translate(50,50);
    ctx.scale(4,4);
    
    if ( !(mode & MOPT_NSC)){
      ctx.save();
      ctx.strokeStyle="silver"
      ctx.strokeRect(0,0,100,100);
      ctx.restore();
    }
    
    
    for (let k in obj.table){
      if (obj.table[k].type == 'axis'){
        let ax = obj.table[k].data[0] * Math.PI/180
        ctx.save();
        ctx.strokeStyle="silver"
        ctx.beginPath();
        ctx.ellipse(obj.table[k]._axisidx*10,0,5,5,0,0,Math.PI*2);
        ctx.stroke();
        ctx.fillStyle="red"
        ctx.beginPath();
        ctx.ellipse(obj.table[k]._axisidx*10,0,w,0.5,ax,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.font = "4pt Courier";
  }

  
  let ax = null;
  let dax = null;
  let maybeaxis = Object.keys(obj.table).filter(x=>obj.table[x].type=="axis")[0];
  if (maybeaxis){
    dax = ax = obj.table[maybeaxis].data[0]*Math.PI/180;
  }

  let out = [];
  function thick_stroke(ctx,ps,end){
    if (mode & MODE_DAT){
      out.push([canv_tmp.indexOf(ctx.canvas),ps,ax,w,end]);
    }else{
      if (maybeaxis){
        _thick_stroke(ctx,ps,ax,w,end,mode);
      }else{
        _sans_stroke(ctx,ps,ax,w,end,mode);
      }
    }
       
  }

  for (let key in obj.table){

    ctx.save();
    let d = obj.table[key];
    if (d.draw){
      if (mode & MODE_DBG){
        ctx.fillStyle="red";
        ctx.strokeStyle="red";
      }else{
        ctx.fillStyle="black";
        ctx.strokeStyle="black";
      }
    }else{
      if (mode & MODE_DBG){
        
      }else{
        continue;
      }
    }
    if (d._axi !== undefined){
      ax = d._axi;
    }else{
      ax = dax;
    }
    if (d._wgt !== undefined){
      w = ow * d._wgt;  
    }else{
      w = ow;
    }
    
    if (d.type == 'pt'){
      if ((mode & MODE_DBG) && (d.draw || !(mode & MOPT_NSC))){
        ctx.beginPath();
        ctx.fillRect(d.data[0]-1,d.data[1]-1,2,2);
        ctx.fill();
        if (!(mode & MOPT_NTX)){
          ctx.save();
          ctx.fillStyle="black";
          ctx.fillText(key,...d.data);
          ctx.restore();
        }
      }
      if (d.draw){

        let tc = get_tmp_canv(d.draw).getContext('2d');
        thick_stroke((!(mode&MODE_DBG))?tc:ctx,[d.data],[]);

      }
    }else if (d.type == 'xpt'){
      if ((mode & MODE_DBG) && (d.draw || !(mode & MOPT_NSC))){
        ctx.beginPath();
        ctx.ellipse(...d.data,1,1,0,0,Math.PI*2);
        ctx.fill();
        
        if (!(mode & MOPT_NTX) && !(mode & MOPT_NSC)){
          ctx.save();
          ctx.fillStyle="black";
          ctx.fillText(key,...d.data);
          ctx.restore();
        }
      }
      if (d.draw){
        let tc = get_tmp_canv(d.draw).getContext('2d');
        thick_stroke((!(mode&MODE_DBG))?tc:ctx,[d.data],[]);

      }
    }else if (d.type == 'ln' || d.type == 'xln' || d.type == 'lln'){

      if ((mode & MODE_DBG) && (d.draw || !(mode & MOPT_NSC))){
        ctx.beginPath();
        ctx.moveTo(d.data[0],d.data[1]);
        ctx.lineTo(d.data[2],d.data[3]);
        ctx.stroke();
      }


      if (d.draw){
        let tc = get_tmp_canv(d.draw).getContext('2d');
        
        let p0 = [d.data[0],d.data[1]];
        let p2 = [d.data[2],d.data[3]];
        let p1 = [p0[0]*0.5+p2[0]*0.5, p0[1]*0.5+p2[1]*0.5];
        if (d._srfL && d._srfR){
          thick_stroke((!(mode&MODE_DBG))?tc:ctx,[p1,p0],d._srfL);
          thick_stroke((!(mode&MODE_DBG))?tc:ctx,[p1,p2],d._srfR);
        }else if (d._srfL){
          thick_stroke((!(mode&MODE_DBG))?tc:ctx,[p2,p0],d._srfL);
        }else if (d._srfR){
          thick_stroke((!(mode&MODE_DBG))?tc:ctx,[p0,p2],d._srfR);
        }else{
          thick_stroke((!(mode&MODE_DBG))?tc:ctx,[p0,p2],[]);
        }
        
        
      }
    }else if (d.type == "arc"){
      let ps = solve_pseudo_arc(...d.data);
      if ((mode & MODE_DBG) && (d.draw || !(mode & MOPT_NSC))){
        ctx.beginPath();
        for (let i = 0; i < ps.length; i++){
          ctx[i?'lineTo':'moveTo'](...ps[i]);
        }
        ctx.stroke();
      }
      if (d.draw){
        let tc = get_tmp_canv(d.draw).getContext('2d');
        if (d._srfL && d._srfR){
          let m = ~~(ps.length/2);
          thick_stroke((!(mode&MODE_DBG))?tc:ctx,ps.slice(0,m+1).reverse(),d._srfL);
          thick_stroke((!(mode&MODE_DBG))?tc:ctx,ps.slice(m),d._srfR);
        }else if (d._srfL){
          thick_stroke((!(mode&MODE_DBG))?tc:ctx,ps.slice().reverse(),d._srfL);
        }else if (d._srfR){
          thick_stroke((!(mode&MODE_DBG))?tc:ctx,ps,d._srfR);
        }else{
          thick_stroke((!(mode&MODE_DBG))?tc:ctx,ps,[]);
        }
        
      }
    }
    ctx.restore();
  }
  
  ctx.restore();
  
  if (mode & MODE_RDR){
    canv_used = Array.from(new Set(canv_used));
    for (let i = 0; i < canv_used.length; i++){
      let canv2 = canv_tmp[canv_used[i]];
      ctx.save();
      if (canv_used[i] != RESERVED && mode & MOPT_BLR){
        ctx.filter="blur(4px) brightness(90%) contrast(1000%)";
      }
      ctx.globalCompositeOperation="multiply"
      ctx.drawImage(canv2,0,0);
      ctx.restore();
    }

  }
  if (mode & MODE_DAT){
    return out;
  }
}




function draw_from_data(canv,data){
    
  let canv_used = [];
  function get_tmp_canv(canv_idx){
    
    let canv2,ctx2;
    if (!canv_tmp[canv_idx]){
      canv_tmp[canv_idx] = document.createElement("canvas");
      canv_tmp[canv_idx].width = canv.width;
      canv_tmp[canv_idx].height = canv.height;
    }
    canv2 = canv_tmp[canv_idx];
    ctx2 = canv2.getContext('2d');
    
    if (canv_used.includes(canv_idx)){
      
    }else{
      canv_used.push(canv_idx);
      ctx2.resetTransform();
      ctx2.save();
      ctx2.fillStyle="white";
      ctx2.fillRect(0,0,canv2.width,canv2.height);
      ctx2.restore();
      ctx2.translate(50,50);
      ctx2.scale(4,4);
      ctx2.lineCap="round";
      ctx2.lineJoin="round";
      ctx2.lineWidth=0.5;
      // document.body.appendChild(canv2);
    }
    
    return canv2;
  }  
  
  let ctx = canv.getContext('2d');
  
  ctx.save();
  ctx.fillStyle="white";
  ctx.fillRect(0,0,canv.width,canv.height);
  ctx.restore();

  for (let i = 0; i < data.length; i++){
    let [ci,ps,ax,w,end] = data[i];
    if (ax == undefined){
      _sans_stroke(get_tmp_canv(ci).getContext('2d'),ps,ax,w,end,MODE_RDR)
    }else{
      _thick_stroke(get_tmp_canv(ci).getContext('2d'),ps,ax,w,end,MODE_RDR)
    }
    
  }

  canv_used = Array.from(new Set(canv_used));
  for (let i = 0; i < canv_used.length; i++){
    let canv2 = canv_tmp[canv_used[i]];
    ctx.save();
    if (canv_used[i] != RESERVED){
      ctx.filter="blur(4px) brightness(90%) contrast(1000%)";
    }
    ctx.globalCompositeOperation="multiply"
    ctx.drawImage(canv2,0,0);
    ctx.restore();
  }
  
}


function pt_seg_dist(p, p0, p1)  {
  // https://stackoverflow.com/a/6853926
  let x = p[0];   let y = p[1];
  let x1 = p0[0]; let y1 = p0[1];
  let x2 = p1[0]; let y2 = p1[1];
  let A = x - x1; let B = y - y1; let C = x2 - x1; let D = y2 - y1;
  let dot = A*C+B*D;
  let len_sq = C*C+D*D;
  let param = -1;
  if (len_sq != 0) {
    param = dot / len_sq;
  }
  let xx; let yy;
  if (param < 0) {
    xx = x1; yy = y1;
  }else if (param > 1) {
    xx = x2; yy = y2;
  }else {
    xx = x1 + param*C;
    yy = y1 + param*D;
  }
  let dx = x - xx;
  let dy = y - yy;
  // return [dx,dy];
  return Math.sqrt(dx*dx+dy*dy);
}

// function build_gui(obj,redraw){
  
//   let gui = new dat.GUI();
//   for (let key in obj.table){
//     let fold = gui.addFolder(key);
//     for (let i = 0; i < obj.table[key].data.length; i++){
//       if (typeof obj.table[key].data[i] == 'number'){
//         fold.add(obj.table[key].data,i,0,100).onChange(redraw);
//       }else{
//         fold.add(obj.table[key].data,i).onChange(redraw);
//       }
//     }
//   }
//   gui.close()
// }

function preprocessor(master,fun){
  
  let compiled = compile(JSON.parse(JSON.stringify(master)));
  function has_numbers(x){
    for (let i = 0; i < x.length; i++){
      if (typeof x[i] == 'number'){
        return true;
      }
    }
    return false;
  }
  function get_positionals(compiled,key){
    let p = master.table[key];
    let positionals = [];
    let idx = 0;
    for (let i = 0; i < p.data.length; i++){
      if (typeof p.data[i] == 'number'){
        positionals.push(idx);
        idx++;
      }else{
        positionals.push(-1);
        idx += compiled.table[p.data[i]].data.length;
      }
    }
    return positionals;
  }
  for (let key in master.table){
    let p = master.table[key];
    if (p.type == 'pt' && has_numbers(p.data)){
      let [x,y] = compiled.table[key].data;
      p.data = fun(x,y);
    }else if (p.type == 'ln' && has_numbers(p.data)){
      let [x0,y0,x1,y1] = compiled.table[key].data;
      let positionals = get_positionals(compiled,key);
      if (positionals.indexOf(0) >= 0 || positionals.indexOf(1) >= 0){
        p.data.splice(positionals.indexOf(0),2,...fun(x0,y0))
      }
      if (positionals.indexOf(2) >= 0 || positionals.indexOf(3) >= 0){
        p.data.splice(positionals.indexOf(2),2,...fun(x1,y1))
      }
    }else if (p.type == 'arc' && has_numbers(p.data)){
      let [x0,y0,x1,y1,x2,y2,x3,y3,d] = compiled.table[key].data;
      
      
      
      let positionals = get_positionals(compiled,key);

      if (positionals.indexOf(0) >= 0 || positionals.indexOf(1) >= 0){
        p.data.splice(positionals.indexOf(0),2,...fun(x0,y0))
      }
      if (positionals.indexOf(2) >= 0 || positionals.indexOf(3) >= 0){
        p.data.splice(positionals.indexOf(2),2,...fun(x1,y1))
      }
      if (positionals.indexOf(4) >= 0 || positionals.indexOf(5) >= 0){
        p.data.splice(positionals.indexOf(4),2,...fun(x2,y2))
      }
      if (positionals.indexOf(6) >= 0 || positionals.indexOf(7) >= 0){
        p.data.splice(positionals.indexOf(6),2,...fun(x3,y3))
      }
      if (positionals.indexOf(8) >= 0){
        
        let [x4,y4] = fun(...pseudo_arc_tip(x0,y0,x1,y1,x2,y2,x3,y3,d));
        
        
        let d2 = pt_seg_dist([x4,y4],fun(x1,y1),fun(x2,y2))
        p.data.splice(positionals.indexOf(7),1,d2)
      }
    }
  }
}



function build_interactive(canv,canv2,ta,master){
  
  let mouseX, mouseY;
  let ctx = canv.getContext('2d');
  
  let drag = null;
  
  function has_numbers(x){
    for (let i = 0; i < x.length; i++){
      if (typeof x[i] == 'number'){
        return true;
      }
    }
    return false;
  }
  function get_positionals(compiled,key){
    let p = master.table[key];
    let positionals = [];
    let idx = 0;
    for (let i = 0; i < p.data.length; i++){
      if (typeof p.data[i] == 'number'){
        positionals.push(idx);
        idx++;
      }else{
        positionals.push(-1);
        idx += compiled.table[p.data[i]].data.length;
      }
    }
    return positionals;
  }
  
  let compiled = compile(JSON.parse(JSON.stringify(master)));
  console.log(compiled);
  draw(canv,compiled,SW,MODE_DBG);
  draw(canv2,compiled,SW,MODE_RDR/*|MOPT_BLR*/);
  
  ta.addEventListener('input', function() {
    
    try{
      master = parse(ta.value);
      let compiled = compile(JSON.parse(JSON.stringify(master)));
      draw(canv,compiled,SW,MODE_DBG);
      draw(canv2,compiled,SW,MODE_RDR);
    }catch(e){
      console.warn("parse fail:");
      console.warn(e);
      ctx.resetTransform();
      // ctx.translate(50,50);
      // ctx.scale(4,4);
    }
  }, false);
  
  canv.addEventListener('mousemove',function(e){
    let compiled = compile(JSON.parse(JSON.stringify(master)));
    
    ctx.save();
    ctx.fillStyle="white";
    ctx.fillRect(0,0,canv.width,canv.height);
    ctx.restore();
    
    draw(canv,compiled,SW,MODE_DBG);
    
    ctx.save();
    ctx.translate(50,50);
    ctx.scale(4,4);
    

    let r = canv.getBoundingClientRect();
    mouseX = ((e.clientX-r.left)-50)/4;
    mouseY = ((e.clientY-r.top)-50)/4;
    
    function highlight(x,y){
      if (Math.hypot(mouseX-x,mouseY-y) < 3){
        ctx.save();
        ctx.globalCompositeOperation="multiply"
        ctx.fillStyle="rgba(0,0,0,0.3)"
        ctx.beginPath();
        ctx.ellipse(x,y,3,3,0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }else{
        ctx.save();
        ctx.globalCompositeOperation="multiply"
        ctx.fillStyle="rgba(0,0,0,0.1)"
        ctx.beginPath();
        ctx.ellipse(x,y,3,3,0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    }

    
    if (!drag){
      for (let key in master.table){
        let p = master.table[key];
        if (p.type == 'pt' && has_numbers(p.data)){
          let [x,y] = compiled.table[key].data;
          highlight(x,y);
        }else if (p.type == 'ln' && has_numbers(p.data)){
          let [x0,y0,x1,y1] = compiled.table[key].data;
          let positionals = get_positionals(compiled,key);
          if (positionals.indexOf(0) >= 0 || positionals.indexOf(1) >= 0){
            highlight(x0,y0);
          }
          if (positionals.indexOf(2) >= 0 || positionals.indexOf(3) >= 0){
            highlight(x1,y1);
          }
        }else if (p.type == 'arc' && has_numbers(p.data)){
          let [x0,y0,x1,y1,x2,y2,x3,y3,d] = compiled.table[key].data;
          let positionals = get_positionals(compiled,key);
          
          if (positionals.indexOf(0) >= 0 || positionals.indexOf(1) >= 0){
            highlight(x0,y0);
          }
          if (positionals.indexOf(2) >= 0 || positionals.indexOf(3) >= 0){
            highlight(x1,y1);
          }
          if (positionals.indexOf(4) >= 0 || positionals.indexOf(5) >= 0){
            highlight(x2,y2);
          }
          if (positionals.indexOf(6) >= 0 || positionals.indexOf(7) >= 0){
            highlight(x3,y3);
          }
          if (positionals.indexOf(8) >= 0){
            highlight(...pseudo_arc_tip(x0,y0,x1,y1,x2,y2,x3,y3,d));
          }
        }else if (p.type == 'axis' && has_numbers(p.data)){
          highlight(compiled.table[key]._axisidx*5,0);
        }
      }
    }else{
      let [typ,key,idx] = drag;

      if ('x' in idx){
        master.table[key].data[idx.x] = mouseX;
      }
      if ('y' in idx){
        master.table[key].data[idx.y] = mouseY;
      }
      if ('d' in idx){
        let [i0,x0,y0,x1,y1] = idx.d;
        x0 = compiled.table[key].data[x0];
        y0 = compiled.table[key].data[y0];
        x1 = compiled.table[key].data[x1];
        y1 = compiled.table[key].data[y1];
        
        master.table[key].data[i0] = pt_seg_dist([mouseX,mouseY],[x0,y0],[x1,y1]);
      }
      if ('a' in idx){
        let [i0,x0,y0] = idx.a;
        
        master.table[key].data[i0] = Math.atan2(mouseY-y0,mouseX-x0)*180/Math.PI;
      }
    }
    ctx.restore();
    
    ta.value = unparse(master);
  })
  
  
  canv.addEventListener('mousedown',function(e){
    let compiled = compile(JSON.parse(JSON.stringify(master)));
    
    let r = canv.getBoundingClientRect();
    mouseX = ((e.clientX-r.left)-50)/4;
    mouseY = ((e.clientY-r.top)-50)/4;
    
    for (let key in master.table){
      let p = master.table[key];
      if (p.type == 'pt' && has_numbers(p.data)){
        let [x,y] = compiled.table[key].data;
        if (Math.hypot(mouseX-x,mouseY-y) < 3){
          drag = [p.type,key,{}];
          if (typeof p.data[0] == 'number'){
            drag[2].x = 0;
          }
          if (p.data.length > 1 && typeof p.data[1] == 'number'){
            drag[2].y = 1;
          }
          
        }
      }else if (p.type == 'ln' && has_numbers(p.data)){
        let [x0,y0,x1,y1] = compiled.table[key].data;
        let positionals = get_positionals(compiled,key);
        
        if (Math.hypot(mouseX-x0,mouseY-y0) < 3){
          let i0 = positionals.indexOf(0);
          let i1 = positionals.indexOf(1);
          if (i0 != -1 || i1 != -1){
            drag = [p.type,key,{}];
          }
          if (i0 != -1){
            drag[2].x = i0;
          }
          if (i1 != -1){
            drag[2].y = i1;
          }
        }else if (Math.hypot(mouseX-x1,mouseY-y1) < 3){
          let i0 = positionals.indexOf(2);
          let i1 = positionals.indexOf(3);
          if (i0 != -1 || i1 != -1){
            drag = [p.type,key,{}];
          }
          if (i0 != -1){
            drag[2].x = i0;
          }
          if (i1 != -1){
            drag[2].y = i1;
          }
        }
      }else if (p.type == 'arc' && has_numbers(p.data)){
        let [x0,y0,x1,y1,x2,y2,x3,y3,d] = compiled.table[key].data;
        let [xd,yd] = pseudo_arc_tip(x0,y0,x1,y1,x2,y2,x3,y3,d);
        let positionals = get_positionals(compiled,key);
        
        if (Math.hypot(mouseX-x0,mouseY-y0) < 3){
          let i0 = positionals.indexOf(0);
          let i1 = positionals.indexOf(1);
          if (i0 != -1 || i1 != -1){
            drag = [p.type,key,{}];
          }
          if (i0 != -1){
            drag[2].x = i0;
          }
          if (i1 != -1){
            drag[2].y = i1;
          }
        }else if (Math.hypot(mouseX-x1,mouseY-y1) < 3){
          let i0 = positionals.indexOf(2);
          let i1 = positionals.indexOf(3);
          if (i0 != -1 || i1 != -1){
            drag = [p.type,key,{}];
          }
          if (i0 != -1){
            drag[2].x = i0;
          }
          if (i1 != -1){
            drag[2].y = i1;
          }
        }else if (Math.hypot(mouseX-x2,mouseY-y2) < 3){
          let i0 = positionals.indexOf(4);
          let i1 = positionals.indexOf(5);
          if (i0 != -1 || i1 != -1){
            drag = [p.type,key,{}];
          }
          if (i0 != -1){
            drag[2].x = i0;
          }
          if (i1 != -1){
            drag[2].y = i1;
          }
        }else if (Math.hypot(mouseX-x3,mouseY-y3) < 3){
          let i0 = positionals.indexOf(6);
          let i1 = positionals.indexOf(7);
          if (i0 != -1 || i1 != -1){
            drag = [p.type,key,{}];
          }
          if (i0 != -1){
            drag[2].x = i0;
          }
          if (i1 != -1){
            drag[2].y = i1;
          }
        }else if (Math.hypot(mouseX-xd,mouseY-yd) < 3){
          
          let i0 = positionals.indexOf(8);
          if (i0 != -1){
            drag = [p.type,key,{d:[i0,2,3,4,5]}];
          }
        }
      }else if (p.type == 'axis' && has_numbers(p.data)){
        
        let x0 = 5 * compiled.table[key]._axisidx;
        let y0 = 0;
        if (Math.hypot(mouseX-x0,mouseY-y0) < 3){
          drag = [p.type,key,{a:[0,x0,y0]}]
        }
      }
    }
    ctx.restore();
  });
  
  canv.addEventListener('mouseup',function(e){
    drag = null;
    let compiled = compile(JSON.parse(JSON.stringify(master)));
    draw(canv2,compiled,SW,MODE_RDR);
    
    
  })
}



function trace_grouped(ctx,epsilon=1,chan=0,thresh=128,inv=0){
  let cnv = ctx.canvas;
  let dat = ctx.getImageData(0,0,cnv.width,cnv.height).data;
  let im = [];
  
  for (let i = 0; i < dat.length; i+=4){
    im.push(dat[i+chan]<thresh?(1-inv):inv);
  }
  let contours = FindContours.findContours(im,cnv.width,cnv.height);
  let groups = {};
  for (let i = 0; i < contours.length; i++){
    let p = FindContours.approxPolyDP(contours[i].points,epsilon).map(x=>[(x[0]-50)/4,(x[1]-50)/4]);
    if (p.length < 3){
      continue;
    }
    if (contours[i].isHole){

      if (groups[contours[i].parent]){
        // p.reverse();
        groups[contours[i].parent].push(p);
      }
    }else{
      groups[i+2] = [p];
    }
  }
  return groups;
}





// let alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
// let alphabet = ['n','i','c','e'];
// let alphabet = ['g','p','q','j'];
// let alphabet = ['j','y'];
// let alphabet = ['s','v']
// let alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
// let alphabet = ['f','t'];
// let alphabet = ['f']

let alphabet = [
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
  // 'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
];
let abkeys = {serif:[],sans:[]};

let txts = {serif:{},sans:{}};

for (let ab of alphabet){  
  // txts.sans[ab] = read_file("fonts/sans/"+ab+".txt").toString();
  // txts.serif[ab] = read_file("fonts/serif/"+ab+".txt").toString();
}

read_file("fonts/sans.txt").toString().split('END').filter(x=>x.trim().length).map(parse).map(x=> (abkeys.sans.push(x.info.glyph[0]),txts.sans[x.info.glyph[0]]=unparse(x)) );

read_file("fonts/serif.txt").toString().split('END').filter(x=>x.trim().length).map(parse).map(x=> (abkeys.serif.push(x.info.glyph[0]),txts.serif[x.info.glyph[0]]=unparse(x)) );


let txtc = "";
for (let ab in txts.sans){
  txtc+=unparse(parse(txts.sans[ab]))+"\n";
}
for (let ab in txts.serif){
  txtc+=unparse(parse(txts.serif[ab]))+"\n";
}
console.log(txtc);


for (let fnt of ['sans','serif']){
  let table = document.createElement("table");
  let tr0 = document.createElement("tr");
  let tr1 = document.createElement("tr");
  let tr2 = document.createElement("tr");
  table.appendChild(tr0);
  table.appendChild(tr1);
  table.appendChild(tr2);
  document.body.appendChild(table)

  
  for (let ab of abkeys[fnt]){
    let td0 = document.createElement("td");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    tr0.appendChild(td0);
    tr1.appendChild(td1);
    tr2.appendChild(td2);


    let canv = document.createElement("canvas");
    canv.width = 500;
    canv.height = 500;
    td0.appendChild(canv);

    let canv2 = document.createElement("canvas");
    canv2.width = 500;
    canv2.height = 500;
    canv2.id = 'rast-'+fnt+'-'+ab;
    td1.appendChild(canv2);

    let txt = txts[fnt][ab];

    let ta = document.createElement("textarea");
    ta.style.width = 500;
    ta.style.height = 500;
    td2.appendChild(ta);
    // ta.innerHTML = txt;

    let master = parse(txt);
    // preprocessor(master,function(x,y){return [x+25-y/2,y]})

    // preprocessor(master,function(x,y){
    //   return [
    //     x+(noise(x*0.1,y*0.1,ab.charCodeAt(0)+Math.E)-0.5)*50,
    //     y+(noise(x*0.1,y*0.1,ab.charCodeAt(0)+Math.PI)-0.5)*50,
    //   ]
    // })
    // preprocessor(master,function(x,y){
    //   return [
    //     x+(Math.random()-0.5)*20,
    //     y+(Math.random()-0.5)*20,
    //   ]
    // })
    // preprocessor(master,function(x,y){
    //   return [
    //     x,
    //     Math.sqrt(y/100)*100
    //   ]
    // })

  //   preprocessor(master,function(x,y){

  //     function f(x){
  //       return sigmoid(x,0.3)
  //     }
  //     let fx = x/100;
  //     let fy = y/100;
  //     return [
  //       100*f( fx ),
  //       100*f( fy ),
  //     ]
  //   })

    console.log(master);

    ta.value = unparse(master);
    // console.log(master);
    // build_gui(master,redraw);
    build_interactive(canv,canv2,ta,master);

  }
}


function make_btn(name,fun){
  let btn = document.createElement("button");
  btn.innerHTML = name;
  btn.onclick = fun;
  document.body.appendChild(btn);
}


function make_input(name,func,defau,btn_name){
  let div = document.createElement("span");
  let inp = document.createElement("input");
  inp.value = defau || "";
  if (defau){
    inp.style.width = (defau.length+4) + "ch";
  }

  let btn = document.createElement("button");
  btn.innerHTML = btn_name || "set";
  document.body.appendChild(btn);
  btn.onclick = function(){
    func(inp.value);
    console.log("OK.")
  }
  inp.onkeydown = function(event){
    if (event.key == "Enter"){
      console.log('enter');
      btn.click();
    }
  }
  div.innerHTML = " "+name+": ";
  div.appendChild(inp);
  div.appendChild(btn);
  document.body.appendChild(div);
}


function make_slider(name,val,min,max,func){
  let div = document.createElement("span");
  let inp = document.createElement("input");
  inp.type = "range";
  inp.value = ( (val-min)/(max-min) ) * 100
  inp.onchange = function(){
    let v = ((Number(inp.value)/100) * (max - min) ) + min;
    func(v);
  }
  div.innerHTML = " "+name+": ";
  div.appendChild(inp);
  document.body.appendChild(div);
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

let glyphs = {};
let kerning = {"a":{"a":55,"b":52,"c":49,"d":53,"e":49,"f":46,"g":51,"h":56,"i":41,"j":34,"k":56,"l":41,"m":70,"n":56,"o":54,"p":52,"q":53,"r":56,"s":48,"t":42,"u":51,"v":49,"w":66,"x":58,"y":49,"z":53},"b":{"a":50,"b":49,"c":49,"d":52,"e":49,"f":41,"g":49,"h":49,"i":34,"j":31,"k":49,"l":34,"m":63,"n":49,"o":54,"p":49,"q":54,"r":49,"s":42,"t":40,"u":49,"v":49,"w":66,"x":47,"y":49,"z":47},"c":{"a":53,"b":50,"c":50,"d":53,"e":50,"f":40,"g":48,"h":50,"i":35,"j":32,"k":50,"l":35,"m":64,"n":50,"o":55,"p":50,"q":54,"r":49,"s":45,"t":40,"u":50,"v":49,"w":66,"x":47,"y":49,"z":46},"d":{"a":55,"b":52,"c":49,"d":53,"e":49,"f":46,"g":51,"h":56,"i":41,"j":34,"k":56,"l":41,"m":70,"n":56,"o":54,"p":52,"q":53,"r":56,"s":48,"t":42,"u":51,"v":51,"w":68,"x":58,"y":51,"z":53},"e":{"a":53,"b":50,"c":50,"d":53,"e":50,"f":40,"g":48,"h":50,"i":35,"j":32,"k":50,"l":35,"m":64,"n":50,"o":55,"p":50,"q":54,"r":49,"s":45,"t":40,"u":50,"v":48,"w":65,"x":46,"y":48,"z":47},"f":{"a":31,"b":45,"c":21,"d":25,"e":22,"f":33,"g":28,"h":45,"i":28,"j":25,"k":45,"l":30,"m":54,"n":40,"o":27,"p":40,"q":28,"r":37,"s":26,"t":32,"u":40,"v":44,"w":61,"x":42,"y":44,"z":32},"g":{"a":48,"b":50,"c":40,"d":44,"e":40,"f":49,"g":56,"h":57,"i":42,"j":56,"k":57,"l":42,"m":71,"n":57,"o":45,"p":55,"q":46,"r":57,"s":46,"t":47,"u":55,"v":59,"w":77,"x":58,"y":62,"z":51},"h":{"a":47,"b":45,"c":41,"d":45,"e":41,"f":44,"g":47,"h":54,"i":39,"j":30,"k":54,"l":39,"m":68,"n":54,"o":46,"p":48,"q":47,"r":54,"s":43,"t":35,"u":42,"v":44,"w":61,"x":55,"y":44,"z":49},"i":{"a":32,"b":31,"c":26,"d":30,"e":26,"f":29,"g":32,"h":39,"i":24,"j":15,"k":39,"l":24,"m":53,"n":39,"o":31,"p":33,"q":32,"r":39,"s":28,"t":24,"u":32,"v":36,"w":53,"x":40,"y":36,"z":34},"j":{"a":33,"b":34,"c":29,"d":33,"e":29,"f":28,"g":33,"h":36,"i":21,"j":33,"k":36,"l":21,"m":50,"n":36,"o":34,"p":35,"q":35,"r":36,"s":25,"t":27,"u":35,"v":39,"w":56,"x":37,"y":39,"z":31},"k":{"a":50,"b":48,"c":41,"d":46,"e":41,"f":47,"g":50,"h":57,"i":42,"j":33,"k":57,"l":42,"m":71,"n":57,"o":47,"p":52,"q":46,"r":57,"s":46,"t":44,"u":52,"v":56,"w":73,"x":58,"y":56,"z":52},"l":{"a":32,"b":32,"c":26,"d":30,"e":26,"f":29,"g":32,"h":39,"i":24,"j":15,"k":39,"l":24,"m":53,"n":39,"o":31,"p":33,"q":32,"r":39,"s":28,"t":24,"u":32,"v":36,"w":53,"x":40,"y":36,"z":34},"m":{"a":61,"b":59,"c":55,"d":59,"e":55,"f":58,"g":61,"h":68,"i":53,"j":44,"k":68,"l":53,"m":82,"n":68,"o":60,"p":62,"q":61,"r":68,"s":57,"t":49,"u":57,"v":58,"w":75,"x":69,"y":58,"z":63},"n":{"a":47,"b":45,"c":41,"d":45,"e":41,"f":44,"g":47,"h":54,"i":39,"j":30,"k":54,"l":39,"m":68,"n":54,"o":46,"p":48,"q":47,"r":54,"s":43,"t":34,"u":42,"v":44,"w":61,"x":55,"y":44,"z":49},"o":{"a":48,"b":46,"c":46,"d":50,"e":46,"f":36,"g":46,"h":46,"i":31,"j":28,"k":46,"l":31,"m":60,"n":46,"o":51,"p":46,"q":52,"r":46,"s":41,"t":36,"u":46,"v":45,"w":62,"x":43,"y":45,"z":43},"p":{"a":50,"b":49,"c":49,"d":52,"e":49,"f":41,"g":49,"h":49,"i":34,"j":31,"k":49,"l":34,"m":63,"n":49,"o":54,"p":49,"q":54,"r":49,"s":42,"t":40,"u":49,"v":50,"w":67,"x":47,"y":50,"z":47},"q":{"a":45,"b":41,"c":41,"d":45,"e":41,"f":40,"g":46,"h":48,"i":33,"j":49,"k":48,"l":33,"m":62,"n":48,"o":46,"p":54,"q":47,"r":48,"s":37,"t":39,"u":47,"v":51,"w":68,"x":49,"y":56,"z":43},"r":{"a":38,"b":38,"c":32,"d":34,"e":32,"f":36,"g":36,"h":38,"i":28,"j":25,"k":38,"l":23,"m":57,"n":43,"o":38,"p":43,"q":39,"r":42,"s":31,"t":35,"u":43,"v":46,"w":63,"x":44,"y":46,"z":37},"s":{"a":46,"b":43,"c":42,"d":46,"e":42,"f":39,"g":43,"h":44,"i":30,"j":27,"k":44,"l":29,"m":59,"n":45,"o":47,"p":45,"q":47,"r":44,"s":38,"t":37,"u":45,"v":50,"w":67,"x":47,"y":50,"z":41},"t":{"a":44,"b":40,"c":39,"d":43,"e":39,"f":36,"g":40,"h":41,"i":27,"j":24,"k":41,"l":26,"m":57,"n":43,"o":44,"p":43,"q":44,"r":41,"s":35,"t":35,"u":43,"v":47,"w":64,"x":45,"y":47,"z":38},"u":{"a":55,"b":52,"c":49,"d":53,"e":49,"f":47,"g":51,"h":57,"i":42,"j":34,"k":57,"l":42,"m":71,"n":57,"o":54,"p":52,"q":53,"r":57,"s":48,"t":42,"u":51,"v":51,"w":68,"x":59,"y":51,"z":54},"v":{"a":43,"b":48,"c":33,"d":36,"e":33,"f":47,"g":39,"h":48,"i":36,"j":33,"k":48,"l":33,"m":66,"n":52,"o":38,"p":52,"q":39,"r":49,"s":38,"t":44,"u":52,"v":58,"w":75,"x":55,"y":58,"z":44},"w":{"a":61,"b":65,"c":49,"d":52,"e":49,"f":64,"g":56,"h":65,"i":54,"j":51,"k":65,"l":50,"m":83,"n":69,"o":55,"p":69,"q":56,"r":66,"s":56,"t":62,"u":69,"v":75,"w":92,"x":72,"y":75,"z":61},"x":{"a":50,"b":49,"c":41,"d":46,"e":41,"f":48,"g":50,"h":57,"i":42,"j":35,"k":57,"l":42,"m":71,"n":57,"o":47,"p":54,"q":46,"r":57,"s":46,"t":46,"u":54,"v":59,"w":76,"x":58,"y":59,"z":52},"y":{"a":44,"b":48,"c":32,"d":35,"e":33,"f":47,"g":39,"h":48,"i":37,"j":34,"k":48,"l":33,"m":66,"n":52,"o":38,"p":52,"q":39,"r":49,"s":38,"t":45,"u":52,"v":58,"w":75,"x":55,"y":58,"z":44},"z":{"a":46,"b":42,"c":41,"d":44,"e":41,"f":40,"g":42,"h":48,"i":33,"j":28,"k":48,"l":33,"m":62,"n":48,"o":46,"p":46,"q":45,"r":48,"s":37,"t":39,"u":46,"v":48,"w":65,"x":49,"y":48,"z":44}}

function poly_overlap(c0,c1){
  for (let i = 0; i < c0.length; i++){
    if (pt_in_poly(c0[i],c1)){
      return true;
    }
  }
  for (let i = 0; i < c1.length; i++){
    if (pt_in_poly(c1[i],c0)){
      return true;
    }
  }
  for (let i = 0; i < c0.length; i++){
    let [x0,y0] = c0[i];
    let [x1,y1] = c0[(i+1)%c0.length];
    for (let j = 0; j < c1.length; j++){
      let [x2,y2] = c1[j];
      let [x3,y3] = c1[(j+1)%c1.length];
      
      let [t,s] = line_isect(x0,y0,x1,y1,x2,y2,x3,y3);
      if (0 <= t && t <= 1 && 0 <= s && s <= 1){
        return true;
      }
    }
  }
  return false;
}

function calc_kern(o0,o1,guess=100,step=5){
  for (let x = guess; x >= 0; x-=step){
    for (let k0 in o0){
      let c0 = o0[k0][0];
      for (let k1 in o1){
        let c1 = o1[k1][0].map(a=>[a[0]+x,a[1]]);
        if (poly_overlap(c0,c1)){
          return x + step;
        }
      }
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

function glyph_bbox(o0){
  let pts = [];
  for (let k0 in o0){
    let c0 = o0[k0][0];
    pts.push(...c0);
  }
  return get_bbox(pts);
}


make_select('font',['sans','serif'],[
  function(x){
    FONT = 'sans';
  },
  function(x){
    FONT = 'serif';
  }
]);

make_btn("build glyphs",function(){  
  for (let ab in txts[FONT]){
    let cnv = document.getElementById('rast-'+FONT+'-'+ab);
    let outlines = trace_grouped(cnv.getContext('2d'),0.5);
    glyphs[ab] = {
      outlines,
      bbox:glyph_bbox(outlines),
    }
  }
});

make_btn("clear kerning",function(){  
  kerning = {};
});

make_btn("approx kerning",function(){  
  for (let ab in glyphs){
    console.log(ab);
    kerning[ab] = {};
    let o0 = glyphs[ab].outlines;
    for (let cd in glyphs){
      let o1 = glyphs[cd].outlines;

      let guess = glyphs[ab].bbox.x + glyphs[ab].bbox.w - glyphs[cd].bbox.x;
      kerning[ab][cd] = guess;
    }
  }
  console.log(kerning);
});

make_input("refine kerning",function(n){  
  n = Number(n);
  for (let ab in glyphs){
    console.log(ab);
    let o0 = glyphs[ab].outlines;
    for (let cd in glyphs){
      let o1 = glyphs[cd].outlines;
      let k = calc_kern(o0,o1,kerning[ab][cd],n);
      kerning[ab][cd] = k;
    }
  }
  console.log(kerning);
},2);

let pvw_cnv = document.createElement("canvas");
pvw_cnv.width = 2000;
pvw_cnv.height = 100;
document.body.appendChild(pvw_cnv)

make_input("preview",function(s){
  s = s.trim();
  
  let ctx = pvw_cnv.getContext('2d');
  ctx.clearRect(0,0,pvw_cnv.width,pvw_cnv.height);
  let gs = [];
  for (let i = 0; i < s.length; i++){
    let g = glyphs[s[i]];
    if (g || s[i] == " "){
      gs.push(s[i]);
    }
  }
  let x = 0;
  for (let i = 0; i < gs.length; i++){
    if (gs[i] == " ") continue;
    if (i){
      let i0 = i-1;
      let sc = 0;
      while(gs[i0] == " " && i0 > 0){
        i0 -= 1;
        sc++;
      }
      x += kerning[gs[i0]][gs[i]]+5+sc*20;
      console.log(x);
    }
    
    ctx.fillStyle="gray";
    ctx.strokeStyle="black";
    ctx.beginPath();
    let g = glyphs[gs[i]].outlines;
    for (let j in g){
      
      
      for (let k = 0; k < g[j].length; k++){
        // console.log(g[j][k]);
        for (let n = 0; n < g[j][k].length; n++){
          ctx[n?'lineTo':'moveTo'](x+g[j][k][n][0], g[j][k][n][1]);
          // console.log(x+g[j][k][n][0], g[j][k][n][1]);
        }
      }
    }
    ctx.fill();
    ctx.stroke();
  }
},"sphinx of black quartz judge my vow")

make_btn('ttf',function(){
  let nglyphs = [];
  let nkerning = [];
  for (let ab in glyphs){
    let g = glyphs[ab].outlines;
    let bb = glyphs[ab].bbox;
    let glyph = {
      unicode: ab.charCodeAt(0),
      advw:(~~(bb.w*10))+100,
      lsb:0,
      contours:[]
    }

    for (let j in g){
      for (let k = 0; k < g[j].length; k++){
        glyph.contours.push([]);
        for (let n = 0; n < g[j][k].length; n++){
          let [x,y] = g[j][k][n];
          glyph.contours.at(-1).push([
            ~~((x-bb.x)*10),~~(-y*10+666)
          ])
        }
      }
    }
    nglyphs.push(glyph);
  }
  for (let a in kerning){
    for (let b in kerning[a]){
      let w = glyphs[a].bbox.w+glyphs[a].bbox.x-glyphs[b].bbox.x;
      nkerning.push({
        l:a.charCodeAt(0),
        r:b.charCodeAt(0),
        val:~~(kerning[a][b]-w)*10
      })
    }
  }
  nglyphs.push({
    unicode:' '.charCodeAt(0),
    contours:[],
    advw:200,
    lsb:0,
  })
  let fam = `PARAM-${FONT}`;
  let bytes = encode_ttf({
    family:fam,
    style:`${SW}`,
    version:`1.0`,
    upM:1000,
    asc:666,
    dsc:-333
  },nglyphs,nkerning)

  
  let name = `${fam}-${new Date().getTime()}.ttf`;
  let data = new Uint8Array(bytes);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  var blob = new Blob([data], {type: "font/ttf"});
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
  
})

function get_color_glyph(ab){
  let txt = txts[FONT][ab];
  let master = parse(txt);
  let compiled = compile(JSON.parse(JSON.stringify(master)));

  let ccc = document.createElement("canvas");
  ccc.width = 500;
  ccc.height = 500;
  draw(ccc,compiled,SW,MODE_DBG|MOPT_NSC);
  
  
  let ctx = ccc.getContext('2d');
  
  let g0 = trace_grouped(ctx,0.5,1,200,0);
  let g1 = trace_grouped(ctx,0.5,1,150,0);
  let g2 = trace_grouped(ctx,0.5,1,100,0);
  
  draw(ccc,compiled,SW,MODE_DBG);
  
  
  ctx.beginPath();
  ctx.ellipse(250,250,200,200,0,0,Math.PI*2);
  ctx.moveTo(50,51);
  ctx.lineTo(450,51);
  ctx.moveTo(50,450);
  ctx.lineTo(450,450);
  ctx.stroke();
  
  let g3 = trace_grouped(ctx,0.5,0,180);
  
  ctx.resetTransform();
  ctx.clearRect(0,0,ccc.width,ccc.height);
  
  function vis(g){
    ctx.save();
    ctx.scale(4,4);
    ctx.beginPath();
    for (let j in g){
      

      for (let k = 0; k < g[j].length; k++){

        for (let n = 0; n < g[j][k].length; n++){
          let [x,y] = g[j][k][n];
          ctx[n?'lineTo':'moveTo'](x,y);

        }
      }
      
    }
    ctx.fill();
    ctx.restore();
  }
  
  ctx.fillStyle="red";
  vis(g0);
  ctx.fillStyle="green";
  vis(g1);
  ctx.fillStyle="blue";
  vis(g2);
  ctx.fillStyle="black";
  vis(g3);
  document.body.appendChild(ccc);
  
  function add_contours(contours,g){
    for (let j in g){
      for (let k = 0; k < g[j].length; k++){
        contours.push([]);
        for (let n = 0; n < g[j][k].length; n++){
          let [x,y] = g[j][k][n];
          contours.at(-1).push([
            ~~((x)*10),~~(-y*10+666)
          ])
        }
      }
    }
  }
  
  
  let glyph = {
    unicode:ab.charCodeAt(0),
    advw:1100,
    lsb:0,
    layers:[
      {color:0,contours:[]},
      {color:1,contours:[]},
      {color:2,contours:[]},
      {color:3,contours:[]},
    ],
  }
  add_contours(glyph.layers[0].contours,g0);
  add_contours(glyph.layers[1].contours,g1);
  add_contours(glyph.layers[2].contours,g2);
  add_contours(glyph.layers[3].contours,g3);
  console.log(glyph)
  return glyph;
  
}


make_btn('COLR otf',function(){
  let nglyphs = [];
  let nkerning = [];
  for (let a in kerning){
    for (let b in kerning[a]){
      // let w = glyphs[a].bbox.w+glyphs[a].bbox.x-glyphs[b].bbox.x;
      let w = 100;
      nkerning.push({
        l:a.charCodeAt(0),
        r:b.charCodeAt(0),
        val:~~(kerning[a][b]-w)*10
      })
    }
  }
  for (let ab in glyphs){
    nglyphs.push(get_color_glyph(ab));
  }
  nglyphs.push({
    unicode:' '.charCodeAt(0),
    layers:[{color:0,contours:[]}],
    advw:200,
    lsb:0,
  })
  
  let fam = `PARAM-COLR-${FONT}`;
  let bytes = encode_otf_colr({
    family:fam,
    style:`${SW}`,
    version:`1.0`,
    upM:1000,
    asc:666,
    dsc:-333
  },nglyphs,[
    [255,0,0,90],
    [255,0,0,80],
    [200,0,0,200],
    [0,0,0],
  ],nkerning)

  
  let name = `${fam}-${new Date().getTime()}.otf`;
  let data = new Uint8Array(bytes);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  var blob = new Blob([data], {type: "font/otf"});
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
  
})




document.body.appendChild(document.createElement("br"))

function skeleton_warp(sk,fun){
    
  
  
  let canv = document.createElement("canvas");
  canv.width = 500;
  canv.height = 500;
  canv.style.border = "1px solid black"
  document.body.appendChild(canv);
  let ctx = canv.getContext('2d');
  let mouseX = 0;
  let mouseY = 0;
  canv.addEventListener('mousemove',function(e){
    
    

    let r = canv.getBoundingClientRect();
    mouseX = ((e.clientX-r.left)-50)/4;
    mouseY = ((e.clientY-r.top)-50)/4;
    
    
    let sk2 = JSON.parse(JSON.stringify(sk));
    
    
    for (let i = 0; i < sk2.length; i++){
      let ps = resample(sk2[i][1],2);
      // let ps = sk2[i][1];
      for (let j = 0; j < ps.length; j++){
        // ps[j][0] += 50*(-0.5+noise((mouseX*0.01+ps[j][0])*0.01,(mouseY*0.01+ps[j][1]*0.01)));
        // ps[j][1] += 50*(-0.5+noise((mouseY*0.01+ps[j][0])*0.01,(mouseX*0.01+ps[j][1]*0.01),1));
        ps[j] = fun(...ps[j],mouseX,mouseY);
      }
      sk2[i][1] = ps;
    }
    
    draw_from_data(canv,sk2);
   
    
  });
}


// let skeletons = [];

// for (let ab of alphabet){

//   let txt = txts[FONT][ab];
//   let master = parse(txt);
  
//   let compiled = compile(JSON.parse(JSON.stringify(master)));
//   let data = draw(dummy(),compiled,SW,MODE_DAT);
//   skeletons[ab] = data;
// }

// console.log(skeletons);


// function sigmoidx(g,m,x){
  
//   // y = g x + b
//   // 0.5 = g m + b
//   // b = 0.5 - g * m
//   let b = 0.5 - g * m;
//   if (x < m){
//     let t = x/m;
//     return (g * x + b ) * t
//   }else{
//     let t = (x-m)/(1-m);
    
//     return (g * x + b) * (1-t) + t;
//   }
// }

// function sigmoidx(g,m,x){
//   function win(t){
//     // return 0.5-Math.cos(t*Math.PI)/2;
//     return sigmoid(t,0.5);
//   }
//   // y = g x + b
//   // 0.5 = g m + b
//   // b = 0.5 - g * m
//   let b = 0.5 - g * m;
//   if (x < m){
//     let t = win(x/m);
//     return (g * x + b ) * t + (0) * (1-t)
//   }else{
//     let t = win((x-m)/(1-m));
//     return (g * x + b) * (1-t) + (1) * t;
//   }
// }


function sigmoidx(g,m,x){
  function win(t,q){
    // return 0.5-Math.cos(t*Math.PI)/2;
    return sigmoid(t,q);
  }
  // y = g x + b
  // 0.5 = g m + b
  // b = 0.5 - g * m
  let b = 0.5 - g * m;
  if (x < m){
    let t = win(x/m,0.9-m*0.8);
    return (g * x + b ) * t + (0) * (1-t)
  }else{
    let t = win((x-m)/(1-m),0.9-(1-m)*0.8);
    return (g * x + b) * (1-t) + (1) * t;
  }
}

// for (let ab of ['a','u','g']){
//   skeleton_warp(skeletons[ab],function(x,y,mx,my){
//     return [
//       sigmoidx(1,mx/100,x/100)*100,
//       sigmoidx(1,my/100,y/100)*100,
//     ]
//     // return [
//     //   x+100*(-0.5+noise(x*0.01,y*0.01,mx*0.01)),
//     //   y+100*(-0.5+noise(x*0.01,y*0.01,my*0.01)),
//     // ]
//     // return [
//     //   x+(mx-50)*(y-50)*0.1,
//     //   y,
//     // ]
//     // return [
//     //   x,
//     //   y+100*(-0.5+noise(y*0.01,mx*0.01,my*0.01)),
//     // ]
//   });
// }



// document.body.scrollLeft = 100000;





function animator(alphabet,ncol,nrow,funcs){
  let frame = 0;
  let func = funcs[Object.keys(funcs)[0]];
  let font = 'sans';
  let sw = SW;
  document.body.appendChild(document.createElement("br"))
  
  make_select('font',['sans','serif'],[
    function(x){
      font = 'sans';
    },
    function(x){
      font = 'serif';
    }
  ]);
  
  make_select('func',Object.keys(funcs),Object.keys(funcs).map(
    key=>{
      return function(){frame = 0;func = funcs[key]};
    }
  ));
  
  make_slider('weight',sw,2,8,function(v){
    sw = v;
  })
  
  document.body.appendChild(document.createElement("br"))
  
  let canv = document.createElement("canvas");
  canv.width = ncol*500;
  canv.height = nrow*500;
  canv.style.border = "1px solid black"
  document.body.appendChild(canv);
  let ctx = canv.getContext('2d');
  
  
  let canv2 = document.createElement("canvas");
  canv2.width = 500;
  canv2.height = 500;
  
  
  
  let masters = {sans:{},serif:{}};
  for (let ab of alphabet){
    masters.sans[ab] = parse(txts.sans[ab]);
    masters.serif[ab] = parse(txts.serif[ab]);
  }
  console.log(masters);

  console.log(func)
  function loop(){
    requestAnimationFrame(loop);
    
    for (let i = 0; i < alphabet.length; i++){
      if (i > ncol*nrow){
        break;
      }
      let ab = alphabet[i];
      let col = i % ncol;
      let row = ~~(i / ncol);
      let master = JSON.parse(JSON.stringify(masters[font][ab]));
      preprocessor(master,func(frame));
      
      let compiled = compile(JSON.parse(JSON.stringify(master)));
      draw(canv2,compiled,sw,MODE_DBG);
      // draw(canv2,compiled,sw,MODE_RDR);
      ctx.drawImage(canv2,col*500,row*500);

    }
    frame++;
  }
  
  loop();
  
}

animator('abcdef',3,2,{
  spring:function(frame){
    return function(x,y){
      let xx = x+(noise(x,y)-0.5)*100;
      let yy = y+(noise(x,y,1)-0.5)*100;
      let vx = 0;
      let vy = 0;
      for (let i = 0; i < Math.min(1000,frame); i++){
        let dx = x - xx;
        let dy = y - yy;
        vx +=  0.05 * dx;
        vy +=  0.05 * dy;
        xx += vx;
        yy += vy;
        vx *= 0.99;
        vy *= 0.99
      }
      return [xx,yy]
    }
  },
  pop:function(frame){
    return function(x,y){
      let xx = (x+(noise(x,y)-0.5)*300 - 50)*0.1+50;
      let yy = (y+(noise(x,y,1)-0.5)*300 - 50)*0.1+50;
      let vx = 0;
      let vy = 0;
      for (let i = 0; i < Math.min(1000,frame); i++){
        let dx = x - xx;
        let dy = y - yy;
        vx +=  0.05 * dx;
        vy +=  0.05 * dy;
        xx += vx;
        yy += vy;
        vx *= 0.99;
        vy *= 0.99
      }
      return [xx,yy]
    }
  },
  pendulum:function(frame){
    return function(x,y){
      if (y == 0){
        return [x,y]
      }
      let l = y;
      let v = 0;
      let ang = Math.PI/8;
      let k = -9.8/l;
      let ts = 0.1;
      for (let i = 0; i < Math.min(2000,frame); i++){
        let a = k * Math.sin(ang);
        v += a * ts;
        ang += v * ts;
      }
      return [x+Math.sin(ang)*l,Math.cos(ang)*l]
    }
  },
  gravity:function(frame){
    return function(x,y){
      let yy = x*0.1+y*0.1;//Math.max(y-100,0);
      let vv = 0;
      for (let i = 0; i < Math.min(1000,frame); i++){
        vv += 0.1;
        yy += vv;
        if (yy > y){
          vv *= -0.9;
          yy -= 0.1;
        }
      }
      return [x,yy];
    }
  },
  wave:function(frame){
    let t = frame/30;
    return function(x,y){
      return [x+Math.sin(x*0.02+t)*20,y]
    }
  },
  vwave:function(frame){
    let t = frame/30;
    return function(x,y){
      return [x,y+Math.sin(y*0.02+t)*20]
    }
  },
  wobble:function(frame){
    let t = frame/30;
    return function(x,y){
      return [x+(y-50)*(x-50)*Math.sin(t*2)*0.005,y]
    }
  },
  slant:function(frame){
    let t = frame/30;
    return function(x,y){
      return [x+(25-y/2)*Math.sin(t),y]
    }
  },

});




// let seeds = [262, 596, 832, 484, 399, 288, 314, 500, 913, 638];
let seeds = [262, 596, 832, 484, 399, 288, 314, 500, 913, 638, 173, 846, 793, 492, 262, 506, 532, 64, 892, 155];
for (let i = 0; i < 50; i++){
  seeds.push(~~(Math.random()*1000))
}

let table = document.createElement("table");
let tr0 = document.createElement("tr");
let tr1 = document.createElement("tr");
let tr2 = document.createElement("tr");
table.appendChild(tr0);
table.appendChild(tr1);
table.appendChild(tr2);
document.body.appendChild(table)

for (let i = 0; i < seeds.length; i++){
  let td0 = document.createElement("td");
  let td1 = document.createElement("td");
  let td2 = document.createElement("td");
  tr0.appendChild(td0);
  tr1.appendChild(td1);
  tr2.appendChild(td2);

  
  let canv = document.createElement("canvas");
  canv.width = 500;
  canv.height = 500;
  td0.appendChild(canv);

  let canv2 = document.createElement("canvas");
  canv2.width = 500;
  canv2.height = 500;
  canv2.id = 'rast-rand-'+i;
  td1.appendChild(canv2);

  let txt = gen_rand_glyph(seeds[i]);

  let ta = document.createElement("textarea");
  ta.style.width = 500;
  ta.style.height = 500;
  td2.appendChild(ta);

  let master = parse(txt);

  console.log(master);
  
  ta.value = unparse(master);
  build_interactive(canv,canv2,ta,master);

}





function lewitt(txt){
  let master = parse(txt);
  let o = `Start with a canvas of equal width and height, with the origin at the upper left, and positive X axis growing toward the right, and positive Y axis growing toward the bottom. `;
  o += `All units are mesured as a percentage of canvas width. `;
  o += `Perpare a pencil and a marker of width ${2*SW}%. `;
  function getmath(data){
    
  }
  function mkname(p){
    return `"${p.replace(/\$/g,'')}"`;
  }
  
  function getval(data){
    let p = data.shift();
    if (typeof p == 'string'){
      let z = master.table[p];
      if (z.type == 'val'){
        return `value of ${mkname(p)}`;
      }else{
        data.unshift(...z.data);
        return getval(data);
      }
    }else if (typeof p == 'number'){
      return `${p}%`;
    }else{
      return getmath(p);
    }
  }
  function getpt(data){
    let p = data.shift();
    
    if (typeof p == 'string'){
      let z = master.table[p];
      if (z.type == 'pt' || z.type == 'xpt'){
        return `point ${mkname(p)}`;
      }else if (z.type == 'val'){
        return `point at X of ${p} and Y of ${getval(data)}`;
      }else{
        data.unshift(...z.data);
        return getpt(data);
      }
    }else{
      data.unshift(p);
      return `point at X of ${getval(data)} and Y of ${getval(data)}`;
    }
  }
  function getln(data){
    let p = data.shift();
    
    if (typeof p == 'string'){
      let z = master.table[p];
      if (z.type == 'ln' || z.type == 'xln'){
        return `line ${mkname(p)}`;
      }else{
        data.unshift(p);
        let a = getpt(data);
        let b = getpt(data);
        return `line from ${a} to ${b}`;
      }
    }else{
      data.unshift(p);
      let a = getpt(data);
      let b = getpt(data);
      return `line from ${a} to ${b}`;
    }

  }
  function getxpt(data){
    let a = getln(data);
    let b = getln(data);
    return `intersection point between ${a} and ${b}`
  }
  function getxln(data){
    let a = getln(data);
    let b = getpt(data);
    let c = getval(data);
    return `line starting from ${b} at ${c} degree clockwise angle from ${a}`
  }
  function getarc(data){
    let a = getln(data);
    let b = getln(data);
    let c = getval(data);
    return `arc starting from ${a} and ending at ${b} with a curvature of ${c}`;
  }
  
  let maybeaxis = Object.keys(master.table).filter(x=>master.table[x].type=="axis")[0];
  if (maybeaxis){
    let ax = getval(master.table[maybeaxis].data);
    o += `Hold the marker at an counter-clockwise angle of ${ax} degrees from the positive X axis. `;
  }else{
    o += `Hold the marker at an angle that is always perpendicular to the direction of strokes. `
  }
  
  for (let k in master.table){
    let {type, draw, data} = master.table[k];
    let pen = draw?'marker':'pencil';
    if (type == 'pt'){
      o += `Use the ${pen} to draw a ${getpt(data.slice())}, name it ${mkname(k)}. `;
    }else if (type == 'ln'){
      o += `Use the ${pen} to draw a ${getln(data.slice())}, name it ${mkname(k)}. `;
    }else if (type == 'xpt'){
      o += `Use the ${pen} to draw an ${getxpt(data.slice())}, name it ${mkname(k)}. `;
    }else if (type == 'xln'){
      o += `Use the ${pen} to draw a ${getxln(data.slice())}, name it ${mkname(k)}. `;
    }else if (type == 'arc'){
      o += `Use the ${pen} to draw a ${getarc(data.slice())}, name it ${mkname(k)}. `;
    }else if (type == 'val'){
      o += `Let the value of ${mkname(k)} be ${getval(data.slice())}. `;
    }else{
      console.log('?',master.table[k])
    }
  }
  return o;
  
}





