(function($) {
    var settings = {
        xdomain: '*',
        polling: 0,
        onWidthChanged: null
    };

    /*
     * Process a new message from parent frame.
     */
    processMessage = function(e) {
        console.log('child got: ' + e.data);
        if (settings.xdomain !== '*') {
            var regex = new RegExp(settings.xdomain + '$');
          
            if (!e.origin.match(regex)) {
                // Not the origin we're listening for
                return;
            }
        }

        var match = e.data.match(/^(\d+)$/);

        if (!match || match.length !== 2) {
            // Not the message we're listening for
            return;
        }

        var width = parseInt(match[1]);
        console.log(width);

        if (settings.onWidthChanged) {
            settings.onWidthChanged(width);
        }
    }

    /*
     * Transmit the current iframe height to the parent.
     */
    window.sendHeightToParent = function() {
        var height = $(document).height().toString();

        window.top.postMessage(height, '*');
    }


    /*
     * Setup thisdocument as a responsive iframe child.
     */
    window.setupResponsiveChild = function(config) {
        $.extend(settings, config);

        window.addEventListener('load', sendHeightToParent);
        window.addEventListener('resize', sendHeightToParent);
        window.addEventListener('message', processMessage, false);

        if (settings.polling) {
            window.setInterval(sendHeightToParent, settings.polling);
        }
    }

}(jQuery));
