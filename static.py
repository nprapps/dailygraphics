#!/usr/bin/env python

import json
from mimetypes import guess_type

from flask import Blueprint, abort
from render_utils import flatten_app_config

import app_config

static = Blueprint('static', __name__)

# Render application configuration
@static.route('/js/app_config.js')
def _app_config_js():
    config = flatten_app_config()
    js = 'window.APP_CONFIG = ' + json.dumps(config)

    return js, 200, { 'Content-Type': 'application/javascript' }

# Serve arbitrary static files on-demand
@static.route('/<path:path>')
def _static(path):
    if path.startswith('graphics'):
        real_path = '%s/%s' % (app_config.GRAPHICS_PATH, path[9:])
    else:
        real_path = 'www/%s' % path

    print real_path

    try:
        with open('%s' % real_path) as f:
            return f.read(), 200, { 'Content-Type': guess_type(real_path)[0] }
    except IOError:
        abort(404)
