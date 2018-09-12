#!/usr/bin/env python

import os

from flask import Flask, make_response, render_template
from glob import glob
from werkzeug.debug import DebuggedApplication

import app_config
import copytext
import graphic
import graphic_templates
import oauth
from render_utils import make_context

app = Flask(app_config.PROJECT_SLUG)
app.debug = app_config.DEBUG

@app.route('/')
def _graphics_list():
    """
    Renders a list of all graphics for local testing.
    """
    context = make_context()
    context['graphics'] = []
    context['templates'] = []

    graphics = glob('%s/*' % app_config.GRAPHICS_PATH)

    for graphic in graphics:
        name = graphic.split('%s/' % app_config.GRAPHICS_PATH)[1].split('/child.html')[0]
        context['graphics'].append(name)

    context['graphics'].sort();

    context['graphics_count'] = len(context['graphics'])

    templates = glob('%s/*' % app_config.TEMPLATES_PATH)

    for template in templates:
        name = template.split('%s/' % app_config.TEMPLATES_PATH)[1]

        if name.startswith('_'):
            continue

        context['templates'].append(name)

    context['templates'].sort()

    context['templates_count'] = len(context['templates'])

    return make_response(render_template('index.html', **context))

app.register_blueprint(graphic.graphic, url_prefix='/graphics')
app.register_blueprint(graphic_templates.graphic_templates, url_prefix='/templates')
app.register_blueprint(oauth.oauth)

if app_config.DEBUG:
    wsgi_app = DebuggedApplication(app, evalex=False)
else:
    wsgi_app = app

# Boilerplate
if __name__ == '__main__':
    print 'This command has been removed! Please run "fab app" instead!'
