/*global describe npy tf*/
var npyfile = undefined;
var tensor = undefined;
var SLICE = 100;

var inpdiv = document.createElement("div");
inpdiv.innerHTML += "Upload .npy file:&nbsp;";
var inp = document.createElement("input");
inp.type = "file";
inp.addEventListener('change', function(e){
  var reader = new FileReader();
  reader.onload = function(){
    npyfile= npy.frombuffer(reader.result);
    console.log("file loaded");
    var c = npyfile.shape[npyfile.shape.length-1];
    add_tr();
    if (c == 3){
      visualize_rgb();
    }else{
      visualize_gray_channels();
    }
    // add_tr();
  }
  reader.readAsArrayBuffer(e.target.files[0]);     
}, false);
inpdiv.appendChild(inp);
document.body.appendChild(inpdiv);

var table = document.createElement("table");
var tr;
document.body.appendChild(table);

function add_td(elt){
  tr.appendChild(elt);
}
function add_tr(){
  var _tr = document.createElement("tr");
  tr = document.createElement("td");
  _tr.appendChild(tr);
  table.appendChild(_tr);
}

function visualize_rgb(){
  var m = npyfile.shape[npyfile.shape.length-5] || 1
  var n = npyfile.shape[npyfile.shape.length-4] || 1
  var h = npyfile.shape[npyfile.shape.length-3] || 1
  var w = npyfile.shape[npyfile.shape.length-2] || 1
  
  if (npyfile.shape.length > 5){
    npyfile.data = npyfile.data.slice(0,m*n*h*w*3);
    console.log("5d only");
  }
  if (m == 1){
    [m,n]=[n,m];
  }
  m = Math.min(SLICE,m);
  npyfile.data = npyfile.data.slice(0,m*n*w*h*3);
  console.log("first",m);
  
  tensor = tf.tensor(new Float32Array(npyfile.data),[m,n,h,w,3]);
  console.log("tensor created");
  
  console.log(tensor.shape);
  var max = tensor.max().dataSync()[0];
  var min = tensor.min().dataSync()[0];
  
  console.log("min/max",min,max);
  tensor = tensor.sub(tf.scalar(min)).div(tf.scalar(max-min)).mul(tf.scalar(255));
  
  var alp = tf.fill([h,w],255);
  
  function vis_ith(i,j){
    tf.tidy(function(){
      var chans = tensor.slice([i,j],[1,1]).reshape([h,w,3]).unstack(2);
      var rgba = tf.stack([chans[0],chans[1],chans[2],alp],2);
      
      var pix = new Uint8ClampedArray(rgba.dataSync());
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      var imageData = ctx.getImageData(0,0,w,h);
      imageData.data.set(pix,0);
      ctx.putImageData(imageData,0,0);
      add_td(canvas); 

    })
    j += 1;
    if (j >= n){
      j = 0;
      i ++;
      if (n != 1){
        add_tr();
      }
    }
    if (i >= m){
      return;
    }
    setTimeout(function(){vis_ith(i,j)},10);
    
  }
  vis_ith(0,0);
}

function visualize_gray_channels(){


  var n = npyfile.shape[npyfile.shape.length-4] || 1
  var h = npyfile.shape[npyfile.shape.length-3] || 1
  var w = npyfile.shape[npyfile.shape.length-2] || 1
  var c = npyfile.shape[npyfile.shape.length-1] || 1

  if (npyfile.shape.length > 4){
    npyfile.data = npyfile.data.slice(0,n*h*w*c);
    console.log("4d only");
  }

  if (n == 1 && Math.abs(w-c) < Math.abs(h-w)){
    [n,h,w,c]=[h,w,c,1];
  }

  n = Math.min(SLICE,n);
  npyfile.data = npyfile.data.slice(0,n*w*h*c);
  console.log("first",n);

  tensor = tf.tensor(new Float32Array(npyfile.data),[n,h,w,c]);
  console.log("tensor created");

  console.log(tensor.shape);
  var max = tensor.max().dataSync()[0];
  var min = tensor.min().dataSync()[0];
  // var max = 255;
  // var min = 0;

  console.log("min/max",min,max);
  tensor = tensor.sub(tf.scalar(min)).div(tf.scalar(max-min)).mul(tf.scalar(255));

  var alp = tf.fill([h,w],255);

  console.log("visualization starting");

  function vis_ith(i){
    tf.tidy(function(){
      var chans = tensor.slice([i],[1]).reshape([h,w,c]).unstack(2);
      for (var j = 0; j < c; j++){
        // console.log(im.shape,chans[j].shape,alp.shape)
        var ch = tf.stack([chans[j],chans[j],chans[j],alp],2);
        var pix = new Uint8ClampedArray(ch.dataSync());
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        var imageData = ctx.getImageData(0,0,w,h);
        // console.log(pix);
        imageData.data.set(pix,0);
        ctx.putImageData(imageData,0,0);
        add_td(canvas); 
      }
    })
    if (c != 1){
      add_tr();
    }
    if (i+1 < n){
      setTimeout(function(){vis_ith(i+1)},10);
    }
  }
  vis_ith(0);

}