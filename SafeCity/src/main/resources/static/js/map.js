/**
 * Created leon on 26/04/2017.
 */
var generalMarkers = [];

function setNewCenter(newCenter) {
    document.cookie = 'center=' + [newCenter.lat(), newCenter.lng()];
}

function placeMarker(map, location, currentMarker) {
    deleteCurrentMaker(currentMarker);
    return new google.maps.Marker({
        position: location,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: '/img/burglar.png'
    });
}

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
    var input = document.getElementById('searchBox');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }

        removeMarkers();

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
                map.setCenter(new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()));
                if(document.URL.includes('/hot-zones')){
                    setHotZoneFunctions(map);
                }else{
                    setCrimesPoints(map);
                }

            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

function setCrimesPoints(map) {
    google.maps.event.addListenerOnce(map, 'idle', function () {
        getNearIncidents(map.getCenter(), function (data) {
            for (var index in data) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(data[index].location.coordinates[1], data[index].location.coordinates[0]),
                    title: data[index].title,
                    icon: '/img/burglar.png'
                });
                generalMarkers.push(marker);
                setContentToMarker(marker, data[index], map);
            }
            setMarkers(map);
        });
    });
}

function setHotZoneFunctions(map) {
    google.maps.event.addListenerOnce(map, 'idle', function () {
        var heatmapData = [];
        getNearIncidents(map.getCenter(), function (data) {
            markersId = [];
            for (var index in data) {
                heatmapData.push(
                    new google.maps.LatLng(
                        data[index].location.coordinates[1],
                        data[index].location.coordinates[0]
                    )
                );
            }
            var heatmap = new google.maps.visualization.HeatmapLayer({
                data: heatmapData,
                dissipating: false,
                map: map,
                maxIntensity: 1,
                radius: .001
            });
        });
    });
}

function setContentToMarker(marker, data, map) {
    var content = getMarkerContent(data);
    marker.addListener('click', function () {
        content.open(map, marker);
    });
}

function removeMarkers() {
    generalMarkers.forEach(function (marker) {
        marker.setMap(null);
    });
    generalMarkers = []
}

function setMarkers(map) {
    generalMarkers.forEach(function (marker) {
        marker.setMap(map);
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