// Vertex shader program

const glsirds_vert = (DPI,W,H)=>`#version 300 es
  in vec4 aVertexPosition;
  in vec2 aTextureCoord;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  out highp vec2 vTextureCoord;
  
  uniform sampler2D uSampler;
  

  const lowp int DPI = ${DPI};
  const lowp int E = int(float(DPI)*2.5+0.5);
  const lowp float mu = 1.0/3.0;
  const lowp int W = ${W};
  const lowp int H = ${H};
  lowp float same[${W}];
  out lowp float pix[${W/4}];

  int round(lowp float x){
    return int(x+0.5);  
  }

  int separation(lowp float z){
    return round((1.0-mu*z)*float(E)/(2.0-mu*z));
  }
  float random (vec2 st) {
      return fract(sin(dot(st.xy,
                           vec2(12.9898,78.233)))*
          43758.5453123);
  }

  void main(void) {
    lowp vec4 col = texture(uSampler, vTextureCoord);

    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;

    if (int(vTextureCoord.x*float(W)) != 0){
      return;
    }
  
    lowp int y = int(vTextureCoord.y*float(H));
    lowp float z = col.x;
    lowp int x;

    for (x = 0; x < W; x++){
      same[x]=float(x);
    }

    for (x = 0; x < W; x++){
      lowp int s = separation(z);
      lowp int left = x-s/2;
      lowp int right = left+s;
      if (0 <= left && right <= W){
        bool visible;
        lowp int t = 1;
        lowp float zt;
        do{
          zt = z + 2.0 * (2.0 - mu * z) * float(t) / (mu * float(E));
          lowp float zmt = texture(
            uSampler, vec2(float(x-t)/float(W),vTextureCoord.y)).x;
          lowp float zpt = texture(
            uSampler, vec2(float(x+t)/float(W),vTextureCoord.y)).x;
          visible = zmt < zt && zpt < zt;
          t++;
        }while (visible && zt < 1.0);
        if (visible){
          lowp int k;
          for (k = int(same[left]); k != left && k != right; k = int(same[left])){
            if (k < right){
              left = k;
            }else{
              left = right;
              right = k;
            }
          }
          same[left]=float(right);
        }
      }
    }
    for (x = W-1; x >= 0; x--){
      if (int(same[x]) == x){
        pix[x] = random(vec2(float(x)/float(W),float(y)/float(W)));
      }else{
        pix[x] = pix[int(same[x])];
      }
    }
    for (x = 0; i < 64; i++){
      
    }
    
  }
`;

// Fragment shader program

var glsirds_frag = (DPI,W,H)=>`#version 300 es
  out highp vec4 fragColor;

  void main(void) {
    fragColor = vec4(0.0,1.0,1.0,1.0);
  }
`;

var glsirds = new function(){var that = this;
                             
  var W = 512;
  var H = 512;
  var DPI = 72;
  var gl;
  var tex_in;
  var programInfo;
  var buffers;
                            
  that.setup = function(args){
    W = args.w;
    H = args.h;
    DPI = args.DPI || DPI;
    const glcanv = document.createElement("canvas");
    glcanv.width=W;
    glcanv.height=H;
    
    gl = glcanv.getContext('webgl2');
    main();
    
    return glcanv;
  }

  that.process = function(canvas){
    if (tex_in == undefined){
      tex_in = loadTexture(canvas);
    }else{
      updateTexture(canvas);
    }
    drawScene();
  }             

  // ===============================================================================
  //
  // WebGL Bolierplate Code
  //
  // based on https://github.com/mdn/webgl-examples/blob/gh-pages/tutorial/sample3/webgl-demo.js




  function main() {


    // If we don't have a GL context, give up now

    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }
    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(glsirds_vert(DPI,W,H),glsirds_frag(DPI,W,H));

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.
    programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    buffers = initBuffers();

  }

  //
  // initBuffers
  //
  // Initialize the buffers we'll need. For this demo, we just
  // have one object -- a simple two-dimensional square.
  //
  function initBuffers() {

    // Create a buffer for the square's positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the square.

    const positions = [
      // Front face
      -1.0, -1.0,  0.0,
       1.0, -1.0,  0.0,
       1.0,  1.0,  0.0,
      -1.0,  1.0,  0.0,

      // Back face
      -1.0, -1.0, 0.0,
      -1.0,  1.0, 0.0,
       1.0,  1.0, 0.0,
       1.0, -1.0, 0.0,
    ];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


  const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = [
      // Front

      0.0,  1.0,
      1.0,  1.0,
      1.0,  0.0,
      0.0,  0.0,
      // Back

      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      0.0,  0.0,

    ];
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    const indices = [
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                  gl.STATIC_DRAW);

    return {
      position: positionBuffer,
      textureCoord: textureCoordBuffer,
      indices: indexBuffer,
    };
  }

  //
  // Draw the scene.
  //
  function drawScene() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const projectionMatrix = new Float32Array([
      1,0,0,0,
      0,1,0,0,
      0,0,0,0,
      0,0,0,1,
    ])
     const modelViewMatrix = new Float32Array([
       1, 0, 0, 0,
       0, 1, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1])


    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the texture coordinates from
    // the texture coordinate buffer into the textureCoord attribute.
    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
      gl.vertexAttribPointer(
          programInfo.attribLocations.textureCoord,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.textureCoord);
    }
      // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
      // Specify the texture to map onto the faces.

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, tex_in);
      // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    {
      const vertexCount = 8;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
    
    // var arrBuffer = new ArrayBuffer(16 * Float32Array.BYTES_PER_ELEMENT);
    // gl.getBufferSubData(gl.ARRAY_BUFFER, 0, arrBuffer);
  }

  //
  // Initialize a shader program, so WebGL knows how to draw our data
  //
  function initShaderProgram(vsSource, fsSource) {
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    
    gl.transformFeedbackVaryings(shaderProgram, ['pix'], gl.INTERLEAVED_ATTRIBS);
    
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

  //
  // creates a shader of the given type, uploads the source and
  // compiles it.
  //
  function loadShader(type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  //
  // Initialize a texture and load an image.
  // When the image finished loading copy it into the texture.
  //
  function loadTexture(canvas) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;

    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, canvas);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(canvas.width) && isPowerOf2(canvas.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn off mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }


    return texture;
  }

  function updateTexture(canvas) {
    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.bindTexture(gl.TEXTURE_2D, tex_in);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, canvas);
  }

  function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }
  
}