#!/usr/bin/env python

import argparse
from glob import glob
import imp
import os

from flask import Flask, render_template, render_template_string

import app_config
import copytext
from render_utils import make_context, urlencode_filter
import static

app = Flask(app_config.PROJECT_SLUG)

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

    return render_template('index.html', **context)

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

    return render_template(template, **context)

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
    context['COPY'] = copytext.Copy(filename='data/%s.xlsx' % slug)
    
    try:
        graphic_config = imp.load_source('graphic_config', '%s/graphic_config.py' % graphic_path)
        context.update(graphic_config.__dict__)
    except IOError:
        pass

    with open('%s/child_template.html' % graphic_path) as f:
        template = f.read().decode('utf-8')

    return render_template_string(template, **context)

app.register_blueprint(static.static)

# Boilerplate
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port')
    args = parser.parse_args()
    server_port = 8000

    if args.port:
        server_port = int(args.port)

    app.run(host='0.0.0.0', port=server_port, debug=app_config.DEBUG)
