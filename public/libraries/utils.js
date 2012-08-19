(function () {
	var num_checks = 0;
	var readyStateCheckInterval = setInterval(function() {
		num_checks ++;
		if (document.readyState === "complete" || num_checks <= 100) {
			//console.log("ReadyState complete.");
			clearInterval(readyStateCheckInterval);
			init();
		} else {
			//console.log("Waiting for readyState..");
		}
	}, 1);
}());
if (typeof init === "undefined") {
	//console.log("Declaring");
	
	var utils = function () {
		//console.log("Building..");
		window.socket = window.socket || io.connect('/');
		var	putData = function (item, data) {
				item.val(data);
				item.html(data);
			},
			$ = jQuery;
		scan(putData, $);
	};
	var srcPath = function (uri, l) {
		var l = (l || location);
		var start = (l.protocol + '//' + l.host);
		if (uri[0] === '/') {
			return start + uri;
		} else {
			return start + l.pathname.substr(0, l.pathname.lastIndexOf('/') + 1) + uri;
		}
	};
	var scan = function (putData, $) {
		console.log("Scanning Document..");
		$('[data-listener]').each(function() {
			var me = $(this);
			var channel = me.attr('data-channel');
			
			if (me.attr('data-listening') !== "true") {
				me.attr('data-listening', 'true');
				console.log("Attaching listener for channel " + channel + "..");
				socket.on(channel, function (data) {
					var build = function (data) {
						console.log("Got data for channel " + channel);
						//console.log(me);
						//console.log(data);
						//putData(me, data);
						me.find('[data-bind]').each(function () {
							var item = $(this);
							var binding = item.attr('data-bind');
							if (binding in data) {
								//console.log("Putting data:", data[binding]);
								me.hide('fast', function () {
									putData(item, data[binding]);
									me.show('slow');
								});
								
							} else {
								//console.log("Not Putting data:", data[binding]);
							}
						});
					}
					
					if (data instanceof Array) {
						for (var i in data) {
							build(data[i]);
						}
					} else {
						build(data);
					}
				})
				
			}
		});
		$('[data-template]').each(function () {
			//console.log("Found template");
			var tpl = $(this);
			var channel = tpl.attr('data-channel');
			tpl.hide();
			if (tpl.attr('data-listening') !== "true") {
				tpl.attr('data-listening', 'true');
				console.log("Attaching template listener for channel " + channel + "..");
				socket.on(channel, function (data) {
					var build = function (data) {
						console.log("Got data for channel:", channel);
						//console.log(tpl);
						//console.log(data);
						tpl.clone().
							removeAttr('data-template').
							removeAttr('data-listening').
							appendTo(tpl.parent()).
							show('slow').
							find('[data-bind]').each(function () {
								var item = $(this);
								var binding = item.attr('data-bind');
								if (binding in data) {
									putData(item, data[binding]);
								}
							});
					}
					
					if (data instanceof Array) {
						for (var i in data) {
							build(data[i]);
						}
					} else {
						build(data);
					}
				});
			}
		});
		$('[data-src]').each(function () {
			var me = $(this);
			var src = me.attr('data-src');
			console.log("Found data SRC:", src);
			me.attr('data-loaded-src', src);
			me.removeAttr('data-src');
			//console.log(src);
			var cb = function (data) {
				//console.log("Putting data");
				//console.log(data);
				var include = $(data);
				//console.log(data);
				//console.log(me.attr('data-loaded-src'), include.filter('[src],[data-src],[href]'), include);
				include.filter('[src],[data-src],[href]').each(function () {
					var res = $(this);
					var attr;
					if (res.attr('src')) {
						attr = 'src';
					} else if (res.attr('data-src')) {
						attr = 'data-src';
					} else if (res.attr('href')) {
						attr = 'href';
					} else {
						return;
					}
					
					var uri = res.attr(attr);
					var l = {
						host: location.host,
						protocol: location.protocol,
						pathname: me.attr('data-loaded-src').replace(location.protocol + '//' + location.host, '') + '/'
					};
					var last_path = '';
					while (last_path !== l.pathname.replace(location.protocol + '//' + location.host, '')) {
						last_path = l.pathname.replace(location.protocol + '//' + location.host, '');
						//console.log('replacing..', last_path);
					}
					l.pathname = last_path;
					//console.log("l:", l);
					//console.log(me.attr('data-loaded-src'), uri, srcPath(uri, l));
					
					if (res.attr('tag') === 'script') {
						var script = document.createElemecnt('script');
						script[attr] = srcPath(uri, l);
						res.parent().append(script);
					} else {
						res.attr(attr, srcPath(uri, l));
					}
				});
				me.append(include);
			};
			$.get(src, cb);
			//cb();
		});
		$('form[data-channel]').unbind('submit').submit(function (e) {
			var channel = $(this).attr('data-channel');
			socket.emit(channel, $(this).serializeArray());
			this.reset();
			e.preventDefault();
			return false;
		});
	};
	var require = function (uri, func) {
		//console.log("Requiring..");
		if (uri instanceof Array) {
			var	i,
				num_done = 0,
				total = uri.length,
				scripts = {};
			function allDone (script) {
				scripts[script.src] = script;
				//console.log(scripts)
				if (total <= (++ num_done)) {
					//console.log("Done with require..");
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
		
		//console.log("script src:", (location.protocol + location.host + location.pathname.substr(0, location.pathname.lastIndexOf('/')) + uri));
		for (var i in script_tags) {
			//console.log(srcPath(uri), script_tags[i].src)
			if (script_tags[i].src && (script_tags[i].src === uri || script_tags[i].src === srcPath(uri))) {
				//console.log("Found in DOM:", uri);
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
		//console.log("Required:", uri);
	};
	var init = function () {
		//console.log("Initializing..");
		var files = [
			'/socket.io/socket.io.js',
			'http://code.jquery.com/jquery-1.7.2.min.js'
		];
		
		require(files, utils);
		//init = function () {};
	};
}
