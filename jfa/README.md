# jumpflood.js

*Voronoi & Distance Transform in WebGL*

Based on paper [Guodong Rong and Tiow-Seng Tan. 2006, *Jump Flooding in GPU with Applications to Voronoi Diagram and Distance Transform*](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.101.8568&rep=rep1&type=pdf)

## Dependency

- [twgl](https://github.com/greggman/twgl.js/)

## Usage

```html
<script src="https://twgljs.org/dist/4.x/twgl.min.js"></script>
<script src="https://jfa.glitch.me/jumpflood.js"></script>
```

### Minimal Example

```js
var jfa = new JumpFlood(input_canvas); // input is a HTML/webgl canvas element
  
function loop(){
  requestAnimationFrame(loop);
  
  // draw on input_canvas here
  
  jfa.process();
  jfa.readout(output_canvas); // pass a HTML canvas element to hold the result
}

loop();

```

### Voronoi


```js
var jfa = new JumpFlood(input_canvas);
  
function loop(){
  requestAnimationFrame(loop);
  
  // draw on input_canvas here
  
  jfa.process();
  jfa.voronoi();
  jfa.readout(output_canvas);
}

loop();


```

### Distance Transform

```js
var jfa = new JumpFlood(input_canvas);
  
function loop(){
  requestAnimationFrame(loop);
  
  // draw on input_canvas here
  
  jfa.process();
  jfa.distanceTransform();
  jfa.readout(output_canvas);
}

loop();

```

### Voronoi + Distance Transform

Since the gl context is reused for every operation, `readout` `load` and `save` are used to take snapshots of intermediate states.


```js
var jfa = new JumpFlood(input_canvas);
  
function loop(){
  requestAnimationFrame(loop);
  
  // draw on input_canvas here
  
  jfa.process();
  
  jfa.save(0);   // write current gl canvas to texture slot 0
  jfa.voronoi();
  jfa.readout(voronoi_output_canvas);
  
  jfa.load(0);   // resume from the gl canvas at texture slot 0
  jfa.distanceTransform();
  jfa.readout(dt_output_canvas);
}

loop();

```


### Custom Post Processing

via fragment shader

```js
var jfa = new JumpFlood(input_canvas);

var mypass = jfa.definePass(`
  precision lowp float;
  uniform sampler2D texture;
  uniform vec2 resolution;
  
  uniform float a;
  
  void main(){
    vec4 col = texture2D(texture, gl_FragCoord.xy/resolution);
    gl_FragColor = vec4(col.x,col.y,col.z*col.z*col.z,a);
  }
`)

function loop(){
  requestAnimationFrame(loop);
  
  // draw on input_canvas here
  
  jfa.process();
  jfa.pass(mypass, {a:1.0});
  jfa.readout(output_canvas);
}

loop();

```


### The Guts

Read each step of jump flooding to a canvas element

```js
var depth = 7;
var snapshots = [];
for (var i = 0; i <= depth; i++){
  snapshots.push(document.createElement("canvas"));
}

var jfa = new JumpFlood(input_canvas);

function loop(){
  requestAnimationFrame(loop);
  
  // draw on input_canvas here
  
  jfa.process({snapshots,depth});
}

```


### Reference

- [Guodong Rong and Tiow-Seng Tan. 2006, *Jump Flooding in GPU with Applications to Voronoi Diagram and Distance Transform*](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.101.8568&rep=rep1&type=pdf)
- [https://www.shadertoy.com/view/4syGWK](https://www.shadertoy.com/view/4syGWK)
- [http://rykap.com/graphics/skew/2016/02/25/voronoi-diagrams/](http://rykap.com/graphics/skew/2016/02/25/voronoi-diagrams/)

**Developed at [Frank-Ratchye STUDIO for Creative Inquiry](https://studioforcreativeinquiry.org) at Carnegie Mellon University.**