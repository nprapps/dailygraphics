Utilities for HTTPS migration
=============================

_Note: We have found that sed command on macOS inserts newlines even for non-matched files, to solve this install gnu-sed with homebrew

```
$ brew install gnu-sed
```

Convert HTTP to HTTPS
---------------------

`convert.sh` is a shell script that accepts a relative path to the dailygraphics repo, iterates recursively on the path folders and files and substitutes all occurrences of `http://*npr.org` with its equivalent `https://*npr.org`

It creates a `.bak` extension of each file while looping over them. That extension has been git ignored on the `graphics` and ` graphics-archive` repos.

```
$ cd dailygraphics
$ ./scripts/convert.sh $PATH
```

Where `$PATH` is the relative path from the `dailygraphics` repo root folder.

For example for `graphics`:

```
$ cd dailygraphics
$ ./scripts/convert.sh ../graphics
```

List all slugs on Graphics
--------------------------

`graphics-slugs.sh` generates a csv file named `graphics-slugs.csv` inside the `scripts` folder with all the slugs available at a given moment on the `graphics` repo.

```
$ cd dailygraphics
$ ./scripts/graphics-slugs.sh
```

List all paths on graphics-archive
----------------------------------

`archive-slugs.py` generates a csv file named `archive_graphics_paths.csv` inside the `scripts` folder with all the slugs available at a given moment on the `graphics-archive` repo.

```
$ cd dailygraphics
$ python scripts/archive-slugs.py
```

Republish to S3
---------------

After searching and replacing all http references using the above mentioned `convert.sh` script and generating the list of the paths and slugs from our `graphics` and `graphics-archive` repos. We are ready to re-render and re-deploy all those graphics to S3.

We will use `republish-all.sh` to do so. This shell script accepts two arguments:
* $CSV_PATH: the path to the csv file with the list of `slugs` or `paths` to re-deploy
* $DEPLOYMENT_TARGET: the target environment where we are going to re-deploy (`staging` or `production`)

```
$ cd dailygraphics
$ ./scripts/republish-all.sh $CSV_PATH $DEPLOYMENT_TARGET
```

For example for `graphics-archive` and `staging`:

```
$ cd dailygraphics
$ ./scripts/republish-all.sh scripts/archive_graphics_path.csv staging
```
