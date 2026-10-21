/* Photon is queried only on explicit Search, not on every keystroke. */
(function () {
    'use strict';
    window.setupAddressSearch = function (map, workspace, setStatus) {
        var form = document.getElementById('address-search');
        var input = document.getElementById('address');
        var results = document.getElementById('address-results');
        var fieldset = document.getElementById('search-results');
        var select = document.getElementById('select-address');
        var button = document.getElementById('search-button');
        var selected = null, request = null, searchId = 0;

        function clearResults() {
            selected = null;
            results.replaceChildren();
            fieldset.hidden = true;
            select.disabled = true;
        }
        function render(features) {
            features.filter(function (feature) { return MapData.coordinates(feature); }).slice(0, 5).forEach(function (feature, index) {
                var label = document.createElement('label');
                var radio = document.createElement('input');
                var text = document.createElement('span');
                radio.type = 'radio';
                radio.name = 'address-result';
                radio.value = index;
                radio.addEventListener('change', function () {
                    selected = feature;
                    select.disabled = false;
                });
                text.textContent = MapData.addressLabel(feature);
                label.className = 'address-result';
                label.append(radio, text);
                results.appendChild(label);
            });
            fieldset.hidden = !results.children.length;
            setStatus('search-status', results.children.length ? 'Choose a result, then press Select.' : 'No addresses found. Try a street and city, or click the map.', false);
        }
        input.addEventListener('input', function () {
            searchId++;
            if (request) request.abort();
            clearResults();
            button.disabled = false;
            button.textContent = 'Search';
            setStatus('search-status', '', false);
        });
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            var query = input.value.trim();
            if (query.length < 3) {
                setStatus('search-status', 'Enter at least 3 characters.', true);
                return;
            }
            if (request) request.abort();
            request = new AbortController();
            var id = ++searchId;
            var controller = request;
            var timeout = setTimeout(function () { controller.abort(); }, 12000);
            clearResults();
            button.disabled = true;
            button.textContent = 'Searching…';
            setStatus('search-status', 'Searching for addresses…', false);
            try {
                var response = await fetch(MapData.searchUrl(workspace.dataset.geocoderUrl, query, map.getCenter().wrap()), { signal: controller.signal });
                if (!response.ok) throw new Error('Search failed');
                var data = await response.json();
                if (!Array.isArray(data.features)) throw new Error('Invalid search response');
                if (id === searchId) render(data.features);
            } catch (error) {
                if (id === searchId) setStatus('search-status', 'Address search is unavailable. Try again, or click the map to continue.', true);
            } finally {
                clearTimeout(timeout);
                if (id === searchId) {
                    button.disabled = false;
                    button.textContent = 'Search';
                }
            }
        });
        select.addEventListener('click', function () {
            if (!selected) return;
            map.setView(MapData.coordinates(selected), 16);
            setStatus('map-status', 'Location selected. Click the map to place your incident marker.', false);
            clearResults();
            setStatus('search-status', '', false);
            document.getElementById('map').focus();
        });
    };
}());
