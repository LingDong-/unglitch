/*global describe gpusirds*/

const tex = document.createElement("canvas");
tex.width = 512;
tex.height = 512;
var ctx = tex.getContext('2d');


gpusirds.setup({w:512,h:512,DPI:36});


var x = 0;
function loop(){
  // requestAnimationFrame(loop);
  
  ctx.fillStyle="orange"
  ctx.fillRect(0,0,512,512);
  ctx.fillStyle="red"
  ctx.fillRect(10,10,200,200);
  ctx.fillStyle="blue"
  ctx.fillRect(x,30,20,20);

  gpusirds.process(tex);
  x++;
  
}
loop();