const esriWorldImageryStyle = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "esri-imagery",
      type: "raster",
      source: "esri",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

const positronStyle = "https://tiles.openfreemap.org/styles/positron";

export const basemapStyles = {
  satellite: esriWorldImageryStyle,
  positron: positronStyle,
};