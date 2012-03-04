window.mouseX = 0, window.mouseY = 0;

$(document).mousemove(function (e) {
	window.mouseX = e.pageX;
	window.mouseY = e.pageY;
});