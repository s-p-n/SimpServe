var loaded_once = false;
module.exports = function(m, session) {
	var socket = session.socket;
	if (!loaded_once) {
		loaded_once = true;
		m.event.on('activity', function(activity) {
			activity.date = new Date().toString();
			socket.broadcast.emit('recent-activity', activity);
		});
	}
};
