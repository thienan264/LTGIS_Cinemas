import { map } from './mapCore.js';
import { zoom } from './mapConfig.js';

let cinemaLookup = {};

export function setCinemaLookup(data) {
    cinemaLookup = data;
}

function getMarkerByFeatureId(featureId) {
    let found = null;
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.feature && layer.feature.id === featureId) {
            found = layer;
        }
    });
    return found;
}

// 🧠 Retry logic để đợi marker được render xong rồi mới fire click
function waitAndFireMarker(featureId, retries = 10, delay = 150) {
    const tryFindingMarker = (attempt = 0) => {
        const marker = getMarkerByFeatureId(featureId);
        if (marker) {
            marker.fire("click");
        } else if (attempt < retries) {
            setTimeout(() => tryFindingMarker(attempt + 1), delay);
        } else {
            console.warn(`Không tìm thấy marker sau ${retries} lần thử`, featureId);
        }
    };
    tryFindingMarker();
}

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("cinema-search");
    const resultBox = document.getElementById("search-results");

    if (!input) return;

    // 🌟 CSS nội dòng
    const style = document.createElement("style");
    style.textContent = `
        #search-results {
            border: 1px solid #ccc;
            max-height: 200px;
            overflow-y: auto;
            position: absolute;
            background-color: white;
            z-index: 1000;
            width: 100%;
        }

        #search-results div {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            transition: background-color 0.2s;
        }

        #search-results div:hover {
            background-color: #f0f0f0;
        }
    `;
    document.head.appendChild(style);

    input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        resultBox.innerHTML = "";

        if (query === "") return;

        const matches = Object.keys(cinemaLookup).filter(name =>
            name.toLowerCase().includes(query)
        );

        matches.forEach(name => {
            const div = document.createElement("div");
            div.textContent = name;

            div.addEventListener("click", () => {
                const { latlng, feature } = cinemaLookup[name];

                // 🔍 Zoom tới vị trí
                map.setView(latlng, zoom);

                // ✅ Cập nhật input và ẩn dropdown
                input.value = name;
                resultBox.innerHTML = "";

                // 🔄 Gọi marker click sau khi marker được render lại (nếu cần)
                waitAndFireMarker(feature.id);
            });

            resultBox.appendChild(div);
        });
    });

    // 👇 Click ngoài thì ẩn dropdown
    document.addEventListener("click", (e) => {
        if (!resultBox.contains(e.target) && e.target !== input) {
            resultBox.innerHTML = "";
        }
    });
});
