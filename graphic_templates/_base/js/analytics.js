/*
 * Module for tracking standardized analytics.
 */

var ANALYTICS = (function () {
    /*
     * Google Analytics
     */
    var DIMENSION_PARENT_URL = 'dimension1';
    var DIMENSION_PARENT_HOSTNAME = 'dimension2';
    var DIMENSION_PARENT_INITIAL_WIDTH = 'dimension3';

    var setupGoogle = function() {
        (function(i,s,o,g,r,a,m) {
            i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', GOOGLE_ANALYTICS_ACCOUNT_ID, 'auto');

        // By default Google tracks the query string, but we want to ignore it.
        var location = window.location.protocol +
            '//' + window.location.hostname +
            window.location.pathname;

        ga('set', 'location', location);
        ga('set', 'page', window.location.pathname);

        // Custom dimensions & metrics
        var parentUrl = getParameterByName('parentUrl') || '';
        var parentHostname = '';

        if (parentUrl) {
            parentHostname = urlToLocation(parentUrl).hostname;
        }

        var initialWidth = getParameterByName('initialWidth') || '';

        var customData = {};
        customData[DIMENSION_PARENT_URL] = parentUrl;
        customData[DIMENSION_PARENT_HOSTNAME] = parentHostname;
        customData[DIMENSION_PARENT_INITIAL_WIDTH] = initialWidth;

        // Track pageview
        ga('send', 'pageview', customData);
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

        // Track details about the parent with each event
        var parentUrl = getParameterByName('parentUrl') || '';
        var parentHostname = '';
        if (parentUrl) {
            parentHostname = urlToLocation(parentUrl).hostname;
        }
        eventData[DIMENSION_PARENT_URL] = parentUrl;
        eventData[DIMENSION_PARENT_HOSTNAME] = parentHostname;

        ga('send', eventData);
    }

    setupGoogle();

    return {
        'trackEvent': trackEvent
    };
}());
