
"use strict";

var gl, program, texture, vertices, colors, texCoords, normals, indices, canvas, geom;
var fov = 60;
var angle = 0;
var n = 100;
var a = 0;


var animation = true;
var mesh;

var currentlyPressedKeys = [];
var camPosition, viewDir;
var view, viewLoc;
var oldYaw = 0, oldPitch = 0, yaw = 0, pitch = 0;

var p;

var texture, image;

function initTexture() {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	texture.image = new Image();
	texture.image.src = "grass.jpg";
	texture.image.onload = function() { 
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
}


function vecMatMult(vec, mat) { // this function multiplies a matrix with a vector, resulting in a vector 
	var res = vec4();
	res[0] = mat[0][0] * vec[0] + mat[0][1] * vec[1] + mat[0][2] * vec[2] + mat[0][3] * vec[3];
	res[1] = mat[1][0] * vec[0] + mat[1][1] * vec[1] + mat[1][2] * vec[2] + mat[1][3] * vec[3];
	res[2] = mat[2][0] * vec[0] + mat[2][1] * vec[1] + mat[2][2] * vec[2] + mat[2][3] * vec[3];
	res[3] = mat[3][0] * vec[0] + mat[3][1] * vec[1] + mat[3][2] * vec[2] + mat[3][3] * vec[3];
	return res;
}


// this function creates the vertices, texture coordinates, indices and normals for our terrain geometry

function create_terrain(n)  { 
		var ret = {};
		
		var vertices = [];
		var texCoords = [];
		var indices = [];
		var normals = [];
		
		for(var z=0;z<n;z++) {
			for(var x=0;x<n;x++) {
				
				var tx = x;
				var tz = z;
				
				//var elevation = Math.sqrt(Math.sin(tx*tx + tz*tz + a) * Math.sin(tx*tx + tz*tz + a)+0.2) / 2;
				var elevation = p[z][x] ;
				
				
				var vertex = new vec4(x, elevation, -z, 1);
				vertices.push(vertex);
				
				
				var texCoord = new vec4(x/n, z/n, 0, 1);
				//var color = new vec4(0, 0, 0,1);
				texCoords.push(texCoord);
			}
		}
		
		for(var z=0;z<(n-1);z++)
		{
			for(var x=0;x<(n-1);x++)
			{
				var i_lt = (z+1)*n + (x-1);
				var i_lm = (z)*n + (x-1);
				var i_lb = (z-1)*n + (x-1);
				var i_mt = (z+1)*n + x;
				var i_m = z*n + x;
				var i_mb = (z-1)*n + x;
				var i_rt = (z+1)*n + (x+1);
				var i_rm = (z)*n + (x+1);
				var i_rb = (z-1)*n + (x+1);
				
				if(z==(n-1)) {
					if(x==(n-1)) {
						indices.push(i_m);
						indices.push(i_lm);
						indices.push(i_mb);
					}
					else 
					{
						indices.push(i_mb);
						indices.push(i_m);
						indices.push(i_lm);
					}
				}
				else
				{
					if(x==(n-1)) 
					{
						indices.push(i_m);
						indices.push(i_lm);
						indices.push(i_mb);
					}
					else
					{
						indices.push(i_m);
						indices.push(i_rm);
						indices.push(i_mt);
						
						indices.push(i_rm);
						indices.push(i_rt);
						indices.push(i_mt);
						
					}
				}
				
				
			}
		}
		
		
		   // create the normal vectors  
	for(var z=0;z<(n);z++)
		{
			for(var x=0;x<(n);x++) 
			{
		
			    var i_ml = z*n + (x - 1);
			    var i_mr = z*n + (x + 1);
			    var i_tl = (z + 1)*n + (x - 1);
			    var i_tr = (z + 1)*n + (x + 1);
			    var i_bl = (z - 1)*n + (x - 1);
			    var i_br = (z - 1)*n + (x + 1);
			    var i_mc = z*n + (x);
			    
			    var i_tc = (z + 1)*n + (x);
			    var i_bc = (z - 1)*n + (x);

			    

			    var p1 = new vec4(0, 0, 0, 0), p2 = new vec4(0, 0, 0, 0), p3 = new vec4(0, 0, 0, 0);

			    if(x==(n-1)) { // right border 
				if(z==(n-1)) { // top right point
				    
				    p1 = vertices[i_bc];
				    p2 = vertices[i_mc];
				    p3 = vertices[i_ml];
				}
				else { // right, but not top
				    p1 = vertices[i_mc];
				    p2 = vertices[i_ml];
				    p3 = vertices[i_tc];
				}
			    }
			    else
			    {
			       if(z==(n-1)) 
			       {
				    p1 = vertices[i_br];
				    p2 = vertices[i_bc];
				    p3 = vertices[i_mc];
			       }
			       else
			       {
				    p1 = vertices[i_mr];
				    p2 = vertices[i_mc];
				    p3 = vertices[i_tc];
			       }

			    }

			    var u = new vec3(p1[0] - p3[0], p1[1] - p3[1], p1[2] - p3[2]);
			    var v = new vec3(p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]);
			    var normal = normalize(cross(u, v));
			    
			    normal = new vec4(normal[0], normal[1], normal[2], 0);
			    //normal = new vec4(0, 1, 0, 1);
			    normals.push(normal);
		    }
	    }

		ret.vertices = vertices;
		ret.texCoords = texCoords;
		ret.indices = indices;
		ret.normals = normals;
		return ret;
}






window.onload = function init()
{
	
	
    init_plasma();
	
	
	
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	gl.enable(gl.DEPTH_TEST);

	// add listener for slider
	document.getElementById("fov").oninput = function(event) {
		fov = event.target.value;
	};
	document.getElementById("startstop").onclick = function(event) {
		animation = !animation;
	};
	initTexture();



    // our player begins in the middle of the terrain 
    camPosition = vec3((n/2), p[n/2][n/2]+1, -(n/2));


    window.addEventListener("keydown", function(event) {
	currentlyPressedKeys[event.keyCode] = true;
    });
    
    window.addEventListener("keyup", function(event) {
	currentlyPressedKeys[event.keyCode] = false;
    });
    
    window.addEventListener("mousemove", function(event) {
	    var yawDelta = (event.clientX - oldYaw) / 5.0;
	    var pitchDelta = (event.clientY - oldPitch) / 5.0;
	    oldYaw = event.clientX;
	    oldPitch = event.clientY;
	    if(yawDelta<10.0) { yaw = yaw - yawDelta;} 
	    if(pitchDelta<10.0) { pitch = pitch - pitchDelta;}
	    //document.getElementById( "deb" ).value = "Yaw: " + yaw + ", pitch: " + pitch;
    });



    geom = create_terrain(n);

    update_geometry();

    render();
};



function update_geometry() 
{
	    // create geometry
	vertices = geom.vertices;
	texCoords = geom.texCoords;
	indices = geom.indices;
	normals = geom.normals;
    
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


	
    var norBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, norBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    // Associate out shader variables with our data buffer
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

	
    var texBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, texBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
    // Associate out shader variables with our data buffer
    var vTextureCoord = gl.getAttribLocation( program, "vTextureCoord" );
    gl.vertexAttribPointer( vTextureCoord, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTextureCoord );
	

    var indBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBufferId);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	
}

function camera_elevation() {

	var aX = parseInt(camPosition[0]) ;
	var aZ = -parseInt(camPosition[2]) ;

	// interpolate 
	var left_ix = parseInt(camPosition[0]);
	var right_ix = parseInt(camPosition[0]+1);
	var top_ix = parseInt(-camPosition[2]);
	var bottom_ix = parseInt(-camPosition[2]+1);
	
	var left_w = camPosition[0] - parseInt(camPosition[0]);
	var right_w = 1 - left_w;
	var top_w = -camPosition[2] - parseInt(-camPosition[2]);
	var bottom_w = 1 - top_w;
	
	
	
	
	document.getElementById("d").innerHTML = "left_w: " + left_w + "; right_w: " + right_w + "; top_w: " + top_w + "; bottom_w: " + bottom_w;

	
	var e = 0;

	if(aX<n && aZ>-n-1 && aZ>=0 && aX>=0)
	{
		var R1 = left_w * p[bottom_ix][left_ix] + right_w*p[bottom_ix][right_ix];
		var R2 = left_w * p[top_ix][left_ix] + right_w*p[top_ix][right_ix];
		e = bottom_w*R1 + top_w*R2 + 1;
	}
	else
	{	
		e = 0;
	}

	

	return e;
}


function handleKeys() {
	if(currentlyPressedKeys[87]==true) {// w
				camPosition[0] = camPosition[0] + 0.1* viewDir[0];
				camPosition[1] = camera_elevation();
				camPosition[2] = camPosition[2] + 0.1 * viewDir[2];
	}
	
	if(currentlyPressedKeys[83]==true) {// s
				camPosition[0] = camPosition[0] - 0.1 * viewDir[0];
				camPosition[1] = camera_elevation();
				camPosition[2] = camPosition[2] - 0.1 * viewDir[2];
	}
	
	if(currentlyPressedKeys[65]==true) {// a
				var defaultViewDir = vec4(0.0, 0.0, -1.0, 1.0); 
				var sideRotation = rotate(yaw-90, [0, 1, 0]);
				var sideDir = vecMatMult(defaultViewDir, sideRotation);
				camPosition[0] = camPosition[0] - 0.1 * sideDir[0];
				camPosition[1] = camera_elevation();
				camPosition[2] = camPosition[2] - 0.1 * sideDir[2];
	}
	
	if(currentlyPressedKeys[68]==true) {// d
				var defaultViewDir = vec4(0.0, 0.0, -1.0, 1.0); 
				var sideRotation = rotate(yaw-90, [0, 1, 0]);
				var sideDir = vecMatMult(defaultViewDir, sideRotation);
				camPosition[0] = camPosition[0] + 0.1 * sideDir[0];
				camPosition[1] = camera_elevation();
				camPosition[2] = camPosition[2] + 0.1 * sideDir[2];
	}

	if(camPosition[0]<0) {camPosition[0] = 0;}
	if(camPosition[2]>0) {camPosition[2] = 0;}
	if(camPosition[0]>n-1) {camPosition[0] = n-1;}
	if(camPosition[2]<-n+1) {camPosition[2] = -n+1;}

}




function render() {
    if(animation) {	a += 0.01; }
	
	handleKeys();


	var projection = perspective(fov, canvas.width/canvas.height, 0.001, 100);
	var address = gl.getUniformLocation(program, "projection");
	gl.uniformMatrix4fv(address, false, flatten(projection));

    // mouse move  
	var pitchRotation = rotate(pitch, [1, 0, 0]);
	var yawRotation = rotate(yaw, [0, 1, 0]);
	var defaultViewDir = vec4(0.0, 0.0, -1.0, 0.0); 
	var newViewDir;
	newViewDir = vecMatMult(defaultViewDir, pitchRotation);
	viewDir = vecMatMult(newViewDir, yawRotation);
	viewDir = normalize(viewDir);
		
	var viewMatrix = lookAt(camPosition, add(camPosition, new vec3(viewDir)), new vec3(0, 1, 0));

	viewLoc = gl.getUniformLocation(program, "view");
	gl.uniformMatrix4fv(viewLoc, false, flatten(viewMatrix));


	
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);



    requestAnimFrame( render );
}
