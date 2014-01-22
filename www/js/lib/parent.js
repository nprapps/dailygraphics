(function($) {
    var settings = {
        src: null,
        xdomain: '*'
    };

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
     * Process a new message from a child iframe.
     */
    function processMessage($elem, e) {
        console.log('parent got height: ' + e.data);

        if (!isSafeMessage(e)) {
            return;
        }

        // Child sent height
        var match = e.data.match(/^(\d+)$/);

        if (!match || match.length !== 2) {
            return false;
        }

        var height = parseInt(match[1]);

        $elem.find('iframe').css('height', height + 'px');
    }

    /*
     * Transmit the current iframe width to the child.
     */
    function sendWidthToChild($elem) {
        var width = $elem.width().toString();

        $elem.find('iframe')[0].contentWindow.postMessage(width, '*');
    }

    /*
     * Initialize one or many child iframes.
     */
    $.fn.responsiveIframe = function(config) {
        $.extend(settings, config);

        return this.each(function() {
            var $this = $(this);

            var width = $this.width().toString();

            // Send the initial width as a querystring parameter
            $this.append('<iframe src="' + settings.src + '?initialWidth=' + width + '" style="width: 100%;" scrolling="no" marginheight="0" marginwidth="0" frameborder="0"></iframe>')

            window.addEventListener('message', function(e) {
                processMessage($this, e);
            } , false);

            window.addEventListener('resize', function(e) {
                sendWidthToChild($this);
            });
        });
    };
}(jQuery));

