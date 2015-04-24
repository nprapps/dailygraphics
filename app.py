#!/usr/bin/env python

import os

from flask import Flask, make_response, render_template
from glob import glob
from werkzeug.debug import DebuggedApplication

import app_config
import copytext
import graphic
import oauth
from render_utils import make_context, render_with_context, urlencode_filter
import static

app = Flask(app_config.PROJECT_SLUG)
app.debug = app_config.DEBUG

app.add_template_filter(urlencode_filter, 'urlencode')
app.jinja_env.globals.update(render=render_with_context)

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

app.register_blueprint(graphic.graphic, url_prefix='/graphics')
app.register_blueprint(static.static)
app.register_blueprint(oauth.oauth)

if app_config.DEBUG:
    wsgi_app = DebuggedApplication(app, evalex=False)
else:
    wsgi_app = app

# Boilerplate
if __name__ == '__main__':
    print 'This command has been removed! Please run "fab app" instead!'
