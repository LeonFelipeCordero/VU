const { test } = require('node:test');
const assert = require('node:assert/strict');
const MapData = require('../../main/resources/static/js/map-data.js');

test('Photon longitude/latitude becomes Leaflet latitude/longitude', () => {
    assert.deepEqual(MapData.coordinates({ geometry: { type: 'Point', coordinates: [-106.073761, 28.640033] } }), [28.640033, -106.073761]);
});

test('invalid or out-of-range service coordinates cannot move the map', () => {
    for (const geometry of [null, { type: 'LineString', coordinates: [1, 2] },
        { type: 'Point', coordinates: ['1', 2] }, { type: 'Point', coordinates: [181, 2] },
        { type: 'Point', coordinates: [1, 91] }, { type: 'Point', coordinates: [NaN, 1] }]) {
        assert.equal(MapData.coordinates({ geometry }), null);
    }
});

test('address results retain street, city, state and country without duplicates', () => {
    assert.equal(MapData.addressLabel({ properties: { name: 'Chihuahua', city: 'Chihuahua', street: 'Calle Libertad',
        housenumber: '12', state: 'Chihuahua', country: 'Mexico' } }), 'Chihuahua, Calle Libertad 12, Mexico');
});

test('search encodes user input and biases results to the map center', () => {
    const url = new URL(MapData.searchUrl('https://photon.example/api/', '  A & B #2  ', { lat: 28.64, lng: -106.07 }));
    assert.equal(url.searchParams.get('q'), 'A & B #2');
    assert.equal(url.searchParams.get('limit'), '5');
    assert.equal(url.searchParams.get('lat'), '28.64');
    assert.equal(url.searchParams.get('lon'), '-106.07');
});

test('date field uses local wall-clock time, not UTC', () => {
    const date = new Date('2026-10-20T12:30:00Z');
    date.getTimezoneOffset = () => 360;
    assert.equal(MapData.localDateTime(date), '2026-10-20T06:30');
});
