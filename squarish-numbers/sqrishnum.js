function factorize(n){
  if (n == 0){
    return [0]
  }
  for (var i = 2; i <= Math.sqrt(n); i++){
    var d = n/i;
    if (d==~~d){
      return [i].concat(factorize(d))
    }
  }
  return [n]
}

function partition(a){
  if (!a.length){
    return [[[],[]]]
  }
  if (a.length ==1){
    return [[[a[0]],[]]]
  }
  var ps = partition(a.slice(1))
  var qs = []
  for (var i = 0; i < ps.length; i++){
    qs.push([[a[0]].concat(ps[i][0]), ps[i][1] ])
    qs.push([ps[i][0], [a[0]].concat(ps[i][1]) ])
  }
  return qs;
}

function squarish(n,outFacts=null){
  var facts = factorize(n);
  if (outFacts){
    for (var i = 0; i < facts.length; i++){
      outFacts.push(facts[i]);
    }
  }
  var parts = partition(facts);
  var cands = []
  for (var i = 0; i < parts.length; i++){
    var x = 1;
    for (var j = 0; j < parts[i][0].length; j++){
      x *= parts[i][0][j]
    }
    var y = 1;
    for (var j = 0; j < parts[i][1].length; j++){
      y *= parts[i][1][j]
    }
    cands.push([x,y,Math.abs(x-y)])
  }
  cands.sort(function(a,b){
    return a[2]-b[2]
  })
  // console.log(cands)
  return cands[0].slice(0,2);

}
