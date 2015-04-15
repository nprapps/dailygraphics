#!/usr/bin/env python

import app as flat_app
import app_config
import boto
import assets
import flat
import imp
import json
import os
import subprocess
import utils
import webbrowser

from distutils.spawn import find_executable
from fabric.api import local, prompt, require, settings, task
from fabric.state import env
from glob import glob
from oauth import get_document, get_credentials
from time import sleep


SPREADSHEET_COPY_URL_TEMPLATE = 'https://www.googleapis.com/drive/v2/files/%s/copy'
SPREADSHEET_VIEW_TEMPLATE = 'https://docs.google.com/spreadsheet/ccc?key=%s#gid=1'

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
    local('gunicorn -b 0.0.0.0:%s --timeout 3600 --debug --reload app:wsgi_app' % port)

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

    if not slug:
        print 'You must specify a project slug, like this: "deploy:slug"'
        return

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
        headers={
            'Cache-Control': 'max-age=%i' % app_config.DEFAULT_MAX_AGE
        },
        ignore=['%s/*' % graphic_assets]
    )

    flat.deploy_folder(
        graphic_assets,
        s3_assets,
        headers={
            'Cache-Control': 'max-age=%i' % app_config.ASSETS_MAX_AGE
        }
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

    copy_path = os.path.join(graphic_path, '%s.xlsx' % slug)
    get_document(graphic_config.COPY_GOOGLE_DOC_KEY, copy_path)

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
def _add_graphic(slug, template):
    """
    Create a graphic with `slug` from `template`
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)

    if _check_slug(slug):
        return

    local('cp -r graphic_templates/%s %s' % (template, graphic_path))

    config_path = os.path.join(graphic_path, 'graphic_config.py')

    if os.path.isfile(config_path):
        print 'Creating spreadsheet...'
        copy_spreadsheet(slug)
        download_copy(slug)
    else:
        print 'No graphic_config.py found, not creating spreadsheet'

    print 'Run `fab app` and visit http://127.0.0.1:8000/graphics/%s to view' % slug

def _check_slug(slug):
    """
    Does slug exist in graphics folder or production s3 bucket?
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    if os.path.isdir(graphic_path):
        print 'Error: Directory already exists'
        return True

    s3 = boto.connect_s3()
    bucket = s3.get_bucket(app_config.PRODUCTION_S3_BUCKET['bucket_name'])
    key = bucket.get_key('%s/graphics/%s/child.html' % (app_config.PROJECT_SLUG, slug))
    if key:
        print 'Error: Slug exists on apps.npr.org'
        return True

    return False

@task
def add_graphic(slug):
    """
    Create a basic project.
    """
    _add_graphic(slug, 'graphic')

@task
def add_bar_chart(slug):
    """
    Create a bar chart.
    """
    _add_graphic(slug, 'bar_chart')

@task
def add_column_chart(slug):
    """
    Create a column chart.
    """
    _add_graphic(slug, 'column_chart')

@task
def add_stacked_column_chart(slug):
    """
    Create a stacked column chart.
    """
    _add_graphic(slug, 'stacked_column_chart')

@task
def add_grouped_bar_chart(slug):
    """
    Create a grouped bar chart.
    """
    _add_graphic(slug, 'grouped_bar_chart')

@task
def add_line_chart(slug):
    """
    Create a line chart.
    """
    _add_graphic(slug, 'line_chart')

@task
def add_table(slug):
    """
    Create a data table.
    """
    _add_graphic(slug, 'table')

def _check_credentials():
    """
    Check credentials and spawn server and browser if not
    """
    credentials = get_credentials()
    if not credentials or 'https://www.googleapis.com/auth/drive' not in credentials.config['google']['scope']:
        try:
            with open(os.devnull, 'w') as fnull:
                print 'Credentials were not found or permissions were not correct. Automatically opening a browser to authenticate with Google.'
                gunicorn = find_executable('gunicorn')
                process = subprocess.Popen([gunicorn, '-b', '127.0.0.1:8888', 'app:wsgi_app'], stdout=fnull, stderr=fnull)
                webbrowser.open_new('http://127.0.0.1:8888/oauth')
                print 'Waiting...'
                while not credentials:
                    try:
                        credentials = get_credentials()
                        sleep(1)
                    except ValueError:
                        continue
                print 'Successfully authenticated!'
                process.terminate()
        except KeyboardInterrupt:
            print '\nCtrl-c pressed. Later, skater!'
            exit()

def copy_spreadsheet(slug):
    """
    Copy the COPY spreadsheet
    """
    _check_credentials()

    config_path = '%s/%s/graphic_config.py' % (app_config.GRAPHICS_PATH, slug)
    graphic_config = imp.load_source('graphic_config', config_path)

    kwargs = {
        'credentials': get_credentials(),
        'url': SPREADSHEET_COPY_URL_TEMPLATE % graphic_config.COPY_GOOGLE_DOC_KEY,
        'method': 'POST',
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'title': '%s GRAPHIC COPY' % slug,
        }),
    }

    resp = app_config.authomatic.access(**kwargs)
    if resp.status == 200:
        spreadsheet_key = resp.data['id']
        spreadsheet_url = SPREADSHEET_VIEW_TEMPLATE % spreadsheet_key
        print 'New spreadsheet created successfully!'
        print 'View it online at %s' % spreadsheet_url
        utils.replace_in_file(config_path, graphic_config.COPY_GOOGLE_DOC_KEY, spreadsheet_key)
    else:
        print 'Error creating spreadsheet (status code %s) with message %s' % (resp.status, resp.reason)
        return None
