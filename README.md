dailygraphics
=============

* [What is this?](#what-is-this)
* [Assumptions](#assumptions)
* [What's in here?](#whats-in-here)
* [Bootstrap the project](#bootstrap-the-project)
* [Configuration](#configuration)
* [Run the project](#run-the-project)
* [Add a new graphic](#add-a-new-graphic)
* [Deploy to S3](#deploy-to-s3)
* [Embedding](#embedding)
* [Connecting to a Google Spreadsheet](#connecting-to-a-google-spreadsheet)
* [Storing media assets](#storing-media-assets)

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

* ``data`` -- Place for downloaded COPY spreadsheets and other incidental data.
* ``etc`` -- Miscellanous Python libraries.
* ``fabfile`` -- [Fabric](http://docs.fabfile.org/en/latest/) commands for automating setup and deployment.
* ``new_graphic`` -- This directory is copied for each new graphic.
* ``templates`` -- HTML ([Jinja2](http://jinja.pocoo.org/docs/)) templates, to be compiled locally.
* ``www`` -- Static assets to be deployed.
* ``app.py`` -- A [Flask](http://flask.pocoo.org/) app for rendering the project locally.
* ``app_config.py`` -- Global project configuration for scripts, deployment, etc.
* ``render_utils.py`` -- Code supporting template rendering.
* ``requirements.txt`` -- Python requirements.
* ``static.py`` -- Flask views for serving static files.

Bootstrap the project
---------------------

```
cd dailygraphics
mkvirtualenv --no-site-packages dailygraphics
pip install -r requirements.txt
```

You'll now need to create a folder to hold the graphics created and deployed by this rig. This is configured in `app_config.GRAPHICS_PATH` and defaults to `../graphics`.

**NPR Visuals:** Graphics are stored in a separate, private repository, and `app_config.GRAPHICS_PATH` points to that folder. You will need to separately `git clone` that repository.

**Outside of NPR:** You can choose to keep your work in a separate version-controlled repository, as we do, or you can change the `app_config.GRAPHICS_PATH` to point to a folder inside of `dailygraphics`.

Configuration
-------------

The dailygraphics project configuration defaults are specific to NPR. If you want to use it in your newsroom you should fork this repository and update ``app_config.py`` with your own configuration. 

At a minimum you will want to change ``REPOSITORY_URL``, ``PRODUCTION_S3_BUCKETS``, ``STAGING_S3_BUCKETS`` and ``ASSETS_S3_BUCKET``. (``ASSETS_S3_BUCKET`` *must* be different from the other buckets.)

See also: [Connecting to a Google Spreadsheet](#connecting-to-a-google-spreadsheet)

Run the project
---------------

A Flask app is used to run the project locally. It will automatically recompile templates on-demand.

```
workon dailygraphics
fab app
```

Visit [localhost:8000](http://localhost:8000) for a list of graphics in the repo. Click on the graphic you are working on to view it. Alternately, visit ```http://localhost:8000/graphics/$SLUG``` in your browser to view the specific graphic you are working on.

#### Terminal shortcut

Do you use [iTerm2](http://iterm2.com)? Here's [a sample AppleScript](https://gist.github.com/alykat/debf281765db3a0c2e88) to automatically launch a three-paned terminal window (one for the dailygraphics machine, one for the local webserver, and another for the separate graphics repo). You can save this locally, customize it to match your own configuration and add an alias for it to your `.bash_profile`.

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

dailygraphics includes starter code for a few different types of graphics (and we're slowly adding more as we go):

| Image | Type | Fab command |
| :---- | :--- | :---------- |
| ![Basic graphic](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/graphic.png) | Very basic new graphic | ```fab add_graphic:$SLUG``` |
| ![Bar chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/bar-chart.png) | Bar chart | ```fab add_bar_chart:$SLUG``` |
| ![Grouped bar chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/grouped-bar-chart.png) | Grouped bar chart | ```fab add_grouped_bar_chart:$SLUG``` |
| ![Column chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/column-chart.png) | Column chart | ```fab add_column_chart:$SLUG``` |
| ![Stacked column chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/stacked-column-chart.png) | Stacked column chart | ```fab add_stacked_column_chart:$SLUG``` |
| ![Line chart](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/line-chart.png) | Line chart | ```fab add_line_chart:$SLUG``` |
| ![Table](https://raw.githubusercontent.com/nprapps/dailygraphics/master/graphic_templates/_thumbs/table.png) | Responsive HTML table | ```fab add_table:$SLUG``` |

Running any of these commands will create the folder ```$SLUG``` within your ```app_config.GRAPHICS_PATH``` folder. Within the new folder will be a ```child_template.html``` file and some boilerplate javascript files. ```child_template.html``` is a Jinja template that will be rendered with a context containing the contents of ```app_config.py```, ```graphic_config.py``` and the ```COPY``` document for that graphic.

Build out your graphic in ```child_template.html```, and put your javascript in ```js/graphic.js```.

**Note**: `$SLUG` should be URL-safe, e.g., lowercase and with dashes instead of spaces and no special characters.

Here are some examples:

* Good: my-project-name<br>Bad: My-Project-NAME
* Good: my-project-name<br>Bad: my project name
* Good: my-wonderful-project<br>Bad: my wonderful project!

Deploy to S3
------------

When it's time to publish your graphic, it's better to deploy a single graphic rather than the entire repo, to minimize the risk of publishing edits that aren't yet ready to go live.

To deploy a specific graphic:

```
fab staging deploy:$SLUG
```
```
fab production deploy:$SLUG
```

To deploy all graphics, leave off the graphic slug (**but don't do this unless you're absolutely sure** &mdash; you may deploy something that's not ready to be deployed yet):

```
fab production deploy
```
```
fab staging deploy
```

Embedding
---------

Deploy the project to production. Visit ```http://apps.npr.org/dailygraphics/graphics/$SLUG```, and on that page should be an ```iframe``` with your graphic inside of it, and an embed code below the graphic. Paste the embed code into your page. (Some CMSes treat code snippets like this as a separate "HTML asset.")


Connecting to a Google Spreadsheet
----------------------------------

This section describes usage of NPR's copytext rig for syncing text from a Google Spreadsheet.

In order to use the Google Spreadsheet syncing you will need to have environment variables set for ``APPS_GOOGLE_EMAIL`` and ``APPS_GOOGLE_PASS``. If you use bash you might add these to ``~/.bash_profile``.

```
export APPS_GOOGLE_EMAIL='EMAIL@GMAIL.COM'
export APPS_GOOGLE_PASS='PASSWORD'
```

KNOWN ISSUE: Our copytext rig will not work with Gmail accounts with two-factor authentication enabled. If this is an issue, we suggest either creating a separate Gmail account without two-factor for use with dailygraphics, or not using the copytext feature.

New graphics by default point to the main [app-template](https://github.com/nprapps/app-template)'s copy spreadsheet template. If you want to use this spreadsheet template as the basis for your project, make a copy of it first.

To connect this spreadsheet (or any spreadsheet) to your graphic, update the ```graphic_config.py``` file in your graphic's folder with the ID of your spreadsheet:

```
COPY_GOOGLE_DOC_KEY = '0AlXMOHKxzQVRdHZuX1UycXplRlBfLVB0UVNldHJYZmc'
```

Run this command to pull down the latest copy of the spreadsheet:

```
fab update_copy:$SLUG
```

To pull down **all** spreadsheets in the dailygraphics repository, run:

```
fab update_copy
```

The deploy process will always pull down the latest spreadsheet and render the contents to your page.

If you do **not** want a copytext spreadsheet, you can either set ``COPY_GOOGLE_DOC_KEY`` to ``None`` or delete the ``graphic_config.py`` file entirely.

Note: Your graphic **will not** automatically update every time your spreadsheet updates. It will only update when you deploy (or redeploy) it. For projects that seldom change, this is usually fine. Consider another solution if you need dynamic updates.


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
