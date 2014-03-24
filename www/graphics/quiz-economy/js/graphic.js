$(document).ready(function() {
    var $quiz = $('#quiz');
    var $results = $('#results');
    var $scoreboard = $('#scoreboard');
    var $tiebreaker = $quiz.find('.question.tiebreaker');

    var current_question = 0; // 0-indexed
    var num_taken = 0;
    var num_questions = $quiz.find('div.question').length - 1;
    var total_mattress = 0;
    var total_stocks = 0;
    
    $tiebreaker.hide();
    $results.hide();
    
    $quiz.find('.question:eq(' + current_question + ')').show();

    $quiz.find('li strong').click(function(){
        var $q = $(this).parents('.question');
        var $a = $(this).parent('li');
        var $b = $q.find('strong');
        var category;
        
        if ($a.hasClass('stocks')) {
            total_stocks++;
        } else if ($a.hasClass('mattress')) {
            total_mattress++;
        }
 
        $q.addClass('answered');
        $a.addClass('correct').siblings('li').addClass('incorrect');
        num_taken++

        $b.each(function(v,k) {
            $(this).unbind('click');
        });
 
        console.log(total_mattress, total_stocks);
        if (num_taken == num_questions) {
            if (total_mattress == total_stocks) {
                $q.hide();
                $q.next('.question').fadeIn();
                num_questions++;
            } else if (total_mattress != total_stocks) {
                var winning_category;
                if (total_mattress > total_stocks) {
                    winning_category = 'mattress';
                } else {
                    winning_category = 'stocks';
                }
            
                $q.hide();
                $results.fadeIn();
                $('#results').find('.' + winning_category).show();
                $scoreboard.find('.' + winning_category).addClass('winner');
            }
        } else {
            // show the next question
            $q.hide();
            $q.next('.question').fadeIn();
        }
        
        // update the scoreboard
        $scoreboard.find('.mattress').find('i').text(total_mattress);
        $scoreboard.find('.stocks').find('i').text(total_stocks);
        
        sendHeightToParent();
    });
});

$(window).load(function() {
    setupResponsiveChild();
});