import L from 'leaflet';
import * as turf from '@turf/turf';
import { createIcons, Activity, Crosshair, MapPinOff, Image, Sun, Moon, PanelRightClose, Layers, Compass, Route, Sliders, Map, FileText } from 'lucide';
import geojsonImport from './Myanmar_Tectonic_Map_2011.geojson';

// Initialize Lucide Icons
createIcons({
  icons: {
    Activity, Crosshair, MapPinOff, Image, Sun, Moon, PanelRightClose,
    Layers, Compass, Route, Sliders, Map, FileText
  }
});

// Earthquake Epicenter Data from quake.jpg
const QUAKE_DATA = {
  lat: 21.91,
  lng: 94.52,
  magnitude: '4.9 M (Slight)',
  date: '5.8.2026',
  time: '06:41:57 MST',
  depth: '89 km',
  region: 'About 22 miles W of Pale',
  agency: 'DMH Seismological Division, Nay Pyi Taw'
};

// Base Maps Configuration
const baseLayers = {
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
  }),
  light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }),
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
};

// State Variables for Tectonic Lineament Style (Single Class)
let lineamentStyle = {
  color: '#ff3b30',
  weight: 2.5,
  opacity: 0.85
};

let map;
let lineamentLayer;
let quakeMarker;
let geojsonData = null;

// Initialize Map
function initMap() {
  map = L.map('map', {
    center: [QUAKE_DATA.lat, QUAKE_DATA.lng],
    zoom: 8,
    zoomControl: false,
    layers: [baseLayers.dark]
  });

  // Custom Zoom Control position
  L.control.zoom({ position: 'bottomleft' }).addTo(map);

  // Add Epicenter Pulse Marker
  createQuakeMarker();

  // Load GeoJSON Data
  loadTectonicGeoJSON();
}

// Create Custom Epicenter Pulse Marker
function createQuakeMarker() {
  const customIcon = L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div class="epicenter-pulse-container">
        <div class="pulse-ring-outer"></div>
        <div class="pulse-ring"></div>
        <div class="pulse-center">M</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  quakeMarker = L.marker([QUAKE_DATA.lat, QUAKE_DATA.lng], { icon: customIcon }).addTo(map);

  const popupContent = `
    <div style="padding: 4px 6px;">
      <div class="popup-title">💥 Earthquake Epicenter</div>
      <table class="popup-table">
        <tr><td class="label">Magnitude</td><td class="val" style="color:#ff3b30;">${QUAKE_DATA.magnitude}</td></tr>
        <tr><td class="label">Date</td><td class="val">${QUAKE_DATA.date}</td></tr>
        <tr><td class="label">Time (MST)</td><td class="val">${QUAKE_DATA.time}</td></tr>
        <tr><td class="label">Focal Depth</td><td class="val">${QUAKE_DATA.depth}</td></tr>
        <tr><td class="label">Coordinates</td><td class="val">${QUAKE_DATA.lat}°N, ${QUAKE_DATA.lng}°E</td></tr>
        <tr><td class="label">Region</td><td class="val">${QUAKE_DATA.region}</td></tr>
      </table>
      <button id="popup-btn-bulletin" style="
        width: 100%; margin-top: 10px; padding: 6px 10px;
        background: #ff3b30; color: #fff; border: none; border-radius: 6px;
        font-weight: 600; cursor: pointer; font-size: 0.8rem;
      ">View Official DMH Bulletin Image</button>
    </div>
  `;

  quakeMarker.bindPopup(popupContent, { maxWidth: 300 });

  map.on('popupopen', (e) => {
    const btn = document.getElementById('popup-btn-bulletin');
    if (btn) {
      btn.addEventListener('click', () => openBulletinModal());
    }
  });
}

// Load and Render Tectonic Lineaments (Single Class)
async function loadTectonicGeoJSON() {
  try {
    geojsonData = geojsonImport;

    // Render as SINGLE CLASS (No sub-classification per prompt instructions)
    lineamentLayer = L.geoJSON(geojsonData, {
      style: () => ({
        color: lineamentStyle.color,
        weight: lineamentStyle.weight,
        opacity: lineamentStyle.opacity,
        lineCap: 'round',
        lineJoin: 'round'
      }),
      onEachFeature: (feature, layer) => {
        // Calculate individual lineament length using Turf
        let lengthKm = 0;
        try {
          lengthKm = turf.length(feature, { units: 'kilometers' }).toFixed(2);
        } catch (e) {
          lengthKm = 'N/A';
        }

        const nameStr = feature.properties?.NAME || 'Tectonic Lineament (Single Class)';
        const codeStr = feature.properties?.CODE ? ` (${feature.properties.CODE})` : '';

        layer.bindPopup(`
          <div style="padding: 2px 4px;">
            <div class="popup-title" style="color: ${lineamentStyle.color};">📍 Tectonic Lineament</div>
            <table class="popup-table">
              <tr><td class="label">Feature Class</td><td class="val">Tectonic Lineament</td></tr>
              <tr><td class="label">Fault Name</td><td class="val">${nameStr}${codeStr}</td></tr>
              <tr><td class="label">Segment Length</td><td class="val">${lengthKm} km</td></tr>
            </table>
          </div>
        `);

        // Hover Effect
        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: lineamentStyle.weight + 2,
              opacity: 1
            });
          },
          mouseout: (e) => {
            lineamentLayer.resetStyle(e.target);
          }
        });
      }
    }).addTo(map);

    // Perform Spatial Proximity Analysis
    runSpatialAnalysis(geojsonData);

  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    document.getElementById('nearest-distance').innerText = 'Error loading data';
  }
}

// Spatial Analysis via Turf.js
function runSpatialAnalysis(geojson) {
  const quakePoint = turf.point([QUAKE_DATA.lng, QUAKE_DATA.lat]);
  let minDistanceKm = Infinity;
  let totalLengthKm = 0;
  let featureCount = 0;

  turf.flattenEach(geojson, (feature) => {
    featureCount++;
    // Calculate length
    const len = turf.length(feature, { units: 'kilometers' });
    totalLengthKm += len;

    // Calculate distance from point to line feature
    try {
      const dist = turf.pointToLineDistance(quakePoint, feature, { units: 'kilometers' });
      if (dist < minDistanceKm) {
        minDistanceKm = dist;
      }
    } catch (e) {
      // Ignore geometry conversion errors
    }
  });

  // Update UI Elements
  const distKmStr = minDistanceKm !== Infinity ? minDistanceKm.toFixed(2) : '--';
  const distMilesStr = minDistanceKm !== Infinity ? (minDistanceKm * 0.621371).toFixed(2) : '--';
  
  document.getElementById('nearest-distance').innerHTML = `
    ${distKmStr} km <span style="font-size:0.8rem; font-weight: normal; color: var(--text-muted);">(${distMilesStr} miles)</span>
  `;
  document.getElementById('total-features-count').innerText = `${featureCount} lineaments`;
  document.getElementById('total-fault-length').innerText = `${totalLengthKm.toFixed(0)} km`;
}

// Update Single Class Vector Styling
function updateLineamentStyle() {
  if (!lineamentLayer) return;
  lineamentLayer.setStyle({
    color: lineamentStyle.color,
    weight: lineamentStyle.weight,
    opacity: lineamentStyle.opacity
  });
}

// Setup Interactive UI Listeners
function setupEventListeners() {
  // Focus Epicenter Button
  document.getElementById('btn-focus-quake').addEventListener('click', () => {
    map.flyTo([QUAKE_DATA.lat, QUAKE_DATA.lng], 10, { duration: 1.5 });
    quakeMarker.openPopup();
  });

  // Fit Myanmar Bounds Button
  document.getElementById('btn-fit-bounds').addEventListener('click', () => {
    if (lineamentLayer) {
      map.fitBounds(lineamentLayer.getBounds(), { padding: [30, 30] });
    }
  });

  // Open Bulletin Modal
  document.getElementById('btn-open-bulletin').addEventListener('click', openBulletinModal);
  document.getElementById('btn-close-modal').addEventListener('click', closeBulletinModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeBulletinModal);

  // Theme Toggle (Dark/Light)
  const themeBtn = document.getElementById('btn-theme-toggle');
  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
  });

  // Sidebar Toggle & Close
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('btn-sidebar-toggle');
  const sidebarClose = document.getElementById('btn-close-sidebar');

  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('closed'));
  sidebarClose.addEventListener('click', () => sidebar.classList.add('closed'));

  // Visibility Checkbox
  document.getElementById('chk-lineaments').addEventListener('change', (e) => {
    if (!lineamentLayer) return;
    if (e.target.checked) {
      map.addLayer(lineamentLayer);
    } else {
      map.removeLayer(lineamentLayer);
    }
  });

  // Color Presets
  const presetBtns = document.querySelectorAll('.preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      lineamentStyle.color = btn.getAttribute('data-color');
      updateLineamentStyle();
    });
  });

  // Range Sliders
  const weightSlider = document.getElementById('range-weight');
  const weightVal = document.getElementById('val-weight');
  weightSlider.addEventListener('input', (e) => {
    lineamentStyle.weight = parseFloat(e.target.value);
    weightVal.innerText = `${lineamentStyle.weight} px`;
    updateLineamentStyle();
  });

  const opacitySlider = document.getElementById('range-opacity');
  const opacityVal = document.getElementById('val-opacity');
  opacitySlider.addEventListener('input', (e) => {
    lineamentStyle.opacity = parseFloat(e.target.value);
    opacityVal.innerText = `${Math.round(lineamentStyle.opacity * 100)}%`;
    updateLineamentStyle();
  });

  // Basemap Selector Buttons
  const basemapBtns = document.querySelectorAll('.basemap-option');
  basemapBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      basemapBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const selected = btn.getAttribute('data-basemap');
      Object.values(baseLayers).forEach(layer => map.removeLayer(layer));
      if (baseLayers[selected]) {
        baseLayers[selected].addTo(map);
      }
    });
  });
}

function openBulletinModal() {
  document.getElementById('bulletin-modal').classList.add('active');
}

function closeBulletinModal() {
  document.getElementById('bulletin-modal').classList.remove('active');
}

// Initialize on DOM Content Loaded
function startApp() {
  initMap();
  setupEventListeners();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
