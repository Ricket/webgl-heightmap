window.mouseX = 0, window.mouseY = 0;

document.onmousemove = function (e) {
	if(!e) var e = window.event;
	
	if(e.pageX || e.pageY) {
		window.mouseX = e.pageX;
		window.mouseY = e.pageY;
	}
	else if(e.clientX || e.clientY) {
		window.mouseX = e.clientX + document.body.scrollTop + document.documentElement.scrollTop;
		window.mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	else {
		console.log("Unsupported mouse move event");
	}
}
