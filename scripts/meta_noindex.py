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
GRAPHIC_CHILD_HTML_FILES = ['base_template.html',
                            'child_template.html',
                            'child.html']


def run():
    """
    Check if what file needs to be changed for each graphic
    """
    INPUT_FILE = os.path.join(cwd, 'meta_robots.csv')
    OUTPUT_FILE = os.path.join(cwd, 'meta_files_change.txt')
    with open(OUTPUT_FILE, 'w') as fout:
        with open(INPUT_FILE, 'r') as f:
            lines = f.readlines()
            for line in lines:
                line = line.replace('\n','')
                for file in GRAPHIC_CHILD_HTML_FILES:
                    htmlpath = os.path.join(cwd, '../', line, file)
                    if os.path.exists(htmlpath):
                        fout.write('%s\n' % os.path.abspath(htmlpath))
                        break


if __name__ == '__main__':
    run()
