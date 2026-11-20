// ---------------------------------------------------------------
// Code source: generated with Google Gemini (AI assistant) and
// run in the Google Earth Engine Code Editor.
// teesta-water-change: Multi-Temporal Dry-Season Water Availability, Teesta Basin
// Run the steps in order (Step 1 -> Step 2 -> Step 3) in the same Code Editor script.
// ---------------------------------------------------------------

// =========================================================================
// teesta-water-change (Fast Run): Multi-Temporal Dry-Season Water - Teesta Basin
// =========================================================================

var districts = ee.FeatureCollection("FAO/GAUL/2015/level2");
var teestaDistricts = districts.filter(ee.Filter.inList('ADM2_NAME', ['Nilphamari', 'Lalmonirhat']));

var jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").clip(teestaDistricts);
var riverCorridorMask = jrc.select('max_extent').eq(1).focal_max(1000, 'circle', 'meters').selfMask();

Map.centerObject(teestaDistricts, 9);

function maskS2clouds(image) {
  var qa = image.select('QA60');
  var mask = qa.bitwiseAnd(1 << 10).eq(0).and(qa.bitwiseAnd(1 << 11).eq(0));
  return image.updateMask(mask).divide(10000);
}

function getWaterArea(year) {
  var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(teestaDistricts)
    .filterDate(year + '-03-01', year + '-03-31')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
    .map(maskS2clouds)
    .median()
    .clip(teestaDistricts);

  var ndwi = s2.normalizedDifference(['B3', 'B8']);
  var activeWater = ndwi.gt(0.1).updateMask(riverCorridorMask).selfMask();

  var area = activeWater.multiply(ee.Image.pixelArea()).divide(1e6).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: teestaDistricts.geometry(),
    scale: 30,
    maxPixels: 1e10,
    bestEffort: true
  });

  print('Active River Water Area in March ' + year + ' (sq km):', area);
  return activeWater;
}

var w2016 = getWaterArea('2016');
var w2021 = getWaterArea('2021');
var w2026 = getWaterArea('2026');

Map.addLayer(w2016, {palette: ['cyan']}, 'Active Water - March 2016', false);
Map.addLayer(w2021, {palette: ['dodgerblue']}, 'Active Water - March 2021', false);
Map.addLayer(w2026, {palette: ['darkblue']}, 'Active Water - March 2026', true);
