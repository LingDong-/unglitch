var ng2d = new function(){var that = this;
  var INF = 999999;
                          
  var pt_in_pl = that.pt_in_pl = function (x,y,x0,y0,x1,y1,x2,y2) {
    var dx = x1-x0;
    var dy = y1-y0;
    var e  = (x-x0)*dy-(y-y0)*dx;
    return e <= 0;
  }

  var pt_in_tri = pt_in_tri = function(x,y,x0,y0,x1,y1,x2,y2){
    return pt_in_pl(x,y,x0,y0,x1,y1) && pt_in_pl(x,y,x1,y1,x2,y2) && pt_in_pl(x,y,x2,y2,x0,y0);
  }

  var gon_area = that.gon_area = function(gon){
    var n = gon.length;
    var a = 0.0;
    for(var p=n-1,q=0; q<n; p=q++) {
      a += gon[p][0] * gon[q][1] - gon[q][0] * gon[p][1];
    }
    return a * 0.5;
  }

  var triangulate = that.triangulate = function(gon){
    //ported from https://github.com/cmu462/DrawSVG
    function inside(Ax,Ay,Bx,By,Cx,Cy,Px,Py) {
      var ax, ay, bx, by, cx, cy, apx, apy, bpx, bpy, cpx, cpy;
      var cCROSSap, bCROSScp, aCROSSbp;
      ax = Cx - Bx;  ay = Cy - By;
      bx = Ax - Cx;  by = Ay - Cy;
      cx = Bx - Ax;  cy = By - Ay;
      apx= Px - Ax;  apy= Py - Ay;
      bpx= Px - Bx;  bpy= Py - By;
      cpx= Px - Cx;  cpy= Py - Cy;
      aCROSSbp = ax*bpy - ay*bpx;
      cCROSSap = cx*apy - cy*apx;
      bCROSScp = bx*cpy - by*cpx;
      return ((aCROSSbp >= 0.0) && (bCROSScp >= 0.0) && (cCROSSap >= 0.0));
    };

    var EPSILON = 0.0000000001;
    function snip (gon,u,v,w,n,V){
      var p;
      var Ax, Ay, Bx, By, Cx, Cy, Px, Py;
      Ax = gon[V[u]][0];
      Ay = gon[V[u]][1];
      Bx = gon[V[v]][0];
      By = gon[V[v]][1];
      Cx = gon[V[w]][0];
      Cy = gon[V[w]][1];
      if ( EPSILON > (((Bx-Ax)*(Cy-Ay)) - ((By-Ay)*(Cx-Ax))) ) return false;
      for ( p = 0; p < n; p++ ) {
        if( (p == u) || (p == v) || (p == w) ) continue;
        Px = gon[V[p]][0];
        Py = gon[V[p]][1];
        if (inside(Ax,Ay,Bx,By,Cx,Cy,Px,Py)) return false;
      }
      return true;
    }  
    // allocate and initialize list of vertices in polygon
    var n = gon.length
    var tris = [];
    if ( n < 3 ) return tris;

    var V = new Array(n);

    // we want a counter-clockwise polygon in V
    if ( 0.0 < gon_area(gon) ) {
      for (var v=0; v<n; v++) V[v] = v;
    } else {
      for(var v=0; v<n; v++) V[v] = (n-1)-v;
    }

    var nv = n;

    // remove nv-2 Vertices, creating 1 triangle every time
    var count = 2*nv;   // error detection 

    for(var m = 0, v = nv - 1; nv > 2;) {

      // if we loop, it is probably a non-simple polygon
      if (0 >= (count--)) {
        // Triangulate: ERROR - probable bad polygon!
        return;
      }

      // three consecutive vertices in current polygon, <u,v,w>
      var u = v     ; if (nv <= u) u = 0;      // prev
      v = u + 1     ; if (nv <= v) v = 0;      // new v   
      var w = v + 1 ; if (nv <= w) w = 0;      // next    

      if ( snip(gon,u,v,w,nv,V) ) {
        var a,b,c,s,t;
        // true names of the vertices
        a = V[u]; b = V[v]; c = V[w];
        // output Triangle
        tris.push([a,b,c]);
        m++;
        // remove v from remaining polygon
        for( s = v, t = v + 1; t < nv; s++, t++) V[s] = V[t]; nv--;
        // resest error detection counter
        count = 2 * nv;
      }
    }
    return tris;
  }

  var new_bd = that.new_bd = function(x,y,gon){
    var vtxs = gon;
    var wtxs = vtxs.map(a=>[a[0]+x,a[1]+y]);
    var T = triangulate(gon);
    T = T.sort(function(b,a){
      return gon_area([vtxs[a[0]],vtxs[a[1]],vtxs[a[2]]])
            -gon_area([vtxs[b[0]],vtxs[b[1]],vtxs[b[2]]])
    });
    var tris = T.flat();
    return {
      x,y,     //center
      vtxs,    //vertices in local space
      tris,    //triangles (indices)
      wtxs,    //vertices in world space
      ang:0,   //angle
      av:0,    //angular velocity
      trq:0,   //torque
      v:[0,0], //velocity
      a:[0,0], //acceleration
      box:gon_box(wtxs),
      ancs:[],
      wncs:[],
    }
  }
  
  var bd_add_anc = that.bd_add_anc = function(bd,x,y){
    var sinth = Math.sin(-bd.ang);
    var costh = Math.cos(-bd.ang);
    
    bd.wncs.push([x,y]);
    var gx = x-bd.x
    var gy = y-bd.y
    var anc = [0,0]
    anc[0] = gx * costh - gy * sinth;
    anc[1] = gx * sinth + gy * costh;
    // console.log(anc)
    bd.ancs.push(anc);
    return bd.ancs.length-1;
  }

  var gon_box = that.gon_box = function(gon){
    var xmin = Infinity;
    var ymin = Infinity;
    var xmax =-Infinity;
    var ymax =-Infinity;
    for (var i = 0; i < gon.length; i++){
      xmin = Math.min(xmin,gon[i][0])
      ymin = Math.min(ymin,gon[i][1])
      xmax = Math.max(xmax,gon[i][0])
      ymax = Math.max(ymax,gon[i][1])
    }
    return {x:xmin,y:ymin,w:xmax-xmin,h:ymax-ymin};
  }

  var box_overlap = that.box_overlap = function(a,b){
    return (
      a.x <= b.x + b.w &&
      a.x + a.w >= b.x &&
      a.y <= b.y + b.h &&
      a.y + a.h >= b.y
    )
  }

  var seg_isect = that.seg_isect = function(p0x,p0y,p1x,p1y,q0x,q0y,q1x,q1y){
    // returns lerp params, not actual point!
    function det(a,b,c,d,e,f,g,h,i){
      return a*e*i + b*f*g + c*d*h - c*e*g - b*d*i - a*f*h;
    }
    var d0x = p1x-p0x;
    var d0y = p1y-p0y;
    var d1x = q1x-q0x;
    var d1y = q1y-q0y;
    var vc = [0,0,d0x*d1y-d1y*d0x];
    var vcn = vc[2]*vc[2];
    if (vcn == 0) {
      return null;
    }
    var q0_p0 = [q0x-p0x,q0y-p0y]
    var t = det(...q0_p0,0, d1x,d1y,0, ...vc)/vcn;
    var s = det(...q0_p0,0, d0x,d0y,0, ...vc)/vcn;

    if (t < 0 || t > 1 || s < 0 || s > 1) {
      return null;
    }
    return [t,s];
  }

  var pt_in_bd = that.pt_in_bd = function(x,y,bd){
    for (var i = 0; i < bd.tris.length; i+=3){
      var a = bd.wtxs[bd.tris[i]];
      var b = bd.wtxs[bd.tris[i+1]];
      var c = bd.wtxs[bd.tris[i+2]];
      
      if (pt_in_tri(x,y, ...a, ...b, ...c) ){
        return true;
      }
    }
    return false;
  }
  
  var bd_overlap = that.bd_overlap = function(bd0,bd1){
    if (!box_overlap(bd0.box,bd1.box)){
      return []
    }
    var hits = [];
    var [bda,bdb] = [bd0,bd1];
    for (var k = 0; k < 2; k++){
      var ok = false;
      for (var i = 0; i < bda.tris.length; i+=3){
        var a = bda.wtxs[bda.tris[i]];
        var b = bda.wtxs[bda.tris[i+1]];
        var c = bda.wtxs[bda.tris[i+2]];
        for (var j = 0; j < bdb.wtxs.length; j++){
          if (pt_in_tri(...bdb.wtxs[j], ...a, ...b, ...c) ){
            hits.push(bdb.wtxs[j].slice());
            ok = true;
            break;
          }
        }
        if (ok){
          break;
        }
      }
      [bda,bdb] = [bdb,bda];
    }
    // for (var i = 0; i < bd0.wtxs.length; i++){
    //   var l0 = [...bd0.wtxs[i], ...bd0.wtxs[(i+1)%bd0.wtxs.length]]
    //   for (var j = 0; j < bd1.wtxs.length; j++){
    //     var l1 = [...bd1.wtxs[j], ...bd1.wtxs[(j+1)%bd1.wtxs.length]]
    //     var ret = seg_isect(...l0,...l1)
    //     if (ret){
    //       var [t,s] = ret;
    //       return [l0[0]*(1-t)+l0[2]*t,l0[1]*(1-t)+l0[3]*t];
    //     }
    //   }
    // }
    return hits;
  }
  
  var bd_update_geom = that.bd_update_geom = function(bd){
    var sinth = Math.sin(bd.ang);
    var costh = Math.cos(bd.ang);

    for (var i = 0; i < bd.wtxs.length; i++){
      var [gx,gy]=bd.vtxs[i];
      bd.wtxs[i][0] = bd.x + (gx * costh - gy * sinth);
      bd.wtxs[i][1] = bd.y + (gx * sinth + gy * costh);
    }
    bd.box = gon_box(bd.wtxs);
    
    for (var i = 0; i < bd.wncs.length; i++){
      var [gx,gy]=bd.ancs[i]
      bd.wncs[i][0] = bd.x + (gx * costh - gy * sinth);
      bd.wncs[i][1] = bd.y + (gx * sinth + gy * costh);
    }
    
  }
  
  var conf = that.conf = {
    f_repl: 0.01,
    fric:0.9,
    angfric:0.8,
    grav:[0,0.0],
    wall:{l:-Infinity,t:-Infinity,r:Infinity,b:Infinity},
  }
  
  function v_ang(ux,uy,vx,vy){
    return (ux*vx+uy*vy)/(Math.sqrt(ux*ux+uy*uy)*Math.sqrt(vx*vx+vy*vy))
  }
                        
  var bd_app_force = that.bd_app_force = function(bd,pt,f){

    bd.a[0] += f[0]
    bd.a[1] += f[1]
    var l = [pt[0]-bd.x, pt[1]-bd.y];
    var cr = v_ang(...l,...f);
    if (isNaN(cr)){
      return;
    }
    var r = Math.abs(Math.tan(Math.acos(cr)));
    if (pt_in_pl(bd.x,bd.y,pt[0]+f[0],pt[1]+f[1],...pt)){
      r = r * -1;
    }
    // var a0 = Math.atan2(f[1],f[0])
    // var a1 = Math.atan2(l[1],l[0])
    // if (a0 < a1){
    //   r = -r;
    // }
    var mf = Math.sqrt(f[0]*f[0]+f[1]*f[1]);
    r *= mf;
    bd.trq += Math.min(Math.max(r*0.001,-0.1),0.1)//*(Math.random()*2-1);
  }                        
                          
  var hitpairs = [];
  
  var bds_step = that.bds_step = function(bds){
    hitpairs = [];
    for (var i = 0; i < bds.length; i++){
      bd_update_geom(bds[i]);
    }
    for (var i = 0; i < bds.length; i++){
      bds[i].a[0] += conf.grav[0];
      bds[i].a[1] += conf.grav[1];
    }

    for (var i = 0; i < bds.length; i++){
      for (var j = i+1; j < bds.length; j++){
        var hits = bd_overlap(bds[i],bds[j]);
        // var hit = box_overlap(bds[i].box,bds[j].box);
        if (hits.length<2){
          continue;
        }
        hitpairs.push(hits);
        var d = [hits[1][0]-hits[0][0],hits[1][1]-hits[0][1]]
        
        var fa = [
          -conf.f_repl*d[0]+bds[j].a[0]*0.5,
          -conf.f_repl*d[1]+bds[j].a[1]*0.5,
        ]
        var fb = [
          -fa[0],-fa[1]
        ]
        
        bd_app_force(bds[i],hits[1],fa);
        bd_app_force(bds[j],hits[0],fb);
      }
    }
    
    for (var i = 0; i < bds.length; i++){
      var ol = bds[i].box.x - conf.wall.l;
      var or = bds[i].box.x+bds[i].box.w - conf.wall.r;
      var ot = bds[i].box.y - conf.wall.t
      var ob = bds[i].box.y+bds[i].box.h - conf.wall.b
      if (ol < 0){
        bds[i].x -=ol ;
        bds[i].v[0] = 0;
      }
      if (or > 0){
        bds[i].x -=or ;
        bds[i].v[0] = 0;
      }
      if (ot < 0){
        bds[i].y -=ot ;
        bds[i].v[1] = 0;
      }
      if (ob > 0){
        bds[i].y -=ob ;
        bds[i].v[1] = 0;
      }
    }
    for (var i = 0; i < bds.length; i++){
      bds[i].v[0] += bds[i].a[0]
      bds[i].v[1] += bds[i].a[1]
      
      bds[i].x += bds[i].v[0]
      bds[i].y += bds[i].v[1]
      
      bds[i].a[0] = 0;
      bds[i].a[1] = 0;
      bds[i].v[0] *= conf.fric;
      bds[i].v[1] *= conf.fric;
      
      bds[i].av += bds[i].trq;
      bds[i].ang += bds[i].av;
      bds[i].av *= conf.angfric;
      bds[i].trq = 0;
    }
  }
  
  var bds_plot = that.bds_plot = function(ctx,bds){
    ctx.save();
    for (var i = 0; i < bds.length; i++){
      
      var tris = bds[i].tris;
      var wtxs = bds[i].wtxs;
      
      
      ctx.strokeStyle="black"
      ctx.lineWidth=2
      ctx.beginPath();
      for (var j = 0; j < wtxs.length; j++){
        if (j == 0){
          ctx.moveTo(...wtxs[j]);
        }else{
          ctx.lineTo(...wtxs[j]);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.lineWidth=0.5
      ctx.textAlign = "center"
      
      for (var j = 0; j < tris.length; j+=3){
        var a = wtxs[tris[j]];
        var b = wtxs[tris[j+1]];
        var c = wtxs[tris[j+2]];
        ctx.beginPath();
        ctx.moveTo(...a);
        ctx.lineTo(...b);
        ctx.lineTo(...c);
        ctx.closePath();
        ctx.stroke();
        
        var cx = (a[0]+b[0]+c[0])/3;
        var cy = (a[1]+b[1]+c[1])/3;
        
        
        if (j == 0){
          ctx.fillText("<"+i+">",cx,cy);
        }else{
          ctx.fillText(j,cx,cy);
        }
      }
      ctx.lineWidth=2
      ctx.strokeStyle="blue";
      for (var j = 0; j < bds[i].wncs.length; j++){
        
        ctx.strokeRect(bds[i].wncs[j][0]-2,bds[i].wncs[j][1]-2,4,4);
      }
      
      ctx.strokeStyle="green";
      ctx.lineWidth=1
      ctx.beginPath();
      ctx.moveTo(bds[i].x,bds[i].y);
      ctx.lineTo(bds[i].x+bds[i].v[0]*20,bds[i].y+bds[i].v[1]*20);
      ctx.stroke();
    }
    ctx.strokeStyle="red";
    ctx.lineWidth=2
    for (var i = 0; i < hitpairs.length; i++){
      ctx.beginPath();
      ctx.moveTo(...hitpairs[i][0]);
      ctx.lineTo(...hitpairs[i][1]);
      ctx.stroke();
    }
    ctx.restore();
  }
}