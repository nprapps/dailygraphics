#!/usr/bin/env python

import imp
from mimetypes import guess_type
import os
import subprocess
import sys

from flask import Blueprint, abort, make_response, render_template, render_template_string
from jinja2 import Environment, FileSystemLoader

import app_config
import copytext
import oauth
from render_utils import load_graphic_config, make_context, render_with_context, smarty_filter

graphic_templates = Blueprint('graphic_templates', __name__)

@graphic_templates.route('/<slug>/')
@oauth.oauth_required
def _templates_detail(slug):
    """
    Renders a parent.html index with child.html embedded as iframe.
    """
    from flask import request

    template_path = '%s/%s' % (app_config.TEMPLATES_PATH, slug)
    base_template_path = '%s/%s' % (app_config.TEMPLATES_PATH, '_base')

    # NOTE: Parent must load pym.js from same source as child to prevent version conflicts!
    context = make_context(asset_depth=2, root_path=template_path)
    context['slug'] = slug

    try:
        graphic_config = load_graphic_config(template_path, [base_template_path])
        context.update(graphic_config.__dict__)

        if hasattr(graphic_config, 'COPY_GOOGLE_DOC_KEY') and graphic_config.COPY_GOOGLE_DOC_KEY:
            copy_path = '%s/%s.xlsx' % (template_path, slug)

            if request.args.get('refresh'):
                oauth.get_document(graphic_config.COPY_GOOGLE_DOC_KEY, copy_path)

            context['COPY'] = copytext.Copy(filename=copy_path)
    except IOError:
        pass

    return make_response(render_template('parent.html', **context))

@graphic_templates.route('/<slug>/child.html')
@oauth.oauth_required
def _templates_child(slug):
    """
    Renders a child.html for embedding.
    """
    template_path = '%s/%s' % (app_config.TEMPLATES_PATH, slug)
    base_template_path = '%s/%s' % (app_config.TEMPLATES_PATH, '_base')

    # Fallback for legacy projects w/o child templates
    if not os.path.exists('%s/child_template.html' % template_path):
        with open('%s/child.html' % template_path) as f:
            contents = f.read()

        return contents

    context = make_context(asset_depth=2, root_path=template_path)
    context['slug'] = slug

    env = Environment(loader=FileSystemLoader([template_path, '%s/_base' % app_config.TEMPLATES_PATH]))

    try:
        graphic_config = load_graphic_config(template_path, [base_template_path])
        context.update(graphic_config.__dict__)

        if hasattr(graphic_config, 'JINJA_FILTER_FUNCTIONS'):
            for func in graphic_config.JINJA_FILTER_FUNCTIONS:
                env.filters[func.__name__] = func

        if hasattr(graphic_config, 'COPY_GOOGLE_DOC_KEY') and graphic_config.COPY_GOOGLE_DOC_KEY:
            copy_path = '%s/%s.xlsx' % (template_path, slug)

            context['COPY'] = copytext.Copy(filename=copy_path)
    except IOError:
        pass

    env.globals.update(render=render_with_context)
    env.filters['smarty'] = smarty_filter
    template = env.get_template('child_template.html')

    return make_response(template.render(**context))

# Render graphic LESS files on-demand
@graphic_templates.route('/<slug>/css/<filename>.less')
def _templates_less(slug, filename):
    """
    Compiles LESS for a graphic.
    """
    template_path = '%s/%s' % (app_config.TEMPLATES_PATH, slug)
    less_path = '%s/css/%s.less' % (template_path, filename)
    base_less_path = '%s/_base/css/base.less' % app_config.TEMPLATES_PATH
    temp_base_less_path = '%s/css/base.less' % template_path

    if not os.path.exists(less_path):
        less_path = '%s/_base/css/%s.less' % (app_config.TEMPLATES_PATH, filename)

        if not os.path.exists(less_path):
            abort(404)

    if os.path.exists(temp_base_less_path):
        os.remove(temp_base_less_path)

    # Temp symlink base.less so it can be included by less compiler
    os.symlink(base_less_path, temp_base_less_path)

    r = subprocess.check_output(['node_modules/less/bin/lessc', less_path])

    # Remove temporary symlink
    os.remove(temp_base_less_path)

    return make_response(r, 200, { 'Content-Type': 'text/css' })

# Serve arbitrary static files from either graphic or base graphic paths
@graphic_templates.route('/<slug>/<path:path>')
def _static(slug, path):
    template_path = '%s/%s' % (app_config.TEMPLATES_PATH, slug)
    real_path = '%s/%s' % (template_path, path)

    if not os.path.exists(real_path):
        real_path = '%s/_base/%s' % (app_config.TEMPLATES_PATH, path)

        if not os.path.exists(real_path):
            abort(404)

    with open('%s' % real_path) as f:
        return f.read(), 200, { 'Content-Type': guess_type(real_path)[0] }
