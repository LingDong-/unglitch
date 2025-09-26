function menu2html(menu) {
  function short_id(){
    return '_'+String.fromCharCode(...new Array(6).fill(0).map(x=>(~~(Math.random()*26)+0x41)));
  }
  let ss = ``;
  
  function submenu(menu,dx,dy,path) {
    let idx = 0;
    
    let o = `<div style="position:absolute;left:${dx}px;top:${dy}px;display:none;text-align:left">`;

    let mw = 100;
    for (let k in menu){
      mw = Math.max(mw,(k.length+1)*10+20);
    }
    let subid = short_id();

    for (let k in menu) {
      
      let ome = `this.style.background='#555';`;
      let oml = `this.style.background='black';`;
      let oc  = ``;
      let ih  = ``;
      
      if (typeof menu[k] == "function"){
        let id = short_id();
        oc += `Array.from(document.getElementsByClassName('__m2h_group')).forEach(x=>{setTimeout(function(){(x.childNodes[1]??({style:{display:'none'}})).style.display='none';x.style.background='black';},10)});`
        oc += `if (!window.__m2h_${id}){eval(document.getElementById('__m2h_s${id}').innerHTML)};__m2h_${id}();  `
        ss += `<script id="__m2h_s${id}">window.__m2h_${id} = ${menu[k].toString()}<`+`/script>`;

        if (k[0] == '[' && k[2] == ']'){
          oc += `this.innerHTML = '[' + (this.innerHTML[1] == 'x' ? ' ' : 'x') + this.innerHTML.slice(2); `
        }
        if (k[0] == '(' && k[2] == ')'){
          oc += `Array.from(document.getElementsByClassName('__m2h_sib${subid}')).forEach(x=>{if (x.innerHTML[0] == '(' && x.innerHTML[2] == ')' ) {x.innerHTML = '( '+x.innerHTML.slice(2)}  }); this.innerHTML = '(*' + this.innerHTML.slice(2); `
        }

        ih += `${k}`
      }else{

        if (k.startsWith('---')){
          ih += '<hr style=height:1px;border-width:0;color:gray;background-color:white;"/>';
          subid = short_id();
        }else{
          ome += `this.childNodes[1].style.display='block';`
          oml += `this.childNodes[1].style.display='none';`
          ih += `${(k)}${submenu(menu[k],mw,0,`${path}/${k}`)}${'<div style="position:absolute;top:0px;right:5px;">&gt;</div>'}`
        }
        
      }
      
      o += `<div id="${path}/${k}" class="__m2h_item __m2h_sib${subid}" style="cursor:pointer;position:absolute;left:0px;top:${idx*20}px;background:black;color:white;width:${mw-20}px;height:20px;padding-left:10px;padding-right:10px" `
      o += `onmouseenter="${ome}" onmouseleave="${oml}" onclick="${oc}" >${ih}</div>`
      idx++;
    }
    o += `</div>`
    return o;
  }  
  
  let o = ``;
  let w = 0;
  for (let k in menu) {
    let ww = k.length*10+20;
    o += `<div class="__m2h_group" style="cursor:pointer;position:absolute;left:${w}px;top:0px;width:${ww}px;height:20px;background:black;color:white;text-align:center" `
    o += `onmouseenter="if ((this.childNodes[1]??({style:{display:'none'}})).style.display=='none'){this.style.background='#222'}"`;
    o += `onmouseleave="if ((this.childNodes[1]??({style:{display:'none'}})).style.display=='none'){this.style.background='black'}"`;
    
    if (typeof menu[k] == "function"){
      let id = short_id();
      o += ` onclick="`
      o += `if (!window.__m2h_${id}){eval(document.getElementById('__m2h_s${id}').innerHTML)};__m2h_${id}()`
      ss += `<script id="__m2h_s${id}">window.__m2h_${id} = ${menu[k].toString()}<`+`/script>`;
      o += `" >${k}</div>`
    }else{
      o += ` onclick="`
      o += `var __m2h_od=this.childNodes[1].style.display=='block';`
      o += `Array.from(document.getElementsByClassName('__m2h_group')).forEach(x=>{(x.childNodes[1]??({style:{display:'none'}})).style.display='none';x.style.background='black'});`;
      o += `this.childNodes[1].style.display=__m2h_od?'none':'block';` 
      o += `this.style.background='#555';`;
      o += `" >${k}${submenu(menu[k],0,20,k)}</div>`
    }
    
    w += ww;
  }
  return `<div style="position:absolute;left:0px;top:0px;line-height:20px;font-family:'Courier New';font-size:16px;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;">${ss}${o}</div>`;
}
if (typeof module !== 'undefined')module.exports={menu2html}
