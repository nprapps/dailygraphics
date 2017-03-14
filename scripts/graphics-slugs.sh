#!/bin/bash
find ../graphics \( ! -name "*.*" ! -name "*_*" \) -maxdepth 1 -mindepth 1 -type d -exec basename {} \; > scripts/graphics_slugs.csv
