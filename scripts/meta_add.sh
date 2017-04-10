#!/bin/bash
cat $1 | while read line
do
    gsed -i.bak '/charset=utf-8" \/>/a\ \ \ \ <meta name="robots" content="noindex" \/>' $line
done
