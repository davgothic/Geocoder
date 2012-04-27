/**
 * Geocoder
 * http://davgothic.com/geocoder/
 *
 * Copyright (c) 2010 David Hancock
 * Licensed under the MIT license ( http://davgothic.com/mit-license/ )
 */

var Geocoder = {

	settings: {
        latlng : new google.maps.LatLng(55.378051, -3.435973),
        options: {
			zoom: 4,
			center: null,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			draggableCursor:"crosshair",
			backgroundColor: "#37403c",
			streetViewControl: false,
			disableDefaultUI: false
		},
        map: null,
        markers: []
    },

	/**
	 * Set up the Geocoder
	 */
	init: function() {
		var Geocoder = this;

		Geocoder.settings.options.center = this.settings.latlng;
		Geocoder.settings.map = new google.maps.Map(document.getElementById("map-canvas"), Geocoder.settings.options);

		// Make the map fit the screen
		$("#map-canvas").height($("body").height() - $("#locate-panel").height());
		$(window).resize(function() {
			$("#map-canvas").height($("body").height() - $("#locate-panel").height());
		});

		// Set the initial latitude and latitude field values
		$("#latitude").val(Geocoder.settings.latlng.lat());
		$("#longitude").val(Geocoder.settings.latlng.lng());

		// Format the address field according to it's focus state
		$("#address").focus(function() {
			var address = $.trim($(this).val());
			if (address == "Address") {
				$(this).val("");
			}
			$(this).css("color", "#fff");
		});
		$("#address").blur(function() {
			var address = $.trim($("#address").val());
			if (address == "") {
				$(this).css("color", "#aaa").val("Address");
			}
		});

		// Select the contents of the longitude and latitude fields on click
		$("#latitude, #longitude").click(function() {
			$(this).select();
		});

		// Attempt to geolocate the address provided
		$("form").submit(function() {

			// Validate the address field
			var address = $.trim($("#address").val());
			if (address == "" || address == "Address")
			{
				alert("Please enter an address to geolocate.");
				return false;
			}

			// Initialize the Google geocoder
			var theGeocoder = new google.maps.Geocoder();

			// Set up the geocoder request
			var geocoderRequest = {
				address: $("#address").val(),
				bounds: Geocoder.settings.map.getBounds()
			};

			// Send the geocoder request
			theGeocoder.geocode(geocoderRequest, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {

					if (results.length > 1)
					{
						alert("Multiple results found for query, will use most relevant result. Try being more specific.");
					}

					Geocoder.addMarker(results[0].geometry.location);

					Geocoder.settings.options.zoom = 14;
					Geocoder.settings.options.center = Geocoder.settings.latlng;
					Geocoder.settings.map.setOptions(Geocoder.settings.options);

				} else {
					alert("An error occurred whilst trying to process this geocoder request. Try again later.");
				}
			});

			return false;
		});

		// Add a marker when the map is clicked
		google.maps.event.addListener(Geocoder.settings.map, "click", function(e) {
			Geocoder.addMarker(e.latLng);

			Geocoder.settings.map.panTo(e.latLng);
		});
	},

	/**
	 * Add a marker to the map
	 * @param LatLng
	 */
	addMarker: function(location) {
		var Geocoder = this;

		Geocoder.deleteMarkers();

		var image = new google.maps.MarkerImage(
			"media/images/image.png",
			new google.maps.Size(30, 56),
			new google.maps.Point(0, 0),
			new google.maps.Point(15, 56)
		);

		var shadow = new google.maps.MarkerImage(
			"media/images/shadow.png",
			new google.maps.Size(62, 56),
			new google.maps.Point(0, 0),
			new google.maps.Point(15, 56)
		);

		// Create the marker
		var marker = new google.maps.Marker({
			draggable: true,
			raiseOnDrag: true,
			icon: image,
			shadow: shadow,
			map: Geocoder.settings.map,
			position: location
		});

		// Update the marker when dragged
		google.maps.event.addListener(marker, "dragend", function(e) {
			Geocoder.markerChanged(e.latLng);
		});

		Geocoder.settings.markers.push(marker);

		Geocoder.markerChanged(location);
	},

	/**
	 * Update the global latitude and longitude values
	 * @param LatLng
	 */
	markerChanged: function(location) {
		Geocoder.settings.latlng = location;

		$("#latitude").val(Geocoder.settings.latlng.lat());
		$("#longitude").val(Geocoder.settings.latlng.lng());
	},

	/**
	 * Delete all the markers on the map
	 */
	deleteMarkers: function() {
		if (Geocoder.settings.markers) {
			for (i in Geocoder.settings.markers) {
				Geocoder.settings.markers[i].setMap(null);
			}
			Geocoder.settings.markers.length = 0;
		}
	}
};

$(document).ready(function() {

	// Let's get this thing started!
	Geocoder.init();

	$("#toggle-info").click(function() {
        $("#info-panel").toggle("fast");
    });
});
