#!/usr/bin/env python

import argparse
from flask import Flask, render_template

import app_config
from render_utils import make_context, urlencode_filter
import static

app = Flask(app_config.PROJECT_NAME)
app.register_blueprint(static.static)

app.jinja_env.filters['urlencode'] = urlencode_filter

# Example application views
@app.route('/<string:slug>/')
def render_parent(slug):
    """
    Renders a parent.html index with child.html embedded as iframe.
    """

    context = {'slug': slug}
    context['domain'] = app_config.S3_BASE_URL

    return render_template('parent.html', **context)

# Boilerplate
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port')
    args = parser.parse_args()
    server_port = 8000

    if args.port:
        server_port = int(args.port)

    app.run(host='0.0.0.0', port=server_port, debug=app_config.DEBUG)
