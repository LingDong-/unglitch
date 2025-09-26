function encode_ttf(info,glyphs,kerning){
  // https://developer.apple.com/fonts/TrueType-Reference-Manual/

  function get_bbox(points){
    let xmin = Infinity;
    let ymin = Infinity;
    let xmax = -Infinity;
    let ymax = -Infinity
    for (let i = 0;i < points.length; i++){
      let x = points[i][0];
      let y = points[i][1];
      xmin = Math.min(xmin,x);
      ymin = Math.min(ymin,y);
      xmax = Math.max(xmax,x);
      ymax = Math.max(ymax,y);
    }
    return {xmin,ymin,xmax,ymax};
  }
  function u16(x){
    return [(x>>>8)&0xff,x&0xff];
  }
  function u32(x){
    return [(x>>>24)&0xff,(x>>>16)&0xff,(x>>>8)&0xff,x&0xff];
  }
  function u64(x){
    return [...u32(~~(x/0x100000000)),...u32(x>>>0)]
  }
  function mina(x){
    return x.reduce((a,b)=>Math.min(a,b),Infinity);
  }
  function maxa(x){
    return x.reduce((a,b)=>Math.max(a,b),-Infinity);
  }
  function suma(x){
    return x.reduce((a,b)=>(a+b),0);
  }
  function chksum(bs){
    let sum = 0;
    let nLongs = ~~((bs.length+3)/4);
    for (let i = 0; i < nLongs; i++){
      let b0 = bs[i*4];
      let b1 = bs[i*4+1]??0;
      let b2 = bs[i*4+2]??0;
      let b3 = bs[i*4+3]??0;
      let u = (b0<<24)|(b1<<16)|(b2<<8)|b3;
      sum = (sum+u)>>>0;
    }
    return sum;
  }
  
  glyphs = glyphs.slice().sort((a,b)=>(a.unicode-b.unicode));
  glyphs.unshift({
    unicode:0,
    advw:1,
    ls:0,
    contours:[[[0,0],[0,1],[1,1],[1,0]]]
  })
  for (let i = 0; i < glyphs.length; i++){
    if (!glyphs[i].bb) glyphs[i].bb = get_bbox(glyphs[i].contours.flat());
  }
  let u2idx = {};
  for (let i = 0; i < glyphs.length; i++){
    u2idx[glyphs[i].unicode] = i;
  }
  kerning = kerning.slice().sort((a,b)=>( (a.l*65536+a.r)-(b.l*65536+b.r) ))

  let [xmin,ymin,xmax,ymax]=[
    ~~mina(glyphs.map(x=>x.bb.xmin)),
    ~~mina(glyphs.map(x=>x.bb.ymin)),
    ~~maxa(glyphs.map(x=>x.bb.xmax)),
    ~~maxa(glyphs.map(x=>x.bb.ymax)),
  ];
  let [advw,mlsb,mrsb,mext] = [
    ~~maxa(glyphs.map(x=>x.advw)),
    ~~mina(glyphs.map(x=>x.lsb)),
    ~~mina(glyphs.map(x=>(x.advw-(x.lsb+x.bb.xmax-x.bb.xmin)))),
    ~~maxa(glyphs.map(x=>(x.lsb+x.bb.xmax-x.bb.xmin))),
  ];

  let n_hmetric = glyphs.length;

  let tbl = {
    'OS/2':[],
    'cmap':[],
    'glyf':[],
    'head':[],
    'hhea':[],
    'hmtx':[],
    'kern':[],
    'loca':[],
    'maxp':[],
    'name':[],
    'post':[],
  }
  tbl.head.push(0,1,0,0);
  tbl.head.push(0,0,0,0);
  tbl.head.push(0,0,0,0);//checksum adj
  tbl.head.push(0x5F,0x0F,0x3C,0xF5);//magic
  tbl.head.push(...u16(0b0000_0000_0001_1111));
  tbl.head.push(...u16(info.upM));
  let time = ~~(new Date().getTime()/1000)+2082844800;
  tbl.head.push(...u64(time),...u64(time));
  tbl.head.push(...u16(xmin),...u16(ymin),...u16(xmax),...u16(ymax));
  let indexToLocFormat = 1;
  tbl.head.push(0,0,0,8,0,2,0,indexToLocFormat,0,0);

  tbl.hhea.push(0,1,0,0);
  tbl.hhea.push(...u16(info.asc),...u16(info.dsc),...u16(info.line_gap??0));
  tbl.hhea.push(...u16(advw),...u16(mlsb),...u16(mrsb),...u16(mext));
  tbl.hhea.push(0,1,0,0,0,0);
  tbl.hhea.push(0,0,0,0,0,0,0,0,0,0);
  tbl.hhea.push(...u16(n_hmetric));

  tbl.maxp.push(0,1,0,0);
  tbl.maxp.push(...u16(glyphs.length));
  tbl.maxp.push(...u16(maxa(glyphs.map(x=>suma(x.contours.map(y=>y.length))))));
  tbl.maxp.push(...u16(maxa(glyphs.map(x=>x.contours.length))));
  tbl.maxp.push(0,0,0,0);
  tbl.maxp.push(0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);

  for (let i = 0; i < glyphs.length; i++){
    tbl.hmtx.push(...u16(glyphs[i].advw));
    tbl.hmtx.push(...u16(glyphs[i].lsb));
  }

  tbl.cmap.push(0,0,0,1 );
  tbl.cmap.push(0,0,0,3 );
  tbl.cmap.push(0,0,0,12);

  tbl.cmap.push(0,4);
  tbl.cmap.push(0,0);//length
  tbl.cmap.push(0,0);

  let segs = [];
  for (let i = 0; i < glyphs.length; i++){
    if (segs.length && glyphs[i].unicode == segs.at(-1)[1]+1){
      segs.at(-1)[1]++;
    }else{
      segs.push([glyphs[i].unicode,glyphs[i].unicode]);
    }
  }
  segs.push([0xffff,0xffff]);

  tbl.cmap.push(...u16(segs.length*2));
  let sr = 1<<(~~Math.log2(segs.length)+1);
  tbl.cmap.push(...u16( sr ));
  tbl.cmap.push(...u16( ~~Math.log2(sr/2) ));
  tbl.cmap.push(...u16( 2*segs.length-sr ));
  for (let i = 0; i < segs.length; i++){
    tbl.cmap.push(...u16(segs[i][1]));
  }
  tbl.cmap.push(0,0);
  for (let i = 0; i < segs.length; i++){
    tbl.cmap.push(...u16(segs[i][0]));
  }
  let ng = 0;
  for (let i = 0; i < segs.length-1; i++){
    tbl.cmap.push(...u16(   (ng-segs[i][0]+65536)%65536 ));
    ng += segs[i][1]-segs[i][0]+1;
  }
  tbl.cmap.push(0,1);
  for (let i = 0; i < segs.length; i++){
    tbl.cmap.push(0,0);
  }
  let cmapl = tbl.cmap.length-12;
  ;[tbl.cmap[14],tbl.cmap[15]] = u16(cmapl);


  tbl.name.push(0,0,0,19*3);
  tbl.name.push(0,0);//stringOffset

  let nn = 0; let dnn = 0;
  let nstr = [];
  let nss = [[],[],[]]
  function add_name(id,str){
    nstr.push(...str.split('').map(x=>[0,x.charCodeAt(0)]).flat());
    nss[0].push(0,0);
    nss[0].push(0,4);
    nss[0].push(0,0);
    nss[0].push(0,id);
    nss[0].push(...u16(dnn=str.length*2));
    nss[0].push(...u16(nn));
    nn+=dnn;

    nstr.push(...str.split('').map(x=>x.charCodeAt(0)));
    nss[1].push(0,1);
    nss[1].push(0,0);
    nss[1].push(0,0);
    nss[1].push(0,id);
    nss[1].push(...u16(dnn=str.length));
    nss[1].push(...u16(nn));
    nn+=dnn;

    nstr.push(...str.split('').map(x=>[0,x.charCodeAt(0)]).flat());
    nss[2].push(0,3);
    nss[2].push(0,1);
    nss[2].push(4,9);
    nss[2].push(0,id);
    nss[2].push(...u16(dnn=str.length*2));
    nss[2].push(...u16(nn));
    nn+=dnn;
  }

  add_name(0,info.copyright??"Copyright notice");
  add_name(1,info.family);
  add_name(2,info.style);
  add_name(3,info.family+' '+info.style);
  add_name(4,info.family+' '+info.style);
  add_name(5,info.version??"0.0");
  add_name(6,(info.family+' '+info.style).replace(/[^A-Za-z]/g,'_'));
  add_name(7,info.trademark??"Trademark notice");
  add_name(8,info.manufacturer??"Manufacturer name");
  add_name(9,info.designer??"Designer of the typeface");
  add_name(10,info.description??"Description of the typeface");
  add_name(11,info.venderURL??"URL of the font vendor");
  add_name(12,info.designerURL??"URL of the font designer");
  add_name(13,info.license??"License description");
  add_name(14,info.licenseURL??"License information URL");

  add_name(16,info.family);
  add_name(17,info.style);
  add_name(18,info.family+' '+info.style);
  add_name(19,info.sample??"sphinx of black quartz judge my vow");

  tbl.name.push(...nss[0]);
  tbl.name.push(...nss[1]);
  tbl.name.push(...nss[2]);
  ;[tbl.name[4],tbl.name[5]] = u16(tbl.name.length);

  tbl.name.push(...nstr);

  tbl.post.push(0,3,0,0);
  tbl.post.push(0,0,0,0);
  tbl.post.push(0,0);//underline position
  tbl.post.push(0,advw>>7);//underline thickness
  tbl.post.push(0,0,0,0);//monospace?
  tbl.post.push(0,0,0,1);//mem use
  tbl.post.push(0,1,0,0);
  tbl.post.push(0,0,0,1);
  tbl.post.push(0,1,0,0);

  for (let i = 0; i < glyphs.length; i++){
    tbl.loca.push(...u32(tbl.glyf.length));

    tbl.glyf.push(...u16(glyphs[i].contours.length));
    tbl.glyf.push(...u16(~~glyphs[i].bb.xmin));
    tbl.glyf.push(...u16(~~glyphs[i].bb.ymin));
    tbl.glyf.push(...u16(~~glyphs[i].bb.xmax));
    tbl.glyf.push(...u16(~~glyphs[i].bb.ymax));
    let n = 0;
    for (let j = 0; j < glyphs[i].contours.length; j++){
      n += glyphs[i].contours[j].length;
      tbl.glyf.push(...u16(n-1));
    }
    tbl.glyf.push(0,0);
    for (let j = 0; j < glyphs[i].contours.length; j++){
      for (let k = 0; k < glyphs[i].contours[j].length; k++){
        let oncurve = glyphs[i].contours[j][k][2]??1;
        tbl.glyf.push(oncurve);
      }
    }
    let px = 0;
    let py = 0;
    for (let j = 0; j < glyphs[i].contours.length; j++){
      for (let k = 0; k < glyphs[i].contours[j].length; k++){
        let x = glyphs[i].contours[j][k][0];
        tbl.glyf.push(...u16((~~x)-px));
        px=~~x;
      }
    }
    for (let j = 0; j < glyphs[i].contours.length; j++){
      for (let k = 0; k < glyphs[i].contours[j].length; k++){
        let y = glyphs[i].contours[j][k][1];
        tbl.glyf.push(...u16((~~y)-py));
        py=~~y;
      }
    }
  }
  tbl.loca.push(...u32(tbl.glyf.length));

  tbl.kern.push(0,0,0,1);
  tbl.kern.push(0,0);
  tbl.kern.push(0,0);//length
  tbl.kern.push(0,1);
  let npairs = kerning.length;
  tbl.kern.push(...u16(npairs));
  let l2np = ~~Math.log2(npairs);
  let l2pnp = 1<<l2np;
  tbl.kern.push(...u16(l2pnp*6));
  tbl.kern.push(...u16(l2np));
  tbl.kern.push(...u16((npairs-l2pnp)*6));
  
  for (let i = 0; i < kerning.length; i++){
    let {l,r,val} = kerning[i];
    let i0 = u2idx[l];
    let i1 = u2idx[r];
    tbl.kern.push(...u16(i0));
    tbl.kern.push(...u16(i1));
    tbl.kern.push(...u16(~~val));

  }
  [tbl.kern[6],tbl.kern[7]] = u16(tbl.kern.length-4);

  tbl['OS/2'].push(0,1);
  tbl['OS/2'].push(...u16(advw));
  tbl['OS/2'].push(...u16(500));
  tbl['OS/2'].push(...u16(5));
  tbl['OS/2'].push(0,0);
  tbl['OS/2'].push(...u16(advw>>1));
  tbl['OS/2'].push(...u16(advw>>1));
  tbl['OS/2'].push(0,0);
  tbl['OS/2'].push(0,0);
  tbl['OS/2'].push(...u16(advw>>1));
  tbl['OS/2'].push(...u16(advw>>1));
  tbl['OS/2'].push(0,0);
  tbl['OS/2'].push(0,0);
  tbl['OS/2'].push(...u16(advw>>7));
  tbl['OS/2'].push(...u16(advw>>2));
  tbl['OS/2'].push(0,0);
  tbl['OS/2'].push(0,0,0,0,0,0,0,0,0,0);

  tbl['OS/2'].push(0,0,0,0);
  tbl['OS/2'].push(0,0,0,0);
  tbl['OS/2'].push(0,0,0,0);
  tbl['OS/2'].push(0,0,0,0);

  tbl['OS/2'].push(0x70,0x77,0x6e,0x64);
  tbl['OS/2'].push(0,0b0100_0000);
  tbl['OS/2'].push(...u16(glyphs[1].unicode));
  tbl['OS/2'].push(...u16(glyphs.at(-1).unicode));

  tbl['OS/2'].push(...u16(info.asc));
  tbl['OS/2'].push(...u16(info.dsc));
  tbl['OS/2'].push(...u16(info.line_gap??0));
  tbl['OS/2'].push(...u16(info.asc));
  tbl['OS/2'].push(...u16(info.dsc));

  tbl['OS/2'].push(0,0,0,1);
  tbl['OS/2'].push(0,0,0,0);


  let bytes = [0,1,0,0];
  let ntbl = Object.keys(tbl).length;
  bytes.push(...u16(ntbl));
  let l2nbtl = ~~Math.log2(ntbl);
  let srn = 1<<(l2nbtl+4);
  bytes.push(...u16(srn));
  bytes.push(...u16(l2nbtl));
  bytes.push(...u16(ntbl*16-srn));
  
  let ltbl = bytes.length+ntbl*16;
  let headpos = 0;
  for (let k in tbl){
    bytes.push(k.charCodeAt(0));
    bytes.push(k.charCodeAt(1));
    bytes.push(k.charCodeAt(2));
    bytes.push(k.charCodeAt(3));
    bytes.push(...u32(chksum(tbl[k])));
    bytes.push(...u32(ltbl));
    bytes.push(...u32(tbl[k].length));
    if (k == 'head') headpos = ltbl;
    ltbl += tbl[k].length;
    while(ltbl % 4){
      ltbl++;
    }
  }
  
  for (let k in tbl){
    tbl[k].forEach(x=>bytes.push(x));
    while (bytes.length %4) bytes.push(0);
  }
  
  ;[bytes[headpos+8],bytes[headpos+9],bytes[headpos+10],bytes[headpos+11]] = u32(((0xB1B0AFBA>>>0)-chksum(bytes))>>>0);
  console.log(chksum(bytes).toString(16));
  return bytes;

}

if (typeof module !== 'undefined'){
  module.exports = {encode_ttf};
}