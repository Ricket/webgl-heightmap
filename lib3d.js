// Suite of 3D helper functions and stuff

function get3DContext(canvas) {
	var contextNames = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	var i, gl;
	
	if(window.WebGLRenderingContext) {
		for(i in contextNames) {
			try {
				gl = canvas.getContext(contextNames[i], { antialias: false });
			} catch(e) {}
			if(gl) {
				return gl;
			}
		}
	}
	
	return null;
}

window.requestFrame = 
	window.requestAnimationFrame || 
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame || 
	window.oRequestAnimationFrame || 
	window.msRequestAnimationFrame || 
	function(callback, element) { return window.setTimeout(callback, 1000/60); };

window.cancelFrame =
	window.cancelRequestAnimationFrame ||
	window.webkitCancelRequestAnimationFrame ||
	window.mozCancelRequestAnimationFrame ||
	window.oCancelRequestAnimationFrame ||
	window.msCancelRequestAnimationFrame ||
	window.clearTimeout;

function createShader(gl, type, src) {
	var shader;

	shader = gl.createShader(type);
	if(!shader) return null;

	gl.shaderSource(shader, src);

	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log("An error occurred compiling the shader " + type + ": " + gl.getShaderInfoLog(shader));
		return null;
	}

	// TODO check if it successfully compiled

	return shader;
}


/* Matrix functions */
/* When writing functions, remember that the matrix is transposed compared to 
   what it might seem like. Refer to MatIdx and the existing functions if you
   don't know what I mean. */
function Mat4MakeIdentity() {
	return [
	1,0,0,0,
	0,1,0,0,
	0,0,1,0,
	0,0,0,1
	];
}

function Mat4LoadIdentity(mat4) {
	var i,j;
	for(i=0; i<4; i++) {
		for(j=0; j<4; j++) {
			if(i == j) {
				mat4[i*4+j] = 1.0;
			} else {
				mat4[j*4+i] = 0.0;
			}
		}
	}
}

function Mat4MakeOrthographic(left, right, bottom, top, near, far) {
	return [
		2.0 / (right-left), 0, 0, 0,
		0, 2.0 / (top-bottom), 0, 0,
		0, 0, 2.0 / (far-near), 0,
		-(right+left)/(right-left), -(top+bottom)/(top-bottom), -(far+near)/(far-near), 1
	];
}

function Mat4MakePerspective(fovy_deg, aspect, near, far) {
	var f = 1.0 / Math.tan(fovy_deg * Math.PI / 360.0);
	var neg_depth = near - far;
	
	return [
	f / aspect, 0, 0, 0,
	0, f, 0, 0,
	0, 0, (far+near)/neg_depth, -1.0,
	0, 0, 2.0*(near*far)/neg_depth, 0
	];
}

function Mat4Translate(mat4, x, y, z) {
	Mat4Multiply(mat4, mat4, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

function Mat4Scale(mat4, x, y, z) {
	Mat4Multiply(mat4, mat4, [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]);
}

function Mat4Idx(row,col) {
	return col*4+row;
}

function Mat4MakeAdd(mat0, mat1) {
	var matResult = [];
	Mat4Add(matResult, mat0, mat1);
	return matResult;
}

function Mat4Add(matResult, mat0, mat1) {
	var i;

	for(i=0; i<16; i++) {
		matResult[i] = mat0[i] + mat1[i];
	}
}

function Mat4MakeMultiply(mat0, mat1) {
	var matResult = [];
	Mat4Multiply(matResult, mat0, mat1);
	return matResult;
}

function Mat4Multiply(matResult, mat0, mat1) {
	var i, j, k;

	// If mat0 or mat1 == matResult, the in-place multiply would mess up. The
	// following lines clone to account for this. This allows you to do something like:
	//     MatMultiply(mvMatrix, someTranslation, mvMatrix);

	if(matResult == mat0) {
		mat0 = mat0.slice(0); // clone
	}
	if(matResult == mat1) {
		mat1 = mat1.slice(0); // clone
	}

	for(i=0; i<16; i++) {
		matResult[i] = 0;
	}

	for(i=0; i<4; i++) { // row of rotMat
		for(j=0; j<4; j++) { // col of mat4
			for(k=0; k<4; k++) { // col of rotMat/row of mat4
				matResult[Mat4Idx(i,j)] += mat0[Mat4Idx(i,k)] * mat1[Mat4Idx(k,j)];
			}
		}
	}
}

function Mat4Rotate(mat4, angle_rad, x, y, z) {
	var rotMat, resultMat;
	var i,j,k;
	var cosAng, sinAng;
	var mag;

	mag = Math.sqrt(x*x + y*y + z*z);
	x = x/mag;
	y = y/mag;
	z = z/mag;

	cosAng = Math.cos(angle_rad);
	sinAng = Math.sin(angle_rad);

	rotMat = [
		x*x + (y*y + z*z) * cosAng,
		x*y*(1-cosAng) + z*sinAng,
		x*z*(1-cosAng) - y*sinAng,
		0,

		x*y*(1-cosAng) - z*sinAng,
		y*y + (x*x + z*z) * cosAng,
		y*z*(1-cosAng) + x*sinAng,
		0,

		x*z*(1-cosAng) + y*sinAng,
		y*z*(1-cosAng) - x*sinAng,
		z*z + (x*x + y*y) * cosAng,
		0,

		0,
		0,
		0,
		1
	];

	Mat4Multiply(mat4, mat4, rotMat);
}
