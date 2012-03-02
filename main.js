var WIDTH = 500;
var HEIGHT = 500;

var VERTEX_SHADER = 
	"uniform mat4 uModelViewMatrix;\n"+
	"uniform mat4 uProjMatrix;\n"+
	"attribute vec3 vPosition;\n"+
	"void main() {\n"+
	"	gl_Position = uProjMatrix * (uModelViewMatrix * vec4(vPosition, 1.0));\n"+
	"}\n";
var FRAGMENT_SHADER = 
	"precision mediump float;\n"+
	"void main() {\n"+
	"	gl_FragColor = vec4(mod(gl_FragCoord.x, 1.0), mod(gl_FragCoord.y, 1.0), mod(gl_FragCoord.z, 1.0), 1.0);\n"+
	"}\n";

var canvas, gl;
var vertexShader, fragmentShader, program;
var vertexPositionAttribute, modelViewMatrixUniform, projMatrixUniform;
var projMatrix;
var heightmap;

window.onload = function () {
	canvas = document.getElementById("canvas");
	gl = get3DContext(canvas);
	if(gl == null) {
		alert("Your browser doesn't appear to support 3D. Try updating it or using a recent version of Chrome or Firefox.");
		return;
	}
	
	if(setup3D()) {
		draw3D();
	}
}

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
		
		vertexPositionAttribute = gl.getAttribLocation(program, "vPosition");
		gl.enableVertexAttribArray(vertexPositionAttribute);
		modelViewMatrixUniform = gl.getUniformLocation(program, "uModelViewMatrix");
		projMatrixUniform = gl.getUniformLocation(program, "uProjMatrix");
		
		projMatrix = Mat4MakeOrthographic(0, WIDTH, HEIGHT, 0, -1000, 1000);
		
		gl.uniformMatrix4fv(projMatrixUniform, false, projMatrix);
		debug3D("uniformMatrix4fv pr", gl.getError());
		
		heightmap = new Heightmap(2, 2);
		// heightmap.randomize(0, 3);
		heightmap.initializeGL(gl);
		
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
	
	// Construct the modelview matrix
	mvMatrix = Mat4MakeIdentity();
	
	//Mat4Rotate(mvMatrix, Math.PI / 4.0, 1, 0, 0);
	Mat4Translate(mvMatrix, WIDTH/2, HEIGHT/2, 0);
	Mat4Scale(mvMatrix, 20, 20, 20);
	Mat4Rotate(mvMatrix, camOffsetY, 1, 0, 0);
	Mat4Rotate(mvMatrix, camOffsetX, 0, 1, 0);
	Mat4Translate(mvMatrix, -(heightmap.x-1.0)/2.0, 0, -(heightmap.y-1.0)/2.0);
	
	
	
	
	
	// Set the modelview matrix to the shader
	gl.uniformMatrix4fv(modelViewMatrixUniform, false, mvMatrix);
	
	// Draw the heightmap
	heightmap.drawGL(gl, vertexPositionAttribute);
	
	gl.finish();
}