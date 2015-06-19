#!/usr/bin/env python

import os
import subprocess

from fabric.api import local, task

import app

@task(default=True)
def capture(slug):
    if not slug:
        print 'You must specify a project slug, like this: "deploy:slug"'
        return

    local('phantomjs capture.js %s' % slug)
