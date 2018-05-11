<template>
    <div id="map"></div>
</template>

<script>
    export default {
        name: 'map',
        data: function () {
            return {
                map : new google.maps.Map(document.getElementById('map'), {zoom: 15, type: 'roadmap',})
            }
        },
        methods: {
            initMap: function () {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        this.map.setCenter(pos);
                        // setListener(this.map);
                        // setCrimesPoints(this.map);
                        // setAddressFinder(this.map);
                    }, function () {
                        handleLocationError(true, infoWindow, this.map.getCenter());
                    });
                } else {
                    // Browser doesn't support Geolocation
                    handleLocationError(false, infoWindow, this.map.getCenter());
                }
            }
        }
    }
</script>

<style scoped>

</style>