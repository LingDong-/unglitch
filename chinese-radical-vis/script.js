function onload(){
  document.getElementById("ipreview").contentWindow.scrollTo(0,110);

  var frame = 0;
  setInterval(function(){
    frame += 1;
    var d = 1
    if (Math.floor(frame/2200) % 2){
      d = -1
    }
    document.getElementById("imap").scrollTop += d;
    document.getElementById("imap").scrollLeft += d;
    
  },10)
  
  
  var directory = document.getElementById("directory");
  var cnt = 0;
  for (var k in dirs){
    cnt += 1;
    var div = document.createElement("div");
    div.classList.add("directory-item");
    if (cnt % 2){
      div.classList.add("odd-row");
    }else{
      div.classList.add("even-row");
    }
    (function(){
      var _k = k;
      div.onclick = function(){window.location = window.location+"/"+_k+"/index.html"}
    })()
    div.innerHTML = "<b>"+k+"</b>&nbsp;-&nbsp;<i>"+dirs[k]+"</i>";
    directory.appendChild(div)
  }
  
  
}