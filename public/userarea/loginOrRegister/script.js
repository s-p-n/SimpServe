(function () {
	var num_waits = 0;
	var waitForjQuery = setInterval(function () {
		num_waits += 1;
		if (typeof jQuery !== "undefined") {
			clearInterval(waitForjQuery);
			init();
		} else {
			console.log("Waiting for jQuery1..");
		}
	}, 1);
	var init = function () {
		$('.toggle_loginOrRegister').unbind('click').click(function () {
			//console.log("Toggling Classes");
			$('.loginOrRegister').toggleClass('hidden');
			return false;
		}).css('cursor', 'pointer');
	};
}());
