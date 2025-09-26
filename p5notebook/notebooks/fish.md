# Generative Drawing Workshop for Beginners

## (How to generate your own fish 🐟)

(very, very simplified version)

Lingdong Huang, 2023

<img src="/p5notebook/glitch-assets/fish.png" width="500"/>

<sub>▲ After finishing this workshop, you'll be able to generate a fish no worse than pictured above, in less than 200 lines of code!</sub>

--- 

## Tiling the fish scales!

First, let's fill the screen with little circles! Easy peasy!

```js p5
function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  background(220);
  for (let i = 0; i < 50; i++){
    for (let j = 0; j < 50; j++){
      circle(i*10,j*10,10);
    }
  }
}
```


How to make them look more like fish scales?

Perhaps we can make the circles bigger, so that they overlap with each other!

Try changing the third argument to `circle()` function, to something, say, 20. Or 30 maybe?

The code samples on this page are interactive! Try tweaking the numbers and hit the `run` button. Do it now!


---

These bigger scales look kinda alright except that our imaginary "fish" is now pointing toward the lower right corner... 

Let's make the fish point toward the left!

First, let's change the multiplier on Y axis to 20, so that it's the same as the diameter of the circles. This way the scales would align on the X axis!

<details>
<summary>Hint</summary>
  Try changing `circle(i*10,j*10,20)` to `circle(i*10,j*20,20)`.
</details>



```js p5
function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  background(220);
  for (let i = 0; i < 50; i++){
    for (let j = 0; j < 50; j++){
      circle(i*10,j*10,20);
    }
  }
}
```

---

Alright the circles are aligned, but now they look like a sweater!

Look carefully. If we just move every other column downward by the height of half a circle, we could make them look like fish scales again!

How would we select every other column?

There are two ways!


```js p5
function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  background(220);
  for (let i = 0; i < 10; i++){
    
    // the first method!
    
    let isOdd = (i % 2);
    
    fill(isOdd * 255);
    
    circle(70+i*40,100,20);
    
    // the second method!
    
    let isOdd_2 = (i & 1);
    
    fill(isOdd_2 * 255);
    
    circle(70+i*40,200,20);
  }
}
```

The first method uses the "modulo" operator, written as `%`. It is the "remainder" of an integer division. If we divide an odd number by 2, we
always get a remainder of 1, and if we divide an even number by 2, we always get a remainder of 0!

The second method makes use of the fact that numbers are stored as bits in the computer's memory. It's a bit mathy so you don't have to understand it!
(But it's also usually the more efficient method).

But by using the first method, you can not only find every other object, but also every three objects, every four objects, and so on! 
Try changing `(i % 2)` to `i % 3` or `i % 4` and see what happens!


---

It's time to put this new trick into use! What should we do to shift every other column downwards by 10?

<details>
<summary>Hint</summary>
  Change `j*20` to `j*20+(i%2)*10`
</details>


Also try shifting downward by another amount, or shift every three or four columns, just to see what happens!

```js p5
function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  background(220);
  for (let i = 0; i < 50; i++){
    for (let j = 0; j < 50; j++){
      circle(i*10,j*20,20);
    }
  }
}
```


---

Awesome! We have some nice fish scales! The "fish" is pointing towards the right though, let's turn it around and make it point to the left!

Try "reversing" the outer for loop.

In the original loop, we started at 0, and ends just before 50, which is 49. In order to reverse the loop, what numbers should we start and end at?

Don't for get to change the `<` to `>=`, and `++` to `--`!


```js p5
function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  background(220);
  for (let i = 0; i < 50; i++){
    for (let j = 0; j < 50; j++){
      circle(i*10,j*20+(i%2)*10,20);
    }
  }
}
```

---

Circles for fish scales are boring! Let's make some pretty, customizable fish scales. Create a `draw_scale()` function, 
that draws a single fish scale centered at (0,0).

I'm really unimaginative, so I made an example where each fish scale consists of two circles instead of one. You can do a better job! Try rectangles, polygons, curves...!

See the "Shape" section of the [p5.js reference](https://p5js.org/reference/) if you're unfamiliar with the shape drawing functions!


```js p5

function draw_scale(){
  circle(0,0,20);
  circle(0,0,12);
}

function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  background(220);
  for (let i = 49; i >= 0; i--){
    for (let j = 0; j < 50; j++){
      push();
      translate(i*10,j*20+(i%2)*10);
      draw_scale();
      pop();
    }
  }
}

//#export draw_scale

```

Notice that we used the `translate()` function to move the origin to where the fish scale should be at each iteration. 
This way our `draw_scale()` function wouldn't need to worry about it!


---


## Make the scales alive!


Hopefully you're satisfied with your fish scale design! However, these rigidly spaced-out things look more like a decorative pattern than
something you would find on a "real" fish. Let's use the power of randomness to blow some "life" into the scales!

First, let's learn about Perlin noises!

Look at the random line below. It is, eh..., very random!


```js p5

function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  noFill();
  beginShape();
  for (let i = 0; i < width; i+=5){
    vertex(i,random(height));
  }
  endShape();
}
```

But many "natural" things aren't that jagged-looking. Think about the contour of a mountain range, or some rocks, or a flower petal. 
Sure, their shapes are "random", but they tend to "make more sense". They have an overall smoother, wave-like form, with local vibrations for smaller details...


--- 

[Perlin noise](https://en.wikipedia.org/wiki/Perlin_noise) to the rescue!

Perlin noise is a type of gradient noise that generates natural-looking randomness. The p5.js implementation uses a fractal noise version of it,
which is extra neat. I like Perlin noise so much I can yap about it all day. But let's just try it out see what it does!

Try changing the two arguments to `noiseDetail`. (But don't go too crazy. try an integer between 0-10 for the first argument, 
and a float between 0.0-1.0 for the second). What do they do?

<details>
<summary>Hint</summary>
The first argument is "level of detail", i.e. number of octaves for the fractal noise.
The second argument is "falloff", i.e. how much weaker each octave is compared to the last.
More details on [p5.js reference](https://p5js.org/reference/#/p5/noiseDetail)!
</details>


Now try changing the multiplier to `i` in the `noise()` function. What does that do?

<details>
<summary>Hint</summary>
It determines the spacing at which the noise is sampled, which affects how smooth the output looks.
</details>


```js p5
function setup() {
  createCanvas(500, 500);
  noiseDetail(4, 0.5);
  noLoop();
}
function draw() {
  noFill();
  beginShape();
  for (let i = 0; i < width; i+=2){
    vertex(i,noise(i*0.01)*height);
  }
  endShape();
}
```

---

Turns out Perlin noise can be sampled in 2D (or 3D) too! We can use it to offset a grid of points in an interesting way!

Notice that for `dx` and `dy`, a different third argument is passed -- this is such that `noise()` doesn't give us the exact same result for `dx` and `dy`!
As long as they're different, it doesn't matter what number you use. (Neat trick, no?)

Again, try changing the arguments to `noiseDetail()` and the multiplier to `i` and `j` in `noise()`, and observe what happens!

Or, just keep smashing the `run` button to get new pics!


```js p5

function setup() {
  createCanvas(500, 500);
  noiseDetail(4, 0.5);
  noLoop();
}
function draw() {

  for (let i = 0; i < 25; i++){
    for (let j = 0; j < 25; j++){
      
      let dx = noise(i*0.1,j*0.1,1) - 0.5;
      let dy = noise(i*0.1,j*0.1,2) - 0.5;
      
      let x0 = j*25;
      let y0 = i*25;
      
      let x1 = x0 + dx * 75;
      let y1 = y0 + dy * 75;

      line(x0,y0,x1,y1);
      circle(x1,y1,5);
    }
  }
}
```


---


Hopefully you haven't forgotten about the fish scales. Let's use Perlin noise to offset the scales so it looks like the fish is in the middle of swimming! 

You might want to tweak the amount of offset and smoothness, depending on how you draw the scales. Make it look nice!


```js p5
//#import draw_scale

function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  background(220);
  for (let i = 49; i >= 0; i--){
    for (let j = 0; j < 25; j++){
      
      let dx = noise(i*0.1,j*0.1,1) - 0.5;
      let dy = noise(i*0.1,j*0.1,2) - 0.5;
      
      push();
      translate(i*10 + dx * 100,j*20+(i%2)*10 + dy * 50);
      draw_scale();
      pop();
    }
  }
}
```


---


Now you might be complaining: this just looks like some wrinkly table cloth or curtain. It doesn't look like it's wrapped around a fish! Let's fix that.

First let's make a gross simplification. Assume the fish is a cylinder. We want to wrap the scales around a cylinder. How to do that?

We all know if we chop up a cylinder, we'd get a bunch of circles. So let's start with circles. How to draw something around a circle?

Easy! (If you've been paying attention in middle school). We have `cos(angle)*radius` which gives the X coordinate, and `sin(angle)*radius` wich gives the Y coordinate.

Now try this: in the code below, decrease `x` from `cos(angle)*radius` to just `0` and see what happens. Does it give you any ideas?

<details>
<summary>Hint</summary>
It looks just like a circle from sideways! Now if we horizontally stack lots of such circles, we'll get... cylinder!
</details>

```js p5

function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  background(220);
  translate(width/2,height/2);
  
  for (let i = 0; i < 50; i++){
    let a = (i / 50) * PI * 2;
    let x = cos(a)*150;
    let y = sin(a)*150;
    circle(x,y,18);
  }
}
```


--- 


And that's exactly what we're gonna do to our fish scales. Now the normalization stuff is a bit tricky, so I did it for you. 
But feel free to play around with the numbers!



```js p5
//#import draw_scale

function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  background(220);
  for (let i = 49; i >= 0; i--){
    for (let j = 0; j < 25; j++){
      
      let dx = noise(i*0.1,j*0.1,1) - 0.5;
      let dy = noise(i*0.1,j*0.1,2) - 0.5;
      
      let x = i*10 + dx * 100;
      let y = j*20+(i%2)*10 + dy * 50;
      
      let t = (y - height/2)/(height/2);
      
      y = Math.sin(t * PI) * height/4 + height/2;
      
      push();
      translate(x,y);
      draw_scale();
      pop();
    }
  }
}
```


---


## Give the fish a shape!

Ok, you might be thinking, we've made fish-scale curtains, we've made fish-scale cylinders, when do we actually make a fish!?

Let's give our fish a shape now!

Fishes come in all sort of shapes. Long ones, short ones, round ones, triangular ones... The possibilities are endless! (That's why i like fishes)

But let's start with the simplest and perhaps one of the more common ones. Many fishes, (not unlike [Brontosauruses](https://en.wikipedia.org/wiki/Anne_Elk%27s_Theory_on_Brontosauruses)), 
are thin at one end, much thicker in the middle, and thin again at the other end.

Guess what function is also like that in between 0 and PI? That's right, the `sin()`! Let's use it to model the fish shape.

Look at the `draw_body_shape()` function below, notice there're two for loops. The first loop draws the upper curve, while the second loop draws the lower curve.
Comment out one of the loops to see what I mean!

The `map()` function stretches or squeezes a number from one range to another. Try changing the fourth and fifth arguments and see what happens!


```js p5
function draw_body_shape(){
  beginShape();
  let n = 100; // number of segments
  for (let i = 0; i < n; i++){
    let x = map(i/n,0,1, 0.2, 0.8) * width;
    let y = height/2 - (sin(i/n * PI)*0.5+0.5) * height/4;
    vertex(x,y);
  }
  for (let i = n-1; i >= 0; i--){
    let x = map(i/n,0,1, 0.2, 0.8) * width;
    let y = height/2 + (sin(i/n* PI)*0.5+0.5) * height/4;
    vertex(x,y);
  }
  endShape(CLOSE);
}
function setup(){
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  draw_body_shape();
}


```

Many fishes have different curvatures for their backs and bellies. Can you change the multipliers and addends to the `sin()` functions, 
such that one is curvier than the other, without changing the total height of the fish?

<details>
<summary>Hint</summary>
e.g. `let y = height/2 + (sin(i/n* PI)*0.7+0.3) * height/4;`

</details>


---

Everything tastes better with Perlin Noise!

Let's throw some noise onto our fish shape too, so it doesn't look like robot fish or something.

Wow! All that math is getting a bit unruly! But don't worry, look carefully and try to understand what each term means, and tweak it to see what it does.

Which number(s) control the ratio between noise and sine?

```js p5
function draw_body_shape(){
  beginShape();
  let n = 100; // number of segments
  for (let i = 0; i < n; i++){
    let x = map(i/n,0,1, 0.2, 0.8) * width;
    let y = height/2 - (sin(i/n * PI)*(noise(i*0.02,1)*0.7+0.3)*0.6+0.4) * height/4;
    y *= 0.9 + 0.1* noise(i*0.01);
    vertex(x,y);
  }
  for (let i = n-1; i >= 0; i--){
    let x = map(i/n,0,1, 0.2, 0.8) * width;
    let y = height/2 + (sin(i/n * PI)*(noise(i*0.02,2)*0.7+0.3)*0.5+0.5) * height/4;
    vertex(x,y);
  }
  endShape(CLOSE);
}
function setup(){
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  draw_body_shape();
}

//#export draw_body_shape

```

---

Now that we have the outline, how do we fill in the scales? 
Fortunately, the web canvas API (of which p5.js is a wrapper) includes a helpful `clip()` function.
Unfortunately, p5.js forgets(?) to wrap it, so the syntax we need to write is a bit awkward.

To understand what `clip()` does, let's look at the tiny example below:

Try commenting out `drawingContext.clip()` to see what's it like without clipping. 

Exercise: re-arrange the order of things and/or modify the clipping shape, such that all four circles are clipped!

<details>
<summary>Hint</summary>
one possible solution:
  
move `circle(300,400,100);` to before `pop();`
  
change `circle(250,250,100);` to `circle(250,150,100);`
  
</details>


```js p5
function setup() {
  createCanvas(500, 500);
  noLoop();
}

function draw() {
  push();
  
  beginShape();
  vertex(100,100);
  vertex(400,200);
  vertex(300,400);
  vertex(200,400);
  endShape(CLOSE);
  
  drawingContext.clip();
  
  circle(150,250,100);
  circle(250,250,100);
  circle(350,250,100);
  
  pop();
  
  circle(300,400,100);
}

```


---


Putting things together, let's use our fish shape to clip our fish scales!

Nothing new here, but a good chance to recap what we've done so far!



```js p5
//#import draw_scale draw_body_shape


function draw_body_scales(){
  for (let i = 49; i >= 0; i--){
    for (let j = 0; j < 25; j++){
      
      let dx = noise(i*0.1,j*0.1,1) - 0.5;
      let dy = noise(i*0.1,j*0.1,2) - 0.5;
      
      let x = i*10 + dx * 100;
      let y = j*20+(i%2)*10 + dy * 50;
      
      let t = (y - height/2)/(height/2);
      
      y = Math.sin(t * PI) * height/4 + height/2;
      
      push();
      translate(x,y);
      draw_scale();
      pop();
    }
  }
}
function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  
  push();
  draw_body_shape();
  drawingContext.clip(); 
  draw_body_scales();
  pop();
  noFill();
  draw_body_shape();
  
}

//#export draw_body_scales

```

---


## Growing the fish tails (and fins)!


You might have noticed that, for many types of fishes, their fins and tails seem to be made out of similar stuff.
So perhaps we can get lazy, and design a function that can draw either fins or tails based on its input!

Here's an idea: we input one curve for the root of the fin/tail, and one curve for the rim of the fin/tail, 
and our function generates a bunch of lines connecting points between the curves. See the example below!

These "flat" tail shapes are a bit boring. Try modifying the points `push`'ed to `pts1`, see if you can create more interesting tail shapes!

(You might find the `abs` function useful).

<details>
<summary>Hint</summary>
  
`pts1.push([60+abs(i-25)*3,(i-25)*4]);`
  
</details>


```js p5
function draw_fin(pts0, pts1){
  
  // draw the outline first
  beginShape();
  for (let i = 0; i < pts0.length; i++)  vertex(...pts0[i]);
  for (let i = pts1.length-1; i>=0; i--) vertex(...pts1[i]);
  endShape(CLOSE);
  
  // draw the inner lines
  for (let i = 0; i < pts0.length; i++){
    line(...pts0[i],...pts1[i]);
  }
}

function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  let pts0 = [];
  let pts1 = [];
  for (let i = 0; i < 50; i++){
    pts0.push([0,(i-25)*2]);
    pts1.push([100,(i-25)*4]);
  }
  translate(width/2,height/2);
  draw_fin(pts0,pts1);
  
}

```

---

You can also randomize which "type" of tail you'll get each time, by generating a random number!

Click the "run" button a couple of times and see it in action! 

Can you think of more tail types to add?


```js p5

let tail_type;
let num_tail_types = 2;

function draw_fin(pts0, pts1){
  
  // draw the outline first
  beginShape();
  for (let i = 0; i < pts0.length; i++)  vertex(...pts0[i]);
  for (let i = pts1.length-1; i>=0; i--) vertex(...pts1[i]);
  endShape(CLOSE);
  
  // draw the inner lines
  for (let i = 0; i < pts0.length; i++){
    line(...pts0[i],...pts1[i]);
  }
}

function setup() {
  createCanvas(500, 500);
  noLoop();
  
  tail_type = floor(random(num_tail_types));
}
function draw() {
  let pts0 = [];
  let pts1 = [];
  for (let i = 0; i < 50; i++){
    if (tail_type == 0){
      pts0.push([0,(i-25)*2]);
      pts1.push([100,(i-25)*4]);
    }else if (tail_type == 1){
      pts0.push([0,(i-25)*2]);
      pts1.push([60+abs(i-25)*3,(i-25)*4]);
    }else{
      // can you think of more tail types?
    }
  }
  translate(width/2,height/2);
  draw_fin(pts0,pts1);
  
}

```

Currently, all the tail types have equal chance of occuring.
If you like fork-shaped tails much more than flat tails, what can you do to "bias" the random number generator?

<details>
<summary>Hint</summary>
  
e.g.
  
<pre>
tail_type = (random(1)&lt;0.2) ? 0 : 1;
</pre>

                            
</details>



---


Guess what I have to say about these razor-sharp tails? That's right, we need more Perlin noise!

I added the noise for the outlines. Can you do the same for the inner lines?


<details>
<summary>Hint</summary>
  
That's an easy one. Just copy over these two lines!
  
```
x += noise(x*0.02,y*0.02,1)*40-20;
y += noise(x*0.02,y*0.02,2)*40-20;
```
  
</details>

Notice that I've used the `lerp` function to resample the inner lines. The `lerp` function interpolates between two values generating evenly-spaced
intermediate values for us. This way we can easily apply Perlin noise to every point on the line!
  

```js p5
function draw_fin(pts0, pts1){
  push();
  noFill();
  // draw the outline first
  beginShape();
  for (let i = 0; i < pts0.length; i++){
    let [x,y] = pts0[i];
    x += noise(x*0.02,y*0.02,1)*40-20;
    y += noise(x*0.02,y*0.02,2)*40-20;
    vertex(x,y);
  }
  endShape();
  beginShape();
  for (let i = pts1.length-1; i>=0; i--){
    let [x,y] = pts1[i];
    x += noise(x*0.02,y*0.02,1)*40-20;
    y += noise(x*0.02,y*0.02,2)*40-20;
    vertex(x,y);
  }
  endShape();
  
  // draw the inner lines
  for (let i = 0; i < pts0.length; i++){
    beginShape();
    for (let j = 0; j < 50; j++){
      let t = j/50;
      let x = lerp(pts0[i][0], pts1[i][0], t);
      let y = lerp(pts0[i][1], pts1[i][1], t);

      // fix me!
      
      vertex(x,y);
    }
    endShape();
  }
  pop();
}

function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  let pts0 = [];
  let pts1 = [];
  for (let i = 0; i < 50; i++){
    let x = 0;
    let y = (i-25)*2;
    pts0.push([x,y]);
  }
  for (let i = 0; i < 50; i++){
    let x = 60+abs(i-25)*3;
    let y = (i-25)*4;
    pts1.push([x,y]);
  }
  translate(width/2,height/2);
  draw_fin(pts0,pts1);
  
}

```

---


Perhaps we're thinking the same thing: the inner lines look a bit too dense.

Let's randomly trim off each line at both ends, so things look more organic (and less dense)!

... and we pretty much have our fish tail. 

Tweak all the parameters to your liking!



```js p5
function draw_fin(pts0, pts1){
  push();
  noFill();
  // draw the outline first
  beginShape();
  for (let i = 0; i < pts0.length; i++){
    let [x,y] = pts0[i];
    x += noise(x*0.02,y*0.02,1)*40-20;
    y += noise(x*0.02,y*0.02,2)*40-20;
    vertex(x,y);
  }
  endShape();
  beginShape();
  for (let i = pts1.length-1; i>=0; i--){
    let [x,y] = pts1[i];
    x += noise(x*0.02,y*0.02,1)*40-20;
    y += noise(x*0.02,y*0.02,2)*40-20;
    vertex(x,y);
  }
  endShape();
  
  // draw the inner lines
  for (let i = 0; i < pts0.length; i++){
    let start = 0;
    let end = 50;
    if (i != 0 && i != pts0.length-1){
      start = floor(random(0,5));
      end = floor(random(start,48));
    }
    
    beginShape();
    for (let j = start; j < end; j++){
      let t = j/50;
      let x = lerp(pts0[i][0], pts1[i][0], t);
      let y = lerp(pts0[i][1], pts1[i][1], t);
      x += noise(x*0.02,y*0.02,1)*40-20;
      y += noise(x*0.02,y*0.02,2)*40-20;
      vertex(x,y);
    }
    endShape();
  }
  pop();
}

function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  let pts0 = [];
  let pts1 = [];
  for (let i = 0; i < 50; i++){
    let x = 0;
    let y = (i-25)*2;
    pts0.push([x,y]);
  }
  for (let i = 0; i < 50; i++){
    let x = 60+abs(i-25)*3;
    let y = (i-25)*4;
    pts1.push([x,y]);
  }
  translate(width/2,height/2);
  draw_fin(pts0,pts1);
  
}

//#export draw_fin

```


---

Let's use the same function to draw the dorsal fin! See if we were right about the fact that fins and tails are basically the same stuff.

Now, I'm being super unimaginative again, and just used some boring trapezoid for the fin shape. Can you come up with something better??


<details>
<summary>Hint</summary>
  
Try making a triangle shape. Or a curvy shape with `sin()`.
  
</details>


```js p5

//#import draw_fin

function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  let pts0 = [];
  let pts1 = [];
  for (let i = 0; i < 50; i++){
    let x = (i-25)*4;
    let y = 0;
    
    // ^ fix us!
    
    pts0.push([x,y]);
  }
  for (let i = 0; i < 50; i++){
    let x = (i-25)*2+15;
    let y = -100;
    
    // ^ fix us!
    
    pts1.push([x,y]);
  }
  translate(width/2,height/2);
  draw_fin(pts0,pts1);
  
}

```

---


Finally! Let's attach the fin and the tail to our fish.

Carefully make some adjustments so that the proportions fit! Smash the `run` button a few times to get a feel!



```js p5
//#import draw_fin draw_scale draw_body_shape draw_body_scales

function draw_dorsal(){
  let pts0 = [];
  let pts1 = [];
  for (let i = 0; i < 50; i++){
    let x = (i-25)*4;
    let y = 0;
    pts0.push([x,y]);
  }
  for (let i = 0; i < 50; i++){
    let x = (i-25)*2+15;
    let y = -100;
    pts1.push([x,y]);
  }
  draw_fin(pts0,pts1);
}

function draw_tail(){
  let pts0 = [];
  let pts1 = [];
  for (let i = 0; i < 50; i++){
    let x = 0;
    let y = (i-25)*2.5;
    pts0.push([x,y]);
  }
  for (let i = 0; i < 50; i++){
    let x = 60+abs(i-25)*2.5;
    let y = (i-25)*4;
    pts1.push([x,y]);
  }
  draw_fin(pts0,pts1);
}


function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  
  push();
  translate(width*0.5,height*0.35);
  draw_dorsal();
  pop();
  
  push();
  translate(width*0.75,height/2);
  draw_tail();
  pop();
  
  push();
  draw_body_shape();
  drawingContext.clip(); 
  draw_body_scales();
  pop();
  noFill();
  draw_body_shape();
  
}

//#export draw_tail draw_dorsal
```


---


## Put on the head!


This is the part where you can put your creativity into great use! Do you want to make a cute fish? an angry fish? a dead fish? The choice is yours!

Here I made an example with an arc and two lines making the outline of the head (randomized with Perlin noise). 
Then I got really lazy and just put some circles for the mouth and eyes.

Please do a better job than me!

Utilize all the cool stuff we've learned so far! Noise! Clipping! Tiling! Pesudo-3D!


```js p5


function draw_head(){
  beginShape();
  for (let i = 0; i < 50; i++){
    let a = -PI/4 + (i/50) * PI/2;
    let x = cos(a)*100;
    let y = sin(a)*100;
    x += noise(x*0.02,y*0.02,1)*10-5;
    y += noise(x*0.02,y*0.02,2)*10-5;
    vertex(x,y);
  }
  for (let i = 0; i < 45; i++){
    let t = i/50;
    let x = lerp(cos(PI/4)*100, -20, t);
    let y = lerp(sin(PI/4)*100,   0, t);
    y += sin(t * PI)*20;
    x += noise(x*0.02,y*0.02,1)*10-5;
    y += noise(x*0.02,y*0.02,2)*10-5;
    vertex(x,y);
  }
  for (let i = 5; i < 50; i++){
    let t = i/50;
    let x = lerp(-20, cos(-PI/4)*100, t);
    let y = lerp( 0, sin(-PI/4)*100, t);
    y -= sin(t * PI)*20;
    x += noise(x*0.02,y*0.02,1)*10-5;
    y += noise(x*0.02,y*0.02,2)*10-5;
    vertex(x,y);
  }
  endShape();
  ellipse(-10,0,20,30);
  ellipse(-12,0,15,15);
  ellipse(35,-20,30,30);
  ellipse(35,-20,20,20);
  line(30,-25,40,-15);
  line(40,-25,30,-15);
}


function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  translate(width/2,height/2);
  draw_head();
}

//#export draw_head

```

--- 


Finally, finally, let's slap on the head and (almost) call it a day!

I made some slight tweaks so that parts fit better. You should do the same to your fish too!


```js p5

//#import draw_fin draw_scale draw_body_shape draw_body_scales
//#import draw_dorsal 
//#import draw_tail 
//#import draw_head



function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  
  push();
  translate(width*0.5,height*0.35);
  draw_dorsal();
  pop();
  
  push();
  translate(width*0.75,height/2);
  draw_tail();
  pop();
  
  push();
  draw_body_shape();
  drawingContext.clip(); 
  draw_body_scales();
  pop();
  noFill();
  draw_body_shape();
  
  fill(255);
  push();
  translate(width*0.1,height*0.5)
  draw_head();
  pop();
}

```

If you haven't already, consider moving your code to the [online p5.js editor](https://editor.p5js.org/). 
This way you'll have a bigger work area, and can save and share your work!


## What we have learned

- Tiling shapes and using modulo operator to apply effect to a subset of elements
- Use Perlin noise to generate a field of random vectors and use them to warp a drawing
- Clipping
- Pseudo-3D projection
- Use random number generator to determine "types" of components to use
- User Perlin noise to generate fluid, organic lines
- Use mathematical functions such as sin/cos to model curves

Can you generate something other than a fish by transferring these knowledge? A mountain? A flower? A tree? A bird?

---

## The fun continues...


You've managed to generate something that roughly looks like a fish... Good job! Congrats! But we've only scratched the surface!

Here's many more things to consider!


- Often the parts doesn't fit together perfectly (e.g. head too big for body), due to the use of randomness. Can you pass the dimension of one part to the next, so that they fit seamlessly?

- Parameterize all the "magic" numbers, and make a GUI for tweaking your fish!

- The fish does not have pectoral fins, pelvic fins, or anal fins. Can you generate those with the `draw_fin` function too?

- The pectoral fins often grow on the side of the fish, meaning that they'll need to be drawn on top of the scales. Can you modify `draw_fin` function so that it draws a filled shape painting over whatever that's beneath?
   
- Currently we really only generate one "species" of fish. The output mostly look like different individuals of the same species. Can you add more types of scales, more types of fin shape and textures, and more body shapes etc., so multiple species of fishes can be generated?

- Can you add shading/illusionistic techniques such as cross-hatching to the drawing?

- Explore ["poisson-disk" sampling](https://en.wikipedia.org/wiki/Supersampling#Poisson_disk) to add a pattern to your fish.

- For the sake of convenience we were not truly doing "clipping" to the polylines, instead we're just painting stuff on top of each other or masking stuff. Can you research an algorithm that clips a polyline by a shape, turning it into smaller segments? Alternatively, use an external software to post-process your output image into separate polylines.
  
- After getting true "clipping", send the polylines to a pen-plotter and plot your fish!



See the [fishdraw](https://github.com/LingDong-/fishdraw) project for some more inspiration!

