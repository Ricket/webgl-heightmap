// heightmap data structures, manipulation, and rendering

function Heightmap(x, y, heights) {
	var i,j;
	
	// x and y are the number of VERTICES in those directions
	this.x = x;
	this.y = y;
	
	if(heights && heights.length == x * y) {
		this.heights = heights;
	} else {
		this.heights = [];

		for(i = 0; i < x * y; i++) {
			this.heights.push(0);
		}
	}
	
	this.indices = [];
	for(i = 1; i < this.y; i++) {
		for(j = 0; j < this.x - 1; j++) {
			this.indices.push(i * this.x + j);
			this.indices.push((i - 1) * this.x + j + 1);
			this.indices.push(i * this.x + j + 1);
			
			this.indices.push(i * this.x + j);
			this.indices.push((i - 1) * this.x + j);
			this.indices.push((i - 1) * this.x + j + 1);
		}
	}
	
	this.regenerateVerts();
}

Heightmap.prototype.regenerateVerts = function () {
	var i,j;
	
	this.verts = [];
	for(i = 0; i < this.y; i++) {
		for(j = 0; j < this.x; j++) {
			this.verts.push(j);
			this.verts.push(this.heights[i*this.x+j]);
			this.verts.push(i);
		}
	}
	
	this.colors = [];
	for(i = 0; i < this.y; i++) {
		for(j = 0; j < this.x; j++) {
			this.colors.push(Math.random());
			this.colors.push(Math.random());
			this.colors.push(Math.random());
			this.colors.push(1.0);
		}
	}
	
}

Heightmap.prototype.randomize = function (min, max) {
	var i;
	
	for(i = 0; i < this.x * this.y; i++) {
		this.heights[i] = min + (max - min) * Math.random();
		this.verts[i*3+1] = this.heights[i];
	}
}

Heightmap.prototype.initializeGL = function (gl) {
	this.vertsBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertsBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);
	
	this.colorsBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
	
	this.indicesBuf = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuf);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
}

Heightmap.prototype.drawGL = function (gl, vertexPositionAttribute, vertexColorAttribute) {
	if(!this.vertsBuf || !this.indicesBuf) {
		console.log("[ERROR] drawGL: not initialized");
		return;
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertsBuf);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuf);
	gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuf);
	gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
}

Heightmap.loadFromFile = function (url, success, error) {
	$.ajax({
		url: url,
		success: function (data) {
			var newHeightmap = new Heightmap(data.x, data.y, data.heights);
			success.call(newHeightmap);
		},
		error: function (xhr, status, errormsg) {
			error.call(null, status, errormsg)
		},
		dataType: 'jsonp',
		jsonp: false,
		jsonpCallback: 'onJSONPLoad'
	});
}
