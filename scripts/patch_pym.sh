#!/bin/bash
cat $1 | while read line 
do
    echo "$line"js/lib/pym.js
    cp scripts/pym-patched/pym.js "$line"js/lib/pym.js
done