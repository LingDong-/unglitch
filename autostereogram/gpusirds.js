/* global describe GPU */
var gpusirds = new function(){var that = this;
                             
  var W = 512;
  var H = 512;
  var DPI = 72;
                              
  var gpu = new GPU();
  var kernel;
                              
                              
                              
  that.setup = function(args){
    W = args.w;
    H = args.h;
    DPI = args.DPI || DPI;

    kernel = gpu.createKernel(function(Z) {
      const E = this.constants.E;
      const mu = this.constants.mu;
      const separation = function(z){return Math.round((1-mu*z)*E/(2-mu*z))};
      const far = separation(0);

      const h = this.constants.shape[0];
      const w = this.constants.shape[1];
      const c = this.constants.shape[2];
      
      const Z_at = function(x,y){Z[y*w*c+x*c]/255.0};
      var y = this.thread.y;

      var same = Array(w);
      var pix = Array(w);

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
            var k = same[left];
            while(1){
              if (k != left && k != right){
                break;
              }
              if (k < right){
                left = k;
              }else{
                left = right;
                right = k;
              }
              k = same[left];
            }
            same[left] = right;
            if (left != x - 45){
              console.log(x,left,right)
            }
          }
        }
      }
      for (var x = w-1; x>= 0; x--){
        if (same[x]==x){
          pix[x] = [Math.random(),Math.random(),Math.random()];
        }else{
          pix[x] = pix[same[x]];
        }
      }
      return pix;
    }).setOutput([H]).setConstants({
      E: Math.round(2.5*DPI),
      mu: (1/2.0),
    }).setLoopMaxIterations(W);
    
  }

  that.process = function(Z){
    kernel(Z);
  }             


}