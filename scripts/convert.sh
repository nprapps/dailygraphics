#!/bin/bash

find $1 -type f \( -name "*.html" -o \( -name "*.js" -a -not \( -name "graphic-footer.js" -o -name "graphic-header.js" \) \) -o -name "*.less" -o \( -name "*.css" -a -not -name "graphic-header.css" \) \) -not -path "*/lib/*" -exec sed -E -i.bak  "s/http:\/\/([A-Za-z0-9._-]*npr.org)/https:\/\/\1/g" {} \;

# cd $1

# git clean -d -f

# git commit -a -m "https all npr.org things"

# cd ../dailygraphics
