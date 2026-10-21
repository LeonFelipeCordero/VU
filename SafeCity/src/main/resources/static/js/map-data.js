/* Shared coordinate and address handling. No HTML from external services is rendered. */
(function (root) {
    'use strict';
    function coordinates(feature) {
        var point = feature && feature.geometry;
        var pair = point && point.coordinates;
        if (!point || point.type !== 'Point' || !Array.isArray(pair) || pair.length < 2) return null;
        var lng = pair[0], lat = pair[1];
        return typeof lat === 'number' && typeof lng === 'number' && isFinite(lat) && isFinite(lng)
            && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lat, lng] : null;
    }
    function addressLabel(feature) {
        var p = feature.properties || {};
        var street = [p.street, p.housenumber].filter(Boolean).join(' ');
        return [p.name, street, p.postcode, p.city || p.town || p.village, p.state, p.country]
            .filter(function (value, index, values) { return value && values.indexOf(value) === index; }).join(', ') || 'Unnamed location';
    }
    function searchUrl(endpoint, query, center) {
        var url = new URL(endpoint);
        url.searchParams.set('q', query.trim());
        url.searchParams.set('limit', '5');
        url.searchParams.set('lat', center.lat);
        url.searchParams.set('lon', center.lng);
        return url.toString();
    }
    function localDateTime(now) {
        return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    var data = { coordinates: coordinates, addressLabel: addressLabel, searchUrl: searchUrl, localDateTime: localDateTime };
    if (typeof module !== 'undefined' && module.exports) module.exports = data;
    else root.MapData = data;
}(typeof window !== 'undefined' ? window : globalThis));
