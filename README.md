# Multi-Temporal Dry-Season Surface Water Availability and Channel Change in the Teesta River Basin Using Sentinel-2 NDWI (March 2016, 2021 and 2026)

**Author:** Tabassum Mahbub (independent project)
**Study Area:** Lower Teesta River corridor, Nilphamari and Lalmonirhat districts, Rangpur Division, Bangladesh
**Monitoring Epochs:** Peak pre-monsoon dry season: March 2016, March 2021 and March 2026
**Platform:** Google Earth Engine (JavaScript API)

---

## Overview

Transboundary rivers in northern Bangladesh face severe dry-season stress from upstream flow regulation, seasonal rainfall deficits, and agricultural withdrawal. This project quantifies how the peak dry-season surface water of the lower Teesta River changed between March 2016, March 2021 and March 2026, using Sentinel-2 imagery, NDWI classification, and a JRC-based river corridor mask.

The workflow has five parts:

1. Active river surface area for each March epoch
2. Cross-check of the March 2021 anomaly
3. Stepwise pixel transitions (2016→2021 and 2021→2026)
4. Corridor-wide mean NDWI
5. Upstream–downstream comparison around the Teesta Barrage zone (about 26.15°N)

## Key Results

| Period | Active water area | Change vs 2016 | Mean corridor NDWI |
| --- | --- | --- | --- |
| March 2016 | 8.30 km² | Baseline | −0.4814 |
| March 2021 | 12.85 km² | +4.55 km² (+54.81 %) | −0.4556 |
| March 2026 | **4.03 km²** | **−4.28 km² (−51.50 %)** | Not reported |

| Reach (March 2016 → March 2026) | 2016 | 2026 | Relative change |
| --- | --- | --- | --- |
| Downstream (< 26.15°N) | 5.90 km² | 0.87 km² | **−85.31 %** |
| Upstream (> 26.15°N) | 2.16 km² | 3.17 km² | **+46.81 %** |

- **Channel mobility:** persistent water stayed at only 1.07–1.09 km² in both five-year intervals, so most of the water footprint shifts position between epochs.
- **March 2021:** the high value was re-checked by running the script again (identical results) and is consistent with real inter-annual variability rather than a coding error.

## Repository Contents

| File | Description |
| --- | --- |
| `teesta-water-change_report.docx` | Full technical report (background, methodology, results, limitations, governance implications) |
| `teesta-water-change_change_mar2016_mar2026.tif` | GeoTIFF of decadal channel change: 1 = persistent water, 2 = water loss, 3 = water gain |
| `teesta-water-change_active_water_mar2026.tif` | GeoTIFF of the March 2026 active river water footprint (1 = water) |
| `teesta-water-change_step1_water_area_2016_2021_2026.js` | GEE Step 1: study area, river corridor mask, Sentinel-2 March composites, NDWI water and area for each year |
| `teesta-water-change_step2_change_detection_and_export.js` | GEE Step 2: change classes (2016→2026 and 2021→2026), map layers, GeoTIFF exports |
| `teesta-water-change_step3_extended_analysis.js` | GEE Step 3: stepwise change statistics, mean NDWI, upstream vs. downstream water |

### Raster specifications

Both GeoTIFFs share the same grid:

| Property | Value |
| --- | --- |
| Size | 3119 × 2700 pixels |
| Resolution | 30 m (≈ 0.00027°) |
| Data type | 8-bit unsigned integer |
| CRS | WGS 84 (EPSG:4326) |
| Approx. extent | 88.74°E – 89.58°E, 25.73°N – 26.46°N |

Pixel values: **change map** 0 = no water in either year, 1 = persistent water, 2 = water loss, 3 = water gain. **Active water map** 1 = active water, 0 = other.

## Data Sources

| Dataset | GEE Collection / Asset ID | Role |
| --- | --- | --- |
| Sentinel-2 Surface Reflectance (Harmonized) | `COPERNICUS/S2_SR_HARMONIZED` | March median composites (scene cloud cover < 30 %, QA60 cloud and cirrus masked) |
| JRC Global Surface Water | `JRC/GSW1_4/GlobalSurfaceWater` | River corridor mask (`max_extent == 1` plus 1,000 m buffer) |
| FAO GAUL Level 2 | `FAO/GAUL/2015/level2` | Nilphamari and Lalmonirhat boundaries |

## Methodology

1. **Corridor mask:** JRC `max_extent == 1`, dilated by a 1,000 m circular buffer, so ponds, borrow pits, and flooded fields do not inflate river water estimates.
2. **Water delineation:** cloud-masked March median composite for each year; NDWI = (B3 − B8) / (B3 + B8); active water where NDWI > 0.1 inside the corridor.
3. **Change detection:** binary masks combined into three classes: persistent water, water loss, water gain.
4. **Reach analysis:** corridor split near 26.15°N (Teesta Barrage latitude) into upstream and downstream reaches.

## How to Reproduce

1. Open the [Google Earth Engine Code Editor](https://code.earthengine.google.com/).
2. Paste the three scripts **in order** (Step 1, then Step 2, then Step 3) into the same script. Later steps use variables from earlier ones (for example `w2016`, `teestaDistricts`, `riverCorridorMask`).
3. Run it and check the values printed in the Console.
4. Start the two export tasks (`teesta-water-change_change_mar2016_mar2026` and `teesta-water-change_active_water_mar2026`) from the **Tasks** tab. The GeoTIFFs are saved to the `teesta-water-change` folder in Google Drive.

## Limitations

- **30 m scale:** narrow dry-season channels can mix with bright sand and fall below the NDWI threshold.
- **Moist sand and turbid water:** NDWI is close to the threshold; one fixed threshold is used for all years so changes stay comparable.
- **Area, not discharge:** the maps show wetted surface area only, not volume or flow.
- **Image availability:** only one Sentinel-2 satellite was operating in March 2016, so fewer scenes contribute to that composite.
- **Single-month snapshots** and **no validation** against gauge data or higher-resolution imagery.

For full details, see **`teesta-water-change_report.docx`**.

## Code Attribution

The Google Earth Engine code used in this project was **generated with Google Gemini** (AI assistant) and run in the GEE Code Editor.

Contains modified Copernicus Sentinel data (2016, 2021, 2026).
