// Global vars
var pymChild = null;
var isMobile = false;

var $quiz = null;
var $results = null;

var numQuestions = 0;
var numTaken = 0;
var numCorrect = 0;
var numRemaining = 0;


/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    // set vars
    $quiz = $('#quiz');
    $results = $('#results');
    numQuestions = $quiz.find('div.question').length;

    $quiz.find('li strong').on('click', onAnswerClicked);

    // pym!
    pymChild = new pym.Child({ });

    pymChild.onMessage('on-screen', function(bucket) {
        ANALYTICS.trackEvent('on-screen', bucket);
    });
    pymChild.onMessage('scroll-depth', function(data) {
        data = JSON.parse(data);
        ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
    });
}

/*
 * Quiz
 */
var onAnswerClicked = function() {
    console.log($(this));
    var $thisAnswer = $(this);
    var $thisQuestion = $thisAnswer.parents('.question');
    var $allAnswers = $thisQuestion.find('strong');
    var resultsMsg = '';

    // register that this question has been answered
    $thisQuestion.addClass('answered');
    numTaken++;
    numRemaining = numQuestions - numTaken;
    $allAnswers.unbind('click');

    // Send guess to analytics
    // Log the number of the question
    var questionMetric = 'guess-question-' + ($thisQuestion.index() + 1);
    // Log whether guess was human or machine
    var answerValue = $thisAnswer.text();
    ANALYTICS.trackEvent(questionMetric, answerValue);

    // check if the user selected the correct answer
    var gotItRight = $thisAnswer.parent('li').hasClass('correct');

    // tell the user if they got it right
    if (gotItRight) {
        $thisAnswer.prepend('<b>' + LBL_RIGHT + '</b> ');
        numCorrect++;
    } else {
        $thisAnswer.parent('li').addClass("selected");
        $thisAnswer.prepend('<b>' + LBL_WRONG + '</b> ');
    }

    // if all questions have been answered, show a rewarding message
    if (numTaken == numQuestions) {
        resultsMsg = '<strong class="totals">You got ' + numCorrect + ' (of ' + numQuestions + ') right.</strong> ';

        if (numCorrect <= 2) {
            resultsMsg += '<em>' + FINAL_LOW + '</em>';
        } else if (numCorrect <= 6) {
            resultsMsg += '<em>' + FINAL_MID + '</em>';
        } else if (numCorrect > 6) {
            resultsMsg += '<em>' + FINAL_HIGH + '</em>';
        }
    // otherwise, show their status
    } else {
        resultsMsg = 'You\'ve answered ' + numTaken + ' of ' + numQuestions + ' questions. Keep going!';
    }
    $results.html(resultsMsg);

    // update the iframe height
    if (pymChild) {
        pymChild.sendHeight();
    }
}


/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;