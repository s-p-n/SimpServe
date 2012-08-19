var db = require('mongojs').connect('DB_NAME', ['Collection1', 'Collection2']);
module.exports = function (m) {
	m.db = db;
};
