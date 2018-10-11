// Global vars
var pymChild = null;
var isMobile = Modernizr.touchevents;
var playing = false;
var instructionText = null;

/*
* Initialize the graphic.
*/
var onWindowLoaded = function() {

    pymChild = new pym.Child({});
    
    var imageWrapper = document.querySelector('#graphic-image');
    instructionText = document.querySelector('.overlay .instructions');

    var mode = getParameterByName('mode');

    if (mode == 'hp'){
        document.querySelector('#iframeBody').classList.add('homepage');
    }

    if (isMobile) {
        imageWrapper.addEventListener('click', onTouch);
    } else {
        imageWrapper.addEventListener('click', onTouch);
        // imageWrapper.addEventListener('mouseenter', onMouseEnter);
        imageWrapper.addEventListener('mouseleave', onMouseLeave);
    }

    pymChild.onMessage('on-screen', function(bucket) {
        ANALYTICS.trackEvent('on-screen', bucket);
    });
    pymChild.onMessage('scroll-depth', function(data) {
        data = JSON.parse(data);
        ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
    });
}

var onTouch = function() {
    if (!playing) {
        playAudio();
        instructionText.classList.add('playing');
    } else {
        pauseAudio();
        instructionText.classList.remove('playing');
    }
}

var onMouseEnter = function(){
    if (!playing){
        playAudio();
    }
}

var onMouseLeave = function(){
    if (playing){
        pauseAudio();
    }
}

var playAudio = function(){
    var playPromise = document.querySelector('#audio').play();

    if (playPromise != undefined) {
        playPromise.then(function() {
            playing = true;
        });
    }
    else{
        playing = true;
    }

}

var pauseAudio = function(){
    document.querySelector('#audio').pause();
    playing = false;
}

/*
* Initially load the graphic
* (NB: Use window.load to ensure all images have loaded)
*/
window.onload = onWindowLoaded;
