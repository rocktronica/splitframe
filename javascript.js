(function() {

	var bookmarklet = document.querySelector("[data-bookmarklet]");

	if (window.top === window.self) {

		// override prompts if run on this page
		window.splitframe = {
			needle: location.port ? "?local" : "splitframe/",
			replacement: location.port ? "?live" : "splitframe/?live"
		};

		// remove any lingering params or hashes
		var cleanUrl = window.location.href.replace(/(#.*|\?.*)/, "");
		cleanUrl = cleanUrl.substr(0, cleanUrl.lastIndexOf("/"));
		window.history.pushState(null, null, cleanUrl);

		var path = "http://" + location.host + location.pathname;
		path = path.replace(/\/*$/, "");

		bookmarklet.href = 'javascript:(function(){var script = document.createElement("script");script.src =  "' + path + '/splitframe.js?" + (+new Date());document.body.appendChild(script);}());';

		bookmarklet.addEventListener("click", function() {
			// reset first frame's URL
			var foundFrame = function() {
				return document.querySelector("frame");
			};
			var waiting = setInterval(function() {
				var frame = foundFrame();
				if (frame) {
					frame.src += "?local";
					clearInterval(waiting);
				}
			}, 1);
		});

	} else {

		bookmarklet.addEventListener("click", function(e) {
			e.preventDefault();
			console.warn("Wise guy.");
		});

		var match = location.search.match(/(local|live)/)
		if (match && match.length) {
			var param = match[1];
			var a = document.querySelector("h1 a");
			a.href += "?" + param;
			a.innerHTML = a.innerHTML.replace(/split/i, "<span>" + param + "</span>");
			document.body.classList.add(param);
		}

	}

}());