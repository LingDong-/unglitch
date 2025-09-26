/* global describe REMEZ */

var remez_approx;
let G = (x)=>document.getElementById(x);

REMEZ().then(function(r){
  remez_approx = r.cwrap(
    'remez_approx',
    'string',
    ['string','number','number','number']
  );
  G('btn_solve').click();
})


function make_poly(cfs){
  if (cfs.length == 1){
    return `${cfs[0]}`
  }
  return `${cfs[0]}+(${make_poly(cfs.slice(1))})*x`;
}

function make_plot(fun0,fun1,xmin,xmax){
  let ymin = Infinity;
  let ymax = -Infinity;
  let y0s = [];
  let y1s = [];
  
  let xm = xmin - (xmax-xmin)*0.5;
  let xM = xmax + (xmax-xmin)*0.5;
  let n = 512;
  
  for (let i = 0; i < n; i++){
    let x = xm + (i/n)*(xM-xm);
    
    let y0 = fun0(x);
    let y1 = fun1(x);
    if (isNaN(y0) || Math.abs(y0)==Infinity) y0=0;
    if (isNaN(y1) || Math.abs(y1)==Infinity) y1=0;
    ymin = Math.min(ymin,y0,y1);
    ymax = Math.max(ymax,y0,y1);
    y0s.push(y0);
    y1s.push(y1);
  }

  // if (ymax == Infinity) ymax = 99;
  // if (ymin ==-Infinity) ymin =-99;
  
  let ym = ymin - (ymax-ymin)*0.25;
  let yM = ymax + (ymax-ymin)*0.25;

  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">`
  o += `<path d="M 128 0 128 512 M 384 0 384 512" fill="none" stroke="gray" stroke-dasharray="4 4"/>`
  o += `<text x="132" y="16" fill="gray">x=${xmin}</text>`;
  o += `<text x="388" y="16" fill="gray">x=${xmax}</text>`;
  o += `<text x="0" y="16" fill="tomato">red=truth</text>`;
  o += `<text x="0" y="32" fill="black">black=approx</text>`;
  
  let yax = 512-(0-ym)/(yM-ym)*512;
  o += `<path d="M 0 ${yax} 512 ${yax}" fill="none" stroke="gray"/>`
  
  for (let i = 0; i < 512-32; i+=32){
    let y = i/512*(yM-ym)+ym;
    o += `<text x="2" y=${512-i+5} fill="gray">${y.toPrecision(3)}</text>`;
  }
  o += `<path d="M`
  for (let i = 0; i < n; i++){
    let x = i;
    let y = 512-(y0s[i]-ym)/(yM-ym)*512;
    o += `${x} ${y} `;
  }
  o += `" fill="none" stroke-width="2" stroke="tomato"/>`
  
  o += `<path d="M`
  for (let i = 0; i < n; i++){
    let x = i;
    let y = 512-(y1s[i]-ym)/(yM-ym)*512;
    o += `${x} ${y} `;
  }
  o += `" fill="none" stroke="black"/>`
  
  o += `<svg>`;
  return o;
  
}


G('btn_solve').onclick=function(){
  if (!remez_approx){
    alert("library has not loaded, try again in a moment");
    return;
  }
  
  let s = remez_approx(
    G('inp_func').value,
    Number(G('inp_ordr').value),
    Number(G('inp_xmin').value),
    Number(G('inp_xmax').value),
  );
  
  let coef = s.trim().slice(1,-1).split(',').map(x=>Number(x));
  let fstr = make_poly(coef);
  
  G('out_coef').innerHTML = s;
  G('out_func').innerHTML = 'y='+fstr;
  
  let fun0 = eval(G('inp_func').value);
  let fun1 = new Function('x','return '+fstr);

  G('out_plot').innerHTML = make_plot(
    fun0,fun1,
    Number(G('inp_xmin').value),
    Number(G('inp_xmax').value),
  );
}
