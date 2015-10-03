/* ---------------------------------------------------- +/

## Publications ##

All publications-related code. 

/+ ---------------------------------------------------- */

// Publish all markers

Meteor.publish('theMarkers', function() {
  return Markers.find();
});
