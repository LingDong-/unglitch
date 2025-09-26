
function segdist(s0,s1){
    return Math.pow(s0[0]-s1[0],2)+Math.pow(s0[1]-s1[1],2)+Math.pow(s0[2]-s1[2],2)+Math.pow(s0[3]-s1[3],2)
}
function seglerp(s0,s1,t){
    return [
        s0[0] * (1-t) + s1[0] * t,
        s0[1] * (1-t) + s1[1] * t,
        s0[2] * (1-t) + s1[2] * t,
        s0[3] * (1-t) + s1[3] * t,
    ]
}

function match(g0,g1){
    // console.log(g0.length,g1.length)
    var ds = []
    for (var i = 0; i < g0.length; i++){
        for (var j = 0; j < g1.length; j++){
            ds.push([segdist(g0[i],g1[j]),[i,j]])
        }
    }
    ds.sort((x,y)=>(x[0]-y[0]))
    // console.log(ds)

    var matched = []
    for (var i = 0; i < ds.length; i++){
        var found = false;
        for (var j = 0; j < matched.length; j++){
            if (ds[i][1][0] == matched[j][1][0] || ds[i][1][1] == matched[j][1][1]){
                found = true;
                break;
            }
        }
        if (!found){
            matched.push(ds[i])
        }
    }
    // console.log(matched.length)
    // console.log(matched)
    
    var unmatched = [[],[]];

    for (var k = 0; k < 2; k++){
        var g = ([g0,g1])[k]
        for (var i = 0; i < g.length; i++){
            var found = false;
            for (var j = 0; j < matched.length; j++){
                if (matched[j][1][k] == i){
                    // console.log(matched[j],i)
                    found = true;
                    break;
                }
            }
            if (!found){
                var d = Infinity
                var other = -1;
                for (var j = 0; j < ds.length; j++){
                    if (ds[j][1][k] == i){
                        d = ds[j][0];
                        other = ds[j][1][!k+0]
                        break
                    }
                }
                var r = []
                r[k] = i;
                r[!k+0] = other;
                unmatched[k].push([d,r])
            }
        }
    }
    function fmt(X){
        return X.map((x)=>({distance:x[0],pair:x[1]}))
    }
    return {
        distance:(matched.reduce((acc,curr)=>(acc+curr[0]),0)
                +unmatched[0].reduce((acc,curr)=>(acc+curr[0]),0)
                +unmatched[1].reduce((acc,curr)=>(acc+curr[0]),0))
                /(matched.length+unmatched[0].length+unmatched[1].length),
        morph:fmt(matched),
        merge:fmt(unmatched[0]),
        replicate:fmt(unmatched[1]),
    }
}

function xformmatch(g0,g1,w){
    if (w == undefined){w = 5}
    var m = Infinity;
    var bx = 0;
    var by = 0;
    var best = {};
    for (var x = -50; x < 50; x+=w){
        for (var y = -50; y < 50; y+=w){
            var g = g1.map((a)=>([a[0]+x,a[1]+y,a[2]+x,a[3]+y]))
            var ret = match(g0,g);
            if (ret.distance < m){
                best = ret;
                m = ret.distance;
                bx = x;
                by = y;
            }
        }
    }
    return {x:bx,y:by,match:best};

}


function morph(g0,g1,mat){
    var mat = mat || xformmatch(g0,g1).match;
    var G0 = g0.slice();
    var G1 = g1.slice();
    for (var i = 0; i < mat.replicate.length; i++){
        G0.push(g0[mat.replicate[i].pair[0]])
        mat.replicate[i].pair[0] = G0.length-1;
    }
    for (var i = 0; i < mat.merge.length; i++){
        G1.push(g1[mat.merge[i].pair[1]])
        mat.merge[i].pair[1] = G1.length-1;
    }
    var all = mat.morph.concat(mat.merge).concat(mat.replicate)
    var lookup = {};
    for (var i = 0; i < G0.length; i++){
        for (var j = 0; j < all.length; j++){
            if (all[j].pair[0] == i){
                lookup[i] = all[j].pair[1];
            }
        }
    }
    function morpher(t){
        var result = [];
        for (var i = 0; i < G0.length; i++){
            result.push(seglerp(G0[i],G1[lookup[i]],t));
        }
        return result;
    }
    return morpher
}


function drawsvg(g){
    var result = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='-2 -2 104 104'>"
    for (var i = 0; i < g.length; i++){
        result += `<line x1="${g[i][0]}" y1="${g[i][1]}" x2="${g[i][2]}" y2="${g[i][3]}" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"/>`
    }
    result += "</svg>"
    return result;
}


try{
    module.exports = {
        segdist:segdist,
        seglerp:seglerp,
        match:match,
        xformmatch:xformmatch,
        drawsvg:drawsvg,
        morph:morph,
    }
}catch(e){
    console.log("not node.")
}