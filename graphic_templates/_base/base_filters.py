#!/usr/bin/env python

import locale
import re

locale.setlocale(locale.LC_ALL, 'en_US')

MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
AP_MONTHS = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.']
ORDINAL_SUFFIXES = { 1: 'st', 2: 'nd', 3: 'rd' }

USPS_TO_AP_STATE = {
	'AL': 'Ala.',
	'AK': 'Alaska',
	'AR': 'Ark.',
	'AZ': 'Ariz.',
	'CA': 'Calif.',
	'CO': 'Colo.',
	'CT': 'Conn.',
	'DC': 'D.C.',
	'DE': 'Del.',
	'FL': 'Fla.',
	'GA': 'Ga.',
	'HI': 'Hawaii',
	'IA': 'Iowa',
	'ID': 'Idaho',
	'IL': 'Ill.',
	'IN': 'Ind.',
	'KS': 'Kan.',
	'KY': 'Ky.',
	'LA': 'La.',
	'MA': 'Mass.',
	'MD': 'Md.',
	'ME': 'Maine',
	'MI': 'Mich.',
	'MN': 'Minn.',
	'MO': 'Mo.',
	'MS': 'Miss.',
	'MT': 'Mont.',
	'NC': 'N.C.',
	'ND': 'N.D.',
	'NE': 'Neb.',
	'NH': 'N.H.',
	'NJ': 'N.J.',
	'NM': 'N.M.',
	'NV': 'Nev.',
	'NY': 'N.Y.',
	'OH': 'Ohio',
	'OK': 'Okla.',
	'OR': 'Ore.',
	'PA': 'Pa.',
    'PR': 'P.R.',
	'RI': 'R.I.',
	'SC': 'S.C.',
	'SD': 'S.D.',
	'TN': 'Tenn.',
	'TX': 'Texas',
	'UT': 'Utah',
	'VA': 'Va.',
	'VT': 'Vt.',
	'WA': 'Wash.',
	'WI': 'Wis.',
	'WV': 'W.Va.',
	'WY': 'Wyo.'
}

def classify(text):
	"""
	Convert arbitrary strings to valid css classes.

	NOTE: This implementation must be consistent with the Javascript classify
	function defined in base.js.
	"""
	text = unicode(text)					# Always start with unicode
	text = text.encode('ascii', 'ignore')	# Convert to ascii
	text = text.lower()						# Lowercase
	text = re.sub('\s+', '-', text)         # Replace spaces with -
	text = re.sub('[^\w\-]+', '', text)     # Remove all non-word chars
	text = re.sub('\-\-+', '-', text)       # Replace multiple - with single -
	text = re.sub('^-+', '', text)          # Trim - from start of text
	text = re.sub('-+$', '', text)          # Trim - from end of text

	return text

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

def ap_month(month):
    """
    Convert a month name into AP abbreviated style.
    """
    i = months.index(month)

    return AP_MONTHS[int(month) - 1]

def ap_date(value):
    """
    Converts a date string in m/d/yyyy format into AP style.
    """
    if not value:
        return ''

    bits = unicode(value).split('/')

    month, day, year = bits

    output = AP_MONTHS[int(month) - 1]
    output += ' ' + unicode(int(day))
    output += ', ' + year

    return output

def ap_state(usps):
    """
    Convert a USPS state abbreviation into AP style.
    """
    return USPS_TO_AP_STATE[unicode(usps)]

FILTERS = [
    classify,
    comma,
    ordinal,
    ap_month,
    ap_date,
    ap_state
]
