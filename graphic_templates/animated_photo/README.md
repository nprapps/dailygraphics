Animated Photo
==============

The animated photo template uses the [canvid](https://github.com/gka/canvid) JavaScript library as an alternative to GIFs. With this solution, you composite a "filmstrip" of all the frames in your animation, and canvid plays them back in sequence on a canvas element. [See an example on NPR.org.](http://www.npr.org/2015/11/05/453239276/in-the-amazons-fire-season-you-either-burn-or-you-starve#res454735072)

Benefits of this approach:

* You can use JPGs rather than GIFs, allowing you to have better image quality _and_ smaller file sizes.
* You can sub out different-sized images depending on the browser dimensions.
* You can control playback -- play, pause, reverse, etc.
* It will autoplay on iOS (unlike a video).

Since it's code-based, it's not quite as portable as a GIF. (So our script that creates the filmstrips also [generates a GIF version](https://github.com/nprapps/dailygraphics/blob/master/graphic_templates/animated_photo/process.sh#L12-L15) for social media.) But in the context of a web page that you otherwise control, the benefits are pretty great. (A similar but more code-intensive approach: [Filmstrip animations with CSS/JS](http://blog.apps.npr.org/2014/01/08/animation-with-filmstrips.html).)

This template relies on [ImageMagick](http://www.imagemagick.org/script/montage.php)'s montage function to create the filmstrip image and animated GIF. If you don't have it, install it with:

```
brew install imagemagick
```

To create a new animated photo, run:

```
fab add_animated_photo:$slug
```

Add the frames for your animation to `img/frames/` (in your project folder). (An image sequence from NASA is in there as an example. You can delete those.) All frames must be the same size.

Then, on the command line, navigate to your project folder and run the image processing script to create filmstrips at three different sizes.

```
bash process.sh
```

In `js/graphic.js`, you will need to edit two lines of code.

First, update the number of frames, columns and speed of your animation.

```
videos: {
    // frames = # of stills
    // cols = # of stills in a row in the filmstrip. in this case,
    //        same as frames.
    // fps = frames per second (animation speed). integers only
    photo: { src: sprite, frames: 8, cols: 8, fps: 2 }
```

Second, adjust the image aspect ratio (so it scales correctly in the browser). If you do not know the exact aspect ratio (like 16:9, etc.), enter the height and width (in that order) of one of your frames.

```
// multiply by height, width of original image
height: Math.floor(containerWidth * 1614/1500),
```
