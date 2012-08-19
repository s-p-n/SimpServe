var db = require('mongojs').connect('rakr', ['clients']);
module.exports = function (m) {
	m.db = db;
};
