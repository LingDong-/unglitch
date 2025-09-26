function createTexture(gl, options) {
  var tex = gl.createTexture();
  var target = options.target || gl.TEXTURE_2D;
  var width = options.width || 1;
  var height = options.height || 1;
  var internalFormat = options.internalFormat || gl.RGBA;
  gl.bindTexture(target, tex);
  var src = options.src;
  if (src) {
    setTextureFromElement(gl, tex, src, options);
    width = src.width;
    height = src.height;
  } else {
    setEmptyTexture(gl, tex, options);
  }
  setTextureParameters(gl, tex, options);
  return tex;
}
function setEmptyTexture(gl, tex, options) {
  var target = options.target || gl.TEXTURE_2D;
  gl.bindTexture(target, tex);
  var internalFormat = options.internalFormat || options.format || gl.RGBA;
  var format = options.format;
  var type = options.type;
  if (options.flipY !== undefined) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, options.flipY);
  }
  gl.texImage2D(target, 0, internalFormat, options.width, options.height, 0, format, type, null);
}
function setTextureSamplerParameters(gl, target, parameteriFn, options) {
  if (options.min) {
    parameteriFn.call(gl, target, gl.TEXTURE_MIN_FILTER, options.min);
  }
  if (options.mag) {
    parameteriFn.call(gl, target, gl.TEXTURE_MAG_FILTER, options.mag);
  }
}
function setTextureParameters(gl, tex, options) {
  var target = options.target || gl.TEXTURE_2D;
  gl.bindTexture(target, tex);
  setTextureSamplerParameters(gl, target, gl.texParameteri, options);
}
function setTextureFromElement(gl, tex, element, options) {
  options = options;
  var target = options.target || gl.TEXTURE_2D;
  var level = options.level || 0;
  var width = element.width;
  var height = element.height;
  var internalFormat = options.internalFormat || options.format || gl.RGBA;
  var format = options.format;
  var type = options.type;
  if (options.flipY !== undefined) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, options.flipY);
  }
  gl.bindTexture(target, tex);
  gl.texImage2D(target, level, internalFormat, format, type, element);
  setTextureParameters(gl, tex, options);
}
function createBufferInfoFromArrays(gl, arrays) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.position), gl.STATIC_DRAW);
  return {positionBuffer}
}
function setBuffersAndAttributes(gl,{program},{positionBuffer,normalBuffer,texcoordBuffer,indicesBuffer}){
  let positionLoc = gl.getAttribLocation(program, "position");
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);
}
function drawBufferInfo(gl, bufferInfo, type, count, offset, instanceCount) {
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function createProgramInfo(gl,[vsSource,fsSource]){
  
  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const infoLog = gl.getShaderInfoLog(shader);
      console.error(infoLog);
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram = gl.createProgram();

  
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    const infoLog = gl.getProgramInfoLog(shaderProgram);
    console.error(infoLog);
    return null;
  }
  return {gl,program:shaderProgram}; 
}
function setUniforms(programInfo, uniforms){
  let gl = programInfo.gl;
  let i = 0;
  for (let k in uniforms){
    console.log(k,uniforms[k]);
    if (uniforms[k].length){
      gl['uniform'+uniforms[k].length+'fv'](
        gl.getUniformLocation(programInfo.program, k),
        uniforms[k]
      );
    }else if (uniforms[k].toString() == "[object WebGLTexture]"){
      gl.activeTexture(gl['TEXTURE'+i]);
      gl.bindTexture(gl.TEXTURE_2D, uniforms[k]);
      gl.uniform1i(gl.getUniformLocation(programInfo.program, k), i++);
    }else if (k == 'method'){
      gl.uniform1i(gl.getUniformLocation(programInfo.program, k),uniforms[k]);
    }else{
      gl.uniform1f(gl.getUniformLocation(programInfo.program, k),uniforms[k]);
    }
  }
}



var UpsampThresh = function(canvas,oW,oH){
  var that = this;
  
  var vs = `
  attribute vec4 position;
  void main() {
    gl_Position = position;
  }`

  var fs_thresh = `
  precision mediump float;
  uniform sampler2D tex;
  uniform vec2 resolution;
  uniform float thresh;

  void main() {
    vec4 col = texture2D(tex,gl_FragCoord.xy/resolution);
    float luma = col.x * 0.299 + col.y * 0.587 + col.z * 0.114;
    gl_FragColor = luma > thresh ? vec4(1.,1.,1.,1.) : vec4(0.,0.,0.,1.);

  }`

  var fs_upsamp = `
    precision mediump float;
    //https://stackoverflow.com/questions/13501081/efficient-bicubic-filtering-code-in-glsl
    // from http://www.java-gaming.org/index.php?topic=35123.0

    uniform vec2 texSize;
    uniform vec2 resolution;
    uniform sampler2D tex;
    uniform int method;


    // vec4 cubic(float x){
    //   float x2 = x * x;
    //   float x3 = x2 * x;
    //   vec4 w;
    //   w.x =   -x3 + 3.0*x2 - 3.0*x + 1.0;
    //   w.y =  3.0*x3 - 6.0*x2       + 4.0;
    //   w.z = -3.0*x3 + 3.0*x2 + 3.0*x + 1.0;
    //   w.w =  x3;
    //   return w / 6.0;
    // }
    vec4 cubic(float v){
        vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
        vec4 s = n * n * n;
        float x = s.x;
        float y = s.y - 4.0 * s.x;
        float z = s.z - 4.0 * s.y + 6.0 * s.x;
        float w = 6.0 - x - y - z;
        return vec4(x, y, z, w) * (1.0/6.0);
    }

    // Catmull-Rom spline actually passes through control points
    vec4 cubic_catmullrom(float x)
    {
        const float s = 0.2; // potentially adjustable parameter
        float x2 = x * x;
        float x3 = x2 * x;
        vec4 w;
        w.x =    -s*x3 +     2.0*s*x2 - s*x + 0.0;
        w.y = (2.0-s)*x3 +   (s-3.0)*x2       + 1.0;
        w.z = (s-2.0)*x3 + (3.0-2.0*s)*x2 + s*x + 0.0;
        w.w =     s*x3 -       s*x2       + 0.0;
        return w;
    }

    // modified from https://gitlab.com/higan/xml-shaders/blob/master/shaders/OpenGL/v1.0/Lanczos%20(4tap).shader
    const float PI = 3.1415926535897932384626433832795;
    #define FIX(c) max(abs(c), 1e-5);
    vec4 weight4(float x){
        const float radius = 2.0;
        vec4 sampl = FIX(PI * vec4(1.0 + x, x, 1.0 - x, 2.0 - x));
        // Lanczos2. Note: we normalize below, so no point in multiplying by radius.
        vec4 ret = /*radius **/ sin(sampl) * sin(sampl / radius) / (sampl * sampl);
        // Normalize
        return ret / dot(ret, vec4(1.0));
    }
    vec4 line(sampler2D sampler, float ypos, vec4 xpos, vec4 linetaps){
        mat4 m;
        m[0].xyz = texture2D(sampler, vec2(xpos.x, ypos)).xyz;
        m[1].xyz = texture2D(sampler, vec2(xpos.y, ypos)).xyz;
        m[2].xyz = texture2D(sampler, vec2(xpos.z, ypos)).xyz;
        m[3].xyz = texture2D(sampler, vec2(xpos.w, ypos)).xyz;
        return (m * linetaps);
    }
    vec4 textureLanczos(sampler2D sampler, vec2 texCoords){
      vec2 stepxy = 1.0 / texSize;
      vec2 pos = texCoords + stepxy * 0.5;
      vec2 f = fract(pos / stepxy);

      vec2 xystart = (-1.5 - f) * stepxy + pos;
      vec4 xpos = vec4(
          xystart.x,
          xystart.x + stepxy.x,
          xystart.x + stepxy.x * 2.0,
          xystart.x + stepxy.x * 3.0);

      vec4 linetaps   = weight4(f.x);
      vec4 columntaps = weight4(f.y);
      vec4 fragcolor = vec4(0.0,0.0,0.0,1.0);

      fragcolor.rgb = vec3(mat4(
          line(sampler,xystart.y                 , xpos, linetaps),
          line(sampler,xystart.y + stepxy.y      , xpos, linetaps),
          line(sampler,xystart.y + stepxy.y * 2.0, xpos, linetaps),
          line(sampler,xystart.y + stepxy.y * 3.0, xpos, linetaps)) * columntaps);
      return fragcolor;
    }



    vec4 textureBicubic(sampler2D sampler, vec2 texCoords){
        vec2 invTexSize = 1.0 / texSize;
        texCoords = texCoords * texSize - 0.5;

        vec2 fxy = fract(texCoords);
        texCoords -= fxy;

        vec4 xcubic = method==2 ? cubic_catmullrom(fxy.x) : cubic(fxy.x);
        vec4 ycubic = method==2 ? cubic_catmullrom(fxy.y) : cubic(fxy.y);

        vec4 c = texCoords.xxyy + vec2 (-0.5, +1.5).xyxy;

        vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
        vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;

        offset *= invTexSize.xxyy;

        vec4 sample0 = texture2D(sampler, offset.xz);
        vec4 sample1 = texture2D(sampler, offset.yz);
        vec4 sample2 = texture2D(sampler, offset.xw);
        vec4 sample3 = texture2D(sampler, offset.yw);

        float sx = s.x / (s.x + s.y);
        float sy = s.z / (s.z + s.w);

        return mix(
           mix(sample3, sample2, sx), mix(sample1, sample0, sx)
        , sy);
    }

    void main() {
      vec2 vUv = gl_FragCoord.xy/resolution;
      vec4 col = method <= 1? texture2D(tex,vUv) : (method == 4 ? textureLanczos(tex,vUv) : textureBicubic(tex,vUv));
      gl_FragColor = col;
    }
  `
  
  const gl = document.createElement("canvas").getContext("webgl");
  document.body.appendChild(gl.canvas)
  
  // var floatTextures = gl.getExtension('OES_texture_float');
  // console.log(floatTextures);
  
  gl.canvas.width = oW;
  gl.canvas.height = oH;
  
  gl.canvas.style.visibility="hidden"
  gl.canvas.style.zIndex="-1000"
  gl.canvas.style.pointerEvents="none";
  gl.canvas.style.position="absolute";
  gl.canvas.style.left="0px";
  gl.canvas.style.top="0px";
  
  const programInfoUpsamp = createProgramInfo(gl, [vs,fs_upsamp]);
  const programInfoThresh = createProgramInfo(gl, [vs,fs_thresh]);

  const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    normals: [0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1],
    texcoords:[0,0, 1,0, 0,1, 0,1, 1,0, 1,1],
    indices: [0,1,2, 3,4,5],
  };
  const bufferInfo = createBufferInfoFromArrays(gl, arrays);

  var texture0 = createTexture(gl,{
    src:canvas,
    min:gl.NEAREST,
    mag:gl.NEAREST,
    flipY:true,
    format:gl.RGBA,
    type:gl.UNSIGNED_BYTE,
    internalFormat:gl.RGBA,
  })
  
  var texture1 = createTexture(gl,{
    src:canvas,
    min:gl.LINEAR,
    mag:gl.LINEAR,
    flipY:true,
    format:gl.RGBA,
    type:gl.UNSIGNED_BYTE,
    internalFormat:gl.RGBA,
  })

  var slots = [];
  
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  function updateTexture(dst,src){
    gl.bindTexture(gl.TEXTURE_2D, dst);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
  }

  var pass = that.pass = function(programInfo,uni,aa) {

    const uniforms = Object.assign({
      tex: aa?texture1:texture0,
      resolution: [gl.canvas.width, gl.canvas.height],
      texSize: [canvas.width,canvas.height]
    },uni);
    
    gl.useProgram(programInfo.program);
    setBuffersAndAttributes(gl, programInfo, bufferInfo);
    setUniforms(programInfo, uniforms);
    drawBufferInfo(gl, bufferInfo);

    updateTexture(aa?texture1:texture0,gl.canvas);
  }
  
  that.readout = function(outCanvas){
    outCanvas.getContext('2d').drawImage(gl.canvas,0,0);
  }
  
  that.process = function(method,thresh){  
    updateTexture(method?texture1:texture0,canvas);
    // console.log(programInfoUpsamp,programInfoThresh);

    pass(programInfoUpsamp,{method},method);
    pass(programInfoThresh,{thresh},method);
    

  }

  that.gl = gl;
}

