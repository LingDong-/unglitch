var gridW = 24;
var nRow = 32;
var nCol = 37;

var ColSymbol = "天地玄黃宇宙洪荒日月盈昃星宿列張寒來暑往秋收冬藏閏餘成歲律召調陽雲騰致雨露";
var RowSymbol = "一二三四五六七八九十甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥";
    

var Turn = 'red';

var Symbol = {
  'redpwn':'兵','blkpwn':'卒',
  'redcnn':'炮','blkcnn':'砲',
  'redknt':'傌','blkknt':'馬',
  'redelt':'相','blkelt':'象',
  'redadv':'仕','blkadv':'士',
  'redgnl':'帥','blkgnl':'將',
  'redrok':'俥','blkrok':'車',
  'redkin':'王','blkkin':'君',
}

var winSymbol = {
  'red':'紅勝',
  'blk':'黑勝',
}

var Color = {
  'red':'darkred',
  'blk':'black',
  'nil':'gray',
}

var Foe = {
  'red':'blk',
  'blk':'red',
  'nil':'red',
}

var Forward = {
  'red':-1,
  'blk':1,
}

var State = {};

State.red = [
  {side:'red',type:'pwn',pos:[ 0,17]},
  {side:'red',type:'pwn',pos:[ 2,17]},
  {side:'red',type:'pwn',pos:[ 4,17]},
  {side:'red',type:'pwn',pos:[ 6,17]},
  {side:'red',type:'pwn',pos:[ 8,17]},
  {side:'red',type:'pwn',pos:[10,17]},
  {side:'red',type:'pwn',pos:[12,17]},
  {side:'red',type:'pwn',pos:[14,17]},
  {side:'red',type:'pwn',pos:[16,17]},
  {side:'red',type:'pwn',pos:[18,17]},
  {side:'red',type:'pwn',pos:[20,17]},
  {side:'red',type:'pwn',pos:[22,17]},
  {side:'red',type:'pwn',pos:[24,17]},
  {side:'red',type:'pwn',pos:[26,17]},
  {side:'red',type:'pwn',pos:[28,17]},
  {side:'red',type:'pwn',pos:[30,17]},
  {side:'red',type:'pwn',pos:[32,17]},
  {side:'red',type:'pwn',pos:[34,17]},
  {side:'red',type:'pwn',pos:[36,17]},
  
  {side:'red',type:'pwn',pos:[ 0,19]},
  {side:'red',type:'pwn',pos:[ 2,19]},
  {side:'red',type:'pwn',pos:[ 4,19]},
  {side:'red',type:'pwn',pos:[ 6,19]},
  {side:'red',type:'pwn',pos:[ 8,19]},
  {side:'red',type:'pwn',pos:[10,19]},
  {side:'red',type:'pwn',pos:[12,19]},
  {side:'red',type:'pwn',pos:[14,19]},
  {side:'red',type:'pwn',pos:[16,19]},
  {side:'red',type:'pwn',pos:[18,19]},
  {side:'red',type:'pwn',pos:[20,19]},
  {side:'red',type:'pwn',pos:[22,19]},
  {side:'red',type:'pwn',pos:[24,19]},
  {side:'red',type:'pwn',pos:[26,19]},
  {side:'red',type:'pwn',pos:[28,19]},
  {side:'red',type:'pwn',pos:[30,19]},
  {side:'red',type:'pwn',pos:[32,19]},
  {side:'red',type:'pwn',pos:[34,19]},
  {side:'red',type:'pwn',pos:[36,19]},
  
  {side:'red',type:'knt',pos:[ 0,21]},
  {side:'red',type:'knt',pos:[ 2,21]},
  {side:'red',type:'knt',pos:[ 4,21]},
  {side:'red',type:'knt',pos:[ 6,21]},
  {side:'red',type:'knt',pos:[ 8,21]},
  {side:'red',type:'knt',pos:[10,21]},
  {side:'red',type:'knt',pos:[12,21]},
  {side:'red',type:'knt',pos:[14,21]},
  {side:'red',type:'knt',pos:[16,21]},
  {side:'red',type:'knt',pos:[18,21]},
  {side:'red',type:'knt',pos:[20,21]},
  {side:'red',type:'knt',pos:[22,21]},
  {side:'red',type:'knt',pos:[24,21]},
  {side:'red',type:'knt',pos:[26,21]},
  {side:'red',type:'knt',pos:[28,21]},
  {side:'red',type:'knt',pos:[30,21]},
  {side:'red',type:'knt',pos:[32,21]},
  {side:'red',type:'knt',pos:[34,21]},
  {side:'red',type:'knt',pos:[36,21]},
  
  {side:'red',type:'cnn',pos:[ 1,23]},
  {side:'red',type:'cnn',pos:[ 7,23]},
  {side:'red',type:'cnn',pos:[ 9,23]},
  {side:'red',type:'cnn',pos:[17,23]},
  {side:'red',type:'cnn',pos:[19,23]},
  {side:'red',type:'cnn',pos:[27,23]},
  {side:'red',type:'cnn',pos:[29,23]},
  {side:'red',type:'cnn',pos:[35,23]},
  
  {side:'red',type:'cnn',pos:[ 4,25]},
  {side:'red',type:'cnn',pos:[12,25]},
  {side:'red',type:'cnn',pos:[24,25]},
  {side:'red',type:'cnn',pos:[32,25]},
  
  {side:'red',type:'adv',pos:[15,25]},
  {side:'red',type:'adv',pos:[17,25]},
  {side:'red',type:'adv',pos:[19,25]},
  {side:'red',type:'adv',pos:[21,25]},
  {side:'red',type:'adv',pos:[15,27]},
  {side:'red',type:'adv',pos:[17,27]},
  {side:'red',type:'adv',pos:[19,27]},
  {side:'red',type:'adv',pos:[21,27]},
  {side:'red',type:'adv',pos:[15,29]},
  {side:'red',type:'adv',pos:[17,29]},
  {side:'red',type:'adv',pos:[19,29]},
  {side:'red',type:'adv',pos:[21,29]},
  {side:'red',type:'adv',pos:[15,31]},
  {side:'red',type:'adv',pos:[17,31]},
  {side:'red',type:'adv',pos:[19,31]},
  {side:'red',type:'adv',pos:[21,31]},

  {side:'red',type:'rok',pos:[ 0,27]},
  {side:'red',type:'knt',pos:[ 1,27]},
  {side:'red',type:'elt',pos:[ 2,27]},
  {side:'red',type:'adv',pos:[ 3,27]},
  {side:'red',type:'gnl',pos:[ 4,27]},
  {side:'red',type:'adv',pos:[ 5,27]},
  {side:'red',type:'elt',pos:[ 6,27]},
  {side:'red',type:'knt',pos:[ 7,27]},
  {side:'red',type:'rok',pos:[ 8,27]},
  {side:'red',type:'knt',pos:[ 9,27]},
  {side:'red',type:'elt',pos:[10,27]},
  {side:'red',type:'adv',pos:[11,27]},
  {side:'red',type:'gnl',pos:[12,27]},
  {side:'red',type:'adv',pos:[13,27]},
  {side:'red',type:'elt',pos:[14,27]},
  
  {side:'red',type:'elt',pos:[22,27]},
  {side:'red',type:'adv',pos:[23,27]},
  {side:'red',type:'gnl',pos:[24,27]},
  {side:'red',type:'adv',pos:[25,27]},
  {side:'red',type:'elt',pos:[26,27]},
  {side:'red',type:'knt',pos:[27,27]},
  {side:'red',type:'rok',pos:[28,27]},
  {side:'red',type:'knt',pos:[29,27]},
  {side:'red',type:'elt',pos:[30,27]},
  {side:'red',type:'adv',pos:[31,27]},
  {side:'red',type:'gnl',pos:[32,27]},
  {side:'red',type:'adv',pos:[33,27]},
  {side:'red',type:'elt',pos:[34,27]},
  {side:'red',type:'knt',pos:[35,27]},
  {side:'red',type:'rok',pos:[36,27]},
  
  // {side:'red',type:'adv',pos:[ 4,28]},
  // {side:'red',type:'adv',pos:[12,28]},
  // {side:'red',type:'adv',pos:[24,28]},
  // {side:'red',type:'adv',pos:[32,28]},
  
  {side:'red',type:'elt',pos:[18,29]},
  {side:'red',type:'elt',pos:[14,31]},
  {side:'red',type:'elt',pos:[16,31]},
  {side:'red',type:'elt',pos:[20,31]},
  {side:'red',type:'elt',pos:[22,31]},
  
  {side:'red',type:'knt',pos:[13,31]},
  {side:'red',type:'knt',pos:[23,31]},
  
  {side:'red',type:'rok',pos:[ 0,31]},
  {side:'red',type:'rok',pos:[ 4,31]},
  {side:'red',type:'rok',pos:[ 8,31]},
  {side:'red',type:'rok',pos:[12,31]},
  {side:'red',type:'rok',pos:[24,31]},
  {side:'red',type:'rok',pos:[28,31]},
  {side:'red',type:'rok',pos:[32,31]},
  {side:'red',type:'rok',pos:[36,31]},
  
  {side:'red',type:'kin',pos:[18,31]},
];





function reflectY(y){
  return 31-y;
}

// for (var i = State.red.length-1; i>=0; i--){
//   if (State.red[i].pos[0] > 10 && State.red[i].type != 'kin' && State.red[i].type != 'elt'){
//     State.red.splice(i,1);
//   }
  
// }



State.blk = [];
for (var i = 0; i < State.red.length; i++){
  State.blk.push({
    side:'blk',
    type:State.red[i].type,
    pos:[State.red[i].pos[0],reflectY(State.red[i].pos[1])]
  });
}

// for (var i = 0; i < State.red.length; i++){
//   if (State.red[i].type != 'gnl' && State.red[i].type != 'kin'){
//     State.red[i].type='rok';
//   }
// }

// for (var i = 0; i < State.blk.length; i++){
//   if (State.blk[i].type != 'gnl' && State.blk[i].type != 'kin'){
//     State.blk[i].type='cnn';
//   }
// }


var History = [{desc:"開局",side:'nil',state:State}];

function drawMovement(piece,x,y){
  var cont = document.getElementById("annotate");
  var o = `<svg 
    xmlns="http://www.w3.org/1999/xhtml" 
    width="${gridW*(nCol+2)}"
    height="${gridW*(nRow+2)}"
  >
  
  <line 
    x1="${(piece.pos[0]+1)*gridW}" y1="${(piece.pos[1]+1)*gridW}" 
    x2="${x*gridW+gridW}" y2="${y*gridW+gridW}" 
    stroke="rgba(0,0,0,0.4)" stroke-width="${gridW/2}" stroke-linecap="round"/>
  
  </svg>`;
  cont.innerHTML = o;
}

function pushState(piece,x,y,state,noDraw){
  
  drawMovement(piece,x,y);
  if (History[History.length-1].state != State){
    var idx = History.map(x=>x.state).indexOf(State);
    History.splice(idx+1,History.length);
  }
  var w = isWin(state);
  
  History.push({desc:describeMove(piece,x,y)+(w!='nil'?("〈"+winSymbol[w]+"〉"):""),side:piece.side,piece,x,y,state});
  State = state;
  if (!noDraw){
    makePieces();
    drawHistory(true);
  }
}

function drawBoard(){
  var o = `<svg 
    xmlns="http://www.w3.org/1999/xhtml" 
    width="${gridW*(nCol+2)}"
    height="${gridW*(nRow+2)}"
  >`
  for (var i = 0; i < nRow; i++){
    o += `<line 
      x1="${gridW}" y1="${gridW+i*gridW}" 
      x2="${gridW*nCol}" y2="${gridW+i*gridW}" 
      stroke="black" stroke-width="${[0,15,16,31].includes(i)?3:1}" />`;
  }
  for (var i = 0; i < nCol; i++){
    o += `<line 
      x1="${gridW+i*gridW}" y1="${gridW}" 
      x2="${gridW+i*gridW}" y2="${gridW*([0,36].includes(i)?17:16)}" 
      stroke="black" stroke-width="${[0,36].includes(i)?3:1}" />`;
    o += `<line 
      x1="${gridW+i*gridW}" y1="${gridW*17}" 
      x2="${gridW+i*gridW}" y2="${gridW*nRow}" 
      stroke="black" stroke-width="${[0,36].includes(i)?3:1}" />`;
  }
  var pieces = State.red.concat(State.blk);
  
  var da = 0.1;
  var db = 0.3;
  for (var i = 0; i < pieces.length; i++){
    var p = pieces[i];

    var pp = [p.pos[0]*gridW+gridW,p.pos[1]*gridW+gridW];
    if (p.type == 'pwn' || p.type == 'cnn'){
      
      
      if (p.pos[0] == 0){
        o += `<path d="M${pp[0]+gridW*da+1} ${pp[1]-gridW*db} L${pp[0]+gridW*da+1} ${pp[1]-gridW*da} L${pp[0]+gridW*db+1} ${pp[1]-gridW*da}" stroke="black" fill="none" stroke-width="1" />`;
        o += `<path d="M${pp[0]+gridW*da+1} ${pp[1]+gridW*db} L${pp[0]+gridW*da+1} ${pp[1]+gridW*da} L${pp[0]+gridW*db+1} ${pp[1]+gridW*da}" stroke="black" fill="none" stroke-width="1" />`;
        
      }else if (p.pos[0] == 36){
        o += `<path d="M${pp[0]-gridW*da-1} ${pp[1]-gridW*db} L${pp[0]-gridW*da-1} ${pp[1]-gridW*da} L${pp[0]-gridW*db-1} ${pp[1]-gridW*da}" stroke="black" fill="none" stroke-width="1" />`;
        o += `<path d="M${pp[0]-gridW*da-1} ${pp[1]+gridW*db} L${pp[0]-gridW*da-1} ${pp[1]+gridW*da} L${pp[0]-gridW*db-1} ${pp[1]+gridW*da}" stroke="black" fill="none" stroke-width="1" />`;
      }else{
        o += `<path d="M${pp[0]-gridW*da} ${pp[1]-gridW*db} L${pp[0]-gridW*da} ${pp[1]-gridW*da} L${pp[0]-gridW*db} ${pp[1]-gridW*da}" stroke="black" fill="none" stroke-width="1" />`;
        o += `<path d="M${pp[0]+gridW*da} ${pp[1]-gridW*db} L${pp[0]+gridW*da} ${pp[1]-gridW*da} L${pp[0]+gridW*db} ${pp[1]-gridW*da}" stroke="black" fill="none" stroke-width="1" />`;
        o += `<path d="M${pp[0]-gridW*da} ${pp[1]+gridW*db} L${pp[0]-gridW*da} ${pp[1]+gridW*da} L${pp[0]-gridW*db} ${pp[1]+gridW*da}" stroke="black" fill="none" stroke-width="1" />`;
        o += `<path d="M${pp[0]+gridW*da} ${pp[1]+gridW*db} L${pp[0]+gridW*da} ${pp[1]+gridW*da} L${pp[0]+gridW*db} ${pp[1]+gridW*da}" stroke="black" fill="none" stroke-width="1" />`;
      }
    }
  }
  var crosses = [
    [4,26],[12,26],[16,26],[18,26],[20,26],[24,26],[32,26],[16,28],[18,28],[20,28],[16,30],[18,30],[20,30],
    // [4,28],[12,28],[24,28],[32,28],
  ];
  for (var i = 0, ii = crosses.length; i < ii; i++){
    crosses.push([crosses[i][0],reflectY(crosses[i][1])]);
  }
  for (var i = 0; i < crosses.length; i++){
    var pp = [crosses[i][0]*gridW+gridW, crosses[i][1]*gridW+gridW];
    o += `<line 
      x1="${pp[0]-gridW}" y1="${pp[1]-gridW}" 
      x2="${pp[0]+gridW}" y2="${pp[1]+gridW}" 
      stroke="black" stroke-width="${1}" />`;
    o += `<line 
      x1="${pp[0]+gridW}" y1="${pp[1]-gridW}" 
      x2="${pp[0]-gridW}" y2="${pp[1]+gridW}" 
      stroke="black" stroke-width="${1}" />`;
    
  }
  
  for (var i = 0; i < nRow; i++){
    o += `<text x="${gridW*(nCol+1)-12}" y="${gridW+i*gridW}" alignment-baseline="middle" font-family="sans-serif" font-size="10">${RowSymbol[i]}</text>`;
  }
  for (var i = 0; i < nCol; i++){
    o += `<text x="${gridW+i*gridW}" y="${gridW*(nRow+1)-5}" alignment-baseline="middle" font-family="sans-serif" text-anchor="middle" font-size="10">${ColSymbol[i]}</text>`;
  }
  o += `<text x="${gridW*5}" y="${gridW*16.5+1}" alignment-baseline="middle" font-family="sans-serif" text-anchor="middle" font-size="14">楚</text>`;
  o += `<text x="${gridW*13}" y="${gridW*16.5+1}" alignment-baseline="middle" font-family="sans-serif" text-anchor="middle" font-size="14">河</text>`;
  o += `<text x="${gridW*25}" y="${gridW*16.5+1}" alignment-baseline="middle" font-family="sans-serif" text-anchor="middle" font-size="14">漢</text>`;
  o += `<text x="${gridW*33}" y="${gridW*16.5+1}" alignment-baseline="middle" font-family="sans-serif" text-anchor="middle" font-size="14">界</text>`;
  o += "</svg>"
  return o;
}

function nextTurn(){
  Turn = Foe[Turn];
  drawTurnPtr();
}

function makeMoveTargs(piece,positions){
  var cont = document.getElementById("movetargs");
  cont.innerHTML = "";
  for (var i = 0; i < positions.length; i++){
    let [x,y] = positions[i];
    let div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = x*gridW+gridW/2+'px';
    div.style.top = y*gridW+gridW/2+'px';
    div.style.width = (gridW)+'px';
    div.style.height = (gridW)+'px';
    div.style.background="rgba(0,0,255,0.2)";
    div.style.borderRadius = gridW+'px';
    div.classList.add("movetarg");
    div.onclick = function(){
      console.log(describeMove(piece,x,y))
      var newState = movePiece(State,piece,x,y,div);
      pushState(piece,x,y,newState);
      
      cont.innerHTML = "";
      nextTurn();
    }
    cont.appendChild(div);
  }
}

function movePiece(state,piece,x,y){

  var nextState = {
    red:[],
    blk:[],
  };
  for (var i = 0; i < state[piece.side].length; i++){
    if (piece.pos[0] == state[piece.side][i].pos[0] && piece.pos[1] == state[piece.side][i].pos[1]){
      nextState[piece.side].push({
        side:piece.side,
        type:state[piece.side][i].type,
        pos:[x,y]
      });
    }else{
      nextState[piece.side].push({
        side:piece.side,
        type:state[piece.side][i].type,
        pos:[state[piece.side][i].pos[0],state[piece.side][i].pos[1]]
      });
    }
  }
  for (var i = 0; i < state[Foe[piece.side]].length; i++){
    if (x == state[Foe[piece.side]][i].pos[0] && y == state[Foe[piece.side]][i].pos[1]){
      continue;
    }else{
      nextState[Foe[piece.side]].push({
        side:Foe[piece.side],
        type:state[Foe[piece.side]][i].type,
        pos:[state[Foe[piece.side]][i].pos[0],state[Foe[piece.side]][i].pos[1]]
      });
    }
  }
  return nextState;
}

function makePieces(){
  var pieces = State.red.concat(State.blk);
  var cont = document.getElementById('pieces');
  cont.innerHTML = "";
  var bw = 2;
  for (var i = 0; i < pieces.length; i++){
    let p = pieces[i];
    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = p.pos[0]*gridW+gridW/2+'px';
    div.style.top = p.pos[1]*gridW+gridW/2+'px';
    div.style.width = (gridW-bw*2)+'px';
    div.style.height = (gridW-bw*2)+'px';
    div.style.background="white";
    div.style.border = bw+'px solid '+Color[p.side];
    div.style.color = Color[p.side];
    div.style.borderRadius = gridW+'px';
    div.style.fontSize = ~~(gridW*0.6)+'px';
    div.style.textAlign = 'center';
    div.style.fontFamily='sans-serif';
    div.style.fontWeight ='bold';
    div.innerHTML = Symbol[p.side+p.type];
    div.classList.add("noselect");
    div.classList.add("piece");
    div.onclick = function(){
      if (Turn == p.side){
        var moves = getMoves(State,p);
        makeMoveTargs(p,moves);
        
      }else{
        console.log("Not your turn!")
      }
      
    }    
    cont.appendChild(div);
    
  } 
}

function isOnBoard(x,y){
  return 0 <= x && x < nCol && 0 <= y && y < nRow;
}

function isLegalSpot(state,side,x,y){
  if (!isOnBoard(x,y)){
    return false;
  }
  for (var i = 0; i < state[side].length; i++){
    if (state[side][i].pos[0] == x && state[side][i].pos[1] == y){
      return false;
    }
  }
  return true;
}

function isAttackSpot(state,side,x,y){
  if (!isOnBoard(x,y)){
    return false;
  }
  for (var i = 0; i < state[Foe[side]].length; i++){
    if (state[Foe[side]][i].pos[0] == x && state[Foe[side]][i].pos[1] == y){
      return true;
    }
  }
  return false;
}

function legalSpots(state,side,positions){
  var out = []
  for (var i = 0; i < positions.length; i++){
    
    if (isLegalSpot(state,side,positions[i][0],positions[i][1])){
      out.push(positions[i])
    }
  }
  return out;
}

function isEmptySpot(state,side,x,y){
  if (!isOnBoard(x,y)){
    return false;
  }
  for (var i = 0; i < state[side].length; i++){
    if (state[side][i].pos[0] == x && state[side][i].pos[1] == y){
      return false;
    }
  }
  for (var i = 0; i < state[Foe[side]].length; i++){
    if (state[Foe[side]][i].pos[0] == x && state[Foe[side]][i].pos[1] == y){
      return false;
    }
  }
  return true;
}

function inPalace(x,y){
  if (y >= 16){
    var p2 = 0;
    if (3<= x && x <= 5 && 25 <= y && y <= 27+p2){
      return true;
    }
    if (11<= x && x <= 13 && 25 <= y && y <= 27+p2){
      return true;
    }
    if (23<= x && x <= 25 && 25 <= y && y <= 27+p2){
      return true;
    }
    if (31<= x && x <= 33 && 25 <= y && y <= 27+p2){
      return true;
    }
    if (15<= x && x <= 21 && 25 <= y && y <= 31){
      return true;
    }
    return false;
  }else{
    return inPalace(x,reflectY(y));
  }
  
}
function isCrossRiver(side,x,y){
  if (side == 'red'){
    return y <= 15;
  }else{
    return y >= 16;
  }
}

function isWin(state){
  for (var k = 0; k < 2; k++){
    var side = ['red','blk'][k];
    var hasKin = false;
    var hasGnl = false;
    for (var i = 0; i < state[side].length; i++){
      var p = state[side][i];
      if (p.type == 'kin'){
        hasKin = true;

      }else if (p.type == 'gnl'){
        hasGnl = true;
      }
    }
    if (!hasKin || !hasGnl){
      return Foe[side];
    }
  }
  return 'nil';
}

function getMoves(state,piece){

  var [x,y] = piece.pos;
  var dirs = [[0,1],[-1,0],[1,0],[0,-1]];
  if (piece.type == 'pwn'){

    if (!isCrossRiver(piece.side,x,y)){
      return legalSpots(state,piece.side,[[x,y+Forward[piece.side]]])
    }else{
      return legalSpots(state,piece.side,[[x,y+Forward[piece.side]],[x-1,y],[x+1,y]])
    }

  }else if (piece.type == 'cnn'){
    

    var moves = [];
    for (var i = 0; i < dirs.length; i++){
      var x0 = x;
      var y0 = y;
      var stand = 0;
      for (var j = 0; j < nCol+nRow; j++){
        x0 += dirs[i][0];
        y0 += dirs[i][1];
        if (!isOnBoard(x0,y0)){
          break;
        }
        var emp = isEmptySpot(state,piece.side,x0,y0);
        if (stand == 0 && emp){
          moves.push([x0,y0]);
        }
        if (stand == 1 && isAttackSpot(state,piece.side,x0,y0)){
          moves.push([x0,y0]);
        }
        if (!emp){
          stand++;
          if (stand > 1){
            break;
          }
        }
      }
    }
    return moves;
    
  }else if (piece.type == 'rok'){
    
    var moves = [];
    for (var i = 0; i < dirs.length; i++){
      var x0 = x;
      var y0 = y;

      for (var j = 0; j < nCol+nRow; j++){
        x0 += dirs[i][0];
        y0 += dirs[i][1];
        if (!isOnBoard(x0,y0)){
          break;
        }
        var emp = isEmptySpot(state,piece.side,x0,y0);
        if (emp){
          moves.push([x0,y0]);
        }
        if (isAttackSpot(state,piece.side,x0,y0)){
          moves.push([x0,y0]);
        }
        if (!emp){
          break;
        }
      }
    }
    return moves;
    
  }else if (piece.type == 'knt'){
    
    var moves = [];
    var legsAndDests = [
      [[x-1,y],[x-2,y-1]],
      [[x-1,y],[x-2,y+1]],
      [[x+1,y],[x+2,y-1]],
      [[x+1,y],[x+2,y+1]],
      [[x,y-1],[x-1,y-2]],
      [[x,y-1],[x+1,y-2]],
      [[x,y+1],[x-1,y+2]],
      [[x,y+1],[x+1,y+2]],
    ]
    for (var i = 0; i < legsAndDests.length; i++){
      if (isEmptySpot(state,piece.side,...legsAndDests[i][0])){
        if (isLegalSpot(state,piece.side,...legsAndDests[i][1])){
          moves.push(legsAndDests[i][1]);
        }
      }
    }
    return moves;
    
  }else if (piece.type == 'elt'){
    var moves = [];
    var legsAndDests = [
      [[x-1,y-1],[x-2,y-2]],
      [[x-1,y+1],[x-2,y+2]],
      [[x+1,y-1],[x+2,y-2]],
      [[x+1,y+1],[x+2,y+2]],
    ]
    for (var i = 0; i < legsAndDests.length; i++){

      if (isCrossRiver(piece.side,...legsAndDests[i][1])){
        continue;
      }

      if (isEmptySpot(state,piece.side,...legsAndDests[i][0])){
        if (isLegalSpot(state,piece.side,...legsAndDests[i][1])){
          moves.push(legsAndDests[i][1]);
        }
      }
    }
    return moves;
    
  }else if (piece.type == 'adv'){
    var moves = [];
    var dests = [
      [x-1,y-1],
      [x-1,y+1],
      [x+1,y-1],
      [x+1,y+1]
    ];

    for (var i = 0; i < dests.length; i++){      
      if (inPalace(...dests[i]) && isLegalSpot(state,piece.side,...dests[i])){
        moves.push(dests[i]);
      } 
    }
    
    return moves;
    
  }else if (piece.type == 'kin' || piece.type == 'gnl'){
    var moves = [];
    var dests = [
      [x-1,y],
      [x+1,y],
      [x,y-1],
      [x,y+1]
    ];

    for (var i = 0; i < dests.length; i++){      
      if (inPalace(...dests[i]) && isLegalSpot(state,piece.side,...dests[i])){
        moves.push(dests[i]);
      } 
    }
    
    for (var i = 0; i < dirs.length; i++){
      var x0 = x;
      var y0 = y;

      for (var j = 0; j < nCol+nRow; j++){
        x0 += dirs[i][0];
        y0 += dirs[i][1];
        if (!isOnBoard(x0,y0)){
          break;
        }
        for (var k = 0; k < state[Foe[piece.side]].length; k++){
          if (state[Foe[piece.side]][k].type == 'kin' || state[Foe[piece.side]][k].type == 'gnl'){
            if (state[Foe[piece.side]][k].pos[0] == x0 && state[Foe[piece.side]][k].pos[1] == y0){
              moves.push([x0,y0]);
            }
          }
        }
        if (!isEmptySpot(state,piece.side,x0,y0)){
          break;
        }
      }
    }
    
    return moves;
  }else{
    return [];
  }
}

function describeMove(piece,x,y){
  var txt = ""
  // txt += Symbol[piece.side+piece.type];
  txt += ColSymbol[piece.pos[0]]+RowSymbol[piece.pos[1]];
  
  var d = Math.sign(y-piece.pos[1]);
  if (d == Forward[piece.side]){
    txt += "進";
    if (x == piece.pos[0]){
      txt += RowSymbol[y];
    }else{
      txt += ColSymbol[x];
    }
  }else if (d == -Forward[piece.side]){
    txt += "退";
    if (x == piece.pos[0]){
      txt += RowSymbol[y];
    }else{
      txt += ColSymbol[x];
    }
  }else{
    txt += "平"+ColSymbol[x];
  }
  
  // txt += ColSymbol[x];
  // txt += RowSymbol[y];
  // return `<span style="color:${Color[piece.side]}">${txt}</span>`;
  return txt;
}

document.getElementById('board').innerHTML = drawBoard();

makePieces();



var histdiv = document.getElementById("hist");
histdiv.style.width = `calc(100% - ${gridW*(nCol+2)}px)`;
histdiv.style.height = `${gridW*(nRow+1)}px`;
histdiv.style.minWidth = `100px`;
histdiv.style.maxWidth = `200px`;
histdiv.style.left = `${gridW*(nCol+2)}px`;
histdiv.style.fontFamily = `sans-serif`;
histdiv.style.fontSize=`14px`;
histdiv.style.border=`1px solid black`;
histdiv.style.overflow='scroll';

var upHist = document.createElement("input");
upHist.type = 'file';
upHist.style = `position:absolute;left:${gridW*(nCol+2)}px;top:${gridW*(nRow+1)+7}px`;
document.body.appendChild(upHist);
upHist.addEventListener("change",function(){
  var file = upHist.files[0];
  var fileReader = new FileReader();
  fileReader.onload = function(fileLoadedEvent){
    var txt = fileLoadedEvent.target.result;
    runHistText(txt);
  };

  fileReader.readAsText(file, "UTF-8");  
});
var downHist = document.createElement("button");
downHist.style = `position:absolute;left:${gridW*(nCol+2)}px;top:${gridW*(nRow+1)+32}px`;
downHist.innerHTML = "Save";
document.body.appendChild(downHist);
downHist.onclick = function(){
  var text = History.map(x=>x.desc).filter(x=>x.length>=4).map(x=>x.slice(0,4)).join("\n");
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', 'EPICXIANGQI@'+new Date()+'.txt');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function runHistText(txt){
  var lines = txt.split("\n").filter(x=>x.length == 4);
  History.splice(1,History.length);
  State = History[0].state;
  Turn = 'red';
  for (var i = 0; i < lines.length; i++){
    var {piece,to} = moveFromDescription(State,Turn,lines[i]);
    var nextState = movePiece(State,piece,...to);
    pushState(piece,...to,nextState,true);
    nextTurn();
  }
  makePieces();
  drawHistory(true);
}

function moveFromDescription(state,side,t){
  var [a,b,c,d] = t;
  
  var x0 = ColSymbol.indexOf(a);
  var y0 = RowSymbol.indexOf(b);

  var dir = {'退':-1,'平':0,'進':1}[c] * Forward[side];
  var x1 = -1, y1 = -1;
  
  if (dir == 0){
    x1 = ColSymbol.indexOf(d);
  }else{
    var r = RowSymbol.indexOf(d);
    if (r == -1){
      x1 = ColSymbol.indexOf(d);
    }else{
      y1 = r;
    }
  }

  for (var i = 0; i < state[side].length; i++){
    var p = state[side][i];
    if (! (p.pos[0] == x0 && p.pos[1] == y0)){
      continue;
    }
    var m = getMoves(state,p);
    
    for (var j = 0; j < m.length; j++){
      if (((x1 == -1 && m[j][1] == y1)||
           (y1 == -1 && m[j][0] == x1))
          && (Math.sign(m[j][1]-p.pos[1]) == dir)
        ){
        return {piece:p,to:m[j]};  
      }
      
    }
  }
  console.log('Failure',t,a,b,c,d,x0,y0,x1,y1);

}


function gotoHistState(idx){
  var cont = document.getElementById("movetargs");
  cont.innerHTML = "";
  
  State = History[idx].state;
  if (History[idx].piece){
    drawMovement(History[idx].piece,History[idx].x,History[idx].y);
  }else{
    document.getElementById("annotate").innerHTML = "";
  }

  Turn = Foe[History[idx].side];
  drawTurnPtr();
  
  makePieces();
  drawHistory();
}


function drawHistory(needScroll){
  var o = ``;
  var idx = 0;
  for (var i = 0; i < History.length; i++){
    var h = History[i];
    if (State == h.state){
      idx = i;
    }
    o += `<div style="
      color:${Color[h.side]}; 
      cursor:pointer;
      background:${(State == h.state) ? "rgba(0,0,0,0.2)" : "none"}  
    "
    onclick="gotoHistState(${i})"
    > ${h.desc}</div>`;
  }

  histdiv.innerHTML = o;

  if (needScroll){
    histdiv.children[idx].scrollIntoView();
  }
}
drawHistory();


var hud = document.getElementById("hud");
hud.style.width = `${gridW*(nCol+1)}px`;
hud.style.height = `100px`;
hud.style.left = `0px`;
hud.style.top = `${gridW*(nRow+2)}px`;

hud.style.fontFamily = `sans-serif`;
hud.style.fontSize=`14px`;
// hud.style.border=`1px solid black`;

function drawHUD(){
  hud.innerHTML = `
    <div style="color:${Color.red}; width:50px; text-align:center; position:absolute; left:${gridW*13-25}px; font-weight:bold; font-size:16px; top:3px">紅</div>
    <div style="color:${Color.blk}; width:50px; text-align:center; position:absolute; left:${gridW*25-25}px; font-weight:bold; font-size:16px; top:3px">黑</div>
    <select style="width:100px; position:absolute; left:${gridW*13-50}px; top:30px"
      onchange="redCtrl=this.value;"
    >
      <option value="cpu"    ${redCtrl=='cpu'?'selected':''}>CPU</option>
      <option value="player" ${redCtrl!='cpu'?'selected':''}>Player</option>
    </select>
    <select style="width:100px; position:absolute; left:${gridW*25-50}px; top:30px"
      onchange="blkCtrl=this.value;"
    >
      <option value="cpu"    ${blkCtrl=='cpu'?'selected':''}>CPU</option>
      <option value="player" ${blkCtrl!='cpu'?'selected':''}>Player</option>
    </select>
  `;
}

var turnptrdiv = document.createElement('div');
turnptrdiv.style = `position:absolute;text-align:center;width:40px;height:40px;font-size:40px;font-family:sans-serif;top:${gridW*(nRow+2)-32}px;`;
turnptrdiv.innerText = "▾";
document.body.appendChild(turnptrdiv);

function drawTurnPtr(){
  turnptrdiv.style.color = Color[Turn];
  if ((Turn == 'red' && redCtrl == 'cpu') || (Turn == 'blk' && blkCtrl == 'cpu')){
    turnptrdiv.innerHTML = `⧖`;
  }else{
    turnptrdiv.innerText = "▾";
  }
  if (Turn == 'red'){
    turnptrdiv.style.left = gridW*13-20+"px";
  }else{
    turnptrdiv.style.left = gridW*25-20+"px";
  }
}
drawTurnPtr();



function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function evalState(state){
  function evalSide(state,side){
    var hasKin = false;
    var hasGnl = false;
    var s = 0;
    for (var i = 0; i < state[side].length; i++){
      var p = state[side][i];
      var mul = 1;
      if (isCrossRiver(p.side,...p.pos)){
        
        if (side == 'red'){
          mul += (16-p.pos[1])*0.01;
        }else{
          mul += (p.pos[1]-15)*0.01;
        }
      }
      if (p.type == 'kin'){
        hasKin = true;
        s += 50*mul;
      }else if (p.type == 'gnl'){
        hasGnl = true;
        s += 20*mul;
      }else if (p.type == 'pwn'){
        s += 1*mul;
        if (isCrossRiver(p.side,...p.pos)){
          s += 1;
          if (inPalace(...p.pos)){
            s += 4;
          }
        }

      }else if (p.type == 'knt'){
        s += 4*mul;
        // if (state[side].length + state[Foe[side]].length < 135){
        //   s += 1;
        // }
      }else if (p.type == 'cnn'){
        s += 7*mul;
        // if (state[side].length + state[Foe[side]].length > 135){
        //   s += 1;
        // }
      }else if (p.type == 'rok'){
        s += 10*mul;
      }else if (p.type == 'elt'){
        s += 3*mul;
      }else if (p.type == 'adv'){
        s += 2*mul;
      }
    }

    if (!hasKin || !hasGnl){
      s -= Infinity;
    }
    return s;
  }
  return evalSide(state,'red')-evalSide(state,'blk');
}


function aiGreedy(side){
  var moves = [];
  for (var i = 0; i < State[side].length; i++){
    var m = getMoves(State,State[side][i]);
    moves = moves.concat(m.map(x=>({piece:State[side][i],to:x})));
  }
  for (var i = 0; i < moves.length; i++){
    var nextState = movePiece(State,moves[i].piece,...moves[i].to);
    var score = evalState(nextState);
    moves[i].score = score;
  }
  shuffleArray(moves);
  if (side == 'red'){
    moves.sort((a,b)=>(b.score-a.score));
  }else{
    moves.sort((a,b)=>(a.score-b.score));
  }
  var move = moves[0];

  console.log(describeMove(move.piece,...move.to))
  pushState(move.piece,...move.to,movePiece(State,move.piece,...move.to));
  
  
}

function aiMinimax(side){


  function alphabeta(state,depth,alpha,beta,side){

    var val = evalState(state);
    if (depth == 0 || val == Infinity || val == -Infinity){
      return val;
    }
    var moves = [];
    for (var i = 0; i < state[Foe[side]].length; i++){
      var m = getMoves(state,state[Foe[side]][i]);
      moves = moves.concat(m.map(x=>({piece:state[Foe[side]][i],to:x})));
    }
    if (side=='blk'){
      val = -Infinity;
      for (var i = 0; i < moves.length; i++){
        var nextState = movePiece(state,moves[i].piece,...moves[i].to);
        val = Math.max(val, alphabeta(nextState, depth-1, alpha, beta, Foe[side]));
        alpha = Math.max(alpha, val);
        if (alpha >= beta){
          break;
        }
      }
      return val;
    }else{
      val = Infinity;
      for (var i = 0; i < moves.length; i++){
        var nextState = movePiece(state,moves[i].piece,...moves[i].to);
        val = Math.min(val, alphabeta(nextState, depth-1, alpha, beta, Foe[side]));
        beta = Math.min(beta,val);

        if (beta <= alpha){
          break;
        }
      }
      return val;
    }
  }
  // console.log(side);
  var moves = [];
  for (var i = 0; i < State[side].length; i++){
    var m = getMoves(State,State[side][i]);
    moves = moves.concat(m.map(x=>({piece:State[side][i],to:x})));
  }
  var d = Math.min(Math.max(~~(8 - moves.length/50),1),4);
  d = 2;
  console.log(moves.length + " moves, depth = "+d);
  for (var i = 0; i < moves.length; i++){
    console.log(side+" thinking about move",i,'/',moves.length);
    var nextState = movePiece(State,moves[i].piece,...moves[i].to);
    
    var score = alphabeta(nextState, d, -Infinity, Infinity, side);
    moves[i].score = score;
    console.log(describeMove(moves[i].piece,...moves[i].to),score);

  }
  shuffleArray(moves);
  if (side == 'red'){
    moves.sort((a,b)=>(b.score-a.score));
  }else{
    moves.sort((a,b)=>(a.score-b.score));
  }
  var move = moves[0];

  console.log(describeMove(move.piece,...move.to))
  pushState(move.piece,...move.to,movePiece(State,move.piece,...move.to));

}





function aiMinimaxSelective(side){
  var K = 5;
  var d = 3;
  
  function selectiveMoves(state,side){
    var moves = [];
    for (var i = 0; i < state[side].length; i++){
      var m = getMoves(state,state[side][i]);
      moves = moves.concat(m.map(x=>({piece:state[side][i],to:x})));

    }
    for (var i = 0; i < moves.length; i++){
      var nextState = movePiece(state,moves[i].piece,...moves[i].to);
      var score = evalState(nextState);
      moves[i].score = score; 
    }
    shuffleArray(moves);
    if (side == 'red'){
      moves.sort((a,b)=>(b.score-a.score));
    }else{
      moves.sort((a,b)=>(a.score-b.score));
    }
    moves = moves.slice(0,K);
    return moves;
  }
  
  function alphabeta(state,depth,alpha,beta,side){

    var val = evalState(state);
    if (depth == 0 || val == Infinity || val == -Infinity){
      return val;
    }
    var moves = selectiveMoves(state,Foe[side]);
    if (side=='blk'){
      val = -Infinity;
      for (var i = 0; i < moves.length; i++){
        var nextState = movePiece(state,moves[i].piece,...moves[i].to);
        val = Math.max(val, alphabeta(nextState, depth-1, alpha, beta, Foe[side]));
        alpha = Math.max(alpha, val);
        if (alpha >= beta){
          break;
        }
      }
      return val;
    }else{
      val = Infinity;
      for (var i = 0; i < moves.length; i++){
        var nextState = movePiece(state,moves[i].piece,...moves[i].to);
        val = Math.min(val, alphabeta(nextState, depth-1, alpha, beta, Foe[side]));
        beta = Math.min(beta,val);

        if (beta <= alpha){
          break;
        }
      }
      return val;
    }
  }
  // console.log(side);
  
  var moves = selectiveMoves(State,side);
  
  
  // d = 1;
  console.log(moves.length + " moves, depth = "+d);
  for (var i = 0; i < moves.length; i++){
    console.log(side+" thinking about move",i,'/',moves.length);
    var nextState = movePiece(State,moves[i].piece,...moves[i].to);
    
    var score = alphabeta(nextState, d, -Infinity, Infinity, side);
    moves[i].score = score;
    // console.log(describeMove(moves[i].piece,...moves[i].to),score);

  }
  shuffleArray(moves);
  if (side == 'red'){
    moves.sort((a,b)=>(b.score-a.score));
  }else{
    moves.sort((a,b)=>(a.score-b.score));
  }
  var move = moves[0];

  console.log(describeMove(move.piece,...move.to))
  pushState(move.piece,...move.to,movePiece(State,move.piece,...move.to));

}




function cvcGame(aiFunc){
  function step(side){
    aiFunc(side);

    var score = evalState(State);
    if (score == Infinity){
      console.log("紅勝");
    }else if (score == -Infinity){
      console.log("黑勝");
    }else{
      setTimeout(function(){step(Foe[side])},1);
    }
  }
  step(Turn);
}


function pvcGame(cpuSide,aiFunc){
  function step(){
    if (Turn == cpuSide){
      aiFunc(cpuSide);
      nextTurn();
    }
    setTimeout(step,10);
  }
  step();
}


var redCtrl = 'player';
var blkCtrl = 'cpu';
var redAI = 'Greedy';
var blkAI = 'Greedy';

function mainloop(){
  if (isWin(State) == 'nil'){
    if ((redCtrl == 'cpu' && Turn == 'red')){
      window['ai'+redAI]('red');
      nextTurn();
    }else if ((blkCtrl == 'cpu' && Turn == 'blk')){
      window['ai'+blkAI]('blk');
      nextTurn();
    }
  }
  setTimeout(mainloop,1);
}

drawHUD();

mainloop();