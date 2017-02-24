#!/bin/bash

fab $1 deploy:$2

 find ../graphics \( ! -name "*.*" ! -name "*_*" \) -maxdepth 1 -mindepth 1 -type d -exec basename {} \; >scripts/dir.csv
 cat scripts/dir.csv | while read line; do fab staging deploy:$line; done
