/*
 * Module for tracking standardized analytics.
 */

var ANALYTICS = (function () {
    /*
     * Google Analytics
     */
    var setupGoogle = function() {
        (function(i,s,o,g,r,a,m) {
            i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', GOOGLE_ANALYTICS_ACCOUNT_ID, 'auto');
        ga('send', 'pageview');
     }

    /*
     * Event tracking.
     */
    var trackEvent = function(eventName, label, value) {
        var eventData = {
            'hitType': 'event',
            'eventCategory': GOOGLE_ANALYTICS_PROJECT_SLUG,
            'eventAction': eventName
        }

        if (label) {
            eventData['eventLabel'] = label;
        }

        if (value) {
            eventData['eventValue'] = value
        }

        ga('send', eventData);
    }

    setupGoogle();

    return {
        'trackEvent': trackEvent
    };
}());
