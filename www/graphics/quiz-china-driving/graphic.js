$(document).ready(function() {
    var $quiz = $('#healthinsuranceQuiz');

    $quiz.find('li strong').click(function(){
        var $q = $(this).parents('.question');
        var $b = $q.find('strong');
        var got_it_right = $(this).parent('li').hasClass('correct');
        var answer_text = $(this).next('.answer');
        var right_answer = $q.find('.correct');
        $q.addClass('answered');
        if (got_it_right) {
            $(this).prepend('<b>RIGHT!</b> ');
        } else {
            $(this).prepend('<b>WRONG!</b> ');
        }
        $b.each(function(v,k) {
            $(this).unbind('click');
        });
    });

    setupResponsiveChild();
});