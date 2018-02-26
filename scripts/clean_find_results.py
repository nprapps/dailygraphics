#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import sys
import errno
import re

# GLOBAL SETTINGS
regex = re.compile(r'\s')
FILTER_REGEX = {
    'script': r'\s+.*<script',
    'push': r'\s+.*\{\{\s*JS\.push'
}


def run(line_filter):
    """
    Parse stdin detecting the find sed output
    """
    found = False
    results = []
    f = None
    for row in sys.stdin:
        if regex.match(row):
            if line_filter:
                if line_filter.match(row):
                    found = True
            else:
                found = True
        else:
            if found:
                found = False
                results.append(f)
            f = row.rstrip()

    # Handle the found in last line case
    if found:
        results.append(f)

    # dump to stdout
    try:
        for result in results:
            sys.stdout.write('%s\n' % result)
        sys.stdout.flush()
    except IOError as e:
        if e.errno == errno.EPIPE:
            pass
        else:
            raise


if __name__ == '__main__':
    # Parse command-line arguments.
    parser = argparse.ArgumentParser(
        description="Extract & clean found entities from a previous search.")
    parser.add_argument(
        '-r', '--regex',
        help='Which regex to use')
    args = parser.parse_args()
    r = FILTER_REGEX.get(args.regex, None)
    line_filter = re.compile(r) if r else None
    run(line_filter)
