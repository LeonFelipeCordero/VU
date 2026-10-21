const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');

function fixture(fetch, point = { lat: 28.64, lng: -106.07 }) {
    const messages = [];
    let cleared = false, reloaded = false;
    const context = { window: {}, fetch, AbortController, setTimeout, clearTimeout,
        FormData: class { *[Symbol.iterator]() { yield ['title', 'Window damaged']; yield ['description', '<script>not HTML</script>']; } },
        document: { getElementById: () => ({ focus() {} }) } };
    runInNewContext(readFileSync(resolve(__dirname, '../../main/resources/static/js/map-incident.js'), 'utf8'), context);
    const state = { marker: { getLatLng: () => ({ ...point, wrap: () => ({ lat: point.lat, lng: point.lng === 181 ? -179 : point.lng }) }), dragging: { disable() {}, enable() {} } },
        form: { reportValidity: () => true }, saving: false, save: {}, cancel: {},
        setStatus: (id, text, error) => messages.push({ id, text, error }),
        clear: () => { cleared = true; }, reload: () => { reloaded = true; } };
    state.form.elements = [state.save, { name: 'title', value: 'Window damaged' }];
    return { submit: () => context.window.MapIncident.submit(state, { preventDefault() {} }), state, messages,
        cleared: () => cleared, reloaded: () => reloaded };
}

test('save posts selected coordinates and details, then refreshes nearby incidents', async () => {
    let payload;
    const f = fixture(async (url, options) => {
        assert.equal(url, '/save-incident');
        assert.equal(options.method, 'POST');
        payload = JSON.parse(options.body);
        return { ok: true };
    });
    await f.submit();
    assert.deepEqual(payload, { title: 'Window damaged', description: '<script>not HTML</script>', lat: '28.64', lng: '-106.07' });
    assert.equal(f.cleared(), true);
    assert.equal(f.reloaded(), true);
    assert.equal(f.state.saving, false);
    assert.ok(f.messages.some(m => m.text.includes('Incident saved.')));
});

test('save uses Leaflet-wrapped coordinates after crossing the date line', async () => {
    let payload;
    const f = fixture(async (url, options) => { payload = JSON.parse(options.body); return { ok: true }; }, { lat: 12, lng: 181 });
    await f.submit();
    assert.equal(payload.lng, '-179');
    assert.equal(payload.lat, '12');
});

test('failed save retains marker and details and enables retry', async () => {
    const f = fixture(async () => ({ ok: false }));
    await f.submit();
    assert.equal(f.cleared(), false);
    assert.equal(f.reloaded(), false);
    assert.equal(f.state.save.disabled, false);
    assert.equal(f.state.cancel.disabled, false);
    assert.ok(f.messages.some(m => m.error && m.text.includes('Your details are still here')));
});

test('a second submit while saving does not send a duplicate request', async () => {
    let resolve, calls = 0;
    const f = fixture(() => { calls++; return new Promise(done => { resolve = done; }); });
    const first = f.submit();
    await f.submit();
    assert.equal(calls, 1);
    assert.equal(f.state.save.disabled, true);
    resolve({ ok: true });
    await first;
});
