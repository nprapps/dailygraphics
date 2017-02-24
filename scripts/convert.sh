#!/bin/bash

 find ../graphics -type f \( -name "*.html" -o -name "*.js" -o -name "*.less" -o -name "*.css" \) -not -path "*/lib/*" -exec sed -E -i.bak  "s/http:\/\/([A-Za-z0-9._-]*npr.org)/https:\/\/\1/g" {} \;

cd ../graphics

git clean -d -f

git commit -a -m "https all the things"

cd ../dailygraphics
