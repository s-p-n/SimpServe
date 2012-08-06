var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		init();
		//init = function (){};
		delete readyStateCheckInterval;
	}
}, 1);
if (typeof init === "undefined") {
	var init = function () {
		var files = [
			'/socket.io/socket.io.js',
			'http://code.jquery.com/jquery-1.7.2.min.js'
		];
		function require (uri, func) {
			if (uri instanceof Array) {
				var	i,
					num_done = 0,
					total = uri.length,
					scripts = {};
				function allDone (script) {
					scripts[script.src] = script;
					if (total === (++ num_done)) {
						func(scripts);
					}
				}
				for (i in uri) {
					require(uri[i], allDone);
				}
				return;
			}
			/// If this script is found in the DOM, don't make it again...
			var script_tags = document.getElementsByTagName('script');
			for (var i in script_tags) {
				if (script_tags[i].src && script_tags[i].src === uri) {
					func(script_tags[i]);
					return;
				}
			}
			var script = document.createElement('script');
			script.onreadystatechange = function () {
				if (this.readyState == 'complete') {
					func(script);
				}
			};
			script.onload = function () { func(script); };
			script.setAttribute('src', uri);
			document.getElementsByTagName('head')[0].appendChild(script);
		}
		require(files, utils);
		function utils () {
			var	socket = io.connect('/'),
				putData = function (item, data) {
					item.val(data);
					item.html(data);
				},
				$ = jQuery;
			scan(socket, putData, $);
		}
		function scan (socket, putData, $) {
			$('[data-template]').each(function () {
				//console.log("Found template");
				var tpl = $(this);
				var channel = tpl.attr('data-channel');
				tpl.hide();
				if (tpl.attr('data-listening') !== "true") {
					tpl.attr('data-listening', 'true');
					//console.log("Attaching listener..");
					socket.on(channel, function (data) {
						if (data instanceof Array) {
							for (var i in data) {
								build(data[i]);
							}
						} else {
							build(data);
						}
						function build (data) {
							//console.log("Got data");
							//console.log(data);
							tpl.clone().
								removeAttr('data-template').
								removeAttr('data-listening').
								appendTo(tpl.parent()).
								fadeIn('slow').
								children('[data-bind]').each(function () {
									var item = $(this);
									var binding = item.attr('data-bind');
									if (binding in data) {
										putData(item, data[binding]);
									}
								});
						}
					});
				} else {
					//console.log("Not attaching listener..");
				}
			});
			$('[data-src]').each(function () {
				var me = $(this);
				var src = me.attr('data-src');
				me.removeAttr('data-src');
				//console.log(src);
				$.get(src, function (data) {
					//console.log("Putting data");
					//console.log(data);
					putData(me, data);
				});
			});
			$('form[data-channel]').unbind('submit');
			$('form[data-channel]').submit(function (e) {
				var channel = $(this).attr('data-channel');
				socket.emit(channel, $(this).serializeArray());
				this.reset();
				e.preventDefault();
				return false;
			});
		}
	}
}
