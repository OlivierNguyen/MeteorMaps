/* ---------------------------------------------------- +/

## Permissions ##

Permission checks

Usage:

if (can.editItem(Meteor.user(), myItem)){
  // do something  
}

/+ ---------------------------------------------------- */

can = {
  createMarker: function (markerId) {
    return true;
  },
  editMarker: function (markerId, marker) {
    return markerId === marker.markerId;
  },
  removeMarker: function (markerId, marker) {
    return markerId === marker.markerId;
  }
}