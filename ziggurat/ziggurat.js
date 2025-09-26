var ziggurat = new (function() {
/* 
 * ziggurat.js
 *
 * A JS Implementation of Ziggurat algorithm
 * for generating gaussian and exponential randomness
 *
 * Translated from C code in the original paper:
 * Marsaglia and Tsang, The Ziggurat Method for Generating Random Variables
 * https://core.ac.uk/download/pdf/6287927.pdf
 *
 * Usage:
 *
 * // (optional) seed the RNG (SHR3), put -1 to replace SHR3 with 
 * // Math.random() (which is not seedable, but is a better RNG)
 * // zigset(-1) is called by default upon loading this script
 * ziggurat.zigset(12345);
 *
 * ziggurat.RNOR();  // gaussian (standard normal) randomness (-inf,inf)
 * ziggurat.REXP();  // exponential randomness (0,inf)
 *
 * ported by Lingdong Huang 2019
 */
  var iz;
  var jz;
  var jsr = 123456789;
  var kn = new Array(128);
  var ke = new Array(256);
  var hz;
  var wn = new Array(128);
  var fn = new Array(128);
  var we = new Array(256);
  var fe = new Array(256);

  var SHR3 = function() {
    jz = jsr;
    jsr ^= jsr << 13;
    jsr ^= jsr >> 17;
    jsr ^= jsr << 5;
    return (jz + jsr);
  };

  var UNI = function() {
    return 0.5 + (SHR3()<<0) * 0.2328306e-9;
  };

  var RNOR = function() {
    hz = SHR3();
    iz = hz & 127;
    return Math.abs(hz) < kn[iz] ? hz * wn[iz] : nfix();
  };
  var REXP = function() {
    jz = SHR3()>>>0;
    iz = jz & 255;
    return jz < kn[iz] ? jz * we[iz] : efix();
  };

  var nfix = function() {
    var r = 3.44262;
    var x, y;
    var u1, u2;
    for (;;) {
      x = hz * wn[iz];
      if (iz == 0) {
        do {
          u1 = UNI();
          u2 = UNI();
          x = -Math.log(u1) * 0.2904764;
          y = -Math.log(u2);
        } while (y + y < x * x);
        return (hz > 0) ? (r + x) : (- r - x);
      }

      if (fn[iz] + UNI() * (fn[iz - 1] - fn[iz]) < Math.exp(-0.5 * x * x)) {
        return x;
      }
      hz = SHR3();
      iz = hz & 127;
      if (Math.abs(hz) < kn[iz]) {
        return hz * wn[iz];
      }
    }
    
  };

  var efix = function() {
    var x;
    for (;;) {
      if (iz == 0) {
        return 7.69711 - Math.log(UNI());
      }
      x = jz * we[iz];
      if (fe[iz] + UNI() * (fe[iz - 1] - fe[iz]) < Math.exp(-x)) {
        return x;
      }
      jz = SHR3();
      iz = jz & 255;
      if (jz < ke[iz]) {
        return jz * we[iz];
      }
    }
  };

  var _use_js_default_rng = function(){
    SHR3 = ()=>Math.floor(Math.random()*4294967296-2147483648);
    UNI = ()=>Math.random();
  }
  
  var zigset = function(jsrseed) {
    if (jsrseed == -1){
      _use_js_default_rng();
    }
    var m1 = 2147483648;
    var m2 = 4294967296;
    var dn = 3.442619855899;
    var tn = dn;
    var vn = 9.91256303526217e-3;
    var q;
    var de = 7.697117470131487;
    var te = de;
    var ve = 3.949659822581572e-3;
    var i;
    jsr = jsrseed;
    /* Tables for RNOR */
    q = vn / Math.exp(-0.5 * dn * dn);
    kn[0] = Math.floor((dn / q) * m1);
    kn[1] = 0;
    wn[0] = q / m1;
    wn[127] = dn / m1;
    fn[0] = 1;
    fn[127] = Math.exp(-0.5 * dn * dn);
    for (i = 126; i >= 1; i--) {
      dn = Math.sqrt(-2 * Math.log(vn / dn + Math.exp(-0.5 * dn * dn)));
      kn[i + 1] = Math.floor((dn / tn) * m1);
      tn = dn;
      fn[i] = Math.exp(-0.5 * dn * dn);
      wn[i] = dn / m1;
    }
    /*Tables for REXP */
    q = ve / Math.exp(-de);
    ke[0] = Math.floor((de / q) * m2);
    ke[1] = 0;
    we[0] = q / m2;
    we[255] = de / m2;
    fe[0] = 1;
    fe[255] = Math.exp(-de);
    for (i = 254; i >= 1; i--) {
      de = -Math.log(ve / de + Math.exp(-de));
      ke[i + 1] = Math.floor((de / te) * m2);
      te = de;
      fe[i] = Math.exp(-de);
      we[i] = de / m2;
    }
  };

  zigset(-1);
  
  this.SHR3 = SHR3;
  this.UNI = UNI;
  this.RNOR = RNOR;
  this.REXP = REXP;
  this.zigset = zigset;
  
})();


if (typeof module !== 'undefined' && module.exports) {
  module.exports = ziggurat;
}