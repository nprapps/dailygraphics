dailygraphics
=============

* [What is this?](#what-is-this)
* [Assumptions](#assumptions)
* [What's in here?](#whats-in-here)
* [Bootstrap the project](#bootstrap-the-project)
* [Hide project secrets](#hide-project-secrets)
* [Save media assets](#save-media-assets)
* [Run the project](#run-the-project)
* [Adding a new graphic to the project](#adding-a-new-graphic-to-the-project)
* [Connecting to a Google Spreadsheet](#connecting-to-a-google-spreadsheet)
* [Deploy to S3](#deploy-to-s3)
* [Embedding](#embedding)

What is this?
-------------

Daily Graphics is a rig for creating simple graphics for publishing inside a CMS with [responsive iframe embeds](https://github.com/nprapps/responsiveiframe).

Assumptions
-----------

The following things are assumed to be true in this documentation.

* You are running OSX.
* You are using Python 2.7. (Probably the version that came OSX.)
* You have [virtualenv](https://pypi.python.org/pypi/virtualenv) and [virtualenvwrapper](https://pypi.python.org/pypi/virtualenvwrapper) installed and working.
* You have AWS credentials stored as environment variables locally.

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
* ``static.py`` -- Static Flask views used in both ``app.py`` and ``public_app.py``.

Bootstrap the project
---------------------

```
cd dailygraphics
mkvirtualenv --no-site-packages dailygraphics
pip install -r requirements.txt
```

You'll now need to create a folder to hold the graphics created and deployed by this rig. This is configured in `app_config.GRAPHICS_PATH` and defaults to `../graphics`. By keeping the graphics in a separate repository they can be easily version controlled separately.

Hide project secrets
--------------------

Project secrets should **never** be stored in ``app_config.py`` or anywhere else in the repository. They will be leaked to the client if you do. Instead, always store passwords, keys, etc. in environment variables and document that they are needed here in the README.

Save media assets
-----------------

Large media assets (images, videos, audio) are synced with an Amazon S3 bucket called ```assets.apps.npr.org``` in a folder with the name of the project. This allows everyone who works on the project to access these assets without storing them in the repo, giving us faster clone times and the ability to open source our work.

Syncing these assets requires running a couple different commands at the right times. When you create new assets or make changes to current assets that need to get uploaded to the server, run ```fab assets.sync```. This will do a few things:

* If there is an asset on S3 that does not exist on your local filesystem it will be downloaded.
* If there is an asset on that exists on your local filesystem but not on S3, you will be prompted to either upload (type "u") OR delete (type "d") your local copy.
* You can also upload all local files (type "la") or delete all local files (type "da"). Type "c" to cancel if you aren't sure what to do.
* If both you and the server have an asset and they are the same, it will be skipped.
* If both you and the server have an asset and they are different, you will be prompted to take either the remote version (type "r") or the local version (type "l").
* You can also take all remote versions (type "ra") or all local versions (type "la"). Type "c" to cancel if you aren't sure what to do.

Unfortunantely, there is no automatic way to know when a file has been intentionally deleted from the server or your local directory. When you want to simultaneously remove a file from the server and your local environment (i.e. it is not needed in the project any longer), run ```fab assets.assets_rm:"www/assets/file_name_here.jpg"```

Run the project
---------------

A flask app is used to run the project locally. It will automatically recompile templates and assets on demand.

```
workon dailygraphics
python app.py
```

Visit [localhost:8000](http://localhost:8000) for a list of graphics in the repo. Click on the graphic you are working on to view it.

Alternately, visit ```http://localhost:8000/graphics/NAME_OF_GRAPHIC``` in your browser to view the specific graphic you are working on.

Adding a new graphic to the project
-------------------------

To add a new graphic, run ```fab add_graphic:name-of-graphic```.

This will create the folder ```name-of-graphic``` within your ```app_config.GRAPHICS_PATH``` folder. Within the new folder will be a ```child_template.html``` file along with boilerplate Javascript files. That Jinja template will be rendered with a context containing the contents of ```app_config.py```, ```graphic_config.py``` and the ```COPY``` document for that graphic.

Create your graphic in the template file, and add any of the CSS/JS that you need within that folder.

**Note**: `name-of-graphic` should be URL-safe, e.g., lowercase and with dashes instead of spaces and no special characters.

Here are some examples:

* Good: my-project-name<br>Bad: My-Project-NAME

* Good: my-project-name<br>Bad: my project name

* Good: my-wonderful-project<br>Bad: my wonderful project!

Connecting to a Google Spreadsheet
----------------------------------

New graphics by default point to the main [app-template](https://github.com/nprapps/app-template)'s copy spreadsheet template. If you want to use this spreadsheet template as the basis for your project, make a copy of it first.

To connect this spreadsheet (or any spreadsheet) to your graphic, update the ```graphic_config.py``` file in your graphic's folder with the ID of your spreadsheet:

```
COPY_GOOGLE_DOC_KEY = '0AlXMOHKxzQVRdHZuX1UycXplRlBfLVB0UVNldHJYZmc'
```

Run this command to pull down the latest copy of the spreadsheet:

```
fab update_copy:NAME_OF_GRAPHIC
```

To pull down **all** spreadsheets in the dailygraphics repo, run:

```
fab update_copy
```

The deploy process also will automatically pull down the latest spreadsheet and render the contents to your page.

Note: Your graphic **will not** automatically update every time your spreadsheet updates. It will only update when you deploy (or redeploy) it. For projects that seldom change, this is usually fine. Consider another solution if you need dynamic updates.

Deploy to S3
------------

When it's time to publish your graphic, it's better to deploy a single graphic rather than the entire repo, to minimize the risk of publishing edits that aren't yet ready to go live.

To deploy a specific graphic:

```
fab staging deploy:NAME_OF_GRAPHIC
```
```
fab production deploy:NAME_OF_GRAPHIC
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

Deploy the project to production. Visit ```http://apps.npr.org/graphics/NAME_OF_GRAPHIC```, and on that page should be an ```iframe``` with your graphic inside of it, and an embed code below the graphic. Paste the embed code into an HTML assets in your CMS.
