var JumpFlood = function(canvas,{precision="medium"} = {}){
  /*global describe twgl*/
  var that = this;
  
  var vs = `
  attribute vec4 position;
  void main() {
    gl_Position = position;
  }`

  var fs_init = `
  precision ${precision}p float;
  uniform sampler2D texture;
  uniform vec2 resolution;
  void main(){
    vec2 uv = gl_FragCoord.xy/resolution;
    vec4 col = texture2D(texture, uv);
    if (col.w == 1.0){
      gl_FragColor = vec4(uv, 1.0,1.0);
    }else{
      gl_FragColor = vec4(0.0);
    }
  }`

  var fs_iter = `
  precision ${precision}p float;
  uniform sampler2D texture;
  uniform vec2 resolution;
  uniform float step;

  void main(){
    float stepx = step/resolution.x;
    float stepy = step/resolution.y;
    vec2 uv = gl_FragCoord.xy/resolution;

    float md = 99999.0;
    vec4 mcol;
    for (int dx = -1; dx <= 1; dx++){
      for (int dy = -1; dy <= 1; dy++){
        vec2 duv = vec2(float(dx)*stepx , float(dy)*stepy);
        vec4 col = texture2D(texture, uv+duv);
        if (col.x != 0.0 && col.y != 0.0){
          float d = length(col.xy-uv);
          if (d < md){
            md = d;
            mcol = vec4(col.xy,1.0-d,1.0);
          }
        }
      }
    }
    gl_FragColor = mcol;
  }`


  var fs_voro = `
  precision ${precision}p float;
  uniform sampler2D texture0;
  uniform sampler2D texture;
  uniform vec2 resolution;
  uniform float step;

  void main(){

    vec2 uv = gl_FragCoord.xy/resolution;
    vec4 col = texture2D(texture0,uv);
    if (col.w != 0.0){
      gl_FragColor = vec4(col.xyz,1.0);
      return;
    }
    vec4 xyzw = texture2D(texture, uv);
    col = texture2D(texture0,xyzw.xy);
    gl_FragColor = col;

    if (col.w != 1.0){ // stupid inaccurate coordinate
      for (int i = -1; i <= 1; i++){
        for (int j = -1; j <= 1; j++){
          col = texture2D(texture0,xyzw.xy+vec2(float(j),float(i))/resolution/2.0);
          if (col.w == 1.0){
            gl_FragColor = vec4(col.xyz,1.0);
            return;
          }
        }
      }
    }
  }`

  var fs_dist = `
  precision ${precision}p float;
  uniform sampler2D texture;
  uniform vec2 resolution;

  void main(){
    vec2 uv = gl_FragCoord.xy/resolution;
    float d = texture2D(texture, uv).z;
    float c = 1.0-d;
    gl_FragColor = vec4(c,c,c,1.0);
  }`
  
  var fs_iden = `
  precision ${precision}p float;
  uniform sampler2D texture;
  uniform vec2 resolution;

  void main(){
    gl_FragColor = texture2D(texture, gl_FragCoord.xy/resolution);
  }`
  
  
  const gl = document.createElement("canvas").getContext("webgl");
  document.body.appendChild(gl.canvas)
  gl.canvas.width = canvas.width
  gl.canvas.height = canvas.height

  gl.canvas.style.visibility="hidden"
  gl.canvas.style.zIndex="-1000"
  gl.canvas.style.pointerEvents="none";
  gl.canvas.style.position="absolute";
  gl.canvas.style.left="0px";
  gl.canvas.style.top="0px";
  
  const programInfoInit = twgl.createProgramInfo(gl, [vs,fs_init]);
  const programInfoIter = twgl.createProgramInfo(gl, [vs,fs_iter]);
  const programInfoVoro = twgl.createProgramInfo(gl, [vs,fs_voro]);
  const programInfoDist = twgl.createProgramInfo(gl, [vs,fs_dist]);
  const programInfoIden = twgl.createProgramInfo(gl, [vs,fs_iden]);

  const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  };
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  var texture0 = twgl.createTexture(gl,{
    src:canvas,
    min:gl.NEAREST,
    mag:gl.NEAREST,
    flipY:true,
  })

  var texture = twgl.createTexture(gl,{
    src:canvas,
    min:gl.NEAREST,
    mag:gl.NEAREST,
    flipY:true,
  })

  var slots = [];
  
  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  function updateTexture(dst,src){
    gl.bindTexture(gl.TEXTURE_2D, dst);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
  }

  var pass = that.pass = function(programInfo,uni) {

    const uniforms = Object.assign({
      texture: texture,
      resolution: [gl.canvas.width, gl.canvas.height],
    },uni);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);

    updateTexture(texture,gl.canvas);
  }
  that.process = function({snapshots=[],depth=7}={}){  
    updateTexture(texture,canvas);

    pass(programInfoInit);
    var maxstep = Math.pow(2,depth);
    var step = maxstep;
    for (var i = 0; i <= depth; i++){
      pass(programInfoIter,{step});
      step/=2;
      if (snapshots[i]){
        snapshots[i].getContext('2d').clearRect(0,0,snapshots[i].width,snapshots[i].height);
        that.readout(snapshots[i]);
      }
    }
  }
  that.voronoi = function(){
    updateTexture(texture0,canvas);
    pass(programInfoVoro,{texture0});
  }   
  that.distanceTransform = function(){
    pass(programInfoDist,{});
  }
  
  that.save = function(idx){
    if (!slots[idx]){
      slots[idx] = twgl.createTexture(gl,{
        src:gl.canvas,
        min:gl.NEAREST,
        mag:gl.NEAREST,
        flipY:true,
      })
    }else{
      updateTexture(slots[idx],gl.canvas);
    }
  }
  that.load = function(idx){
    pass(programInfoIden,{texture:slots[idx]});
  }
  
  that.readout = function(outCanvas){
    outCanvas.getContext('2d').drawImage(gl.canvas,0,0);
  }
  
  that.definePass = function(fs){
    return twgl.createProgramInfo(gl, [vs,fs]);
  }

  that.gl = gl;
}