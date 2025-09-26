var TrapezoidMap = new function(){
  
  let jsr = 0x5EED;
  let {PI,sin,cos} = Math;
  
  let animations = [];

  function rand(){
    jsr^=(jsr<<17);
    jsr^=(jsr>>13);
    jsr^=(jsr<<5);
    return (jsr>>>0)/4294967295;
  }

  let id_counter = 0;
  function make_id(){
    // var id = "";
    // for (var i = 0; i < 7; i++){
    //   id+=String.fromCharCode(~~(rand()*26)+0x61);
    // }
    // return id;
    return id_counter++;
  }
  
  function bst_node(x){
    return {
      key:x,
      h:1,
      l:null,
      r:null,
    };
  }
  
  function bst_snapshot(x){
    if (!x){
      return x;
    }
    return {
      key:{id:x.key.id,seg:[...x.key.xy,...x.key.next.xy]},
      h:x.h,
      l:bst_snapshot(x.l),
      r:bst_snapshot(x.r),
    }
  }

  function bst_geth(x){
    if (x) return x.h;
    return 0;
  }

  function bst_updateh(x){
    x.h = Math.max(bst_geth(x.l),bst_geth(x.r))+1;
  }

  function bst_rotr(y){
    let x = y.l;
    let t2 = x.r;
    x.r = y;
    y.l = t2;
    bst_updateh(y);
    bst_updateh(x);

    return x;
  }

  function bst_rotl(x){
    let y = x.r;
    let t2 = y.l;
    y.l = x;
    x.r = t2;
    bst_updateh(y);
    bst_updateh(x);
    return y;
  }
  function bst_getbalance(x){
    if (x) return bst_geth(x.l)-bst_geth(x.r);
    return 0;
  }


  function bst_insert(node,key,cmp){
    if (!node) return bst_node(key);

    let b = cmp(key,node.key);

    if (b<0){
      node.l = bst_insert(node.l,key,cmp);
    }else if (b>0){
      node.r = bst_insert(node.r,key,cmp);
    }else{
      return node;
    }

    bst_updateh(node);
    let bal = bst_getbalance(node);

    if (bal > 1 && cmp(key,node.l.key)<0){
      return bst_rotr(node);
    }
    if (bal < -1 && cmp(key,node.r.key)>0){
      return bst_rotl(node);
    }
    if (bal > 1 && cmp(key,node.l.key)>0){
      node.l = bst_rotl(node.l);
      return bst_rotr(node);
    }
    if (bal < -1 && cmp(key,node.r.key)<0){
      node.r = bst_rotr(node.r);
      return bst_rotl(node);
    }
    return node;
  }
  function bst_min(node){
    let curr = node;
    while (curr.l != null) curr = curr.l;
    return curr;
  }

  function bst_del(root,key,cmp){
    if (root == null) return root;
    let b = cmp(key,root.key);
    if (b < 0){
      root.l = bst_del(root.l,key,cmp);
    }else if (b > 0){
      root.r = bst_del(root.r,key,cmp);
    }else{
      if ((root.l == null) || (root.r == null)){
        let tmp = null;
        if (tmp == root.l){
          tmp = root.r;
        }else{
          tmp = root.l;
        }
        if (!tmp){
          tmp = root;
          root = null;
        }else{
          root = tmp
        }
      }else{
        let tmp = bst_min(root.r);
        root.key = tmp.key;
        root.r = bst_del(root.r,tmp.key,cmp);
      }
    }
    if (root == null){
      return root;
    }
    bst_updateh(root);

    let bal = bst_getbalance(root);

    if (bal > 1 && bst_getbalance(root.l)>=0){
      return bst_rotr(root);
    }
    if (bal > 1 && bst_getbalance(root.l)<0){
      root.l = bst_rotl(root.l);
      return bst_rotr(root);
    }
    if (bal < -1 && bst_getbalance(root.r)<=0){
      return bst_rotl(root);
    }
    if (bal < -1 && bst_getbalance(root.r)>0){
      root.r = bst_rotr(root.r);
      return bst_rotl(root);
    }
    return root;
  }

  function bst_preorder(node){
    if (node){
      console.log(node.key);
      bst_preorder(node.l);
      bst_preorder(node.r);
    }
  }

  function bst_findneighbors(node,cmp){
    let b = cmp(node.key);
    if (b == 0){
      return [node.key,node.key];
    }else if (b < 0){
      if (node.l == null){
        return [null,node.key];
      }
      let r = bst_findneighbors(node.l,cmp);
      return [r[0], r[1]||node.key];
    }else{
      if (node.r == null){
        return [node.key,null];
      }
      let r = bst_findneighbors(node.r,cmp);
      return [r[0]||node.key, r[1]];
    }
  }


  function make_halfedge_list(w,h,shapes,jitter=0.5){
    
    
    let vertices = [];

    function add_shape(shape,disturb){
      let V = [];

      for (let i = 0; i < shape.length; i++){
        V.push({
          xy:[shape[i][0]+(rand()-0.5)*disturb,shape[i][1]],
          prev:null,
          next:null,
          id:make_id(),
        })
      }

      for (let i = 0; i < shape.length; i++){
        V[i].next = V[(i+1)%shape.length];
        V[i].prev = V[(i+shape.length-1)%shape.length];
      }
      vertices.push(...V);
    }

    add_shape([[0,0],[w,0],[w,h],[0,h]],0)

    for (let i = 0; i < shapes.length; i++){
      add_shape(shapes[i].slice().reverse(),jitter);
    }
    
    animations.splice(0,Infinity);
    animations.push({type:'setup',w,h});
    
    return vertices;
  }



  function vray_isect(x,y,dir,x0,y0,x1,y1){

    let t = (x - x0)/(x1-x0);
    let y2 = y0 * (1-t) + y1 * t;
    if (dir < 0 && y2 >= y){
      return null;
    }
    if (dir > 0 && y2 <= y){
      return null;
    }
    return {
      xy:[x,y2]
    }
  }


  function pt_in_pl (x,y,x0,y0,x1,y1) {
    var dx = x1-x0;
    var dy = y1-y0;
    var e  = (x-x0)*dy-(y-y0)*dx;
    return e;
  }

  function seg_ord(x0,y0,x1,y1, x2,y2,x3,y3){
    if (x1 < x0){
      ;[x1,x0] = [x0,x1];
      ;[y1,y0] = [y0,y1];
    }
    if (x3 < x2){
      ;[x2,x3] = [x3,x2];
      ;[y2,y3] = [y3,y2];
    }
    if (x0 == x2 && y0 == y2 && x1 == x3 && y1 == y3){
      return 0;
    }
    if (x0 == x3 && y0 == y3 && x1 == x2 && y1 == y2){
      return 0;
    }
    if (pt_in_pl(x2,y2,  x0,y0,x1,y1)>=0 && pt_in_pl(x3,y3,  x0,y0,x1,y1)>=0){
      return 1;
    }
    if (pt_in_pl(x2,y2,  x0,y0,x1,y1)<=0 && pt_in_pl(x3,y3,  x0,y0,x1,y1)<=0){
      return -1;
    }
    if (pt_in_pl(x0,y0,  x2,y2,x3,y3)>=0 && pt_in_pl(x1,y1,  x2,y2,x3,y3)>=0){
      return -1;
    }
    if (pt_in_pl(x0,y0,  x2,y2,x3,y3)<=0 && pt_in_pl(x1,y1,  x2,y2,x3,y3)<=0){
      return 1;
    }
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



  function make_cuts(vertices){

    function cmp(u,v){
      return seg_ord(...u.xy,...u.next.xy,...v.xy,...v.next.xy);
    }

    let A = vertices.slice();
    A.sort((a,b)=>(a.xy[0]-b.xy[0]));

    let B = null;
    B = bst_insert(B,vertices.filter(x=>x.xy[0]==0)[0],cmp);
    B = bst_insert(B,vertices.filter(x=>x.next.xy[0]==0)[0],cmp);

    let C = vertices.slice();
    
    animations.push({type:'currset',segs:C.map(x=>({id:x.id,seg:[...x.xy,...x.next.xy]}))})

    function cast_ray(v,dir){
      let r = [...v.xy,v.xy[0],v.xy[1]+dir];

      let [m,M] = bst_findneighbors(B,(a)=>{
        let [x0,y0] = a.xy;
        let [x1,y1] = a.next.xy;
        if (x1 < x0){
          ;[x1,x0] = [x0,x1];
          ;[y1,y0] = [y0,y1];
        }
        return -pt_in_pl(r[2],r[3],x0,y0,x1,y1);
      });
      let u;
      if (dir < 0){
        u = m;
      }else{
        u = M;
      }

      let ret = vray_isect(v.xy[0],v.xy[1]+dir*0.001,dir,...u.xy,...u.next.xy);

    
      animations.push({type:'raycast',pt:[...v.xy],seg:[...u.xy,...u.next.xy],hit:[...ret.xy]});
      
      return {
        v:u,
        xy:ret.xy,
      };
    }
    
    function solve_ray(v,dir){
      let r0;
      r0 = cast_ray(v,dir);

      let v1 = {
        xy:v.xy,
        prev:v.prev,
        next:null,
        id:make_id(),
      }
      let u0 ={
        xy:r0.xy,
        prev:v1,
        next:r0.v.next,
        id:make_id(),
      };
      let u1 = {
        xy:r0.xy,
        prev:r0.v,
        next:v,
        id:make_id(),
      }

      v1.next = u0;
      r0.v.next.prev = u0;
      r0.v.next = u1;
      v.prev.next=v1;
      v.prev=u1;


      if (r0.v.xy[0] < r0.v.next.xy[0]){
        B = bst_del(B,r0.v,cmp);
      }else{
        B = bst_del(B,r0.v.next,cmp);
      }
      B = bst_del(B,v1.prev,cmp);

      B = bst_del(B,v,cmp);

      if (u0.next.xy[0]>u0.xy[0]){
        B = bst_insert(B,u0,cmp);
      }

      if (v1.prev.xy[0] > v.xy[0]){
        B = bst_insert(B,v1.prev,cmp);
      }

      if (v.next.xy[0] > v.xy[0] ){
        B = bst_insert(B,v,cmp);
      }

      v1.twin = u1;
      u1.twin = v1;
      C.push(u0,u1,v1);
      
      animations.push({type:'bst',bst:bst_snapshot(B)});
      animations.push({type:'currset',segs:C.map(x=>({id:x.id,seg:[...x.xy,...x.next.xy]}))})
      
      return v1;

    }


    for (let i = 0; i < A.length; i++){


      let v = A[i];
      
      animations.push({type:'scanline',xy:v.xy});
      
      if (pt_in_pl(...v.next.xy, ...v.prev.xy, ...v.xy)<=0){
        // console.log("concave",v.id,v.xy,v.prev.xy,v.next.xy)
        if (v.prev.xy[0] > v.xy[0] && v.next.xy[0] < v.xy[0]){
          // console.log('v')
          solve_ray(v,-1);
        }else if (v.prev.xy[0] < v.xy[0] && v.next.xy[0] > v.xy[0]){
          // console.log('^')
          solve_ray(v,1);
        }else if (v.prev.xy[0] < v.xy[0] && v.next.xy[0] < v.xy[0]){
          // console.log(">");
          B = bst_del(B,v,cmp);
          B = bst_del(B,v.prev,cmp)
        }else if (v.prev.xy[0] > v.xy[0] && v.next.xy[0] > v.xy[0]){
          // console.log("<");
          B = bst_insert(B,v,cmp);
          B = bst_insert(B,v.prev,cmp)
        }
      }else{
        // console.log('convex',v.id,v.xy,v.prev.xy,v.next.xy)
        if (v.prev.xy[0] > v.xy[0] && v.next.xy[0] > v.xy[0]){
          solve_ray(v,-1);
          solve_ray(v,1);
        } else if (v.prev.xy[0] < v.xy[0] && v.next.xy[0] < v.xy[0]){
          v = solve_ray(v,-1);
          solve_ray(v,1);
        } else if (v.prev.xy[0] > v.xy[0] && v.next.xy[0] < v.xy[0]){
          // console.log("^",v.xy);
          solve_ray(v,-1);
        } else if (v.prev.xy[0] < v.xy[0] && v.next.xy[0] > v.xy[0]){
          solve_ray(v,1);
        }

      }
      
      
    }

    let faces =[];
    for (let i = 0; i < C.length; i++){
      let v = C[i];
      let face = {
        id:make_id(),
        vertices:[],
        neighbors:[],
      };
      while (!v.face){
        v.face = face;
        v = v.next;
        face.vertices.push(v);
      }
      if (face.vertices.length){
        faces.push(face);
      }
    }
    for (let i = 0; i < faces.length; i++){
      for (let j = 0; j < faces[i].vertices.length; j++){
        if (faces[i].vertices[j].twin){
          faces[i].neighbors.push({
            edge:faces[i].vertices[j],
            face:faces[i].vertices[j].twin.face
          });
        }
      }
    }

    for (let i = 0; i < faces.length; i++){
      faces[i].centroid = centroid(faces[i].vertices.map(x=>x.xy));
    }

    return faces;
  }


  function dfs(a,b,visited){
    visited[a.id] = true;
    if (a == b){
      return [a.centroid];
    }
    for (let i = 0; i < a.neighbors.length; i++){
      let v = a.neighbors[i].edge;
      let e = [(v.xy[0]+v.next.xy[0])/2,(v.xy[1]+v.next.xy[1])/2];
      let f = a.neighbors[i].face;
      if (visited[f.id]){
        continue;
      }
      let r = dfs(f,b,visited);
      if (r){
        return [a.centroid,e,...r];  
      }
    }
    return null;

  }

  function bfs(a,b,visited){
    visited[a.id] = true;
    let Q = [[a.centroid,a]];
    while (Q.length){
      let q = Q.shift();
      let c = q.pop();
      if (c == b){
        return q.concat([c.centroid]);
      }
      for (let i = 0; i < c.neighbors.length; i++){
        let v = c.neighbors[i].edge;
        let e = [(v.xy[0]+v.next.xy[0])/2,(v.xy[1]+v.next.xy[1])/2];
        let f = c.neighbors[i].face;
        if (visited[f.id]){
          continue;
        }
        visited[f.id]=true;
        Q.push(q.concat([e,f.centroid,f]));
      }
    }

    return null;
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

  function minkowski_sum(p,q){
    let c = [];
    q = q.slice().reverse();
    for (let i = 0; i < p.length; i++){
      let n = p.length;
      let dx = p[(i+1)%n][0]-p[i][0];
      let dy = p[(i+1)%n][1]-p[i][1];
      c.push([
        Math.atan2(dy,dx),
        p[i],p[(i+1)%p.length],
      ]);
    }
    for (let i = 0; i < q.length; i++){
      let n = q.length;
      let dx = q[(i+1)%n][0]-q[i][0];
      let dy = q[(i+1)%n][1]-q[i][1];
      c.push([
        Math.atan2(dy,dx),
        q[i],q[(i+1)%q.length],
      ]);
    }
    c.sort((a,b)=>(a[0]-b[0]));

    let o = [];
    let x = 0;
    let y = 0;
    for (let i = 0; i < c.length; i++){
      x+=c[i][2][0]-c[i][1][0];
      y+=c[i][2][1]-c[i][1][1];
      o.push([
        x,y
      ]);
    }
    let bb0 = get_bbox(p);
    let bb1 = get_bbox(q);
    let bb2 = get_bbox(o);
    let x0 = bb0.x - (bb1.x+bb1.w);
    let y0 = bb0.y - (bb1.y+bb1.h);
    // console.log(x0,y0)
    o = o.map(xy=>[xy[0]+(x0-bb2.x),xy[1]+(y0-bb2.y)]);
    return o;
  }

  
  
  
  this.minkowski_sum = minkowski_sum;
  this.dfs = dfs;
  this.bfs = bfs;
  this.make_cuts = make_cuts;
  this.make_halfedge_list = make_halfedge_list;
  this.animations = animations;
}


var TMapAnimator = new function(){
  
  


  function clone(x){
    return JSON.parse(JSON.stringify(x));
  }
  
  function run(anims,N){
    let frames = [];
    let elms = {
      title:"",
      special:{scanline:{type:'seg',data:[0,0,0,0]},ray:null},
      bg_segs:{},
      did_segs:{},
      bst_segs:{},
      bst_nodes:{},
    };
    
    function flatten_bst(x,path){
      if (!path){
        path = [];
      }
      if (!x){
        return [];
      }
      return flatten_bst(x.l,path.concat([-1])).concat([{key:x.key,path:path}]).concat(flatten_bst(x.r,path.concat([1])));
    }
    
    function locate_bst_path(path){
      let lx = 0;
      let ly = 0;
      let x = 0;
      let y = 0;
      for (let i = 0; i < path.length; i++){
        lx = x;
        ly = y;
        
        x += path[i]*1;
        y += 1;

      }
      return [lx,ly,x,y];
    }
    
    function lerp_segs(container,map0,map1){
      let tframes=[];
      let n = N;
      let keys = Object.keys(map0).concat(Object.keys(map1));
      for (let j = 0; j < n; j++){
        let t = j/(n-1);
        for (let k = 0; k < keys.length; k++){
          let thk0, thk1;
          let p = (thk0=1,map0[keys[k]]) || (thk0=0,map1[keys[k]]);
          let q = (thk1=1,map1[keys[k]]) || (thk1=0,map0[keys[k]]);
          container[keys[k]]={
            data:[
              p[0] * (1-t) + q[0] * t,
              p[1] * (1-t) + q[1] * t,
              p[2] * (1-t) + q[2] * t,
              p[3] * (1-t) + q[3] * t,
            ],
            style:[
              thk0*(1-t)+thk1*t
            ]
          }
        }
        tframes.push(clone(elms));
      }
      for (let k in container){
        if (container[k].style[0] == 0){
          delete container[k];
        }
      }
      return tframes;
    }
    
    for (let i = 0; i < anims.length; i++){
      let a = anims[i];
      elms.title = a.type;
      if (a.type == 'setup'){
        elms.special.scanline.data[3] = a.h;
        frames.push(clone(elms));
      }else if (a.type == 'scanline'){

        let x = elms.special.scanline.data[0];
        let n = N;
        for (let j = 0; j < n; j++){
          let t = j/(n-1);
          let x1 = x * (1-t) + a.xy[0] * t;
          elms.special.scanline.data[0] = x1;
          elms.special.scanline.data[2] = x1;
          
          frames.push(clone(elms));
        }
      }else if (a.type == 'currset'){
        let map0 = Object.fromEntries(Object.entries(elms.did_segs).map(x=>[x[0],x[1].data]));
        let map1 = Object.fromEntries(a.segs.map(x=>[x.id,x.seg]));
        frames.push(...lerp_segs(elms.did_segs, map0,map1)); 
        
      }else if (a.type == 'bst'){
        let fb = flatten_bst(a.bst);
        
        let map0 = Object.fromEntries(Object.entries(elms.bst_segs).map(x=>[x[0],x[1].data]));
        let map1 = Object.fromEntries(fb.map(x=>[x.key.id,x.key.seg]));
        let framesA = lerp_segs(elms.bst_segs, map0,map1);
   
        let map2 = Object.fromEntries(Object.entries(elms.bst_nodes).map(x=>[x[0],x[1].data]));
        let map3 = Object.fromEntries(fb.map(x=>[x.key.id,locate_bst_path(x.path)]));
        let framesB = lerp_segs(elms.bst_nodes, map2,map3);
        
        for (let i = 0; i < framesA.length; i++){
          framesA[i].bst_nodes = framesB[i].bst_nodes;
        }
        frames.push(...framesA);
        
      }else if (a.type == 'raycast'){
        let n = N*2;
        for (let j = 0; j < n; j++){
          let t = j/(n-1);
          let x = a.pt[0] * (1-t) + a.hit[0] * t;
          let y = a.pt[1] * (1-t) + a.hit[1] * t;
          let l = Math.sin(t*Math.PI)*Math.min(30,Math.abs(a.pt[1]-a.hit[1])/2);
          elms.special.ray = {
            type:'seg',
            data:[x,y-l,x,y+l],
          }
          frames.push(clone(elms));
        }
        elms.special.ray = null;
      }
    }
    return frames;
    
  }
  
  this.run = run;
  
}