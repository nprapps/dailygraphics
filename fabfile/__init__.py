#!/usr/bin/env python

from glob import glob
import imp
import os

from fabric.api import local, require, task
from fabric.state import env

import app as flat_app
import app_config
from etc.gdocs import GoogleDoc

# Other fabfiles
import assets
import flat
import utils

"""
Base configuration
"""
env.settings = None

"""
Environments

Changing environment requires a full-stack test.
An environment points to both a server and an S3
bucket.
"""
@task
def production():
    """
    Run as though on production.
    """
    env.settings = 'production'
    app_config.configure_targets(env.settings)

@task
def staging():
    """
    Run as though on staging.
    """
    env.settings = 'staging'
    app_config.configure_targets(env.settings)

"""
Template-specific functions

Changing the template functions should produce output
with fab render without any exceptions. Any file used
by the site templates should be rendered by fab render.
"""
@task
def render(slug=''):
    """
    Render HTML templates and compile assets.
    """
    if slug:
        _render_graphics(['%s/%s' % (app_config.GRAPHICS_PATH, slug)])
    else:
        _render_graphics(glob('%s/*' % app_config.GRAPHICS_PATH))

def _render_graphics(paths):
    """
    Render a set of graphics
    """
    # Fake out deployment target
    app_config.configure_targets(env.get('settings', None))

    for path in paths:
        slug = path.split('%s/' % app_config.GRAPHICS_PATH)[1].split('/')[0]

        with flat_app.app.test_request_context(path='graphics/%s/' % slug):
            view = flat_app.__dict__['_graphics_detail']
            content = view(slug).data

        with open('%s/index.html' % path, 'w') as writefile:
            writefile.write(content)

        # Fallback for legacy projects w/o child templates
        if not os.path.exists('%s/child_template.html' % path):
            continue

        download_copy(slug)

        with flat_app.app.test_request_context(path='graphics/%s/child.html' % slug):
            view = flat_app.__dict__['_graphics_child']
            content = view(slug).data

        with open('%s/child.html' % path, 'w') as writefile:
            writefile.write(content)

    # Un-fake-out deployment target
    app_config.configure_targets(app_config.DEPLOYMENT_TARGET)


"""
Running the app
"""
@task
def app(port='8000'):
    """
    Serve app.py.
    """
    local('gunicorn -b 0.0.0.0:%s --debug --reload app:wsgi_app' % port)

"""
Deployment

Changes to deployment requires a full-stack test. Deployment
has two primary functions: Pushing flat files to S3 and deploying
code to a remote server if required.
"""
@task
def deploy(slug):
    """
    Deploy the latest app to S3 and, if configured, to our servers.
    """
    require('settings', provided_by=[production, staging])

    update_copy(slug)
    assets.sync(slug)
    render(slug)

    graphic_root = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    s3_root = '%s/graphics/%s' % (app_config.PROJECT_SLUG, slug)
    graphic_assets = '%s/assets' % graphic_root
    s3_assets = '%s/assets' % s3_root

    flat.deploy_folder(
        graphic_root,
        s3_root,
        max_age=app_config.DEFAULT_MAX_AGE,
        ignore=['%s/*' % graphic_assets]
    )

    flat.deploy_folder(
        graphic_assets,
        s3_assets,
        max_age=app_config.ASSETS_MAX_AGE
    )

def download_copy(slug):
    """
    Downloads a Google Doc as an .xlsx file.
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)

    try:
        graphic_config = imp.load_source('graphic_config', '%s/graphic_config.py' % graphic_path)
    except IOError:
        print '%s/graphic_config.py does not exist.' % slug
        return

    if not hasattr(graphic_config, 'COPY_GOOGLE_DOC_KEY') or not graphic_config.COPY_GOOGLE_DOC_KEY:
        print 'COPY_GOOGLE_DOC_KEY is not defined in %s/graphic_config.py.' % slug
        return
        
    doc = {}
    doc['key'] = graphic_config.COPY_GOOGLE_DOC_KEY
    doc['file_name'] = slug

    g = GoogleDoc(**doc)
    g.get_auth()
    g.get_document()

@task
def update_copy(slug=None):
    """
    Fetches the latest Google Doc and updates local JSON.
    """
    if slug:
        download_copy(slug)
        return

    slugs = os.listdir(app_config.GRAPHICS_PATH)

    for slug in slugs:
        graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)

        if not os.path.exists('%s/graphic_config.py' % graphic_path):
            continue

        print slug
        download_copy(slug)

"""
App-specific commands
"""
@task
def add_graphic(slug):
    """
    Create a basic project.
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    local('cp -r graphic_templates/graphic %s' % graphic_path)
    download_copy(slug)

@task
def add_bar_chart(slug):
    """
    Create a bar chart.
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    local('cp -r graphic_templates/bar_chart %s' % graphic_path)
    download_copy(slug)

@task
def add_column_chart(slug):
    """
    Create a column chart.
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    local('cp -r graphic_templates/column_chart %s' % graphic_path)
    download_copy(slug)

@task
def add_stacked_column_chart(slug):
    """
    Create a stacked column chart.
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    local('cp -r graphic_templates/stacked_column_chart %s' % graphic_path)
    download_copy(slug)

@task
def add_grouped_bar_chart(slug):
    """
    Create a grouped bar chart.
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    local('cp -r graphic_templates/grouped_bar_chart %s' % graphic_path)
    download_copy(slug)

@task
def add_line_chart(slug):
    """
    Create a line chart.
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    local('cp -r graphic_templates/line_chart %s' % graphic_path)
    download_copy(slug)

@task
def add_table(slug):
    """
    Create a data table.
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    local('cp -r graphic_templates/table %s' % graphic_path)
    download_copy(slug)

