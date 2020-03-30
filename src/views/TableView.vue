<template>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Count</th>
        <th>Last Update</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(distr, i) in distrs" :key="distr.name">
        <td>{{ i + 1 }}</td>
        <td>{{ distr.name }}</td>
        <td>{{ distr.count }}</td>
        <td>{{ distr.last_update }}</td>
      </tr>
    <img draggable="false" role="img" class="emoji" alt="🚧" src="https://s.w.org/images/core/emoji/12.0.0-1/svg/1f6a7.svg"><img draggable="false" role="img" class="emoji" alt="🚧" src="https://s.w.org/images/core/emoji/12.0.0-1/svg/1f6a7.svg"></tbody>
  </table>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'

export default Vue.extend({
  name: 'TableView',

  data (): {
    distrs: {}[];
    } {
    return {
      distrs: []
    }
  },

  mounted () {
    axios
      .get('http://localhost:5000/distrs?orderBy=count+desc,last_update')
      .then(response => {
        this.distrs = response.data
      })
      .catch(error => {
        console.error(error)
      })
  }
})
</script>

<style>
table {
  border-collapse: collapse;
}

td, th {
  border: 1px solid grey;
  padding: 2px 5px;
}

td {
  text-align: right;
}

td:nth-child(2) {
  text-align: left;
}
</style>
