#!/bin/bash

find $1 -type f -name "child.html" -not \( -path "*/lib/*" -o -path '*/\.*' -o -path '*/_*' \)  -exec echo {} \; -exec sed -E -n "/name=['\"]robots['\"]/p" {} \; > scripts/meta_robots.csv
