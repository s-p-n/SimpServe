(function () {
	var num_waits = 0;
	var waitForjQuery = setInterval(function () {
		num_waits += 1;
		if (typeof jQuery !== "undefined" || num_waits >= 100) {
			clearInterval(waitForjQuery);
			init();
			delete init;
		} else {
			//console.log("Waiting for jQuery2..");
		}
	}, 1);
	
	function setValidity(items, validity, title) {
		//console.log(items, title);
		var validity = (validity || '');
		var i, item;
		if (items instanceof Array) {
			for (i in items) {
				setValidity(items[i], validity, title);
			}
		} else {
			item = items;
			item.setCustomValidity('');
			item.setCustomValidity(validity);
			title = (title || item.title_old || item.title);
			if (title !== item.title && (!item.title_old || title !== item.title_old)) {
				//console.log('new:', title);
				item.title_old = item.title;
				item.title = title;
			} else if (title === item.title_old) {
				delete item.title_old;
				//console.log("old:", title);
				item.title = title;
			}
		}
	}
	
	var init = function () {
		function hasRepeat(form, name) {
			return form.find('[name="' + name + '_repeat"]').length > 0;
		}
		
		$('form input,textarea,select').on('input', function () {
			var item = $(this);
			var f = item.closest('form')
			var item2;
			var match = item.attr('name').match(/^(.*)_repeat$/i);
			var name = (match === null ? item.attr('name') : match[1]);
			//console.log(f);
			if (match !== null) {
				item2 = f.find('[name="' + name + '"]');
			} else if (hasRepeat(f, name)) {
				item2 = f.find('[name="' + name + '_repeat"]');
			} else {
				return;
			}
			//console.log(item, item2);
			if (item.val() === item2.val()) {
				//console.log("Matches!");
				setValidity([item[0], item2[0]]);
			} else {
				setValidity([item[0], item2[0]], 'The ' + name + 's must match.', "Supplied " + name + "s should be exactly the same (case-insensitive).");
			}
		});
	};
}());
