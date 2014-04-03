var $btn_back;
var $btn_next;
var $counter;
var $explainer;
var $explainer_items;
var $letter;
var $graphic;

var current_item;
var total_items;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

/*
 * TODO: draw your graphic
 */
function render(width) {
    $graphic.width(width + 'px');
    sendHeightToParent();
}

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    $btn_back = $('#btn-back');
    $btn_next = $('#btn-next');
    $counter = $('#nav-counter');
    $explainer = $('#explainer');
    $explainer_items = $explainer.find('ul');
    $letter = $('#letter');
    $graphic = $('#graphic');
    
    current_item = 0;
    total_items = $explainer_items.find('li').length;
    
    goto_item(current_item);
    
    $btn_back.on('click', goto_prev_item);
    $btn_next.on('click', goto_next_item);

    setupResponsiveChild({
        renderCallback: render
    });
});

function goto_next_item() {
    var id = current_item + 1;
    if (id < total_items) {
        goto_item(id);
    }
}

function goto_prev_item() {
    var id = current_item - 1;
    if (id >= 0) {
        goto_item(id);
    }
}

function goto_item(id) {
    var $this_item = $explainer_items.find('li:eq(' + id + ')');
    var this_class = $this_item[0].className;

    $this_item.show().siblings('li').hide();
    $letter.find('.active').removeClass('active');
    $letter.find('.' + this_class).addClass('active flash').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
        $(this).removeClass('flash');
    });

    current_item = id;

    if (current_item == 0) {
        $btn_back.prop('disabled', true).addClass('inactive');
    } else {
        $btn_back.prop('disabled', false).removeClass('inactive');
    }

    if (current_item == (total_items - 1)) {
        $btn_next.prop('disabled', true).addClass('inactive');
    } else {
        $btn_next.prop('disabled', false).removeClass('inactive');
    }
    
    $counter.text((current_item + 1) + ' of ' + total_items);

    sendHeightToParent();
}