/*global describe THREE*/

document.body.style.margin="0"
let div = document.createElement("div");
div.innerHTML = "generating... please wait";
div.style="position:absolute;font-family:monospace;left:5px;top:5px;font-size:16px;"
document.body.appendChild(div);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias:true});

renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setSize( 720,720 );
// renderer.setClearColor( 0xfedcba, 1);
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

renderer.setClearColor( 0xfaebd7, 1);
document.body.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );

const controls = new THREE.OrbitControls( camera, renderer.domElement );
camera.position.set(0,0,300);
controls.update();


function shade_trigs(ts){
  for (let i = 0; i < ts.length; i++){
    
    let [a,b,c,s] = ts[i];
    let u = v_sub(...b,...a);
    let v = v_sub(...b,...c);
    let n = v_cross(...u,...v);
    if (n[0]+n[1]+n[2]){
      n = v_norm(...n);
    }
    
    // let g = 0.5;
    // let g = Math.abs(v_dot(...v_norm(1,2,3),...n));
    let g = Math.abs(v_dot(...v_norm(1,2,3),...n))*0.5+0.25;
    // let g = Math.min(Math.max(Math.abs(v_dot(...v_norm(1,2,3),...n))*3.0-1.0,0),1);
    let rr = ((g*(s[3]-s[0])+s[0]));
    let gg = ((g*(s[4]-s[1])+s[1]));
    let bb = ((g*(s[5]-s[2])+s[2]));

    ts[i][3] = [rr,gg,bb];
  }
  return ts;
}


function make_mesh(faces){
  let material = new THREE.MeshBasicMaterial({vertexColors:true});
  // let material = new THREE.MeshBasicMaterial({vertexColors:true,wireframe:true});
  
  let vertices = new Float32Array(faces.map(x=>x.slice(0,3)).flat().flat());
  let colorArray = new Float32Array(faces.map(x=>x[3].slice(0,3).concat(x[3].slice(0,3)).concat(x[3].slice(0,3))).flat());
  // console.log(colorArray)
  // console.log(faces);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  geometry.setAttribute( 'normal',   new THREE.BufferAttribute( new Float32Array(vertices.length).fill(0), 3 ) );
  geometry.setAttribute( 'color',     new THREE.BufferAttribute(colorArray, 3));
  // geometry.computeFaceNormals();
  geometry.computeVertexNormals();
  geometry.attributes.normal.needsUpdate = true;
  // 
  const mesh = new THREE.Mesh( geometry, material );
  mesh.matrixAutoUpdate  = true;
  // mesh.frustumCulled = false;
  // mesh.geometry.computeFaceNormals();

  
  console.log(mesh);
  mesh.position.y = -150;
  return mesh;
}


setTimeout(function(){
  let ff = shade_trigs(trfm_faces(m_mult(m_rotz(PI/2),m_scal(0.1,0.1,0.1)),branch()));
  // let ff = shade_trigs(trfm_faces(m_mult(m_rotz(PI/2),m_scal(0.5,0.5,0.5)),leaf()));
  // download_stl("osmfrag",ff);
  scene.add(make_mesh(ff));
  document.body.removeChild(div);
},10);



const animate = function () {
  requestAnimationFrame( animate );
  controls.update();
  renderer.render( scene, camera );
};

animate();




const vignette = document.createElement('div');
vignette.style.position = 'absolute';
vignette.style.top = 0;
vignette.style.left = 0;
vignette.style.width = '100%';
vignette.style.height = '100%';
vignette.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.0) 50%, rgba(90, 60, 30, 0.2) 100%)';
vignette.style.pointerEvents = 'none'; // Allow interactions with the canvas
document.body.appendChild(vignette);


function to_stl_bin(faces){
  let nb = 84+faces.length*50;
  console.log(`writing stl (binary)... estimated ${Math.round((nb/1048576)*100)/100} MB`);

  let o = new Uint8Array(nb);
  let a = new ArrayBuffer(4);
  let b = new Uint32Array(a);
  b[0] = faces.length;
  o.set(new Uint8Array(a),80);
  for (let i = 0; i < faces.length; i++){
    let d = [
      faces[i][0][0],faces[i][0][1],faces[i][0][2],
      faces[i][1][0],faces[i][1][1],faces[i][1][2],
      faces[i][2][0],faces[i][2][1],faces[i][2][2],
    ]
    let a = new ArrayBuffer(36);
    let b = new Float32Array(a);
    d.map((x,j)=>b[j]=x);
    o.set(new Uint8Array(a),84+i*50+12);
  }
  return o;
}

function download_stl(pth,faces){
  let name = `${pth}-${new Date().getTime()}.stl`;
  let data = to_stl_bin(faces);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  var blob = new Blob([data], {type: "model/stl"});
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
}

