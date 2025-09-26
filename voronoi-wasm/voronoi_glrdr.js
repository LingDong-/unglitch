/* global describe twgl */
function VoronoiGlRenderer(vor,W,H){
	var that = this;
	
	var gl = document.createElement("canvas").getContext("webgl");
	gl.canvas.width = W;
	gl.canvas.height = H;


	var programInfo = twgl.createProgramInfo(gl, [`
		attribute vec2 position;
		uniform vec2 resolution;
		void main() {
			vec2 pos = position / resolution * 2.0 - 1.0;
			gl_Position = vec4(pos.x, -pos.y, 0.0, 1.0);
		}`, `
		precision lowp float;
		uniform vec3 color;
		void main() {
			gl_FragColor = vec4(color, 1.0);
		}
	`])

	gl.viewport(0, 0, W,H)
	gl.useProgram(programInfo.program)

	var arrays = {
		position: new Float32Array(9),
	}
	var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)

	that.render = function(N,colors){

		for (var i = 0; i < N; i++){
			twgl.setUniforms(programInfo, {
		        resolution: [W,H],
		        color: colors[i],
		    })
		    var n = vor.getCellNumVertices(i);
		    if (!n){
		    	continue;
		    }
		    var x0 = vor.getCellVertexX(i,0);
			var y0 = vor.getCellVertexY(i,0);
			arrays.position[0]=x0
			arrays.position[1]=y0

			for (var j = 1; j < n; j++){
				var x1 = vor.getCellVertexX(i,(j));
				var y1 = vor.getCellVertexY(i,(j));

				var x2 = vor.getCellVertexX(i,(j+1)%n);
				var y2 = vor.getCellVertexY(i,(j+1)%n);

				arrays.position[3]=x1
				arrays.position[4]=y1
				arrays.position[6]=x2
				arrays.position[7]=y2

				twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.position, arrays.position);
				twgl.drawBufferInfo(gl, bufferInfo)
			}
		}
	}
	that.getGl = function(){return gl};
	that.getDom = function(){return gl.canvas};
}