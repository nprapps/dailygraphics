Pym Vulnerability Scripts
=========================

* [What is this?](#what-is-this)
* [Assumptions](#assumptions)
* [Run project](#run-project)

What is this?
-------------

A collection of scripts to automate fixing old graphics that were impacted by the [Pym security vulnerability](http://blog.apps.npr.org/2018/02/15/pym-security-vulnerability.html)


Assumptions
-----------

* You are working inside the dailygraphics virtualenv, read [here](../README.md#bootstrap-the-project) to learn how to do that.
* GNU make (`brew install make` and check caveats)
* You have GNU Parallel installed -- a shell tool to execute multiple commands from standard input simultaneously. (`brew install parallel` and check caveats)


Run Project
-----------

This bundle consists in a series of tasks that would allow us to first search for impacted graphics, replace old pym versions with the new patch version and finally link to the CDN version of pym.js to avoid future situations like the one we faced in February 2018.

All the tasks have been added to a `Makefile`. Here is an overview of what is available:
* `search_local_pym`: searches recursively or a local pym reference
  * INPUT: Root path relative to the dailygraphics root folder
* `search_pym_oldcode`: searches recursively for the old API for Pym (version 0.1.1 and older)
  * INPUT: Root path relative to the dailygraphics root folder
* `patch_local_pym`: Patches the local pym.js file found in old graphics with the patched version (1.3.2). 
  * INPUT: List of graphics folders relative to the dailygraphics root folder (**no trailing slash**)
* `replace_pym_oldcode`: Replaces old Pym API call with new Pym API call on child
  * INPUT: List of files that need replacement relative to the dailygraphics root folder
* `replace_pym_push_cdn`: Replaces push JS statement pym line with the CDN external script
  * INPUT: List of files that need replacement relative to the dailygraphics root folder
* `replace_pym_script_cdn`: Replaces old external pym script with CDN version
  * INPUT: List of files that need replacement relative to the dailygraphics root folder
* `republish_staging`: Bulk republish to staging environment
  * INPUT: List of graphics folders relative to the dailygraphics root folder (**no trailing slash**)
* `republish_production`: Bulk republish to staging environment
  * INPUT: List of graphics folders relative to the dailygraphics root folder (**no trailing slash**)
* `clean`: Clears all input and output files to start the process fresh again
  * INPUT: None

In terms of ordering of these tasks:

1. Search for ocurrences of old local pym and old pym code 
2. Clean up the results to obtain a list of files or graphics folders that need to be modified
3. Run the replacement scripts
4. Verify results
5. Republish to staging
6. Republish to production
 
* In order to run any of those tasks **first check that you already have the required input by reading the Makefile dependencies** and then run it like this from the dailygraphics root folder:


### Notes

* We have removed the assets synchronization from the deployment process since we want to do this in bulk and not be asked for sync confirmation (assets should not be impacted by pym.js vulnerability)
* We have added a more verbose oauth process with google drive to be able to check what spreadsheet keys are causing problems.
* It is important that for the `republish` processes and the `patch_local_pym` the input file points to paths to graphics inside graphics archive relative to the dailygraphics folder **without trailing slashes**