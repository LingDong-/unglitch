/* global describe rand */
function gen_rand_glyph(seed=0){
  let is_serif = true;
  let jsr = 0x5EED+seed;
  function rand(){
    jsr^=(jsr<<17);
    jsr^=(jsr>>13);
    jsr^=(jsr<<5);
    return (jsr>>>0)/4294967295;
  }

  function randint(b){
    return ~~(rand()*b);
  }
  function choice(c){
    return c[randint(c.length)]
  }
  function clamp(x,a,b){
    if (x < a) return a;
    if (x > b) return b;
    return x;
  }
  function is0(x){
    return x == 0;
  }
  let pts = [];
  let hls = [];
  let vls = [];
  let xps = [];
  let lns = [];
  let ars = [];
  
  // for (let i = 0; i < 10; i++){
  //   pts.push([randint(100),randint(100)])
  // }
  for (let i = 0; i < 4; i++){
    let y;
    let t = 0;
    do{
      y = randint(70)+15;
      t+=0.1;
    }while(hls.filter(a=>(Math.abs(a-y)<15-t)).length);
    
    hls.push(y);
  }
  hls.sort();
  for (let i = 0; i < 4; i++){
    let y;
    let t = 0;
    do{
      y = randint(70)+15;
      t+=0.1;
    }while(vls.filter(a=>(Math.abs(a-y)<15-t)).length);
    
    vls.push(y);
  }
  vls.sort();
  for (let i = 0; i < hls.length; i++){
    for (let j = 0; j < vls.length; j++){
      xps.push([j,i]);
    }
  }
  // for (let i = 0; i < 4; i++){
  //   lns.push([randint(xps.length),randint(xps.length)]);
  // }
  // for (let i = 0; i < 3; i++){
  //   ars.push([randint(xps.length),randint(xps.length),randint(xps.length),randint(xps.length),randint(50)]);
  // }
  let lne = [];
  let lnl = [];
  let arl = [];
  

  let xys = [];
  let n = randint(5)+10;

  do{
    xys = []
    let x = randint(vls.length);
    let y = randint(hls.length);

    xys.push([x,y]);

    for (let j = 0; (j < 100) && xys.length <n; j++){
      let [lx,ly] = (xys[xys.length-2]||[-1,-1]);
      let [x,y] = xys[xys.length-1];

      let dx = choice([-1,0,0,0,1]);
      let dy = choice([-1,0,0,0,1]);
      let x1 = clamp(x + dx, 0, vls.length-1);
      let y1 = clamp(y + dy, 0, hls.length-1);
      // console.log(x1,y1);
      if ((x1 == x && y1 == y) || (x1 == lx && y1 == ly) || (is0(x1-x) == is0(x-lx) && is0(y1-y) == is0(y-ly)) ||
         xys.filter(a=>(a[0]==x1 && a[1]==y1)).length

         ){
        continue;
      }
      // console.log('ok')

      xys.push([x1,y1]);
    }
    console.log(xys);
  }while (xys.length < n);


  let lb = 0;
  let ll = 2;
  for (let j = 0; j < xys.length-1; j++){
    let [x,y] = xys[j];
    let [x1,y1] = xys[j+1];
    if (j > 0 && lb == j){

    }else if (randint(3)<2 && j > 0 && j < xys.length-2 && j % 2 == 1){
      ars.push([(xys[j-1][1] * vls.length + xys[j-1][0]), (y * vls.length + x), (y1 * vls.length + x1), (xys[j+2][1] * vls.length + xys[j+2][0]), randint(25)+10]);
      arl.push(ll);
    }else{
      lns.push([(y * vls.length + x), (y1 * vls.length + x1)]);
      let el = [];
      let er = []
      if (j == 0 || (lb == j-1 && j !=1 )){
        if (y1 - y){
          el.push('@srf','L','T');
        }else{
          el.push('@srf','L',choice([']','T',']']),90);
        }
      }
      if (randint(3)<1 && j-lb > 3 && j < xys.length-4){
        lb = j+1;

      }
      lnl.push(ll);

      if (j == xys.length-2 || lb == j+1){
        if (y1 - y){
          er.push('@srf','R','T');
        }else{
          er.push('@srf','R',choice([']','T',']']),90);
        }
        ll++;
      }

      el.push(...er);
      lne.push(el)

    }

  }
  
  let xpv = []
  if (randint(4)<1){
    let pp = choice(xps.filter(b=>(!xys.filter(a=>(a[0]==b[0] && a[1]==b[1])).length)));
    xpv[pp[1]*vls.length+pp[0]] = true;
  }
  
  
  let o = `glyph : ${seed}\n`
  if (is_serif){
    o += `axis $a0 : 15\n`;
  }
  for (let i = 0; i < pts.length; i++){
    o += `pt $p${i} : ${pts[i][0]} ${pts[i][1]}\n`;
  }
  for (let i = 0; i < hls.length; i++){
    let y = hls[i];
    let y1 = y;
    if (randint(6)<1){
      y1 += (randint(10)+5)*choice([-1,1]);
    }
    o += `ln $h${i} : ${0} ${y} ${100} ${y1}\n`;
  }
  for (let i = 0; i < vls.length; i++){
    let x = vls[i]
    let x1 = x;
    if (randint(6)<1){
      x1 += (randint(10)+5)*choice([-1,1]);
    }
    o += `ln $v${i} : ${x} ${0} ${x1} ${100}\n`;
  }
  for (let i = 0; i < xps.length; i++){
    o += `xpt $q${i} : $v${xps[i][0]} $h${xps[i][1]}`;
    if (xpv[i]){
      o += "!1";
    }
    o += `\n`;
  }
  for (let i = 0; i < lns.length; i++){
    o += `ln $l${i} : $q${lns[i][0]} $q${lns[i][1]}`;
//     if (randint(2) < 1){
//       o += `@srf R ${choice(['>',']',')','T'])}`
//     }
//     if (randint(2) < 1){
//       o += `@srf L ${choice(['>',']',')','T'])}`
//     }
    o += lne[i].join(" ");
    o += `!${lnl[i]}\n`
  }
  for (let i = 0; i < ars.length; i++){
    o += `arc $c${i} : $q${ars[i][0]} $q${ars[i][1]} $q${ars[i][2]} $q${ars[i][3]} ${ars[i][4]} `;
    // if (randint(2) < 1){
    //   o += `@srf R ${choice(['>',']',')','T'])}`
    // }
    // if (randint(2) < 1){
    //   o += `@srf L ${choice(['>',']',')','T'])}`
    // }
    
    o += `!${arl[i]}\n`
  }


  
  return o;
}