import maplibregl from 'maplibre-gl'
import { Protocol, PMTiles } from 'pmtiles';
import { dcaFillColorPaint, dcaClassLegend } from "./legends.js";
import { basemapStyles } from './basemaps.js';

const POPUP_MIN_ZOOM = 8;

var POPUP = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: true,
    className: "field-popup",
    maxWidth: "180px"
});

var map = new maplibregl.Map({
    container: 'map',
    style: basemapStyles.positron,
    center: [-105, 43],  // Initial focus coordinate
    zoom: 4,
    attributionControl: false
});

// Make PMTiles protocol available for the map
let protocol = new Protocol({ metadata: true });
maplibregl.addProtocol("pmtiles", protocol.tile);

function resetADSLayers() {
    if (map.getLayer("damage")) {
        map.removeLayer("damage")
    }
    if (map.getSource("damage-source")) {
        map.removeSource("damage-source")
    }
    if (map.getLayer("survey")) {
        map.removeLayer("survey");
    }
    if (map.getSource("survey-source")) {
        map.removeSource("survey-source")
    }
    maplibregl.removeProtocol("pmtiles")
}

// Build the PMTiles layer for the selected year
function addADSLayers(year) {
    var damage_url = `https://data.source.coop/ganzk/ads/damage_pmtiles/damage_${year}.pmtiles`
    var survey_url = `https://data.source.coop/ganzk/ads/survey_pmtiles/survey_${year}.pmtiles`

    // Make a new protocol
    protocol = new Protocol({ mdatadata: true })
    maplibregl.addProtocol("pmtiles", protocol.tile)
    var damage_tiles = new PMTiles(damage_url)
    var survey_tiles = new PMTiles(survey_url)
    protocol.add(damage_tiles)
    protocol.add(survey_tiles)

    // Add the new layer sources
    map.addSource(
        "damage-source",
        {
            type: "vector",
            url: `pmtiles://${damage_url}`
        }
    )
    map.addSource(
        "survey-source",
        {
            type: "vector",
            url: `pmtiles://${survey_url}`
        }
    )

    // Add the new layers
    map.addLayer({
        "id": "survey",
        "source": "survey-source",
        "source-layer": "damage",
        "type": "fill",
        "paint": {
            'fill-color': "#aaaaaa",
            "fill-opacity": 0.5,
        }
    })

    map.addLayer({
        "id": "damage",
        "source": "damage-source",
        "source-layer": "damage",
        "type": "fill",
        "paint": {
            'fill-color': dcaFillColorPaint(),
            "fill-outline-color": "#16190fcc",
            "fill-opacity": 0.8,
        }
    })

    
}

// Event listener for when the year selection changes
function updateMapYear(e) {
    document.getElementById("ads-year-label").innerHTML = e.target.value
    resetADSLayers()
    addADSLayers(e.target.value)
}
document.getElementById("ads-year").addEventListener("input", updateMapYear);

// Event listener for swapping the basemap
const basemapToggleEl = document.getElementById("basemap-toggle");

basemapToggleEl.addEventListener("click", (e) => {
    var curr_mode = basemapToggleEl.innerHTML;
    var new_mode = curr_mode === "Satellite" ? "Streets" : "Satellite"
    basemapToggleEl.innerHTML = new_mode;
    if (new_mode === "Streets") {
        map.setStyle(basemapStyles.positron)
        map.once("style.load", () => {
            resetADSLayers()
            addADSLayers(document.getElementById("ads-year-label").innerHTML)
        })
    } else {
        map.setStyle(basemapStyles.satellite)
        resetADSLayers()
        addADSLayers(document.getElementById("ads-year-label").innerHTML)
    }
    console.log(new_mode)
    
})

// Event listener for toggling the legend
const legendListEl = document.getElementById("legend-list");
const legendToggleEl = document.getElementById("legend-toggle");

function toggleLegendState() {
  var curr_state = legendToggleEl.getAttribute("aria-expanded") === 'true';
  legendToggleEl.setAttribute("aria-expanded", String(!curr_state));
  legendListEl.hidden = !curr_state;
}

legendToggleEl.addEventListener("click", toggleLegendState);


// Feature popups
function getOverlayFeatureAtPoint(point) {
  const features = map.queryRenderedFeatures(point, { layers: ["damage"] });
  return features[0];
}

function formatPopupContent(object) {
    return `<div class="field-popup-content">Forest type: ${object.HOST_CODE}, Damage agent: ${object.DCA_CODE}</div>`;
}

function getOverlayFeatureAtPoint(point) {
  const features = map.queryRenderedFeatures(point, { layers: ["csb-fill"] });
  return features[0];
}

function wireInteractivity() {
    map.on('mousemove', 'damage', (e) => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        const description = e.features[0].properties.DCA_CODE;

        // Populate the popup and set its coordinates
        // based on the feature found.
        console.log("Update popup")
        console.log(e.lngLat)
        POPUP.setLngLat(e.lngLat).setHTML(`<p>${description}</p>`).addTo(map);
    });

    map.on('mouseleave', 'damage', () => {
        map.getCanvas().style.cursor = '';
        POPUP.remove();
    });
}
wireInteractivity();

// Render the legend
function renderLegend(legend) {
  document.getElementById("ads-legend").innerHTML = legend
    .map(
      (entry) => `
        <div class="legend-item">
          <span class="legend-swatch" style="background:${entry.color}"></span>
          <p>${entry.label}</p>
        </div>
      `,
    )
    .join("");
}
renderLegend(dcaClassLegend);

map.on('load', () => {
    map.setStyle(basemapStyles.satellite);
    addADSLayers("2010");
})
