#!/usr/bin/env python
# _*_ coding:utf-8 _*_
import os
import boto
from boto.s3.connection import OrdinaryCallingFormat
from fabric.api import prompt
from distutils.util import strtobool
import app_config


def confirm(message):
    """
    Verify a users intentions.
    """
    answer = prompt(message, default="Not at all")

    if answer.lower() not in ('y', 'yes', 'buzz off', 'screw you'):
        exit()


def replace_in_file(filename, find, replace):
    with open(filename, 'r') as f:
        contents = f.read()

    contents = contents.replace(find, replace)

    with open(filename, 'w') as f:
        f.write(contents)


def get_bucket(bucket_name):
    """
    Established a connection and gets s3 bucket
    """
    if '.' in bucket_name:
        s3 = boto.connect_s3(calling_format=OrdinaryCallingFormat())
    else:
        s3 = boto.connect_s3()

    return s3.get_bucket(bucket_name)


def parse_path(path):
    """
    Parse the path into abspath and slug
    """
    bits = path.split('/')
    if len(bits) > 1:
        slug = bits[-1]
        path = '/'.join(bits[:-1])
        abspath = os.path.abspath(path)
    else:
        slug = path
        abspath = app_config.GRAPHICS_PATH
    return slug, abspath


def prep_bool_arg(arg):
    """
    Util to parse fabric boolean args
    """
    return bool(strtobool(str(arg)))
