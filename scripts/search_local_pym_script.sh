#!/bin/bash

find $1 -type f \( -name "*.html" -o \( -name "*.js" -a -not \( -name "graphic-footer.js" -o -name "graphic-header.js" \) \) -o -name "*.less" -o \( -name "*.css" -a -not -name "graphic-header.css" \) \) -not \( -path "*/lib/*" -o -path '*/\.*' -o -path '*/_*' \)  -exec echo {} \; -exec sed -E -n "/src=[\"']js\/lib\/pym.js/p" {} \; > scripts/pym_test_references.csv
