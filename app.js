'use strict';

let labelApp = new Vue({
  el: '#label-app',
  data: {
    events: [
      {
        id: 266,
        label: 'SWR',
        comment: '',
      },
      {
        id: 267,
        label: null,
        comment: '',
      },
      {
        id: 268,
        label: null,
        comment: '',
      },
    ],
  },
  computed: {
    unlabeledEvents: function () {
      return this.events.filter((event) => {
        return event.label == null
      })},
    eventsLabeledSWR: function () {
      return this.events.filter((event) => {
        return event.label == 'SWR'
      })},
    eventsLabeledNotSWR: function () {
      return this.events.filter((event) => {
        return event.label == 'NotSWR'
      })},
  },
  methods: {
    imageSrc: (event) => {
      return `D:\\thesis\\data\\Vignettes\\${event.id}.png`
    },
  },
  watch: {
    events: {
      // handler: updateMeshes,
    },
  },
});
