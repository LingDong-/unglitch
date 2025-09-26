const fs = require('fs');
const {execSync, exec} = require("child_process");
let projs = fs.readdirSync("../glitch_raw").filter(x=>!x.startsWith('.'));
for (let i = 0; i < projs.length; i++){
  console.log(projs[i]);

  execSync(`rm -rf ${projs[i]}`);
  execSync(`cp -r ../glitch_raw/${projs[i]} ${projs[i]}`);
  execSync(`rm -rf ${projs[i]}/.[!.]* ..?*`);
  execSync(`rm -rf ${projs[i]}/LICENSE`);
  execSync(`rm -rf ${projs[i]}/package.json`);
  execSync(`rm -rf ${projs[i]}/package-lock.json`);
  execSync(`rm -rf ${projs[i]}/glitch-assets/illustration.svg`);
  execSync(`rm -rf ${projs[i]}/*/*.zip`);
  execSync(`rm -rf ${projs[i]}/*.zip`);
  execSync(`find ${projs[i]} -type d -empty -delete`);

  if (fs.existsSync(`${projs[i]}/README.md`)){
    let txt = fs.readFileSync(`${projs[i]}/README.md`).toString();
    if (txt.includes("elcome to Glitch") || txt.includes("# Hello website!")){
      execSync(`rm -rf ${projs[i]}/README.md`);
    }
  }
  let src = [];
  let pats = ["*.js","*.html","*.md","*.css","**/*.js","**/*.html","**/*.md","**/*.css",];
  for (let j = 0; j < pats.length; j++){
    try{
      src.push(...execSync(`ls ${projs[i]}/${pats[j]} 2>/dev/null`).toString().split("\n").filter(x=>x.length));
    }catch(e){

    }
  }
  for (let j = 0; j < src.length; j++){
    let txt = fs.readFileSync(src[j]).toString();
    if (src[j].includes('/')){
      txt = txt.replace(/https?:\/\/cdn\.glitch\.[^"'`]*?\/[^"'`]*(%2F|\/)([^"'`]*?)(\?(v=)?\d+)?(?=('|"|`|$))/g,`/${projs[i]}/glitch-assets/$2`);
    }else{
      txt = txt.replace(/https?:\/\/cdn\.glitch\.[^"'`]*?\/[^"'`]*(%2F|\/)([^"'`]*?)(\?(v=)?\d+)?(?=('|"|`|$))/g,'glitch-assets/$2');
    }
    fs.writeFileSync(src[j],txt);
  }
  
}