Copyright 2013 NPR.  All rights reserved.  No part of these materials may be reproduced, modified, stored in a retrieval system, or retransmitted, in any form or by any means, electronic, mechanical or otherwise, without prior written permission from NPR.

(Want to use this code? Send an email to nprapps@npr.org!)

Daily Graphics
========================

* [What is this?](#what-is-this)
* [Assumptions](#assumptions)
* [What's in here?](#whats-in-here)
* [Bootstrap the project](#bootstrap-the-project)
* [Hide project secrets](#hide-project-secrets)
* [Save media assets](#save-media-assets)
* [Run the project](#run-the-project)
* [Adding a new graphic to the project](#adding-a-new-graphic-to-the-project)
* [Run Python tests](#run-python-tests)
* [Run Javascript tests](#run-javascript-tests)
* [Deploy to S3](#deploy-to-s3)
* [Embedding on NPR](#embedding-on-npr)

What is this?
-------------

Daily Graphics is a rig for creating simple Daily Graphics for publishing on NPR.org with [responsive iframe embeds](https://github.com/nprapps/responsiveiframe).

Assumptions
-----------

The following things are assumed to be true in this documentation.

* You are running OSX.
* You are using Python 2.7. (Probably the version that came OSX.)
* You have [virtualenv](https://pypi.python.org/pypi/virtualenv) and [virtualenvwrapper](https://pypi.python.org/pypi/virtualenvwrapper) installed and working.
* You have NPR's AWS credentials stored as environment variables locally.

For more details on the technology stack used with the app-template, see our [development environment blog post](http://blog.apps.npr.org/2013/06/06/how-to-setup-a-developers-environment.html).

What's in here?
---------------

The project contains the following folders and important files:

* ``templates`` -- HTML ([Jinja2](http://jinja.pocoo.org/docs/)) templates, to be compiled locally.
* ``www`` -- Static and compiled assets to be deployed. (a.k.a. "the output")
* ``www/graphics`` -- Individual graphics projects.
* ``app.py`` -- A [Flask](http://flask.pocoo.org/) app for rendering the project locally.
* ``app_config.py`` -- Global project configuration for scripts, deployment, etc.
* ``fabfile.py`` -- [Fabric](http://docs.fabfile.org/en/latest/) commands automating setup and deployment.
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

Hide project secrets
--------------------

Project secrets should **never** be stored in ``app_config.py`` or anywhere else in the repository. They will be leaked to the client if you do. Instead, always store passwords, keys, etc. in environment variables and document that they are needed here in the README.

Save media assets
-----------------

Large media assets (images, videos, audio) are synced with an Amazon S3 bucket called ```assets.apps.npr.org``` in a folder with the name of the project. This allows everyone who works on the project to access these assets without storing them in the repo, giving us faster clone times and the ability to open source our work.

Syncing these assets requires running a few different commands at the right times:

* When you create new assets or make changes to current assets that need to get uploaded to the server, run ```fab assets_up```. **NOTE**: The newest push will *always* overwrite the current copy on the server.
* When you need new assets or newly changed assets in your local environment that are on the server already, run ```fab assets_down``` (this will happen in ```fab bootstrap``` automatically).
* When you want to remove a file from the server and your local environment (i.e. it is not needed in the project any longer), run ```fab assets_rm:"file_name_here.jpg"```

Run the project
---------------

A flask app is used to run the project locally. It will automatically recompile templates and assets on demand.

```
workon dailygraphics
python app.py
```

Visit [localhost:8000](http://localhost:8000) for a list of graphics in the repo. Click on the graphic you are working on to view it.

Alternatively, visit ```http://localhost:8000/graphics/NAME_OF_GRAPHIC``` in your browser to view the specific graphic you are working on.

Adding a new graphic to the project
-------------------------

All of the daily graphics to be put on NPR.org will live in this repo. To add a new graphic, run ```fab add_graphic:name-of-graphic```.

This will create the folder ```www/graphics/name-of-graphic```. Within that folder will be a ```child.html``` file along with boilerplate Javascript files.

Create the graphic in that file, and add any of the CSS/JS that you need within that folder.

**Note**: `name-of-graphic` should be URL-safe, e.g., lowercase and with dashes instead of spaces and no special characters.

Here are some examples:

* Good: my-project-name
* Bad: My-Project-NAME

* Good: my-project-name
* Bad: my project name

* Good: my-wonderful-project
* Bad: my wonderful project!

Deploy to S3
------------

When it's time to publish your graphic, it's better to deploy a single graphic rather than the entire repo, to minimize the risk of publishing edits that aren't yet ready to go live.

To deploy a specific graphic:

```
fab staging master deploy:slug=NAME_OF_GRAPHIC
```
```
fab production master deploy:slug=NAME_OF_GRAPHIC
```

To deploy all graphics:

```
fab staging master deploy
```
```
fab production master deploy
```

Embedding on NPR
----------------

Deploy the project to production. Visit ```http://apps.npr.org/graphics/NAME_OF_GRAPHIC```, and on that page should be an ```iframe``` with your graphic inside of it, and an embed code below the graphic. Use the embed code in Seamus to make the graphic work on an NPR story page.
