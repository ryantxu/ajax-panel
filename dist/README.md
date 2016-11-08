## AJAX Panel for Grafana

The AJAX Panel can load external content into the dashboard.  This is a more powerful and flexible solution than
using an <iframe 


### Options

- **Method**:

  GET or POST

- **URL**:

  The URL to request

- **Parameters**:

  The parameters that will be passed in the request.  This is a javascript object with access to the variables:
  	- `ctrl` The control object.
  
  Sample Parameters:
	```
	{
	 from:ctrl.range.from.format('x'),  // x is unix ms timestamp
	 to:ctrl.range.to.format('x'), 
	 height:ctrl.height
	}
	```


### Screenshots

- [Screenshot of the options screen](https://raw.githubusercontent.com/ryantxu/ajax-panel/master/src/img/screenshot-ajax-options.png)

#### Changelog

##### v0.0.2

- Quick and Dirty, but it works!



### Roadmap... hopefully soon
 - Toggle the 'spinner' for panel
 - Get the panel width?
 - Error handling
 - avoid the 'Data source query result invalid, missing data field: undefined' error message


### Wishlist... if you are looking for a project :)
 - Add authentication info to the sub-request?
 - Configure timer to refresh
 - Load CSS file?
 - configure javascript for display
 - why does the `Time range` > `Override relative time` not work?
 - Check that parameters have changed before sending a new request
