#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import re

# GLOBAL SETTINGS
parent_folder_regex = re.compile(r'\.\.|graphics-archive|2012 and earlier|\d{4}|\d{2}|misc')


def run():
    """
    Parse stdin detecting the find sed output
    """
    results = []

    for row in sys.stdin:
        bits = row.rstrip().split('/')
        for idx, bit in enumerate(bits):
            if parent_folder_regex.match(bit):
                continue
            else:
                break
        results.append('/'.join(bits[:idx+1]))

    # Dedupe
    results = list(sorted(set(results)))
    # dump to stdout
    for result in results:
        sys.stdout.write('%s\n' % result)


if __name__ == '__main__':
    run()
