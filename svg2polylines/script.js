var inppth = document.getElementById("inppth");
var inpnum = document.getElementById("inpnum");
var inpphs = document.getElementById("inpphs");
var inpbox = document.getElementById("inpbox");
var inpmov = document.getElementById("inpmov");
var inpsmp = document.getElementById("inpsmp");
var inprnd = document.getElementById("inprnd");
var inpfmt = document.getElementById("fmt");

var ctx = document.getElementById("canv").getContext('2d');

function fetchText(url){
  var request = new XMLHttpRequest();
  request.open('GET', url, false);  // `false` makes the request synchronous
  request.send(null);
  return request.responseText;
}

function doit(){
  var txt = inppth.value;
  var num = Math.max(2,parseInt(inpnum.value));
  var box = inpbox.value.split(",").map(parseFloat);
  var mov = inpmov.value.split(",").map(parseFloat);
  
  var div = document.createElement("div");
  if (txt.startsWith("<svg")){
    div.innerHTML = txt;
  }else if (txt.startsWith("data:image")){
    console.log(txt.split(",PHN2Zy"));
    div.innerHTML = atob("PHN2Zy"+txt.split(",PHN2Zy").slice(1).join(",PHN2Zy"));
  }else if (txt.startsWith("http") || txt.startsWith("www") || txt.includes(".svg")){
    div.innerHTML = fetchText(txt);
    // console.log(div.innerHTML)
  }else if (txt.startsWith("<path")){
    div.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg">${txt}</svg>`
  }else{
    div.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="${txt}"/></svg>`
  }
  
  var svg = div.children[0];
  
  var pths = [];

  function getpaths(svg){
    for (var i = 0; i < svg.children.length; i++){
      try{
        // console.log(svg.children[i],svg.children[i].getTotalLength,svg.children[i].getPointAtLength)
        svg.children[i].getTotalLength();
        svg.children[i].getPointAtLength(0);
        // if (svg.children[i].getTotalLength){
          pths.push(svg.children[i]);
        // }
      }catch(e){
        if (svg.children[i].children){
          for (var j = 0; j < svg.children[i].children.length; j++){
            getpaths(svg.children[i].children[j]);

          }
        }
      }
    }
  }
  getpaths(svg);

  var plines = [];
  var xmin = Infinity;
  var xmax = -Infinity;
  var ymin = Infinity;
  var ymax = -Infinity;
  
  for (var k = 0; k < pths.length; k++){  
    var pth = pths[k];

    var tot = pth.getTotalLength();
    var step = tot/(num-1);

    let pline = [];

    let phs = parseFloat(inpphs.value);
    phs = phs % 1;
    function doitat(t){
      var p = pth.getPointAtLength(t);
      var x = p.x;
      var y = p.y;
      xmin = Math.min(x,xmin);
      xmax = Math.max(x,xmax);
      ymin = Math.min(y,ymin);
      ymax = Math.max(y,ymax);
      pline.push([x,y]);
    }
    if (phs != 0){
      doitat(0);
    }
    for (var i = 0; i < num; i++){
      var p = pth.getPointAtLength(step*(i+phs));
      var x = p.x;
      var y = p.y;
      xmin = Math.min(x,xmin);
      xmax = Math.max(x,xmax);
      ymin = Math.min(y,ymin);
      ymax = Math.max(y,ymax);
      
      if (pline.length>=2){
        console.log(pline,i)
        var d1 = Math.hypot(pline[pline.length-1][0]-x,pline[pline.length-1][1]-y);
        // var d2 = Math.hypot(pline[i-2][0]-pline[i-1][0],pline[i-2][1]-pline[i-1][1]);
        if (Math.abs(d1-step)>step && Math.abs(d1-step)>1){
          plines.push(pline)
          pline = [];
        }
      }
      
      pline.push([x,y]);
    }
    plines.push(pline);
    
    if (phs != 0){
      doitat(tot);
    }
  }

  // console.log(plines);
  
  var w = xmax - xmin;
  var h = ymax - ymin;
  
  
  
  var tw = box[2]-box[0];
  var th = box[3]-box[1];
  
  var sw = tw/w;
  var sh = th/h;
  
  var s = Math.min(sw,sh);
  
  
  var px = (tw - (w * s))/2;
  var py = (th - (h * s))/2;
  
  for (var k = 0; k < plines.length; k++){
    let pline = plines[k];
    for (var i = 0; i < pline.length; i++){
      var [x,y] = pline[i];

      x = box[0] + (x - xmin)*s + px + mov[0];
      y = box[1] + (y - ymin)*s + py + mov[1];

      pline[i] = [x,y];
    }
  }
  if (inpsmp.value.length && inpsmp.value!="0"){
    for (var k = 0; k < plines.length; k++){
        plines[k] = approxPolyDP(plines[k],parseFloat(inpsmp.value));
    }
  }
  
  if (inprnd.value.length){
    var r = Math.pow(10,parseFloat(inprnd.value));
    
    for (var k = 0; k < plines.length; k++){
        for (var i = 0; i < plines[k].length; i++){
          plines[k][i][0] = ~~(plines[k][i][0]*r)/r;
          plines[k][i][1] = ~~(plines[k][i][1]*r)/r;
        }
    }
  }
  document.getElementById("nsc").innerHTML = plines.map(x=>x.length).join(", ")

  var out = "";
  if (plines.length == 1){
    out = JSON.stringify(plines[0]);
  }else{
    out = JSON.stringify(plines);
  }
  if (inpfmt.value == "curl"){
    out = out.replace(/\[/g,'{').replace(/\]/g,'}');
  }
  document.getElementById("out").innerHTML = out;
  
  ctx.save();
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  
  ctx.fillStyle="rgba(0,0,0,0.5)"
  ctx.fillRect(0,ctx.canvas.height/2,ctx.canvas.width,1);
  ctx.fillRect(ctx.canvas.width/2,0,1,ctx.canvas.height);
  
  ctx.translate(ctx.canvas.width/2,ctx.canvas.height/2);
  
  for (var i = ~~(-ctx.canvas.width/2); i <= ~~(ctx.canvas.width/2); i+=50){
    ctx.fillText(i,0,i);
    ctx.fillText(i,i,0);
  }
  
  for (var k = 0; k < plines.length; k++){
    let pline = plines[k];
    ctx.fillStyle="rgba(0,0,0,0.1)"
    ctx.beginPath();

    for (var i = 0; i < pline.length; i++){
      ctx[i?'lineTo':'moveTo'](...pline[i]);
    }
    ctx.stroke();
    ctx.fill();
  }
  ctx.restore();
}
doit();



inppth.onchange   = inpnum.onchange   = inpphs.onchange   = inpbox.onchange   = inpmov.onchange   = inpsmp.onchange   = inprnd.onchange  = inpfmt.onchange   = doit
inppth.onkeypress = inpnum.onkeypress = inpphs.onkeypress = inpbox.onkeypress = inpmov.onkeypress = inpsmp.onkeypress = inprnd.onkeypress= inpfmt.onkeypress = doit
inppth.onpaste    = inpnum.onpaste    = inpphs.onpaste    = inpbox.onpaste    = inpmov.onpaste    = inpsmp.onpaste    = inprnd.onpaste   = inpfmt.onpaste    = doit
inppth.onkeyup    = inpnum.onkeyup    = inpphs.onkeyup    = inpbox.onkeyup    = inpmov.onkeyup    = inpsmp.onkeyup    = inprnd.onkeyup   = inpfmt.onkeyup    = doit



function pointDistanceToSegment(p, p0, p1) {
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
  return Math.sqrt(dx*dx+dy*dy);
}

function approxPolyDP(polyline, epsilon){
  // https://en.wikipedia.org/wiki/Ramer–Douglas–Peucker_algorithm
  // David Douglas & Thomas Peucker, 
  // "Algorithms for the reduction of the number of points required to 
  // represent a digitized line or its caricature", 
  // The Canadian Cartographer 10(2), 112–122 (1973)

  if (polyline.length <= 2){
    return polyline;
  }
  let dmax   = 0;
  let argmax = -1;
  for (let i = 1; i < polyline.length-1; i++){
    let d = pointDistanceToSegment(polyline[i], 
                                   polyline[0], 
                                   polyline[polyline.length-1]);
    if (d > dmax){
      dmax = d;
      argmax = i;
    }  
  }
  // console.log(dmax)
  let ret = [];
  if (dmax > epsilon){
    let L = approxPolyDP(polyline.slice(0,argmax+1),epsilon);
    let R = approxPolyDP(polyline.slice(argmax,polyline.length),epsilon);
    ret = ret.concat(L.slice(0,L.length-1)).concat(R);
  }else{
    ret.push(polyline[0].slice());
    ret.push(polyline[polyline.length-1].slice());
  }
  return ret;
}