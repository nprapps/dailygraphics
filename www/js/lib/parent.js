(function($) {
    var settings = {
        xdomain: '*'
    };

    /*
     * Process a new message from a child iframe.
     */
    function processMessage($elem, e) {
        console.log('parent got: ' + e.data);

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

        var height = parseInt(match[1]);

        $elem.css('height', height + 'px');
    }

    /*
     * Transmit the current iframe width to the child.
     */
    function sendWidthToChild($elem, e) {
        var width = $elem.width().toString();

        $elem[0].contentWindow.postMessage(width, '*');
    }

    /*
     * Initialize one or many child iframes.
     */
    $.fn.responsiveIframe = function( config ) {
        $.extend(settings, config);

        return this.each(function() {
            var $this = $(this);

            window.addEventListener('message', function(e) {
                processMessage($this, e);
            } , false);

            window.addEventListener('load', function(e) {
                sendWidthToChild($this, e);
            });

            window.addEventListener('resize', function(e) {
                sendWidthToChild($this, e);
            });
        });
    };
}(jQuery));

