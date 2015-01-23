#!/usr/bin/env python

from glob import glob
import imp
import os

from flask import Flask, make_response, render_template, render_template_string
from werkzeug.debug import DebuggedApplication

import app_config
import copytext
from render_utils import make_context, urlencode_filter
import static

app = Flask(app_config.PROJECT_SLUG)
app.debug = app_config.DEBUG

app.jinja_env.filters['urlencode'] = urlencode_filter

@app.route('/')
def _graphics_list():
    """
    Renders a list of all graphics for local testing.
    """
    context = make_context()
    context['graphics'] = []

    graphics = glob('%s/*' % app_config.GRAPHICS_PATH)
    for graphic in graphics:
        name = graphic.split('%s/' % app_config.GRAPHICS_PATH)[1].split('/child.html')[0]
        context['graphics'].append(name)

    context['graphics_count'] = len(context['graphics'])

    return make_response(render_template('index.html', **context))

@app.route('/graphics/<slug>/')
def _graphics_detail(slug):
    """
    Renders a parent.html index with child.html embedded as iframe.
    """
    context = make_context()
    context['slug'] = slug

    template = 'parent.html'

    if not os.path.exists('%s/%s/js/lib/pym.js' % (app_config.GRAPHICS_PATH, slug)):
        template = 'parent_old.html'

    return make_response(render_template(template, **context))

@app.route('/graphics/<slug>/child.html')
def _graphics_child(slug):
    """
    Renders a child.html for embedding.
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)

    # Fallback for legacy projects w/o child templates
    if not os.path.exists('%s/child_template.html' % graphic_path):
        with open('%s/child.html' % graphic_path) as f:
            contents = f.read()

        return contents

    context = make_context()
    context['slug'] = slug

    try:
        graphic_config = imp.load_source('graphic_config', '%s/graphic_config.py' % graphic_path)
        context.update(graphic_config.__dict__)

        if hasattr(graphic_config, 'COPY_GOOGLE_DOC_KEY') and graphic_config.COPY_GOOGLE_DOC_KEY:
            context['COPY'] = copytext.Copy(filename='%s/%s.xlsx' % (graphic_path, slug))
    except IOError:
        pass

    with open('%s/child_template.html' % graphic_path) as f:
        template = f.read().decode('utf-8')

    return make_response(render_template_string(template, **context))

app.register_blueprint(static.static)

if app_config.DEBUG:
    wsgi_app = DebuggedApplication(app, evalex=False)
else:
    wsgi_app = app


# Boilerplate
if __name__ == '__main__':
    print 'This command has been removed! Please run "fab app" instead!'
