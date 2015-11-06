#!/bin/bash

COUNT=`ls -l img/frames/*.jpg | wc -l`

montage -border 0 -geometry 1000x -tile $COUNT'x' -quality 80% img/frames/*.jpg img/filmstrip-1000.jpg
montage -border 0 -geometry 600x -tile $COUNT'x' -quality 70% img/frames/*.jpg img/filmstrip-600.jpg
montage -border 0 -geometry 375x -tile $COUNT'x' -quality 60% img/frames/*.jpg img/filmstrip-375.jpg
