#!/usr/bin/env python

import codecs
from datetime import datetime
import json
import time
import urllib
import subprocess

from flask import Markup, g, render_template, request
from slimit import minify
from smartypants import smartypants
from jinja2 import contextfunction, Template

import app_config
import copytext

class BetterJSONEncoder(json.JSONEncoder):
    """
    A JSON encoder that intelligently handles datetimes.
    """
    def default(self, obj):
        if isinstance(obj, datetime):
            encoded_object = obj.isoformat()
        else:
            encoded_object = json.JSONEncoder.default(self, obj)

        return encoded_object

class Includer(object):
    """
    Base class for Javascript and CSS psuedo-template-tags.

    See `make_context` for an explanation of `asset_depth`.
    """
    def __init__(self, asset_depth=0, root_path='www'):
        self.includes = []
        self.tag_string = None
        self.asset_depth = asset_depth
        self.root_path = root_path

    def push(self, path):
        self.includes.append(path)

        return ''

    def _compress(self):
        raise NotImplementedError()

    def _relativize_path(self, path):
        relative_path = path
        depth = len(request.path.split('/')) - (2 + self.asset_depth)

        while depth > 0:
            relative_path = '../%s' % relative_path
            depth -= 1

        return relative_path

    def render(self, path):
        if getattr(g, 'compile_includes', False):
            if path in g.compiled_includes:
                timestamp_path = g.compiled_includes[path]
            else:
                # Add a querystring to the rendered filename to prevent caching
                timestamp_path = '%s?%i' % (path, int(time.time()))

                out_path = '%s/%s' % (self.root_path, path)

                if path not in g.compiled_includes:
                    print 'Rendering %s' % out_path

                    with codecs.open(out_path, 'w', encoding='utf-8') as f:
                        f.write(self._compress())

                # See "fab render"
                g.compiled_includes[path] = timestamp_path

            markup = Markup(self.tag_string % self._relativize_path(timestamp_path))
        else:
            response = ','.join(self.includes)

            response = '\n'.join([
                self.tag_string % self._relativize_path(src) for src in self.includes
            ])

            markup = Markup(response)

        del self.includes[:]

        return markup

class JavascriptIncluder(Includer):
    """
    Psuedo-template tag that handles collecting Javascript and serving appropriate clean or compressed versions.
    """
    def __init__(self, *args, **kwargs):
        Includer.__init__(self, *args, **kwargs)

        self.tag_string = '<script type="text/javascript" src="%s"></script>'

    def _compress(self):
        output = []
        src_paths = []

        for src in self.includes:
            src_paths.append('%s/%s' % (self.root_path, src))

            with codecs.open('%s/%s' % (self.root_path, src), encoding='utf-8') as f:
                if not src.endswith('.min.js'):
                    print '- compressing %s' % src
                    output.append(minify(f.read()))
                else:
                    print '- appending already compressed %s' % src
                    output.append(f.read())

        context = make_context()
        context['paths'] = src_paths

        return '\n'.join(output)

class CSSIncluder(Includer):
    """
    Psuedo-template tag that handles collecting CSS and serving appropriate clean or compressed versions.
    """
    def __init__(self, *args, **kwargs):
        Includer.__init__(self, *args, **kwargs)

        self.tag_string = '<link rel="stylesheet" type="text/css" href="%s" />'

    def _compress(self):
        output = []

        src_paths = []

        for src in self.includes:
            css_path = '%s/%s' % (self.root_path, src)

            src_paths.append(css_path)

            try:
                compressed_src = subprocess.check_output(["node_modules/less/bin/lessc", "-x", css_path])
                output.append(compressed_src)
            except:
                print 'It looks like "lessc" isn\'t installed. Try running: "npm install"'
                raise

        context = make_context()
        context['paths'] = src_paths

        return '\n'.join(output)

def flatten_app_config():
    """
    Returns a copy of app_config containing only
    configuration variables.
    """
    config = {}

    # Only all-caps [constant] vars get included
    for k, v in app_config.__dict__.items():
        if k.upper() == k:
            config[k] = v

    return config

def make_context(asset_depth=0, root_path='www'):
    """
    Create a base-context for rendering views.
    Includes app_config and JS/CSS includers.

    `asset_depth` indicates how far into the url hierarchy
    the assets are hosted. If 0, then they are at the root.
    If 1 then at /foo/, etc.
    """
    context = flatten_app_config()

    context['JS'] = JavascriptIncluder(
        asset_depth=asset_depth,
        root_path=root_path
    )
    context['CSS'] = CSSIncluder(
        asset_depth=asset_depth,
        root_path=root_path
    )

    return context

def urlencode_filter(s):
    """
    Filter to urlencode strings.
    """
    if type(s) == 'Markup':
        s = s.unescape()

    # Evaulate COPY elements
    if type(s) is not unicode:
        s = unicode(s)

    s = s.encode('utf8')
    s = urllib.quote_plus(s)

    return Markup(s)

def format_currency(s):
    
    t = float(s)
    
    return "${:,.2f}".format(t)
    
def format_thousands(s):
    
    t = float(s)
    
    return "{:,.0f}".format(t)    

def smarty_filter(s):
    """
    Filter to smartypants strings.
    """
    if type(s) == 'Markup':
        s = s.unescape()

    # Evaulate COPY elements
    if type(s) is not unicode:
        s = unicode(s)


    s = s.encode('utf-8')
    s = smartypants(s)

    try:
        return Markup(s)
    except:
        print 'This string failed to encode: %s' % s
        return Markup(s)

@contextfunction
def render_with_context(context, text):
    """
    Render a template within a template!
    """
    template = Template(text.__unicode__())

    return template.render(**context)