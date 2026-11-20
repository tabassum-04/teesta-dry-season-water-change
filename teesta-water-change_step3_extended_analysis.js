// ---------------------------------------------------------------
// Code source: generated with Google Gemini (AI assistant) and
// run in the Google Earth Engine Code Editor.
// teesta-water-change: Multi-Temporal Dry-Season Water Availability, Teesta Basin
// Run the steps in order (Step 1 -> Step 2 -> Step 3) in the same Code Editor script.
// ---------------------------------------------------------------

// =========================================================================
// EXTENDED ANALYSIS: Stepwise Change Stats, Mean NDWI & Upstream/Downstream
// =========================================================================

// Helper function to compute area (sq km) of a binary/class mask
function computeClassArea(maskImage, classValue, name) {
  var areaImg = maskImage.eq(classValue).multiply(ee.Image.pixelArea()).divide(1e6);
  var stat = areaImg.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: teestaDistricts.geometry(),
    scale: 30,
    maxPixels: 1e10,
    bestEffort: true
  });
  print(name + ' (sq km):', stat);
}

// 1. Stepwise Change Area Statistics (2016 -> 2021 and 2021 -> 2026)
var change2016_2021 = b2016.and(b2021).multiply(1)
  .add(b2016.and(b2021.not()).multiply(2))
  .add(b2016.not().and(b2021).multiply(3));

computeClassArea(change2016_2021, 1, '2016-2021 Persistent Water');
computeClassArea(change2016_2021, 2, '2016-2021 Water Loss');
computeClassArea(change2016_2021, 3, '2016-2021 Water Gain');

computeClassArea(change2021_2026, 1, '2021-2026 Persistent Water');
computeClassArea(change2021_2026, 2, '2021-2026 Water Loss');
computeClassArea(change2021_2026, 3, '2021-2026 Water Gain');

// 2. Mean NDWI inside River Corridor for March 2016, 2021 & 2026
function getMeanNDWI(year) {
  var s2Corr = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(teestaDistricts)
    .filterDate(year + '-03-01', year + '-03-31')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
    .map(maskS2clouds)
    .median()
    .clip(teestaDistricts)
    .updateMask(riverCorridorMask);

  var meanNdwi = s2Corr.normalizedDifference(['B3', 'B8']).reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: teestaDistricts.geometry(),
    scale: 30,
    maxPixels: 1e10,
    bestEffort: true
  });
  print('Mean Corridor NDWI - March ' + year + ':', meanNdwi);
}

getMeanNDWI('2016');
getMeanNDWI('2021');
getMeanNDWI('2026');

// 3. Upstream vs. Downstream Split around Teesta Barrage (Approx. latitude 26.15 N)
var teestaGeom = teestaDistricts.geometry();
var upstreamPoly = ee.Geometry.Rectangle([88.85, 26.15, 89.60, 26.45]);
var downstreamPoly = ee.Geometry.Rectangle([88.85, 25.70, 89.60, 26.15]);

var upstreamArea = teestaGeom.intersection(upstreamPoly, 30);
var downstreamArea = teestaGeom.intersection(downstreamPoly, 30);

function printReachWater(waterMask, reachGeom, label) {
  var val = waterMask.multiply(ee.Image.pixelArea()).divide(1e6).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: reachGeom,
    scale: 30,
    maxPixels: 1e10,
    bestEffort: true
  });
  print(label + ' (sq km):', val);
}

printReachWater(w2016, upstreamArea, 'Upstream Active Water - Mar 2016');
printReachWater(w2026, upstreamArea, 'Upstream Active Water - Mar 2026');
printReachWater(w2016, downstreamArea, 'Downstream Active Water - Mar 2016');
printReachWater(w2026, downstreamArea, 'Downstream Active Water - Mar 2026');
