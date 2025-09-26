print_info = function(t){postMessage({type:'info',data:t})};

importScripts('osmfrag.js'); 



onmessage = function(e) {
  if (e.data.cmd == 'make'){
    let result = branch();
    postMessage({type:'result',data:result});
  }
}