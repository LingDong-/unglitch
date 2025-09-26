/*global describe THREE*/



document.body.style.margin="0"

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias:true});

let mesh = null;

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
  mesh = new THREE.Mesh( geometry, material );
  mesh.matrixAutoUpdate  = true;
  // mesh.frustumCulled = false;
  // mesh.geometry.computeFaceNormals();

  mesh.position.y = -150;
  return mesh;
}

let worker = new Worker('worker.js');

setTimeout(()=>{
  worker.postMessage({cmd:'make'});
},1);

worker.onmessage = function(e) {
  let ff = e.data.data;
  ff = shade_trigs(trfm_faces(m_mult(m_rotz(PI/2),m_scal(0.1,0.1,0.1)),ff));
  if (mesh){
    scene.remove(mesh);
  }
  make_mesh(ff);
  scene.add(mesh);
}


// let ff = shade_trigs(trfm_faces(m_mult(m_rotz(PI/2),m_scal(0.1,0.1,0.1)),branch()));

// let ff = shade_trigs(trfm_faces(m_mult(m_rotz(PI/2),m_scal(0.5,0.5,0.5)),leaf()));


// scene.add(make_mesh(ff));




const animate = function () {
  requestAnimationFrame( animate );
  controls.update();
  renderer.render( scene, camera );
};

animate();








