/**
 * Created leon on 26/04/2017.
 */
var markersId = [];
var markers = {};

function setNewCenter(newCenter) {
    document.cookie = 'center=' + [newCenter.lat(), newCenter.lng()];
}

function placeMarker(map, location, currentMarker) {
    deleteCurrentMaker(currentMarker);
    return new google.maps.Marker({
        position: location,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: '/img/gun.png'
    });
}

// Deletes all markers in the array by removing references to them
function deleteCurrentMaker(currentMarker) {
    if (currentMarker !== undefined) {
        currentMarker.setMap(null);
    }
}

function setListener(map) {
    var marker = new google.maps.Marker();
    google.maps.event.addListener(map, 'click', function (event) {
        marker = placeMarker(map, event.latLng, marker);
        var content = getPopUpFrom(marker);
        var infoWindow = new google.maps.InfoWindow({content: content});
        infoWindow.open(map, marker)
    });
}

function setAddressFinder(map) {
    // Create the search box and link it to the UI element.
    var input = document.getElementById('searchBox');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }
        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];
        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

function onChangeListener(map) {
    document.cookie = 'center=;';
    document.cookie = 'markers=;';
    google.maps.event.addListener(map, 'center_changed', function () {
        var newCenter = map.getCenter();
        if (getCookie("center")[0] === "" || distanceReady(getCookie("center"), newCenter)) {
            setNewCenter(newCenter);
            getNearIncidents(map.getCenter(), function (data) {
                markersId = [];
                // markers = {};
                for (var index in data) {
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(data[index].location.coordinates[1], data[index].location.coordinates[0]),
                        title: data[index].title,
                        icon: '/img/gun.png'
                    });
                    markersId.push(data[index]._id);
                    if(!(data[index]._id in markers)){
                        markers[data[index]._id] = marker;
                        setContentToMarker(marker, data[index], map);
                    }
                }
                var markersIdInCookies = getCookie("markers");
                document.cookie = 'markers=' + markersId;
                removeMarkers(markersIdInCookies);
                setMarkers(markersIdInCookies, map);
            });
        }
    });
}

function distanceReady(originalPoint, newPoint) {
    return Math.abs(originalPoint[0] - newPoint.lat()) > .001 || Math.abs(originalPoint[1] - newPoint.lng()) > .001;
}

function setContentToMarker(marker, data, map) {
    var content = getMarkerContent(data);
    marker.addListener('click', function () {
        content.open(map, marker);
    });
}

function getCookie(cookieName) {
    var name = cookieName + '=';
    var cookies = document.cookie.split(';');
    for (var index in cookies) {
        var cookie = cookies[index];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length).split(',');
        }
    }
    return '';
}


function removeMarkers(markersIdInCookies) {
    markersIdInCookies.forEach(function (marker) {
        if (!markersId.includes(marker)) {
            if (marker in markers) {
                markers[marker].setMap(null);
                delete markers[marker];
            }
        }
    });
}

function setMarkers(markersIdInCookies, map){
    markersId.forEach(function (marker) {
        // if(!markersIdInCookies.includes(marker)){
            markers[marker].setMap(map);
        // }
    });
}

function getMarkerContent(result) {
    var content =
        '<div class="content incident-description-pop">' +
        '<div class="container-fluid">' +
        '<div class="row">' +
        '<div class="col-md-12">' +
        '<div class="card">' +
        '<div class="content">' +
        '<div class="row">' +
        '<div class="col-md-12">' +
        '<p class="incident-description-label">title: </p>' +
        '<p class="incident-description">' + result.title + '</p>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-md-12">' +
        '<p class="incident-description-label">Incident: </p>' +
        '<p class="incident-description">' + result.incident + '</p>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-md-12">' +
        '<p class="incident-description-label">Description: </p>' +
        '<p class="incident-description">' + result.description + '</p>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-md-12">' +
        '<p class="incident-description-label">Date: </p>' +
        '<p class="incident-description">' + result.date.replace('T', ' ').replace('.000+0000', '') + '</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    return new google.maps.InfoWindow({
        content: content
    });
}