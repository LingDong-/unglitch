/* global describe earcut FindContours */

let W = 1300;
let PAD = 10;
let THRESH_TINY = 800;
let THICK = 14;
let STEPA = 50;
let STEPB = 50;
let LAYOUT_GRID = 64;
let DILATE = 8;
let SCALE = 3.3/14  *72/25.4;

let cnv = document.createElement("canvas");
cnv.width = W;
cnv.height = W;
let ctx = cnv.getContext('2d');

function read_obj(str){
  let mesh = {vertices:[],faces:[]}

  let lines = str.split("\n");
  for (let i = 0; i < lines.length; i++){
    lines[i] = lines[i].trim();
    if (lines[i][0] == "#"){
      continue;
    }
    if (lines[i].length <= 2){
      continue;
    }
    let tok = lines[i].split(" ");
    let cmd = tok[0];
    if (cmd == "v"){
      let v = [
        parseFloat(tok[1]),
        parseFloat(tok[2]),
        parseFloat(tok[3])
      ];
      mesh.vertices.push(v);
    }else if (cmd == "f"){
      let a = parseInt(tok[1].split("/")[0]);
      let b = parseInt(tok[2].split("/")[0]);
      let c = parseInt(tok[3].split("/")[0]);
      let nv = mesh.vertices.length;
      mesh.faces.push([
        (a<0)?(nv+a):(a-1),
        (b<0)?(nv+b):(b-1),
        (c<0)?(nv+c):(c-1)
      ]);
    }
  }
  return mesh;
}

function mesh_bbox(mesh){
  let min = [Infinity,Infinity,Infinity];
  let max = [-Infinity,-Infinity,-Infinity];
  for (let i = 0; i < mesh.vertices.length; i++){
    min[0] = Math.min(min[0],mesh.vertices[i][0]);
    min[1] = Math.min(min[1],mesh.vertices[i][1]);
    min[2] = Math.min(min[2],mesh.vertices[i][2]);
    max[0] = Math.max(max[0],mesh.vertices[i][0]);
    max[1] = Math.max(max[1],mesh.vertices[i][1]);
    max[2] = Math.max(max[2],mesh.vertices[i][2]);
  }
  return [min,max];
}
function mesh_normalize(mesh){
  let [min,max] = mesh_bbox(mesh);
  let s = (W-PAD*2)/Math.max(max[0]-min[0],max[1]-min[1],max[2]-min[2]);
  let px = (W-PAD*2-(max[0]-min[0])*s)/2+PAD;
  let py = (W-PAD*2-(max[1]-min[1])*s)/2+PAD;
  let pz = (W-PAD*2-(max[2]-min[2])*s)/2+PAD;
  for (let i = 0; i < mesh.vertices.length; i++){
    mesh.vertices[i][0] = (mesh.vertices[i][0]-min[0])*s+px;
    mesh.vertices[i][1] = (mesh.vertices[i][1]-min[1])*s+py;
    mesh.vertices[i][2] = (mesh.vertices[i][2]-min[2])*s+pz;
  }
}

function mesh_to_trigs(mesh){
  let {faces,vertices} = mesh;
  let trigs = [];
  for (let i = 0; i < faces.length; i++){
    let p0 = vertices[faces[i][0]];
    let p1 = vertices[faces[i][1]];
    let p2 = vertices[faces[i][2]];
    trigs.push([p0,p1,p2])
  }
  return trigs;
}

function trigs_bbox(trigs){
  let min = [Infinity,Infinity,Infinity];
  let max = [-Infinity,-Infinity,-Infinity];
  let pts = trigs.flat();
  for (let i = 0; i < pts.length; i++){
    min[0] = Math.min(min[0],pts[i][0]);
    min[1] = Math.min(min[1],pts[i][1]);
    min[2] = Math.min(min[2],pts[i][2]);
    max[0] = Math.max(max[0],pts[i][0]);
    max[1] = Math.max(max[1],pts[i][1]);
    max[2] = Math.max(max[2],pts[i][2]);
  }
  return [min,max];
}

function seg_isect_z_plane(z,p0,p1){
  if (p0[2] > p1[2]){
    [p0,p1] = [p1,p0];
  }
  if (p1[2] == p0[2]){
    p1[2]+=0.00001;
  }
  let t = (z - p0[2])/(p1[2]-p0[2]);
  if (t < 0 || t >= 1){
    // return null;
  }
  return [
    p0[0] * (1-t) + p1[0] * t,
    p0[1] * (1-t) + p1[1] * t,
    z
  ]
}


function rot_trigs(trigs,th,ax){
  let sinth = Math.sin(th);
  let costh = Math.cos(th);
  let oo = [];
  for (let i = 0; i < trigs.length; i++){
    let o = [];
    for (let j = 0; j < trigs[i].length; j++){
      let [x0,y0,z0] = trigs[i][j];
      x0 -= W/2;
      y0 -= W/2;
      z0 -= W/2;
      let x=x0,y=y0,z=z0;
      if (ax == 'z'){
        x = x0*costh-y0*sinth;
        y = x0*sinth+y0*costh;
      }else if (ax == 'y'){
        x = x0*costh-z0*sinth;
        z = x0*sinth+z0*costh;
      }else if (ax == 'x'){
        y = y0*costh-z0*sinth;
        z = y0*sinth+z0*costh;
      }
      o.push([x+W/2,y+W/2,z+W/2])
    }
    oo.push(o);
  }
  return oo;
}

function rot_mesh(mesh,th,ax){
  let sinth = Math.sin(th);
  let costh = Math.cos(th);
  for (let i = 0; i < mesh.vertices.length; i++){
    let [x0,y0,z0] = mesh.vertices[i];
    let x=x0,y=y0,z=z0;
    if (ax == 'z'){
      x = x0*costh-y0*sinth;
      y = x0*sinth+y0*costh;
    }else if (ax == 'y'){
      x = x0*costh-z0*sinth;
      z = x0*sinth+z0*costh;
    }else if (ax == 'x'){
      y = y0*costh-z0*sinth;
      z = y0*sinth+z0*costh;
    }
    mesh.vertices[i] = [x,y,z];
  }
}

function clip_z(trigs,z0){
  let out = [];
  for (let i = 0; i < trigs.length; i++){
    let [a,b,c] = trigs[i];
    let xa = a[2] > z0;
    let xb = b[2] > z0;
    let xc = c[2] > z0;
    
    if (xa + xb + xc == 0){
      continue;
    }else if (xa + xb + xc == 3){
      continue;
    }
    let s = 0;
    if (xb && !xa && !xc){
      ;[a,b,c] = [c,a,b];
    }else if (xa && !xb && !xc){
      ;[a,b,c] = [b,c,a];
    }else if (!xb && xa && xc){
      ;[a,b,c] = [c,a,b];
      s = 1;
    }else if (!xa && xb && xc){
      ;[a,b,c] = [b,c,a];
      s = 1;
    }else if (!xc && xb && xa){
      s = 1;
    }
    if (!s){
      let p = seg_isect_z_plane(z0,a,c);
      let q = seg_isect_z_plane(z0,b,c);
      out.push([p,q]);
    }else{
      let p = seg_isect_z_plane(z0,a,c);
      let q = seg_isect_z_plane(z0,b,c);
      out.push([p,q]);
    }
  }
  return out;
}

function floodfill(im,x0,y0,black,white){
  let {w,h,data} = im;
  let Q = [];
  Q.push([x0,y0]);
  data[y0*im.w+x0] = white;
  let avg_x = 0;
  let avg_y = 0;
  let cnt = 0;
  while (Q.length){
    let [x,y] = Q.pop();
    avg_x += x;
    avg_y += y;
    cnt++;
    if (x > 0 && data[y*w+(x-1)]==black){
      data[y*w+(x-1)] = white;
      Q.push([x-1,y]);
    }
    if (x < w-1 && data[y*w+(x+1)]==black){
      data[y*w+(x+1)] = white;
      Q.push([x+1,y]);
    }
    if (y > 0 && data[(y-1)*w+x]==black){
      data[(y-1)*w+x] = white;
      Q.push([x,y-1]);
    }
    if (y < h-1 && data[(y+1)*w+x]==black){
      data[(y+1)*w+x] = white;
      Q.push([x,y+1]);
    }
  }
  return [avg_x/cnt,avg_y/cnt];
}

function poly_area(poly){
  var n = poly.length;
  var a = 0.0;
  for(var p=n-1,q=0; q<n; p=q++) {
    a += poly[p][0] * poly[q][1] - poly[q][0] * poly[p][1];
  }
  return a * 0.5;
}

function slice(trigs, step){
  let out = [];

  for (let z = 0; z < W; z += step){
    console.log(z,'/',W);
    let s0 = clip_z(trigs,z);

    ctx.fillRect(0,0,W,W);
    ctx.strokeStyle = "white";
    ctx.lineWidth = DILATE;
    for (let i = 0; i < s0.length; i++){
      ctx.beginPath();
      for (let j = 0; j < s0[i].length; j++){
        let [x,y] = s0[i][j];
        ctx[j?'lineTo':'moveTo'](x,y);
        
      }
      ctx.stroke();
    }
    // fs.writeFileSync("test.png",cnv.toBuffer('image/png'));
    
    let imdata = ctx.getImageData(0,0,W,W);
    
    let im = [];
    for (let i = 0; i < imdata.data.length; i+= 4){
      im.push(imdata.data[i]>0?2:1);
    }
    floodfill({data:im,w:W,h:W},0,0,1,0);
    
    for (let i = 0; i < im.length; i++){
      im[i] = im[i]?1:0;
    }

    let contours = FindContours.findContours(im,W,W);

    let o = [];
    for (let i = 0; i < contours.length; i++){
      if (contours[i].parent != undefined){
        continue;
      }
      o.push(FindContours.approxPolyDP(contours[i].points,1));
    }
    o = o.filter(x=>(x.length>=3&&Math.abs(poly_area(x))>THRESH_TINY));
    out.push({z,polys:o});
  }  
  return out;
}

function triangulate(p){
  let trigs = earcut(p.flat());
  let faces = [];
  for (let i = 0; i < trigs.length; i+=3){
    let a = trigs[i];
    let b = trigs[i+1];
    let c = trigs[i+2];
    faces.push([p[a],p[b],p[c]]);
  }
  return faces;
}
function extrude(p,d){
  let ft = triangulate(p);
  let f1 = ft.map(xys=>xys.map(xy=>[xy[0],xy[1],-d/2]).reverse());
  let f2 = ft.map(xys=>xys.map(xy=>[xy[0],xy[1],d/2]));

  let ff = [...f1,...f2]
  let vs = p;
  for (let i = 0; i < vs.length; i++){
    let j = (i+1)%vs.length;
    let a = [...vs[i],-d/2]
    let b = [...vs[j],-d/2]
    let c = [...vs[i],d/2]
    let e = [...vs[j],d/2]
    ff.push([a,e,b],[a,c,e]);
    
  }
  return ff;
}

function to_stl_bin(faces){
  let nb = 84+faces.length*50;
  console.log(`writing stl (binary)... estimated ${Math.round((nb/1048576)*100)/100} MB`);

  let o = new Uint8Array(nb);
  let a = new ArrayBuffer(4);
  let b = new Uint32Array(a);
  b[0] = faces.length;
  o.set(new Uint8Array(a),80);
  for (let i = 0; i < faces.length; i++){
    let d = [
      faces[i][0][0],faces[i][0][1],faces[i][0][2],
      faces[i][1][0],faces[i][1][1],faces[i][1][2],
      faces[i][2][0],faces[i][2][1],faces[i][2][2],
    ]
    let a = new ArrayBuffer(36);
    let b = new Float32Array(a);
    d.map((x,j)=>b[j]=x);
    o.set(new Uint8Array(a),84+i*50+12);
  }
  return o;
}

function trsl_trigs(trigs,x,y,z){
  return trigs.map(xys=>xys.map(xy=>[xy[0]+x,xy[1]+y,xy[2]+z]));
}

function vis_3d(layers){
  let tts = [];
  for (let i = 0; i < layers.length; i++){
    for (let j = 0; j < layers[i].polys.length; j++){
      let ts = extrude(layers[i].polys[j],THICK);
      ts = trsl_trigs(ts,0,0,layers[i].z);
      tts.push(...ts);
    }
  }
  return tts;
}


function draw_svg(polys,w,h){
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${w*SCALE}" height="${h*SCALE}">`
  for (let i = 0; i < polys.length; i++){
    o += `<path stroke="red" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round" d="M `;
    for (let j = 0; j < polys[i].length; j++){
      let [x,y] = polys[i][j];
      o += `${(~~((x*SCALE)*1000)) /1000} ${(~~((y*SCALE)*1000)) /1000} `;
    }
    o += `" />\n`;
  }
  o += `</svg>`
  return o;
}


function draw_diamond(x,y,r){
  ctx.beginPath();
  ctx.moveTo(x-r,y);
  ctx.lineTo(x,y-r);
  ctx.lineTo(x+r,y);
  ctx.lineTo(x,y+r);
  ctx.fill();
}

function add_slots(lay,L1,dir){
  ctx.fillStyle = "black"
  ctx.fillRect(0,0,W,W);
  ctx.fillStyle = "white";
  for (let i = 0; i < lay.polys.length; i++){
    ctx.beginPath();
    for (let j = 0; j < lay.polys[i].length; j++){
      ctx[j?'lineTo':'moveTo'](...lay.polys[i][j]);
    }
    ctx.fill();
  }

  let imdata = ctx.getImageData(0,0,W,W);  
  let im = [];
  for (let i = 0; i < imdata.data.length; i+= 4){
    im.push(imdata.data[i]>0?1:0);
  }
  
  for (let i = 0; i < L1.length; i++){
    let z = ~~L1[i].z;
    let runs = [];
    let on = 0;
    for (let j = 0; j < W; j++){
      let v = im[z*W+j];
      if (v && !on){
        on = 1;
        runs.push([j]);
      }else if (!v && on){
        on = 0;
        runs[runs.length-1].push(j);
      }
    }
    ctx.strokeStyle = "black";
    ctx.lineWidth = THICK;
    ctx.fillStyle = "black"
    ctx.lineCap = "round";
    for (let j = 0; j < runs.length; j++){
      
      if (dir > 0){
        ctx.beginPath();
        ctx.moveTo((runs[j][0]+runs[j][1])/2,z);
        ctx.lineTo(runs[j][1],z);
        ctx.stroke();

      }else{
        ctx.beginPath();
        ctx.moveTo(runs[j][0],z);
        ctx.lineTo((runs[j][0]+runs[j][1])/2,z);
        ctx.stroke();
      }
    }
  }
  imdata = ctx.getImageData(0,0,W,W);  
  let im2 = [];
  for (let i = 0; i < imdata.data.length; i+= 4){
    im2.push(imdata.data[i]>0?1:0);
  }

  let contours = FindContours.findContours(im2,W,W);

  let o = [];
  for (let i = 0; i < contours.length; i++){
    o.push(FindContours.approxPolyDP(contours[i].points,1));
  }
  o = o.filter(x=>(x.length>=3&&Math.abs(poly_area(x))>THRESH_TINY));
  // fs.writeFileSync("test.svg",draw_svg(o));
  return {z:lay.z,polys:o};
}

function slot_all(L0,L1){
  for (let i = 0; i < L0.length; i++){
    L0[i] = add_slots(L0[i],L1,-1);
  }
  for (let i = 0; i < L1.length; i++){
    L1[i] = add_slots(L1[i],L0,1);
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

function layout_piece(poly,bitmap){

  let bb = get_bbox(poly);
  let ww = Math.ceil(bb.w / LAYOUT_GRID);
  let hh = Math.ceil(bb.h / LAYOUT_GRID);
  let bw = bitmap.w;
  let bh = bitmap.h;
  let qi = -1;
  let qj = -1;
  for (let i = 0; i < bh-hh; i++){
    let ok = 0;
    for (let j = 0; j < bw-ww; j++){
      ok = 1;
      for (let ii = 0; ii < hh; ii++){
        for (let jj = 0; jj < ww; jj++){
          let I = i+ii;
          let J = j+jj;
          if (bitmap.data[J+','+I]){
            ok = 0;
            break;
          }
        }
        if (!ok) break;
      }
      if (ok){
        qi = i;
        qj = j;
        break;
      }
    }
    if (ok) break;
  }
  // console.log(poly,ww,hh,bitmap,qi,qj);
  // process.exit();
  if (qi == -1){
    if (bh > bw){
      bitmap.w += ww;
    }else{
      bitmap.h += hh;
    }
    return layout_piece(poly,bitmap);
  }
  for (let i = 0; i < hh; i++){
    for (let j = 0; j < ww; j++){
      let I = i+qi;
      let J = j+qj;
      bitmap.data[J+','+I]=1;
    }
  }
  let o = [];

  for (let i = 0; i < poly.length; i++){
    let [x,y] = poly[i];
    o.push([(x-bb.x)+qj*LAYOUT_GRID,(y-bb.y)+qi*LAYOUT_GRID]);
  }
  return o;
}

function layout_all(L0,L1){
  let bitmap = {data:[],w:W/LAYOUT_GRID*2,h:W/LAYOUT_GRID*2};
  let out = [];
  function do_layers(L){
    for (let i = 0; i < L.length; i++){
      let {z,polys} = L[i];
      for (let j = 0; j < polys.length; j++){
        out.push(layout_piece(polys[j],bitmap));
      }
    }
  }
  do_layers(L0);
  do_layers(L1);
  return out;
}

function disturb_mesh(mesh){
  for (let i = 0; i < mesh.vertices.length; i++){
    mesh.vertices[i][0] += (Math.random()-0.5)*0.001
    mesh.vertices[i][1] += (Math.random()-0.5)*0.001
    mesh.vertices[i][2] += (Math.random()-0.5)*0.001
  }
}




