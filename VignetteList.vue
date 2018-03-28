<h3>Unlabeled events:</h3>
<img v-for="event in unlabeledEvents"
     v-bind:src="imageSrc(event)">

<script>
module.exports = {
  data: function () {
    return {
      title: 'Unlabeled events',
      
    }
  }
}
</script>