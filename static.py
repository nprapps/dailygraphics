#!/usr/bin/env python

import json
from mimetypes import guess_type

from flask import Blueprint, abort
from render_utils import flatten_app_config

import app_config

static = Blueprint('static', __name__)

# Serve arbitrary static files on-demand
@static.route('/<path:path>')
def _static(path):
    real_path = 'www/%s' % path

    try:
        with open(real_path) as f:
            return f.read(), 200, { 'Content-Type': guess_type(real_path)[0] }
    except IOError:
        abort(404)
