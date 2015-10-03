/* ---------------------------------------------------- +/
 
 ## Main ##
 
 Global client-side code. Loads last. 
 
 /+ ---------------------------------------------------- */

if (Meteor.isClient) {
    Meteor.startup(function () {
        GoogleMaps.load({
            key: 'AIzaSyCUMLaEh4hsezpW7xM_60qHmEK40X-47k0',
            libraries: 'places'
        });
    });
}

//