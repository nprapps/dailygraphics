var $btn_vote;
var pymChild = null;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

// "voting"
function on_vote_button_pressed(evt) {
    var p = $(this).parents('div.prompt');
    
    p.addClass('answered');

    if (pymChild) {
        pymChild.sendHeightToParent();
    }
}

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    console.log(audio_files);

    $btn_vote = $('.btn-vote');

	$("#player_1").jPlayer({
		ready: function (event) {
			$(this).jPlayer("setMedia", {
				m4a: audio_files.voice_1_audio_male_mp3,
				oga: audio_files.voice_1_audio_male_ogg
			});
		},
		supplied: "m4a, oga",
		wmode: "window",
		cssSelectorAncestor: "#jp_container_1"
	});

	$("#player_2").jPlayer({
		ready: function (event) {
			$(this).jPlayer("setMedia", {
				m4a: audio_files.voice_2_audio_male_mp3,
				oga: audio_files.voice_2_audio_male_ogg
			});
		},
		supplied: "m4a, oga",
		wmode: "window",
		cssSelectorAncestor: "#jp_container_2"
	});

	$("#player_3").jPlayer({
		ready: function (event) {
			$(this).jPlayer("setMedia", {
				m4a: audio_files.voice_1_audio_female_mp3,
				oga: audio_files.voice_1_audio_female_ogg
			});
		},
		supplied: "m4a, oga",
		wmode: "window",
		cssSelectorAncestor: "#jp_container_3"
	});

	$("#player_4").jPlayer({
		ready: function (event) {
			$(this).jPlayer("setMedia", {
				m4a: audio_files.voice_2_audio_female_mp3,
				oga: audio_files.voice_2_audio_female_ogg
			});
		},
		supplied: "m4a, oga",
		wmode: "window",
		cssSelectorAncestor: "#jp_container_4"
	});



    $btn_vote.on('click', on_vote_button_pressed);




    pymChild = new pym.Child({ });
})