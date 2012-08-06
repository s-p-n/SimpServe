SimpServe
=========
I think I did some good things with this. I worked on a utils.js script for web-app extensions and reuse on the client through HTML5 data- attributes. 

	<html>
	    <head>
		<script src="/utils"></script>
	    </head>
	    <body>
		<div data-template data-channel="news">
		    <input type="text" name="headline" placeholder="Loading.." data-bind="headline">
		</div>
	    </body>
	</html>

The first thing to notice is I'm including the '/utils' script. private/router.js contains an app.get() line that grabs the utils.js script and serves it.

The second thing to notice is the 'data-template' and 'data-channel' attributes for the div. The 'data-template' attribute tells utils.js that the div is a template, and not a static HTML element. Utils will hide that DIV and use it later as a template for repeatable data. The template's parent is used to place copies of the template HTML.

The 'data-channel' attribute has the value of 'news' which means that the DIV is listening on the 'news' socket for data. Every time we get information from the 'news' channel, the utils script will put data inside the scope of whatever element has the data-channel="news" attribute. Inside of that simple DIV template is an input box.

The input box inside the DIV has the attribute 'data-bind' set to 'headline'. That attribute tells utils.js that anytime the 'news' channel comes in with a 'headline' property, we will place the value from that headline into the innerHTML and the value of the element with 'data-bind="headline"'. 

Without coding any JavaScript, our HTML template files can contain very fluid, dynamic data from the server. There's more.


This is the 'hello' app's index.htm file:

	<script src="/utils"></script>
	<link href="css" rel="stylesheet"></link>
	<fieldset>
	    <legend>Create Article</legend>
	    <form data-method="socket" data-channel="article">
		<p>
		    <input type="text" name="headline" placeholder="Headline" required></input>
		</p>
		<p>
		    <textarea name="content" placeholder="Content" required></textarea>
		</p>
		<p>
		    <button>Submit</button>
		</p>
	    </form>
	</fieldset>
	<div class="articles">
	    <article data-template data-channel="news">
		<h2 data-bind="headline"></h2>
		<span data-bind="content"></span>
	    </article>
	</div>
	<div data-src="/test"></div>


Very similar, but we added a few cool things. The <link> tag uses the href of 'css'. But in the 'hello' app our stylesheet is named 'style.css'. The reason it works is because inside of /private/wa.json we have a configuration set to default index, CSS, and JS filenames. We set an alias from style.css to 'css' so that when express see's a request for '/hello/css' the result will be exactly the same as '/hello/style.css'. 

The next cool thing is the form attributes. I decided not to use the 'method' attribute (as I had originally planned) because I don't want to add a non-standards-compliant practice to anyone's vocabulary.. I might do that, but I'll try not to. So instead I used the data- attribute again, creating a way to send forms with a socket method rather than GET/POST. Without coding any JavaScript, your HTML forms can send data to a socket channel instead of a URL. In order for the form to know which channel to use, though, we use our handy data-channel attribute. We could have used 'news' for this, but I wanted to express the use of multiple channels- even though it's not necessary for this particular example. It's okay to send input and output for the same app on the same channel.

The names of the forms should probably be expected by the socket server, just like with $_GET/$_POST with PHP. The data will arrive in the form of a serialized array using jQuery's serialzeArray() method.

Finally, last but not least, there is another attribute I made called "data-src" which is useful to load web-apps into DIVs. Just like the src or href attributes, the value should be something in the web-server's public file-system.

And that's all there is to the client side of things- very easy, I didn't use any JavaScript (outside of the built-in client utils) at all to make these dynamic templates. Note that utils will include jQuery and socket.io, and that this is still under development and libraries such as YUI, prototype or mootools haven't been tested yet. Though I surely hope and think they will work, I simply haven't tested them- so don't expect miracles like that quite yet.

Okay, next I'll walk you through the server-side of things...

	var	port = 8000,
		fs = require('fs'),
		express = require('express'),
		app = express(),
		io = require('socket.io').listen(app.listen(port)),
		router = require('./private/router')(express, app, require('./private/wa.json'));
	var dir = fs.readdirSync('./private/channels');
	var index;
	var channels = [];
	for (index in dir) {
		channels.push(require('./private/channels/' + dir[index]));
	}

	io.sockets.on('connection', function (socket) {
		console.log("Someone connected");
		for (var i in channels) {
			channels[i](socket);
		}
	});
	console.log("Server started.");

On this server we outsource the router's work to './private/router.js'. All the router cares about is express, app, and the webapp configuration file. I think global webapp configuration should be performed in JSON files or some database. I chose './private/wa.json' for this example server. If you open that file you will see some configurations for defaults. That configuration is only used in the router, so it should be easy to change to something that makes more sense for your needs. 

We are also grabbing a list of files from the directory: './private/channels'

The rest of the code is loading those files and requiring them. These files should be used for socket.io channels. This example contains a channel file "news.js" inside "./private/channels"

Please see Socket.IO, Express.js, and MongoDB for further documentation on these modules.
