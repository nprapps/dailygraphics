ai2html Graphic
===============

The ai2html template uses an open-source script called [ai2html](http://ai2html.org/) to convert Illustrator graphics to HTML and CSS and display them in our responsive dailygraphics template.

To use this template, you'll need to install ai2html as an Illustrator
script. Copy [the latest version of the script here](etc/ai2html.jsx)
into the Illustrator folder where scripts are located.
For example, on Mac OS X running Adobe Illustrator CC 2015, the path would be:
`/Applications/Adobe Illustrator CC 2015/Presets.localized/en_US/Scripts/ai2html.jsx`

**You only need to install the script once on your machine.** To check whether you
have it installed, open Adobe Illustrator and look for the "ai2html"
command in File >> Scripts.

To create a new ai2html graphic, run:

```
fab add_ai2html_graphic:$slug
```

The basic project includes an Illustrator file in `assets`, which you'll
use to create your graphic. The three artboards in the file are the
three breakpoints for your graphic, allowing you to create custom
versions for mobile, tablet and desktop-sized screens. (If you want to
change the width of these artboards, you'll need to adjust the media
queries in `css/graphic.less`.)

You can only use fonts that are supported on our website, so make sure
you are using the correct typeface and weight. [Here's a list of
supported fonts](https://github.com/nprapps/dailygraphics/blob/ai2html/etc/ai2html.jsx#L593-L605).
(For users outside of NPR, refer to the [ai2html docs](http://ai2html.org/#using-fonts-other-than-arial-and-georgia) to learn how to customize your fonts.)

Create your graphic within Illustrator, referring to the [ai2html
documentation](http://ai2html.org/#how-to-use-ai2html) for help. When
you're ready to export, run File >> Scripts >> ai2html. The resulting
graphic will appear within the base template when you load your graphic!
