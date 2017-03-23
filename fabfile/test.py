#!/usr/bin/env python
# _*_ coding:utf-8 _*_
import os
import logging
import datetime
import re
import time
import csv
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
COMUNICATION_SCRIPT = "if (typeof window.pymParent !== 'undefined' && typeof window.pymParent.onMessage === 'function') { " \
    "window.pymParent.onMessage('height', function(e) { " \
    "window.SELENIUM_TEST_PYM_HEIGHT = true;}, false); " \
    "window.pymParent.sendWidth(); }" \
    "else { window.SELENIUM_TEST_PYM_HEIGHT = true;}"
VALIDATION_SCRIPT = 'return window.SELENIUM_TEST_PYM_HEIGHT;'


def safe_unicode(obj, * args):
    """ return the unicode representation of obj """
    try:
        return unicode(obj, * args)
    except UnicodeDecodeError:
        # obj is byte string
        ascii_text = str(obj).encode('string_escape')
        return unicode(ascii_text)


def safe_str(obj):
    """ return the byte string representation of obj """
    try:
        return str(obj)
    except UnicodeEncodeError:
        # obj is unicode
        return unicode(obj).encode('unicode_escape')


def _choose_web_driver(use):
    """
    Choose the webdriver to use
    """
    driver = None
    if use.lower() == 'phantom':
        logger.info("Phantomjs webdriver selected")
        driver = webdriver.PhantomJS()
        driver.set_window_size(1280, 1024)
    else:
        logger.info("Chrome webdriver selected")
        d = DesiredCapabilities.CHROME.copy()
        d['loggingPrefs'] = {'browser': 'ALL'}
        driver = webdriver.Chrome(desired_capabilities=d)
    return driver


@task(default=True)
def test(*paths, **kwargs):
    """
    Test one or multiple graphics looking for browser warnings and errors
    Using selenium & chrome webdriver
    """
    use = kwargs.get('use', 'Chrome')
    screenshot = kwargs.get('screenshot', True)
    pymParent = kwargs.get('pymParent', False)
    screenshot = utils.prep_bool_arg(screenshot)
    pymParent = utils.prep_bool_arg(pymParent)
    logger.info(paths)
    if paths[0] == '':
        print 'You must specify at least one path, like this: "test:slug" or "test:path,path"'
        return

    for path in paths:
        test_single(path, use=use, screenshot=screenshot, pymParent=pymParent)


@task
def test_single(path, use='Chrome', screenshot=True, pymParent=False):
    """
    Test a graphic looking for browser warnings and errors
    Using selenium & chrome webdriver
    """
    screenshot = utils.prep_bool_arg(screenshot)
    pymParent = utils.prep_bool_arg(pymParent)
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
    driver = _choose_web_driver(use)
    try:
        if pymParent:
            driver.execute_script(RESET_SCRIPT)
        driver.get(url)
        # Wait for pym to be loaded
        # Execute a script that listens to the child message
        # and sets a global variable on the browser's window
        # Then make an explicit wait until the global var is set to true
        if pymParent:
            try:
                WebDriverWait(driver, app_config.TEST_SCRIPTS_TIMEOUT).until(
                    lambda driver: driver.execute_script(CHECK_PYM_SCRIPT)
                )
            except TimeoutException:
                logger.info("%s - Timeout: PymParent Not found." % (slug))
                line = [slug, 'INFO', 'Timeout: PymParent Not found']
                log_content.append(line)
        # Wait a configurable time for the page to load
        time.sleep(app_config.TESTS_LOAD_WAIT_TIME)
        if pymParent:
            # Force Pym Message communication
            driver.execute_script(COMUNICATION_SCRIPT)
            try:
                WebDriverWait(driver, app_config.TEST_SCRIPTS_TIMEOUT).until(
                    lambda driver: driver.execute_script(VALIDATION_SCRIPT)
                )
            except TimeoutException:
                logger.info("%s - Timeout: No messaging." % (
                    slug))
                line = [slug, 'INFO', 'Timeout: No messaging']
                log_content.append(line)
        log = driver.get_log('browser')
        if not log:
            logger.info("Test was successful")
        else:
            log_content.append(['id', 'level', 'message'])
            for entry in log:
                clean_message = u'%s' % (
                    safe_unicode(safe_str(entry['message'])))
                clean_message = clean_message.replace('\n', '')
                line = [slug, entry['level'], clean_message]
                log_content.append(line)
                if entry['level'] == 'ERROR':
                    logger.error("Reason %s" % clean_message)
                elif entry['level'] == 'WARNING':
                    logger.warning("Reason %s" % clean_message)
                else:
                    logger.info("Found some console.log output %s" % (
                        clean_message))
    finally:
        if screenshot:
            driver.save_screenshot('%s/%s-%s.png' % (OUTPUT_PATH,
                                                     env.settings,
                                                     slug))
        driver.quit()
        if log_content:
            with open('%s/%s-%s.log' % (OUTPUT_PATH,
                                        env.settings,
                                        slug), 'w') as writefile:
                writer = csv.writer(writefile, quoting=csv.QUOTE_MINIMAL)
                writer.writerows(log_content)


@task
def bulk_test(csvpath, use='Chrome', screenshot=True, pymParent=False):
    """
    Test graphics browser warnings & errors -- use batch for multiple graphics
    Using selenium & chrome webdriver
    """
    screenshot = utils.prep_bool_arg(screenshot)
    pymParent = utils.prep_bool_arg(pymParent)
    fname = os.path.basename(csvpath)
    url_pattern = re.compile(r'(?:/|storyId=)(\d{9})/?')
    # Assume that a filepath is given read contents and clean them
    with open(csvpath, 'r') as f:
        content = f.readlines()
    content = [x.strip() for x in content]
    # Timestamp of the test
    ts = re.sub(r'\..*', '', str(datetime.datetime.now()))
    ts = re.sub(r'[\s:-]', '_', ts)
    log_content = [['id', 'level', 'message']]
    OUTPUT_PATH = os.path.join(cwd, '../test/%s' % ts)
    # Create output files folder if needed
    if not os.path.exists(OUTPUT_PATH):
        os.makedirs(OUTPUT_PATH)
    driver = _choose_web_driver(use)
    try:
        for ix, item in enumerate(content):
            if re.match(r'^https?://', item):
                m = url_pattern.search(item)
                if m:
                    slug = m.group(1)
                else:
                    slug = 'line%s' % (ix + 1)
                url = item
                env.settings = 'url'
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
            if pymParent:
                driver.execute_script(RESET_SCRIPT)
            driver.get(url)
            # Wait for pym to be loaded
            if pymParent:
                try:
                    WebDriverWait(driver,
                                  app_config.TEST_SCRIPTS_TIMEOUT).until(
                        lambda driver: driver.execute_script(CHECK_PYM_SCRIPT)
                    )
                except TimeoutException:
                    logger.info("%s - Timeout: PymParent Not found." % (slug))
                    line = [slug, 'INFO', 'Timeout: Pym Not found']
                    log_content.append(line)
            # Wait a configurable time for the page to load
            time.sleep(app_config.TESTS_LOAD_WAIT_TIME)
            # Force Pym Message communication
            driver.execute_script(COMUNICATION_SCRIPT)
            if pymParent:
                try:
                    WebDriverWait(driver,
                                  app_config.TEST_SCRIPTS_TIMEOUT).until(
                        lambda driver: driver.execute_script(VALIDATION_SCRIPT)
                    )
                except TimeoutException:
                    logger.info("%s - Timeout: No messaging." % (slug))
                    line = [slug, 'INFO', 'Timeout: No messaging']
                    log_content.append(line)

            # Get browser log and parse output
            log = driver.get_log('browser')
            if not log:
                logger.info("%s - Test successful" % (slug))
                line = [slug, 'SUCCESS', 'Test successful with no logs']
                log_content.append(line)
            else:
                logger.warning("%s - Test found issues. Check log" % (
                    slug))
                for entry in log:
                    clean_message = u'%s' % (
                        safe_unicode(safe_str(entry['message'])))
                    clean_message = clean_message.replace('\n', '')
                    line = [slug, entry['level'], clean_message]
                    log_content.append(line)

            # Save screenshot
            if screenshot:
                driver.save_screenshot('%s/%s-%s.png' % (OUTPUT_PATH,
                                                         env.settings,
                                                         slug))
    finally:
        driver.quit()
        if log_content:
            with open('%s/test-%s' % (OUTPUT_PATH, fname), 'w') as writefile:
                writer = csv.writer(writefile, quoting=csv.QUOTE_MINIMAL)
                writer.writerows(log_content)
