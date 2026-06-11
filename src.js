import maplibregl from 'maplibre-gl' // or mapbox
import { ZarrLayer } from '@carbonplan/zarr-layer'

var map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',  // Style URL; see our documentation for more options
    center: [12, 53],  // Initial focus coordinate
    zoom: 4
});

// MapLibre GL JS does not handle RTL text by default,
// so we recommend adding this dependency to fully support RTL rendering if your style includes RTL text
maplibregl.setRTLTextPlugin('https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.4.0/dist/mapbox-gl-rtl-text.js');

// Add zoom and rotation controls to the map.
map.addControl(new maplibregl.NavigationControl());


const layer = new ZarrLayer({
    id: 'zarr-layer',
    source: `https://carbonplan-share.s3.us-west-2.amazonaws.com/zarr-layer-examples/USGS-CONUS-DEM-10m.zarr`,
    variable: 'DEM',
    clim: [0, 4000],
    colormap: ['#000000', '#ffffff'],
})
map.on('load', () => {
    map.addLayer(layer)
    // optionally add before id to slot data into map layer stack.
    // map.addLayer(layer, 'beforeID')
})
