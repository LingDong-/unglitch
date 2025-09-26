
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

function node_info(dict, char){
    var code = dict[char].replace(/[012345678\|\-\(\)]/g,'')
    if (code.length == 0){
        return {children:[],leaves:[char],leafSetSize:1}
    }
    var coms = []
    for (var i = 0; i < code.length; i++){
        if (i < code.length-1){
            if (0xD800 <= code[i].charCodeAt(0) && code[i].charCodeAt(0) <= 0xDBFF &&
                0xDC00 <= code[i+1].charCodeAt(0) && code[i+1].charCodeAt(0) <= 0xDFFF){
                coms.push(code[i]+code[i+1])
                i += 1;
                continue;
            }
        }
        coms.push(code[i])
    }
    var leaves = [];
    for (var i = 0; i < coms.length; i++){
        leaves = leaves.concat( node_info(dict,coms[i]).leaves )
    }
    return {children:coms, leaves:leaves, leafSetSize: (new Set(leaves)).size};
}

function reference_count(dict, chars){
    var result = {}
    for (var i = 0; i < chars.length; i++){
        result[chars[i]] = {asChild:0, asLeaf:0}
    }
    for (var k in dict){
        var info = node_info(dict,k);
        for (var i = 0; i < info.children.length; i++){
            if (info.children[i] in result){
                result[info.children[i]].asChild += 1;   
            }
        }
        for (var i = 0; i < info.leaves.length; i++){
            if (info.leaves[i] in result){
                result[info.leaves[i]].asLeaf += 1;
            }
        }
    }
    return result
}

function find(arr,char){
    for (var i = 0; i < arr.length; i++){
        if (arr[i].character == char){
            return arr[i]
        }
    }
}

function activate(board,elt){
    var char = elt.innerHTML;
    var info = find(board,char);
    for (var i = 0; i < info.children.length; i++){
        if (find(board,info.children[i]) == undefined){
            continue;
        }
        var celt = document.getElementById(info.children[i]);
        var eelt = document.getElementById(char+info.children[i])
        celt.classList.add("hover");
        eelt.classList.add("hover");
        // var top = Math.max(window.scrollY,parseInt(celt.style.top))+"px"
        // celt.style.top = top;
        activate(board,celt);
    }
}
function deactivate(board,elt){
    var char = elt.innerHTML;
    var info = find(board,char);
    for (var i = 0; i < info.children.length; i++){
        if (find(board,info.children[i]) == undefined){
            continue;
        }
        var celt = document.getElementById(info.children[i]);
        var eelt = document.getElementById(char+info.children[i])
        celt.classList.remove("hover");
        eelt.classList.remove("hover");
        deactivate(board,celt);
    }    
}


function visualize(dict,chars){
    var maindiv = document.getElementById("main");

    var cols = Math.floor((window.innerWidth/0.85-20)/20);
    var board = []
    var refcnt = reference_count(dict,chars)
    for (var i = 0; i < chars.length; i++){
        board.push(Object.assign({character:chars[i]},node_info(dict,chars[i])));
    }
    board.sort((x,y)=>(x.leafSetSize-y.leafSetSize))
    for (var i = 0; i < board.length; i++){
        board[i].x = 20+(i % cols) * 20;
        board[i].y = 20+(Math.floor(i / cols)) * 20;
    }
    // var result = "<svg http://www.w3.org/2000/svg width='1000px' height='1000px'>"
    for (var i = 0; i < board.length; i++){
        var children = board[i].children
        for (var j = 0; j < children.length; j++){
            var x1 = board[i].x
            var y1 = board[i].y
            var c = find(board,children[j])
            if (c == undefined){
                continue
            }
            var x2 = c.x;
            var y2 = c.y;
            var div = document.createElement("div");
            div.classList.add("node-edge");
            div.id = board[i].character+children[j];
            div.style.left = x1;
            div.style.top = y1;
            div.style.width = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))+"px";
            var ang = Math.atan2(y2-y1,x2-x1)*180/Math.PI
            div.style.transform = "rotate("+ang+"deg)"
            maindiv.appendChild(div)
            // result += "<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='rgba(0,0,0,0.2)'/>"
        }
    }
    // result += "</svg>"
    // maindiv.innerHTML += result;
    for (var i = 0; i < board.length; i++){
        var div = document.createElement("div");
        div.classList.add("node-text");
        div.style.left = board[i].x+"px";
        div.style.top = board[i].y+"px";
        div.id = board[i].character;
        div.innerHTML = board[i].character;
        div.onmouseenter = function(){event.stopPropagation();activate(board,this);}
        div.onmouseleave = function(){event.stopPropagation();deactivate(board,this);}
        maindiv.appendChild(div);
    }
}
function onload(){
    loadJSON("https://raw.githubusercontent.com/LingDong-/rrpl/master/rrpl.json",function(dict){
    // console.log(dict)
    visualize(dict,Object.keys(dict).slice());


})}

