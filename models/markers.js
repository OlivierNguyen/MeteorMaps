Markers = new Mongo.Collection('markers');  

// Allow/Deny

Markers.allow({
  insert: function(marker, doc){
    return can.createMarker(marker);
  },
  update:  function(marker, doc, fieldNames, modifier){
    return can.editMarker(marker);
  }
});

Meteor.methods({
  createMarker: function(marker){
    if(can.createMarker(marker.id))
      Markers.insert(marker);
  },
  
  editMarker: function(marker) {
      Markers.update(marker, {upsert: true});
  }
});