<template>
  <article>
    <p v-if="fetchError" class="error">Error occurred while requesting distrs: {{ fetchError }}.</p>
    <table v-if="distrs.length > 0">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Count</th>
          <th>Last Update</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(distr, i) in distrs" :key="distr.name" :class="{leader: distr.leader}">
          <td>{{ i + 1 }}</td>
          <td>{{ distr.name }}</td>
          <td>{{ distr.count }}</td>
          <td>{{ distr.lastUpdateISO() }}</td>
          <td>{{ distr.oldest ? 'oldest' : distr.newest ? 'newest' : '' }}</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>

<script lang="ts">
import Vue from 'vue'
import { Array } from 'runtypes'

import '@/assets/common.css'
import { DistrRecord, MyDistr } from '@/typings/distr'

const DistrRecords = Array(DistrRecord)

export default Vue.extend({
  name: 'TableView',

  data(): {
    fetchError: string;
    distrs: MyDistr[];
    } {
    return {
      fetchError: '',
      distrs: [],
    }
  },

  mounted() {
    fetch('http://localhost:5000/distrs?orderBy=count+desc,last_update')
      .then(response => response.json())
      .then(data => {
        const distrs = DistrRecords.check(data)
        this.distrs = distrs.map(distr => new MyDistr(distr))
        this.setOtherProperties()
      })
      .catch(err => {
        console.error(err)
        this.fetchError = err.message
      })
  },

  methods: {
    /**
     * Set other properties of distrs: leader, newest updated, oldest updated.
     * We go from the end searching point where count difference between adjacent distrs greater
     * than threshold. All distrs above that point are leaders.
     */
    setOtherProperties() {
      if (this.distrs.length === 0) {
        return
      }

      const threshold = this.distrs[0].count / 10
      let leader = false
      const oldest = { index: 0, lastUpdate: this.distrs[0].lastUpdate }
      const newest = { index: 0, lastUpdate: this.distrs[0].lastUpdate }
      let i = this.distrs.length - 1

      for (i; i--;) {
        const distr = this.distrs[i]

        if (distr.lastUpdate < oldest.lastUpdate) {
          oldest.index = i
          oldest.lastUpdate = distr.lastUpdate
        }

        if (distr.lastUpdate > newest.lastUpdate) {
          newest.index = i
          newest.lastUpdate = distr.lastUpdate
        }

        if (i > 0) {
          const prevDistr = this.distrs[i - 1]
          if ((prevDistr.count - distr.count) > threshold) {
            leader = true
          }
          if (leader) {
            prevDistr.setLeader(true)
          }
        }
      }

      this.distrs[oldest.index].oldest = true
      this.distrs[newest.index].newest = true
    },
  },
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

.leader td {
  background-color: #ffffaa;
}
</style>
