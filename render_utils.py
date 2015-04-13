#!/usr/bin/env python

import glob
import os
import time
import urllib

from cssmin import cssmin
from flask import Markup, g, render_template, request
from jinja2 import contextfunction, Template
from slimit import minify

import app_config

CSS_HEADER = '''
/*
 * Looking for the full, uncompressed source? Try here:
 *
 * https://github.com/nprapps/%s
 */
''' % app_config.REPOSITORY_NAME

JS_HEADER = '''
/*
 * Looking for the full, uncompressed source? Try here:
 *
 * https://github.com/nprapps/%s
 */
''' % app_config.REPOSITORY_NAME

class Includer(object):
    """
    Base class for Javascript and CSS psuedo-template-tags.
    """
    def __init__(self):
        self.includes = []
        self.tag_string = None

    def push(self, path):
            self.includes.append(path)

            return ""

    def _compress(self):
        raise NotImplementedError()

    def _relativize_path(self, path):
        relative_path = path
        depth = len(request.path.split('/')) - 2

        while depth > 0:
            relative_path = '../%s' % relative_path
            depth -= 1

        return relative_path

    def render(self, path):
        if getattr(g, 'compile_includes', False):
            # Add a timestamp to the rendered filename to prevent caching
            timestamp = int(time.time())
            front, back = path.rsplit('.', 1)
            path = '%s.%i.%s' % (front, timestamp, back)
            out_path = 'www/%s' % path

            # Delete old rendered versions, just to be tidy
            old_versions = glob.glob('%s.*.%s' % (front, back))

            for f in old_versions:
                os.remove(f)

            if out_path not in g.compiled_includes:
                print 'Rendering %s' % out_path

                with open(out_path, 'w') as f:
                    f.write(self._compress().encode('utf-8'))

            # See "fab render"
            g.compiled_includes.append(out_path)

            markup = Markup(self.tag_string % self._relativize_path(path))
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
    def __init__(self):
        Includer.__init__(self)

        self.tag_string = '<script type="text/javascript" src="%s"></script>'

    def _compress(self):
        output = []
        src_paths = []

        for src in self.includes:
            src_paths.append('www/%s' % src)

            with open('www/%s' % src) as f:
                print '- compressing %s' % src
                output.append(minify(f.read().encode('utf-8')))

        context = make_context()
        context['paths'] = src_paths

        header = render_template('_js_header.js', **context)
        output.insert(0, header)

        return '\n'.join(output)

class CSSIncluder(Includer):
    """
    Psuedo-template tag that handles collecting CSS and serving appropriate clean or compressed versions.
    """
    def __init__(self):
        Includer.__init__(self)

        self.tag_string = '<link rel="stylesheet" type="text/css" href="%s" />'

    def _compress(self):
        output = []

        src_paths = []

        for src in self.includes:

            if src.endswith('less'):
                src_paths.append('%s' % src)
                src = src.replace('less', 'css') # less/example.less -> css/example.css
                src = '%s.less.css' % src[:-4]   # css/example.css -> css/example.less.css
            else:
                src_paths.append('www/%s' % src)

            with open('www/%s' % src) as f:
                print '- compressing %s' % src
                output.append(cssmin(f.read().encode('utf-8')))

        context = make_context()
        context['paths'] = src_paths

        header = render_template('_css_header.css', **context)
        output.insert(0, header)


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

def make_context():
    """
    Create a base-context for rendering views.
    Includes app_config and JS/CSS includers.
    """
    context = flatten_app_config()

    context['JS'] = JavascriptIncluder()
    context['CSS'] = CSSIncluder()

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

@contextfunction
def render_with_context(context, text):
    template = Template(text.__unicode__())
    return template.render(**context)
