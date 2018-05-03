## AJAX Panel for Grafana

The AJAX Panel can load external content into the dashboard.

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

### TODO... contributions welcome!

* Configure independent refresh timer
* Improve image styling and options
* Configure CSS?
