document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    var workspace = document.querySelector('.map-workspace');
    if (!workspace) return;
    var map = L.map('map', { zoomControl: false }).setView([28.640033, -106.073761], 14);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    var tiles = L.tileLayer(workspace.dataset.tileUrl, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
    function setStatus(id, message, error) {
        var node = document.getElementById(id);
        node.textContent = message;
        node.classList.toggle('error', !!error);
    }
    tiles.on('tileerror', function () {
        setStatus('tile-status', 'Some map tiles could not load. Check your connection, then zoom or move the map to retry.', true);
    });
    var reload = setupNearbyReports(map, workspace.dataset.hotZones === 'true', setStatus);
    MapIncident.init(map, setStatus, reload);
    setupAddressSearch(map, workspace, setStatus);
    document.getElementById('use-location').addEventListener('click', function () {
        if (!navigator.geolocation) {
            setStatus('map-status', 'Location is unavailable. Search for an address or click the map.', true);
            return;
        }
        var button = this;
        button.disabled = true;
        setStatus('map-status', 'Finding your location…', false);
        navigator.geolocation.getCurrentPosition(function (position) {
            button.disabled = false;
            map.setView([position.coords.latitude, position.coords.longitude], 16);
        }, function () {
            button.disabled = false;
            setStatus('map-status', 'Location access was denied or unavailable. Search for an address or click the map.', true);
        }, { timeout: 10000 });
    });
    reload();
});
