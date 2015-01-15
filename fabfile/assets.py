#!/usr/bin/env python

"""
Commands related to the syncing assets.
"""

from fnmatch import fnmatch
from glob import glob
import os

import boto
from fabric.api import prompt, task

import app_config
import utils

@task
def sync(slug):
    """
    Intelligently synchronize assets between S3 and local folder.
    """
    ignore_globs = []

    assets_root = '%s/%s/assets' % (app_config.GRAPHICS_PATH, slug)
    s3_root = '%s/%s' % (app_config.ASSETS_SLUG, slug)

    try:
        with open('%s/assetsignore' % assets_root, 'r') as f:
            ignore_globs = [l.strip() for l in f]
    except IOError:
        ignore_globs = []

    local_paths = []
    not_lowercase = []

    for local_path, subdirs, filenames in os.walk(assets_root):
        for name in filenames:
            full_path = os.path.join(local_path, name)
            glob_path = full_path.split(assets_root)[1].strip('/')

            ignore = False

            for ignore_glob in ignore_globs:
                if fnmatch(glob_path, ignore_glob):
                    ignore = True
                    break

            if ignore:
                print 'Ignoring: %s' % full_path
                continue

            if name.lower() != name:
                not_lowercase.append(full_path)

            local_paths.append(full_path)

    # Prevent case sensitivity differences between OSX and S3 from screwing us up
    if not_lowercase:
        print 'The following filenames are not lowercase, please change them before running `assets.sync`:'

        for name in not_lowercase:
            print '    %s' % name

        return

    bucket = _assets_get_bucket()
    keys = bucket.list(s3_root)

    which = None
    always = False

    for key in keys:
        download = False
        upload = False

        local_path = key.name.replace(s3_root, assets_root, 1)

        # Skip root key
        if local_path == '%s/' % assets_root:
            continue

        print local_path

        if local_path in local_paths:
            # A file can only exist once, this speeds up future checks
            # and provides a list of non-existing files when complete
            local_paths.remove(local_path)

            # We need an actual key, not a "list key"
            # http://stackoverflow.com/a/18981298/24608
            key = bucket.get_key(key.name)

            with open(local_path, 'rb') as f:
                local_md5 = key.compute_md5(f)[0]

            # Hashes are different
            if key.get_metadata('md5') != local_md5:
                if not always:
                    # Ask user which file to take
                    which, always = _assets_confirm(local_path)

                if not which:
                    print 'Cancelling!'

                    return

                if which == 'remote':
                    download = True
                elif which == 'local':
                    upload = True
        else:
            download = True

        if download:
            _assets_download(key, local_path)

        if upload:
            _assets_upload(local_path, key)

    action = None
    always = False

    # Iterate over files that didn't exist on S3
    for local_path in local_paths:
        key_name = local_path.replace(assets_root, s3_root, 1)
        key = bucket.get_key(key_name, validate=False)

        print local_path

        if not always:
            action, always = _assets_upload_confirm()

        if not action:
            print 'Cancelling!'

            return

        if action == 'upload':
            _assets_upload(local_path, key)
        elif action == 'delete':
            _assets_delete(local_path, key)

@task
def rm(path):
    """
    Remove an asset from s3 and locally
    """
    bucket = _assets_get_bucket()

    slug = path.split('/assets')[0]
    static_path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)
    assets_root = '%s/assets' % static_path
    real_path = '%s/%s' % (app_config.GRAPHICS_PATH, path)

    file_list = glob(real_path)

    found_folder = True

    # Add files in folders, instead of folders themselves (S3 doesn't have folders)
    while found_folder:
        found_folder = False

        for local_path in file_list:
            if os.path.isdir(local_path):
                found_folder = True

                file_list.remove(local_path)

                for path in os.listdir(local_path):
                    file_list.append(os.path.join(local_path, path))

    if len(file_list) > 0:
        utils.confirm("You are about to destroy %i files. Are you sure?" % len(file_list))

        for local_path in file_list:
            print local_path

            if os.path.isdir(local_path):
                file_list.extend(os.listdir(local_path))

                continue

            assets_slug = '%s/%s' % (app_config.ASSETS_SLUG, slug)
            key_name = local_path.replace(assets_root, assets_slug, 1)
            key = bucket.get_key(key_name)

            _assets_delete(local_path, key)

def _assets_get_bucket():
    """
    Get a reference to the assets bucket.
    """
    s3 = boto.connect_s3()

    return s3.get_bucket(app_config.ASSETS_S3_BUCKET['bucket_name'])

def _assets_confirm(local_path):
    """
    Check with user about whether to keep local or remote file.
    """
    print '--> This file has been changed locally and on S3.'
    answer = prompt('Take remote [r] Take local [l] Take all remote [ra] Take all local [la] cancel', default='c')

    if answer == 'r':
        return ('remote', False)
    elif answer == 'l':
        return ('local', False)
    elif answer == 'ra':
        return ('remote', True)
    elif answer == 'la':
        return ('local', True)

    return (None, False)

def _assets_upload_confirm():
    print '--> This file does not exist on S3.'
    answer = prompt('Upload local copy [u] Delete local copy [d] Upload all [ua] Delete all [da] cancel', default='c')

    if answer == 'u':
        return ('upload', False)
    elif answer == 'd':
        return ('delete', False)
    elif answer == 'ua':
        return ('upload', True)
    elif answer == 'da':
        return ('delete', True)

    return (None, False)

def _assets_download(s3_key, local_path):
    """
    Utility method to download a single asset from S3.
    """
    print '--> Downloading!'

    dirname = os.path.dirname(local_path)

    if not (os.path.exists(dirname)):
        os.makedirs(dirname)

    s3_key.get_contents_to_filename(local_path)

def _assets_upload(local_path, s3_key):
    """
    Utility method to upload a single asset to S3.
    """
    print '--> Uploading!'

    with open(local_path, 'rb') as f:
        local_md5 = s3_key.compute_md5(f)[0]

    s3_key.set_metadata('md5', local_md5)
    s3_key.set_contents_from_filename(local_path)

def _assets_delete(local_path, s3_key):
    """
    Utility method to delete assets both locally and remotely.
    """
    print '--> Deleting!'

    s3_key.delete()
    os.remove(local_path)
