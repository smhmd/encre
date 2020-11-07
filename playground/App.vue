<template>
  <div id="inner-app">
    <as-sketch width="200" height="200">
      <!-- <as-line x2="100" y2="100" stroke="red" stroke-width="2" offset="2"></as-line> -->
      <as-rect
        x="10"
        y="10"
        width="40"
        height="150"
        offset="2"
        stroke="red"
        stroke-width="1"
        fill="red"
        fill-angle="-0.667"
      ></as-rect>
       <as-rect
        x="70"
        y="40"
        width="40"
        height="120"
        offset="2"
        stroke="green"
        stroke-width="1"
        fill
        fill-angle="0.25"
        segments="20"
      ></as-rect>
    </as-sketch>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-size: 14px;
}

#app {
  min-width: 100%;
  min-height: 100%;
}
</style>