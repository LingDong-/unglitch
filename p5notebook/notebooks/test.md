# Test

Try this code below:

```js p5
console.log('hello','world')
function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  background(220);
  for (let i = 0; i < 100; i++){
    for (let j = 0; j < 100; j++){
      circle(j*10,i*10,10);
    }
  }
}
```

Cool! But this can't be tried:

```js
function setup(){
  //dead
}
```

Now try this:

```js p5
function setup() {
  createCanvas(500, 500);
  noLoop();
}
function draw() {
  background(220);
  for (let i = 0; i < 100; i++){
    for (let j = 0; j < 100; j++){
      circle(j*10,i*10,5);
    }
  }
}
```

<details>
<summary>Here's some hints</summary>

  ```js
  //the answer is 42
  console.log(42)
  ```
  
</details>

Goodbye!