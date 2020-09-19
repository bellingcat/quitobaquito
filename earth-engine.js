Map.setCenter(-113.020683, 31.942751);
Map.setZoom(15);

// create a geometry buffer around the spring to analyze
var springs = ee.Geometry.Point(-113.020683, 31.942751);
var buffer = springs.buffer(100);

// Find Sentinel-2 data since 2015
var collection = ee
  .ImageCollection("COPERNICUS/S2")
  .filterBounds(springs)
  .filterDate("2015-01-01", "2020-09-10")
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 30));

// Compute the NDWI image from bands 3 and 8
var ndwi = collection.map(function (image) {
  return image
    .normalizedDifference(["B3", "B8"])
    .copyProperties(image, ["system:time_start"]);
});

// Detect surface water by thresholding at 0
var thresholded = ndwi.map(function (image) {
  return image.gt(0).copyProperties(image, ["system:time_start"]);
});

// Generate a chart of the number of detected surface water pixels over time
print(ui.Chart.image.series(thresholded, buffer, ee.Reducer.sum(), 5));

var drought = ee
  .ImageCollection("GRIDMET/DROUGHT")
  .filterBounds(springs)
  .filterDate("2015-01-01", "2020-09-10");

print(
  ui.Chart.image.series(drought.select("pdsi"), buffer, ee.Reducer.mean(), 5)
);
