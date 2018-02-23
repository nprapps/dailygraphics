#!/bin/bash
gsed -E -i.bak "s/\s*\{\{\s*JS.push\('js\/lib\/pym.js'\)\s*\}\}\s*/<script type=\"text\/javascript\" src=\"https:\/\/pym.nprapps.org\/pym.v1.min.js\"><\/script>/g" "$1"