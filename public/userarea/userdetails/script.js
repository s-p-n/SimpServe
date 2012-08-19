(function () {
	var num_waits = 0;
	var waitForSocket = setInterval(function () {
		num_waits += 1;
		if (typeof socket !== "undefined") {
			clearInterval(waitForSocket);
			init();
		} else {
			console.log("Waiting for jQuery1..");
		}
	}, 1);
	var init = function () {
		socket.emit("userdetails", {"ready": true});
		console.log("Sent ready signal");
	};
}());
