#!/usr/bin/env python

import imp
import os
import subprocess

from flask import Blueprint, abort, make_response, render_template, render_template_string
from jinja2 import Environment, FileSystemLoader

import app_config
import copytext
import oauth
from render_utils import make_context, render_with_context

graphic = Blueprint('graphic', __name__)

@graphic.route('/<slug>/')
@oauth.oauth_required
def _graphics_detail(slug):
    """
    Renders a parent.html index with child.html embedded as iframe.
    """
    from flask import request

    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)

    # NOTE: Parent must load pym.js from same source as child to prevent version conflicts!
    context = make_context(asset_depth=2, root_path=graphic_path)
    context['slug'] = slug

    template = 'parent.html'

    if not os.path.exists('%s/%s/js/lib/pym.js' % (app_config.GRAPHICS_PATH, slug)):
        template = 'parent_old.html'

    try:
        graphic_config = imp.load_source('graphic_config', '%s/graphic_config.py' % graphic_path)
        context.update(graphic_config.__dict__)

        if hasattr(graphic_config, 'COPY_GOOGLE_DOC_KEY') and graphic_config.COPY_GOOGLE_DOC_KEY:
            copy_path = '%s/%s.xlsx' % (graphic_path, slug)

            if request.args.get('refresh'):
                oauth.get_document(graphic_config.COPY_GOOGLE_DOC_KEY, copy_path)

            context['COPY'] = copytext.Copy(filename=copy_path)
    except IOError:
        pass

    return make_response(render_template(template, **context))

@graphic.route('/<slug>/child.html')
@oauth.oauth_required
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

    context = make_context(asset_depth=2, root_path=graphic_path)
    context['slug'] = slug

    try:
        graphic_config = imp.load_source('graphic_config', '%s/graphic_config.py' % graphic_path)
        context.update(graphic_config.__dict__)

        if hasattr(graphic_config, 'COPY_GOOGLE_DOC_KEY') and graphic_config.COPY_GOOGLE_DOC_KEY:
            copy_path = '%s/%s.xlsx' % (graphic_path, slug)

            context['COPY'] = copytext.Copy(filename=copy_path)
    except IOError:
        pass

    env = Environment(loader=FileSystemLoader(graphic_path))
    env.globals.update(render=render_with_context)
    template = env.get_template('child_template.html')

    return make_response(template.render(**context))

# Render graphic LESS files on-demand
@graphic.route('/<slug>/css/<filename>.less')
def _graphic_less(slug, filename):
    """
    Compiles LESS for a graphic.
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    less_path = '%s/css/%s.less' % (graphic_path, filename)

    if not os.path.exists(less_path):
        abort(404)

    r = subprocess.check_output(['node_modules/less/bin/lessc', less_path])

    return make_response(r, 200, { 'Content-Type': 'text/css' })
