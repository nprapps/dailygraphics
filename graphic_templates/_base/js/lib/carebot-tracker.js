/*! carebot-tracker - v0.1.1 - 2016-02-16 */
/*
* carebot-tracker.js is library that checks if an element is visible on the page
* and reports it to pym.js.
* Check out the readme at README.md for usage.
*/

/*globals define, attachEvent, addEventListener: true */
/* global module, console */

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        window.CarebotTracker = factory.call(this);
    }
})(function() {
    var lib = {};

    /**
     * Timer
     * @param {Function} callback Called every time a new time bucket is reached
     *
     * Interface:
     *
     */
    lib.Timer = function(callback) {
        // From https://github.com/nprapps/elections16/blob/master/www/js/app.js#L298-L335
        var startTime;
        var previousTotalSeconds = 0;
        var previousBucket;
        var alerter;

        function getTimeBucket(seconds) {
            var minutes, timeBucket;
            if (seconds < 60) {
                var tensOfSeconds = Math.floor(seconds / 10) * 10;
                timeBucket = tensOfSeconds.toString() + 's';
            } else if (seconds >=60 && seconds < 300) {
                minutes = Math.floor(seconds / 60);
                timeBucket = minutes.toString() + 'm';
            } else {
                minutes = Math.floor(seconds / 60);
                var fivesOfMinutes = Math.floor(minutes / 5) * 5;
                timeBucket = fivesOfMinutes.toString() + 'm';
            }

            return timeBucket;
        }

        function getSecondsSince(startTime) {
            if (!startTime) {
                return 0;
            }

            var currentTime = new Date();
            var totalTime = Math.abs(currentTime - startTime);
            var seconds = Math.floor(totalTime/1000);
            return seconds;
        }

        function calculateTimeBucket(startTime) {
            var totalTime = getSecondsSince(startTime) + previousTotalSeconds;
            var timeBucket = getTimeBucket(totalTime);

            return {
                bucket: timeBucket,
                seconds: totalTime
            };
        }

        function check() {
            return calculateTimeBucket(startTime);
        }

        function reportBucket() {
            var results = calculateTimeBucket(startTime);
            if (results.bucket !== previousBucket) {
                callback(results);
                previousBucket = results.bucket;
            }
        }

        function start() {
            startTime = new Date();

            if (callback) {
                alerter = setInterval(reportBucket, 10000);
            }
        }

        function pause() {
            previousTotalSeconds = getSecondsSince(startTime) + previousTotalSeconds;
            clearInterval(alerter);
            startTime = undefined;
        }

        return {
            start: start,
            pause: pause,
            check: check
        };
    }.bind(this);

    /**
     * Tracks how long an element is visible.
     *
     * @class Parent
     * @param {String} id The id of the element the tracker will watch.
     * @param {Function} callback Will be called on every new time bucket.
     * @param {Object} config Configuration to override the default settings.
     */
    lib.VisibilityTracker = function(id, callback, config) {
        var WAIT_TO_ENSURE_SCROLLING_IS_DONE = 50; //

        var el = document.getElementById(id);
        var isVisible = false;
        var timeout;

        var timer = new lib.Timer(callback);

        // Ensure a config object
        config = (config || {});

        function isElementInViewport(el) {
            // Adapted from http://stackoverflow.com/a/15203639/117014
            //
            // Returns true if any part of the element is in the viewport
            var rect     = el.getBoundingClientRect();
            var vWidth   = window.innerWidth || document.documentElement.clientWidth;
            var vHeight  = window.innerHeight || document.documentElement.clientHeight;

            // Core tests: are all sides of the rectangle in the viewport?
            // var leftIsOffScreen = rect.left < 0;
            // var rightIsOffScreen = rect.right > vWidth;
            // var bottomIsOffScreen = rect.bottom > vHeight;
            // var topIsOffScreen = rect.top < 0;

            // console.log("Element and window information", rect.top, rect.right, rect.bottom, rect.left, vWidth, vHeight);

            // These are not necessary, but kept if we want to track partial visibility.
            var leftSideIsToRightOfWindow = rect.left > vWidth;
            var rightSideIsToLeftOfWindow = rect.right < 0;
            var topIsBelowVisibleWindow = rect.top > vHeight;
            var botomIsAboveVisibleWindow = rect.bottom < 0;

            if (leftSideIsToRightOfWindow  ||
                rightSideIsToLeftOfWindow  ||
                topIsBelowVisibleWindow    ||
                botomIsAboveVisibleWindow) {
                return false;
            }

            return true;
        }

        function checkIfVisible () {
            var newVisibility = isElementInViewport(el);

            if (isVisible && !newVisibility) {
                timer.pause();
            }

            if (!isVisible && newVisibility) {
                timer.start();
            }

            isVisible = newVisibility;
            return newVisibility;
        }

        function handler() {
            // Only register a new event every 1/10 of a second
            // That way we don't record an absurd number of events
            if (timeout) {
                window.clearTimeout(timeout);
            }
            timeout = window.setTimeout(checkIfVisible, WAIT_TO_ENSURE_SCROLLING_IS_DONE);
        }

        // Listen to different window movement events
        if (window.addEventListener) {
            addEventListener('DOMContentLoaded', handler, false);
            addEventListener('load', handler, false);
            addEventListener('scroll', handler, false);
            addEventListener('resize', handler, false);
        } else if (window.attachEvent)  {
            attachEvent('onDOMContentLoaded', handler); // IE9+ :(
            attachEvent('onload', handler);
            attachEvent('onscroll', handler);
            attachEvent('onresize', handler);
        }

        checkIfVisible();
    };

    return lib;
});
