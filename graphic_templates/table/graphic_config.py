#!/usr/bin/env python

import locale
locale.setlocale(locale.LC_ALL, 'en_US')

COPY_GOOGLE_DOC_KEY = '1ujVbcv3k6FtbzsjBTR-ZaacpmhmPEMFd66egC-dR3OA'

USE_ASSETS = False

# Use these variables to override the default cache timeouts for this graphic
# DEFAULT_MAX_AGE = 20
# ASSETS_MAX_AGE = 300

def comma_format(value):
    return locale.format('%d', float(value), grouping=True)

JINJA_FILTER_FUNCTIONS = [
    comma_format
]
