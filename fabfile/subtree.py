#!/usr/bin/env python
from __future__ import with_statement
import os
from fabric.api import task, local, lcd, settings, hide
from fabric.utils import abort
from fabric.state import env

import app
import app_config
import utils
from data import download_copy


@task(default=True)
def make_subtree(slug, repository_name=None,
                 github_username=app_config.GITHUB_USERNAME,
                 branch='master'):
    """
    Create external repo given a graphic slug
    - Useful is we want to opensource it or work separatedly
    - Could be used with git subtree or git submodules
    """

    # PATHS
    # Dailygraphics path
    dailygraphics_path = os.getcwd()

    _validate_slug(slug)

    config_files = ' '.join(['README.md'])
    config = {}
    config['$REPOSITORY_NAME'] = repository_name or slug

    utils.confirm("Have you created a Github repository named \"%s\"?" %
                  (config['$REPOSITORY_NAME']))

    # Start fresh
    _reset_subtree_remote(slug, config['$REPOSITORY_NAME'], github_username)

    # Bake html and css to allow to execute locally in external repo
    download_copy(slug)
    _fake_render(slug)

    # Create an ad-hoc branch for this process
    with utils.temporary_directory(dir=dailygraphics_path) as temp_dir:
        with lcd(app_config.GRAPHICS_PATH):
            # Backup graphic files including baked html and css
            local('cp -r %s/* %s' % (slug, temp_dir))

            # Update master branch from remote
            local('git checkout %s' % (branch))
            with settings(hide('everything'), warn_only=True):
                local('git branch -D subtree-br-%s' % (slug))
                local('git pull origin %s' % (branch))
            # checkout topic subtree branch
            local('git checkout -b subtree-br-%s' % (slug))

            # filter asscociated commits
            local('git filter-branch -f --subdirectory-filter %s' % (slug))

            # Add README, LICENSE AND .gitignore
            local('cp %s/GRAPHIC_README.md README.md' % (dailygraphics_path))
            local('cp %s/GRAPHIC_LICENSE LICENSE' % (dailygraphics_path))
            local('cp %s/GRAPHIC_GITIGNORE .gitignore' % (dailygraphics_path))
            # Replace template vars in README
            for k, v in config.items():
                local('sed -i "" \'s|%s|%s|g\' %s' % (k, v, config_files))

            # commit copied template files
            local('git add README.md LICENSE .gitignore')
            local('git commit -m "Add LICENSE, README, .gitignore"')

            # restore backed up baked html, css and assets
            local('cp %s/index.html index.html' % (temp_dir))
            local('cp %s/css/graphic-header.css css/graphic-header.css' %
                  (temp_dir))
            local('cp -r %s/assets/* assets' % (temp_dir))
            # Force add baked html and css to be able to execute locally
            local('git add index.html')
            local('git add css/graphic-header.css')
            local('git add assets/.')
            local('git commit -m "Add local execution baked files"')

            # Push to external repo
            local('git push -u subtree-%(slug)s subtree-br-%(slug)s:master' %
                  {'slug': slug})

            # Return to previous branch and delete subtree branch
            local('git checkout %s' % (branch))
            local('git branch -D subtree-br-%s' % (slug))

    # Wrapping up, cleanup time
    _clean_subtree_remote(slug, warn=False)


@task
def merge_from_subtree_helper(slug, repository_name=None,
                              github_username=app_config.GITHUB_USERNAME,
                              branch='master'):
    """
    Merge subtree from external repo into graphics branch
    - branch defaults to master
    """

    _validate_slug(slug)

    repository_name = repository_name or slug

    # Start fresh
    _reset_subtree_remote(slug, repository_name, github_username)

    with lcd(app_config.GRAPHICS_PATH):
        # Update master branch from remote
        local('git checkout %s' % (branch))
        with settings(hide('everything'), warn_only=True):
            local('git pull origin %s' % (branch))
        # fetch from subtree topic remote
        local('git fetch subtree-%s' % (slug))

        # Remove untracked files that may cause an error
        # in order to be overwritten from external repo
        local('git clean -dfx %s' % (slug))
        # Merge changes specifying directory
        # via: http://bit.ly/29EZRe5
        local('git merge -X subtree=%(slug)s --squash subtree-%(slug)s/master'
              % {'slug': slug})

    # Wrapping up, cleanup time
    _clean_subtree_remote(slug)


@task
def merge_to_subtree_helper(slug, repository_name=None,
                            github_username=app_config.GITHUB_USERNAME,
                            branch='master'):
    """
    Merge from graphics branch to subtree external repo
    - branch defaults to master
    """

    _validate_slug(slug)

    repository_name = repository_name or slug

    # Start fresh
    _reset_subtree_remote(slug, repository_name, github_username)

    # Create an ad-hoc branch for this process
    with lcd(app_config.GRAPHICS_PATH):
        # fetch from subtree topic remote
        local('git fetch subtree-%s' % (slug))
        # remove existing destination branch and pull
        with settings(hide('everything'), warn_only=True):
                local('git branch -D subtree-br-%s' % (slug))
                local('git pull origin %s' % (branch))
        # checkout topic subtree branch
        local('git checkout -b subtree-br-%(slug)s subtree-%(slug)s/master' %
              {'slug': slug})

        # merge graphics branch
        # via: http://bit.ly/29EZRe5
        local('git merge -X subtree=%s --squash %s' % (slug, branch))
        # local('git merge -s subtree --squash %s' % (branch))


def _clean_subtree_resources(slug, branch='master'):
    """
    Cleanup topic subtree remote and branch
    - branch to move to before deleting
      the subtree topic branch (defaults to master)
    """

    with lcd(app_config.GRAPHICS_PATH):
        local('git checkout %s' % (branch))

    _validate_slug(slug)

    with settings(lcd(app_config.GRAPHICS_PATH), hide('everything'),
                  warn_only=True):

        local('git branch -D subtree-br-%s' % (slug))
        local('git remote rm subtree-%s' % (slug))


def _validate_slug(slug):
    """
    Validate that the slug is an actual folder in graphics
    """
    # Actual graphic path
    graphic_slug_path = os.path.join(app_config.GRAPHICS_PATH, slug)

    if not slug:
        abort('This fabric task needs at least a graphic slug as input')
    elif not os.path.isdir(graphic_slug_path):
        abort('Could not find %s as a valid graphic slug' % (slug))


def _clean_subtree_remote(slug, warn=True):
    """
    Cleanup topic subtree remote
    """

    # Create an ad-hoc branch for this process
    if warn:
        with settings(lcd(app_config.GRAPHICS_PATH), hide('everything'),
                      warn_only=True):
            # Make sure there are no subtree branch nor remote for given slug
            local('git remote rm subtree-%s' % (slug))
    else:
        with lcd(app_config.GRAPHICS_PATH):
            # Make sure there are no subtree branch nor remote for given slug
            local('git remote rm subtree-%s' % (slug))


def _reset_subtree_remote(slug, repo=None, user=app_config.GITHUB_USERNAME):
    """
    Reset topic subtree remote
    """

    # make sure nothing is there at the beginnig
    _clean_subtree_remote(slug)

    # checkout topic subtree branch
    with lcd(app_config.GRAPHICS_PATH):
        remoteurl = 'git@github.com:%s/%s.git' % (user, repo)
        # Add topic subtree remote
        local('git remote add subtree-%s %s' % (slug, remoteurl))


def _fake_render(slug):
    """
    Fake render graphic to generate local index for subtree repo
    """
    from flask import g

    # Fake out deployment target
    app_config.configure_targets(env.get('settings', None))

    path = '%s/%s' % (app_config.GRAPHICS_PATH, slug)

    with app.app.test_request_context(path='graphics/%s/child.html' %
                                      slug):
        g.compile_includes = False
        g.compiled_includes = {}
        g.force_compile_less = True

        view = app.graphic.__dict__['_graphics_child']
        content = view(slug).data

    # generate a baked index html to be able to execute locally
    with open('%s/index.html' % path, 'w') as writefile:
        writefile.write(content)

    # Un-fake-out deployment target
    app_config.configure_targets(app_config.DEPLOYMENT_TARGET)
