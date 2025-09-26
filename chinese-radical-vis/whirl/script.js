
function loadJSON(filename,callback) {   
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', filename, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(JSON.parse(xobj.responseText));
    }
  };
  xobj.send(null);  
}

function find(arr,id){
    for (var i = 0; i < arr.length; i++){
        if (arr[i].id == id){
            return arr[i]
        }
    }
}

eval(one2polylines.toString().replace("Math.PI/4","0.01"))

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function onload(){
    loadJSON("https://raw.githubusercontent.com/LingDong-/rrpl/master/dist/min-trad-compiled.json",function(dict){
    var main = document.getElementById("main")
    main.width = Math.min(Math.max(1000,window.innerWidth/2),window.innerWidth);
    main.height = Math.min(Math.max(900,window.innerHeight/2),window.innerHeight);
    main.style.display = "block";
    main.style.margin = "auto";

    var context = main.getContext("2d")

    var words = []
    var keys = Object.keys(dict)
    var cursor = 0;
    var edge = main.width;
    var slots = []
    var w = 50;
    var strokes = []
    var adv = 1;
    var spd = 2;

    for (var i = 0; i < 3200; i++){
        var id = Math.random().toString().slice(2)
        var div = document.createElement("div");
        strokes.push({id:id,x0:0,y0:0,x1:0,y1:0,target:[-1,-1]})
    }

    function update(){
        context.fillStyle="white";
        context.fillRect(0,0,main.width,main.height);
        context.strokeStyle="black";
        context.lineWidth=2;
        cursor -= adv;
        if (edge > cursor){
            for (var i = 0; i < Math.floor(window.innerHeight/w)*w; i+=w){
                if (!words.length){
                    words = corpus.split("");
                }
                var char = words.shift();
                var polylines = one2polylines(dict[char]);
                
                //var lines = parser.toLines(parser.toRects(parser.parse(dict[char])));
                var lines = polylines.map((x)=>([x[0][0],x[0][1],x[1][0],x[1][1]]))
                var filled = []
                for (var j = 0; j < lines.length; j++){
                    filled.push("empty")
                }
                var id = Math.random().toString().slice(2);
            
                slots.push({x:edge,y:i,id:id,char:char,lines:lines,filled:filled})
            }
            edge -= w;
        }

        for (var i =slots.length-1; i >= 0; i--){
            
            var x = slots[i].x-cursor

            if (x > main.width-w*2){
                for (var j = 0; j < slots[i].filled.length; j++){
                    if (slots[i].filled[j] != "empty"){
                        find(strokes,slots[i].filled[j]).target = [-1,-1];
                    }
                }

                slots.splice(i,1);
            }
        }

        var unfilled = []
        for (var i = 0; i < slots.length; i++){
            for (var j = 0; j < slots[i].filled.length; j++){
                if (slots[i].filled[j] == "empty"){
                    unfilled.push([i,j])
                }
            }
        }
        shuffle(unfilled);
        
        for (var i = 0; i < strokes.length; i++){
            if (strokes[i].target[0] == -1 && unfilled.length){
                var pp = unfilled.pop()
                strokes[i].target = [slots[pp[0]].id,pp[1]]
                slots[pp[0]].filled[pp[1]] = strokes[i].id;
            }
            
            var tx0; var ty0; var tx1; var ty1;
            if (strokes[i].target[0] != -1){
                var trect = find(slots,strokes[i].target[0])
                if (trect == undefined){
                    strokes[i].target = [-1,-1]
                }else{
                    var xf = trect.x-cursor;
                    var yf = trect.y;
                    var tline = trect.lines[strokes[i].target[1]]
                    tx0 = xf + (tline[0]*0.8+0.1) * w;
                    ty0 = yf + (tline[1]*0.8+0.1) * w;
                    tx1 = xf + (tline[2]*0.8+0.1) * w;
                    ty1 = yf + (tline[3]*0.8+0.1) * w;
                }
            }
            if (strokes[i].target[0] == -1){
                tx0 = 0;
                ty0 = strokes[i].y0;
                tx1 = 0;
                ty1 = strokes[i].y1;
            }
            function moveToward(x,y,tx,ty){
                var a = Math.atan2(ty-y,tx-x);
                var d = Math.sqrt(Math.pow(tx-x,2)+Math.pow(ty-y,2))
                var r = Math.min(d,spd)
                return {x: x+r*Math.cos(a), y:y+r*Math.sin(a)}
            }
            var p0 = moveToward(strokes[i].x0, strokes[i].y0, tx0, ty0)
            var p1 = moveToward(strokes[i].x1, strokes[i].y1, tx1, ty1)

            strokes[i].x0 = p0.x
            strokes[i].y0 = p0.y
            strokes[i].x1 = p1.x
            strokes[i].y1 = p1.y

            // console.log(strokes[i])
            // return;
            
            context.beginPath();
            context.moveTo(strokes[i].x0,strokes[i].y0)
            context.lineTo(strokes[i].x1,strokes[i].y1)
            context.stroke();
        }
        // console.log(strokes)
        setTimeout(update,1)
    }
    update();


})}

