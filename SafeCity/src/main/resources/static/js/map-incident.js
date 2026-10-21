window.MapIncident = {
    init: function (map, setStatus, reload) {
        'use strict';
        var state = { map: map, setStatus: setStatus, reload: reload, marker: null, saving: false };
        state.form = document.getElementById('incident-report');
        state.section = document.getElementById('incident-section');
        var panel = state.section.closest('.map-panel');
        state.save = document.getElementById('save-incident');
        state.cancel = document.getElementById('cancel-incident');
        function updateCoordinates() {
            var point = state.marker.getLatLng().wrap();
            document.getElementById('selected-location').textContent = point.lat.toFixed(5) + ', ' + point.lng.toFixed(5);
        }
        state.clear = function () {
            if (state.marker) map.removeLayer(state.marker);
            state.marker = null;
            state.section.hidden = true;
            panel.classList.remove('reporting');
            state.form.reset();
        };
        function placeMarker(point) {
            if (state.saving) return;
            if (state.marker) state.marker.setLatLng(point);
            else state.marker = L.marker(point, { draggable: true, title: 'Selected incident location', alt: 'Selected incident location' }).addTo(map);
            state.marker.off('dragend').on('dragend', updateCoordinates);
            updateCoordinates();
            if (!state.form.elements.date.value) state.form.elements.date.value = MapData.localDateTime(new Date());
            state.section.hidden = false;
            panel.classList.add('reporting');
            if (window.matchMedia('(max-width: 640px)').matches) {
                map.panInside(point, { paddingTopLeft: [16, 16], paddingBottomRight: [16, panel.offsetHeight + 40], animate: false });
            }
            setStatus('save-status', '', false);
            setStatus('map-status', 'Marker placed. Drag it or click the map to adjust the location.', false);
            state.form.elements.title.focus({ preventScroll: true });
        }
        map.on('click', function (event) { placeMarker(event.latlng); });
        document.getElementById('place-marker').addEventListener('click', function () { placeMarker(map.getCenter()); });
        state.cancel.addEventListener('click', function () {
            state.clear();
            setStatus('save-status', '', false);
            setStatus('map-status', 'Click the map to place a marker.', false);
            document.getElementById('map').focus();
        });
        state.form.addEventListener('submit', function (event) { MapIncident.submit(state, event); });
        return state;
    },
    submit: async function (state, event) {
        'use strict';
        event.preventDefault();
        if (!state.marker || state.saving || !state.form.reportValidity()) return;
        var data = Object.fromEntries(new FormData(state.form));
        state.saving = true;
        state.marker.dragging.disable();
        Array.from(state.form.elements).forEach(function (field) { field.disabled = true; });
        state.cancel.disabled = true;
        state.save.textContent = 'Saving…';
        state.setStatus('save-status', 'Saving your incident…', false);
        var point = state.marker.getLatLng().wrap();
        data.lat = String(point.lat);
        data.lng = String(point.lng);
        var controller = new AbortController();
        var timeout = setTimeout(function () { controller.abort(); }, 20000);
        try {
            var response = await fetch('/save-incident', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: controller.signal
            });
            if (!response.ok) throw new Error('Save failed');
            state.clear();
            state.setStatus('save-status', 'Incident saved. Thank you for your report.', false);
            state.setStatus('map-status', 'Click the map to report another incident.', false);
            state.reload();
            document.getElementById('place-marker').focus();
        } catch (error) {
            state.setStatus('save-status', 'Could not confirm the save. Your details are still here. Check nearby incidents before retrying to avoid a duplicate.', true);
        } finally {
            clearTimeout(timeout);
            state.saving = false;
            if (state.marker) state.marker.dragging.enable();
            Array.from(state.form.elements).forEach(function (field) { field.disabled = false; });
            state.cancel.disabled = false;
            state.save.textContent = 'Save incident';
        }
    }
};
