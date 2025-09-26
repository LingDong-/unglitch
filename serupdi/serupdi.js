let ser = {};
let SERUPDI_OPTS = {
  log_lvl:1,
  do_verify:0,
  do_program:1,
  baud:57600
}

function _log(lvl){
  if (lvl > SERUPDI_OPTS.log_lvl) return;
  let cons = window.serupdi_console || console
  cons.log(`[${['erro','info'][Math.min(lvl,1)]}]${' '.repeat(Math.max(lvl-1,0)*3)} ${Array.from(arguments).slice(1).map(x=>x.toString()).join(' ')}`);
  if (!lvl) throw 'abort';
}

function _progress(pct){
  let bar = window.serupdi_progress;
  if (!bar) return;
  bar.min = 0;
  bar.max = 100;
  bar.value = Math.round(pct*100);
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function serupdi_init(){
  let port = await navigator.serial.requestPort({});
  try{
    await port.open({ baudRate: SERUPDI_OPTS.baud, parity: 'even', stopBits: 2, dataBits: 8});
    _log(1, 'port opened: '+JSON.stringify(port.getInfo()));
  }catch(e){
    _log(0, 'port failed to open: '+e.toString());
    return;
  }
  
  ser.port = port;
  ser.reader = port.readable.getReader();
  ser.writer = port.writable.getWriter();
  ser.buf = [];
  ser.read = async function(){
    if (!ser.buf.length){
      let {value,done} = (await ser.reader.read());
      for (let i = 0; i < value.length; i++){
        ser.buf.push(value[i]);
      }
    }
    return ser.buf.shift();
  }

  ser.write = async function(x){
    return await ser.writer.write(new Uint8Array([x]));
  }
}

async function serupdi_upload(ihex_str){

  let t;
  
  _log(1, 'parsing Intel HEX...');
  let recs = ihex_parse(ihex_str);
  
  _log(1, `parsed ${recs.length} record(s).`);
  
  ihex_optimize(recs);
  
  window._serupdi_dbg_recs = recs;

  _log(1, `optimized into ${recs.length} record(s).`);
  
  if (!ser.write){
    _log(0, `please connect to serial port first`);
  }
  
  _log(1, 'entering NVMPROG...');
  await updi_enter();
  
  if (SERUPDI_OPTS.do_program){
    t = Date.now();

    for (let i = 0; i < recs.length; i++){
      let {addr, data} = recs[i];
      let bcnt = data.length;
      _log(1, `sending record ${i+1}/${recs.length} (${bcnt}b)...`);
      _progress(i/recs.length/(SERUPDI_OPTS.do_verify+1));

      // for (let j = 0; j < bcnt; j++){
      //   let ptr = 0x8000 + addr + j;
      //   await updi_sts(ptr, data[j]);
      // }

      await updi_repeat_st_words_no_ack(0x8000+addr, data);

      _log(2, `NVM WP...`);
      await updi_sts(0x1000,1);
      await _sleep(50);
    }

    _log(1, `flashed in ${(Date.now()-t)/1000} seconds.`);

    await _sleep(200); 
  }
  
  if (SERUPDI_OPTS.do_verify){
    t = Date.now();
    
    let errcnt = 0;
    for (let i = 0; i < recs.length; i++){
      let {addr, data} = recs[i];
      let bcnt = data.length;
      _log(1, `verifying record ${i+1}/${recs.length} (${bcnt}b)...`);
      _progress(0.5 + i/recs.length/2);
      for (let j = 0; j < bcnt; j++){
        let ptr = 0x8000 + addr + j;
        let r = await updi_lds(ptr);
        if (r == data[j]){
          _log(2, `byte @ 0x${ptr.toString(16)} verified successfully. (0x${r.toString(16)})`);
        }else{
          _log(0, `verify failed @ 0x${ptr.toString(16)}. expecting 0x${data[j].toString(16)}, got 0x${r.toString(16)}`);
          errcnt++;
        }
      }
    }
    _log(1, `verify found ${errcnt} error(s) in ${(Date.now()-t)/1000} seconds.`);
    
  }
  
  _log(1, 'exiting NVMPROG...');
  await updi_exit();  
  _log(1, 'done.');
  _progress(1);
}


async function updi_send(x){
  _log(3,`sending 0x${x.toString(16)} ...`);
  await ser.write(x);
  let r = await ser.read();
}

async function updi_multisend(xs){
  _log(3,`sending [${xs.map(x=>'0x'+x.toString(16)).join(',')}] ...`);
  await ser.writer.write(new Uint8Array(xs));
  for (let i = 0; i < xs.length; i++){
    let r = await ser.read();
  }
}

async function updi_recv(){
  _log(3,'waiting for response...');
  let r = await ser.read();
  _log(3,`response: 0x${r.toString(16)}`);
  return r;
}

async function updi_reset(){
  await updi_stcs(0x8,0x59);
  await updi_stcs(0x8,0x00);
}

async function updi_stcs(addr,val){
  _log(2,`stcs ${val.toString(16)} @ 0x${addr.toString(16)}`);
  await updi_send(0x55);
  await updi_send(0xC0 | (addr & 0xf));
  await updi_send(val);
}
async function updi_ldcs(addr){
  _log(2,`ldcs @ 0x${addr.toString(16)}`);
  await updi_send(0x55);
  await updi_send(0x80 | (addr & 0xf));
  return await updi_recv();
}

async function updi_enter(){
  let r;
  
  await updi_send(0);
  await updi_stcs(3,8);
  await updi_stcs(2,6);
  r = await updi_ldcs(0);
  
  await updi_send(0x55);
  await updi_send(0xe5);
  let sib = [];
  for (let i = 0; i < 16; i++){
    sib.push(await updi_recv());
  }
  _log(1,'SIB:'+sib.map(x=>String.fromCharCode(x)).join(''));
  
  await _sleep(200);
  
  _log(1,'sending NVMErase key...');
  await updi_send(0x55);
  await updi_send(0xE0);
  await updi_send(0x65);
  await updi_send(0x73);
  await updi_send(0x61);
  await updi_send(0x72);
  await updi_send(0x45);
  await updi_send(0x4D);
  await updi_send(0x56);
  await updi_send(0x4E);
  await _sleep(200);

  
  _log(1,'sending NVMProg  key...');
  await updi_send(0x55);
  await updi_send(0xE0);
  await updi_send(0x20);
  await updi_send(0x67);
  await updi_send(0x6F);
  await updi_send(0x72);
  await updi_send(0x50);
  await updi_send(0x4D);
  await updi_send(0x56);
  await updi_send(0x4E);
  
  _log(1,'status check...');
  r = await updi_ldcs(0x07);
  if (r & (1<<4)){
    _log(1,'key accepted');
  }else{
    _log(0,'key not accepted');
  }
  
  _log(1,'sending reset');
  await updi_reset();
  
  await _sleep(500);
  _log(1,'checking NVMPROG...');
  r = await updi_ldcs(0xB);
  if (r & (1<<3)){
    _log(1,'in NVMPROG');
  }else{
    _log(0,'failed to enter NVMPROG');
  }
}

async function updi_exit(){
  await updi_reset();
  await updi_stcs(0x3,0b1100);
}

async function updi_ack(){
  let r = await updi_recv();
  if (r != 0x40){
    _log(0,`expected ACK, got: 0x${r.toString(16)}`);
  }else{
    _log(2,'ACK');
  }
}

async function updi_sts(addr, val){
  _log(2,`sts 0x${val.toString(16)} @ 0x${addr.toString(16)}`);
  let r;
  await updi_send(0x55);
  await updi_send(0x44);
  await updi_send(addr&0xff);
  await updi_send((addr>>8)&0xff);
  await updi_ack();
  await updi_send(val);
  await updi_ack();
}


async function updi_repeat_st_words_no_ack(addr, vals){
  
  _log(2,`st ptr @ 0x${addr.toString(16)}`);
  
  await updi_multisend([0x55,0x69,addr&0xff,(addr>>8)&0xff]);
  await updi_ack();
  
  _log(2,'ack off...');
  await updi_stcs(2,0xe);
  
  _log(2,`repeat ${vals.length/2} words`);
  
  await updi_multisend([0x55,0xa0,vals.length/2-1,0x55,0x65]);
  await updi_multisend(vals);

  _log(2,'ack on...');
  await updi_stcs(2,6);
   
}


async function updi_lds(addr){
  _log(2,`lds @ 0x${addr.toString(16)}`);
  await updi_send(0x55);
  await updi_send(0x04);
  await updi_send(addr&0xff);
  await updi_send((addr>>8)&0xff);
  let r = await updi_recv();
  return r;
}

function ihex_parse(str){
  let lines = str.replace(/\r/g, '\n').split('\n').map(x=>x.trim()).filter(x=>x&&x.length).map(x=>x.split(':')[1]);
  let recs = [];
  for (let i = 0; i < lines.length; i++){
    let ln = lines[i];
    let typ = parseInt(ln.slice(6,8),16);
    let num = parseInt(ln.slice(0,2),16);
    let dat = [];
    for (let j = 8; j < ln.length-2; j+=2){
      dat.push(parseInt(ln.slice(j,j+2),16));
    }
    if (typ == 0){
      recs.push({
        addr: parseInt(ln.slice(2,6),16),
        data: dat,
      })
    }
  }
  return recs;
}

function ihex_optimize(recs,page_bytes=64){
  for (let i = 1; i < recs.length; i++){
    if (recs[i].addr = recs[i-1].addr + recs[i-1].data.length){
      while (recs[i-1].data.length < page_bytes && recs[i].data.length){
        recs[i-1].data.push(recs[i].data.shift());
        recs[i].addr++;
      }
      if (!recs[i].data.length) recs.splice(i--,1);   
    }
  }
  for (let i = 0; i < recs.length; i++){
    while (recs[i].data.length & 1){
      recs[i].data.push(0xff);
    }
  }
  recs.sort((a,b)=>a.addr-b.addr);
}

