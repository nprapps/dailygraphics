#!/usr/bin/env python
# _*_ coding:utf-8 _*_
import boto
import json
import os
import subprocess
import webbrowser
from datetime import datetime

from distutils.spawn import find_executable
from fabric.api import local, require, task
from fabric.state import env, output
from oauth import get_document, get_credentials
from time import sleep
from jinja2 import Environment, FileSystemLoader

import app_config
import assets
import flat
import render
import utils
import test
import copytext

from render_utils import load_graphic_config

SPREADSHEET_COPY_URL_TEMPLATE = 'https://www.googleapis.com/drive/v2/files/%s/copy'
SPREADSHEET_VIEW_TEMPLATE = 'https://docs.google.com/spreadsheet/ccc?key=%s#gid=1'

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
Running the app
"""
@task
def app(port='8000'):
    """
    Serve app.py.
    """
    local('gunicorn -b 0.0.0.0:%s --timeout 3600 --reload app:wsgi_app' % port)

"""
Deployment

Changes to deployment requires a full-stack test. Deployment
has two primary functions: Pushing flat files to S3 and deploying
code to a remote server if required.
"""
@task
def deploy(*paths):
    """
    Deploy the latest app(s) to S3 and, if configured, to our servers.
    """
    if paths[0] == '':
        print 'You must specify at least one slug, like this: "deploy:slug" or "deploy:slug,slug"'
        return

    for path in paths:
        deploy_single(path)

def deploy_single(path):
    """
    Deploy a single project to S3 and, if configured, to our servers.
    """
    require('settings', provided_by=[production, staging])
    slug, abspath = utils.parse_path(path)
    graphic_root = '%s/%s' % (abspath, slug)
    s3_root = '%s/graphics/%s' % (app_config.PROJECT_SLUG, slug)
    graphic_assets = '%s/assets' % graphic_root
    s3_assets = '%s/assets' % s3_root
    graphic_node_modules = '%s/node_modules' % graphic_root

    graphic_config = load_graphic_config(graphic_root)

    use_assets = getattr(graphic_config, 'USE_ASSETS', True)
    default_max_age = getattr(graphic_config, 'DEFAULT_MAX_AGE', None) or app_config.DEFAULT_MAX_AGE
    assets_max_age = getattr(graphic_config, 'ASSETS_MAX_AGE', None) or app_config.ASSETS_MAX_AGE
    update_copy(path)
    if use_assets:
        error = assets.sync(path)
        if error:
            return

    render.render(path)
    flat.deploy_folder(
        graphic_root,
        s3_root,
        headers={
            'Cache-Control': 'max-age=%i' % default_max_age
        },
        ignore=['%s/*' % graphic_assets, '%s/*' % graphic_node_modules,
                # Ignore files unused on static S3 server
                '*.xls', '*.xlsx', '*.pyc', '*.py', '*.less', '*.bak',
                '%s/base_template.html' % graphic_root,
                '%s/child_template.html' % graphic_root]
    )

    if use_assets:
        flat.deploy_folder(
            graphic_assets,
            s3_assets,
            headers={
                'Cache-Control': 'max-age=%i' % assets_max_age
            },
            ignore=['%s/private/*' % graphic_assets]
        )

    # Need to explicitly point to index.html for the AWS staging link
    file_suffix = ''
    if env.settings == 'staging':
        file_suffix = 'index.html'

    print ''
    print '%s URL: %s/graphics/%s/%s' % (env.settings.capitalize(), app_config.S3_BASE_URL, slug, file_suffix)

def download_copy(path):
    """
    Downloads a Google Doc as an .xlsx file.
    """
    slug, abspath = utils.parse_path(path)
    graphic_path = '%s/%s' % (abspath, slug)

    try:
        graphic_config = load_graphic_config(graphic_path)
    except IOError:
        print '%s/graphic_config.py does not exist.' % slug
        return

    if not hasattr(graphic_config, 'COPY_GOOGLE_DOC_KEY') or not graphic_config.COPY_GOOGLE_DOC_KEY:
        print 'COPY_GOOGLE_DOC_KEY is not defined in %s/graphic_config.py.' % slug
        return

    copy_path = os.path.join(graphic_path, '%s.xlsx' % slug)
    get_document(graphic_config.COPY_GOOGLE_DOC_KEY, copy_path)

@task
def update_copy(path=None):
    """
    Fetches the latest Google Doc and updates local JSON.
    """
    if path:
        download_copy(path)
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
    # Add today's date to end of slug if not present or invalid
    slug = _add_date_slug(slug)

    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)

    if _check_slug(slug):
        return

    local('cp -r graphic_templates/_base %s' % (graphic_path))
    local('cp -r graphic_templates/%s/* %s' % (template, graphic_path))

    config_path = os.path.join(graphic_path, 'graphic_config.py')

    if os.path.isfile(config_path):
        print 'Creating spreadsheet...'

        success = copy_spreadsheet(slug)

        if success:
            download_copy(slug)
        else:
            local('rm -r graphic_path')
            print 'Failed to copy spreadsheet! Try again!'
            return
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

    try:
        bucket = utils.get_bucket(app_config.PRODUCTION_S3_BUCKET['bucket_name'])
        key = bucket.get_key('%s/graphics/%s/child.html' % (app_config.PROJECT_SLUG, slug))

        if key:
            print 'Error: Slug exists on apps.npr.org'
            return True
    except boto.exception.NoAuthHandlerFound:
        print 'Could not authenticate, skipping Amazon S3 check'
    except boto.exception.S3ResponseError:
        print 'Could not access S3 bucket, skipping Amazon S3 check'

    return False


def _add_date_slug(old_slug):
    """
    Add today's date to slug if it does not have a date or it is not valid
    """
    slug = old_slug
    today = datetime.today().strftime('%Y%m%d')
    # create a new slug based on the old one
    bits = old_slug.split('-')
    # Test if we had a valid date
    try:
        datetime.strptime(bits[len(bits) - 1], '%Y%m%d')
    except ValueError:
        # Test if the date is not valid but numeric
        try:
            int(bits[len(bits) - 1])
            bits = bits[:-1]
            print 'Removed numeric end of the slug since not a valid date'
        except ValueError:
            pass
        bits.extend([today])
        slug = "-".join(bits)
    return slug


def _create_slug(old_slug):
    """
    create a new slug based on an older one
    """
    today = datetime.today().strftime('%Y%m%d')
    # create a new slug based on the old one
    bits = old_slug.split('-')
    try:
        datetime.strptime(bits[len(bits) - 1], '%Y%m%d')
        bits = bits[:-1]
    except ValueError:
        # Add today's date to old slug
        pass
    bits.extend([today])
    return "-".join(bits)


def _search_graphic_slug(slug):
    """
    searches a given slug in graphics and graphics-archive repos
    """
    IGNORE_LIST = ['js', 'css', 'assets', 'lib', '.git']
    # Limit the search to graphics and graphics-archive repos
    # searching graphics first
    search_scope = [app_config.GRAPHICS_PATH, app_config.ARCHIVE_GRAPHICS_PATH]

    for idx, d in enumerate(search_scope):
        old_graphic_warning = True if (idx > 0) else False
        for local_path, subdirs, filenames in os.walk(d, topdown=True):
            bits = local_path.split(os.path.sep)
            if bits[len(bits) - 1] in IGNORE_LIST:
                continue
            if slug in subdirs:
                path = os.path.join(local_path, slug)
                return path, old_graphic_warning
    return None, None


@task
def clone_graphic(old_slug, slug=None):
    """
    Clone an existing graphic creating a new spreadsheet
    """

    if not slug:
        slug = _create_slug(old_slug)

    if slug == old_slug:
        print "%(slug)s already has today's date, please specify a new slug to clone into, i.e.: fab clone_graphic:%(slug)s,NEW_SLUG" % {'slug': old_slug}
        return

    # Add today's date to end of slug if not present or invalid
    slug = _add_date_slug(slug)

    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    if _check_slug(slug):
        return

    # First search over the graphics repo
    clone_path, old_graphic_warning = _search_graphic_slug(old_slug)
    if not clone_path:
        print 'Did not find %s on graphics repos...skipping' % (old_slug)
        return

    local('cp -r %s %s' % (clone_path, graphic_path))

    config_path = os.path.join(graphic_path, 'graphic_config.py')

    if os.path.isfile(config_path):
        print 'Creating spreadsheet...'

        success = copy_spreadsheet(slug)

        if success:
            download_copy(slug)
        else:
            local('rm -r %s' % (graphic_path))
            print 'Failed to copy spreadsheet! Try again!'
            return
    else:
        print 'No graphic_config.py found, not creating spreadsheet'

    # Force render to clean up old graphic generated files
    render.render(slug)

    print 'Run `fab app` and visit http://127.0.0.1:8000/graphics/%s to view' % slug

    if old_graphic_warning:
        print "WARNING: %s was found in old & dusty graphic archives\n"\
              "WARNING: Please ensure that graphic is up-to-date"\
              " with your current graphic libs & best-practices" % (old_slug)

@task
def add_graphic(slug):
    """
    Create a basic project.
    """
    _add_graphic(slug, 'graphic')

@task
def add_ai2html_graphic(slug):
    """
    Create a graphic using an Adobe Illustrator base.
    """
    _add_graphic(slug, 'ai2html_graphic')

@task
def add_animated_photo(slug):
    """
    Create a new animated photo (GIF alternative).
    """
    _add_graphic(slug, 'animated_photo')

@task
def add_archive_graphic(slug):
    """
    Create a shell to archive an old project.
    """
    _add_graphic(slug, 'archive_graphic')

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
def add_stacked_grouped_column_chart(slug):
    """
    Create a stacked grouped column chart.
    """
    _add_graphic(slug, 'stacked_grouped_column_chart')

@task
def add_block_histogram(slug):
    """
    Create a block histogram.
    """
    _add_graphic(slug, 'block_histogram')

@task
def add_diverging_bar_chart(slug):
    """
    Create a diverging bar chart.
    """
    _add_graphic(slug, 'diverging_bar_chart')

@task
def add_grouped_bar_chart(slug):
    """
    Create a grouped bar chart.
    """
    _add_graphic(slug, 'grouped_bar_chart')

@task
def add_stacked_bar_chart(slug):
    """
    Create a stacked bar chart.
    """
    _add_graphic(slug, 'stacked_bar_chart')

@task
def add_state_grid_map(slug):
    """
    Create a state grid cartogram
    """
    _add_graphic(slug, 'state_grid_map')

@task
def add_line_chart(slug):
    """
    Create a line chart.
    """
    _add_graphic(slug, 'line_chart')

@task
def add_dot_chart(slug):
    """
    Create a dot chart with error bars
    """
    _add_graphic(slug, 'dot_chart')

@task
def add_slopegraph(slug):
    """
    Create a slopegraph (intended for narrow display)
    """
    _add_graphic(slug, 'slopegraph')

@task
def add_map(slug):
    """
    Create a locator map.
    """
    _add_graphic(slug, 'locator_map')

@task
def add_table(slug):
    """
    Create a data table.
    """
    _add_graphic(slug, 'table')

@task
def add_quiz(slug):
    """
    Create a quiz.
    """
    _add_graphic(slug, 'quiz')

@task
def add_issue_matrix(slug):
    """
    Create a table comparing positions on an issue.
    """
    _add_graphic(slug, 'issue_matrix')

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


@task
def open_spreadsheet(slug):
    """
    Open the spreadsheet associated with a given slug
    """

    config_path, _ = _search_graphic_slug(slug)
    try:
        graphic_config = load_graphic_config(config_path)
    except ImportError:
        print 'graphic_config.py not found for %s on graphics or graphics-archive repos' % slug
        return

    if not hasattr(graphic_config, 'COPY_GOOGLE_DOC_KEY') or not graphic_config.COPY_GOOGLE_DOC_KEY:
        print 'There seems to be no spreadsheet linked to that slug. (COPY_GOOGLE_DOC_KEY is not defined in %s/graphic_config.py.)' % slug
        return

    spreadsheet_url = SPREADSHEET_VIEW_TEMPLATE % graphic_config.COPY_GOOGLE_DOC_KEY
    webbrowser.open_new(spreadsheet_url)


def copy_spreadsheet(slug):
    """
    Copy the COPY spreadsheet
    """
    _check_credentials()

    config_path = '%s/%s/' % (app_config.GRAPHICS_PATH, slug)
    graphic_config = load_graphic_config(config_path)

    if not hasattr(graphic_config, 'COPY_GOOGLE_DOC_KEY') or not graphic_config.COPY_GOOGLE_DOC_KEY:
        print 'Skipping spreadsheet creation. (COPY_GOOGLE_DOC_KEY is not defined in %s/graphic_config.py.)' % slug
        return

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
        utils.replace_in_file('%s/graphic_config.py' % config_path , graphic_config.COPY_GOOGLE_DOC_KEY, spreadsheet_key)

        return True
    else:
        utils.replace_in_file(config_path, graphic_config.COPY_GOOGLE_DOC_KEY, '')

    print 'Error creating spreadsheet (status code %s) with message %s' % (resp.status, resp.reason)
    return False

@task
def copyedit(*paths):
    """
    Generates a copyedit email for graphic(s) (fab copyedit:slug1,slug2 | pbcopy)
    """
    if paths[0] == '':
        print 'You must specify at least one slug, like this: "copyedit:slug" or "copyedit:slug,slug"'
        return

    #Generate Intro Copyedit Text
    env = Environment(
        loader=FileSystemLoader(['dailygraphics', 'templates']),
        extensions=['jinja2.ext.i18n']
    )

    #Enable translations. We're just using this for pluralization, not translating to different languages
    env.install_null_translations()

    template = env.get_template('copyedit/note.txt')

    graphics = [get_graphic_template_variables(path, i)
                for i, path in enumerate(paths)]

    note = template.render(graphics=graphics)

    # Gets rid of 'done' message at the end.
    # This suppresses output so only the graphic text
    # we want can be piped to the clipboard.
    output["status"] = False

    print note

def get_graphic_template_variables(path, graphic_number):
    """
    Generates the template variables for each graphic
    """
    slug, abspath = utils.parse_path(path)
    graphic_path = '%s/%s' % (abspath, slug)

    ## Get Spreadsheet Path
    try:
        graphic_config = load_graphic_config(graphic_path)
    except IOError:
        print '%s/graphic_config.py does not exist.' % slug
        return

    if not hasattr(graphic_config, 'COPY_GOOGLE_DOC_KEY') or not graphic_config.COPY_GOOGLE_DOC_KEY:
        print 'COPY_GOOGLE_DOC_KEY is not defined in %s/graphic_config.py.' % slug
        return

    ## Generate Links From Slug
    spreadsheet_id = graphic_config.COPY_GOOGLE_DOC_KEY
    app_id = slug

    ## Update Spreadsheet
    copy_path = os.path.join(graphic_path, '%s.xlsx' % slug)
    get_document(graphic_config.COPY_GOOGLE_DOC_KEY, copy_path)

    ## Get Sheet Data
    copy = copytext.Copy(filename=copy_path)
    sheet = copy['labels']

    note = {
        "spreadsheet_id": spreadsheet_id,
        "app_id": app_id,
        "graphic_number": graphic_number + 1,
        "sheet": sheet,
    }

    return note
