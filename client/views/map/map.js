var rectangle;
var places = [];
var infoWindow;
var service;

/**
 * Only use this code on client side
 */
if (Meteor.isClient) {
    Template.map.helpers({
        mapOptions: function () {
            // Make sure the maps API has loaded
            if (GoogleMaps.loaded()) {
                // Map initialization options
                return {
                    center: new google.maps.LatLng(48.858859, 2.3470599),
                    zoom: 12,
                    styles: [{
                            stylers: [{visibility: 'simplified'}]
                        }, {
                            featureType: "road",
                            elementType: "labels",
                            stylers: [
                                {visibility: "off"}
                            ]
                        }]
                };
            }
        }
    });

    Template.map.onCreated(function () {
        // We can use the `ready` callback to interact with the map API once the map is ready.
        GoogleMaps.ready('micromaniaMap', function (map) {
            // Create the rectangle
            rectangle = new google.maps.Rectangle({
                bounds: {
                    north: 48.906951641011774,
                    south: 48.81002,
                    east: 2.4170599,
                    west: 2.2570599
                },
                editable: true,
                draggable: true
            });

            // add a rectangle on the map
            rectangle.setMap(map.instance);
            rectangle.setVisible(false); // Hide the rectangle (default)

            // Get places we are looking for
            infoWindow = new google.maps.InfoWindow();
            service = new google.maps.places.PlacesService(map.instance);
            searchMicromaniaShop();

            // The idle event is a debounced event, so we can query & listen without
            // throwing too many requests at the server.
            map.instance.addListener('idle', searchMicromaniaShop);

            /**
             * Search Micromania's shop
             * @returns {undefined}
             */
            function searchMicromaniaShop() {
                var request = {
                    bounds: map.instance.getBounds(),
                    keyword: 'Micromania'
                };
                service.radarSearch(request, addPlace);
            }

            /**
             * Add each place found into an array "places" and draw marker
             * @param {type} results
             * @param {type} status
             * @returns {undefined}
             */
            function addPlace(results, status) {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    console.error(status);
                    return;
                }

                places.length = 0;
                for (var i = 0, result; result = results[i]; i++) {
                    places.push(results[i]);
                    // Add marker of each place found
                    addMarker(result);
                }
            }

            /**
             * Add a marker using a place object
             * @param {type} place
             * @returns {undefined}
             */
            function addMarker(place) {

                // Save into DB for fun
                /**
                 * TODO
                 * Save each place found into DB using update / upset 
                 */

//                Markers.insert(place);

                Meteor.subscribe('theMarkers');

                var marker = new google.maps.Marker({
                    map: map.instance,
                    position: place.geometry.location,
                });

                google.maps.event.addListener(marker, 'click', function () {
                    service.getDetails(place, function (result, status) {
                        if (status !== google.maps.places.PlacesServiceStatus.OK) {
                            console.error(status);
                            return;
                        }

                        var contentString = '<div id="content">' +
                                '<div id="siteNotice">' +
                                '</div>' +
                                '<h2 id="firstHeading" class="firstHeading">' + result.name + '</h2>' +
                                '<div id="bodyContent">' +
                                '<p> Adresse : ' + result.formatted_address +
                                '</p>' +
                                '</div>' +
                                '</div>';

                        // Display infoWindows
                        infoWindow.setContent(contentString);
                        infoWindow.open(map.instance, marker);

                        return result;
                    });
                });
            }


        });
    });

    Template.map.events({
        'click #map-canvas': function () {
            // Only calculate the rectangle when it's displayed
            if (rectangle.getVisible()) {
                showInfoRect();
            }
        },
        'click #btnExport': function () {
            if (rectangle.getVisible()) {
                exportToCSV();
            } else {
                alert("Please select your favorite shop using Rectangle button.");
            }
        },
        'click #btnRect': function () {
            toggleRectangle();
        }
    });

    /**
     * Return an array with place we want
     * @returns {Array|getPlacesFound.result}
     */
    function getPlacesFound() {

        var result = [];
        var ne = rectangle.getBounds().getNorthEast();
        var sw = rectangle.getBounds().getSouthWest();

        for (i = 0; i < places.length; i++) {
            var latMarker = places[i].geometry.location.H;
            var lngMarker = places[i].geometry.location.L;

            // Save into array the selected place in the rectangle
            if (latMarker <= ne.lat() && latMarker >= sw.lat() && lngMarker >= sw.lng() && lngMarker <= ne.lng()) {
                result.push(places[i]);
            }
        }

        return result;
    }

    /**
     * Get information about the rectangle selection
     */
    function showInfoRect() {

        var count = getPlacesFound().length;
        var contentString = '<b>Micromania</b><br>' +
                'Nombre de magasins sélectionnés : ' + count;

        // Set the info window's content and position.
        infoWindow.setContent(contentString);
        infoWindow.setPosition(rectangle.getBounds().getNorthEast());

        infoWindow.open(rectangle.getMap());
    }

    /**
     * Display / Hide the rectangle selection area
     * @returns {undefined}
     */
    function toggleRectangle() {
        if (rectangle.getVisible()) {
            rectangle.setVisible(false); // Hide the rectangle
            infoWindow.close();
        } else {
            rectangle.setVisible(true); // Display the rectangle
            showInfoRect(); // Display information of the rectangle
        }
    }

    /**
     * Export CSV from JSON
     * @returns {undefined}
     */
    function exportToCSV() {
        var result_places = getPlacesFound();
        // Get extra informations of each place in the rectangle
        for (var i = 0; i < result_places.length; i++) {
            service.getDetails(result_places[i], function (result, status) {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    console.error(status);
                    return;
                }

                var infoPlace = templateMicromaniaJSON(result.place_id, result.name, result.formatted_address, result.formatted_phone_number, result.geometry);
                alert("DEV MODE : Look at the console");
                console.log("DEV MODE : Look at the console");
                console.log(infoPlace);
                // TODO : Update place into DB & set the attribut "selected" to "true"
            });
        }

        // TODO : Get place using DB (Markers.find({'selected' : true}) and convert JSON to CSV
        // And update the selected to false.

    }

    /**
     * Create formatted object JSON
     * @param {type} placeId
     * @param {type} name
     * @param {type} address
     * @param {type} phone
     * @param {type} geometry
     * @returns {templateMicromaniaJSON.json}
     */
    function templateMicromaniaJSON(placeId, name, address, phone, geometry) {
        var json = {'_id': placeId,
            'name': name,
            'address': address,
            'phone': phone,
            'geometry': geometry,
            'selected': false
        };

        return json;
    }
}                   