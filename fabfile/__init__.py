#!/usr/bin/env python

from glob import glob
import imp
import os

from fabric.api import local, require, settings, task 
from fabric.state import env

import app
import app_config
from etc.gdocs import GoogleDoc

# Other fabfiles
import assets
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
        _render_graphics(['www/graphics/%s' % slug])
    else:
        _render_graphics(glob('www/graphics/*'))

def _render_graphics(paths):
    """
    For rendering routes with an iterable.
    E.g., /blogs/<blog-id>/ would be a route.
    And [1,2,3] would be an iterable.
    And this would render:
        /blogs/1/
        /blogs/2/
        /blogs/3/
    Get it?
    """
    # Fake out deployment target
    app_config.configure_targets(env.get('settings', None))

    for path in paths:
        slug = path.split('www/graphics/')[1].split('/')[0]

        with app.app.test_request_context(path='graphics/%s/' % slug):
            view = app.__dict__['_graphics_detail']
            content = view(slug)

        with open('%s/index.html' % path, 'w') as writefile:
            writefile.write(content.encode('utf-8'))

        # Fallback for legacy projects w/o child templates 
        if not os.path.exists('%s/child_template.html' % path):
            continue

        download_copy(slug)

        with app.app.test_request_context(path='graphics/%s/child.html' % slug):
            view = app.__dict__['_graphics_child']
            content = view(slug)

        with open('%s/child.html' % path, 'w') as writefile:
            writefile.write(content.encode('utf-8'))

    # Un-fake-out deployment target
    app_config.configure_targets(app_config.DEPLOYMENT_TARGET)

"""
Deployment

Changes to deployment requires a full-stack test. Deployment
has two primary functions: Pushing flat files to S3 and deploying
code to a remote server if required.
"""
def _deploy_to_s3(path='.gzip'):
    """
    Deploy the gzipped stuff to S3.
    """
    # Clear files that should never be deployed
    local('rm -rf %s/live-data' % path)
    local('rm -rf %s/sitemap.xml' % path)

    exclude_flags = ''
    include_flags = ''

    with open('gzip_types.txt') as f:
        for line in f:
            exclude_flags += '--exclude "%s" ' % line.strip()
            include_flags += '--include "%s" ' % line.strip()

    sync = 'aws s3 sync %s %s --acl "public-read" ' + exclude_flags + ' --cache-control "max-age=5" --region "us-east-1"'
    sync_gzip = 'aws s3 sync %s %s --acl "public-read" --content-encoding "gzip" --exclude "*" ' + include_flags + ' --cache-control "max-age=5" --region "us-east-1"'
    sync_assets = 'aws s3 sync %s %s --acl "public-read" --cache-control "max-age=86400" --region "us-east-1"'

    for bucket in app_config.S3_BUCKETS:
        local(sync % (path, 's3://%s/%s/%s' % (
            bucket,
            app_config.PROJECT_SLUG,
            path.split('.gzip/')[1]
        )))
        local(sync_gzip % (path, 's3://%s/%s/%s' % (
            bucket,
            app_config.PROJECT_SLUG,
            path.split('.gzip/')[1]
        )))
        local(sync_assets % ('www/assets/', 's3://%s/%s/assets/' % (
            bucket,
            app_config.PROJECT_SLUG
        )))

def _gzip(in_path='www', out_path='.gzip'):
    """
    Gzips everything in www and puts it all in gzip
    """
    local('python gzip_assets.py %s %s' % (in_path, out_path))

@task
def deploy(slug=''):
    """
    Deploy the latest app to S3 and, if configured, to our servers.
    """
    require('settings', provided_by=[production, staging])

    render(slug)
    _gzip('www', '.gzip')
    _deploy_to_s3('.gzip/graphics/%s' % slug)

def download_copy(slug):
    """
    Downloads a Google Doc as an .xlsx file.
    """
    graphic_config = imp.load_source('graphic_config', 'www/graphics/%s/graphic_config.py' % slug)

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

    slugs = os.listdir('www/graphics')

    for slug in slugs:
        if not os.path.exists('www/graphics/%s/graphic_config.py' % slug):
            continue

        print slug
        download_copy(slug)

"""
App-specific commands
"""
@task
def add_graphic(slug):
    local('cp -r new_graphic www/graphics/%s' % slug)
    download_copy(slug)

"""
Destruction

Changes to destruction require setup/deploy to a test host in order to test.
Destruction should remove all files related to the project from both a remote
host and S3.
"""
@task
def shiva_the_destroyer():
    """
    Deletes the app from s3
    """
    require('settings', provided_by=[production, staging])

    utils.confirm("You are about to destroy everything deployed to %s for this project.\nDo you know what you're doing?" % app_config.DEPLOYMENT_TARGET)

    with settings(warn_only=True):
        sync = 'aws s3 rm %s --recursive --region "us-east-1"'

        for bucket in app_config.S3_BUCKETS:
            local(sync % ('s3://%s/%s/' % (bucket, app_config.PROJECT_SLUG)))
