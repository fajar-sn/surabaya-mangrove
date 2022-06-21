<template>
  <div class="bg-slate-800 min-h-screen p-2">
    <div class="container mx-auto pt-8 text-center text-slate-100">
      <div class="mb-8">
        <p class="text-4xl py-2">Peta Persebaran Mangrove di Rungkut, Surabaya</p>
        <p>Data diambil menggunakan Drone pada tanggal 18 Januari 2022</p>
      </div>

      <div id="mapContainer"></div>

      <div class="mt-8">
        <p>Tugas Praktikum GIS - Fajar (42), Fadhli (43), Ilyas (45)</p>
      </div>
    </div>


  </div>
</template>

<script>
import L from 'leaflet'
import {realtimeDatabase} from '@/util/db'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'MainPage',
  props: {
    msg: String
  },
  data() {
    return {
      dbData: [],
      markers: []
    }
  },

  async mounted() {
    this.setupLeafletIconDirectory()

    const map = L.map('mapContainer').setView([-7.33171186, 112.81900833], 19)

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxNativeZoom: 18,
      maxZoom: 100,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map)

    const mangroves = await this.fetchMangrovesData()

    const possibleMangroveCountValues = this.getPossibleMangroveCountValues(mangroves)

    for (let i = 1; i < mangroves.length; i++) {
      const currentMangrove = mangroves[i]

      const icon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-'
            + this.getIconColorBasedOnMangroveCount(possibleMangroveCountValues, currentMangrove.mangrove_count) + '.png',
      })

      let currentMarket = L.marker([currentMangrove.latitude, currentMangrove.longitude], {icon: icon})

      currentMarket.addTo(map)
      currentMarket.bindPopup('Terdapat ' + currentMangrove.mangrove_count + ' mangrove pada titik ini.')

    }

    this.getConfiguredLeafletLegend(possibleMangroveCountValues).addTo(map)
  },

  methods: {
    setupLeafletIconDirectory() {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png')
      })
    },

    getConfiguredLeafletLegend(mangroves) {
      const firstQuarterIndex = Math.ceil(0.25 * mangroves.length)
      const thirdQuarterIndex = Math.floor(0.75 * mangroves.length)


      let legend = L.control({position: 'bottomright'});

      legend.onAdd = function () {

        let div = L.DomUtil.create('div', 'info legend'),
            grades = [0, mangroves[firstQuarterIndex], mangroves[thirdQuarterIndex - 1]],
            colorMap = ['#BE0000', '#F7EA00', '#9EDE73']

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + colorMap[i] + '"></i> ' +
              (grades[i] + 1) + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' mangrove' + '<br>' : '+' + ' mangrove')
        }

        return div;
      };

      return legend
    },

    async fetchMangrovesData() {
      const messagesRef = realtimeDatabase.ref('1GjeaNKxPynKomKKXC0KgZ_NW5yC5uN_HgWdV64QvCR8/mangroves')
      let mangroveData = []

      await messagesRef.once('value', (snapshot) => {
        mangroveData = snapshot.val()
      })

      return mangroveData
    },

    getPossibleMangroveCountValues(mangroves) {
      let possibleMangroveCountValues = []

      for (let i = 1; i < mangroves.length; i++)
        possibleMangroveCountValues.push(mangroves[i]['mangrove_count'])

      return [...new Set(possibleMangroveCountValues)].sort((a, b) => {return a - b})
    },

    getMangroveCountPercentile(possibleMangroveCountValues, currentMangroveCount) {
      return (possibleMangroveCountValues.indexOf(currentMangroveCount) - 1) / possibleMangroveCountValues.length
    },

    getLegendColor(index) {
      const colorMap = ['#BE0000', '#F7EA00', '#9EDE73']
      return colorMap[index]
    },

    getIconColorBasedOnMangroveCount(possibleMangroveCountValues, currentMangroveCount) {
      const percentile = this.getMangroveCountPercentile(possibleMangroveCountValues, currentMangroveCount)
      let iconColor = "gold"

      if (percentile < 0.25)
        iconColor = "red"
      else if (percentile > 0.75)
        iconColor = "green"

      return iconColor
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#mapContainer {
  height: 75vh;
  width: 75vw;
  margin: auto;
}

.info {
  padding: 6px 8px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255,255,255,0.8);
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
  border-radius: 5px;
}

.info h4 {
  margin: 0 0 5px;
  color: #777;
}

.legend {
  line-height: 18px;
  color: #555;
}
.legend i {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 8px;
  opacity: 0.7;
}
</style>
