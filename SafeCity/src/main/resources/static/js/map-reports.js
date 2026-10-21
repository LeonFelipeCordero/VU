window.setupNearbyReports = function (map, hotZones, setStatus) {
    'use strict';
    var reports = L.layerGroup().addTo(map);
    var heat = hotZones ? L.heatLayer([], { radius: 28, blur: 20, maxZoom: 17 }).addTo(map) : null;
    var request = null, requestId = 0, moveTimer = null;
    function popup(incident) {
        var content = document.createElement('div');
        var title = document.createElement('strong');
        title.textContent = incident.title;
        content.appendChild(title);
        [incident.incident, incident.description, incident.date && incident.date.replace('T', ' ').slice(0, 16)].filter(Boolean).forEach(function (value) {
            var line = document.createElement('p');
            line.textContent = value;
            content.appendChild(line);
        });
        return content;
    }
    async function reload() {
        if (request) request.abort();
        request = new AbortController();
        var id = ++requestId;
        var controller = request;
        var timeout = setTimeout(function () { controller.abort(); }, 12000);
        var center = map.getCenter().wrap();
        try {
            var response = await fetch('/incident/near?lat=' + center.lat + '&lng=' + center.lng, { signal: controller.signal });
            if (!response.ok) throw new Error('Could not load incidents');
            var incidents = await response.json();
            if (!Array.isArray(incidents)) throw new Error('Invalid incidents response');
            if (id !== requestId) return;
            reports.clearLayers();
            var points = [];
            incidents.forEach(function (incident) {
                var point = MapData.coordinates({ geometry: incident.location });
                if (!point) return;
                points.push(point);
                if (!heat) L.circleMarker(point, { radius: 5, color: '#a53126', weight: 1, fillColor: '#dd4b39', fillOpacity: 0.65, bubblingMouseEvents: false }).bindPopup(popup(incident)).addTo(reports);
            });
            if (heat) heat.setLatLngs(points);
            setStatus('map-status', points.length + ' nearby incidents. Click the map to place a marker.', false);
        } catch (error) {
            if (id === requestId) setStatus('map-status', 'Nearby incidents could not load. Move the map to retry. You can still place a marker.', true);
        } finally {
            clearTimeout(timeout);
        }
    }
    map.on('moveend', function () {
        clearTimeout(moveTimer);
        moveTimer = setTimeout(reload, 250);
    });
    return reload;
};
