<template>
  <div id="app">
    <Flasher />
  </div>
</template>

<script>
import Flasher from './components/Flasher.vue'

export default {
  name: 'App',
  components: {
    Flasher
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
