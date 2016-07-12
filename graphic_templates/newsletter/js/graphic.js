// Global vars
var pymChild = null;
var isMobile = false;
var $newsletterForm, $subscribeBtn;

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    pymChild = new pym.Child({});

    initForm();
}

var sendPymHeight = function() {
    if (pymChild) {
        pymChild.sendHeight();
    }
};

var initForm = function() {
    $newsletterForm = $('#newsletter-signup');
    $subscribeBtn = $('.btn-subscribe');

    $newsletterForm.on('submit', onNewsletterSubmit);

    // Update iframe
    sendPymHeight();
};

var onNewsletterSubmit = function(e) {
    e.preventDefault();

    var $el = $(this);
    var email = $el.find('#newsletter-email').val();
    var newsletter_endpoint;

    var clearStatusMessage = function() {
        var statusMsgExists = $el.find('.message').length;
        if (statusMsgExists > 0) {
            $el.find('.message').remove();
        }
    }

    if (!email) {
        return;
    }

    if (isProduction()) {
        newsletter_endpoint = COPY.newsletter.prod_post_url;
    }
    else {
        newsletter_endpoint = COPY.newsletter.test_post_url;
    }

    // wait state
    clearStatusMessage();
    var waitMsg = '<div class="message wait">'
    waitMsg += '<p><i class="icon icon-spinner animate-spin"></i>&nbsp;' + COPY.newsletter.waiting_text + '</p>';
    waitMsg += '</div>'
    $el.append(waitMsg);
    $subscribeBtn.hide();
    // Update iframe
    sendPymHeight();

    $.ajax({
        url: newsletter_endpoint,
        timeout: COPY.newsletter.post_timeout,
        method: 'POST',
        data: {
            email: email,
            orgId: 0,
            isAuthenticated: false
        },
        success: function(response) { // success
            var successMsg = '<div class="message success">'
            successMsg += '<h3>' + COPY.newsletter.success_headline + '</h3>';
            successMsg += '<p>' + COPY.newsletter.success_text + ' ' + email + '.</p>';
            successMsg += '</div>'
            clearStatusMessage();
            $el.html(successMsg);
            // Update iframe
            sendPymHeight();
            ANALYTICS.trackEvent('newsletter', 'signup-success');
        },
        error: function(response) { // error
            var errorMsg = '<div class="message error">';
            errorMsg += '<h3>' + COPY.newsletter.error_headline + '</h3>';
            errorMsg += '<p>' + COPY.newsletter.error_text + '</p>';
            errorMsg += '</div>'
            clearStatusMessage();
            $el.append(errorMsg);
            $subscribeBtn.show();
            // Update iframe
            sendPymHeight();
            ANALYTICS.trackEvent('newsletter', 'signup-error');
        }
    });
};

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
