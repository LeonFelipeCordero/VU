const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const MapData = require('../../main/resources/static/js/map-data.js');

test('existing report clicks do not reach the map placement handler and popup text stays inert', async () => {
    let options, popup;
    const point = { lat: 28.64, lng: -106.07 };
    const map = { on() {}, getCenter: () => ({ wrap: () => point }) };
    const context = { window: {}, MapData, AbortController, setTimeout, clearTimeout,
        document: { createElement: () => ({ children: [], appendChild(node) { this.children.push(node); } }) },
        fetch: async () => ({ ok: true, json: async () => [{ title: '<img src=x onerror=alert(1)>',
            description: '<script>not HTML</script>', incident: 'Other',
            location: { type: 'Point', coordinates: [-106.07, 28.64] } }] }),
        L: { layerGroup: () => ({ addTo() { return this; }, clearLayers() {} }),
            circleMarker: (location, settings) => {
                assert.deepEqual(location, [28.64, -106.07]);
                options = settings;
                return { bindPopup(content) { popup = content; return this; }, addTo() {} };
            } }
    };
    runInNewContext(readFileSync(resolve(__dirname, '../../main/resources/static/js/map-reports.js'), 'utf8'), context);
    await context.window.setupNearbyReports(map, false, () => {})();
    assert.equal(options.bubblingMouseEvents, false);
    assert.equal(popup.children[0].textContent, '<img src=x onerror=alert(1)>');
    assert.equal(popup.children[2].textContent, '<script>not HTML</script>');
    assert.equal(popup.children[0].innerHTML, undefined);
});
