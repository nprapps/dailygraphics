#!/bin/bash

ls ../graphics | parallel scripts/republish.sh staging {}
