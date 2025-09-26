/* global describe Handsfree */
//facial landmark detection, wrapper around handsfree.js

const handsfree = new Handsfree({
   // Maximum number of poses to track
   maxPoses: 1,

   // Hides the cursor when true, or displays it when false
   hideCursor: true,

   // Either shows the webcam canvas or not
   debug: false,

   sensitivity: {
     // A factor to adjust the cursors move speed by
     xy: 0.7,
     // How much wider (+) or narrower (-) a smile needs to be to click
     click: 0
   },
   
   stabilizer: {
     // How much stabilization to use: 0 = none, 3 = heavy
     factor: 1,
     // Number of frames to stabilizer over
     buffer: 30
   },

   // Sets up the webcam
   webcam: {
     video: {
       width: 640,
       height: 480
     }
   },

   // Tracker config
   tracker: {
     brf: {
       // Whether this tracker is enablded on load or not
       enabled: true
     },
     
     // @see https://github.com/tensorflow/tfjs-models/tree/master/posenet
     posenet: {
       // Whether this tracker should be enabled on load or not
       enabled: false,

       // @todo Make these comments more succinct
       // The float multiplier for the depth (number of channels) for all convolution operations.
       // - The value corresponds to a MobileNet architecture and checkpoint
       // - The larger the value, the larger the size of the layers, and more accurate the model at the cost of speed
       // - Set this to a smaller value to increase speed at the cost of accuracy.
       // - Possible values [0.5, 0.75, 1.0, 1.01]
       multiplier: 0.5,
       // A number between 0.2 and 1.0 representing what to scale the image by before feeding it through the network
       // - Set this number lower to scale down the image and increase the speed when feeding through the network at the cost of accuracy.
       imageScaleFactor: 0.4,
       // The minimum overall confidence score required for the a pose/person to be detected.
       minPoseConfidence: 0.1,
       // The minimum confidence score for an individual keypoint, like the nose or a shoulder, to be detected.
       minPartConfidence: 0.5,
       // the desired stride for the outputs when feeding the image through the model.
       // - The higher the number, the faster the performance but slower the accuracy
       // - Possible values [8, 16, 32]
       outputStride: 32,
       // Non-maximum suppression part distance
       // - It needs to be strictly positive
       // - Two parts suppress each other if they are less than nmsRadius pixels away
       nmsRadius: 20,
       // Only return instance detections that have root part score greater or equal to this value.
       scoreThreshold: 0.5
     }
   }
 })
              

function fld_start(){
  handsfree.start()
}





function fld_get(){
  var result = []
  if (handsfree.isTracking) {
    if (handsfree.pose.length > 0) {

      var face0 = handsfree.pose[0].face;
      var nPoints = face0.vertices.length;
      // console.log(face0.triangles.toString());
      // console.log(face0.vertices.toString())
      for (var i = 0; i < nPoints; i += 2) {
        var x = face0.vertices[i + 0];
        var y = face0.vertices[i + 1];
        result.push({x:x,y:y})
      }
    }
  }
  return result;
}

function dist2d(a,b){
  return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2));
}
function lerp2d(a,b,t){
  return {x:a.x*(1-t)+b.x*t, y:a.y*(1-t)+b.y*t}
}

function fld_get_ext(){
  var pts = fld_get();
  if (pts.length == 0){
    return pts;
  }
  var p0 = pts[0];
  var p16 = pts[16];
  var p27 = pts[27];
  var p33 = pts[33];
  
  var h = dist2d(p33,p27)*1.7;
  var h2 = h*0.8;
  var ang = Math.atan2(p16.y-p0.y,p16.x-p0.x)-Math.PI/2;
  var ang2 = -Math.PI/30;
  
  var p74 = {x:p27.x + h * Math.cos(ang),
             y:p27.y + h * Math.sin(ang)
            };
  var p68 = {x:p0.x + h2 * Math.cos(ang-ang2),
             y:p0.y + h2 * Math.sin(ang-ang2)
            };
  var p80 = {x:p16.x + h2 * Math.cos(ang+ang2),
            y:p16.y + h2 * Math.sin(ang+ang2)
           };
  var L = [];
  for (var i = 0; i < 7; i++){
      var r = i/6;
      L.push(lerp2d(p68,p74,r));
  }
  for (var i = 0; i < 6; i++){
      var r = (i+1)/6;
      L.push(lerp2d(p74,p80,r));
  }
  return pts.concat(L);
}