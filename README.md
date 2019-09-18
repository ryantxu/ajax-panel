## AJAX Panel for Grafana

[![CircleCI](https://circleci.com/gh/ryantxu/ajax-panel/tree/master.svg?style=svg)](https://circleci.com/gh/ryantxu/ajax-panel/tree/master)
[![dependencies Status](https://david-dm.org/ryantxu/ajax-panel/status.svg)](https://david-dm.org/ryantxu/ajax-panel)
[![devDependencies Status](https://david-dm.org/ryantxu/ajax-panel/dev-status.svg)](https://david-dm.org/ryantxu/ajax-panel?type=dev)

The AJAX Panel is a general way to load external content into a grafana dashboard.

### Options

* **Method**:

  GET or POST or iframe

* **URL**:

  The URL to request

* **Parameters**:

  The parameters that will be passed in the request. This is a javascript object with access to the variables: - `ctrl` The control object.

### Screenshots

![Screenshot](https://raw.githubusercontent.com/ryantxu/ajax-panel/master/src/img/screenshot.png)
![Options](https://raw.githubusercontent.com/ryantxu/ajax-panel/master/src/img/screenshot-ajax-options.png)
![Examples](https://raw.githubusercontent.com/ryantxu/ajax-panel/master/src/img/screenshot-examples.png)

#### Changelog

##### v0.0.7
* building with @grafana/toolkit
* Tested with Grafana 6.3
* fix height issue with iframes

##### v0.0.6

* Support requests to /api (grafana internal API)
* Adding circleci build
* removing dist from master build (only add it on release branches)
* Support empty text response (#9)
* webpack build
* Show query results
* tested with grafana 6


##### v0.0.5

* Support angular templates using AJAX response
* Options to display as: HTML, Text, JSON, or preformatted text
* Fixed display issue with 5.1
* Support direct link rendered image
* Show possible variables in editor

##### v0.0.4

* Support template variables in parameters (@linar-jether)
* Improved error handling
* Move ajax requests to 'issueQueries' block rather than refresh
* Show loading spinner
* Convert to TypeScript
* Use datasources for complex authentication
* Support loading images
* Support header configuration
* Support showing time info
* Include various sample configurations

##### v0.0.3

* Support template variables in url (@linar-jether)
* Adding iframe method (@linar-jether)

##### v0.0.2

* Quick and Dirty, but it works!
