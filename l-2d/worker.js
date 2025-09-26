/*global describe run_all*/
importScripts('symbols.js','parser.js');

onmessage = function(e) {
  let paper = e.data;
  // console.log(paper);
  try{
    let result = run_all(paper);
    postMessage(result);
  }catch(e){
    postMessage({});
  }
}