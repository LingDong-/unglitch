
function sirds(DPI, Z, rand){
  if (rand == undefined){
    rand = ()=>([
      Math.floor(Math.random()*256),
      Math.floor(Math.random()*256),
      Math.floor(Math.random()*256),
      255
    ])
  }

  const E = Math.round(2.5*DPI);
  const mu = (1/2.0);
  const separation = (z)=>(Math.round((1-mu*z)*E/(2-mu*z)))
  const far = separation(0);
  
  const [h,w,c] = Z.shape;
  const Z_at = (x,y)=>(Z.data[y*w*c+x*c]/255.0);

  var pixels = {
    shape:[h,w,4],
    data:new Uint8ClampedArray(h*w*4)
  }
  
  for (var y = 0; y < h; y++){
    
    var same = new Array(w);
    var pix = new Array(w);

    for (var x = 0; x < w; x++){
      same[x] = x;
    }
    for (var x = 0; x < w; x++){
      var s = separation(Z_at(x,y));
      var left = x-Math.floor((s+(s&y&1))/2);
      var right = Math.floor(left + s);
      
      if (0 <= left && right < w){
        var visible;
        var t = 1;
        var zt;
        do{
          zt = Z_at(x,y) + 2*(2 - mu* Z_at(x,y)) * t / (mu*E);
          visible = Z_at(x-t,y)<zt && Z_at(x+t,y)<zt;
          t++;
        }while(visible && zt < 1);

        if (visible){
          var k;
          for (k = same[left]; k != left && k != right; k = same[left]){
            if (k < right){
              left = k;
            }else{
              left = right;
              right = k;
            }
          }
          same[left] = right;
  
        }
      }
    }
    for (var x = w-1; x>= 0; x--){
      if (same[x]==x){
        pix[x] = rand(x,y);
      }else{
        pix[x] = pix[same[x]];
      }

      pixels.data[y*w*4+x*4+0] = pix[x][0];
      pixels.data[y*w*4+x*4+1] = pix[x][1];
      pixels.data[y*w*4+x*4+2] = pix[x][2];
      pixels.data[y*w*4+x*4+3] = pix[x][3];
    }
    
  }
  return Object.assign(pixels,{conv_dots:[
                               w/2-far/2,
                               w/2+far/2,
                               ]});
}