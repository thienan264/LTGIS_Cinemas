// mapCore.js
import { config, lat, lng, zoom } from './mapConfig.js';

// Khởi tạo map
export const map = L.map("map", config).setView([lat, lng], zoom);

// Thêm TileLayer
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

export let userLocationMarker = null;
export let userLocationCircle = null;
export let nearestCinemaLayer = null;
export let nearestCinemaRouting = null;
export let routingControl = null; // Cho hàm routeToDestination



// Layer group gốc
export const poiLayers = L.layerGroup().addTo(map);

console.log("Map core initialized.");