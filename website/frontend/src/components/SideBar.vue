<template>
  <div v-if="active" class="sidebar" id="sidebar" v-bind:style="styleObject">
    <!--   you can change the color of the sidebar using: data-color="blue | azure | green | orange | red | purple" -->
    <button class="menu-button" id="menu" v-on:click="changeStatus"></button>
    <a class="navbar-brand" href="/">
      <h4>VU</h4>
    </a>
    <div class="navbar-">
      <ul class="navbar-expand">
        <li>
          <a href="/">
            <p>Maps</p>
          </a>
        </li>
        <li>
          <a href="/hot-zones">
            <p>Hot Zones</p>
          </a>
        </li>
        <!--<li>-->
        <!--<a href="/dashboard">-->
        <!--<p>Hot Zones</p>-->
        <!--</a>-->
        <!--</li>-->
        <li>
          <a href="/about">
            <p>About Us</p>
          </a>
        </li>
      </ul>
    </div>
  </div>

</template>

<script>
export default {
  name: 'SideBar',
  data () {
    return {
      active: false,
      windowWidth: window.innerWidth,
      open: false,
      styleObject: {
        width: '5%'
      }
    }
  },
  methods: {
    handleWindowResize: function (event) {
      this.windowWidth = event.currentTarget.innerWidth
      this.active = this.windowWidth <= 767
    },
    changeStatus: function () {
      this.open = !this.open
      if (this.open) {
        this.styleObject['width'] = '20%'
      } else {
        this.styleObject['width'] = '5%'
      }
    }
  },
  beforeMount: function () {
    this.active = this.windowWidth <= 767
  },
  mounted: function () {
    window.addEventListener('resize', this.handleWindowResize)
  }
}
</script>

<style scoped>
  .sidebar {
    height: 100%;
    /*width: 20%;*/
    background: #d80606;
    position: absolute;
  }
</style>
