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

app = Flask(app_config.PROJECT_NAME)

app.jinja_env.filters['urlencode'] = urlencode_filter

@app.route('/')
def _graphics_list():
    """
    Renders a list of all graphics for local testing.
    """
    context = make_context()
    context['graphics'] = []

    graphics = glob('www/graphics/*')
    for graphic in graphics:
        context['graphics'].append(graphic.split('www/graphics/')[1].split('/child.html')[0])

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

    if not os.path.exists('www/graphics/%s/js/lib/pym.js' % slug):
        template = 'parent_old.html'

    return render_template(template, **context)

@app.route('/graphics/<slug>/child.html')
def _graphics_child(slug):
    """
    Renders a child.html for embedding.
    """
    # Fallback for legacy projects w/o child templates
    if not os.path.exists('www/graphics/%s/child_template.html' % slug):
        with open('www/graphics/%s/child.html' % slug) as f:
            contents = f.read()

        return contents

    context = make_context()
    context['slug'] = slug
    context['COPY'] = copytext.Copy(filename='data/%s.xls' % slug)
    
    try:
        graphic_config = imp.load_source('graphic_config', 'www/graphics/%s/graphic_config.py' % slug)
        context.update(graphic_config.__dict__)
    except IOError:
        pass

    with open('www/graphics/%s/child_template.html' % slug) as f:
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
