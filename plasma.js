
var p;


function init_plasma() {
	p = [];
	for(var x = 0; x <= n; x++){
		p[x] = [];    
		for(var y = 0; y <= n; y++){ 
			p[x][y] = 0; //new vec4(0, 0, 0, 1);    
		}    
	}
	
	// initalize corners 

	p[0][n] = Math.random() * 15;//new vec4(Math.random(), Math.random(), Math.random(), 1);
	p[n][n] = Math.random() * 15;//new vec4(Math.random(), Math.random(), Math.random(), 1);
	p[n][0] = Math.random() * 15;//new vec4(Math.random(), Math.random(), Math.random(), 1);
	p[0][0] = Math.random() * 15;//new vec4(Math.random(), Math.random(), Math.random(), 1);
/**/	

	subdivide(0, 0, n, n);
	
	return 0;
}


function subdivide(x1, y1, x2, y2) {

	var width = Math.abs(x1 - x2); var halfWidth = parseInt(width/2);
	var height = Math.abs(y1 - y2); var halfHeight = parseInt(height/2);


	var tL = p[x1][y1];
	var tR = p[x2][y1];
	var bL = p[x1][y2];
	var bR = p[x2][y2];

	var dR = Math.random();
	
	// works 
	//p[x1+halfWidth][y1+halfHeight] = new vec4((tL[0] + tR[0] + bL[0]+ bR[0])/4+dR, (tL[1] + tR[1] + bL[1]+ bR[1])/4+dG, (tL[2] + tR[2] + bL[2]+ bR[2])/4+dB, 1);//new vec4(1, 0, 0, 1); //middle
	//p[x1][y1+halfHeight] = new vec4( (tL[0] + bL[0])/2, (tL[1]+bL[1])/2, (tL[2]+bL[2])/2, 1);//new vec4(1, 0, 0, 1); // middle left
	//p[x2][y1+halfHeight] = new vec4( (tR[0] + bR[0])/2, (tR[1]+bR[1])/2, (tR[2]+bR[2])/2, 1);//new vec4(1, 0, 0, 1); // middle righ
	//p[x1+halfWidth][y1] = new vec4( (tL[0] + tR[0])/2, (tL[1] + tR[1])/2,(tL[2] + tR[2])/2, 1);//new vec4(1, 0, 0, 1); // middle top
	//p[x1+halfWidth][y2] = new vec4( (bL[0] + bR[0])/2, (bL[1] + bR[1])/2,(bL[2] + bR[2])/2, 1);//new vec4( 1, 0, 0, 1); // middle bottom
	
	// works 
	p[x1+halfWidth][y1+halfHeight] = (tL + tR + bL+ bR)/4+dR;
	p[x1][y1+halfHeight] = (tL + bL)/2;
	p[x2][y1+halfHeight] = (tR + bR)/2;
	p[x1+halfWidth][y1] = (tL + tR)/2;
	p[x1+halfWidth][y2] = (bL + bR)/2;


	
	if(width<2) {return;}
	if(height<2) {return;}
	subdivide(x1+halfWidth, y1+halfHeight, x2, y2);
	subdivide(x1+halfWidth, y1, x2, y1+halfHeight);
	subdivide(x1, y1, x1+halfWidth, y1+halfHeight);
	subdivide(x1, y1+halfHeight, x1+halfWidth, y2);

}

