#!/bin/bash
cat $1 | while read line 
do
    gsed -E -i.bak "s/src=[\"']js\/lib\/pym.js[\"']/src=\"https:\/\/pym.nprapps.org\/pym.v1.min.js\"/g" "$line"
done