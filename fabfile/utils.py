#!/usr/bin/env python

import boto
from boto.s3.connection import OrdinaryCallingFormat
from fabric.api import prompt
from distutils.util import strtobool
# Temporary folders
import tempfile
import contextlib
import shutil


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


def prep_bool_arg(arg):
    return bool(strtobool(str(arg)))


@contextlib.contextmanager
def temporary_directory(*args, **kwargs):
    """
    Create a temporary dir with context manager
    - removes the folder at the end
    - usage: with utils.temporary_directory() as temp_dir:
                 # do work
    """
    d = tempfile.mkdtemp(*args, **kwargs)
    try:
        yield d
    finally:
        shutil.rmtree(d)
