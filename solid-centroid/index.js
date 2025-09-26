var ctx = document.getElementById("canv").getContext('2d');
ctx.canvas.width = 512;
ctx.canvas.height = 512;
var polygon = [];


var proposed = [];
var mouseIsDown = false;
var ctrd = [ctx.canvas.width/2,ctx.canvas.height/2];
var pctrd = ctrd;
var cctrd = ctrd;
var fctrd = ctrd;
var ictrd = ctrd;

var visHelpers = {};

// polygon = [[349,91],[216,91],[185,93],[154,101],[133,109],[120,120],[112,130],[107,140],[103,152],[102,168],[102,261],[113,318],[123,357],[142,408],[158,440],[178,466],[190,477],[202,484],[214,488],[240,490],[312,490],[335,483],[337,481],[337,475],[331,471],[317,457],[309,452],[260,412],[213,378],[188,353],[169,330],[162,319],[157,307],[154,293],[154,263],[155,257],[161,244],[175,227],[188,216],[203,208],[229,198],[255,192],[326,192],[398,210],[419,214],[435,214],[467,193],[468,191],[470,191],[477,184],[485,170],[489,159]];
// polygon = [[276,103],[230,103],[213,107],[177,123],[160,133],[131,158],[118,172],[102,201],[93,225],[90,252],[90,286],[93,305],[99,319],[108,333],[121,347],[153,377],[206,414],[230,425],[259,434],[296,438],[337,437],[380,428],[380,424],[377,419],[364,407],[350,397],[311,377],[258,358],[232,344],[216,331],[192,304],[177,283],[173,275],[174,255],[180,248],[190,240],[225,227],[272,218],[380,218],[429,224],[460,224],[464,220],[474,215]]
polygon = [[284,50],[246,51],[213,61],[150,90],[106,119],[70,151],[44,185],[30,219],[26,246],[26,280],[34,299],[54,321],[79,340],[94,349],[111,358],[146,372],[186,384],[258,398],[273,403],[280,407],[284,411],[287,418],[298,427],[305,429],[340,429],[347,427],[358,422],[369,414],[376,404],[383,390],[387,376],[390,350],[390,321],[382,308],[369,302],[191,301],[163,295],[147,288],[134,277],[124,264],[119,252],[119,248],[123,244],[157,223],[208,202],[226,198],[260,194],[358,194],[393,199],[427,199],[433,190],[435,180],[437,177],[433,170]]
computeCentroids();

function showBadRed(){
  polygon = [[284,189],[285,285],[289,305],[295,323],[304,335],[312,336],[316,329],[324,306],[355,186],[358,179],[361,161],[361,150],[347,141],[310,123],[282,117],[249,117],[243,120],[229,123],[202,132],[187,139],[172,149],[158,165],[152,174],[134,214],[122,248],[116,277],[114,298],[114,364],[120,381],[126,392],[161,431],[172,439],[197,462],[235,487],[260,497],[282,502],[332,507],[377,507],[388,505],[428,492],[463,471],[483,462],[500,452],[504,443],[505,422],[502,418],[493,414],[440,414],[419,419],[392,423],[374,428],[357,430],[321,430],[280,418],[261,409],[246,399],[224,377],[213,360],[212,356],[201,338],[194,314],[191,285],[191,258],[195,247],[210,217],[213,214]]
  computeCentroids();
}

ctx.canvas.onmousedown = function(e){
  var p = [e.offsetX,e.offsetY];
  mouseIsDown = true;
  polygon = [p];
  proposed = [p];
}

function computeCentroids(){
  ctrd = centroid(polygon);
  pctrd = projectedCentroid(polygon,ctrd);
  cctrd = chopperCentroid(polygon,ctrd);
  ictrd = inwardCentroid(polygon,ctrd);
  fctrd = fattyCentroid(polygon,ctrd);
}
ctx.canvas.onmousemove = function(e){
  var p = [e.offsetX,e.offsetY];
  if (mouseIsDown){
    proposed.push(p);
    polygon = unSelfIntersect(approxPolyDP(proposed,1));
  }
  if (polygon.length){
    computeCentroids();
  }
}
ctx.canvas.onmouseup = function(){
  mouseIsDown = false;
  proposed = [];
  polygon = approxPolyDP(polygon,1);
  if (polygon.length){
    computeCentroids();
  }
}
function loop(){
  requestAnimationFrame(loop);
  
  ctx.fillStyle="white";
  ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height)
  
  ctx.beginPath();
  for (var i = 0; i < proposed.length; i++){
     ctx[i?'lineTo':'moveTo'](...proposed[i]);
  }
  ctx.closePath();
  ctx.strokeStyle="gray";
  ctx.stroke();
  
  ctx.beginPath();
  for (var i = 0; i < polygon.length; i++){
     ctx[i?'lineTo':'moveTo'](...polygon[i]);
  }
  ctx.closePath();
  ctx.lineWidth=2;
  ctx.strokeStyle="black";
  ctx.stroke();
  ctx.lineWidth=1;
  
  ctx.fillStyle="dimgray";
  ctx.beginPath();
  ctx.ellipse(...ctrd,6,6,0,0,Math.PI*2);
  ctx.fill();
  
  if (pctrd != ctrd){
    ctx.fillStyle="red";
    ctx.beginPath();
    ctx.ellipse(...pctrd,6,6,0,0,Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle="red";
    ctx.beginPath();
    ctx.ellipse(...visHelpers.projected.p0,3,3,0,0,Math.PI*2);
    ctx.fill();
    
    if (window.visHelpers){
      ctx.beginPath();
      ctx.moveTo(...ctrd);
      ctx.lineTo(...visHelpers.projected.p1);
      ctx.strokeStyle="red";
      ctx.setLineDash([4,4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle="red";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "16px Arial";
      ctx.fillText("=",(visHelpers.projected.p0[0]+pctrd[0])/2,(visHelpers.projected.p0[1]+pctrd[1])/2);
      ctx.fillText("=",(visHelpers.projected.p1[0]+pctrd[0])/2,(visHelpers.projected.p1[1]+pctrd[1])/2);
    }
    
  }
  
  
   
  if (cctrd != ctrd){
    if (window.visHelpers){
      ctx.beginPath();
      var pp = visHelpers.chopper.p;
      ctx.beginPath();
      for (var i = 0; i < pp.length; i++){
         ctx[i?'lineTo':'moveTo'](...pp[i]);
      }
      ctx.closePath();
      ctx.fillStyle="rgba(0,255,0,0.2)"
      ctx.fill();
    }
    
    ctx.fillStyle="green";
    ctx.beginPath();
    ctx.ellipse(...cctrd,6,6,0,0,Math.PI*2);
    ctx.fill();
    
    if (window.visHelpers){
      ctx.beginPath();
      ctx.moveTo(...ctrd);
      ctx.lineTo(...cctrd);
      ctx.strokeStyle="green";
      ctx.setLineDash([4,4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle="green";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "16px Arial";
      var rat = Math.round(visHelpers.chopper.rat*10000)/100;
      var c0 = centroid(visHelpers.chopper.p);
      
      var oldVisHelpers = visHelpers;
      visHelpers = undefined;
      
      var cc = fattyCentroid(oldVisHelpers.chopper.p,c0);
      if (cc == c0){
        cc = inwardCentroid(oldVisHelpers.chopper.p,c0);
      }
      
      ctx.fillText(rat+"%",...cc);
      visHelpers = oldVisHelpers;
    }
    
  }
  
  if (fctrd != ctrd){
    ctx.fillStyle="darkorange";
    ctx.beginPath();
    ctx.ellipse(...fctrd,6,6,0,0,Math.PI*2);
    ctx.fill();
    
    if (window.visHelpers){
      ctx.setLineDash([4,4]);
      ctx.beginPath();
      ctx.moveTo(...ctrd);
      ctx.lineTo(...fctrd);
      ctx.strokeStyle="darkorange";
      
      ctx.stroke();
      
      ctx.beginPath();
      ctx.ellipse(...fctrd,visHelpers.fatty.r,visHelpers.fatty.r,0,0,Math.PI*2);
      ctx.strokeStyle="darkorange";
      
      ctx.stroke();
      ctx.setLineDash([]);


    }
    
  }
  
  if (ictrd != ctrd){
    ctx.fillStyle="blue";
    ctx.beginPath();
    ctx.ellipse(...ictrd,6,6,0,0,Math.PI*2);
    ctx.fill();
    
    if (window.visHelpers){
      ctx.beginPath();
      ctx.moveTo(...visHelpers.inward.p0);
      ctx.lineTo(...visHelpers.inward.p1);
      ctx.strokeStyle="blue";
      ctx.setLineDash([4,4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle="blue";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "16px Arial";
      ctx.fillText("=",(visHelpers.inward.p0[0]+ictrd[0])/2,(visHelpers.inward.p0[1]+ictrd[1])/2);
      ctx.fillText("=",(visHelpers.inward.p1[0]+ictrd[0])/2,(visHelpers.inward.p1[1]+ictrd[1])/2);
    }
  }
  
}
loop();


function lineIntersect(p0x, p0y, p1x, p1y, q0x, q0y, q1x, q1y){
  let d0x = ((p1x) - (p0x));
  let d0y = ((p1y) - (p0y));
  let d1x = ((q1x) - (q0x));
  let d1y = ((q1y) - (q0y));
  let vc = 0.0;
  vc = ((((d0x) * (d1y))) - (((d0y) * (d1x))));
  if ((vc) == (0)) {
    return null;
  }
  let vcn = ((vc) * (vc));
  let t = ((((((((((q0x) - (p0x))) * (d1y))) * (vc))) - (((((((q0y) - (p0y))) * (d1x))) * (vc))))) / (vcn));
  let s = ((((((((((q0x) - (p0x))) * (d0y))) * (vc))) - (((((((q0y) - (p0y))) * (d0x))) * (vc))))) / (vcn));
  
  return [t,s];
}

function segmentIntersect(p0x, p0y, p1x, p1y, q0x, q0y, q1x, q1y) {

  var ts = lineIntersect(p0x, p0y, p1x, p1y, q0x, q0y, q1x, q1y);
  if (!ts){
    return null;
  }
  let d0x = ((p1x) - (p0x));
  let d0y = ((p1y) - (p0y));
  var [t,s] = ts;
  if (0 <= t && t < 1 && 0 <= s && s < 1){
    return [(((p0x) + (((d0x) * (t))))), (((p0y) + (((d0y) * (t)))))];
  }
  return null;
}



function isSelfIntersecting(poly){
  let n = poly.length;
  for (var i = 0; i < n-1; i++){
    for (var j = i+2; j < n-1; j++){
      if (segmentIntersect(...poly[i],...poly[(i+1)%n],...poly[j],...poly[(j+1)%n])){
        return true;
      }
    }
  }
  return false;
}
function unSelfIntersect(poly){
  let n = poly.length;
  var np = [];
  var i = 0;
  while (i < n){
    np.push(poly[i])
    var j;
    for (j = n-1; j >= i+1; j--){
      if (segmentIntersect(...poly[i],...poly[(i+1)%n],...poly[j],...poly[(j+1)%n])){
        // console.log(i,j);
        break;
      }
    }
    // console.log(i,j,n);
    i = j+1;
  }
  return np;
}

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


/**
 * Simplify contour using Douglas Peucker algorithm.
 * <p>   
 * Implements David Douglas and Thomas Peucker, 
 * "Algorithms for the reduction of the number of points required to 
 * represent a digitized line or its caricature", 
 * The Canadian Cartographer 10(2), 112–122 (1973)
 * @param  polyline  The vertices
 * @param  epsilon   Maximum allowed error
 * @return           A simplified copy
 * @see              approxPolySimple
 */
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

function centroid(poly){
  var cx = 0;
  var cy = 0;
  var n = poly.length;
  var a = 0;
  for (var i = 0; i < n; i++){
    var j = (i+1)%n;
    var c = (poly[i][0]*poly[j][1]-poly[j][0]*poly[i][1]);
    cx += (poly[i][0]+poly[j][0])*c;
    cy += (poly[i][1]+poly[j][1])*c;
    a += c;
  }
  cx /= 3*a;
  cy /= 3*a;
  return [cx,cy];
  
}

function polygonArea(poly){
  var a = 0;
  var n = poly.length;
  for (var i = 0; i < n; i++){
    var j = (i+1)%n;
    var c = (poly[i][0]*poly[j][1]-poly[j][0]*poly[i][1]);
    a += c;
  }
  return a/2;
}


function rayIntersectPolygon(x0,y0,x1,y1,poly){
  var n = poly.length;
  var pts = [];
  for (var i = 0; i < n; i++){
    var ts = lineIntersect(x0,y0,x1,y1,poly[i][0],poly[i][1],poly[(i+1)%n][0],poly[(i+1)%n][1]);
    if (ts){
      var [t,s] = ts;
      if (t >= 0 && 0 <= s && s < 1){
        pts.push([t,i]);
      }
    }
  }
  pts.sort((a,b)=>(a[0]-b[0]));
  return pts;//pts.map(x=>([x0+(x1-x0)*t,y0+(y1-y0)*t]));
}

function projectedCentroid(poly,ctrd){
  if (rayIntersectPolygon(...ctrd,ctrd[0]+0.321,ctrd[1]+0.123,poly).length % 2 == 1){
    return ctrd;
  }
  
  var m = 64;
  var mina = 0;
  var mint = Infinity;
  var miniss = [];
  
  for (var i = 0; i < m; i++){
    var a = (i/m)*Math.PI*2;
    
    var dx = Math.cos(a);
    var dy = Math.sin(a);
    
    var [x0,y0] = ctrd;
    var [x1,y1] = [x0+dx,y0+dy];
    
    var iss = rayIntersectPolygon(x0,y0,x1,y1,poly).map(x=>x[0]);
    
    if (!iss.length){
      continue;
    }
    
    if (iss[0] < mint){
      mina = a;
      mint = iss[0];
      miniss = iss;
    }
  }
  
  mint = (miniss[0]+miniss[1])/2;
  
  if (window.visHelpers){
    window.visHelpers.projected = {
      p0:[ctrd[0]+Math.cos(mina)*miniss[0],ctrd[1]+Math.sin(mina)*miniss[0]],
      p1:[ctrd[0]+Math.cos(mina)*miniss[1],ctrd[1]+Math.sin(mina)*miniss[1]]
    }
  }
  
  return [ctrd[0]+Math.cos(mina)*mint,ctrd[1]+Math.sin(mina)*mint]

}

function chopperCentroid(poly,ctrd){
  
  if (rayIntersectPolygon(...ctrd,ctrd[0]+0.321,ctrd[1]+0.123,poly).length % 2 == 1){
    return ctrd;
  }
  
  var m = 128;
  var mina = 0;
  var minrat = Infinity;
  var mra;
  
  var miniss = [];
  var aaa = polygonArea(poly);
  var mp = [];
  
  
  for (var i = 0; i < m; i++){
    var a = (i/m)*Math.PI*2;
    
    var dx = Math.cos(a);
    var dy = Math.sin(a);
    
    var [x0,y0] = ctrd;
    var [x1,y1] = [x0+dx,y0+dy];
    
    var iss = rayIntersectPolygon(x0,y0,x1,y1,poly)
    
    if (!iss.length){
      continue;
    }
    
    var i0 = Math.min(iss[0][1],iss[1][1]);
    var i1 = Math.max(iss[0][1],iss[1][1]);
    
    var pa; //= poly.slice(i0,i1);
    
    if (iss[0][1] < iss[1][1]){
      pa = poly.slice(i0,i1);
      pa.unshift([x0+iss[0][0]*dx,y0+iss[0][0]*dy]);
      pa.push([x0+iss[1][0]*dx,y0+iss[1][0]*dy]);
    }else{
      pa = poly.slice(i0,i1+1);
      pa.push([x0+iss[0][0]*dx,y0+iss[0][0]*dy]);
      pa.unshift([x0+iss[1][0]*dx,y0+iss[1][0]*dy]);
    }
    
    var apa = polygonArea(pa);
    
    var ra = apa/aaa;
    var rat = Math.abs(ra-0.5);
    
    if (rat < minrat){
      mina = a;
      minrat = rat;
      miniss = iss.map(x=>x[0]);
      mp = pa;
      mra = ra;
    }
  }
  
  if (window.visHelpers){
    window.visHelpers.chopper = {
      p:mp,rat:mra
    }
  }
  
  var mint = (miniss[0]+miniss[1])/2
  return [ctrd[0]+Math.cos(mina)*mint,ctrd[1]+Math.sin(mina)*mint]
}


function inwardCentroid(poly,ctrd){
  if (rayIntersectPolygon(...ctrd,ctrd[0]+0.321,ctrd[1]+0.123,poly).length % 2 == 0){
    return ctrd;
  }
  
  var m = 64;
  var mina = 0;
  var mint = Infinity;
  var miniss = [];
  var [x0,y0] = ctrd;
  
  for (var i = 0; i < m; i++){
    var a = (i/m)*Math.PI*2;
    
    var dx = Math.cos(a);
    var dy = Math.sin(a);
    
    
    var [x1,y1] = [x0+dx,y0+dy];
    
    var iss = rayIntersectPolygon(x0,y0,x1,y1,poly).map(x=>x[0]);
    
    if (!iss.length){
      continue;
    }
    
    if (iss[0] < mint){
      mina = a;
      mint = iss[0];
      miniss = iss;
    }
  }
  var [x1,y1] = [x0-Math.cos(mina),y0-Math.sin(mina)];
  var t2 = rayIntersectPolygon(x0,y0,x1,y1,poly)[0][0];
  var t1 = mint;
  mint = (mint-t2)/2
  
  if (window.visHelpers){
    window.visHelpers.inward = {
      p0:[ctrd[0]+Math.cos(mina)*t1,ctrd[1]+Math.sin(mina)*t1],
      p1:[ctrd[0]-Math.cos(mina)*t2,ctrd[1]-Math.sin(mina)*t2]
    }
  }
  
  
  return [ctrd[0]+Math.cos(mina)*mint,ctrd[1]+Math.sin(mina)*mint];
}


function fattyCentroid(poly,ctrd){
  if (rayIntersectPolygon(...ctrd,ctrd[0]+0.321,ctrd[1]+0.123,poly).length % 2 == 1){
    return ctrd;
  }
  
  var m = 64;
  var cs = [];
  
  for (var i = 0; i < m; i++){
    var a = (i/m)*Math.PI*2;
    
    var dx = Math.cos(a);
    var dy = Math.sin(a);
    
    var [x0,y0] = ctrd;
    var [x1,y1] = [x0+dx,y0+dy];
    
    var iss = rayIntersectPolygon(x0,y0,x1,y1,poly).map(x=>[x0+dx*x[0],y0+dy*x[0]]);
    
    if (!iss.length){
      continue;
    }
    
    for (var j = 0; j < iss.length; j+=2){
      cs.push([(iss[j][0]+iss[j+1][0])/2,(iss[j][1]+iss[j+1][1])/2]);
    }
  }
  if (!cs.length){
    return ctrd;
  }
  
  var mr = 0;
  var mp;
  for (var i = 0; i < cs.length; i++){
    let r = Infinity;
    for (var j = 0; j < poly.length; j++){
      var rj = pointDistanceToSegment(cs[i],poly[j],poly[(j+1)%poly.length]);
      r = Math.min(r,rj);
    }
    if (r > mr){
      mr = r;
      mp = cs[i];
    }
  }
  if (window.visHelpers){
    window.visHelpers.fatty = {
      r:mr
    }
  }
  return mp;

}


//interesting cases
// [[284,189],[285,285],[289,305],[295,323],[304,335],[312,336],[316,329],[324,306],[355,186],[358,179],[361,161],[361,150],[347,141],[310,123],[282,117],[249,117],[243,120],[229,123],[202,132],[187,139],[172,149],[158,165],[152,174],[134,214],[122,248],[116,277],[114,298],[114,364],[120,381],[126,392],[161,431],[172,439],[197,462],[235,487],[260,497],[282,502],[332,507],[377,507],[388,505],[428,492],[463,471],[483,462],[500,452],[504,443],[505,422],[502,418],[493,414],[440,414],[419,419],[392,423],[374,428],[357,430],[321,430],[280,418],[261,409],[246,399],[224,377],[213,360],[212,356],[201,338],[194,314],[191,285],[191,258],[195,247],[210,217],[213,214]]
//[[234,408],[150,408],[136,402],[122,392],[113,376],[104,350],[101,323],[101,266],[106,240],[119,208],[137,177],[148,163],[161,148],[188,125],[217,107],[248,93],[263,87],[312,74],[342,70],[459,69],[479,74],[497,82],[512,92],[526,104],[536,117],[548,141],[560,179],[568,213],[573,269],[573,327],[563,368],[555,389],[548,401],[539,406],[536,406],[532,401],[525,383],[514,332],[492,223],[488,184],[481,149],[475,133],[467,122],[461,118],[452,117],[448,115],[419,112],[364,101],[355,101],[341,98],[286,98],[270,101],[230,129]]
// [[264,79],[247,82],[218,98],[178,131],[158,152],[123,205],[112,228],[98,276],[92,325],[92,404],[94,416],[111,442],[121,453],[146,470],[160,477],[195,490],[214,495],[260,500],[333,500],[363,492],[391,479],[405,471],[408,468],[408,463],[402,460],[379,456],[324,450],[291,444],[249,432],[212,418],[178,400],[155,384],[141,371],[135,364],[127,350],[126,328],[143,298],[164,270],[180,254],[194,243],[216,230],[266,206],[294,197],[352,182],[415,158],[431,151],[438,146],[446,136],[446,122],[450,107],[450,99],[446,94],[446,89]]
// [[349,91],[216,91],[185,93],[154,101],[133,109],[120,120],[112,130],[107,140],[103,152],[102,168],[102,261],[113,318],[123,357],[142,408],[158,440],[178,466],[190,477],[202,484],[214,488],[240,490],[312,490],[335,483],[337,481],[337,475],[331,471],[317,457],[309,452],[260,412],[213,378],[188,353],[169,330],[162,319],[157,307],[154,293],[154,263],[155,257],[161,244],[175,227],[188,216],[203,208],[229,198],[255,192],[326,192],[398,210],[419,214],[435,214],[467,193],[468,191],[470,191],[477,184],[485,170],[489,159]]
// [[152,69],[143,71],[134,78],[121,91],[108,107],[97,124],[89,141],[83,160],[75,207],[73,244],[73,300],[76,328],[88,368],[95,386],[112,414],[124,425],[141,436],[171,448],[210,455],[229,453],[241,449],[277,426],[288,415],[290,411],[289,407],[244,378],[219,359],[182,327],[168,312],[158,297],[156,292],[156,283],[169,269],[194,254],[212,251],[223,251],[236,255],[272,278],[285,285],[290,286],[294,280],[311,236],[317,216],[317,208],[315,205],[304,198],[293,196],[233,196],[214,210],[166,235],[160,234],[155,226],[156,211],[162,200],[178,183],[214,158],[255,133],[273,124],[303,115],[339,108],[347,105],[365,105],[373,107],[372,103],[362,94],[347,89],[282,90],[264,94],[225,108],[200,114],[194,116],[188,121],[179,135],[167,163],[148,194],[140,212],[127,228],[121,233],[112,249],[112,271],[119,290],[124,297],[124,320],[121,324],[115,326],[108,326],[101,320],[96,305],[96,293],[93,279],[92,263],[92,225],[98,198]]