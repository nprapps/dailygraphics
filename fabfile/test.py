#!/usr/bin/env python
# _*_ coding:utf-8 _*_
import os
import logging
import datetime
import re
from fabric.api import task, require
from fabric.state import env
import utils
import app_config
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

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
LISTENER_SCRIPT = "window.addEventListener('message', function(e) {" \
    "window.SELENIUM_TEST_PYM_HEIGHT = true;}, false);"
VALIDATION_SCRIPT = 'return window.SELENIUM_TEST_PYM_HEIGHT;'
CLEAR_SCRIPT = 'window.SELENIUM_TEST_PYM_HEIGHT = false;'


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
        driver.get(url)
        # Execute a script that listens to the child message
        # and sets a global variable on the browser's window
        # Then make an explicit wait until the global var is set to true
        driver.execute_script(LISTENER_SCRIPT)
        WebDriverWait(driver, 30).until(
            lambda driver: driver.execute_script(VALIDATION_SCRIPT)
        )
        driver.save_screenshot('%s/%s-%s.png' % (OUTPUT_PATH,
                                                 env.settings,
                                                 slug))
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
    finally:
        driver.quit()
        if log_content:
            with open('%s/%s-%s.log' % (OUTPUT_PATH,
                                        env.settings,
                                        slug), 'w') as writefile:
                writefile.writelines(log_content)


@task(default=True)
def test(path, batch=False):
    """
    Test graphics browser warnings & errors -- use batch for multiple graphics
    Using selenium & chrome webdriver
    """
    require('settings', provided_by=['production', 'staging'])
    batch = utils.prep_bool_arg(batch)
    logger.info(batch)
    if not batch:
        test_single(path)
        return
    # Assume that a filepath is given read contents and clean them
    with open(path, 'r') as f:
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
            logger.info(item)
            if re.match(r'^https?://', item):
                slug = item
                url = item
            else:
                slug, _ = utils.parse_path(item)
                # Need to explicitly point to index.html
                # for the AWS staging link
                file_suffix = ''
                if env.settings == 'staging':
                    file_suffix = 'index.html'
                url = '%s/graphics/%s/%s' % (app_config.S3_BASE_URL,
                                             slug, file_suffix)
            logger.info('url: %s' % url)
            driver.get(url)
            # Execute a script that listens to the child message
            # and sets a global variable on the browser's window
            # Then make an explicit wait until the global var is set to true
            driver.execute_script(LISTENER_SCRIPT)
            WebDriverWait(driver, 30).until(
                lambda driver: driver.execute_script(VALIDATION_SCRIPT)
            )
            driver.execute_script(CLEAR_SCRIPT)
            # Save screenshot
            driver.save_screenshot('%s/%s-%s.png' % (OUTPUT_PATH,
                                                     env.settings,
                                                     slug))
            # Get browser log and parse output
            log = driver.get_log('browser')
            if not log:
                logger.info("%s - Test was successful. Screenshot saved" % (
                    slug))
            else:
                logger.warning("%s - Test found some issues. Check log" % (
                    slug))
                for entry in log:
                    line = '%s,%s,"%s"\n' % (slug,
                                             entry['level'], entry['message'])
                    log_content.append(line)
    finally:
        driver.quit()
        if log_content:
            with open('%s/test.log' % OUTPUT_PATH, 'w') as writefile:
                writefile.writelines(log_content)
