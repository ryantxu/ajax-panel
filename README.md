## AJAX Panel for Grafana

The AJAX Panel will load external content into a dashboard.  


### TODO... help please :)
 - Toggle the 'spinner' for panel?
 - Get the panel width?
 - Error handling


### Options

- **Method**:

  GET or POST

- **URL**:

  The URL to request

- **Parameters**:

  The parameters that will be passed in the request.  This is a javascript object with access to the variables:
  	- 'ctrl' = The control object.
  
  Sample Parameters:
	```
	{
	 from:ctrl.range.from.format('x'),  // x is unix ms timestamp
	 to:ctrl.range.to.format('x'), 
	 height:ctrl.height
	}
	```



### Screenshots

- TODO

#### Changelog

##### v0.0.1

- Quick and Dirty, but seems to work :)



### Wishlist... possible features
 - Add authentication info to the sub-request?
 - Configure timer to refresh
 - Load CSS file?
 - drop in javascript for display?
