(function(win, doc, body, cache, undefined){

    // get variables; first checking global then using prompt w/ cache
    var app = "splitframe";
    var needle = cache[app + "_needle"] = (win[app] && win[app].needle) ||
        prompt("Development URL needle", cache[app + "_needle"] || "dev.");
    var replacement = cache[app + "_replacement"] = (win[app] && win[app].replacement) ||
        prompt("What replaces it on live site", cache[app + "_replacement"] || "www.");

    // cancel if unused
    if (!needle || !replacement) { return false; }

    var url = location.href.replace(/#.*/, ""); // trim hash

    // parent frameset
    var frameset = doc.createElement("frameset");
    frameset.cols = "*,*";

    // left frame
    var localFrame = doc.createElement("frame");
    frameset.appendChild(localFrame);
    localFrame.src = url;

    // right frame
    var liveFrame = doc.createElement("frame");
    frameset.appendChild(liveFrame);

    doc.head.innerHTML = body.innerHTML = ""; // try to empty all content
    body.setAttribute("style", "margin:0;padding:0;"); // reset css
    body.appendChild(frameset);

    // removes protocol, trailing slashes, and hash
    function stripUrl(url) {
        return url.replace(/(^.*\/{2}|\/*$)/g, "");
    }

    // make all external links escape frameset
    function fixLinks(context) {
        var links = context.querySelectorAll("a"), count = links.length;
        for (var i = 0; i < count; i++) {
            var link = links[i];
            if (link.host !== win.location.host) {
                link.target = "_top";
            }
        }
    }

    // changing function, fired for both iframe loads and hash changes
    var onChange = function() {

        // since this may be either the iframe or window
        var context = this.contentDocument || this.document;
        var localUrl = context.location.href || context.location.href;

        liveFrame.src = localUrl.replace(needle, replacement);

        // retitle and change history
        document.title = context.title;
        history.pushState(null, null,
            location.protocol + "//" + stripUrl(localUrl) + "/#!/" + stripUrl(liveFrame.src)
        );

        fixLinks(context);

        // re-bind hash event since window has changed
        localFrame.contentWindow.addEventListener("hashchange", onChange);
    };

    localFrame.addEventListener("load", onChange);

}(window, document, document.body, localStorage));