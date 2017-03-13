#!/bin/bash
# cat $1 | parallel scripts/republish.sh $2 {}
cat $1 | while read line; do fab $2 deploy:$line; sleep 0.5; done
