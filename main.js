var WIDTH = 500;
var HEIGHT = 500;

var VERTEX_SHADER = 
	"uniform mat4 uModelViewMatrix;\n"+
	"uniform mat4 uProjMatrix;\n"+
	"attribute vec3 a_Position;\n"+
	"attribute vec4 a_Color;\n"+
	"varying vec4 v_Color;\n"+
	"void main() {\n"+
	"	v_Color = a_Color;\n"+
	"	gl_Position = uProjMatrix * (uModelViewMatrix * vec4(a_Position, 1.0));\n"+
	"}\n";
var FRAGMENT_SHADER = 
	"precision mediump float;\n"+
	"varying vec4 v_Color;\n"+
	"void main() {\n"+
	"	gl_FragColor = v_Color;\n"+
	"}\n";

var canvas, gl;
var vertexShader, fragmentShader, program;
var vertexPositionAttribute, vertexColorAttribute, modelViewMatrixUniform, projMatrixUniform;
var projMatrix;
var heightmap = null;

$(document).ready(function () {
	canvas = $("#canvas")[0];
	gl = get3DContext(canvas);
	if(gl == null) {
		alert("Your browser doesn't appear to support 3D. Try updating it or using a recent version of Chrome or Firefox.");
		return;
	}
	
	if(setup3D()) {
		draw3D();
	}
});

function error(msg) {
	console.log(msg);
	return false;
}

function debug3D(module, glErr) {
	if(glErr != 0) {
		console.log(module + " error " + glErr);
	}
}

function setup3D() {
	var glError;
	try {
		gl.viewport(0, 0, WIDTH, HEIGHT);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		
		gl.enable(gl.CULL_FACE);
		gl.frontFace(gl.CCW);
		
		gl.enable(gl.DEPTH_TEST);

		vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
		if(!vertexShader) return error("Error creating vertex shader");

		fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
		if(!fragmentShader) return error("Error creating fragment shader");

		program = gl.createProgram();
		if(!program) return error("Error creating program");

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			return error("Unable to initialize the shader program.");
		}
		
		gl.useProgram(program);
		
		vertexPositionAttribute = gl.getAttribLocation(program, "a_Position");
		gl.enableVertexAttribArray(vertexPositionAttribute);
		
		vertexColorAttribute = gl.getAttribLocation(program, "a_Color");
		gl.enableVertexAttribArray(vertexColorAttribute);
		
		modelViewMatrixUniform = gl.getUniformLocation(program, "uModelViewMatrix");
		projMatrixUniform = gl.getUniformLocation(program, "uProjMatrix");
		
		//projMatrix = Mat4MakeOrthographic(0, WIDTH, 0, HEIGHT, 0.001, 1000);
		projMatrix = Mat4MakePerspective(60.0, WIDTH/HEIGHT, 0.01, 1000);
		console.log(projMatrix);
		
		gl.uniformMatrix4fv(projMatrixUniform, false, projMatrix);
		debug3D("uniformMatrix4fv pr", gl.getError());
		
		Heightmap.loadFromFile('heightmap.json',
		function() { /* success */
			heightmap = this;
			heightmap.initializeGL(gl);
		},
		function (status, errormsg) { /* error */
			alert('Error loading heightmap: ' + errormsg + ' (randomizing instead)');
			heightmap = new Heightmap(20, 20);
			heightmap.randomize(0, 3);
			heightmap.initializeGL(gl);
		});
		
		glError = gl.getError();
		if(glError != 0) {
			return error("There was an error " + glError);
		}
		console.log("3D initialized");
	} catch(x) {
		return error(x);
	}
	
	return true;
}

function draw3D() {
	var mvMatrix;
	var camOffsetX, camOffsetY;
	
	// Request another frame when this one is done
	window.requestFrame(draw3D, canvas);
	
	// Suppress error before beginning drawing (*ahem* Safari)
	gl.getError();
	
	// Clear the screen
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Get the camera rotations
	camOffsetX = mouseX;
	camOffsetX -= canvas.offsetLeft;
	camOffsetX /= WIDTH;
	camOffsetX -= 0.5;
	camOffsetX *= 2.0 * Math.PI;
	camOffsetX %= (2.0 * Math.PI);
	
	camOffsetY = mouseY;
	camOffsetY -= canvas.offsetTop;
	camOffsetY /= HEIGHT;
	camOffsetY -= 0.5;
	camOffsetY *= 2.0 * Math.PI;
	camOffsetY %= (2.0 * Math.PI);
	camOffsetY = Math.min(camOffsetY, Math.PI/2.0);
	camOffsetY = Math.max(camOffsetY, Math.PI/-2.0);
	
	// Construct the modelview matrix
	mvMatrix = Mat4MakeIdentity();
	
	//Mat4Rotate(mvMatrix, Math.PI / 4.0, 1, 0, 0);
	//Mat4Translate(mvMatrix, WIDTH/2, HEIGHT/2, 0);
	Mat4Rotate(mvMatrix, camOffsetY, 1, 0, 0);
	Mat4Rotate(mvMatrix, camOffsetX, 0, 1, 0);
	Mat4Translate(mvMatrix, 0, -5, 0);
	
	if(heightmap) {
		//Mat4Scale(mvMatrix, 20, 20, 20);
		Mat4Translate(mvMatrix, -(heightmap.x-1.0)/2.0, 0, -(heightmap.y-1.0)/2.0);


		// Set the modelview matrix to the shader
		gl.uniformMatrix4fv(modelViewMatrixUniform, false, mvMatrix);

		// Draw the heightmap
		heightmap.drawGL(gl, vertexPositionAttribute, vertexColorAttribute);
	}
	
	
	gl.finish();
}