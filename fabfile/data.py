#!/usr/bin/env python
import os
from oauth import get_document
from render_utils import load_graphic_config

import app_config


def download_copy(slug):
    """
    Downloads a Google Doc as an .xlsx file.
    """
    graphic_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)

    try:
        graphic_config = load_graphic_config(graphic_path)
    except IOError:
        print '%s/graphic_config.py does not exist.' % slug
        return

    if not hasattr(graphic_config, 'COPY_GOOGLE_DOC_KEY') or not graphic_config.COPY_GOOGLE_DOC_KEY:
        print 'COPY_GOOGLE_DOC_KEY is not defined in %s/graphic_config.py.' % slug
        return

    copy_path = os.path.join(graphic_path, '%s.xlsx' % slug)
    get_document(graphic_config.COPY_GOOGLE_DOC_KEY, copy_path)
