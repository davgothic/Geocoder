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

	init: function() {
		var Geocoder = this;

		Geocoder.settings.options.center = this.settings.latlng;
		Geocoder.settings.map = new google.maps.Map(document.getElementById("map_canvas"), Geocoder.settings.options);

		$("#map_canvas").height($("body").height() - $("#locate_panel").height());
		$("#latitude").val(Geocoder.settings.latlng.lat());
		$("#longitude").val(Geocoder.settings.latlng.lng());
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

		$("#latitude, #longitude").click(function() {
			$(this).select();
		});

		$(window).resize(function() {
			$("#map_canvas").height($("body").height() - $("#locate_panel").height());
		});

		$("form").submit(function() {

			var address = $.trim($("#address").val());
			if (address == "" || address == "Address")
			{
				alert("Please enter an address to geolocate.");
				return false;
			}

			var theGeocoder = new google.maps.Geocoder();

			var geocoderRequest = {
				address: $("#address").val(),
				bounds: Geocoder.settings.map.getBounds()
			};

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

		google.maps.event.addListener(Geocoder.settings.map, "click", function(e) {
			Geocoder.addMarker(e.latLng);

			Geocoder.settings.map.panTo(e.latLng);
		});
	},

	addMarker: function(location) {
		var Geocoder = this;

		Geocoder.deleteMarkers();

		var marker = new google.maps.Marker({
			position: location,
			map: Geocoder.settings.map,
			draggable: true
		});

		google.maps.event.addListener(marker, "dragend", function(e) {
			Geocoder.markerChanged(e.latLng);
		});

		Geocoder.settings.markers.push(marker);

		Geocoder.markerChanged(location);
	},

	markerChanged: function(location) {
		Geocoder.settings.latlng = location;

		$("#latitude").val(Geocoder.settings.latlng.lat());
		$("#longitude").val(Geocoder.settings.latlng.lng());
	},

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
	Geocoder.init();

	$("#toggle_info").click(function() {
        $("#info_panel").toggle();
    });
});
