#!/bin/bash

find $1 -type f \( -name "*.js" -a -not \( -name "graphic-footer.js" -o -name "graphic-header.js" \) \) -not \( -path "*/lib/*" -o -path '*/\.*' -o -path '*/_*' \) -exec sed -E -i.bak "s/sendHeightToParent/sendHeight/g" {} \;