// Global vars
var pymChild = null;
var isMobile = false;

var $quiz = null;
var $results = null;
var $next = null;

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
    $next = $('.btn');
    numQuestions = QUIZ.length;

    // To collapse quiz for a question-by-question setup, set param of collapseQuiz to true. Else, false. 
    collapseQuiz(true);

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
var collapseQuiz = function(bool) {
    if (bool) {
        nextQuestion(0);
        $quiz.find('li strong').on('click', onAnswerClicked);
        $next.on('click', function() {
            $next.css("background-color", "#eee");
            $next.css("color", "#ababab");
            nextQuestion(numTaken);
            $quiz.find('li strong').on('click', onAnswerClicked);
        })
    } else {
        alert("If you're not collapsing quiz, remember to replace contents of child_template.html with child_template_alternate.html -- and then get rid of me!");
        $('.btn_div').html("");
        $quiz.find('li strong').on('click', onAnswerClicked);
    }
}

var nextQuestion = function(i) {
    $('.question').removeClass('answered');
    var question = QUIZ[i],
        answers = "",
        numQApairs = (Object.keys(question).length - 5) / 2; //num that is possible, could be less

    for (i = 1; i < numQApairs + 1; i++) { 
        if (question['option_' + i.toString()] != 'None') {

            answers += "<li class=" + question['status_' + i.toString()] + ">\
                                <strong>" + question['option_' + i.toString()] + "</strong>";

            if (question['status_' + i.toString()] == 'correct') {
                answers += "<div class='answer'>";

                if (question['answer_image_name'] != 'None') {

                    answers += "<figure><img src='img/" + question['answer_image_name'] + "' class='answer-image-" + question['number'] + "'>\
                                <figcaption>" + question['answer_image_credits'] + "</figcaption></figure>";

                }

                answers += "<div class='explanation'>" + question['answer'] + "</div></div>";
            }
            answers += "</li>";
        }
    }    

    $('.q').html("<p>"+ question['question'] + "</p>");
    $('#quiz ul').html("");
    $('#quiz ul').html(answers);

    // update the iframe height
    if (pymChild) {
        pymChild.sendHeight();
    }
}

var onAnswerClicked = function() {
    $next.css("background-color", "#7598c9");
    $next.css("color", "#fff");

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

        $('.btn_div').html("");

        resultsMsg = '<strong class="totals">You got ' + numCorrect + ' (of ' + numQuestions + ') right.</strong> ';

        if (numCorrect <= FINAL_LOW_UPPER) {
            resultsMsg += '<em>' + FINAL_LOW + '</em>';
        } else if (numCorrect <= FINAL_MID_UPPER) {
            resultsMsg += '<em>' + FINAL_MID + '</em>';
        } else if (numCorrect <= FINAL_HIGH_UPPER) {
            resultsMsg += '<em>' + FINAL_HIGH + '</em>';
        }

        // Send user score to analytics 
        ANALYTICS.trackEvent('quiz-finish', numCorrect ? numCorrect.toString() : '0');
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