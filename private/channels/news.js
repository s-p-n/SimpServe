var	mongodb = require('mongodb'),
	server = mongodb.Server('localhost', 27017, {auto_reconnect: true}),
	database = new mongodb.Db('news', server),
	db;
database.open(function (err, store) {
	db = store;
});
module.exports = function (socket) {
	init(socket, db);
}
function init (socket, db) {
	db.collection('articles', function (err, collection) { 
		collection.find({}, {headline: true, content: true}).toArray(function (err, items) {
			socket.emit('news', items);
		});
	});
	socket.on('article', function (data) {
		console.log("Got data:");
		console.log(data);
		var newData = {headline: null, content: null};
		for (var i in data) {
			if (data[i].name === "headline") {
				newData.headline = data[i].value;
			} else if (data[i].name === "content") {
				newData.content = data[i].value;
			}
		}
		db.collection('articles', function (err, collection) {
			console.log(err);
			collection.insert(newData, {safe: true}, function (err, result) {
				console.log(err, result);
			});
		});
		socket.broadcast.emit('news', newData);
	});
}
