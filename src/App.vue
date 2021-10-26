<template>
  <div id="app">
    <template v-if="fetchErrors.length">
      <p class="error">Fetch errors:</p>
      <ul class="error">
        <li v-for="error in fetchErrors" :key="error.url">
          {{ error.url }}: {{ error.message }}
        </li>
      </ul>
    </template>
    <p v-if="coords">
      Coordinates: {{ coords.latitude }} ({{ coords.latitudeDiff > 0 ? "+" : ""
      }}{{ coords.latitudeDiff }}), {{ coords.longitude }} ({{
        coords.longitudeDiff > 0 ? "+" : ""
      }}{{ coords.longitudeDiff }})
    </p>
    <p v-if="averageColor">
      Average color of the newest distr image: {{ averageColor }}
    </p>
    <div class="form">
      <input v-model="includeDropouts" id="includeDropouts" type="checkbox" />
      <label for="includeDropouts">include dropouts</label>
      <input v-model="last365" id="last365" type="checkbox" />
      <label for="last365">last 365</label>
    </div>
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
        <tr
          v-for="(distr, i) in distrs"
          :key="distr.name"
          :class="{ leader: distr.leader }"
        >
          <td>{{ i + 1 }}</td>
          <td>{{ distr.name }}</td>
          <td>{{ distr.count }}</td>
          <td>{{ distr.lastUpdateISO() }}</td>
          <td>{{ distr.oldest ? "oldest" : distr.newest ? "newest" : "" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

import config from "@/config.json";
import "@/assets/common.css";
import { DistrRecords, MyDistr, CoordsRecord, Coords } from "@/types/fromApi";

interface FetchError {
  url: string;
  message: string;
}

@Component
export default class App extends Vue {
  /* --- DATA --- */

  private fetchErrors: FetchError[] = [];
  private distrs: MyDistr[] = [];
  private coords: Coords | null = null;
  private averageColor = "";
  private includeDropouts = false;
  private last365 = false;

  /* --- WATCHERS --- */

  @Watch("includeDropouts")
  private onIncludeDropoutsChange(value: App["includeDropouts"]) {
    if (value) {
      this.last365 = false;
    }
    this.fetchDistrs();
  }

  @Watch("last365")
  private onLast365Change(value: App["last365"]) {
    if (value) {
      this.includeDropouts = false;
    }
    this.fetchDistrs();
  }

  /* --- METHODS --- */

  /** Fetches data about distrs */
  private async fetchDistrs() {
    let url = `${config.apiUrl}/distrs?orderBy=count+desc,last_update`;
    if (this.includeDropouts) {
      url += "&dropout=true";
    }
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const distrs = DistrRecords.check(data);
        this.distrs = distrs.map((distr) => new MyDistr(distr));
        this.setOtherProperties();
      })
      .catch((err) => {
        console.error(err);
        this.fetchErrors.push({
          url: url,
          message: err.message,
        });
      });
  }

  /**
   * Sets other distrs' properties: leader, newest updated, oldest updated.
   * We go from the end searching point where count difference between adjacent distrs greater
   * than threshold. All distrs above that point are leaders.
   */
  private setOtherProperties() {
    if (this.distrs.length === 0) {
      return;
    }

    const threshold = this.distrs[0].count / 10;
    let leader = false;
    const oldest = { index: 0, lastUpdate: this.distrs[0].lastUpdate };
    const newest = { index: 0, lastUpdate: this.distrs[0].lastUpdate };

    for (let i = this.distrs.length; i--; ) {
      const distr = this.distrs[i];

      if (distr.lastUpdate < oldest.lastUpdate) {
        oldest.index = i;
        oldest.lastUpdate = distr.lastUpdate;
      }

      if (distr.lastUpdate > newest.lastUpdate) {
        newest.index = i;
        newest.lastUpdate = distr.lastUpdate;
      }

      if (i > 0) {
        const prevDistr = this.distrs[i - 1];
        if (prevDistr.count - distr.count >= threshold) {
          leader = true;
        }
        if (leader) {
          prevDistr.setLeader(true);
        }
      }
    }

    this.distrs[oldest.index].oldest = true;
    this.distrs[newest.index].newest = true;
  }

  /** Fetches data about coordinates. */
  private async fetchCoords() {
    const url = `${config.apiUrl}/coords?columns=latitude,longitude,latitude_diff,longitude_diff,latitude_trend,longitude_trend&orderBy=date+desc&limit=1`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          throw new Error("Coords is an empty array");
        }
        data = data[0];
        const coords = CoordsRecord.check({
          latitude: data.latitude,
          longitude: data.longitude,
          latitudeDiff: data.latitude_diff * data.latitude_trend,
          longitudeDiff: data.longitude_diff * data.longitude_trend,
        });
        this.coords = coords;
      })
      .catch((err) => {
        console.error(err);
        this.fetchErrors.push({
          url: url,
          message: err.message,
        });
      });
  }

  /** Fetches average color of the last distr's image. */
  private async fetchAverageColor() {
    const url = `${config.apiUrl}/average-color`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (!(typeof data === "string")) {
          throw new Error(`Expected string, got ${data}`);
        }
        this.averageColor = data;
      })
      .catch((err) => {
        console.error(err);
        this.fetchErrors.push({
          url: url,
          message: err.message,
        });
      });
  }

  /* --- HOOKS --- */

  private mounted() {
    this.fetchDistrs();
    this.fetchCoords();
    this.fetchAverageColor();
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.form input {
  margin-left: 8px;
}
.form input:first-child {
  margin-left: 0;
}

table {
  border-collapse: collapse;
  margin-top: 10px;
}

td,
th {
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
