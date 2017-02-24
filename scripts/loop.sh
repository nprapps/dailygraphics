#!/bin/bash

for f in ../graphics
do
    find ../graphics -maxdepth 1 -mindepth 1 -type d -exec echo {} \;

    cat ../graphics
done
