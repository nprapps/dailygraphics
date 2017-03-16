#!/usr/bin/env python
# _*_ coding:utf-8 _*_
import os
import logging
import datetime
import re
import time
from fabric.api import task, require
from fabric.state import env
import utils
import app_config
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.common.exceptions import TimeoutException

"""
Logging
"""
LOG_FORMAT = '%(levelname)s:%(name)s:%(asctime)s: %(message)s'
LOG_LEVEL = logging.INFO

# GLOBAL SETTINGS
cwd = os.path.dirname(__file__)
logging.basicConfig(format=LOG_FORMAT)
logger = logging.getLogger(__name__)
logger.setLevel(LOG_LEVEL)
RESET_SCRIPT = "window.pymParent = undefined; " \
    "window.SELENIUM_TEST_PYM_HEIGHT = false;"
CHECK_PYM_SCRIPT = "return typeof window.pymParent !== 'undefined';"
COMUNICATION_SCRIPT = "window.pymParent.onMessage('height', function(e) { " \
    "window.SELENIUM_TEST_PYM_HEIGHT = true;}, false); " \
    "window.pymParent.sendWidth();"
VALIDATION_SCRIPT = 'return window.SELENIUM_TEST_PYM_HEIGHT;'


@task(default=True)
def test(*paths):
    """
    Test one or multiple graphics looking for browser warnings and errors
    Using selenium & chrome webdriver
    """
    if paths[0] == '':
        print 'You must specify at least one path, like this: "test:slug" or "test:path,path"'
        return

    for path in paths:
        test_single(path)

@task
def test_single(path):
    """
    Test a graphic looking for browser warnings and errors
    Using selenium & chrome webdriver
    """
    log_content = []
    require('settings', provided_by=['production', 'staging'])
    slug, abspath = utils.parse_path(path)
    # Need to explicitly point to index.html for the AWS staging link
    file_suffix = ''
    if env.settings == 'staging':
        file_suffix = 'index.html'
    url = '%s/graphics/%s/%s' % (app_config.S3_BASE_URL, slug, file_suffix)
    logger.info('url: %s' % url)
    OUTPUT_PATH = os.path.join(cwd, '../test')
    # Create output files folder if needed
    if not os.path.exists(OUTPUT_PATH):
        os.makedirs(OUTPUT_PATH)
    d = DesiredCapabilities.CHROME.copy()
    d['loggingPrefs'] = {'browser': 'ALL'}
    driver = webdriver.Chrome(desired_capabilities=d)
    try:
        driver.execute_script(RESET_SCRIPT)
        driver.get(url)
        # Wait for pym to be loaded
        # Execute a script that listens to the child message
        # and sets a global variable on the browser's window
        # Then make an explicit wait until the global var is set to true
        WebDriverWait(driver, app_config.TEST_SCRIPTS_TIMEOUT).until(
            lambda driver: driver.execute_script(CHECK_PYM_SCRIPT)
        )
        # Wait a configurable time for the page to load
        time.sleep(app_config.TESTS_LOAD_WAIT_TIME)
        # Force Pym Message communication
        driver.execute_script(COMUNICATION_SCRIPT)
        WebDriverWait(driver, app_config.TEST_SCRIPTS_TIMEOUT).until(
            lambda driver: driver.execute_script(VALIDATION_SCRIPT)
        )
        log = driver.get_log('browser')
        if not log:
            logger.info("Test was successful. Screenshot in test folder")
        else:
            for entry in log:
                line = '%s - %s\n' % (entry['level'], entry['message'])
                log_content.append(line)
                if entry['level'] == 'ERROR':
                    logger.error("Reason %s" % entry['message'])
                elif entry['level'] == 'WARNING':
                    logger.warning("Reason %s" % entry['message'])
                else:
                    logger.info("Found some console.log output %s" % (
                        entry['message']))
    except TimeoutException:
        logger.warning("%s - Test did Timeout. Check log" % (slug))
        line = '%s - %s\n' % ('ERROR', 'Test did Timeout')
        log_content.append(line)
    finally:
        driver.save_screenshot('%s/%s-%s.png' % (OUTPUT_PATH,
                                                 env.settings,
                                                 slug))
        driver.quit()
        if log_content:
            with open('%s/%s-%s.log' % (OUTPUT_PATH,
                                        env.settings,
                                        slug), 'w') as writefile:
                writefile.writelines(log_content)


@task
def bulk_test(csvpath):
    """
    Test graphics browser warnings & errors -- use batch for multiple graphics
    Using selenium & chrome webdriver
    """
    # Assume that a filepath is given read contents and clean them
    with open(csvpath, 'r') as f:
        content = f.readlines()
    content = [x.strip() for x in content]
    # Timestamp of the test
    ts = re.sub(r'\..*', '', str(datetime.datetime.now()))
    ts = re.sub(r'\s', '_', ts)
    log_content = []
    OUTPUT_PATH = os.path.join(cwd, '../test/%s' % ts)
    # Create output files folder if needed
    if not os.path.exists(OUTPUT_PATH):
        os.makedirs(OUTPUT_PATH)
    d = DesiredCapabilities.CHROME.copy()
    d['loggingPrefs'] = {'browser': 'ALL'}
    driver = webdriver.Chrome(desired_capabilities=d)
    try:
        for item in content:
            if re.match(r'^https?://', item):
                slug = item
                url = item
            else:
                require('settings', provided_by=['production', 'staging'])
                slug, _ = utils.parse_path(item)
                # Need to explicitly point to index.html
                # for the AWS staging link
                file_suffix = ''
                if env.settings == 'staging':
                    file_suffix = 'index.html'
                url = '%s/graphics/%s/%s' % (app_config.S3_BASE_URL,
                                             slug, file_suffix)
            logger.info('url: %s' % url)

            try:
                driver.execute_script(RESET_SCRIPT)
                driver.get(url)
                # Wait for pym to be loaded
                # Execute a script that listens to the child message
                # and sets a global variable on the browser's window
                # Then make an explicit wait until global var is set to true
                WebDriverWait(driver, app_config.TEST_SCRIPTS_TIMEOUT).until(
                    lambda driver: driver.execute_script(CHECK_PYM_SCRIPT)
                )
                # Wait a configurable time for the page to load
                time.sleep(app_config.TESTS_LOAD_WAIT_TIME)
                # Force Pym Message communication
                driver.execute_script(COMUNICATION_SCRIPT)
                WebDriverWait(driver, app_config.TEST_SCRIPTS_TIMEOUT).until(
                    lambda driver: driver.execute_script(VALIDATION_SCRIPT)
                )

                # Get browser log and parse output
                log = driver.get_log('browser')
                if not log:
                    logger.info("%s - Test successful. Screenshot saved" % (
                        slug))
                else:
                    logger.warning("%s - Test found issues. Check log" % (
                        slug))
                    for entry in log:
                        line = '%s,%s,"%s"\n' % (slug,
                                                 entry['level'],
                                                 entry['message'])
                        log_content.append(line)
            except TimeoutException:
                logger.warning("%s - Test did Timeout. Check log" % (slug))
                line = '%s,%s,"%s"\n' % (slug, 'ERROR', 'Test did Timeout')
                log_content.append(line)
            finally:
                # Save screenshot
                driver.save_screenshot('%s/%s-%s.png' % (OUTPUT_PATH,
                                                         env.settings,
                                                         slug))
    finally:
        driver.quit()
        if log_content:
            with open('%s/test.log' % OUTPUT_PATH, 'w') as writefile:
                writefile.writelines(log_content)
