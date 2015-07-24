#!/usr/bin/env python

import locale
locale.setlocale(locale.LC_ALL, 'en_US')

ORDINAL_SUFFIXES = { 1: 'st', 2: 'nd', 3: 'rd' }

def comma(value):
    """
    Format a number with commas.
    """
    return locale.format('%d', float(value), grouping=True)

def ordinal(num):
    """
    Format a number as an ordinal.
    """
    num = int(num)

    if 10 <= num % 100 <= 20:
        suffix = 'th'
    else:
        suffix = ORDINAL_SUFFIXES.get(num % 10, 'th')

    return unicode(num) + suffix

FILTERS = [
    comma,
    ordinal
]
