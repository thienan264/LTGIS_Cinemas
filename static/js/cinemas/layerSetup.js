// layerSetup.js
import { map } from './mapCore.js';
import { setCinemaLookup } from './cinemaSearch.js';

document.getElementById("sidebar-close-btn").addEventListener("click", () => {
    document.getElementById("sidebar").style.display = "none";  // Ẩn sidebar khi click nút đóng
});

function handleMovieSelect(event, featureId) {
    const selectedName = event.target.value;
    const detailDiv = document.getElementById(`movie-detail-${featureId}`);

    // Tìm feature từ map
    let currentFeature = null;
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.feature && layer.feature.id == featureId) {
            currentFeature = layer.feature;
        }
    });

    const lichChieu = currentFeature?.properties?.lich_chieu || [];
    if (selectedName === "" || !currentFeature) {
        detailDiv.innerHTML = ""; // Clear details
    } else {
        const matchingMovies = lichChieu.filter(item => item.ten_phim === selectedName);
        if (matchingMovies.length > 0) {
            const first = matchingMovies[0];
            detailDiv.innerHTML = `
                <b>Phim:</b> ${first.ten_phim}<br>
                <b>Thể loại:</b> ${first.the_loai}<br>
                <b>Các suất chiếu:</b>
                <ul style="margin-top: 5px;">
                    ${matchingMovies.map(m => `<li>${m.gio_chieu}</li>`).join("")}
                </ul>
            `;
        } else {
            detailDiv.innerHTML = "<em>Không có thông tin chi tiết.</em>";
        }
    }
}

const cinemaLookup = {};

var geojsonOpts = {
    pointToLayer: function (feature, latlng) {
        cinemaLookup[feature.properties.name] = { latlng, feature };

        return L.marker(latlng, {
            icon: L.divIcon({
                className: "cinema-icon",
                html: "<span class='emoji'>🎥</span>",
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -25],
            }),
        }).on("click", function (e) {
            const feature = e.target.feature;
            const latlng = e.latlng;
            const lichChieu = feature.properties.lich_chieu || [];

            let dropdownHtml = "<em>Chưa có lịch chiếu</em>";
            if (lichChieu.length > 0) {
                const uniqueMovies = [...new Set(lichChieu.map(item => item.ten_phim))];

                dropdownHtml = `
                    <label for="movie-select-${feature.id}"><b>Danh sách phim:</b></label><br>
                    <select id="movie-select-${feature.id}">
                        <option value="">-- Chọn phim --</option>
                        ${uniqueMovies.map(name => `<option value="${name}">${name}</option>`).join("")}
                    </select>
                    <div id="movie-detail-${feature.id}" style="margin-top: 10px; font-size: 0.9em;"></div>
                `;
            }

            const sidebarContent = `
                🎥 <b>Rạp chiếu phim</b><br>
                <b>${feature.properties.name}</b><br>
                <em>${feature.properties.address}</em><br>
                <p>${feature.properties.description || ''}</p>
                ${dropdownHtml}
                <br><br>
                <button onclick="window.routeToDestination([${latlng.lat}, ${latlng.lng}])">Chỉ đường</button>
            `;

            document.getElementById("sidebar-content").innerHTML = sidebarContent;
            document.getElementById("sidebar").style.display = "block";

            const selectEl = document.getElementById(`movie-select-${feature.id}`);
            if (selectEl) {
                selectEl.addEventListener("change", (event) => handleMovieSelect(event, feature.id));
            }
        });
    },
};



window.geojsonOpts = geojsonOpts;
window.handleMovieSelect = handleMovieSelect;
setCinemaLookup(cinemaLookup);
console.log("Layer setup (geojsonOpts) done.");
