#!/usr/bin/env python

"""
Commands to generate preview images.
"""

from fabric.api import local, task
from PIL import Image, ImageOps

import app_config

@task
def png(slug):
    """
    Use phantom + pillow to generate a preview image.
    """
    temp_path = '.temp.png'
    graphic_root = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    preview_path = '%s/preview.png' % graphic_root

    local('phantomjs preview.js %s %s' % (slug, temp_path))

    original = Image.open(temp_path)

    framed = ImageOps.expand(original, border=4, fill='white')
    framed.save(preview_path)
