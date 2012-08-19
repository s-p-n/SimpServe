module.exports = function (m) {
	var express = m.express;
	var app = m.app;
	app.get('/', function (req, res) {
		res.redirect('/' + m.config.defaults.app + '/');
	});

	//app.get('/utils', function (req, res) {
	//	res.sendfile('./public/utils.js');
	//});

	app.get('/:webapp', function (req, res) {
		var webapp = req.params.webapp;
		console.log("Got webapp:", webapp);
		for (var i in m.config.redirects) {
			if (webapp === m.config.redirects[i][0]) {
				console.log("Redirecting to", 
					m.config.redirects[i][1]
				);
				res.redirect(m.config.redirects[i][1]);
				return;
			}
		}
		res.redirect('/' + webapp + '/' + m.config.defaults.index);
	});

	app.get('/:webapp/:file', function (req, res) {
		var	webapp = req.params.webapp,
			file = req.params.file;
		//console.log(webapp);
		//console.log(file);
		for (var alias in m.config.defaults) {
			if (file === alias) {
				file = m.config.defaults[alias];
			}
		}
		var filename = './public/' + webapp + '/' + file;
		if (!m.fs.existsSync(filename)) {
			res.send(404, 'cannot find it');
		} else if (m.fs.statSync(filename).isDirectory()){
			res.redirect("/" + webapp + "/" + file + "/" + m.config.defaults.index);
		} else {
			res.sendfile(filename);
		}
	});
	
	app.get(/(.*)/, function (req, res) {
		var filename = './public';
		var url_parts = req.params[0].split('/').splice(1);
		var i;
		//console.log(url_parts);
		//res.send(url_parts);
		
		for (i in url_parts) {
			//console.log(i, url_parts.length - 1);
			if (i == url_parts.length - 1) {
				//console.log("Checking for alias...");
				for (var alias in m.config.defaults) {
					if (url_parts[i] === alias) {
						//console.log("Found alias:", url_parts[i])
						url_parts[i] = m.config.defaults[alias];
					}
				}
			}
			filename += '/' + url_parts[i].replace(/[^\w.-_]/,'');
		}
		
		var alternative = filename.substr(7) + '/' + m.config.defaults.index;
		
		if (m.fs.existsSync(filename)) {
			res.sendfile(filename);
			//console.log("sent file:", filename);
		} else {
			res.send(404, 'Cannot find it.');
		}
	});
}
