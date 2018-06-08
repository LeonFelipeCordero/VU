<template>
  <div class="google-map" :id="mapName"></div>
</template>

<script>

export default {
  name: 'GoogleMap',
  props: ['name'],
  data: function () {
    return {
      mapName: this.name + '-map',
      map: '',
      position: {lat: 28.6353, lng: -106.089},
      popupMaker: '',
      informationMakerpo: ''
    }
  },
  mounted: function () {
    // eslint-disable-next-line
    this.map = new google.maps.Map(document.getElementById('crimes-map'), {
      zoom: 14,
      // eslint-disable-next-line
      center: new google.maps.LatLng(this.position.lat, this.position.lng),
      type: 'roadmap'
    })
    if (navigator.geolocation) {
      this.getPosition().then(resolve => {
        const coords = resolve.coords
        this.position.lat = coords.latitude
        this.position.lng = coords.longitude
        this.map.setCenter(this.position)
      })
    }
    this.setListener()
  },
  methods: {
    getPosition () {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
    },
    setListener () {
      const vueContext = this
      // eslint-disable-next-line
      google.maps.event.addListener(this.map, 'click', function (event) {
        vueContext.setPopupMarker(event)
      })
    },
    setPopupMarker (event) {
      this.map.setCenter(event.latLng)
      // eslint-disable-next-line
      const marker = new google.maps.Marker({
        // eslint-disable-next-line
        animation: google.maps.Animation.DROP,
        position: event.latLng,
        map: this.map,
        icon: '/static/burglar.png'
      })
      this.deleteCurrentMaker()
      this.popupMaker = marker
    },
    deleteCurrentMaker () {
      if (this.popupMaker !== '') {
        this.popupMaker.setMap(null)
      }
    }
  }
}
</script>

<style scoped>
  .google-map {
    width: 100%;
    height: 100%;
    position: absolute;
    background: gray;
  }
</style>
