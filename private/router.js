module.exports = function (express, app, wa) {
	app.get('/', function (req, res) {
		res.redirect('/hello/');
	});

	app.get('/utils', function (req, res) {
		res.sendfile('./public/utils.js');
	});

	app.get('/:webapp', function (req, res) {
		var webapp = req.params.webapp;
		res.redirect('/' + webapp + '/' + wa.config.defaults.index);
	});

	app.get('/:webapp/:file', function (req, res) {
		var	webapp = req.params.webapp,
			file = req.params.file;
		console.log(webapp);
		console.log(file);
		for (var alias in wa.config.defaults) {
			if (file === alias) {
				file = wa.config.defaults[alias];
			}
		}
		res.sendfile('./public/' + webapp + '/' + file);
	});
}
