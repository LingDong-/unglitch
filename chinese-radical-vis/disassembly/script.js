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


function renderChar_ (L,args){
  var args = (args != undefined) ?  args : {};
  var wid = (args.wid != undefined) ?  args.wid : 100;
  var hei = (args.hei != undefined) ?  args.hei : 100;
  var col = (args.col != undefined) ?  args.col : "black";

  var render = function(l,col){
    return "<rect x='0' y='0' width='"+wid+"' height='"+hei+"' stroke='"+"rgba(0,0,0,0.2)"+"' stroke-width='1' vector-effect='non-scaling-stroke' fill='none'></rect>"
      +
      l.map(x=>("<line x1='"+Math.round((x[0])*wid)+"' y1='"+Math.round((x[1])*hei)
                   +"' x2='"+Math.round((x[2])*wid)+"' y2='"+Math.round((x[3])*hei)+
                "' stroke='"+col+"' stroke-width='4' stroke-linecap='round' vector-effect='non-scaling-stroke'></line>")).join("")
      
  }
  var canv = ""
  canv +=render(parser.toLines(parser.toRects(L)),col)
  return canv
}

function parseTransform(str){
    if (str != null){
        var t = (str.match(/translate\((.+?)\)/) || [0,0])[1];
        var tx = t.split(" ")[0]
        var ty = t.split(" ")[1]
        var s = (str.match(/scale\((.+?)\)/) || [1,1])[1];
        var sx = s.split(" ")[0]
        var sy = s.split(" ")[1] || sx
    }else{
        var tx = 0;
        var ty = 0;
        var sx = 1;
        var sy = 1;
    }
    return {
        translateX:parseFloat(tx),
        translateY:parseFloat(ty),
        scaleX:parseFloat(sx),
        scaleY:parseFloat(sy),
    }
}
function buildTransform(trans){
    return "translate("+(trans.translateX || 0)+" "+(trans.translateY || 0)+
           ") scale("+(trans.scaleX || 1)+" "+(trans.scaleY || 1)+")"
}

function fromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild; 
}

function randcol(){
    var collist = ["red","green","blue","purple","orange","magenta"]
    return collist[Math.floor(Math.random()*collist.length)]
}

function animate(div,ast){
    var w = 600;
    var h = 600;
    var dt = 10;
    var T = 100;
    var spd = 0.1;
    var zspd = 10;
    var mw = w-100
    var zT = (mw-100)/zspd;
    var fT = 50;
    var pause = 2000;

    if (div.innerHTML != ""){
        console.log("div not empty!")
        return 0;
    }


    var main = document.createElement("svg");
    main.setAttribute("width",  w);
    main.setAttribute("height", h);
    main.setAttribute("viewBox","50 50 "+w+" "+h)
    var ret = _animate(main,w/2, h/2,ast);
    div.innerHTML = main.outerHTML;

    setTimeout(function(){
        var lines = div.getElementsByTagName("line")
        for (var i = 0; i < lines.length; i++){
            lines[i].setAttribute("stroke","black")
        }
        var rects = div.getElementsByTagName("rect")
        for (var i = 0; i < rects.length; i++){
            rects[i].setAttribute("stroke","none")
        }

        for (var i = 0; i < zT; i++){
            (function(){
                var t = i*zspd;
                setTimeout(function(){
                    div.firstChild.setAttribute("viewBox", (50+t/2)+" "+(50+t/2)+" "+(w-t)+" "+(h-t));
                }, i*dt);
            })()
        }
        for (var i = 0; i < fT; i++){
            (function(){
                var _i = i;
                var _lines = lines;
                setTimeout(function(){
                    for (var j = 0; j < _lines.length; j++){
                        _lines[j].style.animation="none";
                        _lines[j].style.opacity=""+(1-(_i)/(fT-1));
                    }
                }, i*dt+zT*dt+pause);
            })()
        }
        setTimeout(function(){
            div.innerHTML = ""
        },zT*dt+fT*dt+pause)
    },ret.depth*T*dt)

    return ret.depth*T*dt+zT*dt+fT*dt+pause;

    function _animate(div,x,y,ast){
        function randa(){
            return Math.random()
        }
        var id = Math.random().toString().slice(2);
        if (typeof(ast) == 'string'){
            var npos = {translateX:x, translateY:y, scaleX:1, scaleY:1}
            var ndiv = fromHTML("<g id='"+id+"' transform='"+buildTransform(npos)+"'>"+renderChar_(ast)+"</g>")
            div.appendChild(ndiv);
            return {id:id, depth:1}
        }else{
            var children = []
            var maxdepth = 0
            var npos = {translateX:x, translateY:y, scaleX:1, scaleY:1}
            var ndiv = fromHTML("<g id='"+id+"' transform='"+buildTransform(npos)+"'></g>")
            div.appendChild(ndiv)
            for (var i = 1; i < ast.length; i++){
                var p = 50*((i-1)/(ast.length-2)*2-1)*(ast.length-1);
                var ret;
                if (ast[0][0] == "|"){
                    ret = _animate(ndiv, 0, p, ast[i]);
                }else{
                    ret = _animate(ndiv, p, 0, ast[i]);
                }
                
                maxdepth = Math.max(maxdepth,ret.depth)
                children.push(ret.id)
            }
            
            for (var t = 0; t < T; t++){
                (function(){
                    var _children = children;
                    var _ast = ast;
                    var _t = t;
                    setTimeout(function(){  
                        var scl = 1/(_ast[0].length+1)
                        for (var i = 0; i < _children.length; i++){
                            var ofs = ((100/_children.length)*(i));
                            var elt = document.getElementById(_children[i]);

                            var trans = parseTransform(elt.getAttribute("transform"));

                            if (_ast[0][0] == "|"){
                                var sx = trans.scaleX * (1-spd) + 1 * spd
                                var sy = trans.scaleY * (1-spd) + scl * spd
                                var left = trans.translateX * (1-spd) + 0 * spd
                                var top = trans.translateY * (1-spd) + ofs * spd
                                elt.setAttribute("transform",buildTransform({translateX:left, translateY:top, scaleX:sx, scaleY:sy}))
                            }else{
                                var sx = trans.scaleX * (1-spd) + scl * spd
                                var sy = trans.scaleY * (1-spd) + 1 * spd
                                var left = trans.translateX * (1-spd) + ofs * spd
                                var top = trans.translateY * (1-spd) + 0 * spd
                                
                                elt.setAttribute("transform", buildTransform({translateX:left, translateY:top, scaleX:sx, scaleY:sy}))
                            }
                        }
                    },(maxdepth)*dt*T+_t*dt)}
                )()
            }
            return {id:id, depth:maxdepth+1}
        }
    }
}

//https://unicodebook.readthedocs.io/unicode_encodings.html
function decode_utf16_pair(units)
{
    function assert(b){if (!b){console.log("assertion failure")}}
    assert(0xD800 <= units[0] && units[0] <= 0xDBFF);
    assert(0xDC00 <= units[1] && units[1] <= 0xDFFF);
    var code = 0x10000;
    code += (units[0] & 0x03FF) << 10;
    code += (units[1] & 0x03FF);
    return code;
}

function prettyPinyin(s){
    var t = s.trim().toLowerCase().split('');
    var r = {"a":"āáǎàa","e":"ēéěèe","i":"īíǐìi","o":"ōóǒòo","u":"ūúǔù","v":"üǘǚǜü"}
    var n = parseInt(s[s.length-1]);
    var ia = t.indexOf("a"); var io = t.indexOf("o");
    var ie = t.indexOf("e"); var iu = t.indexOf("u");
    var ii = t.indexOf("i"); var iv = t.indexOf("v");
    var idx;
    if (ia != -1){idx = ia;}
    else if (ie != -1){idx = ie}
    else if (io != -1){idx = io}
    else if (iv != -1){idx = iv}
    else {if (iu > ii){idx = iu;}else{idx = ii;}}
    t[idx] = r[t[idx]][n-1];
    return t.slice(0,-1).join("")
}

function onload(){
    var firstChar = decodeURI(window.location.toString().split("?")[1]).toString()
    console.log(firstChar);
    loadJSON("https://raw.githubusercontent.com/LingDong-/rrpl/master/dist/min-trad-compiled.json",function(dict){
        function animateSequence(){
            var keys = Object.keys(dict)
            var char;
            if (firstChar != "undefined" && keys.includes(firstChar)){
                char = firstChar;
                firstChar = "undefined";
            }else{
                char = keys[Math.floor(Math.random()*keys.length)];
                firstChar = "undefined";
            }
            document.getElementById("char").innerHTML = char;
            document.getElementById("rrpl-code").innerHTML = dict[char];
            document.getElementById("defn").innerHTML += "...";
            var finishTime = animate(document.getElementById("main"),parser.parse(dict[char]))        
            console.log(finishTime)

            setTimeout(function(){
                console.log("next!");
                animateSequence()
            },finishTime+100)
        }
        animateSequence()
    })

    loadJSON("/chinese-radical-vis/glitch-assets/unihan-def.json",function(defs){
    loadJSON("/chinese-radical-vis/glitch-assets/unihan-pinyin.json",function(pinyins){
        function updateDef(){
            var char = document.getElementById("char").innerHTML
            if (char.length && document.getElementById("defn").innerHTML.endsWith("...")){
                var code;
                if (char.length == 2){
                    code = decode_utf16_pair([char.charCodeAt(0),char.charCodeAt(1)])
                }else{
                    code = char.charCodeAt(0);
                }
                var uc = code.toString(16).toUpperCase();
                var py;
                try{
                    py = pinyins[uc].split(" ").map((x)=>prettyPinyin(x)).join(", ");
                }catch(e){
                    py = "no pronounciation"
                }
                var df = defs[uc] || "no definition";
                document.getElementById("defn").innerHTML = "&nbsp;&nbsp;| "+py+" |&nbsp;&nbsp;<i>"+df+"</i>"
            }
            setTimeout(updateDef,100)
        }
        updateDef();
    })})


}

