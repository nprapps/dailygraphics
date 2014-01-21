(function($) {
    var settings = {
        xdomain: '*',
        polling: 0,
        onWidthChanged: null
    };

    var parentWidth = null;

    /*
     * Verify that the message came from a trustworthy domain.
     */
    function isSafeMessage(e) {
        if (settings.xdomain !== '*') {
            var regex = new RegExp(settings.xdomain + '$');
          
            if (!e.origin.match(regex)) {
                // Not the origin we're listening for
                return;
            }
        }

        return true;
    }

    /*
     * Process a new message from parent frame.
     */
    processMessage = function(e) {
        console.log('child got: ' + e.data);

        if (!isSafeMessage(e)) {
            return;
        }

        var match = e.data.match(/^(\d+)$/);

        if (!match || match.length !== 2) {
            // Not the message we're listening for
            return;
        }

        width = parseInt(match[1]);

        if (width != parentWidth) {
            parentWidth = width;

            if (settings.onWidthChanged) {
                settings.onWidthChanged(parentWidth);
            }
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
     * Setup this document as a responsive iframe child.
     */
    window.setupResponsiveChild = function(config) {
        $.extend(settings, config);

        window.addEventListener('message', processMessage, false);

        if (settings.polling) {
            window.setInterval(sendHeightToParent, settings.polling);
        }
    }

}(jQuery));
