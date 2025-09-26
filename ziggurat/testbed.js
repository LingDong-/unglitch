/* global describe ziggurat */

var testbed = new function(){
  var batch = 10;

  function stdnormal(x){
    const sqrt2pi = 2.5066282746
    return Math.exp(-x*x/2)/sqrt2pi;
  }

  var stdnormal0 = stdnormal(0)

  this.test = function(func_type, func){
    if (func == undefined){
      func = ziggurat[func_type];
    }
    var canv = document.createElement("canvas");
    canv.width = 200;
    canv.height = 200;
    var ctx = canv.getContext('2d');

    var bins = new Array(200).fill(0);

    function drawbins(){
      ctx.fillStyle="white";
      ctx.fillRect(0,0,200,200);
      ctx.fillStyle="grey";
      var m = bins.filter(x=>!isNaN(x)).reduce((x,y)=>(Math.max(x,y)),0);
      var n = bins.filter(x=>!isNaN(x)).reduce((x,y)=>(x+y),0);
      for (var i = 0; i < bins.length; i++){
        var h = bins[i]/m*190;
        ctx.fillRect(i,200-h,1,h);
      }
      ctx.fillStyle="red";
      for (var i = 0; i < bins.length; i++){
        var h = {
          UNI:()=>190,
          RNOR:()=>stdnormal((i-100)/10)/stdnormal0*190,
          REXP:()=>Math.exp(-i/20)*190,
        }[func_type]();
        ctx.fillRect(i,200-h,1,1);
      }
      ctx.fillStyle="black";
      ctx.fillText(`${func_type}, ${n} samples`,0,10);
    }
    function step(){
      for (var i = 0; i < batch; i++){
        var r = func();

        var b = {
          UNI:()=>Math.floor(Math.min(Math.max(r,0),1)*200),
          RNOR:()=>Math.floor(Math.min(Math.max(r,-10),10)*10)+100,
          REXP:()=>Math.floor(Math.min(Math.max(r,0),10)*20),
        }[func_type]();

        if (isNaN(b) || isNaN(r)){
          console.log(`NaN detected in ${func_type} output!`);
        }
        bins[b]++;
      }
      
      drawbins();
      setTimeout(step, 0.1);
    }
    step();
    return canv;
  }
}
