// ---------------------------------------------------------------
// Code source: generated with Google Gemini (AI assistant) and
// run in the Google Earth Engine Code Editor.
// teesta-water-change: Multi-Temporal Dry-Season Water Availability, Teesta Basin
// Run the steps in order (Step 1 -> Step 2 -> Step 3) in the same Code Editor script.
// ---------------------------------------------------------------

// =========================================================================
// CHANGE DETECTION & EXPORT (March 2016 vs 2021 vs 2026)
// =========================================================================

// Binary masks (0 = non-water within corridor, 1 = active water)
var b2016 = w2016.unmask(0).updateMask(riverCorridorMask).byte();
var b2021 = w2021.unmask(0).updateMask(riverCorridorMask).byte();
var b2026 = w2026.unmask(0).updateMask(riverCorridorMask).byte();

// Change classes (2016 -> 2026):
// 1 = Persistent Water (Water in both 2016 & 2026)
// 2 = Water Loss / Shrunk (Water in 2016, dry/sandbar in 2026)
// 3 = Water Gain / Expanded (Dry in 2016, water in 2026)
var persistent2016_2026 = b2016.and(b2026).multiply(1);
var loss2016_2026       = b2016.and(b2026.not()).multiply(2);
var gain2016_2026       = b2016.not().and(b2026).multiply(3);

var change2016_2026 = persistent2016_2026
  .add(loss2016_2026)
  .add(gain2016_2026)
  .selfMask();

// Optional check: 2021 -> 2026 change
var loss2021_2026 = b2021.and(b2026.not()).multiply(2);
var gain2021_2026 = b2021.not().and(b2026).multiply(3);
var persistent2021_2026 = b2021.and(b2026).multiply(1);
var change2021_2026 = persistent2021_2026
  .add(loss2021_2026)
  .add(gain2021_2026)
  .selfMask();

// Visualize Change Map (1: Blue = Persistent, 2: Red = Water Loss, 3: Green = Water Gain)
Map.addLayer(
  change2016_2026,
  {min: 1, max: 3, palette: ['1f78b4', 'e31a1c', '33a02c']},
  'Teesta Water Change (Mar 2016 - Mar 2026)',
  true
);

Map.addLayer(
  change2021_2026,
  {min: 1, max: 3, palette: ['1f78b4', 'e31a1c', '33a02c']},
  'Teesta Water Change (Mar 2021 - Mar 2026)',
  false
);

// Export Change Map (2016 -> 2026) and March 2026 Active Water to Google Drive
Export.image.toDrive({
  image: change2016_2026.toByte(),
  description: 'teesta-water-change_change_mar2016_mar2026',
  folder: 'teesta-water-change',
  scale: 30,
  region: teestaDistricts.geometry(),
  maxPixels: 1e10
});

Export.image.toDrive({
  image: b2026.selfMask().toByte(),
  description: 'teesta-water-change_active_water_mar2026',
  folder: 'teesta-water-change',
  scale: 30,
  region: teestaDistricts.geometry(),
  maxPixels: 1e10
});
