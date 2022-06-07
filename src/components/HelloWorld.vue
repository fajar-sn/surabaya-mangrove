<template>
  <div class="hello">

    <div id="mapContainer"></div>
  </div>
</template>

<script>
import L from 'leaflet'
import {realtimeDatabase} from '@/db'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'HelloWorld',
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
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png')
    })

    const map = L.map('mapContainer').setView([-7.33171186, 112.81900833], 19)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxNativeZoom: 18,
      maxZoom: 100,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map)
    let wao = []

    let messagesRef = realtimeDatabase.ref('1GjeaNKxPynKomKKXC0KgZ_NW5yC5uN_HgWdV64QvCR8/mangroves')
    await messagesRef.once('value', (snapshot) => {
      wao = snapshot.val()
    })

    console.log(wao)

    for (let i = 1; i < wao.length; i++) {
      console.log('ini data' + wao[i])
      L.marker([wao[i]['latitude'], wao[i]['longitude']]).addTo(map).bindPopup(wao[i]['mangrove_count'] + ' mangrove')
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

#mapContainer {
  height: 100vh;
  width: 100vw;
}
</style>
