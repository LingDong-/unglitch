/*global describe glsirds*/
// (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

const tex = document.createElement("canvas");
tex.width = 512;
tex.height = 512;
var ctx = tex.getContext('2d');


var glcanv = glsirds.setup({w:512,h:512,DPI:36});
document.body.appendChild(glcanv);

var x = 0;
function loop(){
  requestAnimationFrame(loop);
  
  ctx.fillStyle="orange"
  ctx.fillRect(0,0,512,512);
  ctx.fillStyle="red"
  ctx.fillRect(10,10,200,200);
  ctx.fillStyle="blue"
  ctx.fillRect(x,30,20,20);

  glsirds.process(tex);
  x++;
  
}
loop();