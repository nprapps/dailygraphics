#!/usr/bin/env python

"""
Project-wide application configuration.
"""

import os

"""
NAMES
"""
# Project name in urls
# Use dashes, not underscores!
PROJECT_SLUG = 'dailygraphics'

# Slug for assets dir on S3
ASSETS_SLUG = PROJECT_SLUG

# The name of the repository containing the source
REPOSITORY_NAME = 'dailygraphics'
REPOSITORY_URL = 'git@github.com:stlpublicradio/%s.git' % REPOSITORY_NAME
# REPOSITORY_ALT_URL = None # 'git@bitbucket.org:nprapps/%s.git' % REPOSITORY_NAME'

# Path to the folder containing the graphics
GRAPHICS_PATH = os.path.abspath('../graphics')

"""
DEPLOYMENT
"""
PRODUCTION_S3_BUCKETS = ['stlpr-prod.s3-website-us-east-1.amazonaws.com']
STAGING_S3_BUCKETS = ['stlpr-stg.s3-website-us-east-1.amazonaws.com']
ASSETS_S3_BUCKET = 'stlpr-assets.s3-website-us-east-1.amazonaws.com'

# These variables will be set at runtime. See configure_targets() below
S3_BUCKETS = []
S3_BASE_URL = ''
DEBUG = True

def configure_targets(deployment_target):
    """
    Configure deployment targets. Abstracted so this can be
    overriden for rendering before deployment.
    """
    global S3_BUCKETS
    global S3_BASE_URL
    global DEBUG
    global DEPLOYMENT_TARGET

    if deployment_target == 'production':
        S3_BUCKETS = PRODUCTION_S3_BUCKETS
        S3_BASE_URL = 'http://%s/%s' % (S3_BUCKETS[0], PROJECT_SLUG)
        DEBUG = False
    elif deployment_target == 'staging':
        S3_BUCKETS = STAGING_S3_BUCKETS
        S3_BASE_URL = 'http://%s/%s' % (S3_BUCKETS[0], PROJECT_SLUG)
        DEBUG = True
    else:
        S3_BUCKETS = []
        S3_BASE_URL = 'http://127.0.0.1:8000'
        DEBUG = True

    DEPLOYMENT_TARGET = deployment_target

"""
Run automated configuration
"""
DEPLOYMENT_TARGET = os.environ.get('DEPLOYMENT_TARGET', None)

configure_targets(DEPLOYMENT_TARGET)

