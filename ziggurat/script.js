/* global describe testbed p5*/
var canvases = document.getElementById("canvases")
canvases.appendChild(testbed.test('UNI'));
canvases.appendChild(testbed.test('RNOR'));
canvases.appendChild(testbed.test('REXP'));

if (typeof p5 != undefined){
  /* global describe randomGaussian noLoop createCanvas*/
  function setup() {
    canvases.appendChild(testbed.test('RNOR',randomGaussian));
    noLoop();
    createCanvas(1,1);
  }
}
