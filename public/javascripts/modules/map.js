import axios from 'axios'
import {$} from './bling'

const mapOptions = {
    center: {
        lat: 43.2,
        lng: -79.8
    },
    zoom: 2
}
function loadPlaces(map, lat = 43.2, lng = -79.8) {
    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
      .then(res => {
          const places = res.data;
          console.log(places)
          if (!places.length) {
              alert('no places found!');
              return;
          }
      })
}

function makeMap(mapDiv) {
    if (!mapDiv) return;
    const map = new google.maps.Map(mapDiv, mapOptions)
    loadPlaces(map)
    const input = $('[name="geolocate"]')
    const autocomplete = new google.maps.places.Autocomplete(input)
}
export default makeMap