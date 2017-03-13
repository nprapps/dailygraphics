#!/usr/bin/env python
# _*_ coding:utf-8 _*_
import os
import logging

"""
Logging
"""
LOG_FORMAT = '%(levelname)s:%(name)s:%(asctime)s: %(message)s'
LOG_LEVEL = logging.INFO

# GLOBAL SETTINGS
cwd = os.path.dirname(__file__)
logging.basicConfig(format=LOG_FORMAT)
logger = logging.getLogger(__name__)
logger.setLevel(LOG_LEVEL)
EXCLUDE_FOLDERS = ['js', 'assets', 'css', 'data', 'lib']
GRAPHIC_SOURCEFILES = ['child.html', 'index.html', 'graphic_config.py',
                       'base_template.html', 'child_template.html']


def run():
    """
    Get all the paths for the slugs inside graphics-archive
    """
    # Input path relative to this python file
    input_path = os.path.join(cwd, '../../graphics-archive')
    # dailygraphics path relative to this python file
    dailygraphics_path = os.path.join(cwd, '../')
    logger.info('input_path: %s' % input_path)
    logger.info('dailygraphics_path: %s' % dailygraphics_path)
    archive_graphics_paths = []
    for base, dirs, files in os.walk(input_path):
        # Exclude folders in-place
        dirs[:] = [d for d in dirs if d not in EXCLUDE_FOLDERS]
        for file in files:
            # If we find any of these files we assume it is a graphic
            if file in GRAPHIC_SOURCEFILES:
                # Calculate the relative path between the base of the file
                # and the dailygraphics root folder
                path = os.path.relpath(base, dailygraphics_path)
                if path not in archive_graphics_paths:
                    logger.info('adding archive graphic %s' % path)
                    archive_graphics_paths.append(path)
    # logger.info(archive_graphics_paths)
    # Add a newline at the end of each path to write to a file
    content = [path + '\n' for path in archive_graphics_paths]
    with open('archive_graphics_paths.csv', 'w') as writefile:
        writefile.writelines(content)


if __name__ == '__main__':
    run()
