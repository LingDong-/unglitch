/* global describe Noise WIDTH HEIGHT TEX_SIZE TRIANGLES TRIANGLES_EXT OUTLINE_EXT STANDARD512*/


function lerp2d(a,b,t){
  return {x:a.x*(1-t)+b.x*t, y:a.y*(1-t)+b.y*t}
}
function dist2d(a,b){
  return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2));
}

function mapval(value,istart,istop,ostart,ostop){
    return ostart + (ostop - ostart) * ((value - istart)*1.0 / (istop - istart))
}
function clampmap(value,istart,istop,ostart,ostop){
  if (ostart < ostop){
    return Math.min(Math.max(mapval(value,istart,istop,ostart,ostop),ostart),ostop);
  }else{
    return Math.max(Math.min(mapval(value,istart,istop,ostart,ostop),ostart),ostop);
  }
}

function calc_rat(age){
  if (age < 0.8){
    return age/0.8*0.5;
  }else{
    return ((age-0.8)/0.2)*0.5+0.5
  }
}


function age_mesh(age,mesh){
  var l_scale = dist2d(mesh.geometry.vertices[2],mesh.geometry.vertices[31]);
  var r_scale = dist2d(mesh.geometry.vertices[14],mesh.geometry.vertices[35]);
  var y_scale = dist2d(mesh.geometry.vertices[27],mesh.geometry.vertices[33]);

  var rat = calc_rat(age);
  
  var s;
  if (rat < 0.5){
    s = clampmap(rat,0,0.5,0,1)
  }else{
    s = clampmap(rat,0.5,1,1,0)
  }
  mesh.geometry.vertices[48].x -= l_scale*0.1*s;
  mesh.geometry.vertices[60].x -= l_scale*0.1*s;
  mesh.geometry.vertices[54].x += r_scale*0.1*s;
  mesh.geometry.vertices[64].x += r_scale*0.1*s;
  mesh.geometry.vertices[4].x -=  l_scale*0.1*s;
  mesh.geometry.vertices[5].x -=  l_scale*0.2*s;
  mesh.geometry.vertices[6].x -=  l_scale*0.3*s;
  mesh.geometry.vertices[7].x -=  l_scale*0.3*s;
  mesh.geometry.vertices[12].x += r_scale*0.1*s;
  mesh.geometry.vertices[11].x += r_scale*0.2*s;
  mesh.geometry.vertices[10].x += r_scale*0.3*s;
  mesh.geometry.vertices[9].x +=  r_scale*0.3*s;
  mesh.geometry.vertices[45].y -= y_scale*0.1*s;
  mesh.geometry.vertices[36].y -= y_scale*0.1*s;

  
}

function new_blotcher(){
  var blotches = []
  for (var i = 0; i < 30; i++){
    blotches.push({x:Math.random()*TEX_SIZE,y:Math.random()*TEX_SIZE,r:(0.4+0.6*Math.random())})
  }
  return blotches;
}


var blotch_canvas = document.createElement("canvas");
blotch_canvas.setAttribute("id","blotch_canvas");
blotch_canvas.width = TEX_SIZE;
blotch_canvas.height = TEX_SIZE;
// document.body.appendChild(blotch_canvas);
var blotch_context = blotch_canvas.getContext("2d")


var com_canvas = document.createElement("canvas");
com_canvas.setAttribute("id","com_canvas");
com_canvas.width = TEX_SIZE;
com_canvas.height = TEX_SIZE;
// document.body.appendChild(com_canvas);
var com_context = com_canvas.getContext("2d")


var mouth_canvas = document.createElement("canvas");
mouth_canvas.setAttribute("id","com_canvas");
mouth_canvas.width = TEX_SIZE;
mouth_canvas.height = TEX_SIZE;
// document.body.appendChild(mouth_canvas);
var mouth_context = mouth_canvas.getContext("2d")

var blotcher0 = new_blotcher();
var blotcher1 = new_blotcher();
var blotcher2 = new_blotcher();
var blotcher3 = new_blotcher();

var bugs = []

var teethmap = [1,1,1,1,1,1,1,1,1,1,1,1,1,1];
var teeth = []


function blotchMask(blotcher,v){
  blotch_context.clearRect(0,0,TEX_SIZE,TEX_SIZE);
  for (var i = 0; i < blotcher.length; i++){
    blotch_context.fillStyle="black";
    blotch_context.beginPath();
    blotch_context.arc(blotcher[i].x, blotcher[i].y, blotcher[i].r*v*TEX_SIZE*0.5 ,0, 2 * Math.PI, false);
    blotch_context.fill();
    
  }
  blotch_context.filter = "blur(20px)"
}

function appBlotch(img){
  com_context.clearRect(0, 0, TEX_SIZE, TEX_SIZE);
  com_context.globalCompositeOperation = 'source-over';
  com_context.drawImage(blotch_canvas,0,0,TEX_SIZE,TEX_SIZE);
  com_context.globalCompositeOperation = 'source-in';
  com_context.drawImage(img, 0,0, TEX_SIZE, TEX_SIZE);
}

function locateTooth(p0,p1,i){ 
  var cols = teethmap.length/2;

  var d = dist2d(p0,p1)
  var s = d/cols


  var c = ((i+0.5) % cols)/cols
  var r = Math.floor(i / cols)*2-1

  var p = lerp2d(p0,p1,c)
  var u = {x:p1.x-p0.x,y:p1.y-p0.y}
  var v = {x:u.y/d,y:-u.x/d};

  var q = {x: p.x + r *0.5 * s * v.x,
           y: p.y + r *0.5 * s * v.y,
           s: s,
           a: Math.atan2(v.y,v.x) + (i >= cols ? 1 : -1) * Math.PI/2
          }
  return q;
  
}

function drawTeethMask(){
  mouth_context.filter = "blur(5px)";
  function pt(i){
    return {x:STANDARD512[i][0]/512*TEX_SIZE, y: STANDARD512[i][1]/512*TEX_SIZE};
  }
  var p0 = pt(60);
  var p1 = pt(64);
  // var a = Math.atan2(p1.y-p0.y, p1.x - p0.x);
  
  mouth_context.fillStyle = "white";
  mouth_context.fillRect(0,0,TEX_SIZE,TEX_SIZE);
  
    
  mouth_context.fillStyle = "rgb(80,0,0)";
  for (var i = 0; i < teethmap.length; i++){
    
    if (teethmap[i]){
      continue;
    }
    
    var q = locateTooth(p0,p1,i);
    // console.log(q)
    mouth_context.save()
    mouth_context.translate(q.x,q.y);
    // mouth_context.rotate(a);
    mouth_context.fillRect(-q.s/2,-q.s/2,q.s,q.s);
    mouth_context.restore();
    
  }
  
  var mo = [60,61,62,63,64,65,66,67,60];
  mo = [48,49,50,51,52,53,54,55,56,57,58,59,48];
  mouth_context.strokeStyle = "white";
  mouth_context.lineWidth=TEX_SIZE*0.05;
  mouth_context.beginPath();
  for (var i = 0; i < mo.length; i++){
    var p = pt(mo[i]);
    
    if (!i){
      mouth_context.moveTo(p.x,p.y);
    }else{
      mouth_context.lineTo(p.x,p.y);
    }
  }
  mouth_context.stroke();
  
}



function age_texture(age,canvas,images){
  var ctx = canvas.getContext("2d")
  
  var rat = calc_rat(age);
  
  // blotchMask(rat)
  drawTeethMask();
  ctx.save()
  ctx.globalCompositeOperation = "multiply"
  // ctx.globalAlpha = 0.9;
  ctx.drawImage(mouth_canvas,0,0,canvas.width,canvas.height)
  ctx.restore();
  
  ctx.filter=`saturate(${100-rat*20}%) brightness(${100+rat*20}%)`
  
  ctx.save();
  ctx.globalAlpha = clampmap(rat,0,0.2,0,1);
  ctx.globalCompositeOperation = "multiply"
  ctx.drawImage(images.wrinklelight.data,0,0,canvas.width,canvas.height)  
  ctx.restore();
  
  if (rat >= 0.2){
    ctx.save();
    ctx.globalAlpha = clampmap(rat,0.2,0.5,0,1);
    ctx.globalCompositeOperation = "multiply"
    ctx.drawImage(images.wrinkle.data,0,0,canvas.width,canvas.height)  
    ctx.restore();
  }
  
  if (rat >= 0.4){
    ctx.save();
    
    if (rat < 0.5){
      blotchMask(blotcher0,clampmap(rat,0.4,0.5,0,1));
      appBlotch(images.blotch.data);
      ctx.globalCompositeOperation = "multiply"
      ctx.drawImage(com_canvas,0,0,canvas.width,canvas.height);
    }else{
    
      ctx.globalCompositeOperation = "multiply"
      ctx.drawImage(images.blotch.data,0,0,canvas.width,canvas.height)  
    }
    ctx.restore();
  }
  
  if (rat >= 0.2){
    ctx.save();
    ctx.globalAlpha = clampmap(rat,0.2,0.45,0,0.4);
    ctx.globalCompositeOperation = "screen"
    ctx.drawImage(images.hair.data,0,0,canvas.width,canvas.height)  
    ctx.restore();
  }
  
  ctx.save();
  ctx.globalAlpha = clampmap(rat,0,0.2,0,0.5);
  ctx.globalCompositeOperation = "saturation"
  ctx.drawImage(images.lip.data,0,0,canvas.width,canvas.height)  
  ctx.restore();

  if (rat >= 0.5){
    ctx.save();
    if (rat < 0.6){
      
      blotchMask(blotcher1,clampmap(rat,0.5,0.6,0,1))
      appBlotch(images.corpseskin.data);
      ctx.globalAlpha = 0.8;
      ctx.drawImage(com_canvas,0,0,canvas.width,canvas.height)  
      
    }else{
      ctx.globalAlpha = 0.8;
      ctx.drawImage(images.corpseskin.data,0,0,canvas.width,canvas.height)
    }
    ctx.restore();
  }
  
  if (rat >= 0.6){
  
    ctx.save();
    
    if (rat < 0.8){
    
      blotchMask(blotcher2,clampmap(rat,0.6,0.8,0,1));
      appBlotch(images.corpse.data);
      ctx.globalCompositeOperation = "multiply"
      ctx.globalAlpha = 0.7;
      ctx.drawImage(com_canvas,0,0,canvas.width,canvas.height)  

    }else{
      ctx.globalCompositeOperation = "multiply"
      ctx.globalAlpha = 0.7;
      ctx.drawImage(images.corpse.data,0,0,canvas.width,canvas.height)  
    }
    ctx.restore();
  }
  
  if (rat >= 0.8){
   
    ctx.save();
    if (rat < 1){
      blotchMask(blotcher3,clampmap(rat,0.8,1,0,1));
      appBlotch(images.skull.data);
        ctx.globalAlpha = 0.35;
      ctx.drawImage(com_canvas,0,0,canvas.width,canvas.height)  
    }else{
      ctx.globalAlpha = 0.35;
      ctx.drawImage(images.skull.data,0,0,canvas.width,canvas.height)  
    }
    ctx.restore();

  }
  
  
    
  if (rat > 0.5 && rat < 0.8){
    if (bugs.length < 50 && Math.random() < 0.25){
      var x = Math.random()
      var y = Math.random()
      if (Math.random()<0.5){
        x = Math.round(x)
      }else{
        y = Math.round(y)
      }
      bugs.push({x:x*TEX_SIZE, y:y*TEX_SIZE})
    }
  }
  for (var i = bugs.length-1; i >=0; i--){
    bugs[i].t += 1;
    bugs[i].x += (Noise.noise(i,0,rat*5)-0.5)*40
    bugs[i].y += (Noise.noise(i,1,rat*5)-0.5)*40
    if (bugs[i].x < 0){
      if (rat > 0.8){bugs.splice(i,1);continue}
      bugs[i].x = WIDTH
    }
    if (bugs[i].x > WIDTH){
      if (rat > 0.8){bugs.splice(i,1);continue}
      bugs[i].x = 0;
    }
    if (bugs[i].y < 0){
      if (rat > 0.8){bugs.splice(i,1);continue}
      bugs[i].y = HEIGHT;
    }
    if (bugs[i].y > HEIGHT){
      if (rat > 0.8){bugs.splice(i,1);continue}
      bugs[i].y = 0;
    }
    ctx.fillStyle=`rgba(20,10,0,${clampmap(dist2d({x:TEX_SIZE/2,y:TEX_SIZE/2},bugs[i]),0,TEX_SIZE/2,2,0)})`;
    ctx.beginPath();
    ctx.arc(bugs[i].x, bugs[i].y, 0.01*TEX_SIZE ,0, 2 * Math.PI, false);
    ctx.fill();
  }
  
  if (rat < 0.5){
    bugs = [];
  }
  
}




function age_post(age,dst_canvas,mask_canvas,images,face_mesh){
  var ctx = dst_canvas.getContext("2d");
  var rat = calc_rat(age);
  
  function pt(i){
    return {x:face_mesh.geometry.vertices[i].x,y:HEIGHT-face_mesh.geometry.vertices[i].y}
  }
  
  if (rat > 0.4){
    for (var i = 0; i < teethmap.length; i++){
      if (teethmap[i] && Math.random() < 0.05){
        var p0 = pt(60);
        var p1 = pt(64)
        
        var q = locateTooth(p0,p1,i);
        q.v = 1;
        q.av = Math.random()*2-1;
        teeth.push(q)
        teethmap[i] = 0;
      }
    }
  }else{
    teethmap = teethmap.map((x)=>(1));
  }
  
  for (var i = teeth.length-1; i >=0; i--){
    
    ctx.fillStyle="white";
    
    ctx.save();
    ctx.globalAlpha = Noise.noise(i,teeth[i].y*0.5);
    ctx.translate(teeth[i].x,teeth[i].y);
    ctx.rotate(teeth[i].a);
    ctx.drawImage(images.tooth.data,-teeth[i].s/2,-teeth[i].s/2,teeth[i].s,teeth[i].s*1.2)
    // ctx.fillRect(-teeth[i].s/2,-teeth[i].s/2,teeth[i].s,teeth[i].s);
    ctx.restore();
    teeth[i].y += teeth[i].v;
    teeth[i].v += 1.5;
    teeth[i].a += 0.1*teeth[i].av;
    if (teeth[i].y > HEIGHT){
      teeth.splice(i,1)
    }
  }
  
  
  
  var filttext = "";
  
  if (rat > 0.7){
    var b = clampmap(rat,0.7,1,100,0)
    filttext += `brightness(${b}%) `;
  }
  if (rat > 0.6){
    var s = clampmap(rat,0.6,1,0,100)
    filttext += `sepia(${s}%) `
  }
  if (!filttext.length){
    filttext = "none";
  }
  ctx.filter = filttext;
  
  
}