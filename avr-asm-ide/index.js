/*global describe CodeMirror AVRLASS AVRDASS DISK serupdi_upload serupdi_init SERUPDI_OPTS ser _log*/
if (localStorage.getItem("DISK")){
  DISK = JSON.parse(localStorage.getItem("DISK")); 
}
let curr_file = "examples/blink.t412.asm";


CodeMirror.defineSimpleMode("avrasm", {
  meta:{
    lineComment: ';',
    comment: ';',
  },
  start: [
    {regex: /["'](?:[^\\]|\\.)*?['"]/mi, token: "string"},
    {regex: /(?:ADC|ADD|ADIW|AND|ANDI|ASR|BCLR|BLD|BRBC|BRBS|BRCC|BRCS|BREAK|BREQ|BRGE|BRHC|BRHS|BRID|BRIE|BRLO|BRLT|BRMI|BRNE|BRPL|BRSH|BRTC|BRTS|BRVC|BRVS|BSET|BST|CALL|CBI|CBR|CLC|CLH|CLI|CLN|CLR|CLS|CLT|CLV|CLZ|COM|CP|CPC|CPI|CPSE|DEC|DES|EICALL|EIJMP|ELPM|EOR|FMUL|FMULS|FMULSU|ICALL|IJMP|IN|INC|JMP|LAC|LAS|LAT|LD|LDD|LDI|LDS|LPM|LSL|LSR|MOV|MOVW|MUL|MULS|MULSU|NEG|NOP|OR|ORI|OUT|POP|PUSH|RCALL|RET|RETI|RJMP|ROL|ROR|SBC|SBCI|SBI|SBIC|SBIS|SBIW|SBR|SBRC|SBRS|SEC|SEH|SEI|SEN|SER|SES|SET|SEV|SEZ|SLEEP|SPM|ST|STD|STS|SUB|SUBI|SWAP|TST|WDR|XCH)\b/i,
     token: "keyword"},
    {regex: /(?:\.EQU|\.INCLUDE|\.CSEG|\.DSEG|\.ESEG|\.BYTE|\.DB|\.DW|\.DD|\.DQ|\.ORG|\.MACRO|\.ENDM|\.ENDMACRO|\.MESSAGE|\.ERROR|\.WARNING|\.DEVICE|\.EXIT|\.IF|\.ENDIF|\.ELSE|\.ELIF|\.IFDEF|\.IFNDEF)\b/i,
     token: "def"},
    {regex: /0[xb][a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
     token: "number"},
    {regex: /;.*/, token: "comment"},
    {regex: /\bR[0-9]+\b/i, token: "builtin"},
    {regex: /\b[A-Z_][A-Z0-9_]*?\:/i, token: "tag"},
    {regex: /\b[A-Z_][A-Z0-9_]*?\b/i, token: "variable"},
  ],
});
var CML = CodeMirror(document.getElementById("cl"), {
  lineNumbers:true,
  matchBrackets: true,
  theme:"foo",
  mode:  "avrasm",
  indentWithTabs: true,
  tabSize: 8,
  // indentUnit: 4,
  styleActiveLine: { nonEmpty: true },
  extraKeys:{
    'Ctrl-/': 'toggleComment',
    'Cmd-/': 'toggleComment'
  },
  value:DISK[curr_file]});
window.CML = CML;
CML.setSize(null,null);


function autosave(){
  console.log("saving...",new Date())
  DISK[curr_file] = CML.getValue();
  localStorage.setItem("DISK", JSON.stringify(DISK));
}

document.getElementById("btn-st").onclick = function(){
  autosave();
  let div = document.createElement("div");
  div.style="position:absolute;left:0%;bottom:0%;z-index:1000;background:white;border:1px solid black;background:floralwhite;padding:2px"
  div.innerHTML = curr_file+" <b>saved!</b>";
  document.body.appendChild(div);
  setTimeout(function(){div.remove()},2000);
}

function switch_file(f){
  curr_file = f;
  CML.setValue(DISK[curr_file]);
  document.getElementById('sel-file').value = f;
}

// setInterval(autosave,10000);

function rebuild_sel_file(){
  let sf = document.getElementById('sel-file');
  sf.innerHTML = ""
  for (let k in DISK){
    let opt = document.createElement("option");
    opt.innerHTML = k;
    sf.appendChild(opt);
  }
  sf.onchange = function(){
    switch_file(sf.value);
  }
}
rebuild_sel_file();


document.getElementById("btn-new").onclick = function(){
  let o = prompt("New file:","file.asm");
  if (o){
    DISK[o] = "";
    rebuild_sel_file();
    switch_file(o);
  }
}

document.getElementById("btn-del").onclick = function(){
  let o = confirm("Permanently delete "+curr_file+"?");
  if (o){
    delete DISK[curr_file];
    curr_file = Object.keys(DISK)[0];
    if (!curr_file){
      curr_file = "file.asm";
      DISK[curr_file] = "";
    }
    rebuild_sel_file();
    switch_file(curr_file);
  }
}

document.getElementById("btn-clrst").onclick = function(){
  let o = confirm("Clear local storage? This reverts the file system to the default examples and includes, and is NOT undoable. A page refresh will automatically follow.");
  if (o){
    localStorage.clear();
    location.reload()
  }
}


function update_asmr_desc(){
  let desc = {
    "avrlass":"AVR Lightweight ASSembler: client-side assembler written in JS.",
  };
  document.getElementById("lbl-asm").innerHTML = desc[document.getElementById("sel-asm").value];
}

update_asmr_desc();

document.getElementById('sel-asm').onchange = function(){
  update_asmr_desc();
};

let OASM = document.getElementById('out-asm');
let OHEX = document.getElementById('out-hex');
let OUPD = document.getElementById('out-upd');


function call_assembler(){
  OASM.value = new Date()+"\n";
  OHEX.value = "";
  // if (document.getElementById('sel-asm').value == 'avrlass'){
    function reader(pth){
      pth = pth.replace(/\\/g,'/');
      while (pth[0] == '.' || pth[0] == '/'){
        pth = pth.slice(1);
      }
      if (typeof DISK[pth] != 'string'){
        let o = "";
        o += "[error] file not found: '"+pth+"'.\n";
        if (pth.endsWith(".inc")){
          o+="NOTE: This site does not host all the .inc files for all the AVR devices. ";
          o+="To use the .inc file for your particular device, create a new file by clicking the '+' button, enter the filename (e.g. tn3216def.inc), and paste it into the editor. Include files can be extracted from DFP packs downloaded from Microchip's official website.\n";
        }
        OASM.value += o;
        throw 'abort';
      }
      return DISK[pth];
    }
    let src = CML.getValue();
    console.log("making new context...");
    let context = AVRLASS.new_context({});
    let lst,ins,sum="",code,hex;
    console.log("starting...");
    try{
      console.log("parsing...");
      lst = AVRLASS.parse(src,reader,context);
      console.log("compiling...");
      ins = AVRLASS.compile(lst,context);
      console.log("assembling...");
      code = AVRLASS.assemble(ins);
      console.log("converting to hex...");
      hex = AVRLASS.to_ihex(code);
      console.log("preparing summary...");
      sum = AVRLASS.print_summary();
    }catch(e){
      let err = '[error] '+e+'\n';;
      OASM.value += err;
      console.log(err);
      throw 'abort';
    }
    console.log("writing output...");
    OASM.value += sum;
    OHEX.value += hex;
    
  // }
}

document.getElementById('btn-asm').onclick = call_assembler;


call_assembler();




window.serupdi_progress = document.getElementById('bar-prog');
window.serupdi_console = {
  log: function(x){
    console.log(x);
    let ta = OUPD;
    let d = document.createElement("div");
    d.innerHTML = x;
    ta.appendChild(d);
    ta.scrollTop = ta.scrollHeight;
  }
}
document.getElementById('btn-connect').onclick = async function(){
  if (ser.port){
    ser.close();
    document.getElementById('btn-connect').innerHTML = 'connect';
  }else{
    await serupdi_init();
    if (ser.port){
      ser.port.ondisconnect = function(){
        _log(1,'connection lost.')
        document.getElementById('btn-connect').innerHTML = 'connect';
        ser.port = null;
      }
      document.getElementById('btn-connect').innerHTML = 'disconnect';
    }
  }
  
}
document.getElementById('inp-verify').onchange = function(){
  SERUPDI_OPTS.do_verify ^= 1;
}
document.getElementById('inp-verbose').onchange = function(){
  SERUPDI_OPTS.log_lvl ^= 3;
  SERUPDI_OPTS.log_lvl |= 1;
}
document.getElementById('btn-upload').onclick = function(){
  OUPD.innerHTML = "";
  serupdi_upload(OHEX.value);
}


document.getElementById('btn-theme').onclick = function(){
  if (!document.body.style.filter){
    document.body.style.background = "black";
    document.body.style.filter = "invert(88%) hue-rotate(180deg)";
  }else{
    document.body.style.background = "white";
    document.body.style.filter = "";
  }
}

function shortID(){
  var id = "";
  for (var i = 0; i < 5; i++){
    id+=String.fromCharCode(~~(Math.random()*26)+0x61);
  }
  return id.toUpperCase();
}

document.getElementById('btn-dasm').onclick = function(){
  let ret;
  try{
    ret = AVRDASS.hex_to_asm(OHEX.value);
  }catch(e){
    let err = '[error] '+e+'\n';;
    OASM.innerHTML += err;
    console.log(err);
    throw 'abort';
  }
  
  let fn = 'disass-'+shortID()+'.asm';
  DISK[fn] = ret;
  rebuild_sel_file();
  switch_file(fn);
}

let mon = {};
async function mon_init(){
  let baud = Number(document.getElementById('inp-baud').value || 9600);
  if (!navigator.serial){
    _log(0,"your browser/protocol does not support WebSerial; try chrome/https.");
  }
  let port = await navigator.serial.requestPort({});
  try{
    await port.open({baudRate: baud});
    _log(1, 'port opened: '+JSON.stringify(port.getInfo()));
  }catch(e){
    _log(0, 'port failed to open: '+e.toString());
    return;
  }
  
  mon.port = port;
  mon.reader = port.readable.getReader();
  mon.writer = port.writable.getWriter();
  mon.buf = [];
  
  mon.close = async function(x){

    mon.reader.releaseLock();
    mon.writer.releaseLock();
    mon.port.close();
    mon.port = null;
    _log(1, 'port closed.');
  }
  
}

document.getElementById('btn-mon').onclick = async function(){
  if (mon.port){
    mon.close();
    document.getElementById('btn-mon').innerHTML = 'connect';
  }else{
    await mon_init();
    if (mon.port){
      mon.port.ondisconnect = function(){
        _log(1,'connection lost.')
        document.getElementById('btn-mon').innerHTML = 'connect';
        mon.port = null;
      }
      document.getElementById('btn-mon').innerHTML = 'disconnect';
    }
    OUPD.innerHTML = "";
    mon_loop();
  }
}

let N_MON_LINE = 48;

function mon_line(){
  let d = document.createElement('div');
  d.style='white-space: nowrap;';
  let o = '';
  let b = '';
  let ld = 0;
  let nw = N_MON_LINE;
  
  if (document.getElementById('inp-monhex').checked){
    for (let i = 0; i < N_MON_LINE; i++){
      if (ld || i >= mon.buf.length){
        o += `<span style="display:inline-block;width:10px"></span>`;
        b += '&nbsp;.&nbsp;'
      }else{
        let c = String.fromCharCode(mon.buf[i]);
        if (c == ' '){
          c = '&nbsp;'
        }
        o += `<span style="display:inline-block;width:10px">${c}</span>`;
        b += '&nbsp;'+mon.buf[i].toString(16).toUpperCase().padStart(2,'0');
        if (c == '\n'){
          ld = 1;
          nw = i+1;
        }
      }
    }
    d.innerHTML = o + ' |<span style="font-size:11px">' + b+'</span>';
  }else{
    for (let i = 0; i < mon.buf.length; i++){
      let c = String.fromCharCode(mon.buf[i]);
      o += c;
      if (c == '\n'){
        nw = i+1;
        break;
      }
    }
    d.innerHTML = o;
    // console.log(o,nw);
  }
  OUPD.appendChild(d);
  if (document.getElementById('inp-scrl').checked){
    OUPD.scrollTop = OUPD.scrollHeight;
  }
  return [nw,d];
}

async function mon_loop(){
  let {value,done} = (await mon.reader.read());

  if (mon.curr_div){
    mon.curr_div.remove();
  }
  
  for (let i = 0; i < value.length; i++){
    mon.buf.push(value[i]);
  }
  console.log(JSON.stringify(mon.buf));
  let nw = null;
  let d = null;
  while (mon.buf.length){
    ;[nw,d] = mon_line();
    let nxt = mon.buf.slice(nw);
    if (nxt.length){
      mon.buf = nxt;
    }else{
      break;
    }
  }
  mon.curr_div = d;
  
  return await mon_loop();
}


document.getElementById("btn-sndb").onclick = async function(){
  if (!mon.port){
    _log(0,'please connect to serial port first')
  }
  let x = parseInt(document.getElementById('inp-sndb').value);
  await mon.writer.write(new Uint8Array([x]));
};


document.getElementById("btn-snds").onclick = async function(){
  if (!mon.port){
    _log(0,'please connect to serial port first')
  }
  let x = document.getElementById('inp-snds').value;
  if (document.getElementById('inp-sndcr').checked){
    x += '\r';
  }
  if (document.getElementById('inp-sndnl').checked){
    x += '\n';
  }
  const encoder = new TextEncoder();
  const view = encoder.encode(x);
  
  await mon.writer.write(view);
};

document.addEventListener('keydown', function(event) {
  if (!document.getElementById('inp-capkey').checked){
    return;
  }
  if (!mon.port){
    return;
  }
  let key = event.key;
  
  document.getElementById('inp-capkey').blur();
  
  if (key == "Enter"){
    mon.writer.write(new Uint8Array([0xA]));
    document.getElementById('lbl-capkey').innerHTML = '\n';
  }else if (key.length == 1){
    mon.writer.write(new Uint8Array([key.charCodeAt(0)]));
    document.getElementById('lbl-capkey').innerHTML = key;
  }
  
});

document.getElementById("btn-monclr").onclick = function(){
  OUPD.innerHTML = "";
}