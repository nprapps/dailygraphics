var $players = null;
var $current_player = null;
var $play_buttons = null;
var $player_progress = null;

var pymChild = null;
var num_people = 7;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    $players = $('.jp-jplayer');
    $play_buttons = $('.jp-play');
    $pause_buttons = $('.jp-pause');
    $player_progress = $('.jp-progress-container');

    /*
     * Audio
     */
    // On mobile browers we load everything first, because otherwise we require two clicks to play
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        $players.each(function() {
            $(this).jPlayer({
                ready: function() {
                    $(this).jPlayer('setMedia', {
                        mp3: $(this).data('mp3'),
                        oga: $(this).data('ogg')
                    }).jPlayer('pause');
                    console.log($(this).data('selector'));
                },
                play: function() {
                    $(this).jPlayer('pauseOthers');
                },
                preload: 'none',
                supplied: 'mp3, oga',
                cssSelectorAncestor: $(this).data('selector')
            });
        });
    // On other browsers we load incrementally, because FF and Safari won't allow 7+ jplayers on a page
    } else {
        function init_audio() {
            console.log($current_player);
            $current_player.jPlayer({
                ready: function() {
                    $current_player.jPlayer('setMedia', {
                        mp3: $(this).data('mp3'),
                        oga: $(this).data('ogg')
                    }).jPlayer('play');
                },
                preload: 'none',
                supplied: 'mp3, oga',
                cssSelectorAncestor: $current_player.data('selector')
            });
        }
        
        $play_buttons.on('click', function(e) {
            var parent_id = $(this).parents('.jp-audio').prev('.jp-jplayer').attr('id');
            var $parent_player = $('#' + parent_id);

            console.log($parent_player);

            if ($current_player && $parent_player.attr('id') == $current_player.attr('id')) {
                return true;
            }

            if ($current_player) {
                $current_player.jPlayer('destroy');
            }

            $current_player = $parent_player;
            init_audio();

            return true;
        });
    }


    // responsive iframe
    pymChild = new pym.Child({ });
})
