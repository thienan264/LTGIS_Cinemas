// layerSetup.js
import { map } from './mapCore.js';
import { zoom } from './mapConfig.js';

document.getElementById("sidebar-close-btn").addEventListener("click", () => {
    document.getElementById("sidebar").style.display = "none";  // Ẩn sidebar khi click nút đóng
});

function handleMovieSelect(event, featureId) {
    const selectedIndex = event.target.value;
    const detailDiv = document.getElementById(`movie-detail-${featureId}`);

    // Tìm feature từ map (không phụ thuộc vào popup đang mở)
    let currentFeature = null;
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.feature && layer.feature.id == featureId) {
            currentFeature = layer.feature;
        }
    });

    const lichChieu = currentFeature?.properties?.lich_chieu || [];
    if (selectedIndex === "" || !currentFeature) {
        detailDiv.innerHTML = ""; // Clear details
    } else {
        const movie = lichChieu[parseInt(selectedIndex, 10)];
        if (movie) {
            detailDiv.innerHTML = `
                <b>Phim:</b> ${movie.ten_phim}<br>
                <b>Giờ chiếu:</b> ${movie.gio_chieu}<br>
                <b>Thể loại:</b> ${movie.the_loai}<br>
            `;
        } else {
            detailDiv.innerHTML = "<em>Không có thông tin chi tiết.</em>";
        }
    }
}

// Khi click vào marker, hiển thị sidebar
var geojsonOpts = {
    pointToLayer: function (feature, latlng) {
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
                dropdownHtml = `
                    <label for="movie-select-${feature.id}"><b>Danh sách phim:</b></label><br>
                    <select id="movie-select-${feature.id}">
                        <option value="">-- Phim đang chiếu --</option>
                        ${lichChieu.map((item, index) => `<option value="${index}">${item.ten_phim} (${item.gio_chieu})</option>`).join("")}
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

            // Hiển thị sidebar
            document.getElementById("sidebar-content").innerHTML = sidebarContent;
            document.getElementById("sidebar").style.display = "block";

            // ✅ Gán sự kiện onchange sau khi nội dung đã render
            const selectEl = document.getElementById(`movie-select-${feature.id}`);
            if (selectEl) {
                selectEl.addEventListener("change", (event) => handleMovieSelect(event, feature.id));
            }
        });
    },
};

// Gán vào window để các file khác (nearestCinema) có thể truy cập
window.geojsonOpts = geojsonOpts;
window.handleMovieSelect = handleMovieSelect;

console.log("Layer setup (geojsonOpts) done.");
