SimpServe
=========
I think I did some good things with this. I worked on a script for web-app extensions and reuse on the client using HTML5 data- attributes. 

(See /public/main/index.htm)

The first thing to notice is I'm including the '/utils' script. The '/utils' script is set as a redirect. Redirects are defined in '/private/config.json'

The second thing to notice is the 'data-..' attributes used on many tags. The 'data-..' attributes are used to add dynamic substance to components written in HTML.

data-channel
===
The 'data-channel' attribute is used to add a socket channel to elements. You can configure channels in the '/private/channels' directory under this configuration. You can change the channels directory inside '/private/config.json' under 'socket.dir'. Elements that have a socket channel should have one of 3 descriptor attributes which is used to describe the relation between the server and the client through the socket channel. 

socket descriptors:
==
- data-listener: [Usage: Listens and binds data and updates with each emit; Affects children] Listen for data and update data bindings as needed.
- data-template: [Usage: Listens, duplicates self with each emit; Affects parent] Listen for data and create a new instance as needed.
- data-method="socket": [Usage: ONLY use on form tags; Cancels default submit] Send data to the server.

data-src
===
The 'data-src' attribute is used to load something via the HTTP GET method. The content is loaded via AJAX and the href, src, and data-src attributes of the loaded module should be relative to the directory they are in- similar to the way external stylesheets work.
Example:
	
	<!-- /foo/index.htm -->
		<script src="utils"></script>
		<div id="bar" data-src="/bar"></div>
	
	<!-- /bar/index.htm -->
		<link rel="stylesheet" href="style.css"></link>
		<p>
			Hello, World
		</p>
	
	<!-- /bar/style.css -->
		#bar p {
			color: blue;
		}
	

The result will be blue text "Hello, World":
	
	<script src="/libraries/utils.js"></script>
	<div id="bar">
		<link rel="stylesheet" href="/bar/style.css"></link>
		<p>
			Hello, World!
		</p>
	</div>
	
In addition, 'style.css' may be replaced with 'css' and the above result will be renderred exactly the same (assuming the rules in '/private/config.json' file).

To be continued.. 

Please look through the '/public' directory to see examples of components. Notice the use of nested components: '/userarea/'


Please see Socket.IO, Express.js, and MongoDB for further documentation on these modules.
