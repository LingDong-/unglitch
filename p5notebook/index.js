/* global describe showdown CodeMirror */
function read_file(path){
  let xhr = new XMLHttpRequest();
  xhr.open("GET", path,false);
  xhr.send();
  return xhr.responseText;
}

var q = window.location.href.split("?")[1];
if (!q){
  q = "notebooks/fish.md";
}

let md = read_file(q);
let converter = new showdown.Converter();


let g_exports = {};

converter.setOption('tables', true);

let t_blocks = md.split('```');
let blocks = [];
let flip = 0;
for (let i = 0; i < t_blocks.length; i++){
  if (flip == 0){
    blocks.push(t_blocks[i]);
    flip = 1;
  }else if (flip == 1){
    if (t_blocks[i].startsWith('js p5')){
      blocks.push(t_blocks[i].slice(5));
      flip = 0;
    }else{
      blocks[blocks.length-1] += '```'+t_blocks[i]+'```';
      flip = 2;
    }
  }else{
    blocks[blocks.length-1] += t_blocks[i];
    flip = 1;
  }
}


for (let i = 0; i < blocks.length; i++){
  if (i % 2 == 0){
    
    let html = converter.makeHtml(blocks[i]);
    let div = document.createElement("div");
    div.innerHTML = html;
    document.body.appendChild(div);
  }else{
    let Id = `out-`+i;

    let div = document.createElement("div");
    div.style.position="relative";
    div.style.whitespace="no-wrap";
    div.style.height="500px";
    // div.style.border="1px solid black";
    
    let ta = document.createElement("div");
    ta.style.width="calc(100% - 500px)";
    ta.style.height="370px";
    ta.style.border = "1px solid black";
    ta.style.borderRight = "none";
    ta.style.display="inline-block";
    ta.style.position="absolute";
    ta.style.left="0px";
    ta.style.top="30px";
    
    let lg = document.createElement("div");
    lg.style.position="absolute";
    lg.style.left="0px";
    lg.style.top="400px";
    lg.style.width="calc(100% - 500px)";
    lg.style.height="100px";
    lg.style.borderBottom = "1px solid black";
    lg.style.borderLeft = "1px solid black";
    lg.id = `log-`+i;
    lg.style.fontSize="14px";
    lg.style.overflow="scroll";
    
    let make_out = function(){
      let out = document.createElement("iframe");
      out.id = Id;
      out.style.width = "500px";
      out.style.height = "500px";
      out.style.border = "1px solid black";
      out.style.display="inline-block"
      out.src="javascript:void(0)";
      out.style.position="absolute";
      out.style.left="calc(100% - 500px)";
      out.style.top = "0px";
      return out;
    }
    let out = make_out();

    let CM = CodeMirror(ta, {
      lineNumbers:true,
      matchBrackets: true,
      theme:"simple",
      mode:  "javascript",
      indentWithTabs: false,
      indentUnit: 2,
      extraKeys:{
        'Ctrl-/': 'toggleComment',
        'Cmd-/': 'toggleComment'
      }
    });
    CM.setValue(blocks[i]);
    CM.setSize(null,null);
    
    let biv = document.createElement("div");
    biv.style.position="absolute";
    biv.style.left = "0px";
    biv.style.top="0px";
    biv.style.width="calc(100% - 500px)";
    biv.style.height="30px";
    biv.style.borderTop = "1px solid black";
    biv.style.borderLeft = "1px solid black";
    
    let ttl = document.createElement("span");
    ttl.innerHTML = "p5<sub>*</sub>js";
    ttl.style="font-size:16px;margin:3px;margin-left:6px;margin-right:6px;"
    biv.appendChild(ttl)
    
    let btn = document.createElement("button");
    btn.style.margin="3px";
    btn.innerHTML="run";
    btn.onclick = function(){
      let code =CM.getValue();
      
      let lines = code.split('\n');
      for (let j = 0; j < lines.length; j++){
        let dir_e = '//#export';
        let dir_i = '//#import';
        if (lines[j].startsWith(dir_e)){
          let names = lines[j].slice(dir_e.length).split(' ').map(x=>x.trim()).filter(x=>x.length);
          console.log('export',names);
          let fstr = `(function(){${code};return [${names.join(',')}];})()`;
          let funs = eval(fstr);
          for (let k = 0; k < funs.length; k++){
            g_exports[names[k]] = funs[k];
          }
        }else if (lines[j].startsWith(dir_i)){
          
          let names = lines[j].slice(dir_e.length).split(' ').map(x=>x.trim()).filter(x=>x.length);
          console.log('import',names);
          lines[j] = names.map(x=>g_exports[x].toString()).join(';\n');
        }
      }
      code = lines.join('\n');
      // console.log(code);
      
      lg.innerHTML="";
      let old_out = document.getElementById(Id);
      if (old_out){
        // old_out.contentWindow.location.reload();
        old_out.remove();
      }old_out = document.getElementById(Id);
      if (old_out){
        // old_out.contentWindow.location.reload();
        old_out.remove();
      }old_out = document.getElementById(Id);
      if (old_out){
        // old_out.contentWindow.location.reload();
        old_out.remove();
      }
      
      let out = make_out();
      
      // out.contentWindow.location.reload();
      // out.onload = function(){
      function justdoit(){
        try{
          out.contentWindow.document.open();
          out.contentWindow.document.write(`
          <style> body {margin:0px} </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.1/p5.js"></script>
          <script>
          let old_log = console.log;
          console.log = function(){
            old_log(...arguments);
            let div = document.createElement("pre");
            div.style.margin="0px";
            div.innerHTML = [...arguments].map(JSON.stringify).join(' ');
            parent.document.getElementById('log-${i}').appendChild(div);
          }
          ;
          </script>
          <script>
          ${code}
          </script>
          `);
          out.contentWindow.document.close();
          out.contentWindow.onerror=function(e) {
            let div = document.createElement("div");
            div.innerHTML = e;
            document.getElementById(`log-${i}`).appendChild(div);
            return false;
          }

        }catch(e){
          setTimeout(justdoit,1);
        }
      }
      setTimeout(justdoit,1);
      // }
      div.appendChild(out);

      
    }
    biv.appendChild(btn);
    btn.click();

    let btn2 = document.createElement("button");
    btn2.style.margin="3px";
    btn2.innerHTML="stop";
    btn2.onclick = function(){
      let old_out = document.getElementById(Id);
      if (old_out){
        old_out.contentWindow.location.reload();
        old_out.remove();
      }
      let out = make_out();
      div.appendChild(out);
    }
    biv.appendChild(btn2);
    
    let btn3 = document.createElement("button");
    btn3.style.margin="3px";
    btn3.innerHTML="reset";
    btn3.onclick = function(){
      CM.setValue(blocks[i]);
    }
    biv.appendChild(btn3);
    
    
    document.body.appendChild(div);
    
    div.appendChild(biv);
    div.appendChild(ta);
    div.appendChild(lg);
    div.appendChild(out);
    
    CM.getWrapperElement().style.height="100%";
    
    CM.refresh();
    console.log(CM);

    
  }
  
}

let footer = document.createElement("div");
footer.style="margin-top:100px;font-size:12px"
footer.innerHTML = `<hr>
This page is automatically generated from <a href="${q}">a markdown file</a>! See <a href="https://glitch.com/edit/#!/p5notebook">the source code</a> here. 
You can generate yours too simply by visiting url https://p5notebook.glitch.me/?https://link.to.your/file.md. Lingdong Huang 2022.
`;
document.body.appendChild(footer);