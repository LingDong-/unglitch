function trace(M){
  let Q = [];
  for (let i = 1; i < M.length-1; i++){
    for (let j = 1; j < M[i].length-1; j++){
      let did = 0;
      let blocked = [
        0,0,
        0,0
      ];
      function add_seg(x0,y0,x1,y1){
        did ++;
        Q.push([
          [j*2+x0+1,i*2+y0+1],
          [j*2+x1+1,i*2+y1+1]
        ]);
      }
      if (M[i][j]){
        if (M[i-1][j  ]){blocked[0]=blocked[1]=1;add_seg(0,0,0,-1)}
        if (M[i+1][j  ]){blocked[2]=blocked[3]=1;add_seg(0,0,0,1) }
        if (M[i  ][j-1]){blocked[0]=blocked[2]=1;add_seg(0,0,-1,0)}
        if (M[i  ][j+1]){blocked[1]=blocked[3]=1;add_seg(0,0,1,0) }
        
        // if (!did){
          if (!blocked[0] && M[i-1][j-1]) add_seg(0,0,-1,-1);
          if (!blocked[1] && M[i-1][j+1]) add_seg(0,0,1,-1);
          if (!blocked[2] && M[i+1][j-1]) add_seg(0,0,-1,1);
          if (!blocked[3] && M[i+1][j+1]) add_seg(0,0,1,1);
        // }
        if (!did){
          add_seg(-1,-1,1,1);
          add_seg(-1,1,1,-1);
        }
      }
    }
  }
  return merge_segs(Q);
}


function merge_segs(Q){

  function eq(a,b){
    return a[0] == b[0] && a[1] == b[1];
  }
  for (let i = 0; i < Q.length; i++){
    for (let j = i+1; j < Q.length; j++){
      if (eq(Q[i][0],Q[j][0])){
        Q[j] = [...Q[i].slice().reverse(),...Q[j].slice(1)];
        Q[i] = [];
        break;
      }else if (eq(Q[i][Q[i].length-1],Q[j][Q[j].length-1])){
        Q[j] = [...Q[i],...Q[j].slice().reverse().slice(1)];
        Q[i] = [];
        break;
      }else if (eq(Q[i][0],Q[j][Q[j].length-1])){
        Q[j] = [...Q[j],...Q[i].slice(1)];
        Q[i] = [];
        break;
      }else if (eq(Q[i][Q[i].length-1],Q[j][0])){
        Q[j] = [...Q[i],...Q[j].slice(1)];
        Q[i] = [];
        break;
      }
    }
  }
  return Q.filter(x=>x.length);
}

function draw_svg(polylines,W,H,scale=1,color="black",stroke_width=1){
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W*scale}" height="${H*scale}">`;
  // o += `<path stroke="black" stroke-width="1" fill="none" d="M0 0 ${W} 0 ${W} ${H} 0 ${H} z"/>`
  for (let i = 0; i < polylines.length; i++){
    //rgb(${~~(Math.random()*255)},${~~(Math.random()*255)},${~~(Math.random()*255)})
    o += `<path stroke="${color}" stroke-width="${stroke_width}" fill="none" d="M`
    for (let j = 0; j < polylines[i].length; j++){
      let [x,y] = polylines[i][j];
      o += `${x*scale} ${y*scale} `;
    }
    o += '"/>';
  }
  o += `</svg>`
  return o;
}