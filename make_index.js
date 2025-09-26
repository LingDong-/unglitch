const fs = require('fs');
let projs = fs.readdirSync(".").filter(x=>!x.includes("."));
let desc = JSON.parse(fs.readFileSync("desc.json").toString())
// console.log(`{\n"`+projs.join(`":"",\n"`)+`":""\n}`);
let html = `<html>
<style>
a:link {
  color: black;
}
a:visited {
  color: black;
}
a:hover {
  color: black;
}
a:active {
  color: black;
}
</style>
<div style="position:relative;top:0px;left:0px">
<img src="logo.png" width="128" height="128" style="position:absolute;top:-24px;right:20px;z-index:-10000"></img>
</div>

<body style="max-width:1080px;margin:auto;font-family:sans-serif;margin-top:50px">
<div style="margin:10px">
<h1>UNGLITCH:</h1>
<i style="font-size:20px">Selection of projects (2018-2025) by Lingdong Huang, previously hosted on <a href="https://glitch.com/">glitch.com</a>.</i>
<br><br>
<p>
Glitch ended its project hosting on July 8th, 2025. 
Across a span of 7 years, Lingdong made with Glitch a total of 276 projects, all of which now become homeless.
This website serves as an archive for some 50+ of the projects, selected based on following criteria:
<ul>
<li><b>Client-side only:</b> Those with server-side code require another hosting solution...</li>
<li><b>Not completely obsolete:</b> Demos of old tech which are completely beaten by new tech are excluded...</li>
<li><b>Self-contained project:</b> Projects that are part of larger projects or not useful on their own are not included...</li>
</ul>
As new hosting solution are found for the excluded projects, pointers will be added here for your convenience.
The rest of this page is dedicated to the list of projects hosted here: click on the links to explore!
</p>
</div>


`;

for (let i = 0; i < projs.length; i++){
  html += `<div onclick="window.location.href='/${projs[i]}'" style="display:inline-block;width:240px;height:100px;border:1px solid silver;margin:10px;border-radius:4px;background:white;overflow:hidden;cursor:pointer">
  <div style="margin:10px;">
    <b><a href="${projs[i]}">${projs[i]}</a></b>
    <p style="font-size:13px">${desc[projs[i]]}</p>
  </div>
  </div>`
}

html += `</body></html>`
fs.writeFileSync("index.html",html)