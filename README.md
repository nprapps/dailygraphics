dailygraphics
=============

* [What is this?](#what-is-this)
* [Assumptions](#assumptions)
* [What's in here?](#whats-in-here)
* [Bootstrap the project](#bootstrap-the-project)
* [Using a stable version](#using-a-stable-version)
* [Configuration](#configuration)
* [Run the project](#run-the-project)
* [Add a new graphic](#add-a-new-graphic)
* [Deploy to S3](#deploy-to-s3)
* [Embedding](#embedding)
* [Connecting to a Google Spreadsheet](#connecting-to-a-google-spreadsheet)
* [Using Jinja filter functions](#using-jinja-filter-functions)
* [Storing media assets](#storing-media-assets)
* [Creating locator maps](#creating-locator-maps)
* [Creating animated photos](#creating-animated-photos)
* [Creating an ai2html graphic](#creating-an-ai2html-graphic)
* [Adding a new graphic template](#adding-a-new-graphic-template)
* [Keeping the graphics directory clean](#keeping-the-graphics-directory-clean)

What is this?
-------------

dailygraphics is a framework for creating and deploying responsive graphics suitable for publishing inside a CMS with [pym.js](https://github.com/nprapps/pym.js).

#### How This Works

In addition to big, long-term projects, the NPR Visuals team also produces short-turnaround charts and tables for daily stories. Our dailygraphics rig offers a workflow and some automated machinery for creating, deploying and embedding these mini-projects, including:

* Version control (with GitHub)
* One command to deploy to Amazon S3
* A mini-CMS for each project (with Google Spreadsheets)
* Management of binary assets (like photos or audio files) outside of GitHub

**Full Blog Post:** [Creating And Deploying Small-Scale Projects](http://blog.apps.npr.org/2014/05/27/dailygraphics.html)

#### Related Blog Posts
* [Responsive Charts With D3 And Pym.js](http://blog.apps.npr.org/2014/05/19/responsive-charts.html)
* [Making Data Tables Responsive](http://blog.apps.npr.org/2014/05/09/responsive-data-tables.html)
* [Managing Instagram Photo Call-Outs](http://blog.apps.npr.org/2014/05/29/photo-callouts.html)
* [Baking Chart Data Into Your Page](http://blog.apps.npr.org/2015/01/28/dailygraphics-json.html)
* [Let’s Tesselate: Hexagons For Tile Grid Maps](http://blog.apps.npr.org/2015/05/11/hex-tile-maps.html)
* [Simplifying Map Production](http://blog.apps.npr.org/2015/05/18/locator-maps.html)

#### Things We've Built Using Dailygraphics
* [Responsive charts](http://www.npr.org/blogs/codeswitch/2014/05/14/298726161/new-orleans-police-hope-to-win-the-city-back-one-kid-at-a-time)
* [Data table](http://www.npr.org/2014/05/19/312455680/state-by-state-court-fees)
* [Before/after slider](http://www.npr.org/blogs/parallels/2014/01/30/268924183/report-syrian-government-has-demolished-entire-neighborhoods#con268946930)
* [Small audio interactive](http://www.npr.org/blogs/health/2014/05/05/308349318/you-had-me-at-hello-the-science-behind-first-impressions#con309025607)

This codebase is licensed under the MIT open source license. See the [LICENSE](https://github.com/nprapps/dailygraphics/blob/master/LICENSE) file for the complete license.

Please note: logos, fonts and other media referenced via url from this template are not covered by this license. Do not republish NPR media assets without written permission. Open source libraries in this repository are redistributed for convenience and are each governed by their own license.

Also note: Though open source, this project is not intended to be a generic solution. We strongly encourage those who love dailygraphics to use it as a basis for their own project template. We have no plans to remove NPR-specific code from this project.

Assumptions
-----------

The following things are assumed to be true in this documentation.

* You are running OSX.
* You are using Python 2.7. (Probably the version that came OSX.)
* You have [virtualenv](https://pypi.python.org/pypi/virtualenv) and [virtualenvwrapper](https://pypi.python.org/pypi/virtualenvwrapper) installed and working.
* You have your Amazon Web Services credentials stored as environment variables locally.

For more details on the technology stack used with this project, see our [development environment blog post](http://blog.apps.npr.org/2013/06/06/how-to-setup-a-developers-environment.html).

What's in here?
---------------

The project contains the following folders and important files:

* ``etc`` -- Miscellanous Python libraries.
* ``fabfile`` -- [Fabric](http://docs.fabfile.org/en/latest/) commands for automating setup and deployment.
* ``graphic_templates`` -- Folder templates for different graphic types.
* ``templates`` -- HTML ([Jinja2](http://jinja.pocoo.org/docs/)) templates, to be compiled locally.
* ``app.py`` -- A [Flask](http://flask.pocoo.org/) app for rendering the project locally.
* ``app_config.py`` -- Global project configuration for scripts, deployment, etc.
* ``graphic.py`` -- Flask views for rendering graphics.
* ``graphic_templates.py`` -- Flask views for rendering graphics templates.
* ``oauth.py`` -- Flask views for configuring OAuth (for Google Spreadsheets).
* ``package.json`` -- Node requirements.
* ``render_utils.py`` -- Code supporting template rendering.
* ``requirements.txt`` -- Python requirements.

Bootstrap the project
---------------------

Node.js is required for the static asset pipeline. If you don't already have it, get it like this (requires [brew](http://brew.sh/)):

```
brew install node
```

Then setup the project like this:

```
git clone https://github.com/nprapps/dailygraphics.git
cd dailygraphics
mkvirtualenv --no-site-packages dailygraphics
pip install -r requirements.txt
npm install
```

You'll now need to create a folder to hold the graphics created and deployed by this rig. This is configured in `app_config.GRAPHICS_PATH` and defaults to `../graphics`.

**NPR users:** Graphics are stored in a separate, private repository, and `app_config.GRAPHICS_PATH` points to that folder. You will need to separately `git clone` that repository.

**All other users:** You can choose to keep your work in a separate version-controlled repository, as we do, or you can change the `app_config.GRAPHICS_PATH` to point to a folder inside of `dailygraphics`.

Using a stable version
----------------------

The master branch of project is in active development by NPR at all times. If you would like to use a [more] stable version, we suggest checking out a tagged version (``0.1``, etc.). We will periodically tag releases, which will be synchronized to the ``CHANGELOG`` so you will know exactly what improvements you will get if you migrate to a new tagged version.

To see available tagged versions, run:

```
git tag -l
```

To use a tagged version run, for example:

```
git checkout 0.1.0
```

To upgrade to a newer tagged version just check it out:

```
git checkout 0.2.0
```

When upgrading from one tagged version to another, please be sure to update your Python requirements:

```
pip install -Ur requirements.txt
```

Configuration
-------------

The dailygraphics project configuration defaults are specific to NPR. If you want to use it in your newsroom you should fork this repository and update ``app_config.py`` with your own configuration.

At a minimum you will want to change ``REPOSITORY_URL``, ``PRODUCTION_S3_BUCKETS``, ``STAGING_S3_BUCKETS`` and ``ASSETS_S3_BUCKET``. (``ASSETS_S3_BUCKET`` *must* be different from the other buckets.)

**Google OAuth**

The default configuration assumes that you want to use NPR's copytext rig to [pull content from a Google Spreadsheet](#connecting-to-a-google-spreadsheet). If you do not want to use Google Spreadsheets at all, delete all instances of ```graphic_config.py``` from the template folders inside ```graphic_templates```. You can skip the OAuth steps below.

As of April 2015, we've changed our approach to authenticating with Google to sync Google Spreadsheet data. Now, dailygraphics relies on OAuth authentication. This approach is more secure (username and password are no longer stored in environment variables) and works for accounts with two-factor authentication enabled.

Following the steps in [this blog post](http://blog.apps.npr.org/2015/03/02/app-template-oauth.html), you will need to:
- Set up a Google API application for your organization
- Save the client environment variables in your ```.bash_profile```
- Authenticate with Google.

You should only need to do this once.

**NPR users:** The environment variables you need have already been generated, so you can skip the first step. Contact Alyson, David or Chris for more information.


Run the project
---------------

A Flask app is used to run the project locally. It will automatically recompile templates on-demand.

```
workon dailygraphics
fab app
```

Visit [localhost:8000](http://localhost:8000) for a list of graphics in the repo. Click on the graphic you are working on to view it. Alternately, visit ```http://localhost:8000/graphics/$SLUG``` in your browser to view the specific graphic you are working on.

#### Terminal shortcut

Do you use [iTerm2](http://iterm2.com)? Here's [a sample AppleScript](https://gist.github.com/alykat/debf281765db3a0c2e88) to automatically launch a three-paned terminal window (one for the dailygraphics machine, one for the local webserver, and another for the separate graphics repo).

*June 3rd, 2016*: If you are using iTerm v3 then use this updated [AppleScript](https://gist.github.com/jjelosua/53b416bd6655605846264eb9378e9c0e). iTerm has made a [non-backwards compatible](https://iterm2.com/version3.html?src=4) change to their Applescript syntax


You can save this locally, customize it to match your own configuration and add an alias for it to your `.bash_profile`.

```
alias dailygraphics="osascript ~/PATH-TO-FILE/iterm_dailygraphics.scpt"
```

#### Troubleshooting

Do you get an error that looks like this when you run the webserver?

```
Fatal error: local() encountered an error (return code 1) while executing 'gunicorn -b 0.0.0.0:8000 --debug --reload app:wsgi_app'

Aborting.
```

It's possible that the webserver is already running silently in the background. [Here's how to fix it.](https://github.com/nprapps/dailygraphics/issues/74)


Add a new graphic
-----------------

dailygraphics includes starter code for a few different types of graphics (and we're slowly adding more as we go). Running any of these commands will create the folder ```$SLUG``` within your ```app_config.GRAPHICS_PATH``` folder. Within the new folder will be a ```child_template.html``` file and some boilerplate javascript files. ```child_template.html``` is a Jinja template that will be rendered with a context containing the contents of ```app_config.py```, ```graphic_config.py``` and the ```COPY``` document for that graphic. It also will clone a new Google Spreadsheet for you to use for text and data.

Build out your graphic in ```child_template.html```, and put your javascript in ```js/graphic.js```.

| Image | Type | Fab command |
| :---- | :--- | :---------- |
| ![Basic graphic](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/graphic.png) | Very basic new graphic | ```fab add_graphic:$SLUG``` |
| ![Bar chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/bar-chart.png) | Bar chart | ```fab add_bar_chart:$SLUG``` |
| ![Grouped bar chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/grouped-bar-chart.png) | Grouped bar chart | ```fab add_grouped_bar_chart:$SLUG``` |
| ![Stacked bar chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/stacked-bar-chart.png) | Stacked bar chart | ```fab add_stacked_bar_chart:$SLUG``` |
| ![Column chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/column-chart.png) | Column chart | ```fab add_column_chart:$SLUG``` |
| ![Stacked column chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/stacked-column-chart.png) | Stacked column chart | ```fab add_stacked_column_chart:$SLUG``` |
| ![Block histogram](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/block-histogram.png) | Block histogram | ```fab add_block_histogram:$SLUG``` |
| ![Line chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/line-chart.png) | Line chart | ```fab add_line_chart:$SLUG``` |
| ![Slopegraph](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/slopegraph.png) | Slopegraph | ```fab add_slopegraph:$SLUG``` |
| ![Dot chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/dot-chart.png) | Dot chart | ```fab add_dot_chart:$SLUG``` |
| ![Locator map](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/locator-map.png) | [Locator map](#creating-locator-maps) | ```fab add_map:$SLUG``` |
| ![State grid map](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/state-grid-map.png) | State grid map | ```fab add_state_grid_map:$SLUG``` |
| ![Table](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/table.png) | Responsive HTML table | ```fab add_table:$SLUG``` |
| ![Issue Matrix](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/issue-matrix.png) | A table comparing a list of candidates' positions on various issues | ```fab add_issue_matrix:$SLUG``` |
| ![Animated photo](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/animated-photo.gif) | Animated photo (GIF alternative) | ```fab add_animated_photo:$SLUG``` |

**Note**: `$SLUG` should be URL-safe, e.g., lowercase and with dashes instead of spaces and no special characters.

Here are some examples:

* Good: my-project-name<br>Bad: My-Project-NAME
* Good: my-project-name<br>Bad: my project name
* Good: my-wonderful-project<br>Bad: my wonderful project!

**NPR users:** For added clarity, append the current date or known pubdate to your slug name, YYYYMMDD-style. For example: ```my-project-name-20150415```

When you create a new project, dailygraphics will check against your local projects and the projects published to production to make sure that the ```$SLUG``` you've chosen does not already exist.


Deploy to S3
------------

When it's time to publish your graphic, it's better to deploy a specific graphic rather than the entire repo, to minimize the risk of publishing edits that aren't yet ready to go live.

To deploy a specific graphic:

```
fab staging deploy:$SLUG
```
```
fab production deploy:$SLUG
```

You can deploy multiple graphics with a single command by passing the
slugs as a comma-separated list (no spaces). To deploy multiple graphics at once:

```
fab staging deploy:$SLUG1,$SLUG2
```
```
fab production deploy:$SLUG1,$SLUG2
```


Embedding
---------

Deploy the project to production. Visit ```http://apps.npr.org/dailygraphics/graphics/$SLUG```, and on that page should be an ```iframe``` with your graphic inside of it, and an embed code below the graphic. Paste the embed code into your page. (Some CMSes treat code snippets like this as a separate "HTML asset.")


Connecting to a Google Spreadsheet
----------------------------------

This section describes usage of NPR's copytext rig for syncing text from a Google Spreadsheet.

When you create a new graphic, dailygraphics will by default clone our [dailygraphics copy spreadsheet template](https://docs.google.com/spreadsheets/d/1ciRc--h8HuBpQzMebVygC4x_y9dvKxp6OA45ccRrIX4/edit#gid=0). To use a different spreadsheet (either in your graphics templates or in a particular project), update the ```graphic_config.py``` file in your graphic's folder with the ID of your spreadsheet:

```
COPY_GOOGLE_DOC_KEY = '0AlXMOHKxzQVRdHZuX1UycXplRlBfLVB0UVNldHJYZmc'
```

Run this command to pull down the latest copy of the spreadsheet:

```
fab update_copy:$SLUG
```

Alternately, while you are developing your graphic locally, you can append ```?refresh=1``` to your graphic's localhost URL to refresh the spreadsheet every time you refresh the page. (It can be a little slow, though, so it might be most efficient to do this only when you’re actively working on the spreadsheet.)

To pull down **all** spreadsheets in the dailygraphics repository, run:

```
fab update_copy
```

The deploy process will always pull down the latest spreadsheet and render the contents to your page.

Note: Your published graphic **will not** automatically update every time your spreadsheet updates. It will only update when you deploy (or redeploy) it. For projects that seldom change, this is usually fine. Consider another solution if you need dynamic updates.

If you do **not** want want to use the copytext spreadsheet for a given project, you can either set ``COPY_GOOGLE_DOC_KEY`` to ``None`` or delete the ``graphic_config.py`` file entirely.


Using Jinja filter functions
----------------------------

A [library of Jinja filter functions](https://github.com/nprapps/dailygraphics/blob/master/graphic_templates/_base/base_filters.py) for common tasks (ordinal, AP date format, etc.) is included with each graphic.

If your graphic requires complex number formatting or other nuanced presentation, you may need to write a custom filter function. This is supported through each project's ``graphic_config.py`` file. To add a custom filter function, simply define it and add it to the list called ``JINJA_FILTER_FUNCTIONS``, like so:

```python
def percent(value):
    return unicode(float(value * 100)) + '%'

    JINJA_FILTER_FUNCTIONS = base_filters.FILTERS + [percent]
```

Then you will be able to use it in your template like this:

```html
<td>{{ row.value|percent }}</td>
```

See the ``table`` graphic template for a more complete example.


Storing media assets
--------------------

(Note: this section describes usage of NPR's assets rig. This is optional and you don't need to use it in order to use dailygraphics.)

Large media assets (images, videos, audio) are synced with an Amazon S3 bucket configured in ```app_config.ASSETS_S3_BUCKET``` in a folder with the name of the project. This allows everyone who works on the project to access these assets without storing them in the graphics repository, giving us faster clone times and the ability to open source our work.

When you use one of the supported fab commands to create a new graphic (e.g., ```fab add_graphic:$SLUG```), your graphic folder will include an ```assets``` folder. Files stored here will not go up to GitHub, but will sync with S3.

Syncing these assets requires running a couple different commands at the right times. When you create new assets or make changes to current assets that need to get uploaded to the server, run ```fab assets.sync:$SLUG```. This will do a few things:

* If there is an asset on S3 that does not exist on your local filesystem it will be downloaded.
* If there is an asset on that exists on your local filesystem but not on S3, you will be prompted to either upload (type "u") OR delete (type "d") your local copy.
* You can also upload all local files (type "la") or delete all local files (type "da"). Type "c" to cancel if you aren't sure what to do.
* If both you and the server have an asset and they are the same, it will be skipped.
* If both you and the server have an asset and they are different, you will be prompted to take either the remote version (type "r") or the local version (type "l").
* You can also take all remote versions (type "ra") or all local versions (type "la"). Type "c" to cancel if you aren't sure what to do.

Unfortunately, there is no automatic way to know when a file has been intentionally deleted from the server or your local directory. When you want to simultaneously remove a file from the server and your local environment (i.e. it is not needed in the project any longer), run ```fab assets.rm:"$SLUG/assets/file_name_here.jpg"```

Creating Locator Maps
---------------------

The new locator map template is designed to simplify creating basic locator maps with D3, TopoJSON and [Natural Earth](http://www.naturalearthdata.com) data. It will not create production-ready maps, but it will quickly generate a code-based starting point for a map project.

To generate the necessary TopoJSON file, you will need to install the [mapturner](https://github.com/nprapps/mapturner) library. Mapturner also requires ogr2ogr/GDAL and topojson. **[See the mapturner docs](https://github.com/nprapps/mapturner)** for set-up information.

_(Note: The code in our example is tailored for a map centered on Nepal. You'll want to edit the configuration, JavaScript and LESS accordingly.)_

To get started, create a new graphic using that template:

```
fab add_map:$slug
```

Inside the project folder, edit the configuration file ```geodata.yaml``` to specify the particular layers and data columns you want. Options included:

* ```bbox```: The bounding box for your map. To get coordinates (```x1 y1 x2 y2```, space-delimited) appropriate to your project, go to a site like [Bounding Box](http://boundingbox.klokantech.com), draw a box around the area you want (with a good amount of margin), and copy the coordinates of that box. (If you're using Bounding Box, choose the "CSV" coordinate output and replace the commas with spaces.)
* Default layers: ```countries```, ```cities``` (for the primary/featured country), ```neighbors``` (for neighboring countries), ```lakes``` and ```rivers```. The default layers point to Natural Earth shapefiles. mapturner also supports geoJSON and CSVs with latitude and longitude columns.
* For each shapefile layer, you can specify options to pass to the TopoJSON converter, including:
  * ```id-property```: a column value you want to use as an identifier in the exported TopoJSON file
  * ```properties```: columns you want TopoJSON to preserve in the exported file (by default, it strips out most non-geo data)
  * ```where```: a query to pass in to filter the data returned (for example: ```where: adm0name != 'Nepal' AND scalerank <= 2```)

([See the mapturner docs](https://github.com/nprapps/mapturner) for more details.)

In your terminal, in the ```dailygraphics``` virtualenv, navigate to your project folder. Run mapturner to process your map's geodata:

```
mapturner geodata.yaml data/geodata.json
```

In your project ```js/graphic.js``` folder, change the ```PRIMARY_COUNTRY``` variable at the top from Nepal to the name of your featured country. You will also want to adjust the ```MAP_DEFAULT_SCALE``` and ```MAP_DEFAULT_HEIGHT``` variables so that your featured country fits onscreen.

Creating animated photos
------------------------

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

Creating An ai2html Graphic
---------------------------

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


Adding a new graphic template
-----------------------------

To create and use a new graphic template, you will need to follow several steps:

First, choose a suitable existing template and copy its folder. For example:

```
cd graphic_templates
cp -r line_chart scatterplot
```

Second, open the COPY Google Spreadsheet for the pre-existing graphic template ("line_chart" in the example above). Make a copy of this document and adjust the headline in the copy to match the new chart type. Be sure to make this new spreadsheet public. (Share > Get Shareable Link > Can View). Copy the key for the new spreadsheet from the URL and paste it into the `graphic_config.py` for your new template.

Third, modify the new template to render your new chart type. Remove any dependencies you don't need for this graphic type. You can test your graphic template using the local server, for instance: [http://localhost:8000/templates/scatterplot/?refresh=1](http://localhost:8000/templates/scatterplot/?refresh=1)

Before you can use your new template you'll also need to add a fab command. In ``fabfile/__init__.py`` scroll down to the tasks for creating graphics and add a task for your new template, like this:

```
@task
def add_scatterplot(slug):
    """
    Create a scatterplot.
    """
    _add_graphic(slug, 'scatterplot')
```

Finally, commit your new graphic template and your fabfile changes. Your new graphic template is now ready to use.

Keeping the graphics directory clean
------------------------------------

If you are working with multiple users who are creating/deleting graphics, you may find that you end up with folders for deleted graphics containing only their copytext and other, uncommitted files. If this is bothering you, run:

```
git clean -dn
```

This will list folders with no committed files. To permenantly delete those folders, run:

```
git clean -df
```
