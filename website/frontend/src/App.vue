<template>
  <div class="wrapper" id="app">
    <SideBar/>
    <div class="main-panel">
      <HeaderMenu/>
    </div>
    <div class="main">
      <router-view/>
    </div>
  </div>
</template>

<script>
import HeaderMenu from './components/HeaderMenu'
import SideBar from './components/SideBar'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

export default {
  name: 'App',
  components: {HeaderMenu, SideBar}
}
</script>

<style>
  .main-panel{
    width: 100%;
    background: #d80606;
  }
  a {
    color: white;
    font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
    text-decoration: solid;
    font-weight: bold;
  }
  body{
    margin: 0 !important;
  }
</style>
